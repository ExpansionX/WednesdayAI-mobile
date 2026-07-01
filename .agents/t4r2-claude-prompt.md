# T4 Round 2 — Remediation Proposals (Claude)

You are Claude CLI in the T4 adversarial tournament. In Round 1 you found two issues.
Your job now is to propose **correct, specific remediations** for both.

## Issue 1 (test-quality): Vacuous loop — subset test lacks empty-set guard

File: `apps/mobile/src/services/gateway.test.ts:2199-2204`

```typescript
it('HERMES_BRIDGE_RETRY_METHODS ⊆ shouldTraceRequest: every retry method is also traced', () => {
  const retryMethods = (GatewayClient as unknown as { HERMES_BRIDGE_RETRY_METHODS: Set<string> }).HERMES_BRIDGE_RETRY_METHODS;
  for (const method of retryMethods) {
    expect((client as any).shouldTraceRequest(method)).toBe(true);
  }
});
```

No `expect.hasAssertions()` and no size check. If the set were emptied, zero assertions run and Jest passes.

## Issue 2 (regression): Duplicate "Models" heading for YouMind

File: `apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx:74,119`

Line 74: `title: t('Models'),` (nav header, set via `useNativeStackModalHeader`)
Line 119: `title={t('Models')}` (EmptyState body heading)

For YouMind, both render simultaneously — "Models" appears in the nav bar **and** again as the body heading.

## Your task

Propose a concrete, working remediation for each issue. For each:

1. Show exactly what code to change (exact replacement, not pseudocode)
2. Explain why it fixes the problem
3. Note any i18n impact (new locale keys needed, etc.)

Do NOT run any shell commands. Read files only if you need additional context.
Then write your remediation proposals to `.agents/reports/2026-06-30-T4R2-claude-remediation-proposals.md`.
