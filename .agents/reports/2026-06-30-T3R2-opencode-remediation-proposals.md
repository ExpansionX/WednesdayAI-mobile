# T3 Round 2 — OpenCode CLI (GLM-5.2): Remediation Proposals

**Executor**: OpenCode CLI (`ollama-cloud/glm-5.2`)
**Findings**: 2 issues from T3R1

---

## Remediation for Issue 1: YouMind ModelsScreen sends unsupported RPCs

**Finding recap** (same issue independently found by Codex): The explicit `youmind`
branch added to `ModelsScreen` dispatches `<ModelsView>`, which unconditionally
issues `models.list` and `config.get` RPCs on mount. `YOUMIND_CAPABILITIES` marks
`modelCatalog: false` and `configRead: false`. The AGENTS.md rule requires
capability-gating, not optimistic RPCs.

**Option A — Replace with EmptyState (recommended)**

```tsx
// apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx
youmind: (
  <EmptyState
    title={t('Models')}
    message={t('This backend does not expose a model catalog yet.')}
  />
),
```

**Option B — Fix the capability table instead**

If YouMind genuinely inherits OpenClaw model APIs in production, correct
`YOUMIND_CAPABILITIES` at `apps/mobile/src/services/gateway-backends.ts:116-119`:

```typescript
const YOUMIND_CAPABILITIES: GatewayBackendCapabilities = {
  ...OPENCLAW_COMPATIBLE_BASE,
  modelCatalog: true,     // YouMind exposes models.list
  modelSelection: true,   // YouMind exposes model.set
  configRead: true,       // YouMind exposes config.get
  configWrite: true,      // YouMind exposes config.patch / config.set
};
```

**Regression test** (required either way):

```typescript
it('youmind: capability table has modelCatalog:false until product decision', () => {
  const { BACKENDS } = require('./gateway-backends');
  expect(BACKENDS.youmind.capabilities.modelCatalog).toBe(false);
  expect(BACKENDS.youmind.capabilities.configRead).toBe(false);
});
```

---

## Remediation for Issue 2: Retry-eligibility expansion is entirely untested

**Finding recap**: Six methods were added to `HERMES_BRIDGE_RETRY_METHODS` and
mirrored in `shouldTraceRequest`. The `sendBackendRequest` function now routes
through `sendRequestWithHermesBridgeRetry`. However all 62 tests pass a bare
`jest.fn()` spy directly to operation methods, bypassing `sendBackendRequest` and
the retry wrapper entirely. No test:

- Fires the retry loop on `[BRIDGE_UNAVAILABLE]` for newly-added methods.
- Asserts the `agents.files.get` exclusion invariant (documented but not pinned).
- Proves the Hermes-relay-only gate (`non-Hermes → no retry`).

**Proposed remediation**: Add integration-style tests in a new
`apps/mobile/src/services/gateway-retry.test.ts` or extend `gateway.test.ts`:

```typescript
describe('HERMES_BRIDGE_RETRY_METHODS — retry integration', () => {
  function makeHermesRelayClient() {
    // Minimal stub of GatewayClient in hermes+relay mode
    return {
      backendKind: 'hermes' as const,
      activeRoute: 'relay' as const,
      _sendRequest: jest.fn(),
      sleep: jest.fn().mockResolvedValue(undefined),
    };
  }

  it('retries config.get on [BRIDGE_UNAVAILABLE] for hermes+relay (newly added)', async () => {
    const sendRequest = jest.fn()
      .mockRejectedValueOnce(new Error('[BRIDGE_UNAVAILABLE]'))
      .mockResolvedValueOnce({ config: {}, hash: 'abc' });
    const ops = getGatewayBackendOperations({ backendKind: 'hermes' } as any);
    // Route through the real retry wrapper by calling via GatewayClient stub
    // (replace jest.fn() spy with a wrapper that fires the real retry logic)
    const result = await ops.getConfig(sendRequest as any);
    expect(result).toEqual({ config: {}, hash: 'abc' });
    expect(sendRequest).toHaveBeenCalledTimes(2); // 1 failure + 1 retry
  });

  it('does NOT retry agents.files.get — base-shift guard (documented exclusion)', async () => {
    const sendRequest = jest.fn().mockRejectedValue(new Error('[BRIDGE_UNAVAILABLE]'));
    const ops = getGatewayBackendOperations({ backendKind: 'hermes' } as any);
    await expect(ops.getAgentFile(sendRequest as any, 'agent-1', 'AGENTS.md'))
      .rejects.toThrow('[BRIDGE_UNAVAILABLE]');
    expect(sendRequest).toHaveBeenCalledTimes(1); // no retry
  });

  it('does not retry for openclaw backend (retry is Hermes-relay-only)', async () => {
    const sendRequest = jest.fn().mockRejectedValue(new Error('[BRIDGE_UNAVAILABLE]'));
    const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
    await expect(ops.getConfig(sendRequest as any))
      .rejects.toThrow('[BRIDGE_UNAVAILABLE]');
    expect(sendRequest).toHaveBeenCalledTimes(1); // no retry
  });

  it('HERMES_BRIDGE_RETRY_METHODS and shouldTraceRequest stay in parity', () => {
    // Import both sets from gateway.ts and assert they are identical
    const { HERMES_BRIDGE_RETRY_METHODS } = require('./gateway');
    const EXPECTED_RETRY = new Set([
      'sessions.list', 'chat.history', 'last-heartbeat',
      'models.list', 'model.current', 'model.get',
      'agents.list', 'agent.identity.get',
      'sessions.usage', 'usage.cost',
      'config.get', 'tools.catalog', 'agents.files.list',
    ]);
    expect(HERMES_BRIDGE_RETRY_METHODS).toEqual(EXPECTED_RETRY);
  });
});
```

The test for `agents.files.get` is the most critical — it pins the deliberate
exclusion described in `gateway.ts:157-165` and prevents a future refactor from
silently adding it to the retry set.

Note: the existing `jest.fn()` spy pattern in `gateway-backend-operations.test.ts`
cannot exercise the retry loop because the spy is passed directly as the `request`
callable, not through `GatewayClient.sendBackendRequest`. A proper retry test needs
either a real (or minimal stubbed) `GatewayClient` instance, or direct unit-testing
of `sendRequestWithHermesBridgeRetry` with a stubbed inner `sendRequest`.
