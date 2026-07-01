# T4 Round 2 — Remediation Proposals (Codex)

## Issue A: Duplicate "Models" heading for YouMind

### Proposed code change

```diff
diff --git a/apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx b/apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx
@@
     youmind: (
       <EmptyState
-        title={t('Models')}
+        title={t('Model selection unavailable')}
         subtitle={t('Model selection is not available for this backend.')}
       />
     ),
```

Add the new key to all React Native `console.json` locale files:

```json
// en/console.json
"Model selection unavailable": "Model selection unavailable"

// zh-Hans/console.json
"Model selection unavailable": "模型选择不可用"

// ja/console.json
"Model selection unavailable": "モデル選択は利用できません"

// ko/console.json
"Model selection unavailable": "모델 선택을 사용할 수 없음"

// de/console.json
"Model selection unavailable": "Modellauswahl nicht verfügbar"

// es/console.json
"Model selection unavailable": "Selección de modelo no disponible"
```

### Why this fixes the problem

The native modal header remains `t('Models')`, so the screen title still identifies the route. The YouMind body no longer repeats the same visible heading; it gives the empty state a distinct, actionable status title while preserving the existing explanatory subtitle.

This also keeps the existing `EmptyState` contract intact, since `title` is a required prop.

### i18n requirements

This introduces a new React Native user-facing string in the `console` namespace. Must be added to all six supported RN locales: `en`, `zh-Hans`, `ja`, `ko`, `de`, and `es`.

## Issue B: Subset test lacks empty-set guard

### Proposed code change

```diff
diff --git a/apps/mobile/src/services/gateway.test.ts b/apps/mobile/src/services/gateway.test.ts
@@
     it('HERMES_BRIDGE_RETRY_METHODS ⊆ shouldTraceRequest: every retry method is also traced', () => {
+      expect.hasAssertions();
       const retryMethods = (GatewayClient as unknown as { HERMES_BRIDGE_RETRY_METHODS: Set<string> }).HERMES_BRIDGE_RETRY_METHODS;
+      expect(retryMethods.size).toBeGreaterThan(0);
       for (const method of retryMethods) {
         expect((client as any).shouldTraceRequest(method)).toBe(true);
       }
     });
```

### Why this fixes the problem

`expect(retryMethods.size).toBeGreaterThan(0)` prevents a vacuous pass if `HERMES_BRIDGE_RETRY_METHODS` is accidentally emptied. `expect.hasAssertions()` adds an additional guard that the test must execute assertions at all, which is useful if future edits introduce early returns or otherwise bypass the loop.

The subset assertion remains unchanged: every retry method still has to be traced by `shouldTraceRequest`.

### i18n requirements

None. This is test-only code and introduces no user-facing strings.
