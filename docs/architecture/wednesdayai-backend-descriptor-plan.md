# WednesdayAI Backend Descriptor Plan

## Current anchors

- `docs/architecture/backend-transport.md` is the governing architecture document: backend identity and transport identity are separate, and `wednesdayai` is the primary backend identity, not a transport.
- Current backend identity type: `GatewayBackendKind = 'wednesdayai' | 'openclaw' | 'hermes' | 'youmind'` in `apps/mobile/src/types/index.ts:33`.
- Current transport identity type: `GatewayTransportKind = 'local' | 'tailscale' | 'cloudflare' | 'custom' | 'relay'` in `apps/mobile/src/types/index.ts:34`.
- Current legacy mode type: `GatewayMode = GatewayTransportKind | 'hermes'` in `apps/mobile/src/types/index.ts:35`.
- Current central capability anchors: `OPENCLAW_CAPABILITIES`, `WEDNESDAYAI_CAPABILITIES`, `HERMES_CAPABILITIES`, `YOUMIND_CAPABILITIES`, and `BACKENDS` in `apps/mobile/src/services/gateway-backends.ts`.
- Current backend helpers: `isGatewayBackendKind`, `resolveGatewayBackendKind`, and `selectByBackend` in `apps/mobile/src/services/gateway-backends.ts`.

## Implemented first slice

The first behaviour-changing slice has implemented the minimal `wednesdayai` backend descriptor and explicit dispatch coverage. The current implementation:

- treats `wednesdayai` as backend identity only;
- keeps `GatewayTransportKind` unchanged as `local | tailscale | cloudflare | custom | relay`;
- gives `wednesdayai` the deliberate OpenClaw-compatible capability baseline until real gateway differences are planned;
- keeps OpenClaw, Hermes, and retained YouMind as explicit compatibility descriptors;
- preserves explicit `wednesdayai` identity through QR parsing, relay claim, saved manual configs, and docs routing;
- does not default unknown saved configs to `wednesdayai`;
- does not choose final native IDs, npm scope, CLI command, Expo owner/project, relay domains, or YouMind disposition.

Future backend work should build on this state rather than re-adding `wednesdayai` as if it were still only planned.

## Backend identities

- Keep `wednesdayai` in `GatewayBackendKind` as the primary product backend identity.
- Keep `openclaw` as an explicit OpenClaw-derived compatibility backend descriptor.
- Keep `hermes` as an explicit Hermes compatibility backend descriptor.
- Keep or remove `youmind` only through the scoped disposition below.
- Do not infer WednesdayAI from OpenClaw labels in UI code. The backend registry should name it directly.

Current backend identity set:

```ts
type GatewayBackendKind = 'wednesdayai' | 'openclaw' | 'hermes' | 'youmind';
```

`youmind` remains conditional on the disposition task; if removed, it must be removed deliberately across types, descriptors, saved-config migration, UI copy, and tests.

## Transport identities

- Keep transports as `local`, `relay`, `tailscale`, `cloudflare`, and `custom`.
- Do not add `wednesdayai` to `GatewayTransportKind`.
- Do not add `hermes` as a new transport. The existing `GatewayMode = GatewayTransportKind | 'hermes'` is a legacy compatibility shape and should not expand into a product-as-transport model.
- Transport helpers should continue to own connection route, caching, relay, and reconnect behaviour.

## Minimal descriptor

The first implementation slice added a minimal WednesdayAI descriptor to the existing registry before broader UI wiring:

```ts
const WEDNESDAYAI_CAPABILITIES: GatewayBackendCapabilities = {
  ...OPENCLAW_COMPATIBLE_BASE,
  // Adjust only after real gateway support is verified.
};

const BACKENDS: Record<GatewayBackendKind, GatewayBackendDescriptor> = {
  wednesdayai: {
    kind: 'wednesdayai',
    label: 'WednesdayAI',
    capabilities: WEDNESDAYAI_CAPABILITIES,
  },
  openclaw: { ... },
  hermes: { ... },
  youmind: { ... },
};
```

