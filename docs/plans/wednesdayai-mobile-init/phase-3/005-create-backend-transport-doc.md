---
id: "005"
phase: 3
title: Document backend and transport architecture
status: passed
depends_on: ["001"]
parallel: false
conflicts_with: []
files:
  - docs/architecture/backend-transport.md
irreversible: false
scope_test: "N/A"
allowed_change: create
covers_criteria: [SC5, SC6]
---
## Failing test (write first)
N/A - documentation creation task.

## Change
- **File:** `docs/architecture/backend-transport.md`
- **Anchor:** New file under a new or existing `docs/architecture/` directory; `test ! -e docs/architecture/backend-transport.md` should be true before this task starts.
- **Before:** File does not exist.
- **After:** Create `docs/architecture/backend-transport.md` with these sections, in this order:
  - `# Backend and Transport Architecture`
  - `## Rule`
  - `## Backend identities`
  - `## Transport identities`
  - `## Capability registry`
  - `## Direct gateway management`
  - `## Optional relay and helper paths`
  - `## Compatibility with OpenClaw-derived behaviour`
  - `## Screen and service rules`
  - `## Verification expectations`

The document must state:

- Before writing, read `docs/relay/ARCHITECTURE.md`, `docs/relay/HERMES-RELAY-DESIGN.md`, `docs/bridge/architecture/cli-runtime.md`, and `docs/bridge/architecture/service-lifecycle.md`. List every transport/backend separation choice, relay/helper boundary, lifecycle guard, and diagnostics convention that affects this new doc. Record any divergence in `docs/plans/wednesdayai-mobile-init/decisions-ledger.md`.
- `wednesdayai` is the primary backend identity.
- Backend identity answers "what product/runtime is this?" and transport identity answers "how do we connect to it?"
- `local`, `relay`, `tailscale`, `cloudflare`, and `custom` are transports, not backends.
- WednesdayAI must not be implemented as another transport mode.
- Screens should consume backend capability metadata and backend operation helpers rather than scattered checks.
- Direct gateway management includes local discovery, manual URL, QR pairing, Tailscale/cloud/relay options, status, doctor, logs, reset, and service lifecycle where supported.
- Compatibility with OpenClaw-derived protocol behaviour must be explicit: retained pairing payload fields, gateway request/response semantics, relay compatibility, auth/token handling, and migration fallbacks must be named as compatibility surfaces rather than hidden assumptions.
- The document must say compatibility is preserved only where useful for WednesdayAI migration and interop; WednesdayAI remains the primary product identity.
- Use WednesdayAI naming, `wednesdayai` code identifiers where appropriate, Australian English, direct tone, OpenClaw heritage acknowledgement, and no upstream disparagement.

## Allowed moves
- Create only `docs/architecture/backend-transport.md`.
- Read the listed sibling/reference docs but do not list or modify them as task-owned files; they are read-only inputs, not write-scope entries.
- Creating the containing `docs/architecture/` directory is allowed if absent.
- Do not edit mobile source services or type definitions in this task.

## STOP triggers
- `docs/architecture/backend-transport.md` already exists before the task starts.
- The task would require changing actual backend enums, transports, or capability code.
- The wording would collapse backend identity and transport identity.

## Manual verification (record in decisions-ledger)
- `test -f docs/architecture/backend-transport.md` exits 0.
- `rg -n "wednesdayai|Backend identity|Transport identity|local|relay|tailscale|cloudflare|custom|capability|Direct gateway management|status|doctor|logs|reset|service lifecycle|OpenClaw-derived|protocol|pairing|gateway request|relay compatibility|auth|token|migration|Hard fork of OpenClaw|WednesdayAI" docs/architecture/backend-transport.md` returns matches.
- Record in the decisions ledger that the listed sibling/reference docs were read and whether any divergence was chosen.
- Read the document and confirm it does not describe WednesdayAI as a transport.
- Read the document and confirm it uses Australian English, direct tone, and no upstream disparagement.

## Done when
`WAI_TYPECHECK_CMD=":" WAI_TEST_CMD=":" bash ~/.claude/wai/scripts/task-gate.sh wednesdayai-mobile-init 005` exits 0 after the manual verification checks above are recorded in `docs/plans/wednesdayai-mobile-init/decisions-ledger.md`.
