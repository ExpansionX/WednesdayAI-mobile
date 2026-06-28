---
date: 2026-06-28
workstream: backend-descriptor
type: panel-summary
models: [opus, gemini, codex, opencode]
total_findings: 19
total_pass: 19
total_fail: 0
winner: opus (18 pts)
---

# Adversarial Panel Summary — Backend Descriptor Phase 2

**Date:** 2026-06-28
**Implementation reviewed:** `gateway-backend-operations.ts` (WEDNESDAYAI_OPERATIONS + 3-way dispatch), `gateway-backend-operations.test.ts` (4 tests), `gateway-backends.test.ts` (3 youmind coverage tests)
**Panel:** claude CLI (Opus), gemini CLI, codex CLI, opencode CLI (GLM-5.2)
**Cross-review rotation:** opus→opencode, gemini→opus, codex→gemini, opencode→codex

---

## Score Table

| Model | Findings | Reviewed by | Pass/Fail | Points | Rank |
|-------|----------|-------------|-----------|--------|------|
| **opus** | 6 | gemini | 6/0 | **18** | 1st |
| **gemini** | 5 | codex | 5/0 | **15** | 2nd (tied) |
| **opencode** | 5 | opus | 5/0 | **15** | 2nd (tied) |
| **codex** | 3 | opencode | 3/0 | **9** | 4th |

**Winner: opus with 18 points.** Six findings, all passing peer review. Closest rival was gemini and opencode, tied at 15. No model had a finding fail peer review — a 100% pass rate across 19 findings is unusually clean.

---

## Finding Index (all 19)

| ID | Model | Location | Description | Peer | Verdict |
|----|-------|----------|-------------|------|---------|
| GLM52-1 | opencode | gateway-backend-operations.ts | HERMES_OPERATIONS inherits model.get/model.set with no override despite model.current being the Hermes method | opus | PASS |
| GLM52-2 | opencode | gateway-backend-operations.test.ts:5-9 | wednesdayai test asserts reference identity, not behavioral correctness | opus | PASS |
| GLM52-3 | opencode | gateway-backend-operations.ts:252-257 | youmind falls through to OPENCLAW_OPERATIONS despite YOUMIND_CAPABILITIES disabling all gateway ops | opus | PASS |
| GLM52-4 | opencode | gateway-backend-operations.ts (deriveBaseUrl catch) | catch block does not strip query strings before wsPathPattern — leaks `?token=abc` into returned URL | opus | PASS |
| GLM52-5 | opencode | gateway.ts (HERMES_BRIDGE_RETRY_METHODS) | sessions.usage and usage.cost absent from retry-eligible set despite being idempotent reads | opus | PASS |
| SONNET-1 | opus | gateway-backend-operations.ts:252-257 | youmind silent fallthrough | gemini | PASS |
| SONNET-2 | opus | gateway-backend-operations.test.ts | zero youmind test coverage | gemini | PASS |
| SONNET-3 | opus | gateway-backend-operations.test.ts:5-9 | misleading test name claims behavioral distinction | gemini | PASS |
| SONNET-4 | opus | gateway-backend-operations.test.ts | getBaseUrl entirely untested for all backends | gemini | PASS |
| SONNET-5 | opus | gateway-backend-operations.ts (HERMES_OPERATIONS) | getCurrentModelState overridden but getModelSelectionState not | gemini | PASS |
| SONNET-6 | opus | gateway-backend-operations.test.ts | no null config test | gemini | PASS |
| gemini-1 | gemini | gateway-backend-operations.ts:252-257 | youmind silent fallthrough | codex | PASS |
| gemini-2 | gemini | gateway-backend-operations.test.ts | zero youmind test coverage | codex | PASS |
| gemini-3 | gemini | gateway-backend-operations.test.ts:5-9 | wednesdayai test is trivially passing (reference, not value) | codex | PASS |
| gemini-4 | gemini | gateway-backend-operations.test.ts | getBaseUrl untested for all three backends | codex | PASS |
| gemini-5 | gemini | gateway-backend-operations.ts:209,219 | fetchUsage/fetchCostSummary use unsafe as-casts inconsistent with rest of sharedOperations | codex | PASS |
| GPT5-1 | codex | gateway-backend-operations.ts:252-257 | youmind silent fallthrough | opencode | PASS |
| GPT5-2 | codex | ModelsScreen.tsx:89-116 | ModelsScreen omits youmind from selectByBackend — silently renders OpenClaw ModelsView | opencode | PASS |
| GPT5-3 | codex | gateway-backend-operations.test.ts | wednesdayai test suite checks identity/one-flag only, misses full method surface | opencode | PASS |

---

## Top 3 Genuine Issues (from scorekeeper synthesis)

