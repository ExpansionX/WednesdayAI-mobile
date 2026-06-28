# Breakdown Review — Round 1 (surgical mechanics)

Models: Opus + Gemini. Codex skipped (2-of-3 rule).

## Findings

| id | task | axis | finding | severity |
|----|------|------|---------|----------|
| F1 | 001 | 3/4 | `as GatewayConfig` in test cast — GatewayConfig has required `url: string`; sibling tests all use `as any`. Self-contradictory vs the sibling-note instruction. Typecheck risk. | blocking |
| F2 | 003 | 2/3 | Change B Before text elided with `{ ... }` — not Edit-usable. | blocking |
| F3 | 003 | 1 | Two changes to two unrelated describe blocks in one task; line numbers for Change B go stale after Change A inserts lines at line 92. | blocking |
| F4 | 001+002 | 5 | Spurious `conflicts_with` between 001 and 002 — files are disjoint. | minor |

## Fixes applied

- F1: Changed `as GatewayConfig` → `as any` throughout task 001 test code.
- F2+F3: Task 003 — supplied exact non-elided Before text for Change B; added instruction to apply Change B first (higher line number), then Change A, to avoid stale offsets.
- F4: Removed `conflicts_with: ["002"]` from 001 and `conflicts_with: ["001"]` from 002.

VERDICT after fixes: APPROVE (pending round 2)
