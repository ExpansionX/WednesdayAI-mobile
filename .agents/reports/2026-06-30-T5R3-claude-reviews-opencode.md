# T5 Adversarial Review — Round 3: Claude Reviews OpenCode

**Reviewer:** Claude
**Targets:** O1, O3, O4, O10

## Summary

| Finding | Verdict | Rationale |
|---------|---------|-----------|
| O1 — `useGatewayRuntimeSettings` over-eager for YouMind | **VALID+FLAWED** | Real but trivial; fix introduces raw backend-kind branching against CLAUDE.md arch rules and duplicates header wiring — Claude steal attempt with `selectByBackend` dispatcher |
| O3 — `deriveBaseUrl` catch comment accuracy | **VALID+SOUND** | Old comment cites deleted nested guard; new comment verified accurate |
| O4 — retry params unasserted | **VALID+SOUND** | Retry re-sends identical params; `toHaveBeenNthCalledWith` locks the invariant |
| O10 — `config.get` 2nd retry | **VALID+SOUND** (low value) | Coverage gap is real; `sessions.list` already pins the same generic loop |

---

## O1 — VALID+FLAWED (steal attempt)

**Finding is real but trivial.** `useGatewayRuntimeSettings` runs unconditionally for YouMind. The hook's capability gating (`configRead: false`, `configWrite: false`) suppresses all network I/O, leaving only ~15 `useState` allocations and one no-op effect — no observable behavior difference.

**OpenCode's fix is hooks-safe** (each component has a constant hook call order) but has three concrete flaws:

1. **Reintroduces raw backend-kind branching.** The proposal dispatches via `resolveGatewayBackendKind(config)` → if/else. CLAUDE.md (Dual Backend Architecture Rule §4): *"Prefer centralized backend capability registries and adapters over scattered `if (backend === 'hermes')` checks."* The existing `selectByBackend` helper is the prescribed mechanism; a raw kind branch in the dispatcher is a rule violation.

2. **Duplicates modal-header wiring.** Today `useNativeStackModalHeader` is set up once with a capability-gated `rightContent`. After the split, both `YouMindModelsScreen` and `ModelsScreenInner` must each own header-hook calls — duplicated wiring is the only real regression surface in this change.

3. **Two new files for a near-zero perf issue.** The hook's capability gating already prevents I/O; the fix trades zero observable improvement for structural complexity.

**Claude's steal fix (architecturally compliant, same file):**
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
Where `YouMindModelsScreen` and `ModelsScreenInner` are local components in the SAME file. `selectByBackend` is the prescribed capability-registry pattern. React only mounts the selected child, so YouMind never reaches `useGatewayRuntimeSettings`. No new files. No raw kind branch. No header duplication risk.

---

## O3 — VALID+SOUND

Comment references "nested `new URL()` guard" and "both branches" that don't exist. Verified the try block: `new URL()` is the only throw site; scheme swap is a plain `.replace()` that cannot throw; hash/search/pathname setters on a constructed URL object do not throw. OpenCode's replacement comment is accurate. No defeat possible.

---

## O4 — VALID+SOUND

`sendRequestWithHermesBridgeRetry` re-invokes `this.sendRequest(method, params)` with the same objects on every attempt (`gateway.ts:1390`). `toHaveBeenNthCalledWith(1/2, 'config.get', {})` pins both calls. No false precision — `config.get` with `{}` params is unambiguous.

---

## O10 — VALID+SOUND (low marginal value)

Coverage gap is real: `config.get` second retry path is not specifically exercised. OpenCode's two-reject/two-advance/3-calls test is structurally correct. Redundancy flagged: `sessions.list` already pins the same generic retry loop (`gateway.ts:1388-1400`), so incremental value is low. Finding is valid; OpenCode keeps points.
