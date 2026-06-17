---
id: "006"
phase: 3
title: Plan the minimal WednesdayAI backend descriptor
status: ready
depends_on: ["002","003","004","005"]
parallel: false
conflicts_with: []
files:
  - docs/architecture/wednesdayai-backend-descriptor-plan.md
irreversible: false
scope_test: "N/A"
allowed_change: create
covers_criteria: [SC8, SC9, SC10]
---
## Failing test (write first)
N/A - documentation creation task.

## Change
- **File:** `docs/architecture/wednesdayai-backend-descriptor-plan.md`
- **Anchor:** New file; `test ! -e docs/architecture/wednesdayai-backend-descriptor-plan.md` should be true before this task starts.
- **Before:** File does not exist.
- **After:** Create `docs/architecture/wednesdayai-backend-descriptor-plan.md` with these sections:
  - `# WednesdayAI Backend Descriptor Plan`
  - `## Current anchors`
  - `## Backend identities`
  - `## Transport identities`
  - `## Minimal descriptor`
  - `## Compatibility descriptors`
  - `## YouMind disposition`
  - `## Operation helpers`
  - `## Tests for the future code task`
  - `## STOP conditions for implementation`

The plan must cite current anchors:

```bash
rg -n "GatewayBackendKind|GatewayTransportKind|GatewayMode" apps/mobile/src/types/index.ts
rg -n "OPENCLAW_CAPABILITIES|HERMES_CAPABILITIES|YOUMIND_CAPABILITIES|BACKENDS|isGatewayBackendKind|resolveGatewayBackendKind|selectByBackend" apps/mobile/src/services/gateway-backends.ts
```

The plan must state:

- Add `wednesdayai` to backend identity, not transport identity.
- Keep transports as `local`, `relay`, `tailscale`, `cloudflare`, and `custom`.
- Keep OpenClaw and Hermes as explicit compatibility descriptors.
- Decide YouMind through a scoped compatibility/removal task instead of leaving accidental fallbacks.
- Extend capability metadata and backend operation helpers before wiring UI.
- Future tests should cover descriptor lookup, backend-kind parsing, default backend resolution, transport resolution, legacy mode compatibility, and `selectByBackend` behaviour.

## Allowed moves
- Create only `docs/architecture/wednesdayai-backend-descriptor-plan.md`.
- Do not edit `apps/mobile/src/types/index.ts`, `apps/mobile/src/services/gateway-backends.ts`, tests, UI screens, app config, or external repositories.

## STOP triggers
- `docs/architecture/wednesdayai-backend-descriptor-plan.md` already exists before the task starts.
- The plan treats `wednesdayai` as a transport mode.
- The plan removes OpenClaw or Hermes compatibility without a scoped migration.
- The plan requires changing external WednesdayAI-core, OpenClaw, or Hermes repositories.

## Manual verification (record in decisions-ledger)
- `test -f docs/architecture/wednesdayai-backend-descriptor-plan.md` exits 0.
- `rg -n "wednesdayai|Backend identities|Transport identities|OpenClaw|Hermes|YouMind|selectByBackend|GatewayTransportKind" docs/architecture/wednesdayai-backend-descriptor-plan.md` returns matches.

## Done when
`WAI_TYPECHECK_CMD=":" WAI_TEST_CMD=":" bash ~/.claude/wai/scripts/task-gate.sh wednesdayai-mobile-repo-setup-brand-conversion 006` exits 0 after the manual verification checks above are recorded in `docs/plans/wednesdayai-mobile-repo-setup-brand-conversion/decisions-ledger.md`.
