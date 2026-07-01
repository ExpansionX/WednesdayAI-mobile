# T5 Adversarial Review — Round 2: OpenCode Remediation Proposals

Panelist: OpenCode
Scope: findings O1, O3, O4, O10
Read-only research; no source files were modified. All proposals below are
before/after patches ready for an executor to apply.

---

## Finding O1 — `useGatewayRuntimeSettings` over-eager for YouMind

**Location:** `apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx:24-54`

### Analysis

`useGatewayRuntimeSettings` is called unconditionally in `ModelsScreen` and the
screen computes `modelConfig` via `useMemo` for every backend. For YouMind the
rendered body is a static `<EmptyState>` (line 117-122) and none of
`modelConfig`'s fields are consumed.

Tracing the actual cost for YouMind:

- `getGatewayBackendCapabilities('youmind')` returns `YOUMIND_CAPABILITIES`
  (`apps/mobile/src/services/gateway-backends.ts:109-135`) where
  `configRead: false`, `configWrite: false`, `modelCatalog: false`,
  `modelSelection: false`.
- Inside the hook, `loadGatewaySettings` either short-circuits via the
  `!hasActiveGateway` branch (`useGatewayRuntimeSettings.ts:70-86`) or, when a
  gateway is active, calls `loadGatewayRuntimeSettingsBundle` with
  `canReadConfig=false` and `canListModels=false`
  (`useGatewayRuntimeSettings.ts:89-92`).
- `loadGatewayRuntimeSettingsBundle` then takes its early return
  (`gateway-runtime-settings.ts:37-46`) without calling `getConfig()` or
  `listModels()`. **No network I/O occurs.**

So the capability gating is sufficient from a correctness standpoint: the hook
does no real work for YouMind. The remaining cost is purely local: ~15
`useState` allocations, one `useEffect` that runs an async no-op, one
`useMemo` whose output is never read, and a `useGatewayPatch` call. None of
this is observable to the user.

### Fix approach

React's rules of hooks forbid conditionally calling `useGatewayRuntimeSettings`
inside `ModelsScreen`. Calling the hook unconditionally but skipping it for
YouMind requires splitting the screen so the early return happens in a
**parent** component that calls no hooks beyond a single `useAppContext()`,
with the heavy hook moved into a child component that always runs.

The minimal, hooks-safe change is:

1. Keep `ModelsScreen` as a thin dispatcher. It reads `config` from
   `useAppContext()` (one hook, always called) and resolves the backend kind
   via the pure helper `resolveGatewayBackendKind`.
2. If the backend is YouMind, render a new `YouMindModelsScreen` that only
   renders the `<EmptyState>` and the native-stack modal header — no
   `useGatewayRuntimeSettings`, no `modelConfig` memo.
3. Otherwise render `ModelsScreenInner`, which is the current body of
   `ModelsScreen` (all the hooks, memo, `selectByBackend` for
   `wednesdayai`/`openclaw`/`hermes`).

This preserves the existing `selectByBackend` capability-driven dispatch for
the three real-model backends and removes the wasted hook work for YouMind
without violating the rules of hooks.

### Before

