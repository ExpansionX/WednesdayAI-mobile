---
id: "005"
phase: 2
title: Inventory native IDs and CI release boundaries
status: passed
depends_on: ["002"]
parallel: false
conflicts_with: []
files:
  - docs/setup/native-ids-ci-release-boundaries.md
irreversible: false
scope_test: "N/A"
allowed_change: create
covers_criteria: [SC6, SC7, SC10]
---
## Failing test (write first)
N/A - documentation creation task.

## Change
- **File:** `docs/setup/native-ids-ci-release-boundaries.md`
- **Anchor:** New file; `test ! -e docs/setup/native-ids-ci-release-boundaries.md` should be true before this task starts.
- **Before:** File does not exist.
- **After:** Create `docs/setup/native-ids-ci-release-boundaries.md` with these sections:
  - `# Native ID and CI/Release Boundary Inventory`
  - `## Current native identifiers`
  - `## Expo and EAS identifiers`
  - `## Signing and app groups`
  - `## CI state`
  - `## Release scripts`
  - `## Relay deploy units`
  - `## Bridge publish path`
  - `## Secrets and placeholders`
  - `## Confirmation points`
  - `## Verification`

The document must record current values or absence from:

```bash
rg -n "bundleIdentifier|package|scheme|owner|projectId|appleTeamId|application-groups|com\\.expansionx\\.clawket" apps/mobile/app.json apps/mobile/app.config.js apps/mobile/eas.json
find . -maxdepth 3 -type f \( -name '*workflow*' -o -name '*.yml' -o -name '*.yaml' \) -print | sort
find . -maxdepth 3 -type f \( -name 'wrangler.toml' -o -name '.env.example' -o -name 'Dockerfile' \) -print | sort
rg -n "config:check|build:android|archive:macos|export:macos|publish:dry-run|verify-package|wrangler|deploy" package.json apps/mobile/package.json apps/bridge-cli/package.json
```

The document must explicitly state that final production native identifiers, EAS ownership/project values, app groups, Apple team IDs, store identifiers, signing credentials, and public package publish names need human confirmation.

## Allowed moves
- Create only `docs/setup/native-ids-ci-release-boundaries.md`.
- Do not edit app config, EAS config, package files, release scripts, signing files, CI workflows, wrangler configs, or external repositories.

## STOP triggers
- `docs/setup/native-ids-ci-release-boundaries.md` already exists before the task starts.
- The document chooses replacement production IDs instead of inventorying current IDs.
- The document omits the absence or presence of `.github` workflows.
- The document omits bridge publish or relay deploy boundaries.

## Manual verification (record in decisions-ledger)
- `test -f docs/setup/native-ids-ci-release-boundaries.md` exits 0.
- `rg -n "bundleIdentifier|Android|EAS|appleTeamId|CI|wrangler|publish|confirmation" docs/setup/native-ids-ci-release-boundaries.md` returns matches.

## Done when
`WAI_TYPECHECK_CMD=":" WAI_TEST_CMD=":" bash ~/.claude/wai/scripts/task-gate.sh wednesdayai-mobile-repo-setup-brand-conversion 005` exits 0 after the manual verification checks above are recorded in `docs/plans/wednesdayai-mobile-repo-setup-brand-conversion/decisions-ledger.md`.
