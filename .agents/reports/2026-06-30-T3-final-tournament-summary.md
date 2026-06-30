# T3 Tournament Final Summary — 2026-06-30

**Executors**: Claude CLI (Opus 4.8) · Codex CLI · OpenCode CLI (ollama-cloud/glm-5.2)

---

## Round 1 — Findings

| # | Panelist | Issue | File:Line | Sev | Category |
|---|----------|-------|-----------|-----|----------|
| C1 | Claude | `deriveBaseUrl` catch-path tests assert nothing | `gateway-backend-operations.test.ts:153-167` | low | test-quality |
| X1 | Codex | YouMind ModelsScreen renders ModelsView against unsupported capabilities | `ModelsScreen.tsx:117` | medium | correctness |
| O1 | OpenCode | YouMind ModelsScreen renders ModelsView against unsupported capabilities (independent find) | `ModelsScreen.tsx:117` | medium | regression |
| O2 | OpenCode | Retry-eligibility expansion entirely untested (6 new methods + `agents.files.get` exclusion) | `gateway.ts:174-188` | low | test-quality |

---

## Round 2 — Remediation Proposals

| # | Panelist | Proposed fix |
|---|----------|-------------|
| C1 | Claude | Collapse catch body to `return null` (dead stripping code); keep null tests as invariants |
| X1 | Codex | Remove `youmind` branch (falls to openclaw default) or replace with `UnsupportedFeaturePlaceholder`; capability test |
| O1 | OpenCode | Replace with `<EmptyState title message=...>`; capability table regression test |
| O2 | OpenCode | Add `gateway-retry.test.ts` using `ops.getConfig(spy)` pattern |

---

## Round 3 — Adversarial Cross-Reviews

| Reviewer | Subject | Verdict | Rationale |
|----------|---------|---------|-----------|
| Codex | Claude C1 (catch-path) | **VALID+SOUND** | Option A is correct; catch always returns null in all environments; test collapse preserves invariant |
| Claude | Codex X1 (YouMind fix) | **VALID+FLAWED → CLAUDE STEALS** | Primary fix is a no-op (`selectByBackend` defaults missing keys to `openclaw`, same `ModelsView`); `UnsupportedFeaturePlaceholder` does not exist; regression test passes with bug present |
| Codex | OpenCode O1 (YouMind EmptyState) | **VALID+FLAWED → CODEX STEALS** | `EmptyState` exists but uses `subtitle` not `message`; missing import; regression test is static-data-only, passes with bug present |
| Claude | OpenCode O2 (retry tests) | **VALID+FLAWED → CLAUDE STEALS** | Proposed test passes bare spy to `ops.getConfig()`, bypassing `sendRequestWithHermesBridgeRetry` entirely — fails at `toHaveBeenCalledTimes(2)`; `makeHermesRelayClient()` is dead code; parity test encodes wrong set-equality assertion |

---

## Final Scores

| Panelist | Own findings survived | Steals | Total |
|----------|-----------------------|--------|-------|
| **Claude CLI (Opus 4.8)** | C1 → 3 pts (VALID+SOUND by Codex) | Stole X1 (3 pts) + Stole O2 (3 pts) | **9 pts** |
| **Codex CLI** | X1 → 0 pts (stolen by Claude) | Stole O1 (3 pts) | **3 pts** |
| **OpenCode CLI (GLM-5.2)** | O1 → 0 pts (stolen by Codex) · O2 → 0 pts (stolen by Claude) | — | **0 pts** |

**Winner: Claude CLI (Opus 4.8) — 9 points**

---

## Agreed Remediations (all findings requiring action)

### Fix 1 — Collapse `deriveBaseUrl` catch to `return null` (C1, Claude's own)

The catch body stripping code is dead in all production/test URL environments.
Collapse to `return null`, keep both null-assertion tests.

File: `apps/mobile/src/services/gateway-backend-operations.ts` (catch in `deriveBaseUrl`)

### Fix 2 — YouMind ModelsScreen: use EmptyState with correct API (X1/O1, stolen fix)

The agreed fix (from Claude's steal + Codex's steal correction):
- Add `EmptyState` to the import from `../../components/ui`
- Replace `youmind: <ModelsView .../>` with `youmind: <EmptyState title subtitle/>`
- Add a regression test that listModels / getConfig are NOT called for youmind config

File: `apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx`

### Fix 3 — Add retry integration tests using the established harness (O2, stolen fix)

Use the existing harness at `gateway.test.ts:2093-2116`. Drive through
`client.request(method)` on a configured hermes+relay `GatewayClient`, not through
`ops.getMethod(spy)`. Cover:
- One of the six newly-added methods retries on `[BRIDGE_UNAVAILABLE]`
- `agents.files.get` does NOT retry (exclusion invariant)
- `RETRY ⊆ TRACE` structural assertion (not set-equality)

File: `apps/mobile/src/services/gateway.test.ts`
