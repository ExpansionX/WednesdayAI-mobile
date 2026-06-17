---
id: "004"
phase: 2
title: Document the forkable repository model
status: ready
depends_on: ["003"]
parallel: false
conflicts_with: []
files:
  - FORKING.md
irreversible: false
scope_test: "N/A"
allowed_change: create
covers_criteria: [SC1, SC4, SC7, SC9]
---
## Failing test (write first)
N/A - documentation creation task.

## Change
- **File:** `FORKING.md`
- **Anchor:** New top-level file; `test ! -e FORKING.md` should be true before this task starts.
- **Before:** File does not exist.
- **After:** Create `FORKING.md` with these sections, in this order:
  - `# Forking WednesdayAI Mobile`
  - `## What this repository gives you`
  - `## What to customise in app code`
  - `## What to extend through WednesdayAI skills and plugins`
  - `## Brand and attribution`
  - `## Backend compatibility`
  - `## Native capability boundaries`
  - `## Release ownership`
  - `## Upstreaming improvements`

The document must explain:

- WednesdayAI Mobile is intended to be a solid base others can fork and customise.
- App-code customisation is appropriate for native UX, branding, store metadata, OS integrations, navigation, and proprietary product flows.
- Skills/plugins are preferred for domain features that can be advertised through gateway metadata/actions.
- Forks should keep OpenClaw heritage attribution where legally or ethically required and should not imply they are official WednesdayAI unless they are.
- Release signing, store accounts, analytics projects, and secrets belong to the fork owner.
- Use WednesdayAI naming, `wednesdayai` code identifiers where appropriate, Australian English, direct tone, OpenClaw heritage acknowledgement, and no upstream disparagement.

## Allowed moves
- Create only `FORKING.md`.
- Do not modify licence files or legal notices in this task.

## STOP triggers
- `FORKING.md` already exists before the task starts.
- The task would require legal advice, licence changes, or final trademark policy beyond the current brand guidelines.
- The guide would contradict `VISION.md` or `SETUP.md`.

## Manual verification (record in decisions-ledger)
- `test -f FORKING.md` exits 0.
- `rg -n "fork|customise|skills|plugins|Brand and attribution|Backend compatibility|Native capability boundaries|Release ownership|WednesdayAI|wednesdayai|Hard fork of OpenClaw" FORKING.md` returns matches.
- Read `FORKING.md` and confirm it separates app-code customisation from skills/plugins extension.
- Read `FORKING.md` and confirm it uses Australian English, direct tone, and no upstream disparagement.

## Done when
`WAI_TYPECHECK_CMD=":" WAI_TEST_CMD=":" bash ~/.claude/wai/scripts/task-gate.sh wednesdayai-mobile-init 004` exits 0 after the manual verification checks above are recorded in `docs/plans/wednesdayai-mobile-init/decisions-ledger.md`.
