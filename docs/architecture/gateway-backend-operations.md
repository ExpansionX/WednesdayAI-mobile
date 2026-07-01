---
audience: developer
component: apps/mobile
sources:
  - apps/mobile/src/services/gateway-backend-operations.ts
  - apps/mobile/src/services/gateway.ts
  - apps/mobile/src/services/gateway-backends.ts
generated: 2026-07-01
---

# Gateway Backend Operations

## Overview

`GatewayBackendOperations` is the interface layer that decouples backend-specific RPC semantics
from screen-level and service-level callers. Each registered backend (`openclaw`, `wednesdayai`,
`youmind`, `hermes`) has an operations object that owns how its gateway RPCs work. Callers always
obtain the operations bundle via `getGatewayBackendOperations(config)` and invoke methods without
branching on `backendKind` at the call site.

This implements the rule in `docs/architecture/backend-transport.md`: backend-specific request
semantics belong in service helpers, not in view components.

## Interface

`GatewayBackendOperations` (defined in `apps/mobile/src/services/gateway-backend-operations.ts`):

| Method | RPC(s) dispatched | Notes |
|--------|-------------------|-------|
| `listModels(request)` | `models.list` | All backends, shared |
| `getCurrentModelState(request)` | `model.get` (openclaw/wednesdayai/youmind) · `model.current` (hermes) | Hermes override: lightweight state, no models list |
| `getModelSelectionState(request)` | `model.get` | All backends, shared — full state with `models[]` + `providers[]` |
| `setModelSelection(request, params)` | `model.set` | All backends, shared |
| `getConfig(request)` | `config.get` | Returns `{ config, hash }` |
| `patchConfig(request, raw, baseHash)` | `config.patch` | Hash-guarded write |
| `setConfig(request, raw, baseHash)` | `config.set` | Hash-guarded replace |
| `fetchToolsCatalog(request, agentId)` | `tools.catalog` | Includes plugins |
| `listAgentFiles(request, agentId)` | `agents.files.list` | Returns summary list |
| `getAgentFile(request, agentId, name)` | `agents.files.get` | Returns full detail with content |
| `setAgentFile(request, agentId, name, content)` | `agents.files.set` | No base-hash guard; callers own staleness detection |
| `fetchUsage(request, params)` | `sessions.usage` | Date-range query |
| `fetchCostSummary(request, params)` | `usage.cost` | Date-range query |
| `getBaseUrl(config)` | — | Derives HTTP base URL from WS URL in stored config |
| `usesConnectHandshake` | — | Boolean: whether the backend requires a connect handshake |

## Backend dispatch

`getGatewayBackendOperations(config)` resolves the backend kind from `config` and returns the
corresponding singleton operations object:

```text
openclaw  → OPENCLAW_OPERATIONS   usesConnectHandshake: true,  getBaseUrl: /ws pattern
wednesdayai → WEDNESDAYAI_OPERATIONS  (spread of OPENCLAW_OPERATIONS — same references)
youmind   → YOUMIND_OPERATIONS    (spread of OPENCLAW_OPERATIONS — same references)
hermes    → HERMES_OPERATIONS     usesConnectHandshake: false, getBaseUrl: /v1/hermes/ws pattern,
                                  getCurrentModelState → model.current (not model.get)
null/unknown → OPENCLAW_OPERATIONS (default)
```

`wednesdayai` and `youmind` share every method reference with `openclaw` via `{ ...OPENCLAW_OPERATIONS }`.
They are distinct named constants so future per-backend divergence has a named anchor and each
backend is explicit in the dispatch — there are no silent fallbacks to openclaw.

`hermes` overrides two methods:
- `getCurrentModelState` → dispatches `model.current` (lightweight; no `models[]`/`providers[]`)
- `getBaseUrl` → strips `/v1/hermes/ws` instead of `/ws`

## URL normalization (`getBaseUrl` / `deriveBaseUrl`)

`deriveBaseUrl(urlText, wsPathPattern)` converts a WebSocket URL from stored config to an HTTP
base URL suitable for `fetch`/`Image` callers:

1. **Try path** (all syntactically valid URLs): replaces `ws://` → `http://` and `wss://` → `https://`,
   clears `search` and `hash`, removes the backend-specific path suffix via `wsPathPattern`, strips
   trailing slashes.
2. **Catch path** (malformed URLs where `new URL()` throws): `new URL()` is the only throw source
   in the try block. If the `ws(s)://` → `http(s)://` scheme swap still leaves an unparseable
   host, `deriveBaseUrl` returns `null` immediately — there is no base URL to derive. The try
   path handles all real-world WebSocket URLs.

Pattern per backend:
- openclaw / wednesdayai / youmind: `/\/ws\/?$/`
- hermes: `/\/v1\/hermes\/ws\/?$/`

## Hermes relay bridge retry

`GatewayClient` (`apps/mobile/src/services/gateway.ts`) auto-retries a subset of Hermes relay
requests when the relay worker returns a `[BRIDGE_UNAVAILABLE]` error (the local Hermes bridge is
transiently disconnected from the relay):

```bash
sendBackendRequest(method, params)
  → sendRequestWithHermesBridgeRetry(method, params)
      → isHermesRelayBridgeRetryEligible(method)
          returns true only when:
            backendKind === 'hermes'
            AND activeRoute === 'relay'
            AND HERMES_BRIDGE_RETRY_METHODS.has(method)
      → delays = [750ms, 750ms] if eligible, [] otherwise
      → loop: attempt once + retry on [BRIDGE_UNAVAILABLE] after each delay
```

