---
id: "003"
phase: 3
title: Add minimal WednesdayAI backend descriptor
status: ready
depends_on: ["002"]
parallel: false
conflicts_with: []
files:
  - apps/mobile/src/types/index.ts
  - apps/mobile/src/services/gateway-backends.ts
  - apps/mobile/src/services/gateway-backends.test.ts
irreversible: false
scope_test: "apps/mobile/src/services/gateway-backends.test.ts"
allowed_change: edit
covers_criteria: [SC6, SC7, SC8]
---
## Failing test (write first)
In `apps/mobile/src/services/gateway-backends.test.ts`, update the focused backend tests before implementation:

```ts
expect(resolveGatewayBackendKind({ backendKind: 'wednesdayai' } as any)).toBe('wednesdayai');
expect(selectByBackend('wednesdayai', { wednesdayai: 'W', openclaw: 'A', hermes: 'B' })).toBe('W');
expect(selectByBackend('wednesdayai', { openclaw: 'A', hermes: 'B' })).toBe('A');
expect(getGatewayBackendDescriptor('wednesdayai').kind).toBe('wednesdayai');
expect(getGatewayBackendDescriptor('wednesdayai').label).toBe('WednesdayAI');
expect(isGatewayBackendKind('wednesdayai')).toBe(true);
expect(isGatewayTransportKind('wednesdayai')).toBe(false);
```

Run `npm run mobile:test -- --runInBand apps/mobile/src/services/gateway-backends.test.ts` and confirm it fails before implementation because `wednesdayai` is not yet a backend kind.

## Change
- **File:** `apps/mobile/src/types/index.ts`
- **Anchor:** `GatewayBackendKind` type.
- **Before:**
```ts
export type GatewayBackendKind = 'openclaw' | 'hermes' | 'youmind';
```
- **After:**
```ts
export type GatewayBackendKind = 'wednesdayai' | 'openclaw' | 'hermes' | 'youmind';
```

- **File:** `apps/mobile/src/services/gateway-backends.ts`
- **Anchor:** immediately after `OPENCLAW_CAPABILITIES`.
- **Before:**
```ts
const HERMES_CAPABILITIES: GatewayBackendCapabilities = {
```
- **After:**
```ts
const WEDNESDAYAI_CAPABILITIES: GatewayBackendCapabilities = {
  ...OPENCLAW_CAPABILITIES,
};

const HERMES_CAPABILITIES: GatewayBackendCapabilities = {
```

- **File:** `apps/mobile/src/services/gateway-backends.ts`
- **Anchor:** `BACKENDS` object.
- **Before:**
```ts
const BACKENDS: Record<GatewayBackendKind, GatewayBackendDescriptor> = {
  openclaw: {
    kind: 'openclaw',
    label: 'OpenClaw',
    capabilities: OPENCLAW_CAPABILITIES,
  },
```
- **After:**
```ts
const BACKENDS: Record<GatewayBackendKind, GatewayBackendDescriptor> = {
  wednesdayai: {
    kind: 'wednesdayai',
    label: 'WednesdayAI',
    capabilities: WEDNESDAYAI_CAPABILITIES,
  },
  openclaw: {
    kind: 'openclaw',
    label: 'OpenClaw',
    capabilities: OPENCLAW_CAPABILITIES,
  },
```

- **File:** `apps/mobile/src/services/gateway-backends.ts`
- **Anchor:** `isGatewayBackendKind`.
- **Before:**
```ts
export function isGatewayBackendKind(value: unknown): value is GatewayBackendKind {
  return value === 'openclaw' || value === 'hermes' || value === 'youmind';
}
```
- **After:**
```ts
export function isGatewayBackendKind(value: unknown): value is GatewayBackendKind {
  return value === 'wednesdayai' || value === 'openclaw' || value === 'hermes' || value === 'youmind';
}
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
  options: { wednesdayai?: T; openclaw: T; hermes: T; youmind?: T },
): T {
  const kind = typeof input === 'string' && isGatewayBackendKind(input)
    ? input
    : resolveGatewayBackendKind(input as GatewayLike | null | undefined);
  if (kind === 'wednesdayai') return options.wednesdayai ?? options.openclaw;
  if (kind === 'hermes') return options.hermes;
  if (kind === 'youmind') return options.youmind ?? options.openclaw;
  return options.openclaw;
}
```

- **File:** `apps/mobile/src/services/gateway-backends.test.ts`
- **Anchor:** `honors explicit backendKind field when set`.
- **Before:**
```ts
    it('honors explicit backendKind field when set', () => {
      expect(resolveGatewayBackendKind({ backendKind: 'hermes' } as any)).toBe('hermes');
      expect(resolveGatewayBackendKind({ backendKind: 'openclaw' } as any)).toBe('openclaw');
    });
```
- **After:**
```ts
    it('honors explicit backendKind field when set', () => {
      expect(resolveGatewayBackendKind({ backendKind: 'wednesdayai' } as any)).toBe('wednesdayai');
      expect(resolveGatewayBackendKind({ backendKind: 'hermes' } as any)).toBe('hermes');
      expect(resolveGatewayBackendKind({ backendKind: 'openclaw' } as any)).toBe('openclaw');
    });
```

