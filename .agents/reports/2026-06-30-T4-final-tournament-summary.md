# T4 Tournament Final Summary — 2026-06-30

**Executors**: Claude CLI (Opus 4.8) · Codex CLI · OpenCode CLI (ollama-cloud/glm-5.2)

**Subject**: T3 remediation diff (Fix 1: deriveBaseUrl collapse; Fix 2: EmptyState YouMind; Fix 3: retry integration tests)

---

## Round 1 — Findings

| # | Panelist | Issue | File:Line | Sev | Category |
|---|----------|-------|-----------|-----|----------|
| C1 | Claude | Subset test loops with no empty-set guard — vacuous pass if `HERMES_BRIDGE_RETRY_METHODS` is ever emptied | `gateway.test.ts:2199-2204` | low | test-quality |
| C2 | Claude | YouMind `EmptyState` uses same `t('Models')` title as nav header — duplicate heading | `ModelsScreen.tsx:74,119` | low | regression |
| O1 | OpenCode | Duplicate "Models" heading (same as C2, independent find) | `ModelsScreen.tsx:74,119` | medium | regression |
| O2 | OpenCode | Subset test lacks empty-set guard (same as C1, independent find) | `gateway.test.ts:2199-2204` | low | test-quality |
| (none) | Codex | No issues found | — | — | — |

Fix 1 (deriveBaseUrl collapse) confirmed correct by all three panelists.
Fix 3 (retry tests: config.get path, agents.files.get exclusion) confirmed correct by all three panelists.

---

## Round 2 — Remediation Proposals

| Panelist | Issue | Proposed fix |
|----------|-------|-------------|
| Claude | C1 (subset guard) | `expect.hasAssertions()` + `expect(retryMethods.size).toBeGreaterThan(0)` before loop |
| Claude | C2 (duplicate heading) | Replace `title={t('Models')}` with `title={t('Model selection unavailable')}` — NEW key × 6 locales |
| OpenCode | O1 (duplicate heading) | Replace `title={t('Models')}` with `title={t('No models available')}` — REUSE existing key, zero new locale entries |
| OpenCode | O2 (subset guard) | Identical to Claude: `expect.hasAssertions()` + `expect(retryMethods.size).toBeGreaterThan(0)` |
| Codex | (both, as bonus) | Same as Claude for both issues |

---

## Round 3 — Adversarial Cross-Reviews

| Reviewer | Subject | Verdict | Rationale |
|----------|---------|---------|-----------|
| Claude | OpenCode O1 (duplicate heading — "No models available" reuse) | **VALID+SOUND** | Key verified in all 6 console.json locales; correct namespace (console); semantics coherent as title+subtitle pair; zero new locale entries is superior engineering |
| Claude | OpenCode O2 (subset guard — identical fix) | **VALID+SOUND** | Fix is byte-for-byte identical to Claude's own; no flaw possible |
| OpenCode | Claude C2 (duplicate heading — new key) | **VALID+FLAWED → OPENCODE ATTEMPTS STEAL** | Claims new key violates i18n minimalism; proposes subtitle-as-title stealing fix (zero new keys) |
| OpenCode | Claude C1 (subset guard) | **VALID+SOUND** | Identical fix; confirmed correct |
| Codex (tiebreaker) | Issue 1 dispute — does OpenCode's steal of Claude's C2 stand? | **FIX A VALID+SOUND — STEAL REJECTED** | AGENTS.md rule only requires new keys go to all 6 locales; does NOT prohibit adding new keys when existing keys could work; Claude's Fix A is compliant; OpenCode's Fix B is better on quality but not a rule violation |

---

## Final Scores

| Panelist | C1/O2 subset guard (3 pts max) | C2/O1 duplicate heading (3 pts max) | Total |
|----------|-------------------------------|-------------------------------------|-------|
| **Claude CLI (Opus 4.8)** | 3 pts (found + fixed + survived OpenCode review) | 3 pts (found + fixed + steal rejected by Codex) | **6 pts** |
| **OpenCode CLI (GLM-5.2)** | 3 pts (found + fixed + survived Claude review) | 3 pts (found + fixed "No models available" survived Claude review) | **6 pts** |
| **Codex CLI** | 0 pts (found nothing) | 0 pts | **0 pts** |

**Result: TIE — Claude CLI and OpenCode CLI both 6 pts.**

---

## Agreed Remediations

### Fix A — Add empty-set guard to subset test (C1/O2, agreed by all)

**File:** `apps/mobile/src/services/gateway.test.ts:2199`

```typescript
it('HERMES_BRIDGE_RETRY_METHODS ⊆ shouldTraceRequest: every retry method is also traced', () => {
  expect.hasAssertions();
  const retryMethods = (GatewayClient as unknown as { HERMES_BRIDGE_RETRY_METHODS: Set<string> }).HERMES_BRIDGE_RETRY_METHODS;
  expect(retryMethods.size).toBeGreaterThan(0);
  for (const method of retryMethods) {
    expect((client as any).shouldTraceRequest(method)).toBe(true);
  }
});
```

### Fix B — Replace duplicate YouMind EmptyState title (C2/O1)

**File:** `apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx:119`

Recommended approach: OpenCode's Fix B (zero new locale entries) confirmed VALID+SOUND by Claude.
Claude's Fix A (new key "Model selection unavailable") also confirmed VALID+SOUND by Codex.
Implementing OpenCode's Fix B as it is simpler and requires zero new locale files.

```tsx
    youmind: (
      <EmptyState
        title={t('No models available')}
        subtitle={t('Model selection is not available for this backend.')}
      />
    ),
```

No new locale keys required. `"No models available"` exists in all 6 `console.json` files.
