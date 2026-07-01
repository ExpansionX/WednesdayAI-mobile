# T5 Adversarial Review — Round 3: Codex Reviews Claude

**Reviewer:** Codex
**Targets:** C1, C3

## Summary

| Finding | Verdict |
|---------|---------|
| C1 — stale `deriveBaseUrl` catch comment | **VALID+SOUND** |
| C3 — test calls `request()` directly instead of `getAgentFile()` | **VALID+SOUND** |

---

## C1 — VALID+SOUND

The stale comment is real at `gateway-backend-operations.ts:296-298`. Claude's replacement is accurate: after the `urlText` guard at line 288, the only meaningful throw source in the try block is `new URL(...)` at line 290. `url.hash = ''`, `url.search = ''`, `url.pathname = ...replace(...)` are all non-throwing setters on a successfully constructed URL object. `url.toString().replace(...)` cannot throw either. So reaching the catch means `new URL()` threw — the proposed comment states exactly this.

No flaw found. Claude keeps points.

---

## C3 — VALID+SOUND

The finding is real. The test calls `client.request('agents.files.get', ...)` directly; production calls `client.getAgentFile(name, agentId)` at `gateway.ts:1040-1042`. Claude's fix correctly substitutes `client.getAgentFile('plan.md', 'main')`.

The key concern about exception propagation: `sharedOperations.getAgentFile` at `gateway-backend-operations.ts:186-193` calls `await request<...>('agents.files.get', { agentId, name })` with no try/catch wrapping. If `sendBackendRequest` rejects (which it does — mocked to throw `[BRIDGE_UNAVAILABLE]`), the `await` propagates the rejection before reaching the `if (!result?.file)` guard. The `File not found` branch never executes. The `[BRIDGE_UNAVAILABLE]` error propagates to the caller unchanged. Therefore `rejects.toThrow('[BRIDGE_UNAVAILABLE]')` still holds with the public API call.

No flaw found. Claude keeps points.