- **File:** `apps/mobile/src/services/gateway-backends.test.ts`
- **Anchor:** `selectByBackend` describe block, after the Hermes config test.
- **Before:**
```ts
    it('returns the hermes branch for hermes config', () => {
      expect(selectByBackend({ backendKind: 'hermes' } as any, { openclaw: 'A', hermes: 'B' })).toBe('B');
    });

    it('accepts a bare backend kind string', () => {
```
- **After:**
```ts
    it('returns the hermes branch for hermes config', () => {
      expect(selectByBackend({ backendKind: 'hermes' } as any, { openclaw: 'A', hermes: 'B' })).toBe('B');
    });

    it('returns the explicit WednesdayAI branch when provided', () => {
      expect(selectByBackend('wednesdayai', { wednesdayai: 'W', openclaw: 'A', hermes: 'B' })).toBe('W');
    });

    it('falls back to the OpenClaw-compatible branch for WednesdayAI until callers opt in', () => {
      expect(selectByBackend('wednesdayai', { openclaw: 'A', hermes: 'B' })).toBe('A');
    });

    it('accepts a bare backend kind string', () => {
```

- **File:** `apps/mobile/src/services/gateway-backends.test.ts`
- **Anchor:** `getGatewayBackendCapabilities` describe block, after the OpenClaw non-regression guard.
- **Before:** the OpenClaw capability test ends with:
```ts
      expect(caps.openClawConfigScreens).toBe(true);
    });

    it('disables console-cron-create for Hermes phase 1 while leaving consoleCron enabled for viewing', () => {
```
- **After:**
```ts
      expect(caps.openClawConfigScreens).toBe(true);
    });

    it('gives WednesdayAI the OpenClaw-compatible baseline for the first descriptor slice', () => {
      const caps = getGatewayBackendCapabilities('wednesdayai');
      expect(caps.consoleCron).toBe(true);
      expect(caps.consoleCronCreate).toBe(true);
      expect(caps.consoleChannels).toBe(true);
      expect(caps.consoleNodes).toBe(true);
      expect(caps.consoleTools).toBe(true);
      expect(caps.consoleAgentDetail).toBe(true);
      expect(caps.consoleAgentSessionsBoard).toBe(true);
      expect(caps.consoleHeartbeat).toBe(true);
      expect(caps.consoleDiscover).toBe(true);
      expect(caps.consoleClawHub).toBe(true);
      expect(caps.modelSelection).toBe(true);
      expect(caps.configRead).toBe(true);
      expect(caps.configWrite).toBe(true);
      expect(caps.openClawConfigScreens).toBe(true);
    });

    it('disables console-cron-create for Hermes phase 1 while leaving consoleCron enabled for viewing', () => {
```

- **File:** `apps/mobile/src/services/gateway-backends.test.ts`
- **Anchor:** `returns the matching descriptor for a string kind`.
- **Before:**
```ts
    it('returns the matching descriptor for a string kind', () => {
      expect(getGatewayBackendDescriptor('hermes').kind).toBe('hermes');
      expect(getGatewayBackendDescriptor('openclaw').kind).toBe('openclaw');
    });
```
- **After:**
```ts
    it('returns the matching descriptor for a string kind', () => {
      expect(getGatewayBackendDescriptor('wednesdayai').kind).toBe('wednesdayai');
      expect(getGatewayBackendDescriptor('wednesdayai').label).toBe('WednesdayAI');
      expect(getGatewayBackendDescriptor('hermes').kind).toBe('hermes');
      expect(getGatewayBackendDescriptor('openclaw').kind).toBe('openclaw');
    });
```

- **File:** `apps/mobile/src/services/gateway-backends.test.ts`
- **Anchor:** backend type guard test.
- **Before:**
```ts
    it('isGatewayBackendKind accepts only the two known backends', () => {
      expect(isGatewayBackendKind('openclaw')).toBe(true);
      expect(isGatewayBackendKind('hermes')).toBe(true);
      expect(isGatewayBackendKind('other')).toBe(false);
      expect(isGatewayBackendKind(undefined)).toBe(false);
    });
```
- **After:**
```ts
    it('isGatewayBackendKind accepts each known backend identity', () => {
      expect(isGatewayBackendKind('wednesdayai')).toBe(true);
      expect(isGatewayBackendKind('openclaw')).toBe(true);
      expect(isGatewayBackendKind('hermes')).toBe(true);
      expect(isGatewayBackendKind('youmind')).toBe(true);
      expect(isGatewayBackendKind('other')).toBe(false);
      expect(isGatewayBackendKind(undefined)).toBe(false);
    });
```

- **File:** `apps/mobile/src/services/gateway-backends.test.ts`
- **Anchor:** transport type guard test.
- **Before:**
```ts
      expect(isGatewayTransportKind('hermes')).toBe(false);
      expect(isGatewayTransportKind('unknown')).toBe(false);
```
- **After:**
```ts
      expect(isGatewayTransportKind('wednesdayai')).toBe(false);
      expect(isGatewayTransportKind('hermes')).toBe(false);
      expect(isGatewayTransportKind('unknown')).toBe(false);
```

## Allowed moves
- Write the failing test assertions first, then make the minimal type/registry/helper changes above.
- Keep `GatewayTransportKind` and `GatewayMode` text unchanged.
- Keep OpenClaw, Hermes, and YouMind descriptor entries present.
- Do not change saved-config defaulting, relay transport detection, gateway protocol, UI screens, storage migrations, or external repositories.

## STOP triggers
- Adding `wednesdayai` to `GatewayTransportKind`, `GatewayMode`, relay detection, or connection-route logic would be required.
- Any existing OpenClaw, Hermes, or YouMind compatibility test fails and the fix would require behaviour beyond this descriptor slice.
- The implementation would require screen-level `backendKind === 'wednesdayai'` conditionals.
- TypeScript requires editing files outside the three listed files.

## Done when
`WAI_TYPECHECK_CMD="npm run mobile:typecheck" WAI_TEST_CMD="npm run mobile:test -- --runInBand {scope}" bash ~/.claude/wai/scripts/task-gate.sh wednesdayai-mobile-brand-conversion-implementation 003` exits 0.
