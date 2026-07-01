# T2 R1 — Adversarial Issue Finding (OpenCode panelist)

Reviewed remediation diff on `gateway.ts` + `gateway-backend-operations.ts` + `.test.ts`.
Each finding cites concrete code and verified runtime behavior. No repository state modified.

## ISSUE-1: GLM52-4 regression test no longer exercises the catch path
**Severity**: High
**[STEAL-ELIGIBLE]**
**Location**: `apps/mobile/src/services/gateway-backend-operations.test.ts:101-109`
**Description**: The test was changed from input `ws://[invalid/v1/hermes/ws?token=abc` to `ws://host.invalid/v1/hermes/ws?token=abc` with a comment claiming this "force[s] the catch path while keeping the result parseable." That claim is false. `host.invalid` is a syntactically valid hostname (RFC 3986 host production — a single label is legal); it only fails DNS resolution, which `new URL()` does not perform. Verified in Node: `new URL('http://host.invalid/v1/hermes/ws?token=abc')` **succeeds**, so the input is routed through the **try path** (`url.search = ''`), never reaching the catch path's `split('?')[0]` query-stripping logic.

The original `[invalid` input (unclosed IPv6 literal bracket) is the case that actually throws in `new URL()` and falls into the catch path. By swapping it for `host.invalid`, the remediation:
1. Stopped testing the catch path's query-stripping branch entirely.
2. The catch path is now only covered by the `ws://[invalid/...` malformed-host test (line 111-118) — which returns null, so it pins "reject malformed" but **not** "strip query then succeed." The query-stripping fix that GLM52-4 was about is no longer regression-tested.

The test still passes and still produces `http://host.invalid`, but via the wrong code path. It is a green test that does not guard the bug it claims to guard.
**Evidence**:
```ts
// test comment (line 103-105):
// Use a syntactically valid but unresolvable host to force the catch path while
// keeping the result parseable — this pins the split('?')[0] query-stripping behavior.
expect(ops.getBaseUrl({ url: 'ws://host.invalid/v1/hermes/ws?token=abc' } as any))
  .toBe('http://host.invalid');
```
Runtime: `new URL('http://host.invalid/v1/hermes/ws?token=abc').toString()` → `'http://host.invalid/v1/hermes/ws?token=abc'` (no throw) → try path runs → `url.search=''` strips query → result `http://host.invalid`. Catch path never entered.
**Impact**: A future regression that re-breaks catch-path query stripping (e.g. removing `.split('?')[0]`) will not be caught by this test. The GLM52-4 guard is effectively gone. Steal fix: use an input that genuinely throws in `new URL()` yet yields a parseable stripped result — e.g. a URL with a tab/whitespace or `%` char that throws in try but strips clean — or add a dedicated catch-path-success test that calls `deriveBaseUrl` with an input confirmed to throw in `new URL()`.
---

## ISSUE-2: `agents.files.get` added to retry set despite returning file content that can change
**Severity**: Medium
**Location**: `apps/mobile/src/services/gateway.ts:159-174` (retry set), `gateway-backend-operations.ts:186-194` (`getAgentFile`)
**Description**: The remediation added `agents.files.get` to `HERMES_BRIDGE_RETRY_METHODS` as a "read." It is a read in the sense that it does not mutate backend state, so it is safe from the duplicate-side-effect angle. However `getAgentFile` is used in edit flows (the caller fetches the current content to populate an editor, then writes it back with a baseHash / content diff). Retrying after a `[BRIDGE_UNAVAILABLE]` on a stale bridge that comes back between attempts can return a **different file content** than the first attempt would have, with no staleness signal — the operation returns the newest content silently. This is not a correctness bug for the retry itself, but it means callers doing read-then-write sequences can race against an external editor between the two attempts. The retry set comment only warns about mutating calls; it does not acknowledge this read-staleness class. Severity is medium because the window is small (750ms × 2) and limited to Hermes relay, but it is a real behavioral change introduced by the remediation.
**Evidence**:
```ts
// gateway.ts:173
'agents.files.get',
```
```ts
// gateway-backend-operations.ts:186-194
async getAgentFile(...) {
  const result = await request<{ file?: GatewayAgentFileDetail }>('agents.files.get', { agentId, name });
  if (!result?.file) throw new Error('File not found');
  return result.file;
}
```
**Impact**: A retry on `agents.files.get` can silently return newer file content than the first attempt, which a read-modify-write caller will then base its edit on without knowing the base shifted. For pure reads this is harmless; for edit-base reads it can produce a write against a newer base than the user saw.

