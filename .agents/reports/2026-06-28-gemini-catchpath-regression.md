---
date: 2026-06-28
round: 2
panelist: gemini
reviewed_by: opus
total_findings: 4
score: 12
---

# Round 2 — Gemini — Catch-Path Regression

**Scope:** `gateway-backend-operations.ts` and `gateway-backend-operations.test.ts` after Round 1 remediations applied.

---

## GEMINI-R2-1 — fetchUsage return omits updatedAt, startDate, endDate, aggregates

**Location:** `apps/mobile/src/services/gateway-backend-operations.ts` (fetchUsage, lines 209-213)

**Issue:** Round 1 replaced the unsafe `as`-cast with explicit field extraction, but extracted only 3 fields from a 7-field type. `UsageResult` declares `updatedAt?: number`, `startDate?: string`, `endDate?: string`, `sessions`, `totals`, `aggregates`, `costPresentation`. The returned object is `{ sessions, totals, costPresentation }` — 4 fields are dropped silently. The caller (`UsageScreen` / analytics panels) loses `aggregates` — the full by-model/by-channel/daily breakdown.

**Remediation:** Spread all 7 fields explicitly rather than picking 3:
```ts
return {
  updatedAt: result?.updatedAt,
  startDate: result?.startDate,
  endDate: result?.endDate,
  sessions: result?.sessions,
  totals: result?.totals,
  aggregates: result?.aggregates,
  costPresentation: result?.costPresentation,
};
```

**Peer verdict (opus):** PASS — confirmed. 3 pts.

---

## GEMINI-R2-2 — fetchCostSummary return omits updatedAt, days, daily

**Location:** `apps/mobile/src/services/gateway-backend-operations.ts` (fetchCostSummary, lines 223-226)

**Issue:** Same pattern as GEMINI-R2-1. `CostSummary` declares 5 fields; the Round 1 fix returns only `{ totals, costPresentation }`. `daily: CostDailyEntry[]` — the per-day cost series — is silently dropped. `days` (the reporting window length) and `updatedAt` are also lost.

**Remediation:**
```ts
return {
  updatedAt: result?.updatedAt,
  days: result?.days,
  daily: result?.daily,
  totals: result?.totals,
  costPresentation: result?.costPresentation,
};
```

**Peer verdict (opus):** PASS — confirmed. 3 pts.

---

## GEMINI-R2-3 — deriveBaseUrl catch-path trailing-slash strip corrupts bare ws:// URLs

**Location:** `apps/mobile/src/services/gateway-backend-operations.ts` (deriveBaseUrl catch block, lines 283-290)

**Issue:** The Round 1 catch-path fix adds `.split('?')[0].split('#')[0]` before the wsPathPattern replace. When the input URL has no host (e.g. `ws://` or `ws://?token=abc`), this produces `'http://'` — then `.replace(/\/+$/, '')` strips the `//` delimiter, yielding `'http:'`. This is a broken URL string, not a valid base URL. Callers receiving `'http:'` would produce network requests with an invalid origin.

**Remediation:** Guard the result: if stripping produced a bare protocol with no `://`, return `null`:
```ts
  } catch {
    const stripped = urlText
      .replace(/^ws(s?):\/\//, 'http$1://')
      .split('?')[0]
      .split('#')[0]
      .replace(wsPathPattern, '')
      .replace(/\/+$/, '');
    return /^https?:\/\//.test(stripped) ? stripped : null;
  }
```

**Peer verdict (opus):** PASS — codex confirmed the edge case is real and the null guard is the minimal correct fix. 3 pts.

---

## GEMINI-R2-4 — No tests for fetchUsage or fetchCostSummary dispatch or field mapping

**Location:** `apps/mobile/src/services/gateway-backend-operations.test.ts`

**Issue:** The Round 1 as-cast fix that introduced the field truncation had no test to catch it. 22 tests exist for `usesConnectHandshake`, `getBaseUrl`, and RPC dispatch, but zero tests for `fetchUsage` or `fetchCostSummary`. This gap allowed a data-loss regression to ship undetected between rounds.

**Remediation:** Add a `fetchUsage / fetchCostSummary` describe block with tests for:
- RPC method and params (prevents wrong-method dispatch)
- All fields present in returned object (prevents silent field truncation, the exact regression that occurred)
- Null response handled (all fields `undefined`, no throw)

**Peer verdict (opus):** PASS. 3 pts.

---

## Score

| Finding | Verdict | Points |
|---------|---------|--------|
| GEMINI-R2-1: fetchUsage field truncation | PASS | 3 |
| GEMINI-R2-2: fetchCostSummary field truncation | PASS | 3 |
| GEMINI-R2-3: catch-path trailing slash corrupts bare ws:// | PASS | 3 |
| GEMINI-R2-4: no fetchUsage/fetchCostSummary tests | PASS | 3 |
| **Total** | | **12** |
