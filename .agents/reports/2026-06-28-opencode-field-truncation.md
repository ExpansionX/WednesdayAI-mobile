---
date: 2026-06-28
round: 2
panelist: opencode (GLM-5.2)
reviewed_by: codex
total_findings: 6
score: 16
---

# Round 2 — opencode (GLM-5.2) — Field Truncation

**Scope:** `gateway-backend-operations.ts` and `gateway-backend-operations.test.ts` after Round 1 remediations applied.

---

## GLM52-R2-1 — fetchUsage silently drops 4 UsageResult fields

**Location:** `apps/mobile/src/services/gateway-backend-operations.ts` (fetchUsage return, lines 209-213)

**Issue:** The Round 1 explicit-extraction fix returned `{ sessions, totals, costPresentation }` — only 3 of the 7 declared fields in `UsageResult`. Missing: `updatedAt`, `startDate`, `endDate`, `aggregates`.

**Why it matters:** `aggregates` contains the full breakdown by model, provider, agent, channel, and daily usage. Callers relying on `UsageResult.aggregates` or `updatedAt` receive `undefined` silently — no type error, no runtime error, just lost data.

**Remediation:** Return all 7 fields:
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

**Peer verdict (codex):** PASS — confirmed the truncation is real and the fix is correct. 3 pts.

---

## GLM52-R2-2 — fetchCostSummary silently drops 3 CostSummary fields

**Location:** `apps/mobile/src/services/gateway-backend-operations.ts` (fetchCostSummary return, lines 223-226)

**Issue:** Round 1 fix returned `{ totals, costPresentation }` — only 2 of the 5 declared fields in `CostSummary`. Missing: `updatedAt`, `days`, `daily`.

**Why it matters:** `daily` is the per-day cost breakdown that drives the analytics chart. `days` is the period length. Stripping them silently breaks any caller that renders cost trends.

**Remediation:** Return all 5 fields:
```ts
return {
  updatedAt: result?.updatedAt,
  days: result?.days,
  daily: result?.daily,
  totals: result?.totals,
  costPresentation: result?.costPresentation,
};
```

**Peer verdict (codex):** PASS — confirmed. 3 pts.

---

## GLM52-R2-3 — YOUMIND_OPERATIONS lacks explicit no-op stubs for capability-gated ops

**Location:** `apps/mobile/src/services/gateway-backend-operations.ts` (YOUMIND_OPERATIONS, lines 259-265)

**Issue:** `YOUMIND_OPERATIONS = { ...OPENCLAW_OPERATIONS }` inherits live RPC methods for `gatewayConnection`, `modelSelection`, `configRead`, and `configWrite` — all of which are disabled in `YOUMIND_CAPABILITIES`. If a caller bypasses the capability guard (or if the guard is not applied consistently), these methods fire OpenClaw RPCs against a YouMind endpoint and fail silently.

**Remediation:** Override each capability-disabled method with a no-op stub that throws a descriptive error:
```ts
const YOUMIND_OPERATIONS: GatewayBackendOperations = {
  ...OPENCLAW_OPERATIONS,
  getConfig: async () => { throw new Error('YouMind: configRead not supported'); },
  patchConfig: async () => { throw new Error('YouMind: configWrite not supported'); },
  setConfig: async () => { throw new Error('YouMind: configWrite not supported'); },
};
```

**Peer verdict (codex):** FAIL — codex ruled that YOUMIND_CAPABILITIES already gates these at the call site and the comment in YOUMIND_OPERATIONS documents this explicitly. Adding throw-stubs introduces a second enforcement point that could diverge from YOUMIND_CAPABILITIES and silently break flows that intentionally call these methods after verifying the capability guard externally. 1 pt.

---

## GLM52-R2-4 — HERMES_OPERATIONS.getModelSelectionState dispatches model.get (inconsistent with getCurrentModelState)

**Location:** `apps/mobile/src/services/gateway-backend-operations.ts` (HERMES_OPERATIONS, inherited from sharedOperations)

**Issue:** `getCurrentModelState` is overridden in `HERMES_OPERATIONS` to dispatch `model.current`. `getModelSelectionState` is inherited from `sharedOperations` and dispatches `model.get`. Both methods ask "what is the current model?", but they use different Hermes RPC methods. If Hermes's `model.get` is not supported or returns empty results, model selection will silently return empty `models[]`. Additionally, `model.get` is not in `HERMES_BRIDGE_RETRY_METHODS` while `model.current` is — meaning `getModelSelectionState` calls are not retry-eligible on transient bridge failures.

**Remediation:** Override `getModelSelectionState` in `HERMES_OPERATIONS` to dispatch `model.current`, consistent with `getCurrentModelState`:
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
Also add `model.get` to `HERMES_BRIDGE_RETRY_METHODS` as a belt-and-suspenders measure.

**Peer verdict (codex):** PASS — confirmed the inconsistency is real. 3 pts.

---

## GLM52-R2-5 — No tests for fetchUsage or fetchCostSummary

**Location:** `apps/mobile/src/services/gateway-backend-operations.test.ts`

**Issue:** The test suite expanded to 22 tests in Round 1 but added zero coverage for `fetchUsage` or `fetchCostSummary`. The Round 1 explicit-extraction fix (which then truncated fields) had no test catching the truncation — that is why the regression persisted undetected until Round 2.

**Remediation:** Add a describe block covering:
1. RPC method and params dispatched (`sessions.usage` / `usage.cost`)
2. All fields from the response preserved in the return value
3. Null response handled gracefully (all fields `undefined`)

**Peer verdict (codex):** PASS. 3 pts.

---

## GLM52-R2-6 — getBaseUrl try-path has no query-string or hash-strip tests

**Location:** `apps/mobile/src/services/gateway-backend-operations.test.ts`

**Issue:** The Round 1 catch-path test (`ws://[invalid/v1/hermes/ws?token=abc`) covers the `catch` branch of `deriveBaseUrl`. But the `try` path — which uses `url.search = ''` and `url.hash = ''` — has no test asserting that `?token=abc` or `#fragment` is stripped on valid URLs. A regression in the `try` path would not be caught.

**Remediation:** Add at least two tests:
1. `wss://example.com/ws?token=abc` → `https://example.com` (openclaw try path, query stripped)
2. `wss://example.com/v1/hermes/ws?token=abc` → `https://example.com` (hermes try path, query stripped)

**Peer verdict (codex):** PASS. 3 pts.

---

## Score

| Finding | Verdict | Points |
|---------|---------|--------|
| GLM52-R2-1: fetchUsage field truncation | PASS | 3 |
| GLM52-R2-2: fetchCostSummary field truncation | PASS | 3 |
| GLM52-R2-3: youmind no-op stubs | FAIL | 1 |
| GLM52-R2-4: hermes getModelSelectionState inconsistency | PASS | 3 |
| GLM52-R2-5: no fetchUsage/fetchCostSummary tests | PASS | 3 |
| GLM52-R2-6: try-path getBaseUrl untested | PASS | 3 |
| **Total** | | **16** |
