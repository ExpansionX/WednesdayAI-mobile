# Adversarial Code Review — Round 3: OpenCode/GLM Panelist vs Opus Remediations

**Panelist**: OpenCode/GLM-5.2
**Date**: 2026-06-29
**Mode**: Adversarial peer review of R2 Opus remediation proposals
**Files Reviewed**:
- `apps/mobile/src/services/gateway-backend-operations.ts`
- `apps/mobile/src/services/gateway-backend-operations.test.ts`
- `apps/mobile/src/services/gateway.ts:140-270`
- `.agents/reports/2026-06-29-R2-opus-remediation-proposals.md`

---

## REVIEW-2: REMEDIATION-2 — `deriveBaseUrl` catch path nested `new URL()` validation
**Verdict**: PARTIAL-DEFEAT
**Confidence**: High

### Why the core fix is correct

The nested `new URL(stripped)` guard correctly catches malformed hosts like `[invalid` (unterminated IPv6 bracket) that pass the superficial `/^https?:\/\//` regex check. `new URL('http://[invalid')` does throw, so returning null is the right behavior. The code change is sound in isolation.

### Why it is a PARTIAL-DEFEAT — the test rewrite destroys the GLM52-4 regression guard

The existing test at `gateway-backend-operations.test.ts:93-100` is named:

```text
'catch path: strips query string before applying wsPathPattern (GLM52-4 regression)'
```

and asserts:
```typescript
expect(ops.getBaseUrl({ url: 'ws://[invalid/v1/hermes/ws?token=abc' } as any))
  .toBe('http://[invalid');
```

This test was written to lock in the **query-string stripping** behavior of the catch path (`urlText.split('?')[0]` at line 298). The malformed host `[invalid` was chosen specifically because it forces the catch path, while the `?token=abc` suffix is the actual regression trigger — before GLM52-4, the unstripped query prevented `wsPathPattern` from matching and the full path leaked into the result.

Opus's proposed rewrite changes the assertion to `toBeNull()`:

```typescript
expect(ops.getBaseUrl({ url: 'ws://[invalid/v1/hermes/ws?token=abc' } as any))
  .toBeNull();
```

With the new nested `new URL()` guard, `new URL('http://[invalid/v1/hermes/ws?token=abc')` throws regardless of whether `.split('?')[0]` ran. The test now passes **even if someone deletes the `.split('?')[0]` line entirely** — the second guard masks the regression the original test was designed to catch.

### Concrete failure scenario

1. Future refactor accidentally removes `.split('?')[0]` from the catch path (line 298).
2. The GLM52-4 regression returns: a valid host with a query string would have the path leak into the result on the catch path.
3. Opus's rewritten test still passes, because for the chosen input `[invalid`, the nested `new URL()` throws and returns null independent of query stripping.
4. The regression ships.

### What a correct fix would require

Keep the existing GLM52-4 regression test asserting the stripped form, AND add a SEPARATE test for the malformed-host null-return behavior using an input that does NOT have a query string:

```typescript
it('catch path: strips query string before applying wsPathPattern (GLM52-4 regression)', () => {
  // Use a host that is valid enough to pass new URL() after stripping,
  // so the test actually exercises the split('?')[0] line.
  const ops = getGatewayBackendOperations({ backendKind: 'hermes' } as any);
  expect(ops.getBaseUrl({ url: 'ws://example.invalid.host.for.test/v1/hermes/ws?token=abc' } as any))
    .toBe('http://example.invalid.host.for.test');
});

it('catch path: returns null for malformed hostname that cannot be validated (GLM52-4 nested guard)', () => {
  const ops = getGatewayBackendOperations({ backendKind: 'hermes' } as any);
  expect(ops.getBaseUrl({ url: 'ws://[invalid/v1/hermes/ws' } as any))
    .toBeNull();
});
```

Opus conflated two independent regressions into one test and lost one of the guards. The code change is correct; the test change is flawed.

---

## REVIEW-3: REMEDIATION-3 — Tests asserting WednesdayAI/YouMind method references equal OpenClaw
**Verdict**: SURVIVES
**Confidence**: High

### Why it survives

`WEDNESDAYAI_OPERATIONS = { ...OPENCLAW_OPERATIONS }` (line 267-269) creates a new object via spread, which copies own enumerable property references. The methods (`listModels`, `getCurrentModelState`, etc.) are defined as own properties on `OPENCLAW_OPERATIONS`, so the spread copies their function references. `wednesdayaiOps.listModels === openclawOps.listModels` is true, and the test correctly documents this intentional design choice.

The existing tests at lines 32-47 only assert object-level non-identity (`not.toBe`). Adding method-level identity assertions documents the design contract that was previously only implicit. The test is accurate, passes on the current implementation, and guards against accidental future divergence where someone re-implements a method on `WEDNESDAYAI_OPERATIONS` thinking it only affects wednesdayai.

