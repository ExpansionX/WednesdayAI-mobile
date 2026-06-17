# Decisions Ledger: wednesdayai-mobile-init

The executor appends dated rows here when a task requires a choice not already locked by the spec or task file.

| id | task | decision | rationale |
|----|------|----------|-----------|
| D0 | decompose | Use one-created-document-per-task for the initial plan. | Keeps the docs-only workstream executable with narrow `create` commits and avoids mixing repo import, brand conversion, and architecture prose in one task. |
| D1 | decompose | Do not list root `AGENTS.md` as a sibling file for top-level docs. | `AGENTS.md` is a repository instruction file that was read before decomposition; it is not a content-pattern sibling for `VISION.md`, `ROADMAP.md`, `SETUP.md`, or `FORKING.md`. The task texts already carry the relevant repository constraints. |
| D2 | decompose | Keep read-only sibling/reference docs out of task `files:` lists. | The WAI task gate treats `files:` as the write allow-list. Listing read-only references beside `allowed_change: create` would weaken the gate by allowing accidental modifications to those files. Tasks name reference inputs in the body and require ledger evidence instead. |
| D3 | 001 | Manual verification passed for `VISION.md`. | `test -f VISION.md` passed; required `rg` terms were present; the document treats old core apps and upstream OpenClaw mobile as references, not the implementation base. |
