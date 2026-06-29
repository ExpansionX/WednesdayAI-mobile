# Adversarial Code Review Tournament — Final Summary

**Branch**: `worktree-bridge-cse_017t4jHHDgStaaKTBnmEp4gm`
**Implementation**: `gateway-backend-operations` backend descriptor (WEDNESDAYAI_OPERATIONS, YOUMIND_OPERATIONS, deriveBaseUrl fix, fetchUsage/fetchCostSummary explicit spread)
**Date**: 2026-06-29
**Panelists**: Opus (Claude CLI), Codex (Codex CLI), Sisyphus (OpenCode CLI / GLM-5.2)

---

## Scoring Rules

| Round | Points |
|-------|--------|
| R1: Issue found | +1 per issue |
| R2: Working remediation proposed | +1 per working/partial fix |
| R3: Remediation survives peer adversarial review | +1 per SURVIVES verdict |

PARTIAL-DEFEAT and DEFEATED verdicts earn 0 for R3. Withdrawn R1 findings earn 0 for all rounds.

---

## Round 1 Results — Issue Finding

### Opus (Claude CLI / claude-opus-4-5)
Issues found: 7, of which **2 were self-withdrawn in R2** as non-issues after reading types.

| # | Severity | Issue | Confirmed? |
|---|----------|-------|------------|
| 1 | Medium | fetchUsage/fetchCostSummary explicit undefined fields break callers | **Withdrawn** (types declare all fields optional) |
| 2 | Low | deriveBaseUrl catch returns `http://[invalid` | ✓ |
| 3 | Low | WEDNESDAYAI/YOUMIND share method references; identity tests weak | ✓ |
| 4 | Low | No youmind `getBaseUrl` edge-case tests | ✓ |
| 5 | Medium | `{sessions: undefined}` vs `{}` semantic difference | **Withdrawn** (same issue as #1) |
| 6 | Low | No error propagation test for fetchUsage/fetchCostSummary RPC errors | ✓ |
| 7 | Low | HERMES_BRIDGE_RETRY_METHODS dual-RPC asymmetry undocumented | ✓ |

**Opus R1 score: 5 points** (5 confirmed issues)

---

### Codex (Codex CLI / o4-mini)
Issues found: 2

| # | Severity | Issue | Confirmed? |
|---|----------|-------|------------|
| 1 | Medium | sendBackendRequest bypasses sendRequestWithHermesBridgeRetry — retry whitelist additions non-functional for backend ops | ✓ |
| 2 | Low | deriveBaseUrl catch returns invalid URL strings | ✓ |

**Codex R1 score: 2 points**

---

### Sisyphus (OpenCode CLI / GLM-5.2)
Issues found: 9

| # | Severity | Issue | Confirmed? |
|---|----------|-------|------------|
| 1 | Medium | fetchUsage null test checks 5/7 fields — "all fields" name lies | ✓ |
| 2 | Medium | fetchCostSummary null test checks 3/5 fields — same issue | ✓ |
| 3 | Medium | deriveBaseUrl catch returns `http://[invalid` and test pins it | ✓ |
| 4 | Low | WEDNESDAYAI/YOUMIND shallow spreads; identity tests overstate isolation | ✓ |
| 5 | Low | OpenClaw getModelSelectionState dispatch contract untested | ✓ |
| 6 | Medium | 7 of 11 RPC methods have zero dispatch test coverage | ✓ |
| 7 | Low | HERMES_BRIDGE_RETRY_METHODS mislabeled in diff summary | ✓ |
| 8 | Low | sessions.usage/usage.cost added to retry set but not shouldTraceRequest | ✓ |
| 9 | Low | getAgentFile test only covers openclaw backend | ✓ |

**Sisyphus R1 score: 9 points**

---

## Round 2 Results — Remediation Proposals

### Opus remediations (reviewed by OpenCode in R3)

| # | Status | Change | R2 Points |
|---|--------|--------|-----------|
| 2 | Working Fix | Nested `new URL(stripped)` validation in catch + test rewrite | ✓ +1 |
| 3 | Partial Fix | Tests asserting WednesdayAI/YouMind method refs equal OpenClaw | ✓ +1 |
| 4 | Working Fix | Three youmind getBaseUrl edge-case tests | ✓ +1 |
| 6 | Working Fix | Error propagation tests for fetchUsage/fetchCostSummary | ✓ +1 |
| 7 | Working Fix | Clarifying comment on HERMES_BRIDGE_RETRY_METHODS dual-RPC | ✓ +1 |

**Opus R2 score: 5 points**

---

### Codex remediations (reviewed by Opus in R3)

| # | Status | Change | R2 Points |
|---|--------|--------|-----------|
| 1 | Working Fix | Route sendBackendRequest through sendRequestWithHermesBridgeRetry | ✓ +1 |
| 2 | Working Fix | Nested `new URL(stripped)` validation in catch path | ✓ +1 |

**Codex R2 score: 2 points**

---

### Sisyphus remediations (reviewed by Codex in R3)

| # | Status | Change | R2 Points |
|---|--------|--------|-----------|
| 1 | Working Fix | fetchUsage null test pins all 7 fields | ✓ +1 |
| 2 | Working Fix | fetchCostSummary null test pins all 5 fields | ✓ +1 |
| 3 | Working Fix | catch path regex host-validator rejects `[invalid` hosts | ✓ +1 |
| 4 | Partial Fix | Object identity tests + method-reference divergence anchors | ✓ +1 |
| 5 | Working Fix | getModelSelectionState dispatch tests for openclaw/wednesdayai/youmind | ✓ +1 |
| 6 | Working Fix | 14 new dispatch tests for 7 untested RPC methods | ✓ +1 |
| 7 | Working Fix | "NOT an event whitelist" label comment on HERMES_BRIDGE_RETRY_METHODS | ✓ +1 |
| 8 | Working Fix | Add sessions.usage + usage.cost to shouldTraceRequest | ✓ +1 |
| 9 | Working Fix | Parameterize getAgentFile tests across all 4 backends | ✓ +1 |

**Sisyphus R2 score: 9 points**

---

## Round 3 Results — Adversarial Peer Review

### OpenCode reviewing Opus

| Opus Rem | Verdict | R3 Points |
|----------|---------|-----------|
| R2 (nested URL) | **PARTIAL-DEFEAT** — test rewrite destroys the GLM52-4 query-stripping regression guard; `[invalid` input triggers null via the second URL parse regardless of whether split('?')[0] ran | 0 |
| R3 (method-ref tests) | SURVIVES — correct documentation of intentional spread design | +1 |
| R4 (youmind tests) | SURVIVES — accurate defensive regression tests | +1 |
| R6 (error propagation) | SURVIVES — correctly pins no-catch propagation contract | +1 |
| R7 (retry docs) | SURVIVES — accurate two-RPC explanation | +1 |

**Opus R3 score: 4 points**

---

### Opus reviewing Codex

| Codex Rem | Verdict | R3 Points |
|-----------|---------|-----------|
| R1 (sendBackendRequest → retry) | **PARTIAL-DEFEAT** — fix covers only methods in HERMES_BRIDGE_RETRY_METHODS; 4 read-only backend ops (config.get, tools.catalog, agents.files.list, agents.files.get) are NOT in the whitelist. Test only exercises whitelisted methods, giving false confidence | 0 |
| R2 (nested URL validation) | SURVIVES — double-parse is sound: transforms ws→http, then validates the transformed result | +1 |

**Codex R3 score: 1 point**

---

### Codex reviewing OpenCode (Sisyphus)

| Sisyphus Rem | Verdict | R3 Points |
|--------------|---------|-----------|
| R1 (fetchUsage 7-field) | **PARTIAL-DEFEAT** — `toBeUndefined()` passes even if property is absent; doesn't enforce key presence | 0 |
| R2 (fetchCostSummary 5-field) | **PARTIAL-DEFEAT** — same defect as R1 | 0 |
| R3 (regex host-validator) | **DEFEATED** — regex `^\[[0-9a-fA-F:]+\]$` does not handle ports (`[::1]:8080` fails own test); doesn't catch `http://example.com:abc`; use `new URL()` instead | 0 |
| R4 (method-ref anchors) | **PARTIAL-DEFEAT** — checks only 2 of N methods; Hermes getBaseUrl claim is incorrect (Hermes defines its own closure, not inherited) | 0 |
| R5 (getModelSelectionState) | SURVIVES | +1 |
| R6 (14 dispatch tests) | **PARTIAL-DEFEAT** — relies on R4 for cross-backend coverage but R4 doesn't cover the 7 new methods | 0 |
| R7 (retry set label) | SURVIVES | +1 |
| R8 (shouldTraceRequest) | **PARTIAL-DEFEAT** — conflates retry eligibility (Hermes relay-specific) with trace eligibility (all backends); rationale under-proven | 0 |
| R9 (getAgentFile all backends) | SURVIVES | +1 |

**Sisyphus R3 score: 3 points**

---

## Final Scoreboard

| Panelist | Executor | Model | R1 (Finding) | R2 (Remediation) | R3 (Survival) | **Total** |
|----------|----------|-------|-------------|------------------|---------------|-----------|
| **Sisyphus** | OpenCode CLI | GLM-5.2 | 9 | 9 | 3 | **21** |
| Opus | Claude CLI | claude-opus-4-5 | 5 | 5 | 4 | **14** |
| Codex | Codex CLI | o4-mini | 2 | 2 | 1 | **5** |

---

## 🏆 Winner: Sisyphus (OpenCode CLI / GLM-5.2) — 21 Points

**Why Sisyphus won**: Found the most issues (9), covered all confirmed issues with proposed fixes (9/9), and achieved the broadest coverage — including ISSUE-6 (7 untested RPC dispatch contracts) and ISSUE-8 (shouldTraceRequest asymmetry), which neither other panelist identified. The adversarial review (by Codex) was the most aggressive, defeating 6 of 9 remediations, but 3 survived cleanly.

**Why Opus finished second**: Higher-quality per-issue analysis (2 self-corrections where other panelists would have submitted low-confidence findings), and the strongest R3 survival rate (4/5). The partial defeat on REMEDIATION-2 was precisely identified by OpenCode: the test rewrite destroyed the GLM52-4 regression guard it was supposed to strengthen.

**Why Codex finished third**: Identified the most significant single issue (ISSUE-1: sendBackendRequest retry bypass — a real behavioral bug where the whitelist additions are non-functional for backend ops), but the remediation was defeated because it missed expanding the whitelist to include config/tools/agent-file methods. Low issue count overall.

---

## Key Findings for Action

| Priority | Finding | Source | Recommended Fix |
|----------|---------|--------|-----------------|
| **High** | sendBackendRequest bypasses retry helper — model.get/sessions.usage/usage.cost additions partially non-functional for Hermes relay backend ops | Codex R1 | Route sendBackendRequest through sendRequestWithHermesBridgeRetry AND expand whitelist |
| **High** | 7 of 11 RPC methods (listModels, getConfig, patchConfig, setConfig, fetchToolsCatalog, listAgentFiles, setAgentFile) have zero dispatch test coverage | Sisyphus R1 | Add ~14 dispatch contract tests |
| **Medium** | deriveBaseUrl catch path returns `http://[invalid` — callers receive non-usable URL strings | All three | Use `new URL(stripped)` re-validation; keep separate test for GLM52-4 query-strip regression |
| **Medium** | fetchUsage/fetchCostSummary null tests undercount fields (5/7 and 3/5) | Sisyphus R1 | Add missing field assertions; use `toEqual` with explicit shape to enforce presence |
| **Low** | sessions.usage/usage.cost absent from shouldTraceRequest — asymmetric observability vs retry set | Sisyphus R1 | Add two cases to shouldTraceRequest switch |
| **Low** | OpenClaw getModelSelectionState dispatch untested | Sisyphus R1 | Add 3 explicit dispatch tests per backend kind |

---

## Report Index

| File | Contents |
|------|----------|
| `2026-06-29-R1-opus-issue-finding.md` | Opus R1 findings (7 issues, 2 withdrawn) |
| `2026-06-29-R1-codex-issue-finding.md` | Codex R1 findings (2 issues) |
| `2026-06-29-R1-opencode-issue-finding.md` | Sisyphus R1 findings (9 issues) |
| `2026-06-29-R2-opus-remediation-proposals.md` | Opus R2 remediations (5 fixes) |
| `2026-06-29-R2-codex-remediation-proposals.md` | Codex R2 remediations (2 fixes) |
| `2026-06-29-R2-opencode-remediation-proposals.md` | Sisyphus R2 remediations (9 fixes) |
| `2026-06-29-R3-opencode-reviews-opus.md` | OpenCode adversarial review of Opus R2 |
| `2026-06-29-R3-opus-reviews-codex.md` | Opus adversarial review of Codex R2 |
| `2026-06-29-R3-codex-reviews-opencode.md` | Codex adversarial review of Sisyphus R2 |