For non-Hermes backends (`openclaw`, `wednesdayai`, `youmind`) the eligibility check returns false
immediately, `delays = []`, and the loop runs exactly once — no retry, no behavioral change.

Both `HERMES_BRIDGE_RETRY_METHODS` and `HERMES_BRIDGE_TRACED_METHODS` are module-level exported
constants (not private class members). This allows tests to assert the subset invariant and
per-method membership without private-class casts or reflection.

### Retry-eligible methods (`HERMES_BRIDGE_RETRY_METHODS`)

Only **idempotent reads** are eligible. The set is not an event whitelist — it is an explicit
allowlist for methods where a duplicate request cannot produce a duplicate side effect:

```text
sessions.list    chat.history    last-heartbeat
models.list      model.current   model.get
agents.list      agent.identity.get
sessions.usage   usage.cost
config.get       tools.catalog   agents.files.list
```

### Intentionally excluded reads

`agents.files.get` is **excluded** even though it is a read with no backend side effect. Reason:
it is the edit base for read-modify-write flows (file editor fetches content → user edits →
`setAgentFile` writes back). Auto-retrying after `[BRIDGE_UNAVAILABLE]` can silently return newer
file content if the file changed in the ~750ms gap, and `setAgentFile` carries no base-hash token
for server-side staleness rejection (unlike `config.get` → `patchConfig`/`setConfig` which pass
`baseHash`). A transient error the user retries explicitly is honest; a silent base shift is not.

Mutating operations (`model.set`, `config.patch`, `config.set`, `agents.files.set`) are excluded
because they may have already been accepted by the bridge on the first attempt.

Chat operations (`chat.send`, `chat.abort`) bypass `sendBackendRequest` entirely and call
`sendRequest` directly — they are never candidates for automatic retry regardless of the set.

### Request tracing (`HERMES_BRIDGE_TRACED_METHODS`)

`HERMES_BRIDGE_TRACED_METHODS` is a module-level exported Set of methods for which `GatewayClient`
opens a request-level trace span. It is defined as a strict superset of `HERMES_BRIDGE_RETRY_METHODS`:

```text
HERMES_BRIDGE_TRACED_METHODS = { 'connect' } ∪ HERMES_BRIDGE_RETRY_METHODS
```

`shouldTraceRequest(method: string): boolean` returns `HERMES_BRIDGE_TRACED_METHODS.has(method)` —
a set lookup, not a switch statement. The subset invariant is enforced in tests:

```typescript
// Every retry-eligible method must also be traced
for (const method of HERMES_BRIDGE_RETRY_METHODS) {
  expect(HERMES_BRIDGE_TRACED_METHODS.has(method)).toBe(true);
}
```

This invariant means: adding a 14th method to `HERMES_BRIDGE_RETRY_METHODS` automatically
includes it in tracing without a matching `case` in a switch, and test coverage cannot silently
drift from the live Set via a hardcoded `it.each` list.

### Error stack preservation

`sendRequestWithHermesBridgeRetry` re-throws the original error object (`throw error` /
`throw lastError`). `Error.prototype.stack` is set at construction time in V8/JSC and is not
rewritten on re-throw. Telemetry that keys off `error.stack` sees the original throw site inside
`sendRequest`, not the retry wrapper's frame. Non-`Error` rejections are normalized to `new Error(String(lastError))`.

## Testing

Tests live in `apps/mobile/src/services/gateway-backend-operations.test.ts` (62 tests).

Coverage includes:
- `usesConnectHandshake` for all four backends
- Object identity contracts: wednesdayai/youmind share method references with openclaw; hermes
  has divergent `getCurrentModelState` and `getBaseUrl` references
- Discriminative behavioral assertions: `wss://host/v1/hermes/ws` → `https://host` (hermes) vs
  `https://host/v1/hermes` (openclaw) — catches a wrong Hermes override that shares reference
  inequality but uses the wrong pattern
- `getBaseUrl` edge cases: null config, ws:// (non-TLS), wss:// with query string, malformed host
  (catch path → null), bare `ws://` (GEMINI-3 → null)
- Try-path query stripping (GLM52-4 regression): `ws://host.invalid/v1/hermes/ws?token=abc` →
  `http://host.invalid` via `url.search = ''`
- RPC dispatch for all 14 methods and 1 property across all four backends
- Error propagation (fetchUsage/fetchCostSummary reject without swallowing)
- `getAgentFile` across all four backends

## Admin note

> **For relay operators**: The retry delays (`HERMES_BRIDGE_UNAVAILABLE_RETRY_DELAYS_MS = [750, 750]`)
> mean that a transient bridge disconnect can cause up to ~2.5 seconds of additional latency on
> affected reads before the error surfaces to the user. This is intentional: a transiently
> reattaching bridge recovers within that window without user-visible errors in most cases.
> Mutating operations and chat do not retry — they fail immediately on `[BRIDGE_UNAVAILABLE]`.
> If your relay is consistently returning `[BRIDGE_UNAVAILABLE]` on read requests, check
> Hermes bridge process health and relay-worker to bridge WebSocket connectivity rather than
> increasing retry counts in the mobile client.
