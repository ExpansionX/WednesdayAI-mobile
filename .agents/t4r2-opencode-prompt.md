# T4 Round 2 — Remediation Proposals (OpenCode)

You are the OpenCode panelist in the T4 adversarial tournament. In Round 1 you found two issues.
Your job now is to propose **correct, specific remediations** for both.

## Issue 1 (regression): Duplicate "Models" heading for YouMind

File: `apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx:74,119`

`useNativeStackModalHeader` sets the nav bar title to `t('Models')` (line 74).
The new youmind `EmptyState` branch (lines 117-122) also sets `title={t('Models')}` — same string.
For YouMind the user sees "Models" twice: once in the nav bar and once as the body heading.

## Issue 2 (test-quality): Subset test has no empty-set guard

File: `apps/mobile/src/services/gateway.test.ts:2199-2204`

The `for...of` loop on `HERMES_BRIDGE_RETRY_METHODS` runs zero times and passes vacuously if the set is empty.
No `expect.hasAssertions()` and no `retryMethods.size` check exists.

## Your task

Propose a concrete, working remediation for each issue. For each:

1. Show the **exact code change** (precise before/after, not pseudocode)
2. Explain why it fixes the problem without introducing new issues
3. Note any i18n requirements (e.g. new locale keys)

Context you may need:
- `apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx` — current youmind branch (lines 115-123)
- `apps/mobile/src/i18n/locales/en/console.json` — existing keys
- `apps/mobile/src/services/gateway.test.ts` — test at lines 2199-2205

Do NOT run shell commands. Read files only if needed.
Then write your proposals to `.agents/reports/2026-06-30-T4R2-opencode-remediation-proposals.md`.
