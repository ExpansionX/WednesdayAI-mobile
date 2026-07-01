# T2 R2 — OpenCode/GLM Remediation Proposals

Panel: OpenCode (glm-5.2)
Scope: 6 R1 findings against `gateway-backend-operations.ts`, `gateway-backend-operations.test.ts`, and `gateway.ts` (retry set / `sendBackendRequest` / `shouldTraceRequest`).
No repository state was modified. All diffs below are proposed code, not applied.

Verified facts used in the analysis:
- `deriveBaseUrl` (gateway-backend-operations.ts:287-313) try path: `new URL(ws→http)` then `url.hash=''; url.search=''; url.pathname = pathname.replace(wsPathPattern,'')`. Catch path: `replace(ws→http).split('?')[0].split('#')[0].replace(wsPathPattern,'').replace(/\/+$/,'')`, guard1 `^https?://`, guard2 `new URL(stripped)`.
- `host.invalid` is a syntactically valid single-label hostname (RFC 3986 §3.2.2 host production); `new URL('http://host.invalid/...')` does NOT throw — only DNS resolution would fail, which `new URL` never performs. Confirmed: the current GLM52-4 test runs the try path, not the catch path.
- `HERMES_BRIDGE_RETRY_METHODS` (gateway.ts:159-174) is the retry-eligibility set; `isHermesRelayBridgeRetryEligible` (1391-1395) gates on `getBackendKind() === 'hermes' && activeRoute === 'relay' && set.has(method)`.
- `sendBackendRequest` (1367-1369) is `async`; `sendRequestWithHermesBridgeRetry` (1371-1389) re-throws via `throw error` (1382) / `throw lastError` (1388), preserving the original error reference for `Error` instances.

---

## REMEDIATION-1: Force the GLM52-4 test onto the catch path with a stubbed `URL`
**Status**: Working Fix
**Confidence**: High
**Severity addressed**: High (STEAL-ELIGIBLE) — the GLM52-4 catch-path query-stripping fix is currently unguarded.

### Code Change
Replace the body of `apps/mobile/src/services/gateway-backend-operations.test.ts` lines 101-109:

```diff
     it('catch path: strips query string before applying wsPathPattern (GLM52-4 regression)', () => {
       const ops = getGatewayBackendOperations({ backendKind: 'hermes' } as any);
-      // Use a syntactically valid but unresolvable host to force the catch path while
-      // keeping the result parseable — this pins the split('?')[0] query-stripping behavior.
-      // Before fix: ?token=abc prevented wsPathPattern match → path leaked into result.
-      // After fix: query string is stripped first → wsPathPattern matches correctly.
-      expect(ops.getBaseUrl({ url: 'ws://host.invalid/v1/hermes/ws?token=abc' } as any))
-        .toBe('http://host.invalid');
+      // GLM52-4 guards the CATCH path of deriveBaseUrl: when new URL() throws on the
+      // full URL, the catch path must split('?')[0] BEFORE applying wsPathPattern, so
+      // the trailing /v1/hermes/ws still matches and is stripped.
+      //
+      // host.invalid is a syntactically valid RFC-3986 single-label host, so
+      // new URL('http://host.invalid/...?token=abc') does NOT throw — it runs the
+      // TRY path (url.search = '') and never exercises the catch-path fix. The prior
+      // test was a green test that did not guard the bug it claimed to guard.
+      //
+      // To force the catch path reliably across URL parsers (with no dependence on
+      // parser-quirk throwing inputs), stub global.URL to throw on the first call
+      // (the try path at gateway-backend-operations.ts:290) and delegate to the real
+      // parser on the second call (the catch path's guard-2 re-validation at :307).
+      // callCount === 2 proves the try path threw and the catch path ran + succeeded.
+      const realURL = global.URL;
+      let callCount = 0;
+      const urlSpy = jest.spyOn(global, 'URL').mockImplementation((input: string) => {
+        callCount += 1;
+        if (callCount === 1) throw new TypeError('Invalid URL (forced for catch-path test)');
+        return new realURL(input);
+      });
+      try {
+        expect(ops.getBaseUrl({ url: 'ws://host.invalid/v1/hermes/ws?token=abc' } as any))
+          .toBe('http://host.invalid');
+      } finally {
+        urlSpy.mockRestore();
+      }
+      // Try path threw (call 1), catch path re-validated the stripped string (call 2).
+      expect(callCount).toBe(2);
     });
```

