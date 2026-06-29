import { getGatewayBackendOperations } from './gateway-backend-operations';

describe('gateway-backend-operations', () => {
  describe('getGatewayBackendOperations — usesConnectHandshake', () => {
    it('returns usesConnectHandshake true for openclaw', () => {
      const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      expect(ops.usesConnectHandshake).toBe(true);
    });

    it('returns usesConnectHandshake false for hermes', () => {
      const ops = getGatewayBackendOperations({ backendKind: 'hermes' } as any);
      expect(ops.usesConnectHandshake).toBe(false);
    });

    it('returns usesConnectHandshake true for wednesdayai (OpenClaw-compatible baseline)', () => {
      const ops = getGatewayBackendOperations({ backendKind: 'wednesdayai' } as any);
      expect(ops.usesConnectHandshake).toBe(true);
    });

    it('returns usesConnectHandshake true for youmind (OpenClaw-compatible baseline)', () => {
      const ops = getGatewayBackendOperations({ backendKind: 'youmind' } as any);
      expect(ops.usesConnectHandshake).toBe(true);
    });

    it('returns usesConnectHandshake true for null config (openclaw default)', () => {
      const ops = getGatewayBackendOperations(null);
      expect(ops.usesConnectHandshake).toBe(true);
    });
  });

  describe('getGatewayBackendOperations — object identity and method sharing', () => {
    it('wednesdayai: separate container, shared method references (OpenClaw-compatible baseline)', () => {
      // WEDNESDAYAI_OPERATIONS = { ...OPENCLAW_OPERATIONS } — shallow spread.
      // Container is a distinct object; every method is the same function reference as OpenClaw's.
      // Pins BOTH invariants: container inequality detects accidental re-merge,
      // method equality detects accidental independent re-implementation.
      const wednesdayaiOps = getGatewayBackendOperations({ backendKind: 'wednesdayai' } as any);
      const openclawOps = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      expect(wednesdayaiOps).not.toBe(openclawOps);
      expect(wednesdayaiOps.getCurrentModelState).toBe(openclawOps.getCurrentModelState);
      expect(wednesdayaiOps.getBaseUrl).toBe(openclawOps.getBaseUrl);
    });

    it('youmind: separate container, shared method references (OpenClaw-compatible baseline)', () => {
      // YOUMIND_OPERATIONS = { ...OPENCLAW_OPERATIONS } — same pattern as WednesdayAI above.
      const youmindOps = getGatewayBackendOperations({ backendKind: 'youmind' } as any);
      const openclawOps = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      expect(youmindOps).not.toBe(openclawOps);
      expect(youmindOps.getCurrentModelState).toBe(openclawOps.getCurrentModelState);
      expect(youmindOps.getBaseUrl).toBe(openclawOps.getBaseUrl);
    });

    it('hermes: separate container AND divergent method references (genuine override)', () => {
      // Hermes overrides getCurrentModelState (model.current) and getBaseUrl (/v1/hermes/ws).
      // This test pins that divergence so an accidental removal of the Hermes override is caught.
      const hermesOps = getGatewayBackendOperations({ backendKind: 'hermes' } as any);
      const openclawOps = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      expect(hermesOps).not.toBe(openclawOps);
      expect(hermesOps.getCurrentModelState).not.toBe(openclawOps.getCurrentModelState);
      expect(hermesOps.getBaseUrl).not.toBe(openclawOps.getBaseUrl);
      // Pin WHICH getBaseUrl implementation won, not just that references differ.
      // wss://host/v1/hermes/ws is discriminative: Hermes strips /v1/hermes/ws → 'https://host';
      // OpenClaw strips only the trailing /ws → 'https://host/v1/hermes'.
      // A wrong Hermes override using OpenClaw's /ws pattern passes reference inequality but fails here.
      expect(hermesOps.getBaseUrl({ url: 'wss://host/v1/hermes/ws' } as any)).toBe('https://host');
      expect(openclawOps.getBaseUrl({ url: 'wss://host/v1/hermes/ws' } as any)).toBe('https://host/v1/hermes');
    });

    it('returns the same object reference for null config as explicit openclaw', () => {
      expect(getGatewayBackendOperations(null)).toBe(
        getGatewayBackendOperations({ backendKind: 'openclaw' } as any),
      );
    });
  });

  describe('getGatewayBackendOperations — getBaseUrl', () => {
    it('openclaw: strips the /ws path suffix from a WebSocket URL', () => {
      const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      expect(ops.getBaseUrl({ url: 'wss://example.com/ws' } as any)).toBe('https://example.com');
    });

    it('hermes: strips the /v1/hermes/ws path suffix from a WebSocket URL', () => {
      const ops = getGatewayBackendOperations({ backendKind: 'hermes' } as any);
      expect(ops.getBaseUrl({ url: 'wss://example.com/v1/hermes/ws' } as any)).toBe('https://example.com');
    });

    it('wednesdayai: strips only the /ws suffix (OpenClaw-compatible URL pattern, not Hermes)', () => {
      const wednesdayaiOps = getGatewayBackendOperations({ backendKind: 'wednesdayai' } as any);
      const hermesOps = getGatewayBackendOperations({ backendKind: 'hermes' } as any);
      const url = { url: 'wss://host/v1/hermes/ws' } as any;
      // wednesdayai strips only the trailing /ws
      expect(wednesdayaiOps.getBaseUrl(url)).toBe('https://host/v1/hermes');
      // hermes strips the full /v1/hermes/ws path — confirming the patterns differ
      expect(hermesOps.getBaseUrl(url)).toBe('https://host');
    });

    it('returns null for null config', () => {
      const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      expect(ops.getBaseUrl(null)).toBeNull();
    });

    it('handles ws:// (non-TLS) URLs correctly', () => {
      const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      expect(ops.getBaseUrl({ url: 'ws://localhost:3000/ws' } as any)).toBe('http://localhost:3000');
    });

    it('hermes: strips query string from a ws:// URL on the try path (GLM52-4 regression)', () => {
      const ops = getGatewayBackendOperations({ backendKind: 'hermes' } as any);
      // host.invalid is a syntactically valid RFC-3986 single-label host — new URL() does not
      // perform DNS resolution, so this URL parses successfully on the TRY path (url.search = '').
      // The test pins try-path query stripping: wss URLs with query strings must return the
      // base host without the token. The catch-path split('?')[0] branch is unreachable for
      // non-null results (any URL whose try-path new URL() throws has a malformed host that
      // also rejects the nested guard-2 new URL()), but the try-path contract is what matters
      // for real-world WS URLs passed through this function.
      expect(ops.getBaseUrl({ url: 'ws://host.invalid/v1/hermes/ws?token=abc' } as any))
        .toBe('http://host.invalid');
    });

    it('catch path: returns null for malformed hostname (unclosed bracket)', () => {
      const ops = getGatewayBackendOperations({ backendKind: 'hermes' } as any);
      // [invalid forces new URL() to throw in the try path; the catch path strips the
      // wsPathPattern and query, then tries new URL('http://[invalid') which also throws
      // → the nested guard returns null instead of leaking the broken string to callers.
      expect(ops.getBaseUrl({ url: 'ws://[invalid/v1/hermes/ws' } as any))
        .toBeNull();
    });

    it('catch path: returns null when stripping produces a bare protocol with no host (GEMINI-3 regression)', () => {
      const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      // ws:// with no host — new URL('http://') throws; catch path would previously return
      // 'http:' (replace(/\/+$/) strips the // delimiter). After GEMINI-3 fix: returns null.
      expect(ops.getBaseUrl({ url: 'ws://' } as any)).toBeNull();
    });

    it('openclaw: strips query string from a valid wss:// URL on the try path', () => {
      const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      expect(ops.getBaseUrl({ url: 'wss://example.com/ws?token=abc' } as any)).toBe('https://example.com');
    });

    it('hermes: strips query string from a valid wss:// URL on the try path', () => {
      const ops = getGatewayBackendOperations({ backendKind: 'hermes' } as any);
      expect(ops.getBaseUrl({ url: 'wss://example.com/v1/hermes/ws?token=abc' } as any)).toBe('https://example.com');
    });

    it('youmind: strips the /ws suffix (inherits OpenClaw pattern)', () => {
      const ops = getGatewayBackendOperations({ backendKind: 'youmind' } as any);
      expect(ops.getBaseUrl({ url: 'wss://example.com/ws' } as any)).toBe('https://example.com');
    });

    it('youmind: returns null for null config', () => {
      const ops = getGatewayBackendOperations({ backendKind: 'youmind' } as any);
      expect(ops.getBaseUrl(null)).toBeNull();
    });

    it('youmind: handles ws:// (non-TLS) URLs correctly', () => {
      const ops = getGatewayBackendOperations({ backendKind: 'youmind' } as any);
      expect(ops.getBaseUrl({ url: 'ws://localhost:3000/ws' } as any)).toBe('http://localhost:3000');
    });

    it('youmind: strips query string from valid wss:// URL', () => {
      const ops = getGatewayBackendOperations({ backendKind: 'youmind' } as any);
      expect(ops.getBaseUrl({ url: 'wss://example.com/ws?token=abc' } as any)).toBe('https://example.com');
    });
  });

  describe('getGatewayBackendOperations — RPC dispatch', () => {
    it('openclaw: getCurrentModelState dispatches model.get', async () => {
      const spy = jest.fn().mockResolvedValue({});
      const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      await ops.getCurrentModelState(spy as any);
      expect(spy).toHaveBeenCalledWith('model.get', {});
    });

    it('wednesdayai: getCurrentModelState dispatches model.get (OpenClaw-compatible, not model.current)', async () => {
      const spy = jest.fn().mockResolvedValue({});
      const ops = getGatewayBackendOperations({ backendKind: 'wednesdayai' } as any);
      await ops.getCurrentModelState(spy as any);
      expect(spy).toHaveBeenCalledWith('model.get', {});
    });

    it('hermes: getCurrentModelState dispatches model.current (Hermes-specific override)', async () => {
      const spy = jest.fn().mockResolvedValue({});
      const ops = getGatewayBackendOperations({ backendKind: 'hermes' } as any);
      await ops.getCurrentModelState(spy as any);
      expect(spy).toHaveBeenCalledWith('model.current', {});
    });

    it('youmind: getCurrentModelState dispatches model.get (OpenClaw-compatible)', async () => {
      const spy = jest.fn().mockResolvedValue({});
      const ops = getGatewayBackendOperations({ backendKind: 'youmind' } as any);
      await ops.getCurrentModelState(spy as any);
      expect(spy).toHaveBeenCalledWith('model.get', {});
    });

    it('wednesdayai: setModelSelection dispatches model.set', async () => {
      const spy = jest.fn().mockResolvedValue({});
      const ops = getGatewayBackendOperations({ backendKind: 'wednesdayai' } as any);
      await ops.setModelSelection(spy as any, { model: 'claude-3-5-sonnet', scope: 'global' });
      expect(spy).toHaveBeenCalledWith('model.set', expect.objectContaining({ model: 'claude-3-5-sonnet' }));
    });

    it('hermes: getModelSelectionState dispatches model.get (intentional: model.get returns models/providers, model.current does not)', async () => {
      const spy = jest.fn().mockResolvedValue({});
      const ops = getGatewayBackendOperations({ backendKind: 'hermes' } as any);
      await ops.getModelSelectionState(spy as any);
      // Intentional: Hermes has two distinct model RPCs.
      // model.current → lightweight (currentModel/Provider/BaseUrl/note only, no models list).
      // model.get → full HermesModelState with models[] and providers[].
      // getModelSelectionState needs models/providers → uses model.get.
      // getCurrentModelState needs only the current selection → overrides to model.current.
      expect(spy).toHaveBeenCalledWith('model.get', {});
    });

    it('openclaw: getModelSelectionState dispatches model.get', async () => {
      const spy = jest.fn().mockResolvedValue({});
      const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      await ops.getModelSelectionState(spy as any);
      expect(spy).toHaveBeenCalledWith('model.get', {});
    });

    it('wednesdayai: getModelSelectionState dispatches model.get (OpenClaw-compatible)', async () => {
      const spy = jest.fn().mockResolvedValue({});
      const ops = getGatewayBackendOperations({ backendKind: 'wednesdayai' } as any);
      await ops.getModelSelectionState(spy as any);
      expect(spy).toHaveBeenCalledWith('model.get', {});
    });

    it('youmind: getModelSelectionState dispatches model.get (OpenClaw-compatible)', async () => {
      const spy = jest.fn().mockResolvedValue({});
      const ops = getGatewayBackendOperations({ backendKind: 'youmind' } as any);
      await ops.getModelSelectionState(spy as any);
      expect(spy).toHaveBeenCalledWith('model.get', {});
    });
  });

  describe('getGatewayBackendOperations — getAgentFile contract (all backends)', () => {
    // getAgentFile is inherited from sharedOperations by all backends.
    // Testing each backendKind explicitly catches a future per-backend override.
    const backendKinds = ['openclaw', 'wednesdayai', 'youmind', 'hermes'] as const;

    for (const backendKind of backendKinds) {
      describe(`${backendKind}`, () => {
        it('rejects with "File not found" when RPC response has no file field', async () => {
          const spy = jest.fn().mockResolvedValue({});
          const ops = getGatewayBackendOperations({ backendKind } as any);
          await expect(ops.getAgentFile(spy as any, 'agent-1', 'AGENTS.md')).rejects.toThrow('File not found');
        });

        it('resolves with the file payload when present', async () => {
          const fakeFile = { name: 'AGENTS.md', path: '/agents/AGENTS.md', missing: false, content: '# Agents' };
          const spy = jest.fn().mockResolvedValue({ file: fakeFile });
          const ops = getGatewayBackendOperations({ backendKind } as any);
          const result = await ops.getAgentFile(spy as any, 'agent-1', 'AGENTS.md');
          expect(result).toBe(fakeFile);
        });
      });
    }
  });

  describe('getGatewayBackendOperations — shared RPC dispatch coverage', () => {
    // sharedOperations methods tested against openclaw as canonical baseline.
    // The method-reference tests above guarantee the same functions reach all backends.

    it('listModels dispatches models.list', async () => {
      const spy = jest.fn().mockResolvedValue({ models: [] });
      const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      await ops.listModels(spy as any);
      expect(spy).toHaveBeenCalledWith('models.list', {});
    });

    it('listModels returns [] when response has no models field', async () => {
      const spy = jest.fn().mockResolvedValue({});
      const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      const result = await ops.listModels(spy as any);
      expect(result).toEqual([]);
    });

    it('getConfig dispatches config.get', async () => {
      const spy = jest.fn().mockResolvedValue({});
      const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      await ops.getConfig(spy as any);
      expect(spy).toHaveBeenCalledWith('config.get', {});
    });

    it('getConfig returns { config: null, hash: null } on null response', async () => {
      const spy = jest.fn().mockResolvedValue(null);
      const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      const result = await ops.getConfig(spy as any);
      expect(result).toEqual({ config: null, hash: null });
    });

    it('patchConfig dispatches config.patch with raw and baseHash', async () => {
      const spy = jest.fn().mockResolvedValue({});
      const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      await ops.patchConfig(spy as any, 'key: value', 'abc123');
      expect(spy).toHaveBeenCalledWith('config.patch', { raw: 'key: value', baseHash: 'abc123' });
    });

    it('patchConfig returns { ok: false } on null response', async () => {
      const spy = jest.fn().mockResolvedValue(null);
      const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      const result = await ops.patchConfig(spy as any, 'x', 'h');
      expect(result).toEqual({ ok: false, config: undefined, hash: undefined });
    });

    it('setConfig dispatches config.set with raw and baseHash', async () => {
      const spy = jest.fn().mockResolvedValue({});
      const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      await ops.setConfig(spy as any, 'key: value', 'abc123');
      expect(spy).toHaveBeenCalledWith('config.set', { raw: 'key: value', baseHash: 'abc123' });
    });

    it('setConfig returns { ok: false } on null response', async () => {
      const spy = jest.fn().mockResolvedValue(null);
      const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      const result = await ops.setConfig(spy as any, 'x', 'h');
      expect(result).toEqual({ ok: false, config: undefined, path: undefined });
    });

    it('fetchToolsCatalog dispatches tools.catalog with agentId and includePlugins', async () => {
      const spy = jest.fn().mockResolvedValue({ agentId: 'agent-1', profiles: [], groups: [] });
      const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      await ops.fetchToolsCatalog(spy as any, 'agent-1');
      expect(spy).toHaveBeenCalledWith('tools.catalog', { agentId: 'agent-1', includePlugins: true });
    });

    it('listAgentFiles dispatches agents.files.list with agentId', async () => {
      const spy = jest.fn().mockResolvedValue({ files: [] });
      const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      await ops.listAgentFiles(spy as any, 'agent-1');
      expect(spy).toHaveBeenCalledWith('agents.files.list', { agentId: 'agent-1' });
    });

    it('listAgentFiles returns [] when response has no files field', async () => {
      const spy = jest.fn().mockResolvedValue({});
      const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      const result = await ops.listAgentFiles(spy as any, 'agent-1');
      expect(result).toEqual([]);
    });

    it('setAgentFile dispatches agents.files.set with agentId, name, content', async () => {
      const spy = jest.fn().mockResolvedValue({ ok: true });
      const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      await ops.setAgentFile(spy as any, 'agent-1', 'AGENTS.md', '# Agents');
      expect(spy).toHaveBeenCalledWith('agents.files.set', { agentId: 'agent-1', name: 'AGENTS.md', content: '# Agents' });
    });

    it('setAgentFile returns { ok: false } on null response', async () => {
      const spy = jest.fn().mockResolvedValue(null);
      const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      const result = await ops.setAgentFile(spy as any, 'agent-1', 'AGENTS.md', '# Agents');
      expect(result).toEqual({ ok: false });
    });
  });

  describe('getGatewayBackendOperations — Hermes setModelSelection dispatch', () => {
    it('hermes: setModelSelection dispatches model.set (inherited, not model.current — intentional asymmetry)', async () => {
      const spy = jest.fn().mockResolvedValue({});
      const ops = getGatewayBackendOperations({ backendKind: 'hermes' } as any);
      await ops.setModelSelection(spy as any, { model: 'claude-3-5-sonnet', scope: 'global' });
      // Intentional: Hermes reads use model.current (getCurrentModelState) or model.get (getModelSelectionState),
      // but writes use model.set (inherited from sharedOperations). Hermes Model Selection Rule mandates
      // global-scoped writes converge on a shared operation — this test pins that invariant.
      expect(spy).toHaveBeenCalledWith('model.set', expect.objectContaining({ model: 'claude-3-5-sonnet' }));
    });
  });

  describe('getGatewayBackendOperations — fetchUsage / fetchCostSummary', () => {
    it('fetchUsage: dispatches sessions.usage with correct date params', async () => {
      const spy = jest.fn().mockResolvedValue(null);
      const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      await ops.fetchUsage(spy as any, { startDate: '2026-01-01', endDate: '2026-01-31' });
      expect(spy).toHaveBeenCalledWith('sessions.usage', expect.objectContaining({
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      }));
    });

    it('fetchUsage: returns all 7 UsageResult fields without truncation', async () => {
      const mockResult = {
        updatedAt: 1234567890,
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        sessions: [{ key: 'sess-a', usage: null }],
        totals: { input: 1, output: 2, cacheRead: 0, cacheWrite: 0, totalTokens: 3, totalCost: 0.01, inputCost: 0.001, outputCost: 0.009, cacheReadCost: 0, cacheWriteCost: 0, missingCostEntries: 0 },
        aggregates: { messages: { total: 5, user: 2, assistant: 3, toolCalls: 0, toolResults: 0, errors: 0 }, tools: { totalCalls: 0, uniqueTools: 0, tools: [] }, byModel: [], byProvider: [], byAgent: [], byChannel: [], daily: [] },
        costPresentation: { mode: 'actual' as const },
      };
      const spy = jest.fn().mockResolvedValue(mockResult);
      const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      const result = await ops.fetchUsage(spy as any, { startDate: '2026-01-01', endDate: '2026-01-31' });
      expect(result.updatedAt).toBe(1234567890);
      expect(result.startDate).toBe('2026-01-01');
      expect(result.endDate).toBe('2026-01-31');
      expect(result.sessions).toEqual(mockResult.sessions);
      expect(result.totals).toEqual(mockResult.totals);
      expect(result.aggregates).toEqual(mockResult.aggregates);
      expect(result.costPresentation).toEqual(mockResult.costPresentation);
    });

    it('fetchUsage: null response yields all 7 fields undefined', async () => {
      const spy = jest.fn().mockResolvedValue(null);
      const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      const result = await ops.fetchUsage(spy as any, { startDate: '2026-01-01', endDate: '2026-01-31' });
      expect(result.updatedAt).toBeUndefined();
      expect(result.startDate).toBeUndefined();
      expect(result.endDate).toBeUndefined();
      expect(result.sessions).toBeUndefined();
      expect(result.totals).toBeUndefined();
      expect(result.aggregates).toBeUndefined();
      expect(result.costPresentation).toBeUndefined();
    });

    it('fetchCostSummary: dispatches usage.cost with correct date params', async () => {
      const spy = jest.fn().mockResolvedValue(null);
      const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      await ops.fetchCostSummary(spy as any, { startDate: '2026-01-01', endDate: '2026-01-31' });
      expect(spy).toHaveBeenCalledWith('usage.cost', expect.objectContaining({
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      }));
    });

    it('fetchCostSummary: returns all 5 CostSummary fields without truncation', async () => {
      const mockResult = {
        updatedAt: 9876543210,
        days: 30,
        daily: [{ date: '2026-01-01', input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalTokens: 0, totalCost: 0, inputCost: 0, outputCost: 0, cacheReadCost: 0, cacheWriteCost: 0, missingCostEntries: 0 }],
        totals: { input: 1, output: 2, cacheRead: 0, cacheWrite: 0, totalTokens: 3, totalCost: 0.01, inputCost: 0.001, outputCost: 0.009, cacheReadCost: 0, cacheWriteCost: 0, missingCostEntries: 0 },
        costPresentation: { mode: 'currency' as const },
      };
      const spy = jest.fn().mockResolvedValue(mockResult);
      const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      const result = await ops.fetchCostSummary(spy as any, { startDate: '2026-01-01', endDate: '2026-01-31' });
      expect(result.updatedAt).toBe(9876543210);
      expect(result.days).toBe(30);
      expect(result.daily).toEqual(mockResult.daily);
      expect(result.totals).toEqual(mockResult.totals);
      expect(result.costPresentation).toEqual(mockResult.costPresentation);
    });

    it('fetchCostSummary: null response yields all 5 fields undefined', async () => {
      const spy = jest.fn().mockResolvedValue(null);
      const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      const result = await ops.fetchCostSummary(spy as any, { startDate: '2026-01-01', endDate: '2026-01-31' });
      expect(result.updatedAt).toBeUndefined();
      expect(result.days).toBeUndefined();
      expect(result.daily).toBeUndefined();
      expect(result.totals).toBeUndefined();
      expect(result.costPresentation).toBeUndefined();
    });

    it('fetchUsage: propagates RPC errors to caller', async () => {
      const spy = jest.fn().mockRejectedValue(new Error('RPC timeout'));
      const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      await expect(ops.fetchUsage(spy as any, { startDate: '2026-01-01', endDate: '2026-01-31' }))
        .rejects.toThrow('RPC timeout');
    });

    it('fetchCostSummary: propagates RPC errors to caller', async () => {
      const spy = jest.fn().mockRejectedValue(new Error('RPC timeout'));
      const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      await expect(ops.fetchCostSummary(spy as any, { startDate: '2026-01-01', endDate: '2026-01-31' }))
        .rejects.toThrow('RPC timeout');
    });
  });
});
