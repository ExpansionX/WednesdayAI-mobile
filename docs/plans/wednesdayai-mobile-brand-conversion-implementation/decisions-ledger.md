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
| D12 | 003 | Use OpenClaw capabilities as the first-slice WednesdayAI backend baseline. | `docs/architecture/wednesdayai-backend-descriptor-plan.md` scoped the minimal `wednesdayai` descriptor as OpenClaw-compatible until later evidence-backed capability differences are planned. |
| D13 | 003 | Do not broaden this task to fix the existing mobile typecheck baseline. | `npm run mobile:typecheck` fails at pre-task commit `e06659b` with existing `WebView`, `BlurView`, and `CameraView` JSX/nativeEvent typing errors outside task 003's file list. The focused backend descriptor test passes after this task. |
| D14 | 004 | Route WednesdayAI through OpenClaw-compatible dispatch branches explicitly for this first slice. | Task 004 required deliberate `wednesdayai` branches instead of implicit OpenClaw fallback; the values match the descriptor baseline from task 003 while keeping backend identity separate from transport identity. |
| D15 | 005 | Use execution-commit range scans in addition to the exact clean-worktree task commands. | WAI execution committed tasks 000-004 before task 005, so the exact `git diff --name-only` worktree command returned no implementation files. The report records that result and uses `git diff --name-only aec8afc..HEAD` with the same scan patterns to classify every changed implementation file. |
| D16 | review | Preserve explicit WednesdayAI backend identity in OpenClaw-compatible QR and relay claim flows. | Adversarial review found that QR parsing and relay claim fallback paths still defaulted non-Hermes relay payloads to OpenClaw, which would erase a scanned `wednesdayai` backend identity. The remediation carries `backendKind: 'wednesdayai'` through parsing, claim, transport, and legacy mode derivation while keeping relay as the transport. |
| D17 | review | Treat WednesdayAI manual configs as OpenClaw-compatible for direct auth only. | The first-slice descriptor intentionally uses OpenClaw-compatible capabilities. Manual editor auth now follows the same compatibility boundary for `wednesdayai` and `openclaw`, while Hermes remains on its separate bridge auth path and YouMind remains edit-only. |
| D18 | review | Keep OpenClaw Nodes documentation available for WednesdayAI configs while docs source remains WednesdayAI. | WednesdayAI inherits the first-slice OpenClaw Nodes capability, so the documentation resolver must keep the Nodes page reachable for `wednesdayai` configs without reclassifying their backend identity as OpenClaw. |
| D19 | review | Align task 003 and 004 `Done when` gates with the executed baseline exception. | Adversarial review found the task text still named the full mobile typecheck even though execution had recorded and accepted a pre-existing native component typing baseline. The task gates now name the focused test command plus the ledgered baseline exception. |
| D20 | review | Include URL-scheme relay QR payloads in the WednesdayAI backend identity guarantee. | Narrow re-review found the first remediation covered JSON QR payloads but not `openclaw://connect` URL forms. The URL parser now accepts `backendKind`, `backend`, or `b` and defaults relay payloads to OpenClaw only when no explicit backend is present. |

## Task Verification Log

