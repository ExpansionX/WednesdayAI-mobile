# T4 Round 2 — Remediation Proposals (Claude)

Two issues were found in Round 1. Concrete, working remediations follow. No shell
commands were run; source was read-only to confirm types and contracts.

Verification done before writing (read-only):
- `apps/mobile/src/services/gateway.ts:174` — `HERMES_BRIDGE_RETRY_METHODS` is declared
  `new Set<string>([...])`, so `.size` is the correct accessor (not `.length`).
- `apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx:20` — `useTranslation('console')`,
  so any new key lives in the `console` namespace.
- `apps/mobile/src/components/ui/EmptyState.tsx:8` — `title: string` is **required**, `subtitle?`
  is optional; the title cannot simply be removed without changing the component contract.

---

## Issue 1 (test-quality): Vacuous loop — subset test lacks empty-set guard

**File:** `apps/mobile/src/services/gateway.test.ts:2199-2204`

### The fix

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

Two lines added: `expect.hasAssertions();` as the first statement, and
`expect(retryMethods.size).toBeGreaterThan(0);` immediately before the loop.

### Why it fixes the problem

The defect is that the test's only assertion lives **inside** the loop body. An empty
set means the body never runs, zero assertions execute, and Jest reports a green pass —
the "⊆" claim is asserted over nothing.

- `expect.hasAssertions()` is the primary, **type-agnostic** guard. It fails the test if
  zero assertions ran during execution, which is exactly the vacuous-loop failure mode.
  It does not depend on the collection being a `Set` (vs. an array), so it stays correct
  even if `HERMES_BRIDGE_RETRY_METHODS` is later refactored to a different iterable.
- `expect(retryMethods.size).toBeGreaterThan(0)` is the secondary, intent-documenting
  guard. It encodes the real precondition of a subset test — "there is at least one retry
  method to check" — at the point a reader looks for it. Confirmed at `gateway.ts:174`
  that the collection is a `Set`, so `.size` is valid here (an array would need `.length`).

Together: if the set is ever emptied, both guards fail loudly instead of passing silently.
`hasAssertions()` alone would suffice to close the bug; the `.size` check is added because
it names the invariant the test exists to protect.

### i18n impact

None. Test-only change; no user-facing strings, no locale keys.

---

## Issue 2 (regression): Duplicate "Models" heading for YouMind

**File:** `apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx:74,119`

- Line 74: `title: t('Models')` — the native-stack nav header (`useNativeStackModalHeader`).
- Line 119: `title={t('Models')}` — the `EmptyState` body heading.

For the `youmind` branch both render at once, so "Models" appears in the nav bar **and**
again as the body title. The nav header already names the page; the body heading should
explain the empty state, not repeat the page name.

### The fix

Replace the duplicated `EmptyState` title with a distinct, descriptive heading
(`ModelsScreen.tsx:117-122`):

```tsx
    youmind: (
      <EmptyState
        title={t('Model selection unavailable')}
        subtitle={t('Model selection is not available for this backend.')}
      />
    ),
```

### Why it fixes the problem

`EmptyState`'s `title` prop is **required** (`EmptyState.tsx:8` — `title: string`), so the
title cannot just be deleted without touching the shared component contract. Giving it a
heading that differs from the nav header removes the duplication while preserving the
standard EmptyState shape (title + supporting subtitle). The nav bar answers "what page is
this?"; the body now answers "why is it empty?", so the two no longer collide.

### Alternative considered (zero new i18n surface)

Promote the existing subtitle string to the title and drop the subtitle:

```tsx
    youmind: (
      <EmptyState title={t('Model selection is not available for this backend.')} />
    ),
```

This removes the duplicate with **no new locale keys** — attractive given this repo's strict
"add to all 6 locales" rule. Not chosen because a full sentence rendered in the semibold,
single-line title style reads worse than a short title + muted subtitle, and it discards the
visual hierarchy EmptyState is designed around. Recommended fix is the distinct-title
version; this alternative is the lower-surface fallback if a reviewer prefers zero new keys.

### i18n impact

The recommended fix adds **one** new key, `"Model selection unavailable"`, to the `console`
namespace in **all 6** locale files (`src/i18n/locales/{en,zh-Hans,ja,ko,de,es}/console.json`).

| Locale | Key → value |
|--------|-------------|
| en | `"Model selection unavailable": "Model selection unavailable"` |
| zh-Hans | `"Model selection unavailable": "模型选择不可用"` |
| ja | `"Model selection unavailable": "モデル選択は利用できません"` |
| ko | `"Model selection unavailable": "모델 선택을 사용할 수 없음"` |
| de | `"Model selection unavailable": "Modellauswahl nicht verfügbar"` |
| es | `"Model selection unavailable": "Selección de modelos no disponible"` |

The existing `"Model selection is not available for this backend."` key is reused unchanged
in the subtitle (already present in all 6 locales), so no new subtitle translation is needed.

---

## Summary

| Issue | Type | Fix | New i18n keys |
|-------|------|-----|---------------|
| 1 | test-quality | Add `expect.hasAssertions()` + `expect(retryMethods.size).toBeGreaterThan(0)` | 0 |
| 2 | regression | Give YouMind `EmptyState` a distinct title (`'Model selection unavailable'`) | 1 × 6 locales |
