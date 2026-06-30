# T4 Round 1 — Adversarial Code Review: Find Issues in T3 Remediations

You are a panelist in an adversarial code review tournament. Your job is to find **real, specific bugs or defects** in the implementation diff shown below. You score points for each **valid** issue you find.

## Scoring

- 1 point: find a valid issue with a specific file:line citation
- 1 more point: propose a correct remediation for your own issue
- 1 more point: your remediation survives adversarial review by a peer

## What you are reviewing

This is the T3 remediation diff — changes made to fix three issues found in the previous tournament:

**Fix 1 (gateway-backend-operations.ts):** Collapsed the dead catch body of `deriveBaseUrl` to `return null`.

**Fix 2 (ModelsScreen.tsx):** Replaced YouMind's `<ModelsView>` render with `<EmptyState title subtitle/>`, added `EmptyState` to the import.

**Fix 3 (gateway.test.ts):** Added 3 new tests:
- `config.get` retries on `[BRIDGE_UNAVAILABLE]` for Hermes relay
- `agents.files.get` does NOT retry (read-modify-write exclusion)
- `HERMES_BRIDGE_RETRY_METHODS ⊆ shouldTraceRequest` subset assertion

## The diff

```diff
diff --git a/apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx b/apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx
index 75b6af3..c688cb7 100644
--- a/apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx
+++ b/apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx
@@ -3,7 +3,7 @@ import { RefreshCw } from 'lucide-react-native';
 import { useNavigation } from '@react-navigation/native';
 import { NativeStackNavigationProp } from '@react-navigation/native-stack';
 import { useTranslation } from 'react-i18next';
-import { HeaderActionButton } from '../../components/ui';
+import { EmptyState, HeaderActionButton } from '../../components/ui';
 import { HermesModelSelectionView } from '../../components/console/HermesModelSelectionView';
 import { ModelsView } from '../../components/console/ModelsView';
 import { useAppContext } from '../../contexts/AppContext';
@@ -115,12 +115,9 @@ export function ModelsScreen(): React.JSX.Element {
       />
     ),
     youmind: (
-      <ModelsView
-        gateway={gateway}
-        topInset={0}
-        onBack={() => navigation.goBack()}
-        modelConfig={modelConfig}
-        hideHeader
-      />
+      <EmptyState
+        title={t('Models')}
+        subtitle={t('Model selection is not available for this backend.')}
+      />
     ),
   });
 }
diff --git a/apps/mobile/src/services/gateway-backend-operations.ts b/apps/mobile/src/services/gateway-backend-operations.ts
index 9e6b8bd..0eb07f3 100644
--- a/apps/mobile/src/services/gateway-backend-operations.ts
+++ b/apps/mobile/src/services/gateway-backend-operations.ts
@@ -293,21 +293,9 @@ function deriveBaseUrl(urlText: string | undefined, wsPathPattern: RegExp): stri
     url.pathname = url.pathname.replace(wsPathPattern, '') || '/';
     return url.toString().replace(/\/+$/, '');
   } catch {
-    const stripped = urlText
-      .replace(/^ws(s?):\/\//, 'http$1://')
-      .split('?')[0]
-      .split('#')[0]
-      .replace(wsPathPattern, '')
-      .replace(/\/+$/, '');
-    // Guard 1: if stripping consumed the :// delimiter (e.g. bare ws://), return null.
-    if (!/^https?:\/\//.test(stripped)) return null;
-    // Guard 2: validate the stripped result is a parseable URL (catches malformed hosts
-    // like http://[invalid that pass the regex but would crash callers using fetch/Image).
-    try {
-      new URL(stripped);
-      return stripped;
-    } catch {
-      return null;
-    }
+    // Any URL malformed enough to fail new URL() in the try path also fails the nested
+    // new URL() guard — the scheme swap is identical in both branches and stripping
+    // query/hash/path cannot fix a bad host. This path always returns null.
+    return null;
   }
 }
diff --git a/apps/mobile/src/services/gateway.test.ts b/apps/mobile/src/services/gateway.test.ts
index XXXXXXX..XXXXXXX 100644
--- a/apps/mobile/src/services/gateway.test.ts
+++ b/apps/mobile/src/services/gateway.test.ts
@@ -2152,6 +2152,65 @@ describe('metadata caching', () => {
     });
 
+    it('retries newly-added config.get on [BRIDGE_UNAVAILABLE] for Hermes relay', async () => {
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
+        .mockResolvedValue({ config: {}, hash: 'abc123' });
+
+      const pending = client.request<{ config: object; hash: string }>('config.get', {});
+      await flushPromises();
+      expect(sendRequestSpy).toHaveBeenCalledTimes(1);
+
+      jest.advanceTimersByTime(750);
+      await flushPromises();
+      await expect(pending).resolves.toEqual({ config: {}, hash: 'abc123' });
+      expect(sendRequestSpy).toHaveBeenCalledTimes(2);
+    });
+
+    it('does NOT retry agents.files.get on [BRIDGE_UNAVAILABLE] — read-modify-write exclusion', async () => {
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
+        .mockRejectedValue(new Error('[BRIDGE_UNAVAILABLE] Hermes bridge is temporarily unavailable. Please retry.'));
+
+      await expect(
+        client.request('agents.files.get', { agentId: 'main', name: 'plan.md' }),
+      ).rejects.toThrow('[BRIDGE_UNAVAILABLE]');
+      expect(sendRequestSpy).toHaveBeenCalledTimes(1);
+    });
+
+    it('HERMES_BRIDGE_RETRY_METHODS ⊆ shouldTraceRequest: every retry method is also traced', () => {
+      const retryMethods = (GatewayClient as unknown as { HERMES_BRIDGE_RETRY_METHODS: Set<string> }).HERMES_BRIDGE_RETRY_METHODS;
+      for (const method of retryMethods) {
+        expect((client as any).shouldTraceRequest(method)).toBe(true);
+      }
+    });
```

## Additional context

The files live in `apps/mobile/src/` within the monorepo at `/Users/david/Code/WednesdayAI-mobile/.claude/worktrees/bridge-cse_017t4jHHDgStaaKTBnmEp4gm`.

**Key facts about the codebase you can verify by reading the files:**
- `EmptyState` component: `apps/mobile/src/components/ui/EmptyState.tsx` — props are `title: string`, `subtitle?: string`
- `selectByBackend` helper: `apps/mobile/src/services/gateway-backends.ts` — defaults missing keys to `options.openclaw`
- `HERMES_BRIDGE_RETRY_METHODS`: static Set in `GatewayClient` at `apps/mobile/src/services/gateway.ts:~174`
- `shouldTraceRequest`: switch statement at `gateway.ts:~2784`
- `sendRequestWithHermesBridgeRetry`: `gateway.ts:~1385`
- `deriveBaseUrl`: `gateway-backend-operations.ts:~288`
- i18n locale files: `apps/mobile/src/i18n/locales/{en,zh-Hans,ja,ko,de,es}/console.json`
- The test harness in `gateway.test.ts` uses `jest.useFakeTimers()` globally; the retry tests use `jest.advanceTimersByTime(750)` + `await flushPromises()`

## Your task

Read the relevant files in the worktree. Identify any bugs, correctness problems, or defects in the implementation above.

**For each issue you find, output:**

```text
## Issue [N]: [short title]
File: [path:line]
Severity: low | medium | high
Category: correctness | test-quality | regression | i18n

[Explanation of what is wrong and why]
```

Do NOT output vague style concerns. Every finding must cite a specific file:line and explain the concrete defect.

If you find no issues, say so explicitly.