| task | command | result |
|------|---------|--------|
| 000 | `test -f docs/setup/brand-conversion-first-slice-confirmation-points.md` | exit 0 |
| 000 | `rg -n "WednesdayAI Mobile\|WednesdayAI\|com\\.expansionx\\.clawket\|@p697/clawket\|clawket pair\|YouMind disposition\|not chosen" docs/setup/brand-conversion-first-slice-confirmation-points.md` | matched the naming rule, unchanged confirmation-bound values, and unchosen surfaces |
| 001 | `git diff --name-only -- README.md README.zh-CN.md` | printed exactly `README.md` and `README.zh-CN.md` |
| 001 | `rg -n "WednesdayAI Mobile\|hard fork\|OpenClaw\|Hermes\|@p697/clawket\|clawket pair\|CLAWKET_REGISTRY_URL" README.md README.zh-CN.md` | matched new product framing and retained package, command, registry, OpenClaw, and Hermes references |
| 001 | `rg -n "Clawket\|OpenClaw\|Hermes\|YouMind" README.md README.zh-CN.md` | remaining hits classified as hard-fork attribution, OpenClaw/Hermes compatibility/setup, or current package/command/default boundary; no YouMind hits |
| 002 | `node -e "const app=require('./apps/mobile/app.json').expo; if (app.name !== 'WednesdayAI') process.exit(1); if (app.slug !== 'clawket') process.exit(2); if (app.ios.bundleIdentifier !== 'com.expansionx.clawket') process.exit(3); if (app.android.package !== 'com.expansionx.clawket') process.exit(4); if (app.scheme !== 'clawket') process.exit(5); if (app.owner !== 'p697') process.exit(6);"` | exit 0 |
| 002 | `rg -n "Allow Clawket\|\"name\": \"Clawket\"" apps/mobile/app.json` | no matches |
| 002 | `rg -n "com\\.expansionx\\.clawket\|\"slug\": \"clawket\"\|\"scheme\": \"clawket\"\|\"owner\": \"p697\"\|972e845f-da81-44db-a908-24be4ca80288" apps/mobile/app.json` | matched unchanged native IDs, slug, scheme, owner, app group, and EAS project ID |
| 002 | `npm run mobile:config:check` | exit 0; public config check reported PostHog disabled and RevenueCat disabled |
| 003 | `npm run mobile:test -- --runInBand apps/mobile/src/services/gateway-backends.test.ts` before `npm ci` | exit 127 because `jest` was not installed in the worktree |
| 003 | `npm ci` | exit 0; installed workspace dependencies without package metadata changes |
| 003 | `npm run mobile:test -- --runInBand apps/mobile/src/services/gateway-backends.test.ts` | exit 0; 29 tests passed |
| 003 | `for f in apps/mobile/src/i18n/locales/{en,zh-Hans,ja,ko,de,es}/config.json; do node -e "..."; done` | exit 0; all six `config.json` locale files include `WednesdayAI` |
| 003 | `npm run mobile:typecheck` | exit 2 with existing native component typing errors; repeated at pre-task commit `e06659b` with the same `WebView`, `BlurView`, `CameraView`, and `WebViewMessageEvent.nativeEvent` baseline failures |
| 004 | `npm run mobile:test -- --runInBand apps/mobile/src/services/gateway-backends.test.ts` after adding failing assertions | exit 1; `selectByBackend('wednesdayai', ...)` returned `A` instead of expected `W` |
| 004 | `npm run mobile:test -- --runInBand apps/mobile/src/services/gateway-backends.test.ts` after implementation | exit 0; 32 tests passed |
| 004 | `rg -n "selectByBackend" apps/mobile/src` | only task-owned selector call sites remained and each implementation call site was updated with an explicit `wednesdayai` branch |
| 004 | `rg -n "GatewayTransportKind\|GatewayMode\|isGatewayTransportKind\|wednesdayai" ...task-004-files...` | reviewed; `wednesdayai` appears as backend identity/dispatch/test coverage only and `isGatewayTransportKind('wednesdayai')` remains false |
| 005 | `test -f docs/setup/brand-conversion-first-slice-hit-classification.md` | exit 0 |
| 005 | `rg -n "README paired-change check\|App config safe-copy check\|Backend descriptor check\|Pending confirmation\|External repository boundary" docs/setup/brand-conversion-first-slice-hit-classification.md` | matched all required report sections |
| 005 | `git diff --name-only` | no output because task 005 report was still untracked before staging; `git status --short` showed only `?? docs/setup/brand-conversion-first-slice-hit-classification.md` |
| 005 | `git diff --name-only aec8afc..HEAD` and paired `rg` scans | covered all files changed by tasks 000-004; external repository path scan returned no matches |
| review | `npm run mobile:test -- --runInBand apps/mobile/src/screens/ConfigScreen/qrPayload.test.ts apps/mobile/src/screens/ConfigScreen/QRScannerScreen.test.ts apps/mobile/src/hooks/gatewayScanFlow.test.ts apps/mobile/src/hooks/useGatewayConfigForm.test.ts apps/mobile/src/services/gateway-doc-links.test.ts apps/mobile/src/services/gateway-backends.test.ts` | exit 0; 6 suites passed, 100 tests passed |
| review | `git diff --check` | exit 0 |

