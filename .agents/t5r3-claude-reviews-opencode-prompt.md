# T5 Adversarial Review — Round 3: Claude Adversarially Reviews OpenCode

You are the Claude panelist in Round 3. Your task is to adversarially challenge OpenCode's Round 2
remediation proposals (O1, O3, O4, O10). For each, determine:
- VALID+SOUND: finding is real and fix is correct — OpenCode keeps points
- VALID+FLAWED: finding is real but fix has problems — you can attempt to steal by providing a
  better fix that OpenCode cannot defeat
- INVALID: finding is a false positive — no points for anyone

Read-only only. Do NOT run shell commands.

## OpenCode's R1 Findings and R2 Remediation Proposals

### O1 — `useGatewayRuntimeSettings` over-eager for YouMind
**Finding:** `ModelsScreen` calls `useGatewayRuntimeSettings` and computes `modelConfig` unconditionally
for all backends, including YouMind which only renders a static `EmptyState`. The hook's capability
gating (configRead: false, configWrite: false for YouMind) prevents network I/O, but still allocates
~15 useState allocations, one no-op useEffect, one useMemo whose output is never read.

**OpenCode's fix:** Split `ModelsScreen` into 3 components:
1. `ModelsScreen` (thin dispatcher) — reads `config` via `useAppContext()` only, dispatches to either
   `YouMindModelsScreen` or `ModelsScreenInner` based on backend kind
2. `YouMindModelsScreen` (new file) — renders the EmptyState + modal header, NO hook calls beyond
   useTranslation, useNavigation, useNativeStackModalHeader
3. `ModelsScreenInner` (new file) — contains the current ModelsScreen body minus the youmind branch

The proposal claims this is "hooks-safe" because ModelsScreen always calls useAppContext first.

**Your adversarial task for O1:**
- Is the finding itself real? (Yes, the hook runs wasted work for YouMind — but the hook's capability
  gating prevents actual I/O, so severity is very low)
- Is the fix correct? Specifically:
  - Can you call `resolveGatewayBackendKind(config)` before hooks and return early? Or does this
    violate React's rules of hooks?
  - Is the fix proportionate to the severity? A screen split that introduces 2 new files for a pure
    performance nit (no observable behavior difference) — is this justified?
  - Does the fix risk any regression for wednesdayai, openclaw, or hermes backends?
- If the fix is valid+sound, OpenCode keeps points. If it's disproportionate or introduces regression
  risk, you can challenge it and attempt to steal by proposing a simpler fix.

**Relevant context:** In React, you can return early after hooks have already been called — what you
CANNOT do is call hooks conditionally. The question is whether returning a different component before
calling `useGatewayRuntimeSettings` counts as a "conditional hook call". Answer: it does NOT, because
`ModelsScreen` itself would no longer call `useGatewayRuntimeSettings` at all — it's moved to
`ModelsScreenInner`. Each component has a constant hook call order. This is hooks-compliant.

### O3 — `deriveBaseUrl` catch comment accuracy
**Finding:** Comment references "nested `new URL()` guard" and "both branches" which no longer exist.

**OpenCode's fix:**
```typescript
} catch {
  // new URL() is the only operation that can throw in the try block; the
  // scheme swap is a plain string replace and never fails. Once the URL
  // object is constructed, the subsequent hash/search/pathname mutations
  // run on a valid URL instance and cannot throw. So reaching this catch
  // means the input was too malformed to parse even after the ws→http
  // scheme rewrite, and there is nothing left to attempt — return null.
  return null;
}
```

### O4 — Retry test does not assert params on second call
**Finding:** The `config.get` one-retry test doesn't verify that the retry re-sends the same params.

**OpenCode's fix:** Add assertions:
```typescript
expect(sendRequestSpy).toHaveBeenNthCalledWith(1, 'config.get', {});
// ...
expect(sendRequestSpy).toHaveBeenNthCalledWith(2, 'config.get', {});
```

### O10 — `config.get` second retry not tested
**Finding:** `HERMES_BRIDGE_UNAVAILABLE_RETRY_DELAYS_MS = [750, 750]` (2 retries) but the existing
`config.get` test only exercises one retry.

**OpenCode's fix:** Add a new test that rejects twice, advances 750ms twice, asserts 3 calls and the
resolved value `{ config: { heartbeat: { every: '5m' } }, hash: 'def456' }`.

## Your task

For each proposal (O1, O3, O4, O10):
1. State VALID+SOUND / VALID+FLAWED / INVALID with clear reasoning
2. If VALID+FLAWED: state what specifically is wrong and propose your better fix
3. If INVALID: explain why the finding was a false positive

Write your report to `.agents/reports/2026-06-30-T5R3-claude-reviews-opencode.md`.