Low value, but correct and complete. No new issues introduced.

---

## REVIEW-4: REMEDIATION-4 — Three youmind `getBaseUrl` edge-case tests
**Verdict**: SURVIVES
**Confidence**: Medium

### Why it survives

The three proposed tests (null config, `ws://` non-TLS, `wss://` with query string) mirror the existing OpenClaw tests at lines 83-91 and 109-112. Since `YOUMIND_OPERATIONS = { ...OPENCLAW_OPERATIONS }` (line 275-277) inherits `getBaseUrl` by reference, these tests pass on the current implementation and serve as regression guards if youmind later diverges to its own `getBaseUrl` override.

Opus is honest about the redundancy ("essentially redundant given youmind inherits openclaw behavior") and correctly frames them as divergence guards. The test inputs and expected outputs are accurate:
- `ops.getBaseUrl(null)` → `null` (line 288 early return)
- `ops.getBaseUrl({ url: 'ws://localhost:3000/ws' })` → `'http://localhost:3000'` (try path, wsPathPattern strips `/ws`)
- `ops.getBaseUrl({ url: 'wss://example.com/ws?token=abc' })` → `'https://example.com'` (try path strips query via `url.search = ''`)

No new issues introduced. The medium confidence reflects only that this is defensive test coverage with no behavioral change to verify, not a concern about correctness.

---

## REVIEW-6: REMEDIATION-6 — RPC error propagation tests for `fetchUsage`/`fetchCostSummary`
**Verdict**: SURVIVES
**Confidence**: High

### Why it survives

The implementations of `fetchUsage` (lines 199-218) and `fetchCostSummary` (lines 219-234) both use `await request<T>(...)` with no try/catch. A rejecting `request` propagates the error to the caller. The proposed tests use `jest.fn().mockRejectedValue(new Error('RPC timeout'))` and assert `.rejects.toThrow('RPC timeout')`, which correctly verifies both that the error propagates AND that it is not wrapped or swallowed.

The tests guard against a realistic regression: someone adding a `catch { return {} as UsageResult; }` to mask backend errors would silently break the caller's error handling. The test inputs match the `GatewayRequestFn` contract (the spy is cast `as any` to satisfy the type, which is the existing test-file convention).

The date params `{ startDate: '2026-01-01', endDate: '2026-01-31' }` are accepted by both function signatures. No new issues introduced.

---

## REVIEW-7: REMEDIATION-7 — Clarifying comment on `HERMES_BRIDGE_RETRY_METHODS`
**Verdict**: SURVIVES
**Confidence**: High

### Why it survives

The proposed comment is accurate against the code:

1. `getCurrentModelState` for Hermes dispatches `model.current` — verified at `gateway-backend-operations.ts:254` (`HERMES_OPERATIONS.getCurrentModelState` override).
2. `getModelSelectionState` for Hermes dispatches `model.get` — `HERMES_OPERATIONS` does not override `getModelSelectionState`, so it inherits from `sharedOperations` (line 125-135), which dispatches `model.get` at line 126.
3. Both `model.current` and `model.get` are read-only and safe to retry — neither mutates backend state.
4. The existing comment at `gateway.ts:152-154` already states the "idempotent reads only" policy; the proposed addition extends it with the specific reason for the `model.current`/`model.get` asymmetry, which is the non-obvious part.

Pure documentation change, no behavioral risk, no new issues. The inline `// Hermes lightweight model state` and `// Full model state with models/providers` comments on the two set entries correctly identify which caller uses which RPC.

---

## Summary

| Remediation | Verdict | Confidence | Key Reason |
|-------------|---------|------------|------------|
| REMEDIATION-2 | PARTIAL-DEFEAT | High | Test rewrite destroys the GLM52-4 query-stripping regression guard; nested `new URL()` masks the line the original test was protecting |
| REMEDIATION-3 | SURVIVES | High | Correct method-reference identity assertions; documents intentional spread-based design |
| REMEDIATION-4 | SURVIVES | Medium | Correct defensive tests for inherited youmind behavior; honestly redundant but valid as divergence guards |
| REMEDIATION-6 | SURVIVES | High | Correct error-propagation tests; guards against future error-swallowing regressions |
| REMEDIATION-7 | SURVIVES | High | Accurate documentation of non-obvious `model.current`/`model.get` asymmetry |

**Net result**: 4 of 5 remediations survive. REMEDIATION-2 is a partial-defeat — the code fix is correct but the accompanying test rewrite reintroduces a coverage gap for the exact regression (GLM52-4) the original test was written to prevent. The fix can be salvaged by keeping the original test (with a query-bearing input on a parseable host) and adding a separate null-return test for the malformed-host case.
