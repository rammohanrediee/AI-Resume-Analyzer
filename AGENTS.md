# AI Resume Analyzer — Working Rules

## Authority and delivery

- Authoritative remote: https://github.com/rammohanrediee/AI-Resume-Analyzer . Push only to this repository, never to upstream or the sibling legacy checkout.
- User explicitly authorized implementation, meaningful verification, commits, and GitHub pushes on 2026-09-22. Continue authorized work without repeated approval questions; respect actual platform permission requirements.
- Work on the existing main branch when permitted. Do not create unnecessary branches, per-step PRs, or tiny commits. Group related changes into cohesive verified milestones. Never force-push or overwrite unrelated user changes.
- Two months is an outer deadline, not a required duration. Finish sooner if completion gates pass.

## Stack and scope

- React + JavaScript + Vite frontend; Python FastAPI backend. No TypeScript requirement.
- Preserve existing functionality and upstream attribution. Keep Streamlit working during the React transition.
- Preserve privacy-minimized opt-in analytics; never log resume contents, credentials or personal identifiers.
- PeerMock is a separate user-owned guided build; do not modify it.

## Tests and evidence

- Do not create unnecessary test cases. Prefer extending existing tests for API compatibility, security boundaries, data integrity, real integrations, and demonstrated regressions.
- Avoid tests that mirror implementation, redundant mocked layers, and tests for documentation-only changes.
- Run checks relevant to the change and required CI gates; fix failures caused by our work. Do not claim passing tests, deployment, benchmarks, or features without evidence.

## Progress and continuity

- Start with docs/project-tracking/CURRENT_CHECKPOINT.md and PROJECT_TRACKER.md.
- Update the tracker, checkpoint and verification log after each meaningful milestone. Record the exact next action and blockers. Keep one canonical tracker set in this repository.
- Record durable decisions in docs/project-tracking/DECISIONS.md.
- Use Headroom compression for large CLI outputs where helpful; retrieve originals for exact reasoning. Never claim proxy routing or savings that were not verified.
- Give concise progress updates and milestone walkthroughs so the user can understand and explain the work.