```tsx
// apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx
export function ModelsScreen(): React.JSX.Element {
  const { gateway, gatewayEpoch, config } = useAppContext();
  const { t } = useTranslation('console');
  const navigation = useNavigation<ModelsNavigation>();
  const hasActiveGateway = Boolean(config?.url);

  const settings = useGatewayRuntimeSettings({
    gateway,
    gatewayEpoch,
    hasActiveGateway,
  });

  const modelConfig = useMemo(() => ({
    defaultModel: settings.defaultModel,
    setDefaultModel: settings.setDefaultModel,
    fallbackModels: settings.fallbackModels,
    setFallbackModels: settings.setFallbackModels,
    thinkingDefault: settings.thinkingDefault,
    setThinkingDefault: settings.setThinkingDefault,
    availableModels: settings.availableModels,
    loadingSettings: settings.loadingGatewaySettings,
    savingSettings: settings.savingGatewaySettings,
    settingsError: settings.gatewaySettingsError,
    hasActiveGateway,
    supportsRuntimeSettings: settings.supportsRuntimeSettings,
    supportsModelSelection: settings.supportsModelSelection,
    onLoadSettings: settings.loadGatewaySettings,
    onSaveSettings: async () => {
      if (!settings.supportsModelSelection) return;
      analyticsEvents.modelsSaveTapped({
        fallback_count: settings.fallbackModels.length,
        has_primary_model: Boolean(settings.defaultModel),
        has_thinking_default: Boolean(settings.thinkingDefault),
      });
      await settings.saveGatewaySettings();
    },
  }), [settings, hasActiveGateway]);

  const headerRight = useMemo(/* ... */, [/* ... */]);

  useNativeStackModalHeader({
    navigation,
    title: t('Models'),
    rightContent: settings.supportsRuntimeSettings ? headerRight : null,
    onClose: () => navigation.goBack(),
  });

  return selectByBackend(config, {
    wednesdayai: (<ModelsView ... modelConfig={modelConfig} ... />),
    openclaw:    (<ModelsView ... modelConfig={modelConfig} ... />),
    hermes:      (<HermesModelSelectionView ... />),
    youmind: (
      <EmptyState
        title={t('No models available')}
        subtitle={t('Model selection is not available for this backend.')}
      />
    ),
  });
}
```

### After

