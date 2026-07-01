# Adversarial Code Review — Round 1: Issue Finding

**Target**: `gateway-backend-operations` backend capability registry diff
**Reviewer**: Sisyphus (OpenCode panelist)
**Date**: 2026-06-29
**Scope**: `apps/mobile/src/services/gateway-backend-operations.ts`, `gateway-backend-operations.test.ts`, `gateway-backends.test.ts`, `gateway.ts`

---

## ISSUE-1: `fetchUsage` null-response test omits 2 of 7 returned fields — contract gap masked

**Severity**: Medium
**Location**: `apps/mobile/src/services/gateway-backend-operations.test.ts:235-244`

**Description**: The test "fetchUsage: null response yields all fields undefined" claims to verify "all fields" are undefined on a null response, but only checks 5 of the 7 fields the implementation now explicitly spreads back (`updatedAt`, `startDate`, `endDate`, `sessions`, `aggregates`). It skips `totals` and `costPresentation`. The implementation at `gateway-backend-operations.ts:209-217` explicitly returns both `totals: result?.totals` and `costPresentation: result?.costPresentation`. The test's "all fields undefined" name overstates coverage, so a future regression that drops one of the unchecked fields from the return object would not be caught.

**Evidence**:
```ts
// test line 235-244 — claims "all fields" but checks 5/7
it('fetchUsage: null response yields all fields undefined', async () => {
  ...
  expect(result.updatedAt).toBeUndefined();
  expect(result.startDate).toBeUndefined();
  expect(result.endDate).toBeUndefined();
  expect(result.sessions).toBeUndefined();
  expect(result.aggregates).toBeUndefined();
  // MISSING: expect(result.totals).toBeUndefined();
  // MISSING: expect(result.costPresentation).toBeUndefined();
});
```
Implementation returns all 7 (`gateway-backend-operations.ts:209-217`).

**Impact**: Test name promises a contract it does not verify. A future edit that accidentally drops `totals` or `costPresentation` from the `fetchUsage` return object passes CI silently. The previous `?? {}` cast was untyped; the fix's whole point was explicit field spreading, and the test should pin every field.

---

## ISSUE-2: `fetchCostSummary` null-response test omits 2 of 5 returned fields — same contract gap

**Severity**: Medium
**Location**: `apps/mobile/src/services/gateway-backend-operations.test.ts:274-281`

**Description**: Same pattern as ISSUE-1. The test "fetchCostSummary: null response yields all fields undefined" checks only `updatedAt`, `days`, `daily` — 3 of the 5 fields the implementation returns (`gateway-backend-operations.ts:227-233` also returns `totals` and `costPresentation`). The "all fields" name is inaccurate.

**Evidence**:
```ts
it('fetchCostSummary: null response yields all fields undefined', async () => {
  ...
  expect(result.updatedAt).toBeUndefined();
  expect(result.days).toBeUndefined();
  expect(result.daily).toBeUndefined();
  // MISSING: expect(result.totals).toBeUndefined();
  // MISSING: expect(result.costPresentation).toBeUndefined();
});
```

**Impact**: Identical to ISSUE-1 — the explicit-spread fix's correctness is under-verified for `totals` and `costPresentation`. A regression dropping those fields from the return object is invisible to CI.

---

## ISSUE-3: `deriveBaseUrl` catch path returns a broken host with no hostname validation

**Severity**: Medium
**Location**: `apps/mobile/src/services/gateway-backend-operations.ts:287-305` (catch branch), test at `gateway-backend-operations.test.ts:93-100`

**Description**: The GEMINI-3 fix guards against a bare `http://` result, but the catch path still returns malformed strings that happen to start with `http://` and contain `[`. The test at line 98-100 asserts `'http://[invalid'` is a valid return value. That string is not a usable URL — `[` is not a legal host character outside IPv6 brackets, and the bracket is unclosed. The regex guard `^https?:\/\/` only checks the protocol prefix; it does not validate that a real host follows. The test pins this as expected behavior, locking in a broken return value as the contract.

