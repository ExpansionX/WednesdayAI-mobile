# Adversarial Review Round 1

Topic: `wednesdayai-mobile-brand-conversion-implementation`

Branch reviewed: `codex/add-wednesdayai-mobile-slice`

Initial reviewed range: `815ced695372837012db7f8bc4a9394c6bcad276..7d6cdff47bd9ec7725c9fdc4db6745281f4db667`

## Review environment

The adversarial-review skill asks for cross-family challengers. In this Codex app session, no separate Opus or Gemini bridge tool was exposed, so three independent Codex subagents reviewed the pushed branch diff.

The push gate passed before dispatch: the branch had an upstream, `git rev-list --left-right --count @{u}...HEAD` returned `0 0`, and there were no unpushed commits.

## Challenger verdicts

### Challenger A

Verdict: `REVISE`

Accepted findings:

- OpenClaw-compatible QR parsing and relay claim paths could erase an explicit `wednesdayai` backend identity by falling back to OpenClaw.
- The manual config editor only offered OpenClaw and Hermes for new configs and only preserved token/password credentials for OpenClaw.
- WednesdayAI inherited Nodes capability but its documentation source could not resolve the Nodes docs page.
- The identity hit classification report overclaimed exhaustive direct-consumer coverage.

### Challenger B

Verdict: `REVISE`

Accepted findings:

- OpenClaw-compatible QR and relay claim ingress lost `backendKind: 'wednesdayai'`.
- Editing a saved WednesdayAI direct config could strip OpenClaw-compatible auth credentials.
- Task 003 and task 004 still named the full mobile typecheck in `Done when` despite the recorded pre-existing baseline failure.

### Challenger C

Verdict: `APPROVE`

No blocking findings. The reviewer noted the implementation stayed inside the intended first-slice boundary.

## Remediation

Accepted fixes:

- `parseQRPayload` now preserves explicit backend identity from `backendKind`, `backend`, or compact `b` fields for OpenClaw-compatible relay/local payloads.
- The `openclaw://connect` URL parser now preserves explicit backend identity from `backendKind`, `backend`, or compact `b` query parameters and defaults relay payloads to OpenClaw only when no explicit backend is present.
- `claimRelayPairing` now resolves backend identity from the scan result and derives legacy relay mode from backend plus transport instead of hardcoding OpenClaw.
- The manual config editor includes WednesdayAI as a create/edit backend option and keeps WednesdayAI direct configs on the OpenClaw-compatible token/password auth path.
- WednesdayAI documentation descriptors keep `source: 'wednesdayai'` while allowing OpenClaw-compatible Nodes page routing.
- The classification report now says "direct consumers scoped in this first slice" and lists the remediated QR, relay claim, manual editor, and docs-link coverage.
- Task 003 and task 004 `Done when` text now matches the executed focused test gate and references the ledgered baseline typecheck exception.

## Narrow re-review

Verdict: `REVISE`, then `APPROVE`

The first narrow re-review found two remaining URL-scheme QR parser paths that still hardcoded OpenClaw for relay payloads. Both paths were fixed and covered:

- `openclaw://connect?url=...&mode=relay&backendKind=wednesdayai`
- `openclaw://connect?host=...&mode=relay&backend=wednesdayai`

The scanner integration test expectations were also updated to include the parser's explicit relay backend/transport shape. The final narrow re-review approved the current diff.

## Verification

- `npm run mobile:test -- --runInBand apps/mobile/src/screens/ConfigScreen/qrPayload.test.ts apps/mobile/src/screens/ConfigScreen/QRScannerScreen.test.ts apps/mobile/src/hooks/gatewayScanFlow.test.ts apps/mobile/src/hooks/useGatewayConfigForm.test.ts apps/mobile/src/services/gateway-doc-links.test.ts apps/mobile/src/services/gateway-backends.test.ts` passed with 6 suites and 100 tests.
- `git diff --check` passed.
- Full `npm run mobile:typecheck` remains a pre-existing native component typing baseline failure recorded in `decisions-ledger.md`; this review did not broaden scope to repair it.

## Final verdict

`APPROVE AFTER REMEDIATION`
