# T5 Tiebreaker — Codex adjudicates O1 steal dispute

You are Codex serving as neutral tiebreaker in a steal dispute. Read-only analysis only.
Do NOT write any code files — write a report only.

## The dispute: O1 — `useGatewayRuntimeSettings` over-eager for YouMind

### Background
OpenCode found that `ModelsScreen` calls `useGatewayRuntimeSettings` unconditionally for all
backends, including YouMind which renders a static `EmptyState`. The hook's capability gating
(configRead: false for YouMind at `apps/mobile/src/services/gateway-backends.ts`) prevents any
network I/O. The cost is pure local: ~15 useState allocations, one no-op effect, one unused
useMemo. Finding severity: LOW (no observable behavior difference).

### OpenCode's R2 fix
Split `ModelsScreen` into three components:
1. Thin `ModelsScreen` dispatcher: reads config, calls `resolveGatewayBackendKind(config)`, returns early to either `YouMindModelsScreen` or `ModelsScreenInner` (raw if/else by backend kind)
2. `YouMindModelsScreen` (new file): renders EmptyState + modal header, no `useGatewayRuntimeSettings`
3. `ModelsScreenInner` (new file): current body minus youmind branch in `selectByBackend`

The dispatcher uses `resolveGatewayBackendKind` → if/else, not `selectByBackend`.

### Claude's R3 steal challenge
Claude says the fix is **VALID+FLAWED** because:
1. Introduces raw backend-kind branching (raw if/else) violating CLAUDE.md Dual Backend Architecture Rule §4: "Prefer centralized backend capability registries and adapters over scattered if (backend === ...) checks."
2. Duplicates modal-header wiring across two leaf components, creating a regression surface
3. Two new files for a trivially low-severity issue

Claude's proposed steal fix (better alternative):
```tsx
export function ModelsScreen(): React.JSX.Element {
  const { config } = useAppContext();
  return selectByBackend(config, {
    youmind: <YouMindModelsScreen />,
    wednesdayai: <ModelsScreenInner />,
    openclaw: <ModelsScreenInner />,
    hermes: <ModelsScreenInner />,
  });
}
```
With `YouMindModelsScreen` and `ModelsScreenInner` as local components in the SAME file (no new files). `selectByBackend` is the prescribed capability-registry pattern; React only mounts the selected child so YouMind never reaches `useGatewayRuntimeSettings`.

### Your task
Adjudicate this steal dispute:

1. Is OpenCode's original fix FLAWED on the specific grounds Claude raises?
   - Does the raw `resolveGatewayBackendKind` → if/else dispatcher violate CLAUDE.md arch rules?
   - Is header wiring duplication a real regression risk?
   
2. Is Claude's alternative actually better, and can OpenCode defeat it?
   - Does Claude's `selectByBackend`-based approach work for avoiding the hook?
   - Is `selectByBackend` the correct tool here (it returns JSX elements based on backend kind)?

3. Final verdict:
   - STEAL STANDS: Claude's fix is clearly superior and OpenCode's fix has real flaws → Claude earns O1 points, OpenCode earns 0 for O1
   - STEAL FAILS: OpenCode's fix is valid and sound (even if Claude's is also good) → OpenCode keeps O1 points
   
Key rule: a steal only succeeds if the ORIGINAL fix is genuinely FLAWED (not just "not optimal").
If OpenCode's fix is valid but Claude's is slightly better, the steal should FAIL.

Check `apps/mobile/CLAUDE.md` for the Dual Backend Architecture Rule to see if raw kind branches are prohibited.

Write your verdict to `.agents/reports/2026-06-30-T5-tiebreak-o1-steal.md`.
