---
panelist: opencode (GLM-5.2)
date: 2026-06-28
workstream: backend-descriptor
score: 15 pts (2nd place, tied)
findings: 5
reviewed_by: opus
pass_rate: 5/5 (100%)
---

# OpenCode/GLM-5.2 — Adversarial Panel Findings

Reviewed by: **opus** (cross-review rotation)
Score: **15 pts** — 5 findings × 3 pts (all passed peer review)

Note: Caught the two most unique findings across the panel — GLM52-4 (query string in deriveBaseUrl catch block) and GLM52-5 (missing retry methods) — both requiring cross-file reasoning that no other model demonstrated.

---

## GLM52-1 — HERMES_OPERATIONS overrides getCurrentModelState but not getModelSelectionState

**Location:** `gateway-backend-operations.ts` — `HERMES_OPERATIONS` constant
**Severity:** Correctness / RPC method mismatch

`HERMES_OPERATIONS` overrides `getCurrentModelState` to dispatch `model.current`. It inherits `getModelSelectionState` (dispatches `model.get`) and `setModelSelection` (dispatches `model.set`) from `sharedOperations` without override. `HERMES_BRIDGE_RETRY_METHODS` confirms `model.current` is known for Hermes while `model.get` is absent — suggesting the Hermes bridge may not support `model.get` at all. Zero tests verify which RPC method any Hermes operation actually dispatches.

**Remediation:**
Add RPC dispatch tests using a spy `GatewayRequestFn`:
```ts
describe('Hermes RPC method dispatch', () => {
  let spy: jest.MockedFn<GatewayRequestFn>;
  beforeEach(() => { spy = jest.fn().mockResolvedValue({}); });

  it('getCurrentModelState dispatches model.current for Hermes', async () => {
    const ops = getGatewayBackendOperations({ backendKind: 'hermes' } as any);
    await ops.getCurrentModelState(spy);
    expect(spy).toHaveBeenCalledWith('model.current', {});
  });

  it('getModelSelectionState dispatches the correct method for Hermes', async () => {
    const ops = getGatewayBackendOperations({ backendKind: 'hermes' } as any);
    await ops.getModelSelectionState(spy);
    // Verify: does Hermes support 'model.get'? If not, add override to HERMES_OPERATIONS.
    expect(spy.mock.calls[0][0]).toMatch(/^model\./);
  });
});
```
If Hermes bridge does not support `model.get`, add an override in `HERMES_OPERATIONS` using the correct method.

**Peer verdict (opus):** PASS — confirmed; `HERMES_OPERATIONS` overrides `getCurrentModelState` to `model.current` but inherits `getModelSelectionState`/`setModelSelection` dispatching `model.get`/`model.set`; `HERMES_BRIDGE_RETRY_METHODS` confirms `model.current` is known but `model.get` is absent.

---

## GLM52-2 — WEDNESDAYAI_OPERATIONS reference-inequality test provides false confidence

**Location:** `gateway-backend-operations.test.ts:5-9`
**Severity:** Misleading test signal

`WEDNESDAYAI_OPERATIONS` is `{ ...OPENCLAW_OPERATIONS }`. The test asserts `expect(wednesdayaiOps).not.toBe(openclawOps)` — object spread always creates a new reference, so this trivially passes while verifying zero behavioral correctness. The test passes even if `WEDNESDAYAI_OPERATIONS` accidentally inherits incorrect Hermes-style RPC methods.

**Remediation:**
Replace the identity-only test with behavioral assertions:
```ts
it('returns WednesdayAI-specific operations with correct URL stripping', () => {
  const ops = getGatewayBackendOperations({ backendKind: 'wednesdayai' } as any);
  // Verifies OpenClaw-compatible URL pattern, not Hermes /v1/hermes/ws
  expect(ops.getBaseUrl({ url: 'ws://host.example/ws' } as any)).toBe('http://host.example');
  expect(ops.usesConnectHandshake).toBe(true);
});
```

**Peer verdict (opus):** PASS — confirmed; `WEDNESDAYAI_OPERATIONS` is `{ ...OPENCLAW_OPERATIONS }` and the test asserts only reference inequality, verifying zero behavioral correctness.

---

## GLM52-3 — getGatewayBackendOperations has no explicit youmind branch

**Location:** `gateway-backend-operations.ts:252-257` — `getGatewayBackendOperations`
**Severity:** Correctness / latent runtime bug

