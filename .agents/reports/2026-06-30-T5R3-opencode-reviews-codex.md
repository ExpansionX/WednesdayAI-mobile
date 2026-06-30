# T5 Round 3 — OpenCode Adversarially Reviews Codex

Panelist: OpenCode
Target: Codex R2 remediation proposals (X1, X2)
Verdict key: VALID+SOUND (Codex keeps points) · VALID+FLAWED (steal attempt) · INVALID (no points)

---

## X1 — Subset test couples to private static

### Verdict: VALID+FLAWED

The finding is real: the test at `gateway.test.ts:2199-2206` accesses the private static `HERMES_BRIDGE_RETRY_METHODS` via an `as unknown as` cast (`gateway.test.ts:2201`), and that cast is fragile under rename. But Codex's fix is flawed in three concrete ways, and a superior fix exists that Codex cannot defeat.

### Why the finding is real (with a correction to Codex's framing)

The cast at `gateway.test.ts:2201`:
```typescript
const retryMethods = (GatewayClient as unknown as { HERMES_BRIDGE_RETRY_METHODS: Set<string> }).HERMES_BRIDGE_RETRY_METHODS;
```
does break loudly if the field is renamed — `retryMethods` becomes `undefined`, `retryMethods.size` throws `TypeError`, and `expect.hasAssertions()` (`gateway.test.ts:2200`) fails because no assertion ran. So the "silently vacuously passes on an undefined set" branch of Codex's claim is **incorrect**: the failure mode is a hard test error, not a silent vacuous pass. The "test breaks" branch is correct. The smell (private-cast coupling) is real either way.

### Why Codex's fix is flawed

**Flaw 1 — The fix trades one fragility for a worse one.** The original test dynamically iterates the set, so if a 14th method is added to `HERMES_BRIDGE_RETRY_METHODS` (`gateway.ts:174-188`), the subset test automatically covers it. Codex's `it.each([...13 methods...])` hardcodes the list. When the set grows, the hardcoded list goes stale **silently** — the new method is never checked against `shouldTraceRequest`, and nothing fails. This is a strictly worse failure mode than the original: the original breaks loudly on rename; the fix breaks silently on addition. Silent non-coverage of an invariant is more dangerous than a hard test error.

**Flaw 2 — The fix changes the tested invariant from "subset" to "explicit list is traced."** The original test name and body assert the subset relation `HERMES_BRIDGE_RETRY_METHODS ⊆ shouldTraceRequest`. Codex's `it.each` version asserts only "these 13 strings return `true` from `shouldTraceRequest`" — it no longer ties the assertion to the retry set at all. If a future method is added to `HERMES_BRIDGE_RETRY_METHODS` but omitted from `shouldTraceRequest` (`gateway.ts:2776-2796`), the original test catches the regression; Codex's fix does not. The invariant the test exists to guard is no longer tested.

**Flaw 3 — The fix keeps a private cast on `shouldTraceRequest`.** Codex's replacement still reads `(client as any).shouldTraceRequest(method)`. So the "privacy bypass" concern is only half-addressed: one private cast (`HERMES_BRIDGE_RETRY_METHODS`) is removed at the cost of weakening the invariant, while the other private cast (`shouldTraceRequest`) remains. The net privacy-coupling reduction is one cast, and the net invariant coverage reduction is the entire subset property.

### OpenCode's superior fix

Export both sets as module-level constants and let the test assert subset directly against two exported references — no private casts, dynamic coverage preserved, rename breaks loudly at compile time.

```typescript
// gateway.ts — replace the private static with an exported constant
export const HERMES_BRIDGE_RETRY_METHODS = new Set<string>([
  'sessions.list', 'chat.history', 'last-heartbeat', 'models.list',
  'model.current', 'model.get', 'agents.list', 'agent.identity.get',
  'sessions.usage', 'usage.cost', 'config.get', 'tools.catalog',
  'agents.files.list',
]);

export const HERMES_BRIDGE_TRACED_METHODS = new Set<string>([
  'connect', 'sessions.list', 'chat.history', 'last-heartbeat',
  'agents.list', 'agent.identity.get', 'models.list', 'model.current',
  'model.get', 'sessions.usage', 'usage.cost', 'config.get',
  'tools.catalog', 'agents.files.list',
]);

// inside GatewayClient
private shouldTraceRequest(method: string): boolean {
  return HERMES_BRIDGE_TRACED_METHODS.has(method);
}
```

