# T5 Tiebreaker — O1 Steal Dispute (Codex adjudicating)

**Dispute:** Claude challenges OpenCode's O1 fix (screen split into 3 components).

## Verdict: STEAL STANDS

Claude's alternative is clearly superior and OpenCode's fix is genuinely flawed.

## Evidence

- `apps/mobile/CLAUDE.md` Dual Backend Architecture Rule §4: *"Prefer centralized backend capability registries and adapters over scattered `if (backend === 'hermes')` checks."*
- `apps/mobile/src/services/gateway-backends.ts:218-236`: `selectByBackend()` is the prescribed helper that keeps screen components free of inline backend checks
- `ModelsScreen.tsx:90-123` already uses `selectByBackend()` for JSX dispatch; the `youmind` branch is already registered there

## Flaws in OpenCode's fix

1. **Raw kind branching violates architecture rule.** OpenCode's dispatcher calls `resolveGatewayBackendKind(config)` → `if (backendKind === 'youmind') return <YouMindModelsScreen />`. This is exactly the pattern the architecture rule prohibits. `selectByBackend` exists to centralize this; reintroducing a raw kind branch is architecture regression.

2. **Header wiring duplication creates real regression surface.** Both `YouMindModelsScreen` and `ModelsScreenInner` must each own `useNativeStackModalHeader` calls. If the header behavior changes (new close affordance, right-content logic), two places need updating instead of one.

## Why Claude's alternative works

Claude's `selectByBackend` dispatcher:
```tsx
export function ModelsScreen() {
  const { config } = useAppContext();
  return selectByBackend(config, {
    youmind: <YouMindModelsScreen />,
    wednesdayai: <ModelsScreenInner />,
    openclaw: <ModelsScreenInner />,
    hermes: <ModelsScreenInner />,
  });
}
```

JSX elements in the object literal are descriptors — React only mounts/runs hooks in the selected child. YouMind never reaches `useGatewayRuntimeSettings`. Uses the prescribed `selectByBackend` pattern. Local components in the same file, no new files required.

## Decision: STEAL STANDS

OpenCode's fix is runtime-valid but architecturally non-compliant and unnecessarily broad. Claude's same-file `selectByBackend` fix is architecturally superior.

**Points: Claude +3 (O1), OpenCode 0 for O1.**
