"""Existing v1 workflows exposed through FastAPI."""

from fastapi import APIRouter, Response

from ...core.resume_analysis import (
    analyze_bullet_quality,
    build_gap_explainer,
    build_pdf_report_bytes,
    generate_interview_prep,
)
from ...schemas.analysis import AnalysisRequest, AnalysisResponse, GapRequest, InterviewRequest, ResumeTextRequest
from ...services.analysis_service import analyze_resume

router = APIRouter(prefix="/api/v1")


@router.get("/health")
def health():
    return {"data": {"status": "ok", "service": "resume-analysis-api", "version": "v1"}}


@router.post("/analyses", response_model=AnalysisResponse)
def analyze(body: AnalysisRequest):
    return analyze_resume(body)


@router.post("/analyses/bullet-quality", response_model=AnalysisResponse)
def bullet_quality(body: ResumeTextRequest):
    return AnalysisResponse(data=analyze_bullet_quality(body.resume_text))


@router.post("/analyses/jd-gap", response_model=AnalysisResponse)
def jd_gap(body: GapRequest):
    return AnalysisResponse(data=build_gap_explainer(body.job_description, body.resume_text, body.resume_skills))


@router.post("/analyses/interview-prep", response_model=AnalysisResponse)
def interview_prep(body: InterviewRequest):
    return AnalysisResponse(data=generate_interview_prep(body.job_description, body.resume_skills, body.role_title))


@router.post("/reports/pdf", response_class=Response, responses={200: {"content": {"application/pdf": {}}}})
def pdf_report(body: AnalysisRequest):
    report = build_pdf_report_bytes("Resume Analysis Report", analyze_resume(body).data)
    return Response(
        report,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="resume-analysis-report.pdf"'},
    )
