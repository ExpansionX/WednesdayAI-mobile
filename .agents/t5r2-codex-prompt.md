# T5 Adversarial Review — Round 2: Codex Remediation Proposals

You are the Codex panelist in Round 2 of the T5 adversarial tournament. In Round 1 you found 2
issues. Now propose working remediations for each. Read-only for research; do NOT write any code
files — your output is a report file only.

## Your Round 1 findings to remediate

### X1 — Subset test couples to private static via type cast
**Location:** `apps/mobile/src/services/gateway.test.ts:2199-2206`

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

The test accesses the private static `HERMES_BRIDGE_RETRY_METHODS` via `as unknown as { ... }`.
If the set is renamed, moved, or replaced by capability metadata, this cast silently
returns `undefined` and the test breaks without a product regression.

### X2 — `config.get` retry test only proves first of two retries
**Location:** `apps/mobile/src/services/gateway.test.ts:2154-2177`

Production defines `HERMES_BRIDGE_UNAVAILABLE_RETRY_DELAYS_MS = [750, 750]` (two retries at 750ms
each). The test rejects once then resolves, and advances by 750ms once. This verifies the FIRST
retry works but leaves the SECOND retry untested — a bug that broke the second retry (e.g. if the
delay array were shortened to `[750]`) would not be caught.

The existing `sessions.list` test at `gateway.test.ts:2039-2048` DOES exercise both retries with
two 750ms advances and asserts 3 calls. For completeness, `config.get` (a newly-added method in
the retry set) should have a similar two-retry test to independently verify it was added with the
full retry policy, not just partially.

## Relevant production code

`gateway.ts:151`:
```typescript
private static readonly HERMES_BRIDGE_UNAVAILABLE_RETRY_DELAYS_MS = [750, 750];
```

`gateway.ts:1386-1403` (`sendRequestWithHermesBridgeRetry` — the retry loop):
```typescript
const retryable = this.isHermesRelayBridgeRetryEligible(method);
let lastError: unknown;
const delays = retryable ? GatewayClient.HERMES_BRIDGE_UNAVAILABLE_RETRY_DELAYS_MS : [];

for (let attempt = 0; attempt <= delays.length; attempt += 1) {
  try {
    return await this.sendRequest(method, params);
  } catch (error) {
    lastError = error;
    if (!retryable || !this.isHermesBridgeUnavailableError(error) || attempt >= delays.length) {
      throw error;
    }
    await this.sleep(delays[attempt] ?? 0);
  }
}
```

## Task

For each finding (X1–X2):
1. State whether the issue is REAL after inspecting the live source
2. Propose the exact code change (exact Jest test additions/modifications)
3. Explain why your fix is correct and safe

For X2, write the additional test showing `config.get` also fails twice and succeeds on the third
attempt (two 750ms advances, 3 total `sendRequest` calls).

Write your report to `.agents/reports/2026-06-30-T5R2-codex-remediation-proposals.md`.
Use a heading per finding, include before/after code blocks.
