# T3 Round 3 — Adversarial Cross-Review: Claude reviews OpenCode's Issue 2 remediation

You are adversarially reviewing a peer's remediation proposal. Your job is to
**try to defeat it** — find flaws, prove it's wrong, show it's incomplete, or
provide a better solution that steals all 3 points.

## The Finding (OpenCode/GLM-5.2, T3R1 Issue 2)

**Issue**: Retry-eligibility expansion is entirely untested

**File**: `apps/mobile/src/services/gateway.ts:174-188`
**Severity**: low
**Category**: test-quality

**OpenCode's finding**: Six methods were added to `HERMES_BRIDGE_RETRY_METHODS`
(`model.get`, `sessions.usage`, `usage.cost`, `config.get`, `tools.catalog`,
`agents.files.list`) and mirrored in `shouldTraceRequest`. `sendBackendRequest` now
routes through `sendRequestWithHermesBridgeRetry`. But every test in the new
469-line suite passes a bare `jest.fn()` spy directly to operation methods — bypassing
`sendBackendRequest` and the retry wrapper entirely. No test:
1. Fires the retry loop on `[BRIDGE_UNAVAILABLE]` for any of the newly added methods.
2. Pins the `agents.files.get` exclusion invariant (documented but untested).
3. Proves the Hermes-relay-only gate (non-Hermes → no retry).
4. Verifies `HERMES_BRIDGE_RETRY_METHODS` ↔ `shouldTraceRequest` parity.

## OpenCode's Remediation (T3R2 Issue 2)

Add integration-style tests in `gateway-retry.test.ts` or extend `gateway.test.ts`:

```typescript
describe('HERMES_BRIDGE_RETRY_METHODS — retry integration', () => {
  function makeHermesRelayClient() {
    return {
      backendKind: 'hermes' as const,
      activeRoute: 'relay' as const,
      _sendRequest: jest.fn(),
      sleep: jest.fn().mockResolvedValue(undefined),
    };
  }

  it('retries config.get on [BRIDGE_UNAVAILABLE] for hermes+relay', async () => {
    const sendRequest = jest.fn()
      .mockRejectedValueOnce(new Error('[BRIDGE_UNAVAILABLE]'))
      .mockResolvedValueOnce({ config: {}, hash: 'abc' });
    const ops = getGatewayBackendOperations({ backendKind: 'hermes' } as any);
    const result = await ops.getConfig(sendRequest as any);
    expect(result).toEqual({ config: {}, hash: 'abc' });
    expect(sendRequest).toHaveBeenCalledTimes(2);
  });
  // ... (agents.files.get exclusion, openclaw no-retry, parity tests)
```

## Your Task

Read the relevant source files:
- `apps/mobile/src/services/gateway.ts` (lines 150-210: HERMES_BRIDGE_RETRY_METHODS, sendBackendRequest, sendRequestWithHermesBridgeRetry, isHermesRelayBridgeRetryEligible)
- `apps/mobile/src/services/gateway-backend-operations.ts` (how ops.getConfig calls its request param)
- `apps/mobile/src/services/gateway-backend-operations.test.ts` (the spy pattern)

**Key question for adversarial review**: The OpenCode test for `config.get` retry passes
`sendRequest` directly as the `request` param to `ops.getConfig()`. But does
`ops.getConfig()` actually route through `sendBackendRequest` / `sendRequestWithHermesBridgeRetry`?
Or does it just call `request(method, params)` directly — meaning the test would NOT exercise
the retry wrapper at all, even with the proposed test?

If the proposed test has this flaw (the spy never routes through the retry wrapper), then
OpenCode's remediation fails to actually pin the invariant it claims to test.

Decide:
- **INVALID**: The finding is wrong — explain why (maybe retry IS tested somewhere)
- **VALID+FLAWED**: The finding is real but OpenCode's proposed tests are wrong — steal points with better tests
- **VALID+SOUND**: The finding and proposed tests are both correct — OpenCode earns points

## Output format

```text
## Adversarial verdict: INVALID | VALID+FLAWED | VALID+SOUND

**Reasoning**: [cite file:line evidence]

**If VALID+FLAWED — Stealing remediation**:
[your corrected test approach]
```

End with: `VERDICT: OPENCODE KEEPS POINTS` or `VERDICT: CLAUDE STEALS POINTS`.
