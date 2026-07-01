---
date: 2026-06-28
round: 3
panelist: opus
reviewed_by: opencode
total_findings: 2
score: 6
---

# Round 3 — Opus — Test Contracts

**Scope:** `gateway-backend-operations.ts` and `gateway-backend-operations.test.ts` after Round 2 remediations applied (all 7 UsageResult fields, all 5 CostSummary fields, HERMES_OPERATIONS overrides, deriveBaseUrl null guard, 31 tests).

---

## SONNET-R3-01 — getAgentFile throw contract is not tested

**Location:** `apps/mobile/src/services/gateway-backend-operations.ts:186-194` + `gateway-backend-operations.test.ts`

**Issue:** `getAgentFile` (lines 186-194) is the only method in `sharedOperations` that throws instead of returning a defaulted shape. When `result.file` is absent, it throws `new Error('File not found')`. Every other method returns `result?.field ?? default`. This is an explicit API contract: callers must handle a rejected promise. The test suite covers all other methods but has zero tests for `getAgentFile` — neither the success path (returns `result.file`) nor the throw path.

**Why it matters:** An accidental refactor to `return result?.file ?? { name: name, missing: true }` — matching the pattern of every neighbouring method — would silently change the contract from "reject" to "resolve with empty". No test would catch it. The throw is the semantically correct behaviour (a missing file is an error, not a success with a placeholder), so the contract is intentional and should be pinned.

**Remediation:** Add two tests:
1. `getAgentFile` rejects with `'File not found'` when `result.file` is absent
2. `getAgentFile` resolves with the exact file payload when present

**Peer verdict (opencode):** PASS. 3 pts.

---

## SONNET-R3-02 — Hermes setModelSelection dispatch is unpinned

**Location:** `apps/mobile/src/services/gateway-backend-operations.ts:248-267` (HERMES_OPERATIONS) + `gateway-backend-operations.test.ts:154-166`

**Issue:** `HERMES_OPERATIONS` overrides `getCurrentModelState` (→ `model.current`) and `getBaseUrl` (→ Hermes ws pattern). It does NOT override `setModelSelection`, which inherits `model.set` from `sharedOperations`. This is intentional: reads are Hermes-specific, writes converge on the shared model. But no test pins this asymmetry for Hermes specifically — the existing test only covers `wednesdayai: setModelSelection → model.set`.

**Why it matters:** If a future change adds a Hermes-specific write override (e.g. `model.set.global`) or "fixes" the read/write asymmetry by routing Hermes writes through `model.current`-style methods, no test would fail. The Hermes Model Selection Rule (global-scoped writes → shared operations) would be violated silently.

**Remediation:** Add a test: `hermes: setModelSelection dispatches model.set (inherited, intentional asymmetry)`. This pins the invariant explicitly and documents that the asymmetry is deliberate.

**Peer verdict (opencode):** PASS. 3 pts.

---

## Score

| Finding | Verdict | Points |
|---------|---------|--------|
| SONNET-R3-01: getAgentFile throw contract untested | PASS | 3 |
| SONNET-R3-02: Hermes setModelSelection dispatch unpinned | PASS | 3 |
| **Total** | | **6** |
