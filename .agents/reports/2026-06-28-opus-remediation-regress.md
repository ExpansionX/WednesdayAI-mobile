---
date: 2026-06-28
round: 2
panelist: opus
reviewed_by: opencode
total_findings: 5
score: 5
---

# Round 2 — Opus — Remediation Regress

**Scope:** `gateway-backend-operations.ts` and `gateway-backend-operations.test.ts` after Round 1 remediations applied.

**Note on scoring:** All 5 findings were independently reported by opencode (GLM-5.2) earlier in the same round. Per tournament rules, later identical findings score 1 point regardless of peer review outcome. All findings were genuine — peer reviewer (opencode) confirmed all 5 as real issues — but the 3-point bonus requires uniqueness.

---

## SONNET-R2-1 — fetchUsage silently truncates UsageResult from 7 fields to 3

**Location:** `apps/mobile/src/services/gateway-backend-operations.ts` (fetchUsage return)

**Issue:** Identical to GLM52-R2-1. The Round 1 explicit-extraction fix is a regression: it drops `updatedAt`, `startDate`, `endDate`, and `aggregates`. The `aggregates` field contains the full analytics breakdown that powers usage screens. Callers receive `undefined` for all dropped fields — no compile-time error because all `UsageResult` fields are optional.

**Remediation:** Return all 7 fields. (Same fix as GLM52-R2-1.)

**Peer verdict (opencode):** PASS — but GLM52-R2-1 was filed first. 1 pt (duplicate).

---

## SONNET-R2-2 — fetchCostSummary silently truncates CostSummary from 5 fields to 2

**Location:** `apps/mobile/src/services/gateway-backend-operations.ts` (fetchCostSummary return)

**Issue:** Identical to GLM52-R2-2. `daily`, `days`, and `updatedAt` are dropped. `daily` is the per-day cost series. Analytics charts that depend on `daily` will silently render with no data.

**Remediation:** Return all 5 fields. (Same fix as GLM52-R2-2.)

**Peer verdict (opencode):** PASS — but GLM52-R2-2 was filed first. 1 pt (duplicate).

---

## SONNET-R2-3 — Hermes getModelSelectionState inherits model.get instead of model.current

**Location:** `apps/mobile/src/services/gateway-backend-operations.ts` (HERMES_OPERATIONS)

**Issue:** Identical to GLM52-R2-4. `getCurrentModelState` overrides to `model.current`; `getModelSelectionState` inherits `model.get` from `sharedOperations`. Inconsistency means the Hermes model selection view may dispatch a method that does not return models/providers, silently rendering an empty list. `model.get` is also not in `HERMES_BRIDGE_RETRY_METHODS`.

**Remediation:** Add `getModelSelectionState` override to HERMES_OPERATIONS using `model.current`. (Same fix as GLM52-R2-4.)

**Peer verdict (opencode):** PASS — but GLM52-R2-4 was filed first. 1 pt (duplicate).

---

## SONNET-R2-4 — No test coverage for fetchUsage or fetchCostSummary

**Location:** `apps/mobile/src/services/gateway-backend-operations.test.ts`

**Issue:** Identical to GLM52-R2-5. The test suite has 22 tests but zero covering `fetchUsage` or `fetchCostSummary`. The Round 1 field-truncation regression shipped through a fully-green test run precisely because no test asserted the returned shape.

**Remediation:** Add describe block with RPC dispatch, field-mapping, and null-response tests. (Same fix as GLM52-R2-5.)

**Peer verdict (opencode):** PASS — but GLM52-R2-5 was filed first. 1 pt (duplicate).

---

## SONNET-R2-5 — getBaseUrl try-path has no test for query-string or hash stripping

**Location:** `apps/mobile/src/services/gateway-backend-operations.test.ts`

**Issue:** Identical to GLM52-R2-6. The catch-path query-string regression test added in Round 1 uses `ws://[invalid` to force `new URL()` to throw. But the `try` path (which strips `url.search` and `url.hash` via the URL API) has no dedicated tests. A regression in the try-path strip would pass all current tests.

**Remediation:** Add try-path tests with valid wss:// URLs containing `?token=abc`. (Same fix as GLM52-R2-6.)

**Peer verdict (opencode):** PASS — but GLM52-R2-6 was filed first. 1 pt (duplicate).

---

## Score

| Finding | Verdict | Notes | Points |
|---------|---------|-------|--------|
| SONNET-R2-1: fetchUsage truncation | PASS | duplicate of GLM52-R2-1 | 1 |
| SONNET-R2-2: fetchCostSummary truncation | PASS | duplicate of GLM52-R2-2 | 1 |
| SONNET-R2-3: hermes getModelSelectionState | PASS | duplicate of GLM52-R2-4 | 1 |
| SONNET-R2-4: no fetchUsage/fetchCostSummary tests | PASS | duplicate of GLM52-R2-5 | 1 |
| SONNET-R2-5: try-path getBaseUrl untested | PASS | duplicate of GLM52-R2-6 | 1 |
| **Total** | | | **5** |
