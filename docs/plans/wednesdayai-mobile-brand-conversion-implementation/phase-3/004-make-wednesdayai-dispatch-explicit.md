---
id: "004"
phase: 3
title: Make WednesdayAI backend dispatch explicit
status: passed
depends_on: ["003"]
parallel: false
conflicts_with: []
files:
  - apps/mobile/src/services/gateway-backends.ts
  - apps/mobile/src/services/gateway-backends.test.ts
  - apps/mobile/src/services/storage.ts
  - apps/mobile/src/services/console-entry-descriptors.ts
  - apps/mobile/src/services/gateway-doc-links.ts
  - apps/mobile/src/screens/OfficeScreen/OfficeTab.tsx
  - apps/mobile/src/screens/ChatScreen/hooks/chatSyncPolicy.ts
  - apps/mobile/src/screens/ConsoleScreen/HermesAwareCronScreens.tsx
  - apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx
  - apps/mobile/src/screens/ConsoleScreen/ConsoleMenuScreen.tsx
irreversible: false
scope_test: "apps/mobile/src/services/gateway-backends.test.ts"
allowed_change: edit
covers_criteria: [SC7, SC8, SC11]
---
## Failing test (write first)
In `apps/mobile/src/services/gateway-backends.test.ts`, update the `selectByBackend` tests so WednesdayAI is explicit and no OpenClaw fallback branch is accepted:

```ts
expect(selectByBackend('wednesdayai', { wednesdayai: 'W', openclaw: 'A', hermes: 'B' })).toBe('W');
```

Also add assertions for existing helpers that consume backend identity:

```ts
expect(resolveGlobalMainSessionKey('wednesdayai')).toBeNull();
expect(getGatewayModeLabel({ backendKind: 'wednesdayai', transportKind: 'relay' } as any)).toBe('Remote');
expect(getGatewayModeLabel({ backendKind: 'wednesdayai', transportKind: 'custom' } as any)).toBe('Custom');
expect(buildGatewayDefaultName({
  backendKind: 'wednesdayai',
  transportKind: 'relay',
  url: 'wss://relay.example.com/ws',
  index: 1,
})).toBe('Relay (relay.example.com)');
```

Run `npm run mobile:test -- --runInBand apps/mobile/src/services/gateway-backends.test.ts` before implementation and confirm the new WednesdayAI dispatch assertion fails until `selectByBackend` and call sites require/provide a `wednesdayai` branch.

## Change
- **File:** `apps/mobile/src/services/gateway-backends.ts`
- **Anchor:** every internal `selectByBackend` options object.
- **Before:** existing internal calls provide only `openclaw`, `hermes`, and sometimes `youmind`.
- **After:** add explicit `wednesdayai` entries:
```ts
// getGatewayThinkingLevels
wednesdayai: [...THINKING_LEVELS],
openclaw: [...THINKING_LEVELS],
hermes: [...HERMES_THINKING_LEVELS],

// resolveGlobalMainSessionKey
wednesdayai: null,
openclaw: null,
hermes: 'main',
youmind: 'main',
```

- **File:** `apps/mobile/src/services/gateway-backends.ts`
- **Anchor:** `selectByBackend` signature and branch selection.
- **Before:**
```ts
export function selectByBackend<T>(
  input: GatewayLike | GatewayBackendKind | null | undefined,
  options: { openclaw: T; hermes: T; youmind?: T },
): T {
  const kind = typeof input === 'string' && isGatewayBackendKind(input)
    ? input
    : resolveGatewayBackendKind(input as GatewayLike | null | undefined);
  if (kind === 'hermes') return options.hermes;
  if (kind === 'youmind') return options.youmind ?? options.openclaw;
  return options.openclaw;
}
```
- **After:**
```ts
export function selectByBackend<T>(
  input: GatewayLike | GatewayBackendKind | null | undefined,
  options: { wednesdayai: T; openclaw: T; hermes: T; youmind?: T },
): T {
  const kind = typeof input === 'string' && isGatewayBackendKind(input)
    ? input
    : resolveGatewayBackendKind(input as GatewayLike | null | undefined);
  if (kind === 'wednesdayai') return options.wednesdayai;
  if (kind === 'hermes') return options.hermes;
  if (kind === 'youmind') return options.youmind ?? options.openclaw;
  return options.openclaw;
}
```

- **File:** `apps/mobile/src/services/storage.ts`
- **Anchor:** `getDefaultSkillListSortMode`.
- **Before:** options contain `openclaw: 'name'` and `hermes: 'createdDesc'`.
- **After:** add `wednesdayai: 'name'` before `openclaw`.

