# AI Resume Analyzer — Project Tracker

Updated: 2026-09-22

## Target and source of truth

Ship a demonstrable React + JavaScript + Vite frontend and Python FastAPI backend, with meaningful tests, reproducible setup, and honest open-source attribution. Support Python backend applications first and React/Python full-stack applications second.

Authoritative repository: https://github.com/rammohanrediee/AI-Resume-Analyzer

The two-month window is an outer deadline (approximately 2026-11-21), not a minimum build duration. Ship sooner when the gates pass. Work proceeds by milestones rather than waiting for calendar weeks.

Read [CURRENT_CHECKPOINT.md](CURRENT_CHECKPOINT.md) first when resuming. See [DECISIONS.md](DECISIONS.md) for accepted scope and [VERIFICATION_LOG.md](VERIFICATION_LOG.md) for evidence.

## Tracking contract

- One active episode at a time. Update this tracker and the checkpoint after meaningful implementation or verification.
- Check an episode only after its saved work and completion gate are verified.
- Record exact commands, results, limitations, and commit identifiers when available. Distinguish existing upstream features, newly implemented work, and proposed work.
- Failed or unavailable checks stay visible; configuration alone does not prove a passing check.
- End each working session with the exact next action and any concrete blocker.
- These four documents in `docs/project-tracking/` are the canonical tracker set. They now live in the confirmed `AI-Resume-Analyzer-authoritative` checkout. The old checkout contains relocation notices only.

## Season 0 — Confirmed baseline (complete)

- [x] **S0E1** Confirm repository, frontend language, delivery scope, and tracking format.
- [x] **S0E2** Locate or create a checkout of the confirmed repository; verify remote, branch, HEAD, local instructions, and working-tree changes. Preserve the unrelated checkout.
- [x] **S0E3** Reproduce existing tests and core workflow. Record current API contracts, dependencies, privacy behaviour, and known failures.

Gate: a verified baseline exists in the correct checkout, with reproducible checks and an explicit list of remaining gaps.

## Season 1 — FastAPI and backend boundaries (active)

- [x] **S1E1** Migrate existing HTTP endpoints to FastAPI with validated contracts and stable errors; preserve existing client behaviour where practical.
- [x] **S1E2** Move PDF extraction behind the backend boundary; enforce document size/page/resource limits and predictable malformed-file/OCR failures.
- [ ] **S1E3 — Deferred until after React core flow** Move analytics database access behind the backend; preserve opt-in, privacy-minimized storage. Add schema migrations and real PostgreSQL integration verification.
- [ ] **S1E4** Verify authentication configuration, request limits, sanitized logging, request IDs, and relevant failure paths.

Gate: the core processing and analytics workflow runs through the backend, with real boundary tests and no unintended persistence of raw resumes.

## Season 2 — React core workflow (active)

- [ ] **S2E1 — Next** Scaffold React + JavaScript + Vite and agree the small set of UI/API contracts.
- [ ] **S2E2** Implement resume upload and job-description input with validation and accessible form feedback.
- [ ] **S2E3** Implement processing, errors, results, supporting evidence, skill gaps, and PDF report download.
- [ ] **S2E4** Verify the complete browser-to-backend flow, repeated submissions, failed requests, keyboard use, and narrow screens.

Gate: the React UI completes upload → analysis → results → report download against the actual backend. Streamlit remains available during transition; administrative UI migration is not required for the first release.

## Season 3 — Reproducible release (pending)

- [ ] **S3E1** Update Docker and CI for the actual frontend/backend setup; verify a clean installation and build.
- [ ] **S3E2** Measure representative processing latency and failure behaviour with documented environment and fixtures.
- [ ] **S3E3** Prepare a working demo/deployment and run smoke checks. Record any hosting or credential blocker explicitly.
- [ ] **S3E4** Update architecture, setup, limitations, attribution, and contribution documentation.

Gate: a reviewer can reproduce the application and inspect passing verification plus honest measurements. A public deployment is counted only after it is actually accessible and checked.

## Season 4 — Resume and interview evidence (pending)

- [ ] **S4E1** Write evidence-backed resume bullets that distinguish upstream work from extensions.
- [ ] **S4E2** Prepare a short demo and request-flow explanation, including design tradeoffs and one diagnosed failure.
- [ ] **S4E3** Walk through the implementation with the user so they can explain and modify it.

Gate: the project is demonstrable and its claims are defensible. Then move to OrbitDesk; PeerMock remains the user's separate build.

## Deferred scope

New account systems, multi-tenancy, elaborate dashboards/animations, microservices, additional model providers, and advanced AI-security research. Add a queue only if measured processing behaviour justifies it. Do not expand scope merely to add technology names to the resume.

## Latest completed milestone

S0, S1E1, and S1E2 are complete. The FastAPI migration and bounded PDF/OCR upload
boundary pass 64 tests with 91% backend coverage, lint, dependency consistency, and a
real Uvicorn upload-to-analysis smoke test. S2E1 is active next by user priority; S1E3
analytics restructuring resumes after the React core flow. S1E4 stays open until the
remaining persistence and deployment boundaries are verified.
