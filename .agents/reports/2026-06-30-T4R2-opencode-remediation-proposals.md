# T4 Round 2 — Remediation Proposals (opencode panelist)

Proposes concrete remediations for the two issues I raised in T4 Round 1.
Cited against the real repository contents.

## Issue 1 (regression): Duplicate "Models" heading for YouMind

File: `apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx:74,119`

### Root cause

`useNativeStackModalHeader` sets the nav bar title to `t('Models')` (line 74).
The youmind `EmptyState` branch (lines 117-122) also passes `title={t('Models')}`,
so for YouMind the user sees "Models" twice — once in the native nav bar and
again as the centered body heading directly beneath it. The `EmptyState` title
renders at `FontSize.base` + `FontWeight.semibold` (`EmptyState.tsx:43-46`), so
it reads as a deliberate heading, not a caption.

### Proposed remediation: reuse the existing `"No models available"` key

Drop the redundant `title` and set `title` to an existing, semantically accurate
key that already has full coverage in all six locale files
(`"No models available"` — en/zh-Hans/ja/ko/de/es console.json, verified present
in every locale). This keeps the body informative without restating the page
title, requires no new i18n keys, and preserves the `EmptyState` API contract
(`title` is required; `icon`/`subtitle`/`actionLabel`/`onAction` optional —
`EmptyState.tsx:6-12`).

#### Exact change

File: `apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx`

Before (lines 117-122):
```tsx
    youmind: (
      <EmptyState
        title={t('Models')}
        subtitle={t('Model selection is not available for this backend.')}
      />
    ),
```

After:
```tsx
    youmind: (
      <EmptyState
        title={t('No models available')}
        subtitle={t('Model selection is not available for this backend.')}
      />
    ),
```

### Why this is correct and introduces no new issues

1. **Eliminates the duplicate heading.** The nav bar still reads "Models" (line
   74, unchanged) and the body now reads "No models available" — two distinct
   strings, no redundancy.
2. **No new i18n keys.** `"No models available"` already exists in all six
   console.json locale files (en:173, zh-Hans, ja, ko, de, es — one match each,
   verified via grep across all locales). The AGENTS.md rule "all new features
   must include i18n for every supported locale" is satisfied by reuse; no
   locale-file edits are required.
3. **Semantically accurate.** YouMind has no model selection capability
   (`selectByBackend` dispatches to `EmptyState` precisely because no view
   exists), so "No models available" describes the actual state. It matches the
   pattern used elsewhere for capability-gated empty states.
4. **No prop-shape change.** `title` remains a string; `EmptyState` props are
   unchanged. `tsc` will still pass.
5. **Other backends unaffected.** The `wednesdayai`, `openclaw`, and `hermes`
   branches (lines 91-116) are untouched. OpenClaw and Hermes model selection
   paths are non-regressed, satisfying the dual-backend non-regression rule.
6. **No behavioral change to `useNativeStackModalHeader`.** The header title
   stays `t('Models')` for all backends; only the youmind body copy changes.

### Alternative considered (rejected)

Dropping the `title` prop entirely and relying on `subtitle` alone. Rejected
because `title` is a required prop on `EmptyState` (`EmptyState.tsx:6-12`) —
removing it would break the component contract and require an `EmptyState` API
change that ripples to every other call site. Reusing an existing key is
strictly smaller.

## Issue 2 (test-quality): Subset test has no empty-set guard

File: `apps/mobile/src/services/gateway.test.ts:2199-2204`

### Root cause

The `for...of` loop over `HERMES_BRIDGE_RETRY_METHODS` runs zero times if the
Set is ever emptied, and Jest reports a zero-assertion test as passing unless
`expect.hasAssertions()` / `expect.assertions(N)` is declared. The subset
invariant would then silently disappear.

### Proposed remediation: add `expect.hasAssertions()` plus an explicit size guard

Add `expect.hasAssertions()` at the top of the test (the canonical Jest guard
for zero-assertion passes) and an explicit `expect(retryMethods.size).toBeGreaterThan(0)`
to make the empty-set regression fail with a diagnostic message that points
directly at the cause, rather than the less obvious "no assertions found" error.
Both lines are cheap, independent, and belt-and-suspenders — `hasAssertions`
catches any future refactor that drops the loop entirely, and the size check
catches the specific empty-Set regression.

#### Exact change

File: `apps/mobile/src/services/gateway.test.ts`

Before (lines 2199-2204):
```typescript
    it('HERMES_BRIDGE_RETRY_METHODS ⊆ shouldTraceRequest: every retry method is also traced', () => {
      const retryMethods = (GatewayClient as unknown as { HERMES_BRIDGE_RETRY_METHODS: Set<string> }).HERMES_BRIDGE_RETRY_METHODS;
      for (const method of retryMethods) {
        expect((client as any).shouldTraceRequest(method)).toBe(true);
      }
    });
```

After:
```typescript
    it('HERMES_BRIDGE_RETRY_METHODS ⊆ shouldTraceRequest: every retry method is also traced', () => {
      expect.hasAssertions();
      const retryMethods = (GatewayClient as unknown as { HERMES_BRIDGE_RETRY_METHODS: Set<string> }).HERMES_BRIDGE_RETRY_METHODS;
      expect(retryMethods.size).toBeGreaterThan(0);
      for (const method of retryMethods) {
        expect((client as any).shouldTraceRequest(method)).toBe(true);
      }
    });
```

### Why this is correct and introduces no new issues

1. **Fails loudly on empty Set.** If `HERMES_BRIDGE_RETRY_METHODS` is ever
   emptied (rename/refactor accident), `expect(retryMethods.size).toBeGreaterThan(0)`
   fails with a clear message naming the Set size, instead of the loop
   vacuously passing.
2. **Fails loudly on dropped loop.** If a future refactor removes the `for...of`
   entirely, `expect.hasAssertions()` fails with "Expected at least one
   assertion to be called but received zero."
3. **No behavioral change when the Set is healthy.** Today the Set has 13
   members (`gateway.ts:174-188`), all present in the `shouldTraceRequest`
   switch (`gateway.ts:2776-2796`). The two new lines add two passing
   assertions; the existing 13 assertions are unchanged. Test still passes.
4. **No production-code change.** The diff is test-only; `gateway.ts` is
   untouched. No runtime behavior, no i18n, no dual-backend interaction.
5. **Subset invariant preserved.** The test still asserts subset, not equality
   — `shouldTraceRequest` has one extra case (`connect`) that is intentionally
   non-retryable, so subset is the correct relationship. The guards do not
   change what is being asserted, only that *something* is asserted.
6. **i18n: none.** Pure test change; no locale keys involved.

## Summary

| Issue | File | Change | New i18n keys |
|-------|------|--------|--------------|
| 1 — duplicate "Models" heading | `ModelsScreen.tsx:119` | `title={t('Models')}` → `title={t('No models available')}` | none (reuses existing key) |
| 2 — vacuous subset test | `gateway.test.ts:2199-2200` | add `expect.hasAssertions()` + `expect(retryMethods.size).toBeGreaterThan(0)` | none |