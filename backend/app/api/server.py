import json
import os
import secrets
import threading
import time
from collections import defaultdict, deque
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

from ..core.resume_analysis import (
    analyze_bullet_quality,
    as_json,
    build_api_payload,
    build_gap_explainer,
    build_pdf_report_bytes,
    generate_interview_prep,
)

MAX_REQUEST_BYTES = 2 * 1024 * 1024


class RequestRateLimiter:
    def __init__(self, limit: int, window_seconds: int):
        self.limit = limit
        self.window_seconds = window_seconds
        self._requests = defaultdict(deque)
        self._lock = threading.Lock()

    def allow(self, client_id: str, now: float | None = None) -> bool:
        current_time = time.monotonic() if now is None else now
        cutoff = current_time - self.window_seconds
        with self._lock:
            requests = self._requests[client_id]
            while requests and requests[0] <= cutoff:
                requests.popleft()
            if len(requests) >= self.limit:
                return False
            requests.append(current_time)
            return True


RATE_LIMITER = RequestRateLimiter(
    limit=int(os.getenv("API_RATE_LIMIT_PER_MINUTE", "60")),
    window_seconds=60,
)


def success_response(handler: BaseHTTPRequestHandler, data, status=HTTPStatus.OK, content_type="application/json"):
    payload = data if content_type != "application/json" else {"data": data}
    body = data if isinstance(data, bytes) else as_json(payload)
    handler.send_response(status)
    handler.send_header("Content-Type", content_type)
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def error_response(handler: BaseHTTPRequestHandler, status: HTTPStatus, code: str, message: str, details=None):
    body = as_json(
        {
            "error": {
                "code": code,
                "message": message,
                "details": details or [],
            }
        }
    )
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def parse_json_body(handler: BaseHTTPRequestHandler):
    content_length = int(handler.headers.get("Content-Length", "0"))
    if content_length > MAX_REQUEST_BYTES:
        return None, {
            "status": HTTPStatus.REQUEST_ENTITY_TOO_LARGE,
            "code": "payload_too_large",
            "message": f"Request body must not exceed {MAX_REQUEST_BYTES} bytes.",
        }
    raw_body = handler.rfile.read(content_length) if content_length else b"{}"
    try:
        body = json.loads(raw_body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return None, {
            "status": HTTPStatus.BAD_REQUEST,
            "code": "invalid_json",
            "message": "Request body must be valid JSON.",
        }
    if not isinstance(body, dict):
        return None, {
            "status": HTTPStatus.BAD_REQUEST,
            "code": "invalid_request",
            "message": "Request body must be a JSON object.",
        }
    return body, None


def require_fields(body, fields):
    missing = [field for field in fields if not body.get(field)]
    if missing:
        return {
            "status": HTTPStatus.UNPROCESSABLE_ENTITY,
            "code": "validation_error",
            "message": "Request validation failed.",
            "details": [{"field": field, "message": "This field is required.", "code": "required"} for field in missing],
        }
    return None


class ResumeAnalysisAPIHandler(BaseHTTPRequestHandler):
    server_version = "ResumeAnalysisAPI/1.0"

    def log_message(self, format, *args):
        return

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/v1/health":
            return success_response(
                self,
                {
                    "status": "ok",
                    "service": "resume-analysis-api",
                    "version": "v1",
                },
            )
        return error_response(self, HTTPStatus.NOT_FOUND, "not_found", "Endpoint not found.")

    def do_POST(self):
        parsed = urlparse(self.path)
        if not RATE_LIMITER.allow(self.client_address[0]):
            return error_response(
                self,
                HTTPStatus.TOO_MANY_REQUESTS,
                "rate_limited",
                "Too many requests. Try again shortly.",
            )
        configured_key = os.getenv("RESUME_API_KEY", "")
        supplied_token = self.headers.get("Authorization", "").removeprefix("Bearer ").strip()
        if configured_key and not secrets.compare_digest(supplied_token, configured_key):
            return error_response(
                self,
                HTTPStatus.UNAUTHORIZED,
                "unauthorized",
                "A valid bearer token is required.",
            )
        body, parse_error = parse_json_body(self)
        if parse_error:
            return error_response(self, parse_error["status"], parse_error["code"], parse_error["message"])
        page_count = body.get("page_count")
        if page_count is not None and (
            isinstance(page_count, bool)
            or not isinstance(page_count, int)
            or not 1 <= page_count <= 100
        ):
            return error_response(
                self,
                HTTPStatus.UNPROCESSABLE_ENTITY,
                "validation_error",
                "page_count must be an integer between 1 and 100.",
                [{"field": "page_count", "code": "invalid"}],
            )

        if parsed.path == "/api/v1/analyses":
            validation_error = require_fields(body, ["resume_text"])
            if validation_error:
                return error_response(
                    self,
                    validation_error["status"],
                    validation_error["code"],
                    validation_error["message"],
                    validation_error["details"],
                )
            analysis = build_api_payload(
                resume_text=body.get("resume_text", ""),
                resume_skills=body.get("resume_skills", []),
                job_description=body.get("job_description", ""),
                candidate_name=body.get("candidate_name", "Candidate"),
                page_count=body.get("page_count"),
            )
            return success_response(self, analysis)

        if parsed.path == "/api/v1/analyses/bullet-quality":
            validation_error = require_fields(body, ["resume_text"])
            if validation_error:
                return error_response(
                    self,
                    validation_error["status"],
                    validation_error["code"],
                    validation_error["message"],
                    validation_error["details"],
                )
            return success_response(self, analyze_bullet_quality(body["resume_text"]))

        if parsed.path == "/api/v1/analyses/jd-gap":
            validation_error = require_fields(body, ["resume_text", "job_description"])
            if validation_error:
                return error_response(
                    self,
                    validation_error["status"],
                    validation_error["code"],
                    validation_error["message"],
                    validation_error["details"],
                )
            return success_response(
                self,
                build_gap_explainer(body["job_description"], body["resume_text"], body.get("resume_skills", [])),
            )

        if parsed.path == "/api/v1/analyses/interview-prep":
            validation_error = require_fields(body, ["job_description"])
            if validation_error:
                return error_response(
                    self,
                    validation_error["status"],
                    validation_error["code"],
                    validation_error["message"],
                    validation_error["details"],
                )
            role_title = body.get("role_title", "target role")
            return success_response(
                self,
                generate_interview_prep(body["job_description"], body.get("resume_skills", []), role_title),
            )

        if parsed.path == "/api/v1/reports/pdf":
            validation_error = require_fields(body, ["resume_text"])
            if validation_error:
                return error_response(
                    self,
                    validation_error["status"],
                    validation_error["code"],
                    validation_error["message"],
                    validation_error["details"],
                )
            analysis = build_api_payload(
                resume_text=body.get("resume_text", ""),
                resume_skills=body.get("resume_skills", []),
                job_description=body.get("job_description", ""),
                candidate_name=body.get("candidate_name", "Candidate"),
                page_count=body.get("page_count"),
            )
            report_bytes = build_pdf_report_bytes("Resume Analysis Report", analysis)
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "application/pdf")
            self.send_header("Content-Disposition", 'attachment; filename="resume-analysis-report.pdf"')
            self.send_header("Content-Length", str(len(report_bytes)))
            self.end_headers()
            self.wfile.write(report_bytes)
            return

        return error_response(self, HTTPStatus.NOT_FOUND, "not_found", "Endpoint not found.")


def create_server(host="127.0.0.1", port=8001):
    return ThreadingHTTPServer((host, port), ResumeAnalysisAPIHandler)


def resolve_server_config() -> tuple[str, int]:
    host = os.getenv("API_HOST", "127.0.0.1")
    try:
        port = int(os.getenv("PORT", "8001"))
    except ValueError as error:
        raise ValueError("PORT must be an integer.") from error
    return host, port


def run(host=None, port=None):
    configured_host, configured_port = resolve_server_config()
    host = host or configured_host
    port = port if port is not None else configured_port
    server = create_server(host=host, port=port)
    print(f"Resume Analysis API listening on http://{host}:{port}")
    server.serve_forever()


if __name__ == "__main__":
    run()