## ISSUE-3: `tools.catalog` retry can return a different catalog on second attempt
**Severity**: Low
**Location**: `apps/mobile/src/services/gateway.ts:171`, `gateway-backend-operations.ts:176-179`
**Description**: Same class as ISSUE-2 but lower severity. `tools.catalog` is idempotent w.r.t. side effects, but the catalog can change between two attempts (a plugin installed in the 750ms gap). The retry silently returns the newer catalog. Acceptable for a UI refresh, but worth noting since the retry comment presents these as uniformly safe reads.
**Evidence**: `'tools.catalog',` in retry set; `fetchToolsCatalog` returns the raw result with no version/hash pinning.
**Impact**: Stale-catalog flicker is cosmetic; no correctness break.

## ISSUE-4: `sendBackendRequest` is now `async` but callers pass it as a `GatewayRequestFn` — type compatibility preserved, but error-stack shape changes
**Severity**: Low
**Location**: `apps/mobile/src/services/gateway.ts:1367-1369`
**Description**: `sendBackendRequest` changed from a sync arrow returning `this.sendRequest(...)` (a Promise) to an `async` arrow returning `this.sendRequestWithHermesBridgeRetry(...)`. For callers that `await` the result (all of them — see lines 745, 777, 786, 825, 1022, 1027, 1032, 1245, 1253, 1316-1340) this is transparent: `await` on a Promise-of-T vs an async-function-returning-T behaves identically. The `GatewayRequestFn` type `<T>(method, params?) => Promise<T>` is still satisfied. No double-wrapping occurs (an `async` function returning a Promise does not create Promise<Promise<T>> — `await` unwraps nested thenables).

The only observable behavioral change is in **rejection stack traces**: previously a rejection came from `sendRequest`'s internal async chain; now it flows through `sendRequestWithHermesBridgeRetry`'s `try/catch` and is **re-thrown** via `throw error` (line 1382) or `throw lastError` (line 1388). The re-thrown error preserves the original stack (good), but any error-monitoring filter that keys off the *throw site* (e.g. `Error.stack` top frame being inside `sendRequest`) may now see `sendRequestWithHermesBridgeRetry` as the top frame. This is a non-functional behavioral shift, not a bug. Flagging for completeness since the prompt asked about async-change effects.
**Evidence**:
```ts
// before (998ff8d):
private readonly sendBackendRequest = <T = unknown>(method: string, params?: object): Promise<T> => (
  this.sendRequest(method, params) as Promise<T>
);
// after:
private readonly sendBackendRequest = async <T = unknown>(method: string, params?: object): Promise<T> => (
  this.sendRequestWithHermesBridgeRetry(method, params ?? {}) as Promise<T>
);
```
```ts
// sendRequestWithHermesBridgeRetry re-throws:
catch (error) { lastError = error; if (!retryable || ... ) throw error; }
throw lastError instanceof Error ? lastError : new Error(String(lastError));
```
**Impact**: None for correctness. Possible stack-frame attribution shift in telemetry. No caller relies on the return being a non-async Promise.

