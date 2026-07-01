# T4 Round 3 — OpenCode Adversarial Review of Claude's Proposals

Panelist: OpenCode. Goal: defeat Claude's T4R2 remediations or steal their points.

Evidence was read-only from the files cited in the prompt; no shell commands were
run.

---

## Verdict: Issue 1 (regression, duplicate "Models" heading) — VALID+FLAWED → OPENCODE STEALS

### The finding is real

`apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx:74` sets the native-stack
nav header to `t('Models')` via `useNativeStackModalHeader`, and
`ModelsScreen.tsx:119` renders an `EmptyState` whose `title` is also `t('Models')`
for the `youmind` branch. Both paint at once on the youmind screen, so the user
sees "Models" in the nav bar and "Models" again as the body heading. The
regression is genuine.

### Claude's fix is flawed — it expands i18n surface unnecessarily

Claude's recommended remediation adds a brand-new key
`"Model selection unavailable"` to all 6 locale `console.json` files
(`2026-06-30-T4R2-claude-remediation-proposals.md:111-122`).

The repo's i18n discipline (`apps/mobile/AGENTS.md` → "Internationalization (i18n)
Rules") states: *"When adding a new RN translation key, add it to **all 6** locale
directories… Never add a key to only one or two locales."* The cost of adding a
key is therefore 6 locale entries + the ongoing burden of keeping them aligned.
The rule exists precisely to discourage needless surface expansion.

A semantically adequate key already exists in all 6 locales and is reused
unchanged in Claude's own subtitle: `"Model selection is not available for this
backend."` (Claude's proposal `:124-125` admits this key is *"already present in
all 6 locales, so no new subtitle translation is needed"*).

Claude even documents the zero-new-key alternative in its own proposal
(`:94-108`): promote the existing subtitle string to the title and drop the
subtitle. Claude rejects it on purely aesthetic grounds — *"a full sentence
rendered in the semibold, single-line title style reads worse"* and *"discards
the visual hierarchy EmptyState is designed around"*. Those are subjective
preferences, not correctness or contract constraints. They do not override a
mandatory i18n discipline rule.

`EmptyState.title` is `string` and required (`apps/mobile/src/components/ui/EmptyState.tsx:8`,
per Claude's own verification). The existing subtitle string is a valid
non-empty `string`, so it satisfies the component contract. `subtitle` is
optional, so dropping it is contract-safe.

### Additional i18n surface note

The prompt also asks whether `"No models available"` (present at
`apps/mobile/src/i18n/locales/en/console.json:173`) is a candidate. It is
present, but it is semantically narrower ("the model list is empty") than the
youmind situation ("model selection feature is not available for this backend").
The cleaner zero-new-key reuse is the existing subtitle string, which is already
semantically precise for the youmind case and is already translated in all 6
locales.

### Exact stealing fix (zero new locale entries)

```tsx
// apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx:117-122
    youmind: (
      <EmptyState title={t('Model selection is not available for this backend.')} />
    ),
```

This:
- Removes the duplicate heading (body title now differs from nav header).
- Reuses a key that already exists in all 6 `console.json` locale files — zero
  new i18n surface, zero new translation work, zero future alignment burden.
- Satisfies the `EmptyState` component contract (`title: string` required,
  `subtitle?` optional).
- Preserves the user-facing meaning ("model selection is not available for this
  backend") verbatim — no information lost vs. Claude's recommended fix.

Claude's recommended fix is not wrong in the sense that it would also remove the
duplicate, but it violates the repo's "prefer reusing existing keys over
expanding locale surface" discipline when a strictly-zero-surface alternative
exists. OpenCode steals Issue 1.

---

## Verdict: Issue 2 (test-quality, vacuous subset test) — VALID+SOUND

### The finding is real

`apps/mobile/src/services/gateway.test.ts:2199-2204`:

```typescript
it('HERMES_BRIDGE_RETRY_METHODS ⊆ shouldTraceRequest: every retry method is also traced', () => {
  const retryMethods = (GatewayClient as unknown as { HERMES_BRIDGE_RETRY_METHODS: Set<string> }).HERMES_BRIDGE_RETRY_METHODS;
  for (const method of retryMethods) {
    expect((client as any).shouldTraceRequest(method)).toBe(true);
  }
});
```

The only assertion lives inside the `for` loop body. If
`HERMES_BRIDGE_RETRY_METHODS` is ever emptied, the body never executes, zero
assertions run, and Jest reports a green pass — the "⊆" claim is asserted over
the empty set. The vacuous-pass defect is genuine.

### Claude's fix is sound

Claude proposes adding two guards:

```typescript
expect.hasAssertions();
const retryMethods = (GatewayClient as unknown as { HERMES_BRIDGE_RETRY_METHODS: Set<string> }).HERMES_BRIDGE_RETRY_METHODS;
expect(retryMethods.size).toBeGreaterThan(0);
for (const method of retryMethods) {
  expect((client as any).shouldTraceRequest(method)).toBe(true);
}
```

- `expect.hasAssertions()` is the primary, type-agnostic guard. It fails the test
  if zero assertions executed — exactly the vacuous-loop failure mode. It stays
  correct even if `HERMES_BRIDGE_RETRY_METHODS` is later refactored from `Set` to
  another iterable.
- `expect(retryMethods.size).toBeGreaterThan(0)` is the secondary,
  intent-documenting guard. Claude verified at `gateway.ts:174` that the
  collection is declared `new Set<string>([...])`, so `.size` is the correct
  accessor (not `.length`). It encodes the real precondition of a subset test at
  the point a reader looks for it.

The two guards are complementary, not redundant: `hasAssertions()` catches the
general "no assertion ran" failure mode; `.size > 0` names the specific invariant
this test exists to protect. If the set is ever emptied, both fail loudly instead
of passing silently. The fix is correct, minimal, and introduces no i18n surface
(test-only change).

The fix matches what all three panelists independently proposed, which is
corroborating evidence that it is the canonical remediation. No flaw identified.
Claude keeps Issue 2.

---

## Final: OPENCODE STEALS POINTS

- Issue 1: VALID+FLAWED → OpenCode steals (zero-new-key fix reuses existing
  all-6-locales key; Claude's recommended fix unnecessarily expands i18n
  surface in violation of the repo's mandatory i18n discipline).
- Issue 2: VALID+SOUND → Claude keeps (fix is correct, minimal, and
  type-verified).

Net: OpenCode steals Issue 1's point; Claude retains Issue 2's point.