**Evidence**:
```ts
// implementation catch path — only checks protocol prefix
return /^https?:\/\//.test(stripped) ? stripped : null;

// test pins a malformed URL as the expected result
it('catch path: strips query string before applying wsPathPattern (GLM52-4 regression)', () => {
  ...
  expect(ops.getBaseUrl({ url: 'ws://[invalid/v1/hermes/ws?token=abc' } as any))
    .toBe('http://[invalid');  // ← not a valid URL, but test asserts it
});
```
Verified by reproduction: `deriveBaseUrl('ws://[invalid/v1/hermes/ws?token=abc', /\/v1\/hermes\/ws\/?$/) → 'http://[invalid'`.

**Impact**: Callers of `getBaseUrl()` (avatar URL construction, `GatewayClient.getBaseUrl()`) receive a malformed string they may pass into `fetch()`/`Image` source, producing runtime errors instead of a clean `null` fallback. The guard is too weak: it catches only the bare-protocol case, not the "protocol prefix + garbage" case. The test enshrines the broken behavior as intentional.

---

## ISSUE-4: `WEDNESDAYAI_OPERATIONS` and `YOUMIND_OPERATIONS` are pure spreads with no divergence anchor — object-identity tests assert the wrong invariant

**Severity**: Low
**Location**: `apps/mobile/src/services/gateway-backend-operations.ts:267-277`; tests at `gateway-backend-operations.test.ts:31-47`

**Description**: Both `WEDNESDAYAI_OPERATIONS` and `YOUMIND_OPERATIONS` are defined as `{ ...OPENCLAW_OPERATIONS }` — a shallow spread. The test suite asserts `not.toBe(openclawOps)` (different object reference), with comments explaining this "guards reference identity only" and provides "an anchor for future divergence." But the shallow spread copies method references from `OPENCLAW_OPERATIONS` — every method on the WednesdayAI/YouMind object is the *same function instance* as OpenClaw's. The "named anchor for future divergence" comment is aspirational; there is no divergence and the object-identity test guards nothing functional. If someone later mutates `OPENCLAW_OPERATIONS.getBaseUrl` in place, all three backends change identically because they share the same function reference. The test pins object inequality while the actual behavioral contract is object equality of methods.

**Evidence**:
```ts
const WEDNESDAYAI_OPERATIONS: GatewayBackendOperations = {
  ...OPENCLAW_OPERATIONS,  // shallow spread — methods are shared references
};
const YOUMIND_OPERATIONS: GatewayBackendOperations = {
  ...OPENCLAW_OPERATIONS,
};
```
```ts
// test asserts different container object, but methods are identical references
it('returns a separate operations object instance for wednesdayai vs openclaw ...', () => {
  ...
  expect(wednesdayaiOps).not.toBe(openclawOps);
});
```

**Impact**: The test gives false confidence that WednesdayAI/YouMind are independently configurable. A developer overriding `WEDNESDAYAI_OPERATIONS.getCurrentModelState` would need to add a new method — but the test does not require or detect that. The "anchor" is a comment, not an enforced contract. Low severity because the comment is honest about this, but the test name implies stronger isolation than exists.

---

## ISSUE-5: `getModelSelectionState` for OpenClaw duplicates `model.get` dispatch with `getCurrentModelState` — no test asserts they are distinct calls

**Severity**: Low
**Location**: `apps/mobile/src/services/gateway-backend-operations.ts:116-135`

