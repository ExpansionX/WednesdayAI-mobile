---
id: "001"
phase: 1
title: Create the WednesdayAI Mobile vision
status: passed
depends_on: []
parallel: false
conflicts_with: []
files:
  - VISION.md
irreversible: false
scope_test: "N/A"
allowed_change: create
covers_criteria: [SC1, SC9]
---
## Failing test (write first)
N/A - documentation creation task.

## Change
- **File:** `VISION.md`
- **Anchor:** New top-level file; `test ! -e VISION.md` should be true before this task starts.
- **Before:** File does not exist.
- **After:** Create `VISION.md` with these sections, in this order:
  - `# WednesdayAI Mobile Vision`
  - `## Make it yours`
  - `## Product north star`
  - `## Who it serves`
  - `## Voice-first, text-secondary`
  - `## Direct WednesdayAI management`
  - `## Mobile as a capability provider`
  - `## Extensible by forks, skills, and plugins`
  - `## Relationship to OpenClaw and Clawket`
  - `## Experience principles`
  - `## Non-goals`
  - `## First horizon`

The content must state all of the following:

- WednesdayAI Mobile is the first-party mobile companion and operator surface for WednesdayAI.
- The long-term interaction model is voice-first; text chat remains a fallback and precision surface.
- The app should manage a WednesdayAI installation directly wherever possible, without making a helper/bridge the default mental model.
- Mobile can act as a node/capability provider for microphone, camera, screen/canvas capture, notifications, widgets, share sheet, secure storage, contacts, calendar, location, and local network discovery.
- Most domain-specific enhancements should come from WednesdayAI skills/plugins through stable contracts, not from baking every feature into the app.
- Fork authors should be able to take the app as a solid base and make it theirs.
- Acknowledge OpenClaw heritage as "Hard fork of OpenClaw at v2026.3.2" and Clawket as the mobile hard-fork source; do not disparage upstream.
- Use WednesdayAI naming, `wednesdayai` code identifier language where appropriate, Australian English, and direct tone.

## Allowed moves
- Create only `VISION.md`.
- Do not edit package metadata, source code, assets, or other docs.

## STOP triggers
- `VISION.md` already exists before the task starts.
- Writing the vision would require changing the frozen spec.
- The document would need to invent final app-store names, bundle identifiers, or legal claims not specified by the task.

## Manual verification (record in decisions-ledger)
- `test -f VISION.md` exits 0.
- `rg -n "voice-first|text-secondary|Direct WednesdayAI management|capability provider|skills/plugins|Hard fork of OpenClaw at v2026\\.3\\.2|Make it yours" VISION.md` returns matches.
- Read `VISION.md` and confirm it does not describe old `WednesdayAI-core/apps/*` or upstream OpenClaw mobile as the implementation base.

## Done when
`WAI_TYPECHECK_CMD=":" WAI_TEST_CMD=":" bash ~/.claude/wai/scripts/task-gate.sh wednesdayai-mobile-init 001` exits 0 after the manual verification checks above are recorded in `docs/plans/wednesdayai-mobile-init/decisions-ledger.md`.
