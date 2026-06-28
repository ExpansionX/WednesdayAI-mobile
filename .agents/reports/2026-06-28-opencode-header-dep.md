---
date: 2026-06-28
round: 3
panelist: opencode (GLM-5.2)
reviewed_by: codex
total_findings: 1
score: 0
note: Finding was genuine at attack time but code was fixed by orchestrator before the review phase ran.
---

# Round 3 — OpenCode (GLM-5.2) — Header Dep

**Scope:** `ModelsScreen.tsx` (at time of attack: missing `supportsRuntimeSettings` dep in headerRight useMemo).

---

## GLM52-R3-01 — headerRight useMemo captures supportsRuntimeSettings but excludes it from deps

**Location:** `apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx:56-68`

**Issue:** The `headerRight` useMemo dependency array omitted `settings.supportsRuntimeSettings`, which was read on line 61 as `disabled={settings.loadingGatewaySettings || settings.savingGatewaySettings || !settings.supportsRuntimeSettings}`.

When the active backend changed such that `supportsRuntimeSettings` transitioned from `false` to `true`, the header button became visible (line 78 evaluated `settings.supportsRuntimeSettings` outside the memo — correct). However, the stale closure inside `headerRight` still held `supportsRuntimeSettings === false`, forcing `!supportsRuntimeSettings === true` and `disabled: true`. The button was visible but stuck disabled until a dep that IS listed changed.

**Remediation:** Add `settings.supportsRuntimeSettings` to the dependency array.

**Peer verdict (codex):** FAIL — at review time, `settings.supportsRuntimeSettings` was already present on line 68 of the dependency array. The bug does not exist in the current code. 0 pts.

**Note:** Finding was genuine at attack time. Fixed by orchestrator before review ran.

---

## Score

| Finding | Verdict | Note | Points |
|---------|---------|------|--------|
| GLM52-R3-01: headerRight missing dep | FAIL | fixed mid-run | 0 |
| **Total** | | | **0** |
