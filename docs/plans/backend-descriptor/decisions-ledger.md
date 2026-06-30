# Decisions Ledger: backend-descriptor

The executor appends dated rows here when a task requires a choice not already locked by the spec or task file.

| id | task | decision | rationale |
|----|------|----------|-----------|
| D0 | decompose | `agent-avatar.test.ts` is not a pattern sibling for `gateway-backend-operations.test.ts`. | `agent-avatar.test.ts` uses `jest.mock` to intercept native Expo modules (`expo-image-picker`). `gateway-backend-operations.ts` is a pure function module with no external dependencies or native calls; no mock setup is needed. The structural divergence (no `jest.mock` block) is correct and intentional. |
| D1 | decompose | YouMind retained as a named compatibility descriptor. | YouMind is already present in `GatewayBackendKind`, `BACKENDS`, `YOUMIND_CAPABILITIES`, and `selectByBackend`. The Phase 2 decomposition treats this as "retain-as-compatibility" without a code change, consistent with the prior D17 decision in the wednesdayai-mobile-init ledger. A scoped removal task should be created when YouMind saved-config telemetry warrants it. |
| D2 | decompose | `WEDNESDAYAI_OPERATIONS` is not exported from `gateway-backend-operations.ts`. | The public surface is `getGatewayBackendOperations`; exposing the constant would let callers bypass the dispatch and couple to the internal object. The reference-inequality test (task 001/002) proves distinctness by calling through the public function, not by comparing exported constants. |
| D3 | 001 execute | Pre-existing typecheck errors (WebView/BlurView component types in App.tsx, CanvasSheet.tsx, etc.) were present before this task; our new test file introduced zero new errors. `../../node_modules/.bin/tsc --noEmit 2>&1 \| grep gateway-backend-operations` returns nothing. | Jest version uses `--testPathPatterns` (plural) not `--testPathPattern`; gate command updated accordingly. |
| D4 | 001 execute | Expected test failure recorded: `returns a WednesdayAI-specific operations object distinct from the OpenClaw operations` FAILS because both wednesdayai and openclaw currently return the same `OPENCLAW_OPERATIONS` reference. This is the TDD driver for task 002. 3/4 tests pass. | Per task 001 "Done when" section — this failure is intentional and acceptable at this stage. |

## Reachability gate

**change_kind:** behaviour — gate is mandatory.

**(a) Call-path trace:**
Production entry point: `GatewayClient.getBackendOperations()` at `apps/mobile/src/services/gateway.ts:1352`.
Path: `getBackendOperations()` → `getGatewayBackendOperations(this.config)` at `gateway.ts:1353` → `gateway-backend-operations.ts:252`.
For a config with `backendKind: 'wednesdayai'`, `resolveGatewayBackendKind(config)` (called at line 253) returns `'wednesdayai'`.
Dispatch hits `if (kind === 'wednesdayai') return WEDNESDAYAI_OPERATIONS;` at `gateway-backend-operations.ts:255`.
`WEDNESDAYAI_OPERATIONS` (line 248-250) is returned — a distinct object from `OPENCLAW_OPERATIONS`.
`getBackendOperations()` is consumed at `gateway.ts:414,734,766,775,814,1011,1016,1021,1234` and more — the changed dispatch is on every production request path for WednesdayAI configs.

**(b) Real-seam test:**
`gateway-backend-operations.test.ts` calls `getGatewayBackendOperations` directly — this IS the function that `gateway.ts:1353` calls in production. It is not a mock of the inner function; it is the exact public API. The test exercises the dispatch at the same seam production code hits. Passes.

**(c) Incident-symptom assertion:**
`change_kind: behaviour` (not bugfix); no prior incident. The behaviour being added is: WednesdayAI configs get an explicit named operations object rather than silently sharing the OpenClaw reference. The test `expect(wednesdayaiOps).not.toBe(openclawOps)` directly asserts the symptom-of-absence (reference shared) no longer exists. Passes.

## Post-review known issues

Non-actionable findings adjudicated during the `/wai:close` pre-graduation code-review loop (round 1, 2026-06-30). These are logged here so future review rounds do not re-surface them as fresh blockers.

| id | file:line | severity | finding | why non-actionable |
|----|-----------|----------|---------|-------------------|
| KI-1 | `gateway-backend-operations.test.ts:373` | low | `fetchUsage` dispatch assertion omits `limit: 500` and `includeContextWeight: false` from `expect.objectContaining` | Deferred — date params are the user-visible contract; internal pagination params are implementation details. Not introduced by this diff. |
| KI-2 | `gateway-backend-operations.test.ts` (multiple) | low | Null-response paths untested for `setModelSelection`, `fetchToolsCatalog`, `getCurrentModelState`, `getModelSelectionState` | Pre-existing gap consistent across many other methods; fallback shapes are trivially safe. Not introduced by this diff. |
| KI-3 | `gateway.test.ts:2226` | low | `getAgentFile('plan.md', 'main')` passes explicit default `'main'` agentId — redundant | Cosmetic; argument is correct. Explicit default makes the test intent self-documenting. Not introduced by this diff. |
