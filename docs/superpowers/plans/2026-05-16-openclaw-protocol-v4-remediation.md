# OpenClaw Protocol v4 Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update Clawket so OpenClaw operator and node connections negotiate protocol v4 or newer, follow current OpenClaw gateway handshake best practice, and surface protocol/auth failures clearly.

**Architecture:** Keep this as an OpenClaw gateway adapter update. Preserve the dual backend boundary: OpenClaw protocol constants, auth, scopes, and `hello-ok` parsing must not leak into Hermes transport logic. Relay and bridge should stay transparent unless they inspect or synthesize OpenClaw handshake frames.

**Tech Stack:** React Native + Expo + Jest in `apps/mobile`; TypeScript bridge/relay packages with Vitest where relay or bridge handshake behavior is touched.

---

## Research Findings

- Current OpenClaw source defines `PROTOCOL_VERSION = 4`, `MIN_CLIENT_PROTOCOL_VERSION = 4`, and `MIN_PROBE_PROTOCOL_VERSION = 4` in `/Users/david/Code/openclaw-dev/src/gateway/protocol/version.ts`.
- Current OpenClaw server rejects a connect range that does not include protocol 4 and returns `INVALID_REQUEST` with `details.expectedProtocol` and `details.minimumProbeProtocol`.
- Current OpenClaw docs say clients send `minProtocol` + `maxProtocol`; current clients and servers require protocol v4. The same page says clients must wait for `connect.challenge`, sign the challenge nonce, persist `hello-ok.auth.deviceToken`, reuse the approved role/scopes with stored tokens, and honor `hello-ok.policy`.
- The public GitHub docs match the refreshed local docs on protocol v4. `docs.openclaw.ai/gateway/protocol` still showed older protocol-v3 examples during research, so use the OpenClaw source tree and GitHub main docs as the authoritative v4 reference until the hosted docs mirror catches up.
- Clawket operator connection currently imports `PROTOCOL_VERSION` from `apps/mobile/src/services/gateway-shared.ts`, where it is still `3`.
- Clawket node connection has a separate hardcoded `const PROTOCOL_VERSION = 3` in `apps/mobile/src/services/node-client.ts`.
- Clawket already waits for `connect.challenge` and signs the preferred `v3` device-auth payload. Do not confuse auth payload version `v3` with gateway protocol version `4`; both are currently correct concepts.
- `apps/mobile/src/services/node-client.ts` resolves response frames from `frame.result`, but current OpenClaw protocol responses use `frame.payload`.
- `apps/mobile/src/services/gateway.ts` persists only the token string from `hello-ok.auth.deviceToken`, not the role/scopes returned with it.
- `apps/mobile/src/services/gateway.ts` always reconnects with `operator.admin`, `operator.read`, `operator.write`, and `operator.pairing`; current OpenClaw best practice says a stored device token should reconnect using the stored approved scope set for that token.

## References

- Local OpenClaw docs: `/Users/david/Code/openclaw-dev/docs/gateway/protocol.md`
- Local OpenClaw source: `/Users/david/Code/openclaw-dev/src/gateway/protocol/version.ts`
- Local OpenClaw server negotiation: `/Users/david/Code/openclaw-dev/src/gateway/server/ws-connection/message-handler.ts`
- Public current docs: https://github.com/openclaw/openclaw/blob/main/docs/gateway/protocol.md
- Public runbook: https://documentation.openclaw.ai/gateway
- Stale hosted mirror to avoid for v4 examples until refreshed: https://docs.openclaw.ai/gateway/protocol

## File Structure

- Modify `apps/mobile/src/services/gateway-shared.ts`: replace single `PROTOCOL_VERSION = 3` with exported OpenClaw protocol constants.
- Modify `apps/mobile/src/services/gateway.ts`: advertise protocol v4, persist scoped device-auth metadata, reuse approved scopes, preserve protocol/auth error details, and retry startup-sidecars responses.
- Modify `apps/mobile/src/services/node-client.ts`: use shared protocol constants, advertise protocol v4, parse `res.payload`, persist scoped auth metadata where applicable, and honor `hello-ok.policy` if node mode has a watchdog.
- Modify `apps/mobile/src/services/storage.ts`: store device token role/scopes alongside the token while retaining legacy token-string migration.
- Modify `apps/mobile/src/types/index.ts`: expand `HelloOkPayload` and gateway error detail types.
- Modify `apps/mobile/src/services/gateway.test.ts`, `node-client.test.ts`, and `storage.test.ts`: lock protocol v4 and current `hello-ok` behavior.
- Optionally modify bridge/relay tests if inspection shows they assert protocol-v3 payloads or mutate OpenClaw connect frames.

---

## Phase 1: Protocol Constants And Connect Frame Negotiation