```tsx
// apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx
import { useAppContext } from '../../contexts/AppContext';
import { resolveGatewayBackendKind } from '../../services/gateway-backends';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EmptyState } from '../../components/ui';
import { useNativeStackModalHeader } from '../../hooks/useNativeStackModalHeader';
import type { ConsoleStackParamList } from './ConsoleTab';
import { ModelsScreenInner } from './ModelsScreenInner';
import { YouMindModelsScreen } from './YouMindModelsScreen';

type ModelsNavigation = NativeStackNavigationProp<ConsoleStackParamList, 'ModelList'>;

export function ModelsScreen(): React.JSX.Element {
  const { config } = useAppContext();
  const backendKind = resolveGatewayBackendKind(config);

  // Hooks-safe early dispatch: only one hook (useAppContext) has run so far,
  // and it always runs regardless of backend, so the rules of hooks are
  // preserved. Each sub-screen owns its own hook surface.
  if (backendKind === 'youmind') {
    return <YouMindModelsScreen />;
  }
  return <ModelsScreenInner />;
}

// New file: apps/mobile/src/screens/ConsoleScreen/YouMindModelsScreen.tsx
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EmptyState } from '../../components/ui';
import { useNativeStackModalHeader } from '../../hooks/useNativeStackModalHeader';
import type { ConsoleStackParamList } from './ConsoleTab';

type ModelsNavigation = NativeStackNavigationProp<ConsoleStackParamList, 'ModelList'>;

export function YouMindModelsScreen(): React.JSX.Element {
  const { t } = useTranslation('console');
  const navigation = useNavigation<ModelsNavigation>();

  // YouMind has no runtime settings capability (YOUMIND_CAPABILITIES in
  // services/gateway-backends.ts gates configRead/configWrite/modelCatalog/
  // modelSelection all to false), so we deliberately do NOT call
  // useGatewayRuntimeSettings here. The screen is a static empty state.
  useNativeStackModalHeader({
    navigation,
    title: t('Models'),
    rightContent: null,
    onClose: () => navigation.goBack(),
  });

  return (
    <EmptyState
      title={t('No models available')}
      subtitle={t('Model selection is not available for this backend.')}
    />
  );
}

// New file (or same file, exported): apps/mobile/src/screens/ConsoleScreen/ModelsScreenInner.tsx
// Contains the previous body of ModelsScreen verbatim, minus the youmind branch
// in selectByBackend (the youmind option can stay or be removed; selectByBackend
// already falls back to openclaw when youmind is absent, but since we dispatch
// before reaching here, it is dead code either way — prefer removing it).
import React, { useMemo } from 'react';
import { RefreshCw } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { HeaderActionButton } from '../../components/ui';
import { HermesModelSelectionView } from '../../components/console/HermesModelSelectionView';
import { ModelsView } from '../../components/console/ModelsView';
import { useAppContext } from '../../contexts/AppContext';
import { useNativeStackModalHeader } from '../../hooks/useNativeStackModalHeader';
import { analyticsEvents } from '../../services/analytics/events';
import { selectByBackend } from '../../services/gateway-backends';
import { useGatewayRuntimeSettings } from '../ConfigScreen/hooks/useGatewayRuntimeSettings';
import type { ConsoleStackParamList } from './ConsoleTab';

type ModelsNavigation = NativeStackNavigationProp<ConsoleStackParamList, 'ModelList'>;

export function ModelsScreenInner(): React.JSX.Element {
  const { gateway, gatewayEpoch, config } = useAppContext();
  const { t } = useTranslation('console');
  const navigation = useNavigation<ModelsNavigation>();
  const hasActiveGateway = Boolean(config?.url);

  const settings = useGatewayRuntimeSettings({
    gateway,
    gatewayEpoch,
    hasActiveGateway,
  });

  const modelConfig = useMemo(() => ({
    defaultModel: settings.defaultModel,
    setDefaultModel: settings.setDefaultModel,
    fallbackModels: settings.fallbackModels,
    setFallbackModels: settings.setFallbackModels,
    thinkingDefault: settings.thinkingDefault,
    setThinkingDefault: settings.setThinkingDefault,
    availableModels: settings.availableModels,
    loadingSettings: settings.loadingGatewaySettings,
    savingSettings: settings.savingGatewaySettings,
    settingsError: settings.gatewaySettingsError,
    hasActiveGateway,
    supportsRuntimeSettings: settings.supportsRuntimeSettings,
    supportsModelSelection: settings.supportsModelSelection,
    onLoadSettings: settings.loadGatewaySettings,
    onSaveSettings: async () => {
      if (!settings.supportsModelSelection) return;
      analyticsEvents.modelsSaveTapped({
        fallback_count: settings.fallbackModels.length,
        has_primary_model: Boolean(settings.defaultModel),
        has_thinking_default: Boolean(settings.thinkingDefault),
      });
      await settings.saveGatewaySettings();
    },
  }), [settings, hasActiveGateway]);

  const headerRight = useMemo(
    () => (
      <HeaderActionButton
        icon={RefreshCw}
        onPress={() => { void settings.loadGatewaySettings(); }}
        disabled={settings.loadingGatewaySettings || settings.savingGatewaySettings || !settings.supportsRuntimeSettings}
      />
    ),
    [
      settings.loadGatewaySettings,
      settings.loadingGatewaySettings,
      settings.savingGatewaySettings,
      settings.supportsRuntimeSettings,
    ],
  );

  useNativeStackModalHeader({
    navigation,
    title: t('Models'),
    rightContent: settings.supportsRuntimeSettings ? headerRight : null,
    onClose: () => navigation.goBack(),
  });

  return selectByBackend(config, {
    wednesdayai: (
      <ModelsView
        gateway={gateway}
        topInset={0}
        onBack={() => navigation.goBack()}
        modelConfig={modelConfig}
        hideHeader
      />
    ),
    openclaw: (
      <ModelsView
        gateway={gateway}
        topInset={0}
        onBack={() => navigation.goBack()}
        modelConfig={modelConfig}
        hideHeader
      />
    ),
    hermes: (
      <HermesModelSelectionView
        gateway={gateway}
        topInset={0}
        onBack={() => navigation.goBack()}
        hideHeader
      />
    ),
  });
}
```

### Correctness and safety

- **Rules of hooks preserved.** `ModelsScreen` calls exactly one hook
  (`useAppContext`) and always returns after it. The early return for YouMind
  is to a *different* component, so the hook count inside `ModelsScreen` itself
  is constant across renders.
- **Behavior unchanged for the three real backends.** `ModelsScreenInner` is
  byte-for-byte the previous body of `ModelsScreen` minus the now-dead youmind
  branch of `selectByBackend`. `selectByBackend` already falls back to the
  `openclaw` branch when `youmind` is omitted, so removing the explicit youmind
  option cannot change routing.
- **YouMind screen preserved.** `YouMindModelsScreen` renders the same
  `<EmptyState>` with the same title/subtitle and the same modal header
  (title `t('Models')`, no right action, `onClose` = `navigation.goBack()`).
  The refresh button was already hidden for YouMind because
  `settings.supportsRuntimeSettings` was `false`, so `rightContent` was
  already `null` — we simply encode that directly.
