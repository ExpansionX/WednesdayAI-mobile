# T5 Adversarial Review — Round 2: OpenCode Remediation Proposals

You are the OpenCode panelist in Round 2 of the T5 adversarial tournament. In Round 1 you found
multiple issues. Focus your remediations on the four most significant actionable findings:
O1, O3, O4, and O10. Read-only for research; write your report to the file specified at the end.

## Finding O1 — `useGatewayRuntimeSettings` over-eager for YouMind
**Location:** `apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx:24-54`

Current: `useGatewayRuntimeSettings` is called unconditionally and `modelConfig` is computed via
`useMemo` for every backend. For YouMind, the body is a static `EmptyState` and none of
`modelConfig`'s fields are consumed. The hook still allocates state and runs effects, though its
capability gates (`configRead: false`, `configWrite: false` for YouMind) prevent network I/O.

Your task: Determine whether the hook's YouMind capability gating is sufficient (no real work
happens) or whether the screen should skip the hook for YouMind. Consider React hooks rules —
you cannot conditionally call hooks inside a component. Propose the safest fix.

## Finding O3 — `deriveBaseUrl` catch comment accuracy  
**Location:** `apps/mobile/src/services/gateway-backend-operations.ts:295-299`

Current comment:
```typescript
} catch {
  // Any URL malformed enough to fail new URL() in the try path also fails the nested
  // new URL() guard — the scheme swap is identical in both branches and stripping
  // query/hash/path cannot fix a bad host. This path always returns null.
  return null;
}
```

The "nested `new URL()` guard" and "both branches" no longer exist in the simplified code.
The conclusion ("always returns null") is empirically correct. The reasoning references deleted structure.

Propose a replacement comment that accurately describes the current code without referencing
the old nested guard or "both branches."

## Finding O4 — Retry test does not assert params on second call
**Location:** `apps/mobile/src/services/gateway.test.ts:2154-2177` (config.get retry test)

Current: the test calls `client.request('config.get', {})`, advances 750ms, and asserts 2 calls
via `toHaveBeenCalledTimes(2)`. It does NOT verify that the second call received the same params.

Propose an additional `toHaveBeenNthCalledWith` or `toHaveBeenCalledWith` assertion that pins the
retry re-sends `('config.get', {})` — i.e. the retry does not mutate the params object.

Note: `sendRequestSpy` is spied on `sendRequest(method, params?)`, so you can assert:
`expect(sendRequestSpy).toHaveBeenNthCalledWith(2, 'config.get', {})`

## Finding O10 — `config.get` second retry not tested
**Location:** `apps/mobile/src/services/gateway.test.ts:2154-2177`

Production: `HERMES_BRIDGE_UNAVAILABLE_RETRY_DELAYS_MS = [750, 750]` (two retries).
The existing test only tests one retry. The `sessions.list` test already pins the two-retry
behavior for the shared delay array, but `config.get` was newly added and should have its
own two-retry coverage.

Propose an additional test for `config.get` that:
- Rejects twice (twice `mockRejectedValueOnce`)
- Then resolves
- Advances by 750ms twice
- Asserts 3 `sendRequest` calls and the resolved value

## Task

For each finding:
1. State the fix approach
2. Provide the exact code/comment change with before/after
3. Explain correctness and safety

Write your report to `.agents/reports/2026-06-30-T5R2-opencode-remediation-proposals.md`.
Use a heading per finding, include code blocks.
