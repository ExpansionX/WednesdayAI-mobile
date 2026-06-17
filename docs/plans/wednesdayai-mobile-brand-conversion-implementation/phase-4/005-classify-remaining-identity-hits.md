---
id: "005"
phase: 4
title: Classify remaining identity hits
status: ready
depends_on: ["004"]
parallel: false
conflicts_with: []
files:
  - docs/setup/brand-conversion-first-slice-hit-classification.md
irreversible: false
scope_test: "N/A"
allowed_change: create
covers_criteria: [SC9, SC10, SC11, SC12]
---
## Failing test (write first)
N/A - evidence report creation task with manual verification.

## Change
- **File:** `docs/setup/brand-conversion-first-slice-hit-classification.md`
- **Anchor:** new file; `test ! -e docs/setup/brand-conversion-first-slice-hit-classification.md` should be true before this task starts.
- **Before:** File does not exist.
- **After:** Create the file with these sections:
```markdown
# Brand Conversion First Slice Hit Classification

## Scope

## Commands run

## README paired-change check

## App config safe-copy check

## Backend descriptor check

## Remaining hit classifications

### Converted in this slice

### Compatibility or attribution

### Current package, command, path, persisted data, or release boundary

### Pending confirmation

## Confirmation points not chosen

## External repository boundary
```

The report must include the exact commands and summarized results for:

```bash
git diff --name-only
git diff --name-only | tr '\n' '\0' | xargs -0 rg -n "Clawket|OpenClaw|Hermes|YouMind|clawket|openclaw|hermes|youmind"
git diff --name-only | tr '\n' '\0' | xargs -0 rg -n "GatewayTransportKind|GatewayMode|isGatewayTransportKind|wednesdayai"
```

The `rg` scans must cover every implementation file changed by tasks 000-004, including README files, `apps/mobile/app.json`, backend type/descriptor/test files, `useAppBootstrap`, `ConfigScreenLayout`, all six touched config locale files, and every explicit-dispatch call site.

The report must state:

- Task 000 recorded confirmation-bound surfaces before edits began.
- `README.md` and `README.zh-CN.md` changed together.
- `apps/mobile/app.json` changed only `expo.name` and permission copy; confirmation-bound IDs stayed unchanged.
- `wednesdayai` was added as backend identity only, not transport identity.
- OpenClaw, Hermes, and retained YouMind compatibility remain explicit.
- Final native IDs, app groups, Expo owner/project, public npm scope, public CLI name, relay domains, worker names, hosted docs/support/legal URLs, store metadata, and YouMind disposition remain unchosen confirmation points.
- No external OpenClaw, Hermes, or WednesdayAI-core path appears in `git diff --name-only`.

## Allowed moves
- Create only `docs/setup/brand-conversion-first-slice-hit-classification.md`.
- Do not edit README files, app config, source code, tests, package metadata, release config, native IDs, relay config, or external repositories in this task.
- Record verification facts from the already-completed prior tasks; do not change implementation to make the report easier to write.

## STOP triggers
- `docs/setup/brand-conversion-first-slice-hit-classification.md` already exists.
- A remaining hit cannot be classified into one of the report categories.
- The diff contains an external repository path or a confirmation-bound identifier/package/relay change.
- The report would need to decide final native IDs, public package names, relay domains, store metadata, or YouMind disposition.

## Manual verification (record in decisions-ledger)
- `test -f docs/setup/brand-conversion-first-slice-hit-classification.md` exits 0.
- `rg -n "README paired-change check|App config safe-copy check|Backend descriptor check|Pending confirmation|External repository boundary" docs/setup/brand-conversion-first-slice-hit-classification.md` returns matches.
- `git diff --name-only` contains only files inside this repository.

## Done when
`WAI_TYPECHECK_CMD=":" WAI_TEST_CMD=":" bash ~/.claude/wai/scripts/task-gate.sh wednesdayai-mobile-brand-conversion-implementation 005` exits 0 after the manual verification checks above are recorded in `docs/plans/wednesdayai-mobile-brand-conversion-implementation/decisions-ledger.md`.
