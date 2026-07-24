# Contributions and Project Lineage

## Upstream

This project is based on
[`deepakpadhi986/AI-Resume-Analyzer`](https://github.com/deepakpadhi986/AI-Resume-Analyzer),
created by Deepak Padhi and distributed under the MIT License.

The upstream project established:

- the AI Resume Analyzer concept;
- a Streamlit candidate and administrator workflow;
- PDF/resume parsing foundations;
- role, course, video, and recommendation data;
- early persistence and analytics behavior;
- original visual assets and project documentation.

The upstream copyright notice remains in `LICENSE`.

## My contribution

I used the original project as a starting point and reworked it into a modular
application. My contribution is the engineering described below, not the
original project concept.

### Backend and API

- Split analysis behavior into `backend/app/core`, `services`, `schemas`,
  `models`, and `api`.
- Added a versioned JSON HTTP API with consistent success and error payloads.
- Added endpoints for complete analysis, JD gaps, bullet review, interview
  preparation, health checks, and PDF reports.
- Added deterministic fallbacks so the core workflow works without downloading
  an embedding model.

### Matching and analysis

- Added canonical skill aliases and resume-text evidence recovery.
- Added optional `sentence-transformers/all-MiniLM-L6-v2` matching.
- Added resume-to-JD requirement extraction, prioritization, gap categories,
  and exact supporting-line mapping.
- Added ATS section scoring, metric/bullet checks, bullet-quality feedback, and
  pattern-based interview questions.
- Added explicit limitations so match scores are not presented as an employer's
  proprietary ATS result.

### Frontend and persistence

- Rebuilt the Streamlit application as separate pages and reusable components.
- Added API health reporting and a frontend API client.
- Replaced the legacy `pdfminer3` reader with a page-aware `pdfminer.six`
  pipeline, extraction-quality checks, resume-safe text normalization, and
  Tesseract OCR fallback for weak or image-only pages.
- Added extraction metadata so the interface records whether a resume used its
  native text layer, OCR, or both.
- Added PDF report download and a reorganized results experience.
- Added a storage adapter that supports local SQLite and configured PostgreSQL.
- Moved credentials and database settings to environment variables.

### Quality and delivery

- Added unit, API integration, architecture, project-structure, and navigation
  tests.
- Added package metadata, Docker configuration, Railway-style configuration,
  environment examples, and startup scripts.
- Added continuous integration with an enforced backend coverage threshold.
- Rewrote the documentation around setup, architecture, privacy, limitations,
  and responsible use.

## File-level ownership map

| Path | Status |
|---|---|
| `backend/` | Created as part of my re-architecture |
| `frontend/api_client.py` | Created as part of my re-architecture |
| `frontend/pages/` | Created as part of my re-architecture |
| `frontend/services/pdf_parser.py` | Rebuilt as a native-text and page-level OCR extraction pipeline |
| `frontend/services/storage.py` | Rebuilt persistence layer; concept derives from upstream storage/admin behavior |
| `frontend/components/report.py` | Created for the new report workflow |
| `frontend/components/admin_dashboard.py` | Rebuilt from the upstream admin analytics concept |
| `frontend/components/courses.py` | Adapted from upstream course/video recommendation data |
| `frontend/assets/images/` | Retained upstream visual assets |
| `tests/` | Created for the re-architected application |
| `Dockerfile`, `nixpacks.toml`, startup scripts | Created for deployment |
| `LICENSE` | Retained upstream MIT license and copyright |

## How to discuss this project

Accurate:

> I re-architected an MIT-licensed Streamlit resume analyzer into separate
> frontend and HTTP API layers. I added evidence-backed JD matching, optional
> embeddings, database adapters, PDF reporting, tests, and deployment
> configuration.

Inaccurate:

> I created the original AI Resume Analyzer project.

This distinction is important: the value of this work is in the documented
re-engineering and added capabilities.