## Reachability gate

### CALL-PATH TRACE

Production entry points touched by this slice:

- Expo/app config: `apps/mobile/app.json` is the production Expo config read by Expo native/build tooling. The slice changes only `expo.name` and OS permission copy there while leaving `slug`, native IDs, scheme, owner, app group, asset paths, and EAS project ID unchanged.
- Backend descriptor path: saved gateway config and UI dispatch call through the central backend descriptor helpers in `apps/mobile/src/services/gateway-backends.ts`.

Actual merged code path evidence:

- `apps/mobile/src/types/index.ts:33` defines `GatewayBackendKind = 'wednesdayai' | 'openclaw' | 'hermes' | 'youmind'`.
- `apps/mobile/src/services/gateway-backends.ts:137` declares `BACKENDS: Record<GatewayBackendKind, GatewayBackendDescriptor>`, and `apps/mobile/src/services/gateway-backends.ts:138` adds the `wednesdayai` descriptor.
- `apps/mobile/src/services/gateway-backends.ts:170` keeps backend identity in `isGatewayBackendKind`, while `apps/mobile/src/services/gateway-backends.ts:162` keeps transport identity in `isGatewayTransportKind`; `wednesdayai` is absent from the transport guard.
- `apps/mobile/src/services/gateway-backends.ts:226` requires `selectByBackend` callers to provide `wednesdayai`, and `apps/mobile/src/services/gateway-backends.ts:233` returns the explicit WednesdayAI branch.
- Real production consumers call this seam: `apps/mobile/src/screens/ConsoleScreen/ConsoleMenuScreen.tsx:1032`, `apps/mobile/src/screens/ConsoleScreen/HermesAwareCronScreens.tsx:50`, `apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx:89`, `apps/mobile/src/screens/OfficeScreen/OfficeTab.tsx:168`, `apps/mobile/src/screens/ChatScreen/hooks/chatSyncPolicy.ts:44`, `apps/mobile/src/services/storage.ts:115`, `apps/mobile/src/services/gateway-doc-links.ts:16`, and `apps/mobile/src/services/console-entry-descriptors.ts:23`.

### REAL-SEAM TEST

`npm run mobile:test -- --runInBand apps/mobile/src/services/gateway-backends.test.ts` drives the exported backend descriptor seam used by production consumers, not a private helper bypass. It passed with 32 tests after task 004.

Covered behaviours include `resolveGatewayBackendKind`, `getGatewayBackendDescriptor`, `getGatewayBackendCapabilities`, `isGatewayBackendKind`, `isGatewayTransportKind`, `selectByBackend`, `resolveGlobalMainSessionKey`, `getGatewayModeLabel`, and `buildGatewayDefaultName`.

### INCIDENT-SYMPTOM ASSERTION

The workstream symptom was product/brand conversion without broad Clawket replacement or identifier migration. Assertions and evidence now map to that symptom:

- README pair changed together and frames the repo as `WednesdayAI Mobile` first while preserving Clawket hard-fork source/history and OpenClaw heritage.
- App config display and permission copy use `WednesdayAI`; native IDs and release-bound values remain unchanged.
- `wednesdayai` is recognized as a backend identity through the central descriptor and explicit dispatch path.
- `isGatewayTransportKind('wednesdayai')` remains false, proving backend identity stayed separate from transport identity.
- Remaining Clawket/OpenClaw/Hermes/YouMind hits were classified in `docs/setup/brand-conversion-first-slice-hit-classification.md`.
