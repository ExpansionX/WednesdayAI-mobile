---
panelist: codex (GPT-5 / Codex CLI)
date: 2026-06-28
workstream: backend-descriptor
score: 9 pts (4th place)
findings: 3
reviewed_by: opencode
pass_rate: 3/3 (100%)
---

# Codex — Adversarial Panel Findings

Reviewed by: **opencode** (cross-review rotation)
Score: **9 pts** — 3 findings × 3 pts (all passed peer review)

Note: Fewest findings but 100% pass rate. GPT5-2 was the only finding across all four models to identify a UI-layer consequence of the backend gap — the only escalation beyond the operations layer.

---

## GPT5-1 — youmind falls through to OPENCLAW_OPERATIONS silently

**Location:** `gateway-backend-operations.ts:252-257` — `getGatewayBackendOperations`
**Severity:** Correctness

`getGatewayBackendOperations()` dispatches only on `hermes` and `wednesdayai`. A YouMind config silently inherits OpenClaw RPC methods despite `YOUMIND_CAPABILITIES` explicitly marking `gatewayConnection: false`, `modelSelection: false`, `configRead: false`, `configWrite: false`. The operations object will fire `model.get`, `config.get`, `config.patch` etc. to a YouMind connection.

**Remediation:**
Add `YOUMIND_OPERATIONS` with unsupported-error stubs and an explicit dispatch branch:
```ts
const YOUMIND_OPERATIONS: GatewayBackendOperations = {
  ...OPENCLAW_OPERATIONS,
  // Operations that are explicitly unsupported for YouMind (gatewayConnection: false)
  getCurrentModelState: () => { throw new Error('Gateway operations are not supported for YouMind backend'); },
  setModelSelection: () => { throw new Error('Gateway operations are not supported for YouMind backend'); },
  getModelSelectionState: () => { throw new Error('Gateway operations are not supported for YouMind backend'); },
  // ... other gateway-dependent operations
};

// in getGatewayBackendOperations:
if (kind === 'youmind') return YOUMIND_OPERATIONS;
```

Add tests asserting that unsupported methods throw deterministically rather than silently issuing OpenClaw RPC calls.

**Peer verdict (opencode):** PASS — confirmed; `getGatewayBackendOperations()` dispatches only on `hermes` and `wednesdayai` then defaults to `OPENCLAW_OPERATIONS`; `YOUMIND_CAPABILITIES` explicitly disables gateway operations making the silent fallthrough a real mismatch.

---

## GPT5-2 — ModelsScreen omits the youmind option in selectByBackend, silently renders OpenClaw ModelsView

**Location:** `ModelsScreen.tsx:89-116` — `selectByBackend()` call
**Severity:** UI correctness / silent wrong-screen rendering

`ModelsScreen.tsx` calls `selectByBackend()` with `wednesdayai`, `openclaw`, and `hermes` branches but omits `youmind`. `gateway-backends.ts:235` falls back `youmind` to `options.openclaw` when the `youmind` key is absent — so a YouMind config silently renders `ModelsView` and triggers model API calls that `YOUMIND_CAPABILITIES` says are unsupported.

This is the only finding in the panel that traces the backend gap to a visible UI consequence.

**Remediation:**
Pass an explicit youmind branch in the `selectByBackend` call at `ModelsScreen.tsx:89`:
```tsx
selectByBackend(backendKind, {
  wednesdayai: <WednesdayAIModelsView />,
  openclaw: <ModelsView />,
  hermes: <HermesModelsView />,
  youmind: <EmptyState title={t('Models not supported for YouMind')} />,
})
```

Add a render test:
```ts
it('renders an unsupported state for youmind configs', () => {
  render(<ModelsScreen />, { backendKind: 'youmind' });
  expect(screen.queryByTestId('models-view')).toBeNull();
  expect(screen.getByText('Models not supported for YouMind')).toBeTruthy();
});
```

**Peer verdict (opencode):** PASS — confirmed; `ModelsScreen.tsx:89-116` calls `selectByBackend()` with `wednesdayai`/`openclaw`/`hermes` but omits `youmind`; `gateway-backends.ts:235` falls back missing keys to `openclaw`, causing YouMind configs to render `ModelsView`.

---

## GPT5-3 — WednesdayAI test suite checks identity and one flag; does not verify the inherited OpenClaw method surface

**Location:** `gateway-backend-operations.test.ts:5-26` — existing describe block
**Severity:** Test coverage / false confidence

`WEDNESDAYAI_OPERATIONS` is `{ ...OPENCLAW_OPERATIONS }`. The test suite verifies only reference inequality (`.not.toBe`) and `usesConnectHandshake`. It does not verify that `getBaseUrl`, `getCurrentModelState`, `setModelSelection`, `getConfig`, `fetchToolsCatalog`, or `listModels` dispatch the correct RPC methods. An accidental override would pass all current tests.

**Remediation:**
Add behavioral tests for key inherited methods:
```ts
describe('WEDNESDAYAI_OPERATIONS method dispatch', () => {
  let spy: jest.MockedFn<GatewayRequestFn>;
  beforeEach(() => { spy = jest.fn().mockResolvedValue({}); });

  it('getCurrentModelState dispatches model.get (same as OpenClaw, not model.current)', async () => {
    const ops = getGatewayBackendOperations({ backendKind: 'wednesdayai' } as any);
    await ops.getCurrentModelState(spy);
    expect(spy).toHaveBeenCalledWith('model.get', expect.anything());
  });

  it('getBaseUrl strips /ws matching the OpenClaw pattern', () => {
    const ops = getGatewayBackendOperations({ backendKind: 'wednesdayai' } as any);
    expect(ops.getBaseUrl({ url: 'wss://host/ws' } as any)).toBe('https://host');
    // Confirm it does NOT use the Hermes /v1/hermes/ws pattern
    expect(ops.getBaseUrl({ url: 'wss://host/v1/hermes/ws' } as any)).not.toBe('https://host');
  });

  it('setModelSelection dispatches model.set', async () => {
    const ops = getGatewayBackendOperations({ backendKind: 'wednesdayai' } as any);
    await ops.setModelSelection(spy, 'claude-3-5-sonnet');
    expect(spy).toHaveBeenCalledWith('model.set', expect.objectContaining({ model: 'claude-3-5-sonnet' }));
  });
});
```

**Peer verdict (opencode):** PASS — confirmed; `gateway-backend-operations.test.ts` contains only 4 tests (reference inequality + `usesConnectHandshake` flags) with no behavioral tests for `getBaseUrl`, `getCurrentModelState`, `setModelSelection`, or config/tool methods on `WEDNESDAYAI_OPERATIONS`.