**Files:**
- `apps/mobile/src/services/gateway-shared.ts`
- `apps/mobile/src/services/gateway.ts`
- `apps/mobile/src/services/node-client.ts`
- `apps/mobile/src/services/gateway.test.ts`
- `apps/mobile/src/services/node-client.test.ts`

- [x] Add failing tests that inspect the operator `connect` frame and assert `params.minProtocol === 4`, `params.maxProtocol === 4`, `method === "connect"`, and no pre-connect non-control OpenClaw request is sent before `connect.challenge`.
- [x] Add failing tests that inspect the node `connect` frame and assert `params.minProtocol === 4`, `params.maxProtocol === 4`, and `method === "connect"`.
- [x] Replace the shared operator protocol constant with `OPENCLAW_MIN_PROTOCOL_VERSION = 4` and `OPENCLAW_PROTOCOL_VERSION = 4`.
- [x] Remove the duplicate node-client `PROTOCOL_VERSION = 3` and import the shared OpenClaw constants instead.
- [x] Keep the auth-signature payload prefix as `v3`; do not rename it to `v4`.
- [x] Run `npm run --workspace clawket test -- gateway.test.ts node-client.test.ts --runInBand`.
- [x] Commit with `git commit -m "fix: negotiate OpenClaw protocol v4"`.

## Phase 2: Current Hello-Ok Parsing And Device Token Metadata

**Files:**
- `apps/mobile/src/services/storage.ts`
- `apps/mobile/src/types/index.ts`
- `apps/mobile/src/services/gateway.ts`
- `apps/mobile/src/services/node-client.ts`
- `apps/mobile/src/services/storage.test.ts`
- `apps/mobile/src/services/gateway.test.ts`
- `apps/mobile/src/services/node-client.test.ts`

- [x] Add a storage record type for OpenClaw device auth: `{ token: string; role: string | null; scopes: string[] | null; issuedAtMs?: number | null }`.
- [x] Add failing storage tests proving legacy SecureStore token strings still read as `{ token, role: null, scopes: null }`.
- [x] Add failing storage tests proving new metadata records are stored and read using the existing relay and direct gateway scope keys.
- [x] Expand `HelloOkPayload.auth` to include `role`, `scopes`, `issuedAtMs`, and optional legacy/custom `deviceTokens`.
- [x] In `gateway.ts`, persist the primary `hello-ok.auth.deviceToken` with returned role/scopes after successful connect.
- [x] In `node-client.ts`, parse response `payload`, not `result`, and persist the primary node token if `hello-ok.auth.deviceToken` is present.
- [x] Avoid persisting optional `hello-ok.auth.deviceTokens` entries unless the connect used bootstrap auth on a trusted transport. If this is not already modelled, leave it unimplemented and document the limitation in code comments/tests rather than storing broad tokens blindly.
- [x] Run `npm run --workspace clawket test -- storage.test.ts gateway.test.ts node-client.test.ts --runInBand`.
- [x] Commit with `git commit -m "fix: persist OpenClaw device auth metadata"`.

## Phase 3: Reconnect Scope Selection

**Files:**
- `apps/mobile/src/services/gateway.ts`
- `apps/mobile/src/services/gateway-relay.ts`
- `apps/mobile/src/services/gateway.test.ts`

- [ ] Add failing tests for relay reconnect with a stored device-auth record whose scopes are narrower than the default admin set.
- [ ] Update connect planning so an explicit shared token or explicit caller scopes remain authoritative.
- [ ] When reusing a stored device token, use the stored role/scopes returned by the gateway for that token.
- [ ] If a stored token has no metadata because it was migrated from the old string-only format, keep current default scopes for backward compatibility.
- [ ] Keep bootstrap requests bounded. Do not request `operator.admin` from bootstrap unless the product flow explicitly needs admin and OpenClaw approval rules allow it.
- [ ] Add tests for `AUTH_SCOPE_MISMATCH` so Clawket surfaces a re-pair guidance state instead of treating it as a generic bad token.
- [ ] Run `npm run --workspace clawket test -- gateway.test.ts --runInBand`.
- [ ] Commit with `git commit -m "fix: reconnect with approved OpenClaw scopes"`.

## Phase 4: Retryable Startup And Protocol/Auth Diagnostics

**Files:**
- `apps/mobile/src/services/gateway-shared.ts`
- `apps/mobile/src/services/gateway.ts`
- `apps/mobile/src/types/index.ts`
- `apps/mobile/src/services/gateway.test.ts`

