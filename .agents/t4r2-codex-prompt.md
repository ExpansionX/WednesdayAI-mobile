# T4 Round 2 — Remediation Proposals (Codex)

You are the Codex panelist in the T4 adversarial tournament. In Round 1 you found **no issues**.
In Round 2, panelists who found no issues are asked to propose remediations for issues found by others.

## Issues found by Claude and OpenCode (independently)

Both panelists found exactly the same two issues:

### Issue A: Duplicate "Models" heading for YouMind (medium)

File: `apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx:74,119`

`useNativeStackModalHeader` sets the nav bar title to `t('Models')` (line 74).
The new youmind `EmptyState` (lines 117-122) also sets `title={t('Models')}`.
For YouMind, the user sees "Models" twice.

### Issue B: Subset test lacks empty-set guard (low)

File: `apps/mobile/src/services/gateway.test.ts:2199-2204`

```typescript
it('HERMES_BRIDGE_RETRY_METHODS ⊆ shouldTraceRequest: every retry method is also traced', () => {
  const retryMethods = (GatewayClient as unknown as { HERMES_BRIDGE_RETRY_METHODS: Set<string> }).HERMES_BRIDGE_RETRY_METHODS;
  for (const method of retryMethods) {
    expect((client as any).shouldTraceRequest(method)).toBe(true);
  }
});
```

No `expect.hasAssertions()` — vacuously passes with an empty set.

## Your task

Propose **your own** remediation for each issue. These will be adversarially reviewed against Claude's and OpenCode's proposals in Round 3.

For each:
1. Show the exact code change
2. Explain why it fixes the problem
3. Note i18n requirements if applicable

Read relevant files for context:
- `apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx`
- `apps/mobile/src/i18n/locales/en/console.json`
- `apps/mobile/src/services/gateway.test.ts` (lines 2199-2205)

Write your proposals to `.agents/reports/2026-06-30-T4R2-codex-remediation-proposals.md`.
