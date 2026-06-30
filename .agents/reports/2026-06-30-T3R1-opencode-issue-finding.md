# T3 Round 1 — OpenCode (GLM-5.2): Issue Finding

**Executor**: OpenCode CLI (`ollama-cloud/glm-5.2`)
**Diff range**: `main..HEAD` (code files only)
**Date**: 2026-06-30

## Issue 1: YouMind ModelsScreen branch renders ModelsView against unsupported capabilities

**File**: `apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx:117`
**Severity**: medium
**Category**: regression

**Finding**: The diff adds an explicit `youmind: (<ModelsView .../>)` branch to `ModelsScreen`'s `selectByBackend` dispatch. `ModelsView` unconditionally calls `loadGatewayModelsConfigBundle(gateway)` on mount (`apps/mobile/src/components/console/ModelsView.tsx:284-289`, fire on `loadModels` effect at line 312-316), which in turn unconditionally issues `gateway.listModels()` (RPC `models.list`) and `gateway.getConfig()` (RPC `config.get`) in parallel (`apps/mobile/src/services/gateway-models.ts:42-48`).

However `YOUMIND_CAPABILITIES` declares both `modelCatalog: false` and `configRead: false` (`apps/mobile/src/services/gateway-backends.ts:109-135`). And `YOUMIND_OPERATIONS = { ...OPENCLAW_OPERATIONS }` (`apps/mobile/src/services/gateway-backend-operations.ts:275-277`) gives YouMind the OpenClaw `models.list` and `config.get` dispatchers, so those RPCs are actually wired up and will fire — they are not no-ops.

This violates the repository's Backend Architecture Rule #7 in `apps/mobile/AGENTS.md`: *"Unsupported backend actions must be hidden or disabled via centralized capability checks, not by optimistic requests that fail later."* Opening the Models screen for a YouMind backend now sends two RPCs the capability registry says YouMind does not support.

The previous behavior was the same (`selectByBackend` fell back to `openclaw` for YouMind when no `youdmind` branch was supplied), so this is technically a pre-existing capability gap. But the diff under review codifies the violation with a named, explicit branch — turning incidental fallback into intentional dispatch. The AGENTS.md rule #4 ("Do not add new screen-level or component-level branching that treats Hermes as just another `mode`") and rule #7 together make this an intentional branch that should have been capability-gated rather than rendered against an unsupported backend.

**Evidence**:
- `apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx:117-125` — new explicit `youdmind` branch renders `<ModelsView>` with the same props as the `openclaw` branch.
- `apps/mobile/src/components/console/ModelsView.tsx:284-310` — `loadModels` issues `loadGatewayModelsConfigBundle(gateway)`; `useEffect` at line 312-316 fires it on mount unconditionally.
- `apps/mobile/src/services/gateway-models.ts:42-48` — `loadGatewayModelsConfigBundle` calls `gateway.listModels()` and `gateway.getConfig()` in `Promise.all`, no capability gate.
- `apps/mobile/src/services/gateway-backends.ts:116-119` — `YOUMIND_CAPABILITIES.modelCatalog: false`, `configRead: false`, `modelSelection: false`, `configWrite: false`.
- `apps/mobile/src/services/gateway-backend-operations.ts:275-277` — `YOUMIND_OPERATIONS = { ...OPENCLAW_OPERATIONS }` inherits `listModels` (`models.list`) and `getConfig` (`config.get`) from `sharedOperations`.

**Proposed remediation**: Do not render `ModelsView` for YouMind while its capabilities disable model catalog, model selection, config read, and config write. Either:

(a) Gate the YouMind branch on capability — render a "not supported for this backend" empty state (using the shared `EmptyState` component) instead of `<ModelsView>`:

```tsx
youdmind: (
  <EmptyState
    title={t('Models')}
    message={t('This backend does not expose a model catalog yet.')}
  />
),
```

