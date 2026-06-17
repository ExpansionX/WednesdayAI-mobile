---
id: "004"
phase: 2
title: Plan visible product identity conversion
status: passed
depends_on: ["002"]
parallel: false
conflicts_with: []
files:
  - docs/setup/visible-product-identity-conversion-plan.md
irreversible: false
scope_test: "N/A"
allowed_change: create
covers_criteria: [SC5, SC10]
---
## Failing test (write first)
N/A - documentation creation task.

## Change
- **File:** `docs/setup/visible-product-identity-conversion-plan.md`
- **Anchor:** New file; `test ! -e docs/setup/visible-product-identity-conversion-plan.md` should be true before this task starts.
- **Before:** File does not exist.
- **After:** Create `docs/setup/visible-product-identity-conversion-plan.md` with these sections:
  - `# Visible Product Identity Conversion Plan`
  - `## Inputs`
  - `## App configuration copy`
  - `## UI and i18n boundaries`
  - `## Release/update announcements`
  - `## Analytics labels`
  - `## Compatibility labels to keep`
  - `## Verification`
  - `## Confirmation points`

The plan must state:

- Visible product identity should become WednesdayAI or WednesdayAI Mobile where the user is seeing this product.
- OpenClaw and Hermes labels remain where they identify compatibility backends or backend-specific actions.
- App UI string changes must go through `t()` and all six React Native locale files when the changed string is user-facing.
- Office game strings follow the separate Office runtime locale rules.
- Analytics names should move deliberately to WednesdayAI naming and must not send message contents, secrets, or raw URLs with tokens.
- App icons, splash assets, and store screenshots are future implementation surfaces, not part of this docs-only task.

## Allowed moves
- Create only `docs/setup/visible-product-identity-conversion-plan.md`.
- Do not edit app source, locale files, assets, app config, analytics code, release announcement code, or external repositories.

## STOP triggers
- `docs/setup/visible-product-identity-conversion-plan.md` already exists before the task starts.
- The plan suggests replacing compatibility backend labels blindly.
- The plan omits the six-locale React Native i18n rule.
- The plan chooses final store copy or final production app IDs.

## Manual verification (record in decisions-ledger)
- `test -f docs/setup/visible-product-identity-conversion-plan.md` exits 0.
- `rg -n "i18n|six|locale|OpenClaw|Hermes|compatibility|Analytics|WednesdayAI" docs/setup/visible-product-identity-conversion-plan.md` returns matches.

## Done when
`WAI_TYPECHECK_CMD=":" WAI_TEST_CMD=":" bash ~/.claude/wai/scripts/task-gate.sh wednesdayai-mobile-repo-setup-brand-conversion 004` exits 0 after the manual verification checks above are recorded in `docs/plans/wednesdayai-mobile-repo-setup-brand-conversion/decisions-ledger.md`.
