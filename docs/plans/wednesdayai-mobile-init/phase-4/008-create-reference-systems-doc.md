---
id: "008"
phase: 4
title: Document reference-system cherry-picks
status: passed
depends_on: ["002","005","006","007"]
parallel: false
conflicts_with: []
files:
  - docs/architecture/reference-systems.md
irreversible: false
scope_test: "N/A"
allowed_change: create
covers_criteria: [SC2, SC6, SC7, SC9]
---
## Failing test (write first)
N/A - documentation creation task.

## Change
- **File:** `docs/architecture/reference-systems.md`
- **Anchor:** New file under `docs/architecture/`; `test ! -e docs/architecture/reference-systems.md` should be true before this task starts.
- **Before:** File does not exist.
- **After:** Create `docs/architecture/reference-systems.md` with these sections, in this order:
  - `# Reference Systems`
  - `## How to use this document`
  - `## Clawket`
  - `## Upstream OpenClaw`
  - `## WednesdayAI-core`
  - `## Saturday apps`
  - `## Hermes Desktop`
  - `## ArgentOS`
  - `## opcode`
  - `## Claudia`
  - `## NanoClaw`
  - `## Industry guidance`
  - `## Cherry-pick order`

For each source system, include concise bullets for:

- Before writing, perform this read-only scan and record the exact inputs in `docs/plans/wednesdayai-mobile-init/decisions-ledger.md`:
  - `apps/mobile/AGENTS.md`
  - `apps/mobile/package.json`
  - `apps/mobile/src/services/gateway-backends.ts`
  - `docs/mobile/android-build.md`
  - `docs/mobile/ios-app-store-release.md`
  - `docs/relay/ARCHITECTURE.md`
  - `/Users/david/Code/reference/agents/openclaw/apps/android/README.md`
  - `/Users/david/Code/reference/agents/openclaw/apps/ios/README.md`
  - `/Users/david/Code/reference/agents/openclaw/apps/macos/README.md`
  - `/Users/david/Code/WednesdayAI-core/docs/brand/BRAND-GUIDELINES.md`
  - `/Users/david/Code/WednesdayAI-core/apps/android/README.md`
  - `/Users/david/Code/WednesdayAI-core/apps/ios/README.md`
  - `/Users/david/Code/WednesdayAI-core/apps/macos/README.md`
  - `/Users/david/Code/Saturday/apps/README.md`
  - `/Users/david/Code/Saturday/apps/gateway/README.md`
  - `/Users/david/Code/reference/agents/hermes-agent/apps/desktop/README.md`
  - `/Users/david/Code/reference/agents/argentos-core/apps/ios/README.md`
  - `/Users/david/Code/reference/agents/opcode`
  - `/Users/david/Code/reference/agents/claudia`
  - `/Users/david/Code/reference/agents/nanoclaw`
- what it does well;
- what to borrow;
- what to avoid or treat as reference-only;
- where it belongs in the implementation order.

The document must include the following implementation-order conclusion:

1. Clawket app shell and release infrastructure first.
2. WednesdayAI brand and backend identity second.
3. Direct management and diagnostics third.
4. Voice-first companion loop fourth.
5. Plugin/skill mobile affordance contract fifth.
6. Native OS capability modules and polish after the core loop is stable.
The document must use WednesdayAI naming, `wednesdayai` code identifiers where appropriate, Australian English, direct tone, OpenClaw heritage acknowledgement, and no upstream disparagement.

## Allowed moves
- Create only `docs/architecture/reference-systems.md`.
- Read the listed sibling/reference docs/directories but do not list or modify them as task-owned files; they are read-only inputs, not write-scope entries.
- Do not edit `ROADMAP.md`; if this document exposes a roadmap contradiction, stop and record it.

## STOP triggers
- `docs/architecture/reference-systems.md` already exists before the task starts.
- The task would require copying large passages from external projects.
- A source-system claim cannot be grounded in the spec or local reference scan.

## Manual verification (record in decisions-ledger)
- `test -f docs/architecture/reference-systems.md` exits 0.
- `rg -n "Clawket|Upstream OpenClaw|WednesdayAI-core|Saturday apps|Hermes Desktop|ArgentOS|opcode|Claudia|NanoClaw|Industry guidance|Cherry-pick order|WednesdayAI|wednesdayai|Hard fork of OpenClaw" docs/architecture/reference-systems.md` returns matches.
- Record in the decisions ledger the exact local files/directories scanned for each source-system claim.
- Read the cherry-pick order and confirm it matches `ROADMAP.md`.
- Read the document and confirm it uses Australian English, direct tone, and no upstream disparagement.

## Done when
`WAI_TYPECHECK_CMD=":" WAI_TEST_CMD=":" bash ~/.claude/wai/scripts/task-gate.sh wednesdayai-mobile-init 008` exits 0 after the manual verification checks above are recorded in `docs/plans/wednesdayai-mobile-init/decisions-ledger.md`.