(b) Or, if YouMind genuinely inherits OpenClaw model RPCs in production, fix the capability table at `apps/mobile/src/services/gateway-backends.ts:116-119` to set `modelCatalog: true`, `modelSelection: true`, `configRead: true`, `configWrite: true` so the capability registry matches the operations dispatch.

Either way, add a regression test: a `youmind` config with the current `YOUMIND_CAPABILITIES` mounting `ModelsScreen` must not call `gateway.listModels()` or `gateway.getConfig()`.

## Issue 2: Retry-eligibility expansion is entirely untested

**File**: `apps/mobile/src/services/gateway.ts:174-188`
**Severity**: low
**Category**: test-quality

**Finding**: The diff adds six methods to `HERMES_BRIDGE_RETRY_METHODS` (`model.get`, `sessions.usage`, `usage.cost`, `config.get`, `tools.catalog`, `agents.files.list`) and mirrors them in `shouldTraceRequest` (`gateway.ts:2786-2791`). It also rewires `sendBackendRequest` from a direct `sendRequest` passthrough to `sendRequestWithHermesBridgeRetry` (`gateway.ts:1381-1383`).

The new 469-line test suite (`gateway-backend-operations.test.ts`) bypasses `sendBackendRequest` entirely: every test passes a bare `jest.fn()` spy directly to the operation method (e.g. `ops.fetchUsage(spy as any, ...)`). That spy never routes through `sendRequestWithHermesBridgeRetry`, so no test exercises:

1. The retry loop at `gateway.ts:1390-1400` actually firing on a `[BRIDGE_UNAVAILABLE]` error for any of the newly added methods.
2. The `isHermesRelayBridgeRetryEligible` gate (`gateway.ts:1405-1409`) correctly returning `true` for the six newly added methods.
3. The non-retry path for a method that IS in the operations surface but NOT in the retry set (e.g. `agents.files.get`, `model.set`, `config.patch`, `agents.files.set`) — confirming a `[BRIDGE_UNAVAILABLE]` error is re-thrown, not silently retried.
4. The `shouldTraceRequest` parity with the retry set for the newly added entries.

The comments in `gateway.ts:152-173` explicitly call out `agents.files.get` exclusion as a deliberate invariant ("a silent base shift is not [honest]"). That invariant has no test pinning it — a future refactor that adds `agents.files.get` to the retry set would pass the entire test suite.

**Evidence**:
- `apps/mobile/src/services/gateway.ts:174-188` — `HERMES_BRIDGE_RETRY_METHODS` set includes the six newly added entries.
- `apps/mobile/src/services/gateway.ts:1381-1383` — `sendBackendRequest` now routes through `sendRequestWithHermesBridgeRetry`.
- `apps/mobile/src/services/gateway.ts:1385-1403` — `sendRequestWithHermesBridgeRetry` retry loop; no test in the diff exercises this.
- `apps/mobile/src/services/gateway-backend-operations.test.ts:33-502` — every test passes a `jest.fn()` spy directly to the operation method, bypassing `sendBackendRequest` / `sendRequestWithHermesBridgeRetry`.
- `apps/mobile/src/services/gateway.ts:157-165` — comment explicitly documents the `agents.files.get` exclusion as a deliberate invariant with no test coverage.

**Proposed remediation**: Add a `gateway.test.ts` (or extend `gateway-backend-operations.test.ts`) suite that exercises the retry path through a stubbed `GatewayClient`:

