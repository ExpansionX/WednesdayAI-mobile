# T5 Adversarial Review — Round 1: Issue Finding

You are a panelist in an adversarial code review tournament. Your task is to find real bugs and
quality issues in the diff described below. Read-only analysis only — do NOT run shell commands
or modify any files.

## What was changed (T3 + T4 remediation work)

Nine files changed:

### 1. `apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx`

- Added `EmptyState` to the import from `'../../components/ui'`
- In the `youmind` branch of `selectByBackend(...)`, replaced a `<ModelsView ...>` with:
  ```tsx
  <EmptyState
    title={t('No models available')}
    subtitle={t('Model selection is not available for this backend.')}
  />
  ```
  Previously the youmind branch rendered a full `ModelsView` with `gateway`, `topInset`,
  `onBack`, `modelConfig`, and `hideHeader` props.

### 2. `apps/mobile/src/services/gateway-backend-operations.ts`

- The `deriveBaseUrl` function (line 287) had its `catch` block replaced.
  
  **Before** (old catch body):
  ```typescript
  } catch {
    const stripped = urlText
      .replace(/^ws(s?):\/\//, 'http$1://')
      .split('?')[0]
      .split('#')[0]
      .replace(wsPathPattern, '')
      .replace(/\/+$/, '');
    if (!/^https?:\/\//.test(stripped)) return null;
    try {
      new URL(stripped);
      return stripped;
    } catch {
      return null;
    }
  }
  ```
  
  **After** (new catch body):
  ```typescript
  } catch {
    // Any URL malformed enough to fail new URL() in the try path also fails the nested
    // new URL() guard — the scheme swap is identical in both branches and stripping
    // query/hash/path cannot fix a bad host. This path always returns null.
    return null;
  }
  ```
  
  The `try` block (unchanged):
  ```typescript
  try {
    const url = new URL(urlText.replace(/^ws(s?):\/\//, 'http$1://'));
    url.hash = '';
    url.search = '';
    url.pathname = url.pathname.replace(wsPathPattern, '') || '/';
    return url.toString().replace(/\/+$/, '');
  } catch {
    return null; // new simplified body
  }
  ```

### 3. `apps/mobile/src/services/gateway.test.ts`

Three new test cases added inside the `'Hermes relay [BRIDGE_UNAVAILABLE] retry'` describe block:

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

it('does NOT retry agents.files.get on [BRIDGE_UNAVAILABLE] — read-modify-write exclusion', async () => {
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
    .mockRejectedValue(new Error('[BRIDGE_UNAVAILABLE] Hermes bridge is temporarily unavailable. Please retry.'));

  await expect(
    client.request('agents.files.get', { agentId: 'main', name: 'plan.md' }),
  ).rejects.toThrow('[BRIDGE_UNAVAILABLE]');
  expect(sendRequestSpy).toHaveBeenCalledTimes(1);
});

it('HERMES_BRIDGE_RETRY_METHODS ⊆ shouldTraceRequest: every retry method is also traced', () => {
  expect.hasAssertions();
  const retryMethods = (GatewayClient as unknown as { HERMES_BRIDGE_RETRY_METHODS: Set<string> }).HERMES_BRIDGE_RETRY_METHODS;
  expect(retryMethods.size).toBeGreaterThan(0);
  for (const method of retryMethods) {
    expect((client as any).shouldTraceRequest(method)).toBe(true);
  }
});
```

### 4. Six `console.json` locale files (en, de, es, ja, ko, zh-Hans)

Each had a new key appended:
- en:      `"Model selection is not available for this backend.": "Model selection is not available for this backend."`
- de:      `"Model selection is not available for this backend.": "Modellauswahl ist für dieses Backend nicht verfügbar."`
- es:      `"Model selection is not available for this backend.": "La selección de modelos no está disponible para este backend."`
- ja:      `"Model selection is not available for this backend.": "このバックエンドではモデル選択は利用できません。"`
- ko:      `"Model selection is not available for this backend.": "이 백엔드에서는 모델 선택을 사용할 수 없습니다."`
- zh-Hans: `"Model selection is not available for this backend.": "该后端不支持模型选择。"`

## Relevant production code

### `HERMES_BRIDGE_RETRY_METHODS` (gateway.ts:174-188)
```typescript
private static readonly HERMES_BRIDGE_RETRY_METHODS = new Set<string>([
  'sessions.list', 'chat.history', 'last-heartbeat', 'models.list',
  'model.current', 'model.get', 'agents.list', 'agent.identity.get',
  'sessions.usage', 'usage.cost', 'config.get', 'tools.catalog', 'agents.files.list',
]);
```

### `isHermesRelayBridgeRetryEligible` (gateway.ts:1405-1409)
```typescript
private isHermesRelayBridgeRetryEligible(method: string): boolean {
  return this.getBackendKind() === 'hermes'
    && this.activeRoute === 'relay'
    && GatewayClient.HERMES_BRIDGE_RETRY_METHODS.has(method);
}
```

### `HERMES_BRIDGE_UNAVAILABLE_RETRY_DELAYS_MS` (gateway.ts:151)
```typescript
private static readonly HERMES_BRIDGE_UNAVAILABLE_RETRY_DELAYS_MS = [750, 750];
```

### `EmptyState` component (apps/mobile/src/components/ui/EmptyState.tsx:6-12)
```typescript
interface EmptyStateProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}
```

### `selectByBackend` dispatch map keys
The map accepts keys: `wednesdayai | openclaw | hermes | youmind`

## Your task

Examine the diff carefully and report every real issue you find. For each issue:
1. State the file and line/location
2. State the nature of the bug or quality problem
3. Rate severity: critical | high | medium | low
4. Explain WHY it is an issue (not just what it is)

Focus on:
- Logic correctness (does the code do what it claims?)
- Test completeness/correctness (do the tests actually prove what they claim?)
- Comment accuracy (does the comment match the code?)
- i18n correctness
- Regression risk for OpenClaw / Hermes / YouMind backends
- Unused code / dead code introduced or left behind

DO NOT report issues you cannot prove from the code shown. Report in a markdown table followed by
brief prose justification for each finding.