- **No capability regression.** The hook's capability gating already prevented
  network I/O for YouMind, so this change only removes wasted local state and
  memoization. No new code path can reach `getConfig()` or `listModels()` for
  YouMind.

---

## Finding O3 — `deriveBaseUrl` catch comment accuracy

**Location:** `apps/mobile/src/services/gateway-backend-operations.ts:295-299`

### Analysis

The current comment references a "nested `new URL()` guard" and "both branches"
that no longer exist in the simplified code. The try body now performs a single
`new URL()` after the `ws(s?)://` → `http$1://` scheme swap, then strips
`hash`, `search`, and the matched portion of `pathname`. The catch is
unconditional: if `new URL()` throws, there is no second chance to recover.

The conclusion ("This path always returns null") is correct. The reasoning
must be rewritten to describe the current control flow: a URL that fails
`new URL()` after the scheme swap cannot be repaired by the subsequent
`hash`/`search`/`pathname` mutations, because those mutations only run on a
successfully constructed `URL` instance.

### Before

```typescript
  } catch {
    // Any URL malformed enough to fail new URL() in the try path also fails the nested
    // new URL() guard — the scheme swap is identical in both branches and stripping
    // query/hash/path cannot fix a bad host. This path always returns null.
    return null;
  }
```

### After

```typescript
  } catch {
    // new URL() is the only operation that can throw in the try block; the
    // scheme swap is a plain string replace and never fails. Once the URL
    // object is constructed, the subsequent hash/search/pathname mutations
    // run on a valid URL instance and cannot throw. So reaching this catch
    // means the input was too malformed to parse even after the ws→http
    // scheme rewrite, and there is nothing left to attempt — return null.
    return null;
  }
```

### Correctness and safety

- **Accurate to current code.** The new comment names the actual throwing
  operation (`new URL()`), notes the scheme swap cannot throw (it is a `String.replace`),
  and explains why the subsequent mutations are unreachable from the catch
  (they operate on a successfully constructed `URL`).
- **No reference to deleted structure.** Removes "nested `new URL()` guard"
  and "both branches", which described a prior two-branch implementation that
  has since been collapsed.
- **Preserves the actionable invariant.** "This path always returns null" is
  rephrased as "there is nothing left to attempt — return null", which carries
  the same intent for future readers without leaning on stale reasoning.

---

## Finding O4 — Retry test does not assert params on second call

**Location:** `apps/mobile/src/services/gateway.test.ts:2154-2177`

### Analysis

The existing test verifies that `client.request('config.get', {})` is retried
once after a `[BRIDGE_UNAVAILABLE]` error and ultimately resolves, asserting
`sendRequestSpy` was called twice. It does not assert *what* was passed on the
second call. A regression where the retry layer accidentally mutated the
params object (e.g. forwarding an error envelope, or reusing a stale params
reference) would not be caught.

`sendRequest` is spied as `sendRequest(method, params?)`, so
`toHaveBeenNthCalledWith(2, 'config.get', {})` pins both the method name and
the params on the second call.

### Before

```typescript
    it('retries newly-added config.get on [BRIDGE_UNAVAILABLE] for Hermes relay', async () => {
      client.configure({
        url: 'wss://example.com',
        token: 'abc',
        mode: 'hermes',
        backendKind: 'hermes',
        transportKind: 'relay',
      } as any);
      (client as any).activeRoute = 'relay';

      const sendRequestSpy = jest
        .spyOn(client as unknown as { sendRequest: (method: string, params?: object) => Promise<unknown> }, 'sendRequest')
        .mockRejectedValueOnce(new Error('[BRIDGE_UNAVAILABLE] Hermes bridge is temporarily unavailable. Please retry.'))
        .mockResolvedValue({ config: {}, hash: 'abc123' });

      const pending = client.request<{ config: object; hash: string }>('config.get', {});
      await flushPromises();
      expect(sendRequestSpy).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(750);
      await flushPromises();
      await expect(pending).resolves.toEqual({ config: {}, hash: 'abc123' });
      expect(sendRequestSpy).toHaveBeenCalledTimes(2);
    });
```

