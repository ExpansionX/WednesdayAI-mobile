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

  describe('getGatewayBackendOperations — object identity', () => {
    it('returns a separate operations object instance for wednesdayai vs openclaw (currently shares openclaw methods)', () => {
      // NOTE: WEDNESDAYAI_OPERATIONS is { ...OPENCLAW_OPERATIONS }. This test guards
      // reference identity only — a separate named constant for future per-backend overrides.
      // Behavioral divergence requires an explicit override in WEDNESDAYAI_OPERATIONS.
      const wednesdayaiOps = getGatewayBackendOperations({ backendKind: 'wednesdayai' } as any);
      const openclawOps = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      expect(wednesdayaiOps).not.toBe(openclawOps);
    });

    it('returns a separate operations object instance for youmind vs openclaw', () => {
      // NOTE: YOUMIND_OPERATIONS is { ...OPENCLAW_OPERATIONS }. Separate constant ensures
      // the youmind dispatch branch is never silent and has an anchor for future divergence.
      const youmindOps = getGatewayBackendOperations({ backendKind: 'youmind' } as any);
      const openclawOps = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      expect(youmindOps).not.toBe(openclawOps);
    });

    it('returns a separate operations object instance for hermes vs openclaw', () => {
      const hermesOps = getGatewayBackendOperations({ backendKind: 'hermes' } as any);
      const openclawOps = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      expect(hermesOps).not.toBe(openclawOps);
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

    it('catch path: strips query string before applying wsPathPattern (GLM52-4 regression)', () => {
      const ops = getGatewayBackendOperations({ backendKind: 'hermes' } as any);
      // [invalid forces new URL() to throw — triggers the catch path
      // Before fix: ?token=abc prevented wsPathPattern match → path leaked into result
      // After fix: query string is stripped first → wsPathPattern matches correctly
      expect(ops.getBaseUrl({ url: 'ws://[invalid/v1/hermes/ws?token=abc' } as any))
        .toBe('http://[invalid');
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
  });

  describe('getGatewayBackendOperations — getAgentFile contract', () => {
    it('rejects with "File not found" when RPC response has no file field', async () => {
      const spy = jest.fn().mockResolvedValue({});
      const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      await expect(ops.getAgentFile(spy as any, 'agent-1', 'AGENTS.md')).rejects.toThrow('File not found');
    });

    it('resolves with the file payload when present', async () => {
      const fakeFile = { name: 'AGENTS.md', path: '/agents/AGENTS.md', missing: false, content: '# Agents' };
      const spy = jest.fn().mockResolvedValue({ file: fakeFile });
      const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      const result = await ops.getAgentFile(spy as any, 'agent-1', 'AGENTS.md');
      expect(result).toBe(fakeFile);
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

    it('fetchUsage: null response yields all fields undefined', async () => {
      const spy = jest.fn().mockResolvedValue(null);
      const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      const result = await ops.fetchUsage(spy as any, { startDate: '2026-01-01', endDate: '2026-01-31' });
      expect(result.updatedAt).toBeUndefined();
      expect(result.startDate).toBeUndefined();
      expect(result.endDate).toBeUndefined();
      expect(result.sessions).toBeUndefined();
      expect(result.aggregates).toBeUndefined();
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

    it('fetchCostSummary: null response yields all fields undefined', async () => {
      const spy = jest.fn().mockResolvedValue(null);
      const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      const result = await ops.fetchCostSummary(spy as any, { startDate: '2026-01-01', endDate: '2026-01-31' });
      expect(result.updatedAt).toBeUndefined();
      expect(result.days).toBeUndefined();
      expect(result.daily).toBeUndefined();
    });
  });
});
