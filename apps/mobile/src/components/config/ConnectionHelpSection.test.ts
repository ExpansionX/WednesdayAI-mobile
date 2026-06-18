import { getDirectAuthHelpCopy } from './ConnectionHelpSection';

jest.mock('./CopyableCommand', () => ({
  CopyableCommand: () => null,
}));

jest.mock('./QuickConnectGuideCard', () => ({
  QuickConnectGuideCard: () => null,
}));

describe('getDirectAuthHelpCopy', () => {
  it('uses OpenClaw auth-file copy only for OpenClaw manual connections', () => {
    expect(getDirectAuthHelpCopy('openclaw')).toEqual({
      credentialSource: 'Open openclaw.json and find gateway.auth.token or gateway.auth.password to get this credential.',
      credentialStorage: 'Your auth credential is stored securely on this device and used only for handshakes with your OpenClaw Gateway over LAN, Tailscale, or your own Relay.',
    });
  });

  it('uses backend-neutral auth copy for WednesdayAI manual connections', () => {
    expect(getDirectAuthHelpCopy('wednesdayai')).toEqual({
      credentialSource: 'Use the auth token or password from your WednesdayAI-compatible gateway configuration.',
      credentialStorage: 'Your auth credential is stored securely on this device and used only for handshakes with your gateway over LAN, Tailscale, or your own Relay.',
    });
  });
});
