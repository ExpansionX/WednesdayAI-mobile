# T3 Round 3 — Claude adversarially reviews OpenCode Issue 2 remediation

**Reviewer**: Claude CLI (Opus 4.8)
**Subject**: OpenCode T3R1 Issue 2 — Retry-eligibility expansion is entirely untested
**Subject R2**: OpenCode T3R2 Issue 2 — add integration tests in gateway-retry.test.ts

## Adversarial verdict: VALID+FLAWED

**The finding is real** — the six newly-added retry methods have no tests that exercise
the retry loop. OpenCode identified this correctly. But the proposed remediation is
broken: it repeats exactly the anti-pattern it criticises.

## Why OpenCode's proposed tests are broken

**Flaw 1 (decisive): The spy bypasses the retry wrapper — the test would fail.**

The retry loop lives in `GatewayClient.sendRequestWithHermesBridgeRetry`
(`gateway.ts:1385-1403`). It calls `this.sendRequest(method, params)` inside a
loop driven by `HERMES_BRIDGE_UNAVAILABLE_RETRY_DELAYS_MS = [750, 750]`
(`gateway.ts:151`). Eligibility reads instance state: `this.getBackendKind() ===
'hermes' && this.activeRoute === 'relay' && HERMES_BRIDGE_RETRY_METHODS.has(method)`
(`gateway.ts:1405-1408`).

OpenCode's proposed test does:
```ts
const ops = getGatewayBackendOperations({ backendKind: 'hermes' } as any);
const result = await ops.getConfig(sendRequest as any);
expect(sendRequest).toHaveBeenCalledTimes(2);
```

`ops.getConfig(sendRequest)` calls `sendRequest('config.get', {})` exactly **once**
(`gateway-backend-operations.ts:106-115`). The first call rejects with
`[BRIDGE_UNAVAILABLE]`, `getConfig` has no catch, so the promise **rejects** and
the second `mockResolvedValueOnce` is never reached. The test fails with "received 1
call" — and exercises nothing about the retry wrapper.

**Flaw 2: `makeHermesRelayClient()` is dead code.**

Retry eligibility reads `this.activeRoute` and `this.getBackendKind()` from the
real `GatewayClient` instance. OpenCode's fabricated helper (`backendKind`,
`activeRoute`, `_sendRequest`, `sleep` plain fields) is never consulted by the
retry path. The retry wrapper reads **private class members**, not a plain object.

**Flaw 3: The parity test encodes a wrong assertion.**

`HERMES_BRIDGE_RETRY_METHODS` has 13 entries; `shouldTraceRequest` returns true
for 14 methods (the 13 retry methods **plus `connect`**). So
`expect(retrySet).toEqual(traceSet)` would fail. The correct invariant is
`RETRY ⊆ TRACE` (strict subset), not set equality.

**Pre-existing coverage note**: `gateway.test.ts:2016-2152` already tests retry
for `sessions.list`, `chat.history`, `models.list`, the `chat.send` mutating
no-retry path, and the openclaw no-retry gate. The genuine coverage gap is the
**six newly-added methods** and the `agents.files.get` exclusion invariant.

## Stealing fix — use the established harness

The existing pattern at `gateway.test.ts:2093-2116` configures a real client,
sets `activeRoute='relay'`, spies the low-level `sendRequest`, and drives through
`client.request(method)` — which routes via `sendRequestWithHermesBridgeRetry`.
Mirror it:

```typescript
// In apps/mobile/src/services/gateway.test.ts
// (mirror the hermes-relay retry harness at lines 2093-2116)

describe('HERMES_BRIDGE_RETRY_METHODS — newly added methods', () => {
  let client: GatewayClient;
  let sendRequestSpy: jest.SpyInstance;

  beforeEach(() => {
    client = new GatewayClient();
    client.configure({
      url: 'wss://example.com/v1/hermes/ws',
      token: 'abc',
      mode: 'hermes',
      backendKind: 'hermes',
      transportKind: 'relay',
    } as any);
    (client as any).activeRoute = 'relay';
    sendRequestSpy = jest.spyOn(client as any, 'sendRequest');
    jest.spyOn(client as any, 'sleep').mockResolvedValue(undefined);
  });

  it('retries config.get on [BRIDGE_UNAVAILABLE] (newly added to retry set)', async () => {
    sendRequestSpy
      .mockRejectedValueOnce(new Error('[BRIDGE_UNAVAILABLE]'))
      .mockResolvedValueOnce({ config: {}, hash: 'abc' });
    const result = await client.request('config.get', {});
    expect(result).toEqual({ config: {}, hash: 'abc' });
    expect(sendRequestSpy).toHaveBeenCalledTimes(2);
  });

  it('retries tools.catalog on [BRIDGE_UNAVAILABLE] (newly added)', async () => {
    sendRequestSpy
      .mockRejectedValueOnce(new Error('[BRIDGE_UNAVAILABLE]'))
      .mockResolvedValueOnce({ tools: [] });
    await client.request('tools.catalog', { agentId: 'a' });
    expect(sendRequestSpy).toHaveBeenCalledTimes(2);
  });

  it('does NOT retry agents.files.get — read-modify-write exclusion invariant', async () => {
    sendRequestSpy.mockRejectedValue(new Error('[BRIDGE_UNAVAILABLE]'));
    await expect(client.request('agents.files.get', { agentId: 'a', name: 'f' }))
      .rejects.toThrow('[BRIDGE_UNAVAILABLE]');
    expect(sendRequestSpy).toHaveBeenCalledTimes(1);
  });

  it('RETRY ⊆ TRACE: every retry-eligible method is also traced', () => {
    const retryMethods = (client as any).constructor.HERMES_BRIDGE_RETRY_METHODS as Set<string>;
    for (const method of retryMethods) {
      expect((client as any).shouldTraceRequest(method)).toBe(true);
    }
  });
});
```

This drives the real `sendRequestWithHermesBridgeRetry` path, correctly reads the
`GatewayClient` instance state, and avoids the parity false-equality trap.

**VERDICT: CLAUDE STEALS POINTS**