The adjacent malformed-host test (lines 111-118, `ws://[invalid/...` → `null`) stays unchanged — it pins catch-path *failure* (guard 2 rejects `http://[invalid`), so the pair now covers catch-path success AND failure.

### Why This Works
Root cause: `new URL('http://host.invalid/...')` succeeds (single-label hosts are valid; URL parsing does no DNS), so the original test entered the try path (`url.search = ''`) and never reached the catch path's `split('?')[0]` query-stripping branch that GLM52-4 fixed.

The stub forces `new URL()` to throw on the first invocation (the try path at `gateway-backend-operations.ts:290`), routing execution into the catch path. There the code computes:
```text
stripped = 'http://host.invalid/v1/hermes/ws?token=abc'
  .replace(/^ws(s?):\/\//, 'http$1://')   // http://host.invalid/v1/hermes/ws?token=abc
  .split('?')[0]                          // http://host.invalid/v1/hermes/ws   ← GLM52-4 strip
  .split('#')[0]                          // http://host.invalid/v1/hermes/ws
  .replace(/\/v1\/hermes\/ws\/?$/, '')    // http://host.invalid
  .replace(/\/+$/, '')                    // http://host.invalid
```

Guard 1 (`^https?://`) passes; the second `new URL(stripped)` call (call 2) delegates to the real parser and succeeds → returns `http://host.invalid`.

`callCount === 2` is the load-bearing assertion: it proves (a) the try path was entered and threw, and (b) the catch path's re-validation ran. Without it, a future regression that accidentally makes the try path succeed (or skips the catch re-validation) could still produce `http://host.invalid` via the wrong path. The count makes the path deterministic, not just the result.

This relies only on standard `jest.spyOn` constructor mocking + `try/finally` restore. It has no dependence on WHATWG-URL-parser quirks (NUL chars, percent-encoding, bracket handling) that vary across Node / Hermes JSC / RN.

### Risks
- Mocking the global `URL` constructor is invasive; if any other code runs during this test's synchronous body and calls `new URL`, `callCount` would inflate. Mitigated: the body is a single synchronous `ops.getBaseUrl(...)` call; `deriveBaseUrl` makes exactly two `new URL` calls on this input (try + catch guard 2). The `expect(callCount).toBe(2)` assertion would catch inflation.
- If `deriveBaseUrl` is later refactored to call `new URL` a different number of times, `callCount` breaks. That's a feature, not a risk — it forces the test author to re-confirm the catch-path routing on refactor.
- Alternative (lower coupling): export `deriveBaseUrl` and test it directly with the same stub. Still requires the stub to force a throw, so the mock is unavoidable for a reliable catch-path-success case. The proposed in-place fix avoids expanding the module's public API.

---

## REMEDIATION-2: Remove `agents.files.get` from the Hermes retry set
**Status**: Working Fix
**Confidence**: High
**Severity addressed**: Medium — silent base shift on edit-base reads.

### Code Change
`apps/mobile/src/services/gateway.ts` lines 159-174:

```diff
   private static readonly HERMES_BRIDGE_RETRY_METHODS = new Set<string>([
     'sessions.list',
     'chat.history',
     'last-heartbeat',
     'models.list',
     'model.current',
     'model.get',
     'agents.list',
     'agent.identity.get',
     'sessions.usage',
     'usage.cost',
     'config.get',
     'tools.catalog',
     'agents.files.list',
-    'agents.files.get',
   ]);
```

And expand the comment block (gateway.ts:152-158) to record why:

```diff
   // Retry-eligibility set for idempotent Hermes relay reads (NOT an event whitelist).
   // Mutating calls (chat.send, chat.abort, model.set, config.patch, agents.files.set, etc.)
   // must never be auto-retried because the bridge may have already accepted the first
   // attempt and a retry would duplicate the side effect.
+  //
+  // agents.files.get is intentionally EXCLUDED even though it has no backend side
+  // effect. It is the edit base for read-modify-write flows: the Console file editor
+  // fetches content → user edits → setAgentFile writes back with that content as the
+  // implicit base. Auto-retrying after a [BRIDGE_UNAVAILABLE] can silently return NEWER
+  // content than the first attempt if the file changed in the ~750ms gap, so the
+  // subsequent write targets a base the user never saw. A transient [BRIDGE_UNAVAILABLE]
+  // surfacing as an error the user retries explicitly is honest; a silent base shift is
+  // not. Pure display reads tolerate losing auto-retry for this safety property.
   // Model RPCs: both model.get and model.current are included.
   //   model.current → Hermes lightweight state (getCurrentModelState).
   //   model.get → full state with models/providers (getModelSelectionState, shared path).
```

