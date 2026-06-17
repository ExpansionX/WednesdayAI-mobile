---
id: "003"
phase: 2
title: Document the Clawket hard-fork setup
status: passed
depends_on: ["001"]
parallel: false
conflicts_with: []
files:
  - SETUP.md
irreversible: false
scope_test: "N/A"
allowed_change: create
covers_criteria: [SC3, SC4, SC9, SC10]
---
## Failing test (write first)
N/A - documentation creation task.

## Change
- **File:** `SETUP.md`
- **Anchor:** New top-level file; `test ! -e SETUP.md` should be true before this task starts.
- **Before:** File does not exist.
- **After:** Create `SETUP.md` with these sections, in this order:
  - `# WednesdayAI Mobile Setup`
  - `## Source repository`
  - `## Import strategy`
  - `## Repository checklist`
  - `## Product identity checklist`
  - `## Mobile package identifiers`
  - `## App assets and launch surfaces`
  - `## CI and release boundaries`
  - `## Secrets and signing`
  - `## Analytics and telemetry names`
  - `## Store metadata`
  - `## First verification pass`
  - `## Not in this setup step`

The setup guide must cover:

- importing from Clawket into `ExpansionX/WednesdayAI-mobile`;
- deciding whether to preserve history or import a clean seed with attribution;
- package name, workspace name, native bundle/application IDs, app display name, icons, splash, docs links, analytics names, release metadata, CI, secrets, and store signing;
- retaining OpenClaw heritage acknowledgement while converting visible product language to WednesdayAI;
- explicitly rejecting old `WednesdayAI-core/apps/*` and upstream OpenClaw mobile as the implementation base.
- using WednesdayAI naming, `wednesdayai` code identifiers where appropriate, Australian English, direct tone, OpenClaw heritage acknowledgement, and no upstream disparagement.

## Allowed moves
- Create only `SETUP.md`.
- Do not run git import commands, modify remotes, rename packages, or change native project files.

## STOP triggers
- `SETUP.md` already exists before the task starts.
- A setup step would require secrets, signing material, or GitHub repository writes.
- The document would need to choose final production bundle IDs without human confirmation.

## Manual verification (record in decisions-ledger)
- `test -f SETUP.md` exits 0.
- `rg -n "Clawket|ExpansionX/WednesdayAI-mobile|history|package|bundle|application ID|display name|icons|splash|CI|secrets|signing|analytics|store metadata|WednesdayAI-core/apps|WednesdayAI|wednesdayai|Hard fork of OpenClaw" SETUP.md` returns matches.
- Read `SETUP.md` and confirm every SC4 item is mentioned.
- Read `SETUP.md` and confirm it uses Australian English, direct tone, and no upstream disparagement.

## Done when
`WAI_TYPECHECK_CMD=":" WAI_TEST_CMD=":" bash ~/.claude/wai/scripts/task-gate.sh wednesdayai-mobile-init 003` exits 0 after the manual verification checks above are recorded in `docs/plans/wednesdayai-mobile-init/decisions-ledger.md`.