## ISSUE-5: Non-Hermes backends now route through `sendRequestWithHermesBridgeRetry` for all backend operations — benign but adds a redundant `isHermesRelayBridgeRetryEligible` check per call
**Severity**: Low (informational)
**Location**: `apps/mobile/src/services/gateway.ts:1367-1395`
**Description**: The change routes **all** `sendBackendRequest` calls (OpenClaw, WednesdayAI, YouMind included) through `sendRequestWithHermesBridgeRetry`. For non-Hermes backends, `isHermesRelayBridgeRetryEligible` returns `false` immediately (`this.getBackendKind() === 'hermes'` short-circuits), `delays` becomes `[]`, and the loop runs exactly once with no retry. So behavior for non-Hermes is preserved — no mutation is retried, no extra latency. Verified the guard:
```ts
private isHermesRelayBridgeRetryEligible(method: string): boolean {
  return this.getBackendKind() === 'hermes'        // false for openclaw/wednesdayai/youmind
    && this.activeRoute === 'relay'
    && GatewayClient.HERMES_BRIDGE_RETRY_METHODS.has(method);
}
```
This is correct and the remediation explicitly designed for it. The only cost is one extra function call + one `getBackendKind()` resolution per backend request, which is negligible. No mutating operation (`model.set`, `config.patch`, `config.set`, `agents.files.set`) is in `HERMES_BRIDGE_RETRY_METHODS`, so even if the guard were buggy, mutation duplication is blocked by the set membership check. Not a bug — confirming the prompt's "subtle behavioral changes for non-Hermes" question: **none found**.
**Evidence**: see code above; `chat.send`/`chat.abort` (lines 931, 981) still call `this.sendRequest` directly, NOT `sendBackendRequest`, so they bypass the retry wrapper entirely — also correct.
**Impact**: None. Listed only to close out the routing-correctness question.

## ISSUE-6: Test claims Hermes "divergent method references" for `getBaseUrl` — accurate, but the divergence test does not pin *which* implementation won
**Severity**: Low (test-precision nit)
**Location**: `apps/mobile/src/services/gateway-backend-operations.test.ts:53-61`
**Description**: The test asserts `hermesOps.getBaseUrl !== openclawOps.getBaseUrl`, which correctly pins that Hermes defines its own `getBaseUrl`. This is accurate (HERMES_OPERATIONS overrides `getBaseUrl` at line 262-264). However the test does not verify the Hermes version actually uses the `/v1/hermes/ws` pattern — a future regression that replaces Hermes's `getBaseUrl` with a *different* wrong override (e.g. copying OpenClaw's `/ws` pattern under a new function reference) would pass this identity test while breaking behavior. The behavioral pin exists separately in the `getBaseUrl` describe block (line 76-79), so the contract is covered elsewhere; this is just a precision gap in what the identity test claims to guard.
**Evidence**:
```ts
expect(hermesOps.getBaseUrl).not.toBe(openclawOps.getBaseUrl);
```
Only checks reference inequality, not that the Hermes impl uses `\/v1\/hermes\/ws\/?$`.
**Impact**: Low. The behavioral test at line 76-79 covers the pattern. Identity test alone would not catch a wrong-but-different override.

---

## Summary

| # | Severity | Steal-eligible | One-line |
|---|----------|----------------|----------|
| 1 | High | YES | GLM52-4 test now exercises try path, not catch path — query-strip fix unguarded |
| 2 | Medium | no | `agents.files.get` retry can silently return newer file content on edit-base reads |
| 3 | Low | no | `tools.catalog` retry can return a newer catalog between attempts |
| 4 | Low | no | async `sendBackendRequest` shifts re-throw stack frame attribution |
| 5 | Low (info) | no | Non-Hermes routing confirmed safe — no behavioral change |
| 6 | Low | no | Hermes `getBaseUrl` identity test doesn't pin the pattern it claims to guard |

Confirmed issues: **6** (1 steal-eligible). ISSUE-1 is the strongest — it is a real regression-test escape introduced by the remediation itself, verified at runtime. ISSUE-5 is a confirmed-clean result (non-issue), included to answer the routing-correctness question explicitly.
