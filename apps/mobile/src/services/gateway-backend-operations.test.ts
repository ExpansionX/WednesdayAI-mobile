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

    it('hermes: getModelSelectionState dispatches model.get (inherited from sharedOperations)', async () => {
      const spy = jest.fn().mockResolvedValue({});
      const ops = getGatewayBackendOperations({ backendKind: 'hermes' } as any);
      await ops.getModelSelectionState(spy as any);
      // Documents current behavior: Hermes inherits model.get for getModelSelectionState
      // while getCurrentModelState uses the Hermes-specific model.current override.
      expect(spy).toHaveBeenCalledWith('model.get', {});
    });
  });
});
