---
id: "003"
phase: 3
title: Add minimal WednesdayAI backend descriptor
status: passed
depends_on: ["002"]
parallel: false
conflicts_with: []
files:
  - apps/mobile/src/types/index.ts
  - apps/mobile/src/services/gateway-backends.ts
  - apps/mobile/src/services/gateway-backends.test.ts
  - apps/mobile/src/bootstrap/useAppBootstrap.ts
  - apps/mobile/src/screens/ConfigScreen/ConfigScreenLayout.tsx
  - apps/mobile/src/i18n/locales/en/config.json
  - apps/mobile/src/i18n/locales/zh-Hans/config.json
  - apps/mobile/src/i18n/locales/ja/config.json
  - apps/mobile/src/i18n/locales/ko/config.json
  - apps/mobile/src/i18n/locales/de/config.json
  - apps/mobile/src/i18n/locales/es/config.json
irreversible: false
scope_test: "apps/mobile/src/services/gateway-backends.test.ts"
allowed_change: edit
covers_criteria: [SC4, SC6, SC8]
---
## Failing test (write first)
In `apps/mobile/src/services/gateway-backends.test.ts`, update the focused backend tests before implementation:

```ts
expect(resolveGatewayBackendKind({ backendKind: 'wednesdayai' } as any)).toBe('wednesdayai');
expect(getGatewayBackendDescriptor('wednesdayai').kind).toBe('wednesdayai');
expect(getGatewayBackendDescriptor('wednesdayai').label).toBe('WednesdayAI');
expect(isGatewayBackendKind('wednesdayai')).toBe(true);
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
Record in the decisions ledger that this is the first-slice OpenClaw-compatible baseline from `docs/architecture/wednesdayai-backend-descriptor-plan.md`; later capability differences require evidence-backed follow-up tasks.

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

- **File:** `apps/mobile/src/bootstrap/useAppBootstrap.ts`
- **Anchor:** imports from `../types`.
- **Before:**
```ts
import { AccentColorId, ChatAppearanceSettings, GatewayConfig, SpeechRecognitionLanguage, ThemeMode } from '../types';
```
- **After:**
```ts
import { AccentColorId, ChatAppearanceSettings, GatewayBackendKind, GatewayConfig, SpeechRecognitionLanguage, ThemeMode } from '../types';
```

- **File:** `apps/mobile/src/bootstrap/useAppBootstrap.ts`
- **Anchor:** `buildAgentPreview` parameter type.
- **Before:**
```ts
  backendKind: 'openclaw' | 'hermes' | 'youmind',
```
- **After:**
```ts
  backendKind: GatewayBackendKind,
```

- **File:** `apps/mobile/src/screens/ConfigScreen/ConfigScreenLayout.tsx`
- **Anchor:** `getBackendLabels`.
- **Before:**
```ts
function getBackendLabels(t: (key: string) => string): Record<GatewayBackendKind, string> {
  return {
    openclaw: t('OpenClaw'),
    hermes: t('Hermes'),
    youmind: t('YouMind'),
  };
}
```
- **After:**
```ts
function getBackendLabels(t: (key: string) => string): Record<GatewayBackendKind, string> {
  return {
    wednesdayai: t('WednesdayAI'),
    openclaw: t('OpenClaw'),
    hermes: t('Hermes'),
    youmind: t('YouMind'),
  };
}
```

- **File:** `apps/mobile/src/i18n/locales/en/config.json`
- **Anchor:** near the existing `"OpenClaw": "OpenClaw",` entry.
- **Before:**
```json
  "OpenClaw": "OpenClaw",
```
- **After:**
```json
  "WednesdayAI": "WednesdayAI",
  "OpenClaw": "OpenClaw",
```

- **File:** `apps/mobile/src/i18n/locales/zh-Hans/config.json`
- **Anchor:** near the existing `"OpenClaw": "OpenClaw",` entry.
- **Before:**
```json
  "OpenClaw": "OpenClaw",
```
- **After:**
```json
  "WednesdayAI": "WednesdayAI",
  "OpenClaw": "OpenClaw",
```

- **File:** `apps/mobile/src/i18n/locales/ja/config.json`
- **Anchor:** near the existing `"OpenClaw": "OpenClaw",` entry.
- **Before:**
```json
  "OpenClaw": "OpenClaw",
```
- **After:**
```json
  "WednesdayAI": "WednesdayAI",
  "OpenClaw": "OpenClaw",
```

- **File:** `apps/mobile/src/i18n/locales/ko/config.json`
- **Anchor:** near the existing `"OpenClaw": "OpenClaw",` entry.
- **Before:**
```json
  "OpenClaw": "OpenClaw",
```
- **After:**
```json
  "WednesdayAI": "WednesdayAI",
  "OpenClaw": "OpenClaw",
```

- **File:** `apps/mobile/src/i18n/locales/de/config.json`
- **Anchor:** near the existing `"OpenClaw": "OpenClaw",` entry.
- **Before:**
```json
  "OpenClaw": "OpenClaw",
```
- **After:**
```json
  "WednesdayAI": "WednesdayAI",
  "OpenClaw": "OpenClaw",
```

- **File:** `apps/mobile/src/i18n/locales/es/config.json`
- **Anchor:** near the existing `"OpenClaw": "OpenClaw",` entry.
- **Before:**
```json
  "OpenClaw": "OpenClaw",
```
- **After:**
```json
  "WednesdayAI": "WednesdayAI",
  "OpenClaw": "OpenClaw",
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

    it('gives WednesdayAI the evidence-backed OpenClaw-compatible baseline for the first descriptor slice', () => {
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
- Keep `GatewayTransportKind`, `GatewayMode`, saved-config defaulting, and relay transport detection unchanged.
- Keep OpenClaw, Hermes, and YouMind descriptor entries present.
- Add only the six `WednesdayAI` config locale entries required by `getBackendLabels`.
- Do not change `selectByBackend` in this task; task 004 owns explicit dispatch call-site migration.
- Do not change gateway protocol, storage migrations, connection routes, or external repositories.

## STOP triggers
- Adding `wednesdayai` to `GatewayTransportKind`, `GatewayMode`, relay detection, or connection-route logic would be required.
- Any existing OpenClaw, Hermes, or YouMind compatibility test fails and the fix would require behaviour beyond this descriptor slice.
- The implementation would require screen-level `backendKind === 'wednesdayai'` conditionals.
- TypeScript requires editing files outside the listed files.

## Done when
`WAI_TYPECHECK_CMD="npm run mobile:typecheck" WAI_TEST_CMD="npm run mobile:test -- --runInBand {scope}" bash ~/.claude/wai/scripts/task-gate.sh wednesdayai-mobile-brand-conversion-implementation 003` exits 0.
