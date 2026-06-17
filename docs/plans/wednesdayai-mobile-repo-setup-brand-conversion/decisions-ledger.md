# Decisions Ledger: wednesdayai-mobile-repo-setup-brand-conversion

The executor appends dated rows here when a task requires a choice not already locked by the spec or task file.

| id | task | decision | rationale |
|----|------|----------|-----------|
| D0 | decompose | Make the first slice documentation/planning-only. | The repository still has broad Clawket identity across docs, package scripts, app config, UI strings, backend descriptors, release config, and package names. A planning slice avoids mixing safe docs updates with app IDs, publishable package decisions, and backend behaviour. |
| D1 | decompose | Use create-only inventory/plan documents as task outputs. | WAI gate can verify these tasks without allowing accidental edits to package metadata, app config, source code, or release credentials. |
| D2 | decompose | Leave production app IDs, EAS identifiers, package scopes, and CLI bin names as confirmation points. | The user explicitly required bundle/application identifier inventory without choosing final production IDs. |
| D3 | decompose | Task 006 creates a sibling architecture plan after reading `docs/architecture/backend-transport.md`. | The existing architecture doc defines the backend/transport separation; the new descriptor plan is a narrower implementation-planning artifact and must not replace or contradict that source. |
| V001 | 001 | Manual verification passed for `docs/setup/repository-import-state.md`. | `test -f docs/setup/repository-import-state.md` exited 0; `rg -n "ExpansionX/WednesdayAI-mobile\|codex/wednesdayai-mobile-init\|origin\|pull request\|external" docs/setup/repository-import-state.md` returned matches; `git diff --name-only` returned no external repository paths before staging because the new file was still untracked. |
| V002 | 002 | Manual verification passed for `docs/setup/identity-surface-inventory.md`. | `test -f docs/setup/identity-surface-inventory.md` exited 0; `rg -n "Root package\|Mobile app configuration\|Bridge CLI\|Backend descriptors\|Needs human confirmation\|OpenClaw\|Hermes\|WednesdayAI" docs/setup/identity-surface-inventory.md` returned matches; manual read confirmed the document inventories current identifiers and leaves final production IDs as confirmation points. |