```ts
describe('sendRequestWithHermesBridgeRetry', () => {
  it('retries sessions.usage on [BRIDGE_UNAVAILABLE] for hermes+relay', async () => {
    const client = makeStubClient({ backendKind: 'hermes', activeRoute: 'relay' });
    const sendRequest = jest.fn()
      .mockRejectedValueOnce(new Error('[BRIDGE_UNAVAILABLE]'))
      .mockResolvedValueOnce({ updatedAt: 1 });
    jest.spyOn(client as any, 'sendRequest').mockImplementation(sendRequest);
    jest.spyOn(client as any, 'sleep').mockResolvedValue(undefined);
    await client.fetchUsage({ startDate: '2026-01-01', endDate: '2026-01-31' });
    expect(sendRequest).toHaveBeenCalledTimes(2);
  });

  it('does NOT retry agents.files.get on [BRIDGE_UNAVAILABLE] (read-modify-write base-shift guard)', async () => {
    const client = makeStubClient({ backendKind: 'hermes', activeRoute: 'relay' });
    const sendRequest = jest.fn().mockRejectedValue(new Error('[BRIDGE_UNAVAILABLE]'));
    jest.spyOn(client as any, 'sendRequest').mockImplementation(sendRequest);
    await expect(client.getAgentFile('agent-1', 'AGENTS.md')).rejects.toThrow('[BRIDGE_UNAVAILABLE]');
    expect(sendRequest).toHaveBeenCalledTimes(1);
  });

  it('does not retry for openclaw backend (retry is Hermes-relay only)', async () => {
    const client = makeStubClient({ backendKind: 'openclaw', activeRoute: 'relay' });
    const sendRequest = jest.fn().mockRejectedValue(new Error('[BRIDGE_UNAVAILABLE]'));
    jest.spyOn(client as any, 'sendRequest').mockImplementation(sendRequest);
    await expect(client.fetchUsage({ startDate: '2026-01-01', endDate: '2026-01-31' }))
      .rejects.toThrow('[BRIDGE_UNAVAILABLE]');
    expect(sendRequest).toHaveBeenCalledTimes(1);
  });
});
```

This pins the new retry eligibility, the `agents.files.get` exclusion invariant, and the Hermes-relay-only gate.

## Verified clean (no bug)

The following candidate findings were investigated and rejected:

- **Retry-set ↔ `shouldTraceRequest` parity**: The two sets are identical modulo `connect` (which is in `shouldTraceRequest` only, as expected — it is the handshake, not a backend RPC). The diff's `model.get` addition to the retry set actually *fixes* a pre-existing parity gap (it was already in `shouldTraceRequest`). No new divergence.
- **`fetchUsage` / `fetchCostSummary` null-response shape change**: The old `(result ?? {}) as UsageResult` and the new explicit `{ updatedAt: result?.updatedAt, ... }` are behaviorally equivalent for callers reading optional fields — both yield `undefined` for every field on a null response. The type (`UsageResult` with all-optional fields, `apps/mobile/src/types/usage.ts:90-98`) is satisfied either way. The new tests at `gateway-backend-operations.test.ts:436-447` and `477-486` pin the new shape correctly.
- **`sendBackendRequest` `params ?? {}` coercion**: The operations layer always calls `request(method, explicitObject)` — never `request(method)` with no params. The `?? {}` is defensive but behaviorally a no-op for the operations layer.
- **`deriveBaseUrl` catch-path stripping logic**: Traced all four catch-path tests (`bare ws://`, `unclosed bracket`, query-string try-path for both schemes). The try path handles all real-world WS URLs; the catch path's nested guards 1 and 2 correctly return `null` for the malformed cases. The `youmind` `getBaseUrl` tests inherit the OpenClaw pattern and pass.
- **`WEDNESDAYAI_OPERATIONS` / `YOUMIND_OPERATIONS` shallow spread**: `{ ...OPENCLAW_OPERATIONS }` produces a distinct container with shared method references. The object-identity tests at `gateway-backend-operations.test.ts:65-106` pin both invariants (container inequality, method equality). Safe.
- **`selectByBackend` youmind fallback**: `options.youmind ?? options.openclaw` correctly returns the openclaw branch when no youmind option is supplied — pinned by the test at `gateway-backends.test.ts:96-98`.
- **`getConfig`/`patchConfig`/`setConfig` null-response shapes**: All three return shapes match their test assertions exactly. The `?? null` vs `?? undefined` difference matches the type declarations (`GatewayConfigSnapshot.config: Record | null`, `GatewayConfigWriteResult.config: Record | undefined`).