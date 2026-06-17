---
id: "003"
phase: 2
title: Plan repository metadata and package naming
status: ready
depends_on: ["002"]
parallel: false
conflicts_with: []
files:
  - docs/setup/repository-metadata-package-naming-plan.md
irreversible: false
scope_test: "N/A"
allowed_change: create
covers_criteria: [SC3, SC4, SC10]
---
## Failing test (write first)
N/A - documentation creation task.

## Change
- **File:** `docs/setup/repository-metadata-package-naming-plan.md`
- **Anchor:** New file; `test ! -e docs/setup/repository-metadata-package-naming-plan.md` should be true before this task starts.
- **Before:** File does not exist.
- **After:** Create `docs/setup/repository-metadata-package-naming-plan.md` with these sections:
  - `# Repository Metadata and Package Naming Plan`
  - `## Inputs`
  - `## README and documentation links`
  - `## Root package metadata`
  - `## Private workspace package names`
  - `## Publishable package and CLI names`
  - `## Package-lock impact`
  - `## Verification`
  - `## Confirmation points`

The plan must state:

- Any `README.md` change requires the same change in `README.zh-CN.md`.
- Root package and private mobile workspace naming can be planned separately from publishable CLI names.
- `package-lock.json` must be included in any future package metadata implementation task if npm rewrites workspace package names.
- Public npm scope, CLI package name, and CLI binary name are confirmation points, not assumptions.
- Docs links should point at WednesdayAI Mobile destinations while preserving Clawket/OpenClaw attribution where relevant.

## Allowed moves
- Create only `docs/setup/repository-metadata-package-naming-plan.md`.
- Do not edit `README.md`, `README.zh-CN.md`, package files, lockfiles, source code, app config, or external repositories.

## STOP triggers
- `docs/setup/repository-metadata-package-naming-plan.md` already exists before the task starts.
- The plan would choose a final public npm package scope or CLI binary name.
- The plan omits `README.zh-CN.md` from the README documentation rule.
- The plan omits package-lock impact.

## Manual verification (record in decisions-ledger)
- `test -f docs/setup/repository-metadata-package-naming-plan.md` exits 0.
- `rg -n "README\\.zh-CN\\.md|package-lock\\.json|public npm|CLI binary|confirmation|WednesdayAI Mobile" docs/setup/repository-metadata-package-naming-plan.md` returns matches.

## Done when
`WAI_TYPECHECK_CMD=":" WAI_TEST_CMD=":" bash ~/.claude/wai/scripts/task-gate.sh wednesdayai-mobile-repo-setup-brand-conversion 003` exits 0 after the manual verification checks above are recorded in `docs/plans/wednesdayai-mobile-repo-setup-brand-conversion/decisions-ledger.md`.
