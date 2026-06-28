---
date: 2026-06-28
round: 3
panelist: gemini
reviewed_by: opus
total_findings: 2
score: 0
note: Both findings were genuine at attack time but code was fixed by orchestrator before the review phase ran.
---

# Round 3 — Gemini — Mid-Run Finds

**Scope:** `gateway-backend-operations.ts` (at time of attack: still had Round 2 getModelSelectionState override) and `ModelsScreen.tsx` (at time of attack: missing `supportsRuntimeSettings` dep).

---

## GEMINI-R3-001 — HERMES_OPERATIONS.getModelSelectionState dispatched model.current (introduced in Round 2)

**Location:** `apps/mobile/src/services/gateway-backend-operations.ts:257-266` (HERMES_OPERATIONS, at time of attack)

**Issue:** Round 2 added a `getModelSelectionState` override to `HERMES_OPERATIONS` that dispatched `model.current` instead of `model.get`. The Hermes bridge dispatches `model.current` to `readHermesCurrentModelState()` — which returns only `{ currentModel, currentProvider, currentBaseUrl, note }`. The `models[]` and `providers[]` fields are absent. The `getModelSelectionState` wrapper falls back to `result?.models ?? []` and `result?.providers ?? []`, always empty. Any Hermes model picker would render permanently empty.

**Hermes source evidence (bridge-runtime/src/hermes.ts):**
- Line 1126-1129: `model.current` → `readHermesCurrentModelState()`, `model.get` → `readHermesModelState()`
- Line 280-284: `HermesModelState` has `models: HermesModelDescriptor[]` + `providers: HermesProviderListing[]`
- Line 3285-3310: `readHermesCurrentModelState()` returns only 4 fields, NO models/providers

**Remediation:** Revert the Round 2 override. Keep `getModelSelectionState` inherited from `sharedOperations` (dispatches `model.get`). Update the test to document the intentional asymmetry.

**Peer verdict (opus):** FAIL — at review time, the code had already been reverted and `getModelSelectionState` correctly inherits `model.get`. The bug no longer existed. 0 pts.

**Note:** Finding was genuine. The Round 2 override was a correctness regression. Fixed during the tournament run before the review phase.

---

## GEMINI-R3-002 — headerRight useMemo missing supportsRuntimeSettings dependency

**Location:** `apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx:56-69`

**Issue:** The `headerRight` useMemo used `settings.supportsRuntimeSettings` in the `disabled` prop (line 61) but did not include it in the dependency array (lines 64-68). When `supportsRuntimeSettings` transitions from `false` to `true` (e.g. after switching backends), the memo is not invalidated — the button becomes visible (line 78 evaluates it outside the memo) but stays disabled (stale closure).

**Remediation:** Add `settings.supportsRuntimeSettings` to the dependency array.

**Peer verdict (opus):** FAIL — at review time, the fix had already been applied (line 68 now contains `settings.supportsRuntimeSettings`). The bug no longer existed. 0 pts.

**Note:** Finding was genuine. Fixed during the tournament run before the review phase.

---

## Score

| Finding | Verdict | Note | Points |
|---------|---------|------|--------|
| GEMINI-R3-001: model.current regression (R2 fix error) | FAIL | fixed mid-run | 0 |
| GEMINI-R3-002: headerRight stale closure | FAIL | fixed mid-run | 0 |
| **Total** | | | **0** |