The exact capability values should be evidence-backed. If WednesdayAI currently speaks OpenClaw-derived gateway APIs, copy the compatible baseline deliberately and document which values are compatibility assumptions. Do not silently treat OpenClaw as the default product identity.

## Compatibility descriptors

- OpenClaw compatibility descriptor should keep OpenClaw labels for OpenClaw config, OpenClaw diagnostics, OpenClaw permissions, OpenClaw install/update guidance, and OpenClaw-derived protocol migration.
- Hermes compatibility descriptor should keep Hermes labels for Hermes local bridge, Hermes relay, Hermes model selection, Hermes sessions, Hermes usage/cost, and Hermes-specific runtime health.
- Compatibility descriptors should advertise unsupported actions through capability metadata rather than optimistic requests.
- Compatibility labels should be preserved in UI where the connected backend is explicitly OpenClaw or Hermes.

## YouMind disposition

- Do not leave YouMind as an accidental fallback.
- If retained, define `youmind` as a deliberate compatibility backend with supported surfaces, unsupported surfaces, saved-config expectations, and i18n copy.
- If removed, create a scoped migration task that updates `GatewayBackendKind`, `BACKENDS`, `selectByBackend`, `resolveGlobalMainSessionKey`, UI routes, locale strings, stored config migration, and tests.
- This descriptor plan does not decide the final YouMind outcome.

## Operation helpers

- Extend capability metadata and backend operation helpers before wiring UI.
- `isGatewayBackendKind` should accept `wednesdayai` after the type is extended.
- `resolveGatewayBackendKind` should default new/unknown WednesdayAI Mobile configs to `wednesdayai` only after saved-config migration and compatibility semantics are defined.
- Legacy configs with `mode: 'hermes'` or Hermes bridge state should still resolve to `hermes`.
- Relay detection should continue through `transportKind === 'relay'`, `resolveGatewayTransportKind`, or existing relay config presence; backend identity must not decide transport identity.
- `selectByBackend` should require or provide a WednesdayAI branch so callers make product behaviour explicit.
- Backend operation helpers should own backend-specific request semantics for status, doctor, logs, reset, service lifecycle, models/providers, skills/plugins, agents/runs, approvals, files, and unsupported-action messaging.

## Tests

The first implementation slice includes focused tests for the central descriptor and explicit backend dispatch paths. Future backend work should preserve and extend coverage for:

- descriptor lookup for `wednesdayai`, `openclaw`, `hermes`, and retained `youmind`;
- `isGatewayBackendKind('wednesdayai')`;
- default backend resolution for new configs after the migration rule is chosen;
- legacy backend resolution for `mode: 'hermes'` and Hermes bridge config;
- transport resolution for `local`, `relay`, `tailscale`, `cloudflare`, and `custom`;
- confirmation that `wednesdayai` is not accepted by `isGatewayTransportKind`;
- legacy `GatewayMode` compatibility without adding new product transport modes;
- `selectByBackend` behaviour for WednesdayAI, OpenClaw, Hermes, and retained YouMind;
- capability metadata that hides/disables unsupported backend actions instead of letting UI requests fail at runtime.

## STOP conditions for implementation

- Stop if the implementation would add `wednesdayai` to `GatewayTransportKind` or treat WednesdayAI as a connection route.
- Stop if OpenClaw or Hermes compatibility would be removed without a scoped migration and tests.
- Stop if YouMind is retained or removed implicitly without a disposition task.
- Stop if UI screens need backend-specific branches before backend descriptors and operation helpers exist.
- Stop if defaulting saved configs to `wednesdayai` would break existing OpenClaw or Hermes saved connections.
- Stop if implementation requires modifying external WednesdayAI-core, OpenClaw, or Hermes repositories.