```typescript
// gateway.test.ts — subset invariant, no private casts, dynamic coverage
it('HERMES_BRIDGE_RETRY_METHODS ⊆ HERMES_BRIDGE_TRACED_METHODS: every retry method is also traced', () => {
  expect(HERMES_BRIDGE_RETRY_METHODS.size).toBeGreaterThan(0);
  for (const method of HERMES_BRIDGE_RETRY_METHODS) {
    expect(HERMES_BRIDGE_TRACED_METHODS.has(method)).toBe(true);
  }
});
```

### Why this beats Codex's fix on every axis

| Axis | Original test | Codex's fix | OpenCode's fix |
|------|--------------|-------------|----------------|
| Rename failure mode | Hard test error | N/A (no reference to source set) | Compile error (import breaks) |
| Addition drift | Auto-covered | **Silent non-coverage** | Auto-covered |
| Invariant tested | True subset relation | "These 13 are traced" | True subset relation |
| Private casts | 2 | 1 | 0 |
| Behavioral equivalence to production `shouldTraceRequest` | Via method call | Via method call | Via same set the method uses |

Codex's fix weakens the invariant and introduces silent staleness; OpenCode's fix removes both private casts, preserves the dynamic subset invariant, and converts rename fragility from a runtime test error to a compile-time import error. Codex cannot defeat this without adopting the same export-both-sets approach, at which point the fixes are equivalent and the steal fails on the "better" axis.

---

## X2 — `config.get` retry test only proves first of two retries

### Verdict: VALID+SOUND

The finding is real and Codex's fix is structurally correct. I will not attempt a steal because no superior fix exists — the alternative (leaving the test as-is) is defensible but not clearly better, and Codex's fix is harmless and correct.

### Why the finding is real

The production delay array at `gateway.ts:151` is `HERMES_BRIDGE_UNAVAILABLE_RETRY_DELAYS_MS = [750, 750]` — two retries. The retry loop at `gateway.ts:1390-1400` iterates `for (attempt = 0; attempt <= delays.length; attempt++)`, so for a two-element delay array it can run attempts 0, 1, and 2 (three `sendRequest` calls total).

The existing `config.get` test at `gateway.test.ts:2154-2177` mocks `mockRejectedValueOnce(...)` once and `mockResolvedValue(...)` thereafter, advances `jest.advanceTimersByTime(750)` once, and asserts `toHaveBeenCalledTimes(2)`. It exercises only attempts 0 → 1 (one retry), never reaching the `attempt >= delays.length` boundary at `gateway.ts:1395` for the `config.get` path. The test name says "retries ... config.get" but only proves the first of two retries succeeds.

### Why Codex's fix is sound

Codex's proposed test rejects twice, advances 750ms twice, and asserts 3 calls. This mirrors the production loop exactly:
- attempt 0: rejects → `attempt < delays.length` (0 < 2) → sleep `delays[0]` = 750ms
- attempt 1: rejects → `attempt < delays.length` (1 < 2) → sleep `delays[1]` = 750ms
- attempt 2: resolves → returns

The structure at `gateway.ts:1388-1400` uses `delays[attempt]` where `attempt` is the just-failed attempt index, so `delays[0]` then `delays[1]` is correct. The fix's `mockRejectedValueOnce` ×2 + `mockResolvedValue` sequence and two `advanceTimersByTime(750)` calls match this. The assertion `toHaveBeenCalledTimes(3)` correctly pins the loop's terminal boundary. The fix is correct.

### Caveat on severity (not a flaw in the fix)

The two-retry loop mechanics are already pinned for the shared retry path by the `sessions.list` test at `gateway.test.ts:2016-2049` (reject twice, advance 750 twice, assert 3 calls). `config.get` and `sessions.list` both route through the same `sendRequestWithHermesBridgeRetry` (`gateway.ts:1385-1403`) and share the same `delays` array (`gateway.ts:1388`); the only per-method difference is eligibility via `isHermesRelayBridgeRetryEligible` (`gateway.ts:1405-1409`). So Codex's `config.get` two-retry test is largely a method-name variant of the `sessions.list` two-retry test — the additive value is proving the second delay also applies to `config.get`, which is guaranteed by the shared code path.

This makes the finding's severity **low** rather than a true coverage hole: the loop's two-retry behavior is not untested in the suite, it is tested under `sessions.list`. But the finding is not a false positive — the `config.get` test does under-claim relative to its name, and Codex's fix closes that gap harmlessly and correctly. VALID+SOUND; Codex keeps the points.

---

## Summary

| Finding | Verdict | Steal attempt |
|---------|---------|---------------|
| X1 — Subset test couples to private static | VALID+FLAWED | Yes — export both sets, assert subset without casts |
| X2 — `config.get` retry test only proves first of two retries | VALID+SOUND | No — fix is correct, no superior alternative |