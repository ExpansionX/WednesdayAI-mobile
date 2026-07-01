I could not write the report file because the workspace is mounted read-only and the write was rejected by the sandbox. I did not modify repository state.

Report content for `.agents/reports/2026-06-29-R3-codex-reviews-opencode.md`:

```md
## REVIEW-1: `fetchUsage` null-response test pins all 7 returned fields
**Verdict**: PARTIAL-DEFEAT
**Confidence**: High

### Reasoning:
Harmless, but overclaims. `fetchUsage` returns seven explicit fields at `apps/mobile/src/services/gateway-backend-operations.ts:209-217`, and the existing non-null test already pins all seven at `apps/mobile/src/services/gateway-backend-operations.test.ts:213-232`. Adding `toBeUndefined()` checks does not prove keys exist; omitted properties also read as `undefined`. OpenCode admits this at `.agents/reports/2026-06-29-R2-opencode-remediation-proposals.md:41-43`. Needs `toEqual({ ... undefined })` or `toHaveProperty`.

## REVIEW-2: `fetchCostSummary` null-response test pins all 5 returned fields
**Verdict**: PARTIAL-DEFEAT
**Confidence**: High

### Reasoning:
Same defect. Implementation returns five explicit fields at `gateway-backend-operations.ts:227-233`, and the existing defined-value test covers all five at `gateway-backend-operations.test.ts:256-271`. Extra `toBeUndefined()` checks still pass if fields are omitted. Documentation improvement, not shape enforcement.

## REVIEW-3: `deriveBaseUrl` catch path rejects host-less or bracket-invalid strings
**Verdict**: DEFEATED
**Confidence**: High

### Reasoning:
The regex validator is an incomplete URL parser. The fallback path is at `gateway-backend-operations.ts:287-305`. OpenCode’s `host.startsWith('[')` check only rejects one malformed bracket case, but still accepts malformed authorities like `http://example.com:abc` or illegal host characters. Its own claim that `http://[::1]:8080` passes is false: `[::1]:8080` fails `/^\[[0-9a-fA-F:]+\]$/` because of the port. Use `new URL(stripped)` validation instead of partial regex parsing.

## REVIEW-4: Replace shallow-spread identity tests with method-reference divergence anchors
**Verdict**: PARTIAL-DEFEAT
**Confidence**: Medium

### Reasoning:
Useful direction, too narrow. WednesdayAI/YouMind shallow-spread OpenClaw at `gateway-backend-operations.ts:267-277`, but R2 checks only `getCurrentModelState` and `getBaseUrl`. The interface has many methods at `gateway-backend-operations.ts:78-97`; accidental overrides of `fetchUsage`, `setAgentFile`, etc. would not be caught. Also R2 incorrectly says Hermes inherits `getBaseUrl`; Hermes defines its own closure at `gateway-backend-operations.ts:245-264`.

## REVIEW-5: Pin OpenClaw-compatible `getModelSelectionState` dispatch contract
**Verdict**: SURVIVES
**Confidence**: High

### Reasoning:
Correct. Shared `getModelSelectionState` dispatches `model.get` at `gateway-backend-operations.ts:125-135`. Current tests only cover Hermes at `gateway-backend-operations.test.ts:161-170`. Adding explicit OpenClaw/WednesdayAI/YouMind tests is duplicate but valid during backend coexistence.

## REVIEW-6: Add dispatch tests for the 7 untested RPC methods
**Verdict**: PARTIAL-DEFEAT
**Confidence**: Medium

### Reasoning:
Most proposed param shapes match implementation lines `100-198`. The issue is the coverage claim. R2 says `setAgentFiles`, but the implementation is singular `setAgentFile`. More importantly, testing only OpenClaw relies on R4 to prove sharing, but R4 does not assert references for these seven methods. A future Hermes override of `fetchToolsCatalog` or `setAgentFile` could pass R6 and escape R4. Parameterize across backends or make R4 iterate all operation methods.

## REVIEW-7: Correct the retry-set label in the diff summary
**Verdict**: SURVIVES
**Confidence**: High

### Reasoning:
Correct and harmless. The existing source comment already labels `HERMES_BRIDGE_RETRY_METHODS` as idempotent reads and warns against mutating retries at `gateway.ts:151-166`. Adding “NOT an event whitelist” is redundant but safe.

## REVIEW-8: Add `sessions.usage` and `usage.cost` to `shouldTraceRequest`
**Verdict**: PARTIAL-DEFEAT
**Confidence**: Medium

### Reasoning:
The mechanics are true: retry set includes these methods at `gateway.ts:155-166`, while `shouldTraceRequest` omits them at `gateway.ts:2754-2768`; tracing is applied in `sendRequest` at `gateway.ts:1765-1778`. But R2 conflates retry eligibility with trace eligibility. Retry eligibility is Hermes relay-specific at `gateway.ts:1383-1387`; `shouldTraceRequest` affects all backends/routes. If the goal is diagnosing Hermes retry storms, tracing retry attempts/errors in `sendRequestWithHermesBridgeRetry` is more precise. Generic tracing may be acceptable, but the rationale is under-proven.

## REVIEW-9: Cover `getAgentFile` across all four backends
**Verdict**: SURVIVES
**Confidence**: High

### Reasoning:
Valid. `getAgentFile` dispatches `agents.files.get`, throws `File not found` when missing, and returns the file payload at `gateway-backend-operations.ts:186-194`. Existing tests cover only OpenClaw at `gateway-backend-operations.test.ts:174-187`. Parameterizing across all four backend kinds is repetitive but correctly protects future backend-specific overrides.
```

