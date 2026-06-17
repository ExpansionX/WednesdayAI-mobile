---
id: "002"
phase: 1
title: Inventory current identity surfaces
status: passed
depends_on: ["001"]
parallel: false
conflicts_with: []
files:
  - docs/setup/identity-surface-inventory.md
irreversible: false
scope_test: "N/A"
allowed_change: create
covers_criteria: [SC2, SC9]
---
## Failing test (write first)
N/A - documentation creation task.

## Change
- **File:** `docs/setup/identity-surface-inventory.md`
- **Anchor:** New file; `test ! -e docs/setup/identity-surface-inventory.md` should be true before this task starts.
- **Before:** File does not exist.
- **After:** Create `docs/setup/identity-surface-inventory.md` with these sections:
  - `# Identity Surface Inventory`
  - `## Root package and scripts`
  - `## Mobile app configuration`
  - `## Bridge CLI package`
  - `## Relay and shared packages`
  - `## App source and UI copy`
  - `## Backend descriptors`
  - `## Documentation`
  - `## Keep as compatibility or attribution`
  - `## Convert to WednesdayAI`
  - `## Needs human confirmation`

The document must cite current file anchors from at least these scans:

```bash
rg -n "name|slug|scheme|bundleIdentifier|package|owner|projectId|Clawket|clawket|com\\.expansionx\\.clawket" apps/mobile/app.json apps/mobile/app.config.js apps/mobile/package.json apps/mobile/eas.json package.json apps/bridge-cli/package.json
rg -n "GatewayBackendKind|BACKENDS|OPENCLAW_CAPABILITIES|HERMES_CAPABILITIES|YOUMIND_CAPABILITIES|isGatewayBackendKind|selectByBackend|getGatewayModeLabel" apps/mobile/src/types/index.ts apps/mobile/src/services/gateway-backends.ts
find . -maxdepth 3 -type f \( -name '*workflow*' -o -name '*.yml' -o -name '*.yaml' \) -print | sort
find . -maxdepth 3 -type f \( -name 'wrangler.toml' -o -name '.env.example' -o -name 'Dockerfile' \) -print | sort
```

The document must distinguish:

- compatibility names that should remain for OpenClaw, Hermes, and retained YouMind flows;
- historical attribution to Clawket and OpenClaw;
- stale product identity that should become WednesdayAI;
- identifiers needing human confirmation.

## Allowed moves
- Create only `docs/setup/identity-surface-inventory.md`.
- Do not edit package metadata, source code, app config, README files, or external repositories.

## STOP triggers
- `docs/setup/identity-surface-inventory.md` already exists before the task starts.
- The scan finds a `.github` workflow path but the document does not record it.
- The inventory collapses backend identity and transport identity.
- The inventory treats all `OpenClaw` or `Hermes` strings as stale without compatibility review.

## Manual verification (record in decisions-ledger)
- `test -f docs/setup/identity-surface-inventory.md` exits 0.
- `rg -n "Root package|Mobile app configuration|Bridge CLI|Backend descriptors|Needs human confirmation|OpenClaw|Hermes|WednesdayAI" docs/setup/identity-surface-inventory.md` returns matches.
- Read the document and confirm it does not choose final production bundle/application IDs.

## Done when
`WAI_TYPECHECK_CMD=":" WAI_TEST_CMD=":" bash ~/.claude/wai/scripts/task-gate.sh wednesdayai-mobile-repo-setup-brand-conversion 002` exits 0 after the manual verification checks above are recorded in `docs/plans/wednesdayai-mobile-repo-setup-brand-conversion/decisions-ledger.md`.
