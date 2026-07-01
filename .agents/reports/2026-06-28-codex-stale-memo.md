---
date: 2026-06-28
round: 3
panelist: codex
reviewed_by: gemini
total_findings: 1
score: 0
note: Finding was genuine at attack time but code was fixed by orchestrator before the review phase ran.
---

# Round 3 — Codex — Stale Memo

**Scope:** `ModelsScreen.tsx` (at time of attack: missing `supportsRuntimeSettings` dep in headerRight useMemo).

---

## GPT5-R3-001 — headerRight useMemo stale closure on supportsRuntimeSettings

**Location:** `apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx:56-69`

**Issue:** The `headerRight` useMemo computed `disabled={settings.loadingGatewaySettings || settings.savingGatewaySettings || !settings.supportsRuntimeSettings}` but `settings.supportsRuntimeSettings` was absent from the dependency array `[settings.loadGatewaySettings, settings.loadingGatewaySettings, settings.savingGatewaySettings]`.

When `supportsRuntimeSettings` transitions from `false` to `true` (e.g. after backend reconnect resolves capabilities) without any of the three listed deps changing reference, the memo is not recomputed. The button becomes visible (because `useNativeStackModalHeader` reads `settings.supportsRuntimeSettings` fresh each render at line 78), but the stale `disabled={true}` from the memo element means the button is non-interactable until an unrelated dep triggers re-evaluation.

**Remediation:** Add `settings.supportsRuntimeSettings` to the dependency array.

**Peer verdict (gemini):** FAIL — at review time, the fix had been applied. `settings.supportsRuntimeSettings` was already present at line 68 of the dependency array. The bug described does not exist in the current code. 0 pts.

**Note:** Finding was genuine at attack time. Fixed by orchestrator during the tournament run before the review phase.

---

## Score

| Finding | Verdict | Note | Points |
|---------|---------|------|--------|
| GPT5-R3-001: headerRight stale closure | FAIL | fixed mid-run | 0 |
| **Total** | | | **0** |