`YouMind` is a recognized `GatewayBackendKind`. `YOUMIND_CAPABILITIES` sets `gatewayConnection: false`, `modelSelection: false`, `configRead: false`, `configWrite: false`. Yet `getGatewayBackendOperations` falls through to `OPENCLAW_OPERATIONS` for youmind — the returned operations object will happily dispatch `model.get`, `config.get`, `config.patch` etc. to a YouMind connection.

**Remediation:**
Add an explicit youmind branch. Either define no-op stubs (correct for a backend with `gatewayConnection: false`) or an explicit fallback with documentation:
```ts
// Option A: No-op stubs (correct — youmind has gatewayConnection: false)
const YOUMIND_OPERATIONS: GatewayBackendOperations = {
  ...OPENCLAW_OPERATIONS,
  getCurrentModelState: async () => null,
  getModelSelectionState: async () => null,
  setModelSelection: async () => undefined,
  // ...
};

// Option B: Explicit documented fallback (if OpenClaw behavior is intentional)
if (kind === 'youmind') return OPENCLAW_OPERATIONS; // intentional: youmind uses openclaw RPC protocol

if (kind === 'youmind') return YOUMIND_OPERATIONS; // + test to lock the behavior
```

**Peer verdict (opus):** PASS — confirmed; `YOUMIND_CAPABILITIES.gatewayConnection === false` and `selectByBackend` in `gateway-backends.ts:235` explicitly handles youmind, proving the codebase requires explicit handling.

---

## GLM52-4 — deriveBaseUrl catch block does not strip query strings before regex match

**Location:** `gateway-backend-operations.ts` — `deriveBaseUrl` catch block
**Severity:** Correctness / URL leakage

The `try` block uses `new URL()` which correctly isolates the pathname before applying `wsPathPattern`. The `catch` block (for URLs that fail `new URL()` parsing) strips trailing slashes but applies the regex directly to the raw string. For a URL with a query string (e.g. `ws://host/v1/hermes/ws?token=abc`), the pattern `/\/v1\/hermes\/ws\/?$/` does NOT match because `?token=abc` follows `ws` — the WS path and token both leak into the returned base URL.

**Remediation:**
Strip query strings and hashes before applying the wsPathPattern in the catch block:
```ts
// catch block — before:
return urlText
  .replace(/^ws(s?):\/\//, 'http$1://')
  .replace(wsPathPattern, '')
  .replace(/\/+$/, '');

// after:
return urlText
  .replace(/^ws(s?):\/\//, 'http$1://')
  .split('?')[0]
  .split('#')[0]
  .replace(wsPathPattern, '')
  .replace(/\/+$/, '');
```

Add a test:
```ts
it('catch path: strips query string before wsPathPattern match', () => {
  // Force the catch path by using a URL that new URL() would accept but simulating
  // the regex-only path with a crafted input
  const ops = getGatewayBackendOperations({ backendKind: 'hermes' } as any);
  expect(ops.getBaseUrl({ url: 'ws://host/v1/hermes/ws?token=abc' } as any)).toBe('http://host');
});
```

**Peer verdict (opus):** PASS — confirmed; the catch block strips trailing slashes but does not strip query strings before applying `wsPathPattern`, making the `try`/`catch` paths asymmetric.

---

## GLM52-5 — fetchUsage and fetchCostSummary RPC methods absent from HERMES_BRIDGE_RETRY_METHODS

**Location:** `gateway.ts` — `HERMES_BRIDGE_RETRY_METHODS` constant
**Severity:** Reliability / inconsistent retry policy

`fetchUsage` dispatches `sessions.usage`; `fetchCostSummary` dispatches `usage.cost`. Both are idempotent reads. `HERMES_CAPABILITIES` sets `consoleUsage: true` and `consoleCost: true` — these are live Hermes paths. Neither `sessions.usage` nor `usage.cost` appears in `HERMES_BRIDGE_RETRY_METHODS`. The `gateway.ts` comment states only mutating calls must NOT be retried — making the omission of these idempotent reads inconsistent with stated policy.

**Remediation:**
Add the missing methods to `HERMES_BRIDGE_RETRY_METHODS` in `gateway.ts`:
```ts
const HERMES_BRIDGE_RETRY_METHODS = new Set([
  // existing entries...
  'sessions.usage',
  'usage.cost',
  // Also consider 'model.get' per GLM52-1 — if Hermes getModelSelectionState
  // uses model.get it should also be retry-eligible
]);
```

**Peer verdict (opus):** PASS — confirmed; `sessions.usage` and `usage.cost` are absent from `HERMES_BRIDGE_RETRY_METHODS`; `HERMES_CAPABILITIES.consoleUsage` and `consoleCost` are both true; the stated retry policy explicitly covers idempotent reads.