### After

```typescript
    it('retries newly-added config.get on [BRIDGE_UNAVAILABLE] for Hermes relay', async () => {
      client.configure({
        url: 'wss://example.com',
        token: 'abc',
        mode: 'hermes',
        backendKind: 'hermes',
        transportKind: 'relay',
      } as any);
      (client as any).activeRoute = 'relay';

      const sendRequestSpy = jest
        .spyOn(client as unknown as { sendRequest: (method: string, params?: object) => Promise<unknown> }, 'sendRequest')
        .mockRejectedValueOnce(new Error('[BRIDGE_UNAVAILABLE] Hermes bridge is temporarily unavailable. Please retry.'))
        .mockResolvedValue({ config: {}, hash: 'abc123' });

      const pending = client.request<{ config: object; hash: string }>('config.get', {});
      await flushPromises();
      expect(sendRequestSpy).toHaveBeenCalledTimes(1);
      expect(sendRequestSpy).toHaveBeenNthCalledWith(1, 'config.get', {});

      jest.advanceTimersByTime(750);
      await flushPromises();
      await expect(pending).resolves.toEqual({ config: {}, hash: 'abc123' });
      expect(sendRequestSpy).toHaveBeenCalledTimes(2);
      // Pin the retry re-sends the original method and params unchanged —
      // the retry layer must not mutate or drop the params object.
      expect(sendRequestSpy).toHaveBeenNthCalledWith(2, 'config.get', {});
    });
```

### Correctness and safety

- **Pins both calls.** Adding the first-call assertion
  (`toHaveBeenNthCalledWith(1, 'config.get', {})`) is a cheap belt-and-braces
  check that the initial dispatch is correct, which makes the second-call
  assertion meaningful as a *retry-params* guarantee rather than just a
  *call-count* guarantee.
- **Mirrors the production contract.** `sendRequestWithHermesBridgeRetry`
  (`gateway.ts:1385-1403`) calls `this.sendRequest(method, params)` on every
  attempt with the same `method` and `params` captured at entry. The new
  assertion verifies that contract from the outside.
- **No false positives.** `config.get` is called with `{}` and the retry must
  also pass `{}`; a deep-equal check on an empty object is unambiguous.
- **Pattern matches existing tests.** `sessions.list` test at
  `gateway.test.ts:2009` already uses `toHaveBeenCalledWith('sessions.list', { ... })`
  to pin params, so this is consistent with the file's conventions.

---

## Finding O10 — `config.get` second retry not tested

**Location:** `apps/mobile/src/services/gateway.test.ts:2154-2177`

### Analysis

Production retry budget for Hermes relay bridge-unavailable errors is
`HERMES_BRIDGE_UNAVAILABLE_RETRY_DELAYS_MS = [750, 750]`
(`gateway.ts:151`), i.e. up to two retries (three total attempts). The existing
`config.get` test only exercises one retry. The `sessions.list` test
(`gateway.test.ts:2016-2049`) already pins the full two-retry behavior for the
shared delay array; `config.get` was newly added to `HERMES_BRIDGE_RETRY_METHODS`
and should carry its own two-retry coverage so a future change to the retry
method set or delay array cannot silently drop `config.get`'s second retry.

The new test should:
1. Reject twice via `mockRejectedValueOnce` (two transient failures).
2. Then resolve on the third attempt.
3. Advance fake timers by `750` twice (once per delay entry).
4. Assert three `sendRequest` calls and the resolved value.

### Before

