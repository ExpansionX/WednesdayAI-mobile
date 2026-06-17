# Decisions Ledger: wednesdayai-mobile-brand-conversion-implementation

The executor appends dated rows here when a task requires a choice not already locked by the spec or task file.

| id | task | decision | rationale |
|----|------|----------|-----------|
| D0 | decompose | Keep read-only planning inputs out of task `files:` lists. | Prior WAI ledgers established that `files:` is the write allow-list; reference docs are named in task bodies and verification instead. |
| D1 | decompose | Split the first behaviour-changing slice into README, app config, backend descriptor, and classification tasks. | This maps the spec's four implementation surfaces to small serial commits and prevents safe product-copy work from mixing with confirmation-bound IDs, package names, relay domains, or YouMind disposition. |
| D2 | decompose | Limit locale edits to the one required backend label key. | Task 003 touches all six `config.json` locale files only to add `WednesdayAI` for the exhaustive backend label map. Broader locale-backed product copy remains out of this first slice. |
| D3 | decompose | Make `selectByBackend` dispatch explicit for WednesdayAI. | Review found optional WednesdayAI fallback would weaken the backend identity model. Task 004 now requires call sites to provide a deliberate `wednesdayai` branch. |
| D4 | decompose | Treat `docs/setup/identity-surface-inventory.md` as a read-only sibling for task 005 rather than listing it in task `files:`. | The classification report follows the inventory/report pattern and was authored after reading the existing setup inventory, metadata, visible identity, native ID, and backend descriptor planning docs. Listing those docs in task `files:` would allow accidental edits during a create-only evidence task. |
| D5 | review | Add task 000 as a pre-edit confirmation gate. | Breakdown review found SC10 was only post-hoc in the classification report. The new task records unchosen native IDs, package names, relay domains, hosted URLs, store metadata, and YouMind disposition before implementation edits begin. |
| D6 | review | Split backend descriptor type widening from explicit backend dispatch migration. | Review found the original descriptor task was not executable inside its file scope and encoded implicit OpenClaw fallback. Task 003 now owns type/descriptor/direct exhaustive consumers; task 004 owns explicit `selectByBackend` branches at call sites. |
| D7 | review | Replace the optional WednesdayAI branch fallback decision with required explicit dispatch branches. | The architecture plan requires WednesdayAI to be a first-class backend identity. The revised task 004 requires `wednesdayai` branches so callers either choose WednesdayAI behaviour or intentionally use the OpenClaw-compatible value. |
| D8 | review | Keep `WednesdayAI Mobile` for repository/docs and `WednesdayAI` for app config display/permission copy. | Review found a possible naming ambiguity. The distinction is now recorded in task 000, plan execute notes, task 001, and task 002. |
| D9 | review | Treat `docs/setup/identity-surface-inventory.md` as a read-only sibling for task 000 rather than listing it in task `files:`. | The confirmation-points document is a create-only boundary artifact based on the already-read setup inventories. Listing those docs in task `files:` would allow accidental edits before implementation begins. |
| D10 | review | Make task 005 classify every changed file via `git diff --name-only`. | Re-review found the closeout scan was stale after task 003 and task 004 gained more files. The revised command scans the actual diff file list so new touched files cannot be skipped. |
| D11 | review | Add `buildGatewayDefaultName` coverage to task 004. | Re-review found it also consumes `GatewayBackendKind`; the revised task requires an explicit WednesdayAI assertion for relay default naming. |

## Task Verification Log

| task | command | result |
|------|---------|--------|
| 000 | `test -f docs/setup/brand-conversion-first-slice-confirmation-points.md` | exit 0 |
| 000 | `rg -n "WednesdayAI Mobile\|WednesdayAI\|com\\.expansionx\\.clawket\|@p697/clawket\|clawket pair\|YouMind disposition\|not chosen" docs/setup/brand-conversion-first-slice-confirmation-points.md` | matched the naming rule, unchanged confirmation-bound values, and unchosen surfaces |
| 001 | `git diff --name-only -- README.md README.zh-CN.md` | printed exactly `README.md` and `README.zh-CN.md` |
| 001 | `rg -n "WednesdayAI Mobile\|hard fork\|OpenClaw\|Hermes\|@p697/clawket\|clawket pair\|CLAWKET_REGISTRY_URL" README.md README.zh-CN.md` | matched new product framing and retained package, command, registry, OpenClaw, and Hermes references |
| 001 | `rg -n "Clawket\|OpenClaw\|Hermes\|YouMind" README.md README.zh-CN.md` | remaining hits classified as hard-fork attribution, OpenClaw/Hermes compatibility/setup, or current package/command/default boundary; no YouMind hits |
