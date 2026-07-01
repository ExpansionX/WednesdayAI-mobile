# Code Review — Round 1

**Target:** worktree-bridge-cse_017t4jHHDgStaaKTBnmEp4gm   **Range:** `42bba1e..09b42af`   **Effort:** high

## Findings

| # | File:line | Severity | Category | Finding | Confidence | Actionable? |
|---|-----------|----------|----------|---------|-----------|-------------|
| 1 | `apps/mobile/src/services/gateway.ts:2776` | low | correctness | `shouldTraceRequest` is missing case labels for `config.get`, `tools.catalog`, and `agents.files.list`. These three methods were added to `HERMES_BRIDGE_RETRY_METHODS` in this diff; `sessions.usage` and `usage.cost` (also new in this diff) correctly got matching trace cases at line 2787-2788, but the other three did not. Result: no `req_sent` / `req_timeout` / `req_error` telemetry is emitted when these methods are retried on a stalled Hermes bridge, making bridge-stall debugging invisible for getConfig, fetchToolsCatalog, and listAgentFiles. | high | yes |
| 2 | `docs/architecture/gateway-backend-operations.md:159` | low | quality | Testing coverage bullet says "RPC dispatch for all 16 methods across all four backends." The `GatewayBackendOperations` interface has 14 callable methods plus 1 boolean property (`usesConnectHandshake`) = 15 total members. The interface table in the same doc (lines 29–44) correctly lists 15 rows. The "16" count is wrong. | high | yes |
| 3 | `docs/architecture/gateway-backend-operations.md:164` | low | quality | Admin note quotes the retry-delay constant as `` `HERMES_BRIDGE_UNAVAILABLE_RETRY_DELAYS_MS = [750ms, 750ms]` ``. The actual constant at `gateway.ts:151` is `[750, 750]` — plain numbers; the `_MS` suffix in the constant name already carries the unit. The `ms` annotations inside the brackets are not valid JavaScript and would confuse relay operators reading or copy-pasting this value. | high | yes |
| 4 | `apps/mobile/src/services/gateway-backend-operations.test.ts:237` | medium | quality | The `getAgentFile` tests across all 4 backends (lines 237–258) assert the return value and thrown error but none pin the dispatched RPC method name. A rename from `agents.files.get` to `agent.file.get` or `agents.file.get` would be entirely invisible to the test suite. All other `sharedOperations` methods have their RPC name pinned in at least the openclaw baseline. | high | yes |

## Non-actionable

| # | File:line | Severity | Category | Finding | Confidence | Why non-actionable |
|---|-----------|----------|----------|---------|-----------|---------------------|
| 5 | `apps/mobile/src/services/gateway-backend-operations.test.ts:373` | low | quality | `fetchUsage` dispatch test uses `expect.objectContaining({ startDate, endDate })` but omits `limit: 500` and `includeContextWeight: false`. Low impact — date params are the user-visible contract; the internal pagination params are implementation details. | high | deferred — low impact, pre-existing gap pattern |
| 6 | `apps/mobile/src/services/gateway-backend-operations.test.ts` | low | quality | Null-response paths untested for `setModelSelection`, `fetchToolsCatalog`, `getCurrentModelState`, `getModelSelectionState`. Not introduced by this diff — pre-existing coverage gap that applies consistently to many other methods. The fallback shapes are structurally trivial. | high | pre-existing / out-of-scope for this PR |

## Verdict: With fixes

Actionable: [1, 2, 3, 4]
