---
id: "006"
phase: 3
title: Document plugin and skill mobile affordances
status: ready
depends_on: ["005"]
parallel: false
conflicts_with: []
files:
  - docs/architecture/mobile-extension-contract.md
irreversible: false
scope_test: "N/A"
allowed_change: create
covers_criteria: [SC7]
---
## Failing test (write first)
N/A - documentation creation task.

## Change
- **File:** `docs/architecture/mobile-extension-contract.md`
- **Anchor:** New file under `docs/architecture/`; `test ! -e docs/architecture/mobile-extension-contract.md` should be true before this task starts.
- **Before:** File does not exist.
- **After:** Create `docs/architecture/mobile-extension-contract.md` with these sections, in this order:
  - `# Mobile Extension Contract`
  - `## Purpose`
  - `## Gateway-advertised primitives`
  - `## Actions`
  - `## Status cards`
  - `## Approval prompts`
  - `## Settings panels`
  - `## Voice intents`
  - `## Native permission mediation`
  - `## Native-only capability modules`
  - `## Security and review rules`
  - `## Not part of the first pass`

The document must define these plugin/skill-projected primitives:

- Before writing, read `docs/mobile/android-build.md`, `docs/mobile/ios-app-store-release.md`, and `docs/mobile/macos-catalyst-plan.md`. List platform/release constraints that affect native capability modules and record any divergence in `docs/plans/wednesdayai-mobile-init/decisions-ledger.md`.
- action buttons with schema-validated inputs and confirmation levels;
- status cards with severity, freshness, and source links;
- approval prompts with human-readable risk summaries;
- settings panels backed by typed config schemas;
- voice intents with short utterance hints, required permissions, and text fallback;
- file/media/camera/share-sheet requests mediated by native permission prompts;
- notification intents with user-visible category and quiet-hours metadata.

The document must separately list native-only modules: microphone, camera, screen/canvas capture, widgets, notifications, share extensions, contacts, calendar, location, secure storage, local network discovery, background execution, and platform purchase flows.
The document must use WednesdayAI naming, `wednesdayai` code identifiers where appropriate, Australian English, direct tone, OpenClaw heritage acknowledgement, and no upstream disparagement.

## Allowed moves
- Create only `docs/architecture/mobile-extension-contract.md`.
- Read the listed sibling/reference docs but do not list or modify them as task-owned files; they are read-only inputs, not write-scope entries.
- Do not create schemas, SDK code, plugin APIs, or UI components in this task.

## STOP triggers
- `docs/architecture/mobile-extension-contract.md` already exists before the task starts.
- The task would require deciding final wire formats or breaking gateway contracts.
- The contract would let plugins bypass native permission prompts.

## Manual verification (record in decisions-ledger)
- `test -f docs/architecture/mobile-extension-contract.md` exits 0.
- `rg -n "action buttons|status cards|approval prompts|settings panels|voice intents|permission|microphone|camera|notifications|secure storage|local network discovery|background execution|WednesdayAI|wednesdayai|Hard fork of OpenClaw" docs/architecture/mobile-extension-contract.md` returns matches.
- Record in the decisions ledger that the listed sibling/reference docs were read and whether any divergence was chosen.
- Read the document and confirm it reserves OS-level capabilities for native app modules.
- Read the document and confirm it uses Australian English, direct tone, and no upstream disparagement.

## Done when
`WAI_TYPECHECK_CMD=":" WAI_TEST_CMD=":" bash ~/.claude/wai/scripts/task-gate.sh wednesdayai-mobile-init 006` exits 0 after the manual verification checks above are recorded in `docs/plans/wednesdayai-mobile-init/decisions-ledger.md`.
