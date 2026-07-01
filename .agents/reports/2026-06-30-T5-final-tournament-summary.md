# T5 Adversarial Tournament — Final Summary

**Diff reviewed:** T3 + T4 remediations (9 files: ModelsScreen.tsx, gateway-backend-operations.ts, gateway.test.ts, 6 locale JSON files)

**Panelists:** Claude (Opus 4.8) · Codex · OpenCode (ollama-cloud/glm-5.2)

---

## Final Scoreboard

| Panelist | Points | Breakdown |
|----------|--------|-----------|
| **OpenCode** | **12** | O3 ✓ O4 ✓ O10 ✓ X1-steal ✓ |
| **Claude** | **9** | C1 ✓ C3 ✓ O1-steal ✓ |
| **Codex** | **3** | X2 ✓ |

**Winner: OpenCode (GLM-5.2)**

---

## All Findings — Disposition

| ID | Finder | Finding | R2 Fix | R3 Verdict | Points |
|----|--------|---------|--------|------------|--------|
| C1 | Claude | `deriveBaseUrl` catch comment references deleted nested guard | Rewrite comment | Codex: VALID+SOUND | Claude +3 |
| C2 | Claude | `agents.files.get` / `agents.files.list` asymmetry | FALSE POSITIVE (self-corrected) | — | 0 |
| C3 | Claude | Test 2 calls `request()` directly vs `getAgentFile()` public API | Swap to `getAgentFile('plan.md', 'main')` | Codex: VALID+SOUND | Claude +3 |
| C4 | Claude | Resilience gap for non-relay Hermes | FALSE POSITIVE (self-corrected) | — | 0 |
| X1 | Codex | Subset test couples to private static via `as unknown as` | `it.each([...13 literals...])` | OpenCode: VALID+FLAWED → steal | Codex 0, OpenCode +3 |
| X2 | Codex | `config.get` test only exercises first of two retries | Add two-reject/two-advance/3-calls test | OpenCode: VALID+SOUND | Codex +3 |
| O1 | OpenCode | `useGatewayRuntimeSettings` executes for YouMind (no observable cost) | Split into 3 components (2 new files) | Claude: VALID+FLAWED → steal | OpenCode 0, Claude +3 |
| O3 | OpenCode | Same `deriveBaseUrl` comment issue as C1 (independently found) | Rewrite comment | Claude: VALID+SOUND | OpenCode +3 |
| O4 | OpenCode | Retry test doesn't assert params on second call | Add `toHaveBeenNthCalledWith(1/2, ...)` | Claude: VALID+SOUND | OpenCode +3 |
| O10 | OpenCode | Same `config.get` 2nd retry gap as X2 (independently found) | Two-reject/two-advance/3-calls test | Claude: VALID+SOUND | OpenCode +3 |

### Steal verdicts (tiebreaker round)

| Steal | Challenger | Target | Adjudicator | Verdict |
|-------|-----------|--------|-------------|---------|
| O1 | Claude challenges OpenCode's screen-split | Raw kind branching + header duplication | Codex | STEAL STANDS |
| X1 | OpenCode challenges Codex's `it.each` | Addition-drift + invariant weakening + residual cast | Claude | STEAL STANDS |

---

## Agreed Remediations

All agreed remediations listed below must be implemented:

### 1. `deriveBaseUrl` comment (C1 / O3)
**File:** `apps/mobile/src/services/gateway-backend-operations.ts`
Replace the catch comment to describe current single-parse code (no nested guard, no branches).

### 2. Test 2 — use public API (C3)
**File:** `apps/mobile/src/services/gateway.test.ts`
Change `client.request('agents.files.get', { agentId: 'main', name: 'plan.md' })` to `client.getAgentFile('plan.md', 'main')`.

### 3. config.get retry params assertion (O4)
**File:** `apps/mobile/src/services/gateway.test.ts`
Add `toHaveBeenNthCalledWith(1, 'config.get', {})` and `toHaveBeenNthCalledWith(2, 'config.get', {})` to the existing config.get retry test.

### 4. config.get second retry test (X2 / O10)
**File:** `apps/mobile/src/services/gateway.test.ts`
Add a test that rejects twice (750ms each), advances timers twice, and asserts 3 `sendRequest` calls total.

### 5. Subset test — export-based, no private casts (X1 steal — OpenCode's approach, lighter path)
**File:** `apps/mobile/src/services/gateway.ts`
Export `HERMES_BRIDGE_RETRY_METHODS` as a module-level constant (current private static).
**File:** `apps/mobile/src/services/gateway.test.ts`
Update subset test to import and iterate the exported constant; no `as unknown as` cast.

### 6. ModelsScreen — `selectByBackend` dispatcher (O1 steal — Claude's approach)
**File:** `apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx`
- Extract `YouMindModelsScreen` (EmptyState + header) as a local component within the same file
- Extract `ModelsScreenInner` (current body) as a local component within the same file
- `ModelsScreen` becomes a thin dispatcher: `useAppContext()` then `selectByBackend(config, { youmind: <YouMindModelsScreen />, ... })`
- No new files; uses the prescribed `selectByBackend` pattern