### 1. youmind silently falls through to OPENCLAW_OPERATIONS (GLM52-3 / SONNET-1 / gemini-1 / GPT5-1)

Every model independently caught this. `getGatewayBackendOperations` dispatches only on `hermes` and `wednesdayai`, so a YouMind config inherits OpenClaw RPC methods despite `YOUMIND_CAPABILITIES` explicitly disabling gateway operations. The capability guard says "no gateway"; the operations object happily fires `model.get` anyway.

**Fix:** Add `YOUMIND_OPERATIONS` constant and explicit dispatch branch. See individual reports for preferred form (no-op stubs vs documented fallback).

### 2. deriveBaseUrl catch block does not strip query strings (GLM52-4 — opencode only)

The `try` block uses `new URL()` which correctly isolates the pathname. The catch block strips slashes but applies `wsPathPattern` to the raw string — a `?token=abc` suffix breaks the regex match and the WS path plus token leak into the returned URL.

**Fix:** Add `.split('?')[0].split('#')[0]` before the `replace(wsPathPattern, ...)` in the catch block.

### 3. sessions.usage and usage.cost absent from HERMES_BRIDGE_RETRY_METHODS (GLM52-5 — opencode only)

Both are idempotent reads; both are live Hermes paths (`HERMES_CAPABILITIES.consoleUsage === true`, `consoleCost === true`). The stated retry policy explicitly covers idempotent reads. Their absence from `HERMES_BRIDGE_RETRY_METHODS` is inconsistent with the policy and leaves them unretried on transient Hermes bridge failures.

**Fix:** Add `'sessions.usage'` and `'usage.cost'` to `HERMES_BRIDGE_RETRY_METHODS` in `gateway.ts`.

---

## Notable False Alarms

None. Every finding scored 3 points (passed peer review). The panel had a 100% pass rate across 19 findings — the adversarial peer reviewers found no false alarms.

---

## Panel Observations

**Convergence on youmind (4 of 19 findings).** All four models independently identified the missing youmind dispatch branch. This is useful convergence — it proves the issue is real and not a single model's blind spot — but it also means 21% of the panel's findings were duplicates of the same root cause.

**opencode caught the two most unique bugs.** GLM52-4 (query string leakage in catch block) and GLM52-5 (retry method omission) required cross-file reasoning: GLM52-4 required comparing the `try` and `catch` paths in the same function; GLM52-5 required correlating `HERMES_CAPABILITIES` in one file with `HERMES_BRIDGE_RETRY_METHODS` in `gateway.ts`. No other model demonstrated this cross-file awareness.

**codex (3 findings, lowest volume, 100% precision) produced the only UI-layer finding.** GPT5-2 traces the `getGatewayBackendOperations` dispatch gap all the way to `ModelsScreen.tsx` rendering the wrong view for YouMind configs. This is the only finding that escalates beyond the operations layer to an observable user-facing consequence.

**opus and gemini focused on test quality.** Roughly half their combined findings addressed misleading tests, missing test cases, and false-confidence assertions. These are real and actionable, but they are second-order: the tests are weak because the production code has gaps, not the reverse. Their test-quality findings are the right hardening pass once the production fixes (youmind branch, catch block, retry methods) are applied.

**gemini-5 is the softest passing finding.** The unsafe `as`-cast issue is latent — all `UsageResult` and `CostSummary` fields are currently optional, so no TypeScript lie exists today. It passed peer review correctly (the inconsistency with the rest of `sharedOperations` is real) but sits at the edge of "genuine defect" vs "code smell."

---

## Recommended Next Tasks

Priority order based on correctness impact:

1. **Add explicit youmind branch to getGatewayBackendOperations** (GLM52-3/SONNET-1/gemini-1/GPT5-1) — correctness, all models agree
2. **Fix deriveBaseUrl catch block to strip query strings** (GLM52-4) — correctness, silent URL leakage
3. **Add sessions.usage and usage.cost to HERMES_BRIDGE_RETRY_METHODS** (GLM52-5) — reliability, inconsistent retry policy
4. **Fix ModelsScreen to pass explicit youmind branch to selectByBackend** (GPT5-2) — UI correctness, renders wrong view
5. **Add getBaseUrl tests for all three backends** (SONNET-4/gemini-4) — regression coverage for different wsPathPattern regexes
6. **Add RPC dispatch tests using spy GatewayRequestFn** (GLM52-1/SONNET-5) — reveals model.get/model.set Hermes compatibility
7. **Add null config and youmind tests to gateway-backend-operations.test.ts** (SONNET-2/SONNET-6/gemini-2) — locks public API contracts

Items 1–4 are correctness bugs. Items 5–7 are test hardening.
