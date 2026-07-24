"""PDF extraction and preview helpers used by the Streamlit frontend."""

import base64
import io
import re
import unicodedata
from dataclasses import dataclass

import streamlit as st
from pdfminer.high_level import extract_pages
from pdfminer.layout import LAParams, LTTextContainer


@dataclass(frozen=True)
class ExtractionResult:
    text: str
    method: str
    page_count: int
    ocr_pages: tuple[int, ...]
    warnings: tuple[str, ...]


_LIGATURES = str.maketrans(
    {
        "\ufb00": "ff",
        "\ufb01": "fi",
        "\ufb02": "fl",
        "\ufb03": "ffi",
        "\ufb04": "ffl",
        "\ufb05": "st",
        "\ufb06": "st",
    }
)


def normalize_resume_text(text: str) -> str:
    """Clean extraction artifacts without rewriting resume content."""
    normalized = unicodedata.normalize("NFKC", text.translate(_LIGATURES))
    normalized = normalized.replace("\u00a0", " ").replace("\u200b", "")
    normalized = re.sub(r"(?<=\w)-\s*\n\s*(?=[a-z])", "", normalized)
    normalized = re.sub(r"[ \t]+", " ", normalized)
    normalized = re.sub(r" *\n *", "\n", normalized)
    normalized = re.sub(r"\n{3,}", "\n\n", normalized)
    return normalized.strip()


def text_quality(text: str) -> float:
    """Return a conservative 0..1 signal for whether a page is usable."""
    cleaned = normalize_resume_text(text)
    if not cleaned:
        return 0.0

    visible = [character for character in cleaned if not character.isspace()]
    if not visible:
        return 0.0

    word_count = len(re.findall(r"\b[\w.+#/-]{2,}\b", cleaned))
    readable = sum(
        character.isalnum() or character in ".,:;@+/#&()[]-'\""
        for character in visible
    )
    replacement_penalty = cleaned.count("\ufffd") / len(visible)
    length_score = min(len(visible) / 120, 1.0)
    word_score = min(word_count / 20, 1.0)
    character_score = readable / len(visible)
    return max(0.0, min(1.0, 0.35 * length_score + 0.35 * word_score + 0.30 * character_score - replacement_penalty))


def _extract_native_pages(pdf_bytes: bytes) -> list[str]:
    pages: list[str] = []
    layout_parameters = LAParams(boxes_flow=0.5, all_texts=True)
    for page in extract_pages(io.BytesIO(pdf_bytes), laparams=layout_parameters):
        page_text = "".join(
            element.get_text()
            for element in page
            if isinstance(element, LTTextContainer)
        )
        pages.append(normalize_resume_text(page_text))
    return pages


def _ocr_page(pdf_bytes: bytes, page_index: int) -> str:
    try:
        import pymupdf
    except ImportError as error:
        raise RuntimeError("PyMuPDF is not installed") from error

    with pymupdf.open(stream=pdf_bytes, filetype="pdf") as document:
        page = document[page_index]
        text_page = page.get_textpage_ocr(language="eng", dpi=300, full=True)
        return normalize_resume_text(page.get_text(textpage=text_page, sort=True))


def extract_resume_text(
    pdf_bytes: bytes,
    quality_threshold: float = 0.48,
) -> ExtractionResult:
    """Extract native text and OCR only pages whose text layer is unusable."""
    if b"%PDF" not in pdf_bytes[:1024]:
        raise ValueError("The uploaded file is not a valid PDF.")

    native_pages = _extract_native_pages(pdf_bytes)
    if not native_pages:
        raise ValueError("The PDF does not contain any readable pages.")

    final_pages: list[str] = []
    ocr_pages: list[int] = []
    warnings: list[str] = []

    for page_index, native_text in enumerate(native_pages):
        if text_quality(native_text) >= quality_threshold:
            final_pages.append(native_text)
            continue

        try:
            ocr_text = _ocr_page(pdf_bytes, page_index)
        except Exception as error:
            warnings.append(f"Page {page_index + 1}: OCR unavailable ({error}).")
            final_pages.append(native_text)
            continue

        if text_quality(ocr_text) > text_quality(native_text):
            final_pages.append(ocr_text)
            ocr_pages.append(page_index + 1)
        else:
            final_pages.append(native_text)
            warnings.append(f"Page {page_index + 1}: OCR did not improve the extracted text.")

    combined_text = normalize_resume_text("\n\n".join(page for page in final_pages if page))
    if text_quality(combined_text) < 0.20:
        detail = " ".join(warnings) if warnings else "No usable text was found."
        raise ValueError(f"Resume text extraction failed. {detail}")

    if len(ocr_pages) == len(native_pages):
        method = "ocr"
    elif ocr_pages:
        method = "hybrid"
    else:
        method = "native"

    return ExtractionResult(
        text=combined_text,
        method=method,
        page_count=len(native_pages),
        ocr_pages=tuple(ocr_pages),
        warnings=tuple(warnings),
    )


def extract_text(pdf_bytes: bytes) -> str:
    """Backward-compatible text-only interface."""
    return extract_resume_text(pdf_bytes).text


def render_pdf_preview(pdf_bytes: bytes):
    encoded_pdf = base64.b64encode(pdf_bytes).decode("utf-8")
    st.markdown(
        f"""
        <iframe
            src="data:application/pdf;base64,{encoded_pdf}"
            width="400"
            height="500"
            type="application/pdf"
            style="border-radius: 10px; border: 2px solid #1ed760;">
        </iframe>
        """,
        unsafe_allow_html=True,
    )
