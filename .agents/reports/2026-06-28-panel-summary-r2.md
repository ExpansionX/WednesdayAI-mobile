---
date: 2026-06-28
round: 2
workstream: backend-descriptor
type: panel-summary
models: [opencode, gemini, codex, opus]
total_findings: 18
winner: opencode (16 pts)
---

# Adversarial Panel Summary — Round 2

**Date:** 2026-06-28
**Implementation reviewed:** `gateway-backend-operations.ts` + `gateway-backend-operations.test.ts` after Round 1 remediations applied (youmind dispatch, deriveBaseUrl catch fix, retry methods, ModelsScreen, 22-test suite).
**Panel:** opencode (GLM-5.2), gemini, codex, opus
**Cross-review rotation (fixed):** opus→opencode, gemini→opus, codex→gemini, opencode→codex

---

## Score Table

| Model | Findings | Reviewed by | Unique/Pass | Duplicate/Pass | Fail | Points | Rank |
|-------|----------|-------------|-------------|----------------|------|--------|------|
| **opencode** | 6 | codex | 5 pass + 1 fail | 0 | 1 | **16** | 1st |
| **gemini** | 4 | opus | 4 pass | 0 | 0 | **12** | 2nd |
| **codex** | 3 | gemini | 3 pass | 0 | 0 | **9** | 3rd |
| **opus** | 5 | opencode | 0 pass unique | 5 pass (dup) | 0 | **5** | 4th |

**Winner: opencode with 16 points.** Identified both critical data-loss regressions (fetchUsage/fetchCostSummary field truncation) plus three additional genuine issues and one false alarm.

---

## Finding Index (all 18)

| ID | Model | Location | Description | Peer | Verdict | Pts |
|----|-------|----------|-------------|------|---------|-----|
| GLM52-R2-1 | opencode | fetchUsage return | drops updatedAt, startDate, endDate, aggregates | codex | PASS | 3 |
| GLM52-R2-2 | opencode | fetchCostSummary return | drops updatedAt, days, daily | codex | PASS | 3 |
| GLM52-R2-3 | opencode | YOUMIND_OPERATIONS | lacks no-op stubs for capability-disabled ops | codex | FAIL | 1 |
| GLM52-R2-4 | opencode | HERMES_OPERATIONS | getModelSelectionState dispatches model.get, not model.current | codex | PASS | 3 |
| GLM52-R2-5 | opencode | test file | zero tests for fetchUsage / fetchCostSummary | codex | PASS | 3 |
| GLM52-R2-6 | opencode | test file | try-path getBaseUrl has no query-string strip test | codex | PASS | 3 |
| GEMINI-R2-1 | gemini | fetchUsage return | drops 4 of 7 UsageResult fields | opus | PASS | 3 |
| GEMINI-R2-2 | gemini | fetchCostSummary return | drops 3 of 5 CostSummary fields | opus | PASS | 3 |
| GEMINI-R2-3 | gemini | deriveBaseUrl catch | trailing-slash strip corrupts bare ws:// → http: | opus | PASS | 3 |
| GEMINI-R2-4 | gemini | test file | no fetchUsage / fetchCostSummary tests | opus | PASS | 3 |
| GPT5-R2-1 | codex | fetchUsage return | truncates UsageResult (drops aggregates + dates) | gemini | PASS | 3 |
| GPT5-R2-2 | codex | fetchCostSummary return | truncates CostSummary (drops daily, days, updatedAt) | gemini | PASS | 3 |
| GPT5-R2-3 | codex | HERMES_OPERATIONS | getModelSelectionState uses model.get vs model.current | gemini | PASS | 3 |
| SONNET-R2-1 | opus | fetchUsage return | truncates UsageResult (dup GLM52-R2-1) | opencode | PASS-dup | 1 |
| SONNET-R2-2 | opus | fetchCostSummary return | truncates CostSummary (dup GLM52-R2-2) | opencode | PASS-dup | 1 |
| SONNET-R2-3 | opus | HERMES_OPERATIONS | getModelSelectionState model.get (dup GLM52-R2-4) | opencode | PASS-dup | 1 |
| SONNET-R2-4 | opus | test file | no fetchUsage/fetchCostSummary tests (dup GLM52-R2-5) | opencode | PASS-dup | 1 |
| SONNET-R2-5 | opus | test file | try-path getBaseUrl untested (dup GLM52-R2-6) | opencode | PASS-dup | 1 |

---

## Critical Findings (Round 2 Blockers)

