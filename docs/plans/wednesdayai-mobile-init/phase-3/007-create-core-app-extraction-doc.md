---
id: "007"
phase: 3
title: Document core app extraction guidance
status: ready
depends_on: ["003","004"]
parallel: false
conflicts_with: []
files:
  - docs/architecture/core-app-extraction.md
irreversible: false
scope_test: "N/A"
allowed_change: create
covers_criteria: [SC8]
---
## Failing test (write first)
N/A - documentation creation task.

## Change
- **File:** `docs/architecture/core-app-extraction.md`
- **Anchor:** New file under `docs/architecture/`; `test ! -e docs/architecture/core-app-extraction.md` should be true before this task starts.
- **Before:** File does not exist.
- **After:** Create `docs/architecture/core-app-extraction.md` with these sections, in this order:
  - `# WednesdayAI Core App Extraction`
  - `## Decision`
  - `## Directories in scope`
  - `## Why they are not the mobile base`
  - `## Preservation options`
  - `## Extraction sequence`
  - `## What must not move`
  - `## Follow-up workstream requirements`

The document must state:

- Before writing, read `docs/mobile/android-build.md`, `docs/mobile/ios-app-store-release.md`, `docs/mobile/macos-dev.md`, and `docs/mobile/macos-catalyst-plan.md`. List any release/build knowledge that should be preserved before old core apps are archived or extracted. Record any divergence in `docs/plans/wednesdayai-mobile-init/decisions-ledger.md`.
- `WednesdayAI-core/apps/android`, `WednesdayAI-core/apps/ios`, `WednesdayAI-core/apps/macos`, and `WednesdayAI-core/apps/shared` are not the future first-party mobile app base.
- Those directories should be treated as references until a separate workstream archives, extracts, or removes them.
- Useful knowledge should be preserved before deletion or archival.
- Core should keep gateway/runtime/plugin contracts; first-party app release churn belongs in separate app repositories.
- Any deletion, archival, or repository move must be a separate irreversible workstream with its own ADR and precheck.
- Use WednesdayAI naming, `wednesdayai` code identifiers where appropriate, Australian English, direct tone, OpenClaw heritage acknowledgement, and no upstream disparagement.

## Allowed moves
- Create only `docs/architecture/core-app-extraction.md`.
- Read the listed sibling/reference docs but do not list or modify them as task-owned files; they are read-only inputs, not write-scope entries.
- Do not touch `WednesdayAI-core` from this task.
- Do not delete, move, or archive any app directory in this task.

## STOP triggers
- `docs/architecture/core-app-extraction.md` already exists before the task starts.
- The task would require editing `/Users/david/Code/WednesdayAI-core`.
- The guide would authorise deletion without a future ADR and human-reviewed workstream.

## Manual verification (record in decisions-ledger)
- `test -f docs/architecture/core-app-extraction.md` exits 0.
- `rg -n "apps/android|apps/ios|apps/macos|apps/shared|not the future|references|separate workstream|ADR|precheck|WednesdayAI|wednesdayai|Hard fork of OpenClaw" docs/architecture/core-app-extraction.md` returns matches.
- Record in the decisions ledger that the listed sibling/reference docs were read and whether any divergence was chosen.
- Read the document and confirm it does not instruct the executor to delete or move core app directories now.
- Read the document and confirm it uses Australian English, direct tone, and no upstream disparagement.

## Done when
`WAI_TYPECHECK_CMD=":" WAI_TEST_CMD=":" bash ~/.claude/wai/scripts/task-gate.sh wednesdayai-mobile-init 007` exits 0 after the manual verification checks above are recorded in `docs/plans/wednesdayai-mobile-init/decisions-ledger.md`.
