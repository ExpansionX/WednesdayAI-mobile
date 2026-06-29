# Tournament 2 — Final Summary
**Date**: 2026-06-29  
**Scope**: Post-remediation adversarial review of `gateway-backend-operations.ts`, `gateway.ts`, `gateway-backend-operations.test.ts`  
**Panelists**: Opus (claude-opus-4-5), Codex, OpenCode/GLM-5.2  
**Rules**: R1 +1/issue, R2 +1/working remediation, R3 +1/surviving peer review. Steal: adversarial reviewer defeats a remediation AND provides a superior working solution → takes all 3 points the discoverer would have earned.

---

## Round Results

### T2-R1: Issue Finding

| Panelist | Issues Found | Notes |
|----------|-------------|-------|
| Opus | 3 | ISSUE-1 (GLM52-4 comment), ISSUE-2 (shouldTraceRequest), ISSUE-3 (async keyword) |
| Codex | 1 | ISSUE-1 (GLM52-4 comment, steal-eligible) |
| OpenCode | 6 | ISSUE-1 (High, steal-eligible), ISSUE-2 (agents.files.get staleness), ISSUE-3/4/5 (informational), ISSUE-6 (identity test pattern gap) |

All three panelists independently found **ISSUE-1**: the GLM52-4 regression test comment claimed to force the catch path of `deriveBaseUrl`, but `host.invalid` is a syntactically valid RFC-3986 hostname — `new URL()` succeeds, routing the test through the try path. The catch path is in fact dead code for non-null returns (any URL that throws in the try path has a malformed host that also fails the nested guard-2 `new URL()`).

### T2-R2: Remediation Proposals

All three proposed fixes for their own issues. Key proposals:
- **Opus**: Update GLM52-4 comment to "try path"; add shouldTraceRequest entries; remove async keyword
- **Codex**: Rename GLM52-4 test to "try path" (steal claim vs original test author)
- **OpenCode**: jest.spyOn URL stub to force catch path (steal claim); remove agents.files.get from retry set; add comments; add discriminative behavioral assertions to Hermes identity test

### T2-R3: Cross-Adversarial Review

| Reviewer | Target | Verdict | Steal |
|----------|--------|---------|-------|
| OpenCode → Opus REMEDIATION-1 | GLM52-4 rename | SURVIVES | NO |
| OpenCode → Opus REMEDIATION-2 | shouldTraceRequest additions | PARTIAL-DEFEAT | NO |
| OpenCode → Opus REMEDIATION-3 | Remove async keyword | **DEFEATED** | **YES** |
| Opus → Codex REMEDIATION-1 | GLM52-4 rename | SURVIVES | — (steal valid) |
| Codex → OpenCode REMEDIATION-1 | URL spy for catch path | SURVIVES | NO |
| Codex → OpenCode REMEDIATION-2 | Remove agents.files.get | SURVIVES | NO |
| Codex → OpenCode REMEDIATION-3/4/5 | Comment-only changes | SURVIVES | NO |
| Codex → OpenCode REMEDIATION-5 | isHermesRelayBridgeRetryEligible comment | PARTIAL-DEFEAT | NO |
| Codex → OpenCode REMEDIATION-6 | Hermes identity test behavioral assertions | SURVIVES | NO |

**Key defeat**: OpenCode defeated Opus's REMEDIATION-3 (remove async keyword). OpenCode's counter: `async` is a zero-cost defensive wrapper converting synchronous throws to rejected promises — a positive semantic guarantee for any function typed `() => Promise<T>`. The actual smell is the `as Promise<T>` unchecked cast, which Opus missed. Steal awarded to OpenCode.

---

## Final Scores

| Panelist | R1 (found) | R2 (working fix) | R3 (survived) | Steal Bonus | Steal Loss | Total |
|----------|-----------|-----------------|---------------|-------------|------------|-------|
| **OpenCode** | +3 | +3 | +3 | +3 | — | **12** |
| Codex | +1 | +1 | +1 | — | — | **3** |
| Opus | +3 | +1 | +1 | — | −3 | **2** |

> OpenCode: ISSUE-1 (+3), ISSUE-2 (+3), ISSUE-6 (+3), steal on Opus ISSUE-3 (+3). ISSUE-3/4/5 informational = 0.  
> Codex: ISSUE-1 (R1+R2+R3 all survived) = +3.  
> Opus: ISSUE-1 (+3), ISSUE-2 (+1 R1 only, partial defeat on R2), ISSUE-3 (+0 after steal loss, −3).

**Winner: OpenCode/GLM-5.2 (12 points)**

---

## Agreed Remediations Applied

### 1. GLM52-4 test comment corrected (test file)
**File**: `apps/mobile/src/services/gateway-backend-operations.test.ts` line ~101  
**Change**: Renamed test from "catch path: strips query string…" to "hermes: strips query string from a ws:// URL on the try path (GLM52-4 regression)". Comment updated to accurately explain that `host.invalid` takes the try path, and that the catch path is unreachable for non-null returns.

### 2. Hermes identity test — behavioral assertions added (test file)
**File**: `apps/mobile/src/services/gateway-backend-operations.test.ts` lines ~53-68  
**Change**: Added discriminative behavioral assertions to the "hermes: separate container AND divergent method references" test. The input `wss://host/v1/hermes/ws` is discriminative: Hermes strips `/v1/hermes/ws` → `https://host`; OpenClaw strips only `/ws` → `https://host/v1/hermes`. A wrong Hermes override using OpenClaw's pattern would pass reference inequality but fail these assertions.

### 3. `agents.files.get` removed from HERMES_BRIDGE_RETRY_METHODS (gateway.ts)
**File**: `apps/mobile/src/services/gateway.ts` line ~173  
**Change**: Removed `'agents.files.get'` from the retry set. Reason: `getAgentFile` is the edit base for read-modify-write flows (fetch content → user edits → `setAgentFile`). Auto-retrying after `[BRIDGE_UNAVAILABLE]` can silently return newer file content if the file changed in the ~750ms gap, and `setAgentFile` takes no base-hash token (unlike `config.get` → `patchConfig`/`setConfig` which pass `baseHash` for server-side staleness rejection). Updated comment block to document the exclusion and the contrast with `tools.catalog`/`agents.files.list` (pure display reads where newer-on-retry is acceptable).

### 4. `async` on `sendBackendRequest` — NO CHANGE (OpenCode steal, keep as-is)
OpenCode correctly defeated Opus's proposal to remove the `async` keyword. `async` provides a zero-cost defensive guarantee: any future synchronous throw in the function body becomes a rejected promise rather than propagating synchronously. The `as Promise<T>` cast on the return is the actual smell (unchecked type assertion), but fixing it requires a larger refactor of `sendRequestWithHermesBridgeRetry`'s generic signature. No change applied — the existing code is correct.

---

## Test Count: 62 (gateway-backend-operations.test.ts), suite green