- **File:** `apps/mobile/src/services/console-entry-descriptors.ts`
- **Anchor:** `docsDescription = selectByBackend`.
- **Before:** options contain OpenClaw and Hermes descriptions.
- **After:** add `wednesdayai: tConsole('Documentation')` before `openclaw`.

- **File:** `apps/mobile/src/services/gateway-doc-links.ts`
- **Anchor:** `GatewayDocumentationDescriptor` and `resolveGatewayDocumentationDescriptor`.
- **Before:** `source: 'openclaw' | 'hermes'`; options contain OpenClaw and Hermes only.
- **After:** change the source type to `'wednesdayai' | 'openclaw' | 'hermes'` and add:
```ts
wednesdayai: {
  url: publicAppLinks.docsUrl,
  source: 'wednesdayai',
},
```

- **File:** `apps/mobile/src/screens/OfficeScreen/OfficeTab.tsx`
- **Anchor:** `resolveOfficeInteractionConfig`.
- **Before:** options contain OpenClaw and Hermes only.
- **After:** add `wednesdayai` with the same values as the OpenClaw-compatible branch.

- **File:** `apps/mobile/src/screens/ChatScreen/hooks/chatSyncPolicy.ts`
- **Anchor:** `awaitingSessionStatus`.
- **Before:** options contain `openclaw: 'connecting_gateway'` and `hermes: 'starting_hermes'`.
- **After:** add `wednesdayai: 'connecting_gateway'` before `openclaw`.

- **File:** `apps/mobile/src/screens/ConsoleScreen/HermesAwareCronScreens.tsx`
- **Anchor:** the four `selectByBackend(gateway.getBackendKind(), ...)` calls.
- **Before:** each call contains OpenClaw and Hermes components only.
- **After:** add a `wednesdayai` branch matching the OpenClaw component in each call:
```ts
wednesdayai: OpenClawCronListScreen,
wednesdayai: OpenClawCronDetailScreen,
wednesdayai: OpenClawCronEditorScreen,
wednesdayai: OpenClawCronWizardScreen,
```
Also update the file comment so it says WednesdayAI and OpenClaw use the OpenClaw-compatible cron route in this first slice instead of saying every non-Hermes backend implicitly uses OpenClaw.

- **File:** `apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx`
- **Anchor:** `return selectByBackend(config, { ... })`.
- **Before:** options contain OpenClaw and Hermes elements only.
- **After:** add a `wednesdayai` branch matching the OpenClaw-compatible `ModelsView` element.

- **File:** `apps/mobile/src/screens/ConsoleScreen/ConsoleMenuScreen.tsx`
- **Anchor:** `ConsoleMenuScreen` dispatcher.
- **Before:** options contain OpenClaw, Hermes, and YouMind components.
- **After:** add `wednesdayai: OpenClawConsoleMenuScreen` and update the adjacent comment to say the first slice routes WednesdayAI through the OpenClaw-compatible menu explicitly.

- **File:** `apps/mobile/src/services/gateway-backends.test.ts`
- **Anchor:** import block plus existing `selectByBackend`, `resolveGlobalMainSessionKey`, `getGatewayModeLabel`, and `buildGatewayDefaultName` coverage.
- **Before:** tests cover OpenClaw and Hermes only.
- **After:** add `buildGatewayDefaultName` to the import list, then add explicit tests for WednesdayAI branch selection, WednesdayAI global-main-session behaviour, WednesdayAI transport labels, and WednesdayAI default-name behaviour as listed in `## Failing test`.

## Allowed moves
- Only add explicit WednesdayAI branches to existing backend dispatch helpers/call sites.
- Use OpenClaw-compatible values for WednesdayAI only where the first-slice descriptor intentionally inherits the OpenClaw-compatible baseline.
- Do not add `wednesdayai` to `GatewayTransportKind`, `GatewayMode`, relay detection, or connection-route logic.
- Do not add new user-facing translation keys in this task; use existing keys such as `Documentation` where text is user-visible.
- Do not change gateway protocol, storage migrations, native IDs, package metadata, or external repositories.

## STOP triggers
- A call site cannot provide a deliberate WednesdayAI branch without new product decisions.
- A change would require a new locale key or screen-level `backendKind === 'wednesdayai'` branch.
- TypeScript requires editing files outside the listed dispatch call sites.
- `isGatewayTransportKind('wednesdayai')` would need to become true.

## Done when
`WAI_TYPECHECK_CMD="npm run mobile:typecheck" WAI_TEST_CMD="npm run mobile:test -- --runInBand {scope}" bash ~/.claude/wai/scripts/task-gate.sh wednesdayai-mobile-brand-conversion-implementation 004` exits 0.