- [ ] Preserve gateway error `details`, `retryAfterMs`, and `retryable` through `sendRequest` rejection paths instead of flattening them to a message-only `Error`.
- [ ] Add a typed helper for protocol mismatch details: `expectedProtocol`, `minimumProbeProtocol`.
- [ ] On protocol mismatch where `expectedProtocol > OPENCLAW_PROTOCOL_VERSION`, block reconnect and surface an upgrade-required error that includes the expected and supported protocol versions.
- [ ] On `UNAVAILABLE` with `details.reason === "startup-sidecars"` and `retryAfterMs`, retry within the existing connection budget before surfacing failure.
- [ ] Keep `PAIRING_REQUIRED` behavior retryable when details include `recommendedNextStep: "wait_then_retry"` and `retryable: true`.
- [ ] Run `npm run --workspace clawket test -- gateway.test.ts --runInBand`.
- [ ] Commit with `git commit -m "fix: handle OpenClaw v4 handshake diagnostics"`.

## Phase 5: Protocol v4 Policy And Plugin Surface Compatibility

**Files:**
- `apps/mobile/src/services/gateway.ts`
- Any canvas/plugin surface helpers discovered by `rg "canvasHostUrl|pluginSurfaceUrls|node.pluginSurface.refresh|node.canvas.capability.refresh" apps/mobile/src`
- Matching tests

- [ ] Confirm whether Clawket uses deprecated `canvasHostUrl`, `canvasCapability`, or `node.canvas.capability.refresh`.
- [ ] If Clawket does not use these deprecated fields, add a targeted regression test proving `hello-ok.pluginSurfaceUrls` does not break parsing.
- [ ] If Clawket does use deprecated canvas surface fields, switch to `hello-ok.pluginSurfaceUrls.canvas` and `node.pluginSurface.refresh`.
- [ ] Ensure `hello-ok.policy.tickIntervalMs` still drives the existing tick watchdog and add coverage for the v4 policy shape.
- [ ] Run the relevant Jest tests for gateway/canvas surfaces.
- [ ] Commit with `git commit -m "fix: align OpenClaw plugin surface handling"`.

## Phase 6: Bridge And Relay Compatibility Sweep

**Files:**
- `packages/bridge-runtime/src/protocol.ts`
- `packages/bridge-runtime/src/runtime.ts`
- `apps/relay-worker/src/relay/frames.ts`
- `packages/bridge-runtime/src/runtime.test.ts`
- `apps/relay-worker/src/index.test.ts`

- [ ] Inspect bridge and relay code for protocol-v3 assumptions or synthetic `connect.start` forwarding into OpenClaw.
- [ ] Confirm relay and bridge do not rewrite `minProtocol`/`maxProtocol`.
- [ ] Add or adjust tests so relay/bridge forward `connect.challenge` and `connect` frames transparently for OpenClaw protocol v4.
- [ ] Preserve Hermes relay behavior. Do not remove Hermes-specific `connect.start` handling if it is part of the Hermes path.
- [ ] Run `npm run bridge:test` and `npm run relay:test`.
- [ ] Commit with `git commit -m "test: preserve OpenClaw v4 relay handshake"`.

## Phase 7: End-To-End Verification

**Files:**
- No code changes expected unless verification finds issues.

- [ ] Run `npm run mobile:typecheck`.
- [ ] Run `npm run --workspace clawket test -- gateway.test.ts node-client.test.ts storage.test.ts --runInBand`.
- [ ] Run `npm run bridge:test`.
- [ ] Run `npm run relay:test`.
- [ ] Start or use a current OpenClaw gateway from `/Users/david/Code/openclaw-dev`.
- [ ] Connect Clawket through the same route that produced the protocol-mismatch log.
- [ ] Confirm OpenClaw logs show `hello-ok` negotiation with `protocol: 4` and no `protocol-mismatch`.
- [ ] Perform one operator RPC such as `health` or `status`.
- [ ] If node mode is enabled in this build, confirm a node connect can register and answer a simple invoke or presence check.
- [ ] Build for iOS with Hermes disabled if still required locally, then install to the connected device.
- [ ] Commit final verification fixes, if any.

## Risks And Guardrails

- Do not treat protocol v4 as a simple constant bump until tests prove response parsing, token persistence, scopes, and retry diagnostics still work.
- Do not rename the device-auth signature payload from `v3` to `v4`; OpenClaw currently documents preferred signature payload `v3` under gateway protocol v4.
- Do not silently fall back to protocol v3. The observed gateway rejects `maxProtocol: 3`, and current OpenClaw minimum client protocol is 4.
- Do not weaken Hermes behavior while changing shared relay/bridge frame classifiers.
- Keep README changes out unless user-facing setup or QR behavior changes.

## Success Criteria

- Operator and node connect frames advertise `minProtocol: 4` and `maxProtocol: 4`.
- Current OpenClaw gateways no longer log `protocol-mismatch` for Clawket.
- Successful `hello-ok.payload.protocol` is parsed as 4.
- Primary `hello-ok.auth.deviceToken` is stored with role/scopes.
- Stored device tokens reconnect with their approved role/scopes.
- Retryable startup-sidecar and pairing waits do not surface as terminal errors prematurely.
- Mobile unit tests, bridge tests, relay tests, and direct iOS device build/install verification pass.