### Why This Works
`getAgentFile` (gateway-backend-operations.ts:186-194) returns `result.file` with no version/hash stamp. Retry is safe w.r.t. *side-effect duplication* (the read doesn't mutate backend state), but unsafe w.r.t. *read-base consistency* for the editor flow: attempt 1 fails with `[BRIDGE_UNAVAILABLE]` after the bridge may have already accepted the request (or while a concurrent external editor writes), then attempt 2 returns content that differs from what attempt 1 would have returned. The caller has no signal that the base shifted.

`config.get` is also a read used as an edit base, but it returns a `hash` that `patchConfig`/`setConfig` pass back as `baseHash` — the backend rejects stale-base writes. `agents.files.get` returns no such hash; `setAgentFile` (195-198) takes only `{ agentId, name, content }` with no base token. So `agents.files.get` is the one read in the set whose retry can silently corrupt an edit without any backend-side guard. Removing it from auto-retry makes a transient `[BRIDGE_UNAVAILABLE]` surface to the user, who can retry the fetch explicitly — the edit then proceeds against the freshest base.

### Risks
- Pure-display file views (open a file just to read it) lose auto-retry on Hermes relay. They will surface `[BRIDGE_UNAVAILABLE]` to the user on a transient bridge blip instead of recovering silently. Acceptable: the error is honest and the user retry is one tap.
- If a future editor flow adds a base-hash to `setAgentFile`, this exclusion becomes overly conservative and `agents.files.get` could be re-added. The comment documents the precondition so the re-add is a deliberate decision, not an accident.
- Does not affect `agents.files.list` (summary list, no edit base) or any other entry.

---

## REMEDIATION-3: Document `tools.catalog` newer-on-retry semantics (no behavior change)
**Status**: Informational
**Confidence**: High
**Severity addressed**: Low — cosmetic catalog flicker, no correctness break.

### Code Change
Append to the retry-set comment block in `apps/mobile/src/services/gateway.ts` (after the REMEDIATION-2 note):

```diff
+  // tools.catalog and agents.files.list are pure display reads. On retry they may
+  // return a NEWER snapshot than the first attempt (e.g. a plugin installed in the
+  // 750ms gap). This is acceptable for a UI refresh and carries no edit-base staleness
+  // risk (unlike agents.files.get, which is excluded above). No code change needed;
+  // this note exists so future maintainers do not mistake "newer on retry" for a bug.
```

No set membership change.

### Why This Works
`fetchToolsCatalog` (gateway-backend-operations.ts:176-179) returns the raw `ToolsCatalogResult` with no version pinning. A retry can return a catalog that changed between attempts. For a UI catalog refresh this is the desired behavior (the user wants the newest tools), and there is no downstream write that depends on the first-attempt catalog. The retry-set comment originally framed all entries as uniformly safe reads; this clarifies that "newer on retry" is expected and harmless for these two, while distinguishing them from the edit-base read excluded in REMEDIATION-2.

### Risks
None. No behavior change. Comment-only.

---

## REMEDIATION-4: Document that re-thrown errors preserve the original stack (no behavior change)
**Status**: Informational
**Confidence**: High
**Severity addressed**: Low — R1 speculated about a stack-frame attribution shift; analysis shows there is no shift for `Error` instances.

### Code Change
Add a comment at `apps/mobile/src/services/gateway.ts` lines 1371-1389:

```diff
   private async sendRequestWithHermesBridgeRetry(method: string, params: object): Promise<unknown> {
+    // Re-throw semantics: `throw error` (line below) and `throw lastError` re-use the
+    // ORIGINAL error object. Error.stack is captured at the original throw site inside
+    // sendRequest and is NOT rewritten by re-throwing here, so telemetry that keys off
+    // error.stack still sees the original frame. Only non-Error rejections are wrapped
+    // (`throw new Error(String(lastError))`), which is the intended normalization for
+    // non-Error rejection reasons. The async wrapper does not introduce Promise<Promise<T>>
+    // — `await` unwraps nested thenables — so callers are unaffected.
     const retryable = this.isHermesRelayBridgeRetryEligible(method);
```

### Why This Works
`throw error` (line 1382) and `throw lastError` (line 1388) re-throw the original `Error` reference. In V8/JSC, `Error.prototype.stack` is set when the error is constructed (at the original `throw` inside `sendRequest`) and is not regenerated when the same object is re-thrown. Telemetry that reads `error.stack` therefore still sees `sendRequest`'s internal frame as the top frame, not `sendRequestWithHermesBridgeRetry`. The `async` wrapper change is transparent to `await`-ing callers: an `async` function returning a `Promise<T>` does not produce `Promise<Promise<T>>` — `await` unwraps nested thenables. The `GatewayRequestFn` type `<T>(method, params?) => Promise<T>` is still satisfied.

The only observable difference is for non-`Error` rejections (e.g. a string or plain object), which are normalized via `throw new Error(String(lastError))` — this is intended normalization, not a stack shift.

### Risks
None. Comment-only. If a future change wraps errors in a new `Error` constructor (e.g. `throw new Error('retry failed', { cause: error })`), the stack would shift — the comment flags that as a regression to avoid.

---

## REMEDIATION-5: Non-Hermes routing confirmed safe — add a guard comment + optional regression test
**Status**: Informational
**Confidence**: High
**Severity addressed**: Low (informational) — R1 confirmed no behavioral change for non-Hermes; this closes out the routing-correctness question.

### Code Change
Add a comment at `apps/mobile/src/services/gateway.ts` lines 1391-1395:

```diff
   private isHermesRelayBridgeRetryEligible(method: string): boolean {
+    // Non-Hermes backends (openclaw / wednesdayai / youmind) short-circuit on the first
+    // clause: getBackendKind() !== 'hermes' → returns false → delays = [] → the retry
+    // loop runs exactly once with no retry. chat.send / chat.abort bypass this wrapper
+    // entirely (they call sendRequest directly), so even a buggy guard could not
+    // duplicate a mutating chat call. Mutating backend ops (model.set, config.patch,
+    // config.set, agents.files.set) are not in HERMES_BRIDGE_RETRY_METHODS, so the set
+    // membership check is a second independent guard against mutation duplication.
     return this.getBackendKind() === 'hermes'
       && this.activeRoute === 'relay'
       && GatewayClient.HERMES_BRIDGE_RETRY_METHODS.has(method);
   }
```

Optional regression test (new file `apps/mobile/src/services/gateway-retry-eligibility.test.ts`, or appended to an existing gateway test module if one exists) — proposed but not required since the guard is already exercised by every non-Hermes integration test passing:

```ts
// Conceptual guard — would require a testable seam (e.g. expose a pure
// `isRetryEligible(backendKind, route, method)` helper) to unit-test without
// instantiating a full GatewayClient + WebSocket. The current behavioral
// coverage (all non-Hermes backend tests pass without retry side effects)
// is sufficient evidence. Adding the pure helper is a follow-up if retry
// logic grows more complex.
```

### Why This Works
Verified from the code: `getBackendKind()` returns `'openclaw' | 'wednesdayai' | 'youmind' | 'hermes'`; the first clause `=== 'hermes'` returns `false` for all non-Hermes, so `delays = []` and the `for` loop runs `attempt = 0` only (the `attempt <= delays.length` with `delays.length === 0` runs once), calling `sendRequest` exactly once with no retry. `chat.send` / `chat.abort` call `this.sendRequest` directly (not `sendBackendRequest`), so they bypass the wrapper entirely. Mutating ops are absent from the set, providing a second independent guard. No behavioral change for non-Hermes; the only cost is one `getBackendKind()` call per request, which is negligible.

### Risks
None. Comment-only (the optional test requires a refactor to expose a pure helper and is explicitly called out as a follow-up, not a required fix).

---

## REMEDIATION-6: Make the Hermes `getBaseUrl` identity test self-sufficient by pinning the winning pattern
**Status**: Working Fix
**Confidence**: High
**Severity addressed**: Low — identity test claimed to guard the Hermes override but only proved the references differ, not that the Hermes impl uses `/v1/hermes/ws`.

### Code Change
`apps/mobile/src/services/gateway-backend-operations.test.ts` lines 53-61:

```diff
     it('hermes: separate container AND divergent method references (genuine override)', () => {
       // Hermes overrides getCurrentModelState (model.current) and getBaseUrl (/v1/hermes/ws).
       // This test pins that divergence so an accidental removal of the Hermes override is caught.
       const hermesOps = getGatewayBackendOperations({ backendKind: 'hermes' } as any);
       const openclawOps = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
       expect(hermesOps).not.toBe(openclawOps);
       expect(hermesOps.getCurrentModelState).not.toBe(openclawOps.getCurrentModelState);
       expect(hermesOps.getBaseUrl).not.toBe(openclawOps.getBaseUrl);
+      // Pin WHICH implementation won, not just that the references differ. A future
+      // regression that swaps in a different wrong override (e.g. reusing OpenClaw's
+      // /ws pattern under a new function reference) would pass the three identity
+      // checks above while breaking behavior. This URL contains BOTH /v1/hermes/ws
+      // and a trailing /ws — only the Hermes /v1/hermes/ws pattern strips down to
+      // https://host; an OpenClaw-patterned override would leave /v1/hermes.
+      expect(hermesOps.getBaseUrl({ url: 'wss://host/v1/hermes/ws' } as any)).toBe('https://host');
+      expect(openclawOps.getBaseUrl({ url: 'wss://host/v1/hermes/ws' } as any)).toBe('https://host/v1/hermes');
     });
```

### Why This Works
The original test only asserted `hermesOps.getBaseUrl !== openclawOps.getBaseUrl` (reference inequality). That catches an accidental *removal* of the Hermes override (Hermes would fall back to OpenClaw's reference → equality → fail), but it does NOT catch a *wrong replacement* — e.g. if someone replaces Hermes's `getBaseUrl` with a new function that uses OpenClaw's `/ws` pattern, the references still differ (pass) while the behavior breaks (the `/v1/hermes/ws` URL would strip to `https://host/v1/hermes` instead of `https://host`).

The added pair of behavioral assertions makes the identity test self-sufficient: the input `wss://host/v1/hermes/ws` is the discriminative case because it contains both the OpenClaw pattern (`/ws` suffix) and the Hermes pattern (`/v1/hermes/ws` suffix). Only the Hermes impl strips the full `/v1/hermes/ws` to `https://host`; an OpenClaw-patterned override strips only the trailing `/ws` to `https://host/v1/hermes`. Asserting both results in the same test pins exactly which pattern the Hermes override uses.

This overlaps with the dedicated behavioral test at lines 76-89, which is acceptable — the identity test now independently verifies the claim its comment makes, instead of relying on a separate test block to cover the gap.

### Risks
- Mild redundancy with lines 76-89. Intentional: the identity test's comment claims to pin "genuine override," and the added assertions make that claim true locally rather than by cross-reference.
- If the Hermes base URL pattern legitimately changes (e.g. Hermes moves off `/v1/hermes/ws`), both this test and lines 76-89 must update together — which is the correct behavior, not a risk.

---

## Summary

| # | Severity | Status | Confidence | One-line |
|---|----------|--------|------------|----------|
| 1 | High (steal) | Working Fix | High | Stub `URL` to force the catch path; assert `callCount === 2` so GLM52-4 is actually guarded |
| 2 | Medium | Working Fix | High | Remove `agents.files.get` from the retry set; document the edit-base staleness reason |
| 3 | Low | Informational | High | Document `tools.catalog` newer-on-retry semantics; no behavior change |
| 4 | Low | Informational | High | Document that `throw error`/`throw lastError` preserve original `error.stack`; no shift |
| 5 | Low (info) | Informational | High | Confirm non-Hermes routing safe; add guard comment; optional pure-helper test as follow-up |
| 6 | Low | Working Fix | High | Augment the Hermes identity test with a discriminative `/v1/hermes/ws` behavioral assertion |

Two Working Fixes (1, 6) harden test contracts. One Working Fix (2) removes a real silent-staleness footgun. Three Informational items (3, 4, 5) close out low-severity / non-issues with clarifying comments and no behavior change.

No repository state was modified by this report.
