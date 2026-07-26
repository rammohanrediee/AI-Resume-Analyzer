import json
import threading
import time
import unittest
import urllib.error
import urllib.request
from unittest.mock import patch

from backend.app.main import create_server
from backend.app.api.server import MAX_REQUEST_BYTES, RequestRateLimiter, resolve_server_config


SAMPLE_RESUME = """
- Worked on a customer analytics dashboard using Python and SQL.
- Responsible for data cleaning and reporting.
- Built churn models that improved retention by 12%.
"""

SAMPLE_JD = """
Looking for a backend engineer with Python, FastAPI, SQL, Docker, cloud deployment,
stakeholder communication, and experience scaling APIs for fintech products.
"""


class ResumeAnalysisAPITestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = create_server(port=0)
        cls.port = cls.server.server_address[1]
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        time.sleep(0.1)

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(timeout=2)

    def post_json(self, path, payload, headers=None):
        request_headers = {"Content-Type": "application/json"}
        request_headers.update(headers or {})
        request = urllib.request.Request(
            f"http://127.0.0.1:{self.port}{path}",
            data=json.dumps(payload).encode("utf-8"),
            headers=request_headers,
            method="POST",
        )
        return urllib.request.urlopen(request)

    def read_http_error(self, request):
        with self.assertRaises(urllib.error.HTTPError) as context:
            urllib.request.urlopen(request)
        response = context.exception
        payload = json.loads(response.read().decode("utf-8"))
        response.close()
        return response.code, payload

    def test_health_endpoint(self):
        response = urllib.request.urlopen(f"http://127.0.0.1:{self.port}/api/v1/health")
        payload = json.loads(response.read().decode("utf-8"))
        self.assertEqual(response.status, 200)
        self.assertEqual(payload["data"]["status"], "ok")

    def test_unknown_endpoint_returns_json_404(self):
        request = urllib.request.Request(f"http://127.0.0.1:{self.port}/missing")
        status, payload = self.read_http_error(request)
        self.assertEqual(status, 404)
        self.assertEqual(payload["error"]["code"], "not_found")

    def test_invalid_json_returns_400(self):
        request = urllib.request.Request(
            f"http://127.0.0.1:{self.port}/api/v1/analyses",
            data=b"{not-json",
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        status, payload = self.read_http_error(request)
        self.assertEqual(status, 400)
        self.assertEqual(payload["error"]["code"], "invalid_json")

    def test_json_body_must_be_an_object(self):
        request = urllib.request.Request(
            f"http://127.0.0.1:{self.port}/api/v1/analyses",
            data=b"[]",
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        status, payload = self.read_http_error(request)
        self.assertEqual(status, 400)
        self.assertEqual(payload["error"]["code"], "invalid_request")

    def test_page_count_must_be_a_positive_reasonable_integer(self):
        request = urllib.request.Request(
            f"http://127.0.0.1:{self.port}/api/v1/analyses",
            data=json.dumps({"resume_text": SAMPLE_RESUME, "page_count": 0}).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        status, payload = self.read_http_error(request)
        self.assertEqual(status, 422)
        self.assertEqual(payload["error"]["code"], "validation_error")

    def test_analysis_endpoint(self):
        response = self.post_json(
            "/api/v1/analyses",
            {
                "candidate_name": "Asha",
                "resume_text": SAMPLE_RESUME,
                "resume_skills": ["Python", "SQL"],
                "job_description": SAMPLE_JD,
            },
        )
        payload = json.loads(response.read().decode("utf-8"))
        self.assertEqual(response.status, 200)
        self.assertEqual(payload["data"]["candidate"]["name"], "Asha")
        self.assertIn("ats_section_scores", payload["data"])
        self.assertIn("bullet_quality", payload["data"])
        self.assertIn("requirement_evidence", payload["data"])
        self.assertGreater(payload["data"]["requirement_evidence"]["total_count"], 0)

    def test_analysis_endpoint_returns_parsed_resume_metadata(self):
        response = self.post_json(
            "/api/v1/analyses",
            {
                "candidate_name": "",
                "resume_text": (
                    "Ramu Reddy\nramu@example.com\n+91 98765 43210\n"
                    "EDUCATION\nB.Tech\nSKILLS\nPython, FastAPI, SQL"
                ),
                "page_count": 2,
                "job_description": "Python API engineer",
            },
        )
        candidate = json.loads(response.read().decode("utf-8"))["data"]["candidate"]
        self.assertEqual(candidate["name"], "Ramu Reddy")
        self.assertEqual(candidate["email"], "ramu@example.com")
        self.assertEqual(candidate["page_count"], 2)

    def test_rejects_request_larger_than_configured_limit(self):
        request = urllib.request.Request(
            f"http://127.0.0.1:{self.port}/api/v1/analyses",
            data=b"{}",
            headers={
                "Content-Type": "application/json",
                "Content-Length": str(MAX_REQUEST_BYTES + 1),
            },
            method="POST",
        )
        status, payload = self.read_http_error(request)
        self.assertEqual(status, 413)
        self.assertEqual(payload["error"]["code"], "payload_too_large")

    @patch.dict("os.environ", {"RESUME_API_KEY": "test-secret"}, clear=False)
    def test_requires_bearer_token_when_api_key_is_configured(self):
        request = urllib.request.Request(
            f"http://127.0.0.1:{self.port}/api/v1/analyses",
            data=json.dumps({"resume_text": SAMPLE_RESUME}).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        status, payload = self.read_http_error(request)
        self.assertEqual(status, 401)
        self.assertEqual(payload["error"]["code"], "unauthorized")

        response = self.post_json(
            "/api/v1/analyses",
            {"resume_text": SAMPLE_RESUME},
            headers={"Authorization": "Bearer test-secret"},
        )
        self.assertEqual(response.status, 200)

    @patch.dict("os.environ", {"API_HOST": "0.0.0.0", "PORT": "9123"}, clear=False)
    def test_server_configuration_uses_deployment_environment(self):
        self.assertEqual(resolve_server_config(), ("0.0.0.0", 9123))

    def test_rate_limiter_rejects_requests_after_the_window_limit(self):
        limiter = RequestRateLimiter(limit=2, window_seconds=60)
        self.assertTrue(limiter.allow("127.0.0.1", now=100.0))
        self.assertTrue(limiter.allow("127.0.0.1", now=101.0))
        self.assertFalse(limiter.allow("127.0.0.1", now=102.0))
        self.assertTrue(limiter.allow("127.0.0.1", now=161.0))

    def test_bullet_quality_endpoint(self):
        response = self.post_json("/api/v1/analyses/bullet-quality", {"resume_text": SAMPLE_RESUME})
        payload = json.loads(response.read().decode("utf-8"))
        self.assertEqual(response.status, 200)
        self.assertGreaterEqual(len(payload["data"]["flagged_bullets"]), 1)

    def test_interview_prep_endpoint(self):
        response = self.post_json(
            "/api/v1/analyses/interview-prep",
            {
                "job_description": SAMPLE_JD,
                "resume_skills": ["Python", "SQL"],
                "role_title": "Backend Engineer",
            },
        )
        payload = json.loads(response.read().decode("utf-8"))
        self.assertEqual(response.status, 200)
        self.assertGreater(len(payload["data"]["technical_questions"]), 0)

    def test_unknown_post_endpoint_returns_json_404(self):
        request = urllib.request.Request(
            f"http://127.0.0.1:{self.port}/missing",
            data=b"{}",
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        status, payload = self.read_http_error(request)
        self.assertEqual(status, 404)
        self.assertEqual(payload["error"]["code"], "not_found")

    def test_gap_endpoint_requires_fields(self):
        request = urllib.request.Request(
            f"http://127.0.0.1:{self.port}/api/v1/analyses/jd-gap",
            data=json.dumps({"resume_text": SAMPLE_RESUME}).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with self.assertRaises(urllib.error.HTTPError) as context:
            urllib.request.urlopen(request)
        error_response = context.exception
        payload = json.loads(error_response.read().decode("utf-8"))
        self.assertEqual(error_response.code, 422)
        self.assertEqual(payload["error"]["code"], "validation_error")
        error_response.close()

    def test_pdf_report_endpoint(self):
        response = self.post_json(
            "/api/v1/reports/pdf",
            {
                "candidate_name": "Asha",
                "resume_text": SAMPLE_RESUME,
                "resume_skills": ["Python", "SQL"],
                "job_description": SAMPLE_JD,
            },
        )
        payload = response.read()
        self.assertEqual(response.status, 200)
        self.assertEqual(response.headers.get_content_type(), "application/pdf")
        self.assertTrue(payload.startswith(b"%PDF-"))


if __name__ == "__main__":
    unittest.main()