The existing one-retry test (Finding O4's target) is kept; this finding adds a
sibling test below it. No existing code is changed.

### After (new test, inserted immediately after the O4-augmented test)

```typescript
    it('retries config.get up to the full two-retry budget on [BRIDGE_UNAVAILABLE] for Hermes relay', async () => {
      client.configure({
        url: 'wss://example.com',
        token: 'abc',
        mode: 'hermes',
        backendKind: 'hermes',
        transportKind: 'relay',
      } as any);
      (client as any).activeRoute = 'relay';

      const sendRequestSpy = jest
        .spyOn(client as unknown as { sendRequest: (method: string, params?: object) => Promise<unknown> }, 'sendRequest')
        .mockRejectedValueOnce(new Error('[BRIDGE_UNAVAILABLE] Hermes bridge is temporarily unavailable. Please retry.'))
        .mockRejectedValueOnce(new Error('[BRIDGE_UNAVAILABLE] Hermes bridge is temporarily unavailable. Please retry.'))
        .mockResolvedValue({ config: { heartbeat: { every: '5m' } }, hash: 'def456' });

      const pending = client.request<{ config: object; hash: string }>('config.get', {});

      // First attempt fires synchronously after request() is called.
      await flushPromises();
      expect(sendRequestSpy).toHaveBeenCalledTimes(1);
      expect(sendRequestSpy).toHaveBeenNthCalledWith(1, 'config.get', {});

      // First retry after the first 750ms delay.
      jest.advanceTimersByTime(750);
      await flushPromises();
      expect(sendRequestSpy).toHaveBeenCalledTimes(2);
      expect(sendRequestSpy).toHaveBeenNthCalledWith(2, 'config.get', {});

      // Second retry after the second 750ms delay — third total attempt.
      jest.advanceTimersByTime(750);
      await flushPromises();
      await expect(pending).resolves.toEqual({ config: { heartbeat: { every: '5m' } }, hash: 'def456' });
      expect(sendRequestSpy).toHaveBeenCalledTimes(3);
      expect(sendRequestSpy).toHaveBeenNthCalledWith(3, 'config.get', {});
    });
```

### Correctness and safety

- **Matches the production delay array.** Two `mockRejectedValueOnce` calls
  followed by `mockResolvedValue` line up with the three iterations of the
  `for (let attempt = 0; attempt <= delays.length; attempt += 1)` loop in
  `sendRequestWithHermesBridgeRetry` (`gateway.ts:1390`) when `delays` is
  `[750, 750]`.
- **Two timer advances, not one.** Each `jest.advanceTimersByTime(750)`
  unblocks exactly one `sleep(delays[attempt])`. Advancing twice exercises
  both entries of `HERMES_BRIDGE_UNAVAILABLE_RETRY_DELAYS_MS`, which is the
  behavior the finding says is untested for `config.get`.
- **Asserts both retry counts and params.** Three `sendRequest` calls are
  asserted, and each is pinned with `toHaveBeenNthCalledWith(n, 'config.get', {})`
  so a regression that drops the second retry *or* mutates params is caught.
- **Resolves with a non-trivial payload.** Using
  `{ config: { heartbeat: { every: '5m' } }, hash: 'def456' }` (rather than
  the O4 test's `{ config: {}, hash: 'abc123' }`) ensures the assertion is
  not accidentally satisfied by the empty-config fallback.
- **No interference with the O4 test.** This is a separate `it(...)` block
  sharing the same `client` setup pattern; each test re-spy's `sendRequest`
  via `jest.spyOn`, and Jest auto-restores spies between tests, so the two
  tests are independent.
- **Mirrors the `sessions.list` two-retry test.** The structure (reject,
  reject, resolve; advance 750 twice; assert 3 calls) is identical to the
  existing `sessions.list` two-retry test at `gateway.test.ts:2016-2049`,
  keeping the file's retry-coverage conventions consistent.

---

## Summary

| Finding | Fix type | Risk |
|---------|----------|------|
| O1 | Split `ModelsScreen` into a hooks-safe dispatcher + `ModelsScreenInner` + `YouMindModelsScreen`; remove wasted `useGatewayRuntimeSettings`/`useMemo` work for YouMind | Low — pure refactor; behavior preserved for all four backends; rules of hooks respected |
| O3 | Rewrite the `deriveBaseUrl` catch comment to describe the current single-`new URL()` flow without referencing the deleted nested guard | None — comment-only change |
| O4 | Add `toHaveBeenNthCalledWith(1/2, 'config.get', {})` to the existing one-retry `config.get` test | None — test-only addition; no production code touched |
| O10 | Add a new two-retry `config.get` test mirroring the existing `sessions.list` two-retry test | None — test-only addition; no production code touched |

All four proposals are surgical, keep OpenClaw and Hermes paths non-regressing,
and respect the dual-backend compatibility rule from `AGENTS.md`.