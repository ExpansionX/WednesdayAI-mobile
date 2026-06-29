I could not write `/Users/david/Code/WednesdayAI-mobile/.claude/worktrees/bridge-cse_017t4jHHDgStaaKTBnmEp4gm/.agents/reports/2026-06-29-R2-codex-remediation-proposals.md` because the user instruction says not to modify files and the sandbox is read-only. Report content:

```markdown
## REMEDIATION-1: Route backend-operation RPCs through Hermes bridge retry helper
**Status**: Working Fix
**Confidence**: High
**Change Type**: code+test

### Code Change
```diff
diff --git a/apps/mobile/src/services/gateway.ts b/apps/mobile/src/services/gateway.ts
--- a/apps/mobile/src/services/gateway.ts
+++ b/apps/mobile/src/services/gateway.ts
@@ -1359,8 +1359,8 @@ export class GatewayClient {
-  private readonly sendBackendRequest = <T = unknown>(method: string, params?: object): Promise<T> => (
-    this.sendRequest(method, params) as Promise<T>
-  );
+  private readonly sendBackendRequest = async <T = unknown>(method: string, params?: object): Promise<T> => (
+    await this.sendRequestWithHermesBridgeRetry(method, params ?? {}) as T
+  );
```

```diff
diff --git a/apps/mobile/src/services/gateway.test.ts b/apps/mobile/src/services/gateway.test.ts
--- a/apps/mobile/src/services/gateway.test.ts
+++ b/apps/mobile/src/services/gateway.test.ts
@@ -2118,6 +2118,43 @@ describe('GatewayClient', () => {
       expect(sendRequestSpy).toHaveBeenCalledTimes(2);
     });
 
+    it('retries Hermes relay backend-operation reads after transient bridge unavailable errors', async () => {
+      client.configure({
+        url: 'wss://example.com',
+        token: 'abc',
+        mode: 'hermes',
+        backendKind: 'hermes',
+        transportKind: 'relay',
+      } as any);
+      (client as any).activeRoute = 'relay';
+
+      const sendRequestSpy = jest
+        .spyOn(client as unknown as { sendRequest: (method: string, params?: object) => Promise<unknown> }, 'sendRequest')
+        .mockRejectedValueOnce(new Error('[BRIDGE_UNAVAILABLE] Hermes bridge is temporarily unavailable. Please retry.'))
+        .mockResolvedValueOnce({
+          currentModel: 'claude-3-5-sonnet',
+          currentProvider: 'anthropic',
+          currentBaseUrl: '',
+          models: [],
+          providers: [],
+        })
+        .mockRejectedValueOnce(new Error('[BRIDGE_UNAVAILABLE] Hermes bridge is temporarily unavailable. Please retry.'))
+        .mockResolvedValueOnce({ totals: { totalTokens: 1 } })
+        .mockRejectedValueOnce(new Error('[BRIDGE_UNAVAILABLE] Hermes bridge is temporarily unavailable. Please retry.'))
+        .mockResolvedValueOnce({ totalCost: 0.01 });
+
+      const modelPending = client.getModelSelectionState();
+      await flushPromises();
+      jest.advanceTimersByTime(750);
+      await expect(modelPending).resolves.toEqual(expect.objectContaining({ currentModel: 'claude-3-5-sonnet' }));
+
+      const usagePending = client.fetchUsage({ startDate: '2026-01-01', endDate: '2026-01-31' });
+      await flushPromises();
+      jest.advanceTimersByTime(750);
+      await expect(usagePending).resolves.toEqual(expect.objectContaining({ totals: { totalTokens: 1 } }));
+
+      const costPending = client.fetchCostSummary({ startDate: '2026-01-01', endDate: '2026-01-31' });
+      await flushPromises();
+      jest.advanceTimersByTime(750);
+      await expect(costPending).resolves.toEqual(expect.objectContaining({ totalCost: 0.01 }));
+      expect(sendRequestSpy).toHaveBeenCalledTimes(6);
+    });
+
     it('does not retry mutating Hermes calls (e.g. chat.send) on bridge unavailable', async () => {
       client.configure({
         url: 'wss://example.com',
```

### Why This Works
`sendBackendRequest` is the adapter passed into `getGatewayBackendOperations()` for backend-aware calls such as Hermes `model.get`, usage reads, config reads, and agent-file reads. Routing that adapter through `sendRequestWithHermesBridgeRetry()` makes the existing `HERMES_BRIDGE_RETRY_METHODS` whitelist effective for backend-operation callers without broadening retry behavior to mutating methods.

The retry predicate still requires all three gates: Hermes backend, relay route, and an allowlisted method. OpenClaw and non-relay traffic still falls through with no retry.

### Risks
This changes omitted backend-operation params from `undefined` to `{}`. Existing generic `request()` already does that, and backend operations in `gateway-backend-operations.ts` already pass object params for these methods, so practical risk is low.

## REMEDIATION-2: Validate fallback-derived base URLs with URL parsing
**Status**: Working Fix
**Confidence**: High
**Change Type**: code+test

### Code Change
```diff
diff --git a/apps/mobile/src/services/gateway-backend-operations.ts b/apps/mobile/src/services/gateway-backend-operations.ts
--- a/apps/mobile/src/services/gateway-backend-operations.ts
+++ b/apps/mobile/src/services/gateway-backend-operations.ts
@@ -302,7 +302,12 @@ function deriveBaseUrl(urlText: string | undefined, wsPathPattern: RegExp): stri
     // Guard: if stripping consumed the :// delimiter (e.g. bare ws://?token),
     // the result is not a valid URL — return null rather than a broken "http:" string.
-    return /^https?:\/\//.test(stripped) ? stripped : null;
+    if (!/^https?:\/\//.test(stripped)) return null;
+    try {
+      return new URL(stripped).toString().replace(/\/+$/, '');
+    } catch {
+      return null;
+    }
   }
 }
```

```diff
diff --git a/apps/mobile/src/services/gateway-backend-operations.test.ts b/apps/mobile/src/services/gateway-backend-operations.test.ts
--- a/apps/mobile/src/services/gateway-backend-operations.test.ts
+++ b/apps/mobile/src/services/gateway-backend-operations.test.ts
@@ -93,10 +93,10 @@ describe('getGatewayBackendOperations', () => {
     it('catch path: strips query string before applying wsPathPattern (GLM52-4 regression)', () => {
       const ops = getGatewayBackendOperations({ backendKind: 'hermes' } as any);
       // [invalid forces new URL() to throw — triggers the catch path
-      // Before fix: ?token=abc prevented wsPathPattern match → path leaked into result
-      // After fix: query string is stripped first → wsPathPattern matches correctly
+      // Query stripping must not turn an invalid host into an accepted base URL.
       expect(ops.getBaseUrl({ url: 'ws://[invalid/v1/hermes/ws?token=abc' } as any))
-        .toBe('http://[invalid');
+        .toBeNull();
     });
```

### Why This Works
The fallback path previously treated any string beginning with `http://` or `https://` as valid, so malformed authority values such as `http://[invalid` escaped. Re-parsing the stripped candidate with `new URL()` keeps the fallback behavior for syntactically valid URLs while rejecting malformed hosts and bare protocols.

### Risks
The fallback path may now reject malformed URL strings that previously produced displayable-but-invalid base URLs. That is the intended behavior for safety; valid `ws://` and `wss://` URLs still use the primary parse path and are unchanged.
```

