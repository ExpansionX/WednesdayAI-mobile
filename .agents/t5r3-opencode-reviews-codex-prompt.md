# T5 Adversarial Review — Round 3: OpenCode Adversarially Reviews Codex

You are the OpenCode panelist in Round 3. Your task is to adversarially challenge Codex's Round 2
remediation proposals (X1, X2). For each, determine:
- VALID+SOUND: finding is real and fix is correct — Codex keeps points
- VALID+FLAWED: finding is real but fix has problems — you can attempt to steal by providing a
  better fix that Codex cannot defeat
- INVALID: finding was a false positive — no points

Read-only only. Do NOT run shell commands.

## Codex's R1 Findings and R2 Remediation Proposals

### X1 — Subset test couples to private static
**Finding:** The subset test accesses `HERMES_BRIDGE_RETRY_METHODS` via a TypeScript `as unknown as`
cast that bypasses privacy. If the set is renamed or restructured, the cast returns `undefined`
and the test breaks (or silently vacuously passes on an undefined set).

**Codex's fix:** Replace the private-cast loop with `it.each([...])` enumerating all 13 methods:
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

**Your adversarial challenge for X1:**
- Does this fix actually solve the stated problem? The original test accessed `HERMES_BRIDGE_RETRY_METHODS`
  dynamically — if a new method is added to the set, the original test would automatically cover it
  but the new `it.each` would NOT (the hardcoded list would be stale until manually updated).
  Is the hardcoded list more or less fragile than the private cast?
- Does the `it.each` approach change the semantics from "subset" to "explicit method list"? Are those
  the same thing?
- `shouldTraceRequest` is still accessed via `(client as any).shouldTraceRequest` — does this also
  need to be addressed?

### X2 — `config.get` retry test only proves first of two retries
**Finding:** Production has `HERMES_BRIDGE_UNAVAILABLE_RETRY_DELAYS_MS = [750, 750]` (two retries).
The `config.get` test only exercises one retry (one rejection, one 750ms advance, 2 calls).

**Codex's fix:** Extend the test to reject twice, advance 750ms twice, assert 3 calls:
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

**Your adversarial challenge for X2:**
- Is the finding real? (The `sessions.list` test already pins the two-retry behavior for the shared
  delay array at gateway.test.ts:2039-2048. Is separate two-retry coverage for `config.get` additive
  value or duplication?)
- Is the fix correct? Does the test structure (reject twice → advance twice → 3 calls) match the
  production retry loop?

## Task

For X1 and X2:
1. State VALID+SOUND / VALID+FLAWED / INVALID
2. If VALID+FLAWED: propose your better fix and explain why it is superior
3. If VALID+SOUND: confirm the fix is correct with evidence from the source
4. Be specific: cite actual code structure if challenging

Write your report to `.agents/reports/2026-06-30-T5R3-opencode-reviews-codex.md`.
