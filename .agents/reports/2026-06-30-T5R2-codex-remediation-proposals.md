# T5 Round 2 — Codex Remediation Proposals

## X1 — Subset test: remove private static cast

**Verdict:** REAL.

The live test casts `GatewayClient` to access private `HERMES_BRIDGE_RETRY_METHODS`. Both the set
and `shouldTraceRequest` are private, so a rename would break this test without a product regression.

**Fix:** Replace the private-cast loop with `it.each` enumerating the 13 methods explicitly.

**Before:**
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

**After:**
```typescript
it.each([
  'sessions.list',
  'chat.history',
  'last-heartbeat',
  'models.list',
  'model.current',
  'model.get',
  'agents.list',
  'agent.identity.get',
  'sessions.usage',
  'usage.cost',
  'config.get',
  'tools.catalog',
  'agents.files.list',
])('traces Hermes relay retryable read method %s', (method) => {
  expect((client as any).shouldTraceRequest(method)).toBe(true);
});
```

**Safety:** Removes brittle cast against private static; preserves behavioral coverage that each
retryable Hermes relay method is traced. If retry eligibility later moves to capability metadata,
this test remains a stable behavioral contract updatable only when the actual method list changes.

---

## X2 — `config.get` retry test: add second retry

**Verdict:** REAL.

Production defines two retry delays `[750, 750]`; the test only exercises the first. A bug that
broke the second retry (e.g. accidentally shortening the array to `[750]`) would pass this test.

**Fix:** Extend the test to reject twice, advance timers twice, assert 3 calls.

**Before:**
```typescript
it('retries newly-added config.get on [BRIDGE_UNAVAILABLE] for Hermes relay', async () => {
  // ...configure + activeRoute setup...
  const sendRequestSpy = jest
    .spyOn(...)
    .mockRejectedValueOnce(new Error('[BRIDGE_UNAVAILABLE] ...'))
    .mockResolvedValue({ config: {}, hash: 'abc123' });

  const pending = client.request<{ config: object; hash: string }>('config.get', {});
  await flushPromises();
  expect(sendRequestSpy).toHaveBeenCalledTimes(1);

  jest.advanceTimersByTime(750);
  await flushPromises();
  await expect(pending).resolves.toEqual({ config: {}, hash: 'abc123' });
  expect(sendRequestSpy).toHaveBeenCalledTimes(2);
});
```

**After:**
```typescript
it('retries newly-added config.get twice on [BRIDGE_UNAVAILABLE] for Hermes relay', async () => {
  client.configure({
    url: 'wss://example.com',
    token: 'abc',
    mode: 'hermes',
    backendKind: 'hermes',
    transportKind: 'relay',
  } as any);
  (client as any).activeRoute = 'relay';

  const sendRequestSpy = jest
    .spyOn(client as unknown as { sendRequest: (method: string, params?: object) => Promise<unknown> }, 'sendRequest')
    .mockRejectedValueOnce(new Error('[BRIDGE_UNAVAILABLE] Hermes bridge is temporarily unavailable. Please retry.'))
    .mockRejectedValueOnce(new Error('[BRIDGE_UNAVAILABLE] Hermes bridge is temporarily unavailable. Please retry.'))
    .mockResolvedValue({ config: {}, hash: 'abc123' });

  const pending = client.request<{ config: object; hash: string }>('config.get', {});
  await flushPromises();
  expect(sendRequestSpy).toHaveBeenCalledTimes(1);

  jest.advanceTimersByTime(750);
  await flushPromises();
  expect(sendRequestSpy).toHaveBeenCalledTimes(2);

  jest.advanceTimersByTime(750);
  await flushPromises();
  await expect(pending).resolves.toEqual({ config: {}, hash: 'abc123' });
  expect(sendRequestSpy).toHaveBeenCalledTimes(3);
});
```

**Safety:** Mirrors the proven `sessions.list` two-retry pattern already in the same test file.
Test-only change; does not affect OpenClaw, Hermes, or YouMind production paths.
