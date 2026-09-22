# AI Resume Analyzer — Decisions

## D01 — Repository authority

Use `rammohanrediee/AI-Resume-Analyzer`, explicitly confirmed by the user. The supplied local folder's different remote must not override this decision.

## D02 — Frontend

Accepted 2026-09-22: React + JavaScript + Vite. No TypeScript migration in the first release. Explain JavaScript/React concepts through implementation walkthroughs.

## D03 — Backend and transition

Target FastAPI with PostgreSQL-backed, privacy-minimized analytics. Preserve existing analysis behaviour and keep Streamlit working while the core React flow is built. Verify actual baseline before deciding exact migrations.

## D04 — Delivery pace

The two-month target is an outer deadline, not eight mandatory weeks of development. Complete one verified release at a time. Do not promise a finish date before reproducing the baseline.

## D05 — Ownership and positioning

Resume Analyzer is an open-source extension/re-architecture. Retain upstream attribution and distinguish new changes in contribution documentation. Never claim from-scratch authorship, invented usage, benchmark improvements or test results.

## D06 — Learning and implementation

Codex handles authorized Resume Analyzer implementation and mechanical checks; the user gets milestone walkthroughs and small useful inspection exercises. PeerMock's separate guided-build rules are not copied as implementation restrictions into this project.

## D07 — Headroom and progress

Use available Headroom compression for large outputs where helpful. Retrieve original details when needed for exact code reasoning. Never treat compression as a substitute for saved checkpoints or verified evidence. Do not claim the running desktop task is proxy-routed when it is not.

## D08 — Scope boundary

First React release: upload, job description, processing/error feedback, results/evidence/gaps, and report download. Defer new accounts, elaborate administration, microservices and extra AI features. Preserve privacy controls as functionality moves between components.

## D09 — Git and test discipline

User explicitly authorized implementation and GitHub pushes on 2026-09-22. Use the existing
main branch and coherent milestone commits; no unnecessary branches or tests. Durable
execution rules live in the repository-root AGENTS.md.

## D10 — Correct local checkout

Work in `AI-Resume-Analyzer-authoritative` alongside the supplied older checkout. Origin
is the confirmed rammohanrediee repository; never push to upstream. The old checkout's
uncommitted matching changes remain preserved.

## D11 — HTTP migration

Preserve v1 URLs and success/error envelopes. Use Pydantic strict inputs and Uvicorn.
Synchronous analysis routes run in FastAPI's worker thread pool. Enforce actual streamed
JSON body size before parsing, retain optional API-key authentication, and emit only
sanitary operational metadata in request logs. The rate limiter is explicitly per process,
not a distributed guarantee. React authentication and deployment design remain later work.

## D12 — PDF extraction boundary and next priority

Reuse the existing native-PDF and OCR behaviour through `POST /api/v1/documents/extract`
instead of rebuilding the feature. The backend owns validation and processing, with a
5 MiB PDF limit, 20-page limit, five-page OCR limit, and 200,000-character output limit.
Streamlit remains compatible but now uses this API boundary. Build the React core flow
next; defer analytics/database restructuring until that flow works end to end.

## D13 — Headroom privacy boundary

The user requested Headroom for longer tasks, but automatic approval review rejected
sending repository-derived implementation details to that external service. Do not export
private repository content through Headroom without approval that satisfies that review.
Use the repository checkpoint documents and concise local command output for continuity.

## D14 — React browser boundary

The first React release lives in `web/` and uses JavaScript with Vite. During local
development Vite proxies `/api` to FastAPI. Cross-origin deployments must set the exact
browser origins through `CORS_ALLOW_ORIGINS`; wildcard origins are not enabled. The browser
does not receive a private API key. Deployment should use a same-origin reverse proxy or
another server-side authentication boundary if POST authentication is enabled.
