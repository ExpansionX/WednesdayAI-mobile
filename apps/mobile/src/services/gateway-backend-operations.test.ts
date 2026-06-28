import { getGatewayBackendOperations } from './gateway-backend-operations';

describe('gateway-backend-operations', () => {
  describe('getGatewayBackendOperations', () => {
    it('returns a WednesdayAI-specific operations object distinct from the OpenClaw operations', () => {
      const wednesdayaiOps = getGatewayBackendOperations({ backendKind: 'wednesdayai' } as any);
      const openclawOps = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      expect(wednesdayaiOps).not.toBe(openclawOps);
    });

    it('returns usesConnectHandshake true for WednesdayAI (OpenClaw-compatible baseline)', () => {
      const ops = getGatewayBackendOperations({ backendKind: 'wednesdayai' } as any);
      expect(ops.usesConnectHandshake).toBe(true);
    });

    it('returns usesConnectHandshake false for Hermes', () => {
      const ops = getGatewayBackendOperations({ backendKind: 'hermes' } as any);
      expect(ops.usesConnectHandshake).toBe(false);
    });

    it('returns usesConnectHandshake true for OpenClaw', () => {
      const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as any);
      expect(ops.usesConnectHandshake).toBe(true);
    });
  });
});