**Description**: For OpenClaw/WednesdayAI/YouMind, both `getCurrentModelState` and `getModelSelectionState` dispatch `model.get`. This is intentional (OpenClaw's `model.get` returns both lightweight and full state), but the test suite only verifies `getCurrentModelState` dispatches `model.get` for openclaw/wednesdayai/youmind. There is no test asserting `getModelSelectionState` dispatches `model.get` for OpenClaw or WednesdayAI or YouMind — only for Hermes (line 161-171). The OpenClaw-compatible `getModelSelectionState` dispatch contract is untested.

**Evidence**:
```ts
// Both dispatch model.get for OpenClaw:
async getCurrentModelState(...) { const result = await request<...>('model.get', {}); ... }
async getModelSelectionState(...) { const result = await request<...>('model.get', {}); ... }
```
Test file: only Hermes has a `getModelSelectionState` dispatch test (line 161). No openclaw/wednesdayai/youmind `getModelSelectionState` dispatch test exists.

**Impact**: If someone refactors OpenClaw `getModelSelectionState` to dispatch a different RPC (e.g. `models.state`), no test catches the regression. The Hermes test pins its dispatch, but the OpenClaw-compatible baseline is unverified.

---

## ISSUE-6: No test coverage for `listModels`, `getConfig`, `patchConfig`, `setConfig`, `fetchToolsCatalog`, `listAgentFiles`, `setAgentFile` dispatch

**Severity**: Medium
**Location**: `apps/mobile/src/services/gateway-backend-operations.test.ts` (entire file)

**Description**: The new 283-line test file covers `usesConnectHandshake`, object identity, `getBaseUrl`, `getCurrentModelState`/`getModelSelectionState`/`setModelSelection` dispatch (partially), `getAgentFile`, `fetchUsage`, `fetchCostSummary`. It does NOT cover the dispatch contracts for 7 of the 16 `GatewayBackendOperations` interface methods: `listModels` (`models.list`), `getConfig` (`config.get`), `patchConfig` (`config.patch`), `setConfig` (`config.set`), `fetchToolsCatalog` (`tools.catalog`), `listAgentFiles` (`agents.files.list`), `setAgentFile` (`agents.files.set`). The prompt summary claims the file covers "RPC dispatch" — but only 4 of the 11 RPC methods are dispatch-tested. `getAgentFile` is tested for its error path and success path, but `listAgentFiles` and `setAgentFile` are not.

**Evidence**: Grep of test file for method names:
```text
listModels | getConfig | patchConfig | setConfig | fetchToolsCatalog | listAgentFiles | setAgentFile
→ No matches found
```

The `sharedOperations` object defines all of these (`gateway-backend-operations.ts:100-198`), and `YOUMIND_CAPABILITIES` gates some of them off (`configRead: false`, `configWrite: false`), but the operations layer itself has no dispatch test pinning the RPC names.

**Impact**: A refactor that changes `config.get` to `config.read` or `agents.files.list` to `agent.files.list` passes CI. The capability registry's RPC-name contract is unverified for the majority of its surface. This is the core risk the test file was supposed to mitigate.

---

## ISSUE-7: `HERMES_BRIDGE_RETRY_METHODS` whitelist addition is mislabeled in the prompt as "non-request event whitelist"

**Severity**: Low (documentation/contract clarity)
**Location**: `apps/mobile/src/services/gateway.ts:155-166`

**Description**: The implementation summary says `model.get`, `sessions.usage`, `usage.cost` were added to "the non-request event whitelist." The actual set is `HERMES_BRIDGE_RETRY_METHODS` — a retry-eligibility list for idempotent Hermes relay reads, not an event whitelist. The set's comment at line 152-154 explicitly states: "Idempotent reads only. Mutating calls (chat.send, chat.abort, etc.) must never be auto-retried." Adding `model.get` is safe (read), but `sessions.usage` and `usage.cost` are now retry-eligible. The concern: these two RPCs carry date-range params; if the bridge returns a transient `BRIDGE_UNAVAILABLE`, the retry replays the same params — which is fine — but the classification framing ("non-request event whitelist") in the diff summary is wrong and could mislead future reviewers into adding mutating methods.

**Evidence**:
```ts
// gateway.ts:152-166
// Idempotent reads only. Mutating calls (chat.send, chat.abort, etc.) must
// never be auto-retried because the bridge may have already accepted the
// first attempt and a retry would duplicate the side effect.
private static readonly HERMES_BRIDGE_RETRY_METHODS = new Set<string>([
  'sessions.list',
  'chat.history',
  'last-heartbeat',
  'models.list',
  'model.current',
  'model.get',        // ← added
  'agents.list',
  'agent.identity.get',
  'sessions.usage',   // ← added
  'usage.cost',       // ← added
]);
```

**Impact**: Low — the additions are genuinely idempotent reads, so the change is correct. But the diff summary's "non-request event whitelist" label is a mischaracterization that, if propagated into commit messages or docs, would obscure the retry-safety invariant. No functional issue, but a contract-clarity risk for future maintainers.

---

## ISSUE-8: `shouldTraceRequest` does not include the newly added `sessions.usage` and `usage.cost`

**Severity**: Low
**Location**: `apps/mobile/src/services/gateway.ts:2754-2768`

**Description**: The diff added `model.get`, `sessions.usage`, `usage.cost` to `HERMES_BRIDGE_RETRY_METHODS` (line 155-166) and added `model.get` to `shouldTraceRequest` (line 2764), but `sessions.usage` and `usage.cost` were NOT added to `shouldTraceRequest`. This is an asymmetry: the two new retry-eligible methods are retry-traced but not request-traced. `shouldTraceRequest` already includes the sibling read methods (`sessions.list`, `chat.history`, `models.list`, `model.current`), so the omission of `sessions.usage`/`usage.cost` is inconsistent — debugging a Hermes relay retry storm on usage endpoints would lack trace telemetry.

**Evidence**:
```ts
// gateway.ts:2754-2768 — shouldTraceRequest
case 'connect':
case 'sessions.list':
case 'chat.history':
case 'last-heartbeat':
case 'agents.list':
case 'agent.identity.get':
case 'models.list':
case 'model.current':
case 'model.get':       // ← added
  return true;
default:
  return false;
// NO case 'sessions.usage' or 'usage.cost'
```

**Impact**: Inconsistent observability. The retry set treats `sessions.usage`/`usage.cost` as first-class idempotent reads, but the trace set does not. A transient Hermes `BRIDGE_UNAVAILABLE` retry loop on `sessions.usage` will retry silently without `req_ok`/`req_err` telemetry. Low severity — telemetry gap, not a behavior bug.

---

## ISSUE-9: `getAgentFile` test only covers openclaw — no Hermes/YouMind/WednesdayAI path test

**Severity**: Low
**Location**: `apps/mobile/src/services/gateway-backend-operations.test.ts:174-188`

**Description**: The `getAgentFile` contract test (error path + success path) only runs against `{ backendKind: 'openclaw' }`. Since `getAgentFile` is inherited from `sharedOperations` by all backends, this is functionally fine — but the test suite's stated scope is to verify the dispatch contract per backend, and `getAgentFile` is the only `sharedOperations` method with a contract test, and it only covers one backend. Given the object-identity tests establish that each backend gets a different container object, not testing the Hermes/YouMind path leaves a gap if someone later overrides `getAgentFile` on one backend.

**Evidence**:
```ts
describe('getGatewayBackendOperations — getAgentFile contract', () => {
  it('rejects with "File not found" when RPC response has no file field', async () => {
    ...
    const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
    ...
  });
  it('resolves with the file payload when present', async () => {
    ...
    const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
    ...
  });
});
```

**Impact**: Low — `sharedOperations` is shared by construction, so the contract holds. But the test file's per-backend dispatch framing makes the omission look like a coverage gap rather than a deliberate shared-ops decision.

---

## Summary

| # | Severity | One-line |
|---|----------|----------|
| 1 | Medium | `fetchUsage` null test checks 5/7 fields — "all fields" name is wrong |
| 2 | Medium | `fetchCostSummary` null test checks 3/5 fields — same issue |
| 3 | Medium | `deriveBaseUrl` catch returns `'http://[invalid'` and test pins it as correct |
| 4 | Low | Wed/YouMind ops are shallow spreads; identity tests overstate isolation |
| 5 | Low | OpenClaw `getModelSelectionState` dispatch contract untested |
| 6 | Medium | 7 of 11 RPC methods have zero dispatch test coverage |
| 7 | Low | Diff summary mislabels retry set as "non-request event whitelist" |
| 8 | Low | `sessions.usage`/`usage.cost` added to retry set but not trace set |
| 9 | Low | `getAgentFile` contract test only covers openclaw backend |

**Confirmed issues: 9**. Issues 1, 2, 6 are the highest-value findings — they represent real contract gaps where the test file's stated coverage does not match actual coverage, and a future regression in the explicitly-spread fields or untested RPC names would pass CI silently. Issue 3 is a real behavioral gap where malformed URLs leak through the catch path.
