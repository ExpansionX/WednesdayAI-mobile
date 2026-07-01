---
date: 2026-06-28
round: 2
panelist: codex
reviewed_by: gemini
total_findings: 3
score: 9
---

# Round 2 — Codex — Usage Fields

**Scope:** `gateway-backend-operations.ts` and `gateway-backend-operations.test.ts` after Round 1 remediations applied.

---

## GPT5-R2-1 — fetchUsage returns a subset of UsageResult (drops aggregates and date fields)

**Location:** `apps/mobile/src/services/gateway-backend-operations.ts` (fetchUsage, lines 209-213)

**Issue:** `UsageResult` type has 7 optional fields. Round 1 replaced the unsafe `as`-cast with explicit field extraction:
```ts
return {
  sessions: result?.sessions,
  totals: result?.totals,
  costPresentation: result?.costPresentation,
};
```
This drops `updatedAt`, `startDate`, `endDate`, and `aggregates`. TypeScript accepts this because all `UsageResult` fields are optional, so the return type is still assignable — no compile-time error. But `aggregates` contains `byModel`, `byProvider`, `byAgent`, `byChannel`, and `daily` — the core analytics data. Any screen consuming these fields receives `undefined`.

**Remediation:** Return all declared fields of `UsageResult`:
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

**Peer verdict (gemini):** PASS — confirmed data loss is real. 3 pts.

---

## GPT5-R2-2 — fetchCostSummary returns a subset of CostSummary (drops daily, days, updatedAt)

**Location:** `apps/mobile/src/services/gateway-backend-operations.ts` (fetchCostSummary, lines 223-226)

**Issue:** Same pattern as GPT5-R2-1. `CostSummary` has 5 fields; Round 1 returns only `{ totals, costPresentation }`. `daily: CostDailyEntry[]` (per-day cost series required for charts), `days` (reporting window), and `updatedAt` are silently dropped.

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

**Peer verdict (gemini):** PASS — confirmed. 3 pts.

---

## GPT5-R2-3 — Hermes getModelSelectionState inconsistency: inherits model.get but getCurrentModelState uses model.current

**Location:** `apps/mobile/src/services/gateway-backend-operations.ts` (HERMES_OPERATIONS, sharedOperations inheritance)

**Issue:** `HERMES_OPERATIONS` overrides `getCurrentModelState` to dispatch `model.current` (lines 241-249) because Hermes uses a different RPC method. But `getModelSelectionState` is inherited from `sharedOperations` and dispatches `model.get`. These two methods serve related but different purposes — but for Hermes, both should use `model.current` as the canonical "what model is selected?" query. The inherited `model.get` is not in `HERMES_BRIDGE_RETRY_METHODS`, making it non-retry-eligible on transient bridge failures.

**Remediation:** Override `getModelSelectionState` in `HERMES_OPERATIONS`:
```ts
async getModelSelectionState(request): Promise<GatewayModelSelectionState> {
  const result = await request<GatewayModelSelectionState>('model.current', {});
  return {
    currentModel: result?.currentModel ?? '',
    currentProvider: result?.currentProvider ?? '',
    currentBaseUrl: result?.currentBaseUrl ?? '',
    models: result?.models ?? [],
    providers: result?.providers ?? [],
    note: result?.note ?? null,
  };
},
```

**Peer verdict (gemini):** PASS — confirmed the inconsistency is a real defect. 3 pts.

---

## Score

| Finding | Verdict | Points |
|---------|---------|--------|
| GPT5-R2-1: fetchUsage field truncation | PASS | 3 |
| GPT5-R2-2: fetchCostSummary field truncation | PASS | 3 |
| GPT5-R2-3: hermes getModelSelectionState inconsistency | PASS | 3 |
| **Total** | | **9** |
