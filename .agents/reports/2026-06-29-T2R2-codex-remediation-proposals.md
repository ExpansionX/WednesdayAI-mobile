I could not write the report file because this session is explicitly read-only and the filesystem sandbox only permits reads. Report content:

```markdown
## REMEDIATION-1: Replace false catch-path regression with the real try-path query stripping behavior
**Status**: Working Fix
**Steal Claim**: YES — the discovering challenger's test is wrong AND you have a correct one
**Confidence**: High

### Code Change
```ts
    it('hermes: strips query string from a valid ws:// URL on the try path (GLM52-4 regression)', () => {
      const ops = getGatewayBackendOperations({ backendKind: 'hermes' } as any);
      expect(ops.getBaseUrl({ url: 'ws://host.invalid/v1/hermes/ws?token=abc' } as any))
        .toBe('http://host.invalid');
    });
```

### Why This Works
There is no useful input of the requested shape for the Hermes suffix case. `new URL(urlText.replace(/^ws(s?):\/\//, 'http$1://'))` parses `ws://host.invalid/v1/hermes/ws?token=abc` successfully because `host.invalid` is syntactically valid and `new URL()` does not perform DNS resolution. If the initial parse fails because the scheme, host, or port is malformed, removing the `/v1/hermes/ws` path suffix and query does not repair that malformed authority, so the nested `new URL(stripped)` guard returns `null`.

The correct behavior to pin is therefore the actual try-path behavior: valid WebSocket URLs with query strings have `search` cleared before the Hermes path suffix is removed, returning `http://host.invalid`. The existing malformed-host tests already cover the catch path returning `null`.
```

