# T3 Round 3 — Codex adversarially reviews OpenCode Issue 1 remediation

**Reviewer**: Codex CLI
**Subject**: OpenCode T3R1 Issue 1 — YouMind ModelsScreen sends unsupported RPCs
**Subject R2**: OpenCode T3R2 Issue 1 — replace with EmptyState

## Adversarial verdict: VALID+FLAWED

**The finding is real.** `ModelsScreen.tsx:117-125` still has the explicit `youmind`
branch rendering `<ModelsView>`. `ModelsView.tsx:284-289` calls
`loadGatewayModelsConfigBundle(gateway)` on mount at line 312-316. The bundle issues
`gateway.listModels()` and `gateway.getConfig()` in parallel at `gateway-models.ts:42-48`.
`YOUMIND_CAPABILITIES` marks `modelCatalog: false` and `configRead: false`
(`gateway-backends.ts:109-119`). `YOUMIND_OPERATIONS = { ...OPENCLAW_OPERATIONS }`
gives YouMind working `models.list` / `config.get` dispatchers — not no-ops.
OpenCode identified this correctly.

## Flaws in OpenCode's remediation

**Flaw 1: Wrong prop name.** `EmptyState` accepts `subtitle`, not `message`
(`apps/mobile/src/components/ui/EmptyState.tsx:6-11`). OpenCode's snippet:
```tsx
youmind: (
  <EmptyState
    title={t('Models')}
    message={t('This backend does not expose a model catalog yet.')}  // ← wrong prop
  />
),
```
This would fail TypeScript type-checking (if prop types are strict) or silently
drop the message body. `EmptyState` is exported from
`apps/mobile/src/components/ui/index.ts:6` and is a real component — but the API
is `title` + `subtitle`, not `title` + `message`.

**Flaw 2: Missing import.** `ModelsScreen.tsx:6` currently imports only
`HeaderActionButton` from `../../components/ui`. The `EmptyState` replacement
requires adding it to the import but OpenCode's fix omits this.

**Flaw 3: Regression test is too weak.** Asserting
`BACKENDS.youmind.capabilities.modelCatalog === false` freezes the capability table
but does not guard against the actual regression (YouMind mounting ModelsView and
firing RPCs). This test passes today with the bug present.

## Stealing fix

Correct `EmptyState` usage with import and a behavioral regression test:

```tsx
// apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx
import { EmptyState, HeaderActionButton } from '../../components/ui';  // add EmptyState

youmind: (
  <EmptyState
    title={t('Models')}
    subtitle={t('This backend does not expose a model catalog yet.')}  // correct prop
  />
),
```

Regression test (render-level, not static):
```typescript
it('youmind: ModelsScreen renders EmptyState, does not call listModels or getConfig', () => {
  const listModels = jest.fn().mockResolvedValue({ models: [] });
  const getConfig = jest.fn().mockResolvedValue({ config: {}, hash: '' });
  // render <ModelsScreen> with backendKind: 'youmind', gateway stub
  // assert: EmptyState subtitle text is present in rendered output
  // assert: listModels not called, getConfig not called
  expect(listModels).not.toHaveBeenCalled();
  expect(getConfig).not.toHaveBeenCalled();
});
```

**VERDICT: CODEX STEALS POINTS**
