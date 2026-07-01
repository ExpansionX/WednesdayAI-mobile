# T4 Round 3 — Claude adversarially reviews OpenCode

## Verdict: Issue 1 — VALID+SOUND

OpenCode's finding (duplicate "Models" heading for YouMind) is real and its
remediation is correct. I could not defeat it.

Evidence:
- `ModelsScreen.tsx:74` sets the native nav-bar title to `t('Models')`.
- `ModelsScreen.tsx:119` sets the YouMind `EmptyState title={t('Models')}` —
  same string, rendered directly under the nav bar. The duplicate heading is real.
- `ModelsScreen.tsx:20` binds `const { t } = useTranslation('console')`, so
  `t('No models available')` resolves against the **console** namespace.
- `apps/mobile/src/i18n/locales/en/console.json:173` →
  `"No models available": "No models available"`. Verified present in ALL SIX
  console.json locales (en, zh-Hans, ja, ko, de, es — each one match at line 173),
  so OpenCode's central claim ("no new i18n keys required") is TRUE. The
  AGENTS.md rule ("every key in all 6 locales") is satisfied by reuse.
- Subtitle key `"Model selection is not available for this backend."` exists at
  `console.json:1051`, so the body's title+subtitle pair both resolve cleanly.

Adversarial probes that FAILED to defeat it:

1. Key-only-in-chat.json? No. The key exists in BOTH chat.json AND console.json,
   and the screen reads the console namespace. The fix resolves to the correct
   console.json:173 value in every locale. No fallback-to-English risk.

2. Semantic mismatch ("no models available" vs "feature not supported")? This is
   the strongest objection, but it does NOT defeat the fix:
   - The title+subtitle render together: "No models available" /
     "Model selection is not available for this backend." Read as a pair they are
     coherent, and the subtitle carries the precise meaning.
   - "No models available" is literally true for YouMind — there are zero
     selectable models. It is imprecise, not wrong.
   - It matches the existing capability-gated empty-state pattern in the Models
     console area.

3. Cross-context translation drift? A theoretical risk if console.json:173 is
   later retranslated to fit a transient "list not loaded yet" state elsewhere.
   But this is speculative future risk, not a present defect, and it does not
   make the current fix incorrect.

Why I cannot steal the point: any "more accurate" title (e.g. a dedicated
"Model selection unavailable" string) would require introducing a NEW key in all
six console.json locales. That is a strictly LARGER, riskier change and violates
the minimal-change / no-new-keys discipline that the i18n rules reward.
OpenCode's reuse of an existing, fully-localized, namespace-correct key is the
better-engineered remediation. It eliminates the reported regression, compiles
(`title` stays a string; EmptyState contract unchanged — EmptyState.tsx:6-12),
and leaves wednesdayai/openclaw/hermes branches untouched (ModelsScreen.tsx:91-116),
honoring the dual-backend non-regression rule.

## Verdict: Issue 2 — VALID+SOUND

OpenCode's finding (vacuous subset test) is real and its remediation is correct.
It is identical to Claude's own T4R2 proposal, so there is nothing to steal.

Evidence:
- `gateway.test.ts:2199-2204` — the `for (const method of retryMethods)` loop
  runs zero times if `HERMES_BRIDGE_RETRY_METHODS` is ever emptied, and Jest
  reports a zero-assertion `it()` as PASSING. The invariant would silently vanish.
- OpenCode adds `expect.hasAssertions()` (line 2 of the test) plus
  `expect(retryMethods.size).toBeGreaterThan(0)` before the loop.

Adversarial probes that FAILED to find a flaw:
- `.size` is the correct Set accessor; `toBeGreaterThan(0)` fails loudly on an
  empty Set. Correct.
- `expect.hasAssertions()` is mildly redundant with the size guard (size>0 already
  guarantees ≥1 loop iteration and is itself an assertion), but redundancy is not
  a defect — belt-and-suspenders against a future edit that drops the size guard.
- Pure test-only change; no production/runtime/i18n/dual-backend impact.

No flaw found, and the proposal is byte-for-byte Claude's own. Cannot steal from
an identical fix.

## Final: OPENCODE KEEPS POINTS
