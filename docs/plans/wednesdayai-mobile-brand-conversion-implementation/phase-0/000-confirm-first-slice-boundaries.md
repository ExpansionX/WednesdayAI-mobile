---
id: "000"
phase: 0
title: Confirm first-slice boundaries before edits
status: ready
depends_on: []
parallel: false
conflicts_with: []
files:
  - docs/setup/brand-conversion-first-slice-confirmation-points.md
irreversible: false
scope_test: "N/A"
allowed_change: create
covers_criteria: [SC10]
---
## Failing test (write first)
N/A - confirmation-boundary documentation task.

## Change
- **File:** `docs/setup/brand-conversion-first-slice-confirmation-points.md`
- **Anchor:** new file; `test ! -e docs/setup/brand-conversion-first-slice-confirmation-points.md` should be true before this task starts.
- **Before:** File does not exist.
- **After:** Create the file with these sections:
```markdown
# Brand Conversion First Slice Confirmation Points

## Scope allowed in this slice

## Confirmation-bound surfaces not chosen

## Current values that must remain unchanged

## Stop conditions for implementation tasks
```

The file must state:

- This slice may update paired README product framing, app-visible display/permission copy, and the minimal WednesdayAI backend descriptor path.
- README/repository docs use `WednesdayAI Mobile`; app config display and permission copy use the shorter OS-facing name `WednesdayAI`.
- Final iOS bundle ID, Android package ID, share extension bundle ID, app group, Expo scheme, Expo slug, Expo owner, EAS project ID, Apple team, store listing IDs, public npm scope, public CLI name, relay domains, worker names, hosted docs/support/legal URLs, store metadata, and YouMind disposition are not chosen.
- Current confirmation-bound values such as `com.expansionx.clawket`, `group.com.expansionx.clawket`, `clawket`, `p697`, `972e845f-da81-44db-a908-24be4ca80288`, `@p697/clawket`, `clawket pair`, and Clawket relay names must remain unchanged unless a later human-confirmed migration says otherwise.

## Allowed moves
- Create only `docs/setup/brand-conversion-first-slice-confirmation-points.md`.
- Do not edit README files, app config, source code, package metadata, release config, relay config, or external repositories.

## STOP triggers
- The confirmation document chooses a final native ID, package name, public CLI name, relay/domain value, hosted URL, store metadata value, or YouMind disposition.
- The document omits the naming rule: README/docs use `WednesdayAI Mobile`; app config display/permission copy uses `WednesdayAI`.

## Manual verification (record in decisions-ledger)
- `test -f docs/setup/brand-conversion-first-slice-confirmation-points.md` exits 0.
- `rg -n "WednesdayAI Mobile|WednesdayAI|com\\.expansionx\\.clawket|@p697/clawket|clawket pair|YouMind disposition|not chosen" docs/setup/brand-conversion-first-slice-confirmation-points.md` returns matches.

## Done when
`WAI_TYPECHECK_CMD=":" WAI_TEST_CMD=":" bash ~/.claude/wai/scripts/task-gate.sh wednesdayai-mobile-brand-conversion-implementation 000` exits 0 after the manual verification checks above are recorded in `docs/plans/wednesdayai-mobile-brand-conversion-implementation/decisions-ledger.md`.