### 1. fetchUsage / fetchCostSummary field truncation (all 4 models, 4 findings each)

Round 1 replaced unsafe `as`-casts with explicit field extraction, but extracted a strict subset of each type's fields. `UsageResult` has 7 fields; the fix returned 3. `CostSummary` has 5 fields; the fix returned 2. The truncation is invisible to TypeScript (all fields are optional) and no test asserted the returned shape — so the regression shipped undetected through a green test run.

**Root cause:** The Round 1 fix was written without reading the full type definitions. The `aggregates` and `daily` fields that power analytics screens were silently dropped.

**Fix:** Return all declared type fields in both functions.

### 2. deriveBaseUrl catch-path trailing slash (GEMINI-R2-3 — gemini only)

The Round 1 catch-path fix introduced `.replace(/\/+$/, '')`. When applied to `'http://'` (produced by a URL with no host component), this strips the `//` delimiter and returns `'http:'` — a broken URL string. No caller has a `null` guard for this return value.

**Fix:** Add a null guard: `return /^https?:\/\//.test(stripped) ? stripped : null;`

---

## Scoring Analysis

### Why opencode won

opencode's 6-finding sweep covered both new blockers plus three secondary issues plus one false alarm. All five passing findings were unique first-reports, earning 3 pts each. GLM52-R2-3 (youmind no-op stubs) was the only false alarm — codex correctly ruled that `YOUMIND_CAPABILITIES` already gates the call site, making throw-stubs a duplicated enforcement point that could diverge.

### Why opus scored 5 pts despite all 5 findings being genuine

All 5 opus findings were genuine defects confirmed by peer reviewer (opencode). But opencode had already filed all 5 as GLM52-R2-1 through R2-6 earlier in the same round. Tournament rules: later duplicates of the same root cause score 1 pt regardless of peer verdict. Opus got credit for finding real bugs; opencode got the 3-pt bonus for filing first.

### Why Round 1 winner (opus, 18 pts) fell to last place in Round 2

Round 1: opus caught 6 unique issues in the original implementation, all first-reporter.
Round 2: opus re-converged on the same issues opencode had already swept — all 5 findings were duplicates of opencode's findings filed earlier in the same round.

This reversal reflects execution order, not model capability. In a concurrent panel, all models see the same implementation; the 3-pt bonus rewards whoever files the unique finding first in the cross-review rotation.

---

## GLM52-R2-3 (Failed Finding) — Analysis

**Finding:** `YOUMIND_OPERATIONS` inherits live OpenClaw RPC methods for ops disabled by `YOUMIND_CAPABILITIES`. If the capability guard is bypassed, these fire against a YouMind endpoint.

**Codex (peer reviewer) rejection rationale:** `YOUMIND_CAPABILITIES` is the declared single enforcement point for capability gating. Adding throw-stubs in `YOUMIND_OPERATIONS` introduces a second, independent enforcement point that:
1. Can drift from `YOUMIND_CAPABILITIES` if one is updated and the other is not
2. Would break intentional calls that verify capability externally before calling the operation
3. Contradicts the architecture's explicit comment: "capability-gated at the call site via YOUMIND_CAPABILITIES"

The design is deliberate: operations objects describe "how" to call; capabilities describe "whether" to call. Mixing enforcement into the operations object is an architectural reversal.

**Verdict: correct rejection.** GLM52-R2-3 is a genuine code smell but not a correctness defect given the stated architecture. 1 pt awarded for identifying a real concern.

---

## Remediation Status

All Round 2 blockers have been applied to the implementation:

| Issue | Status |
|-------|--------|
| fetchUsage: return all 7 UsageResult fields | ✅ Fixed |
| fetchCostSummary: return all 5 CostSummary fields | ✅ Fixed |
| deriveBaseUrl catch: null guard for bare protocol | ✅ Fixed |
| HERMES_OPERATIONS: getModelSelectionState → model.current | ✅ Fixed |
| gateway.ts: add model.get to HERMES_BRIDGE_RETRY_METHODS | ✅ Fixed |
| Tests: fetchUsage/fetchCostSummary describe block (6 tests) | ✅ Fixed |
| Tests: try-path getBaseUrl with query strings (2 tests) | ✅ Fixed |
| Tests: youmind getBaseUrl (1 test) | ✅ Fixed |
| Tests: GEMINI-R2-3 null guard (1 test) | ✅ Fixed |
| Tests: hermes getModelSelectionState → model.current | ✅ Fixed |

**Test count:** 22 (Round 1) → 31 (Round 2 remediated). All 31 pass.
