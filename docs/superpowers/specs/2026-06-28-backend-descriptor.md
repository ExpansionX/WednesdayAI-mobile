---
doc_type: spec
status: active
workstream: backend-descriptor
change_kind: behaviour
---

# WednesdayAI Backend Descriptor — Phase 2

**Date:** 2026-06-28
**Status:** active, design settled against the governing architecture doc
**Author:** David Rudduck (via agent)

## Intent (what / why)

Phase 1 shipped a minimal `wednesdayai` descriptor in `gateway-backends.ts` with an
OpenClaw-compatible capability baseline, explicit backend dispatch helpers, and a test
suite covering the core resolution and dispatch paths.

Phase 2 closes the remaining gaps called out in
`docs/architecture/wednesdayai-backend-descriptor-plan.md`:

1. Make the YouMind disposition explicit — retain as a named compatibility descriptor
   with documented supported/unsupported surfaces, rather than leaving it as an
   implicit fallback.
2. Add an explicit `WEDNESDAYAI_OPERATIONS` constant to `gateway-backend-operations.ts`
   so WednesdayAI has its own named operations path (currently it falls through to
   `OPENCLAW_OPERATIONS` silently).
3. Fill the test gaps: `getGatewayBackendDescriptor('youmind')`, `selectByBackend` for
   YouMind, and `getGatewayBackendOperations` for WednesdayAI.

The governing rules are in `docs/architecture/backend-transport.md` (backend ≠ transport,
`wednesdayai` is the primary product identity) and `CLAUDE.md` (OpenClaw + Hermes
non-regression).

## Users / who is affected

- **WednesdayAI Mobile app** — all screens that read backend descriptors or call
  `getGatewayBackendOperations` get an explicit, named WednesdayAI operations object
  instead of a silent OpenClaw proxy.
- **YouMind compatibility users** — YouMind descriptor is retained deliberately;
  behavior is unchanged but the disposition is now a documented decision, not an
  accident.
- **Future backend work** — every new screen or service that calls into the backend
  registry gets a complete, tested foundation to build on.

## Success criteria

- SC1: `getGatewayBackendDescriptor('youmind')` returns a descriptor whose `kind` is
  `'youmind'` and whose `label` is `'YouMind'`.
- SC2: `selectByBackend('youmind', { wednesdayai, openclaw, hermes, youmind })` returns
  the explicit `youmind` branch value, not the `openclaw` fallback, when `youmind` is
  provided.
- SC3: `getGatewayBackendOperations` called with a WednesdayAI config returns an
  operations object whose `usesConnectHandshake` is `true` (OpenClaw-compatible baseline)
  and that is structurally distinct from `OPENCLAW_OPERATIONS` (i.e. `WEDNESDAYAI_OPERATIONS`
  is an explicit named constant, not the same reference).
- SC4: `npm run typecheck` passes for the mobile workspace with no new errors.
- SC5: `npm run test` passes for the mobile workspace with all new and existing tests
  green.

## Approach

1. Add `WEDNESDAYAI_OPERATIONS` to `apps/mobile/src/services/gateway-backend-operations.ts`:
   spread `OPENCLAW_OPERATIONS` and export the constant. Update `getGatewayBackendOperations`
   to return it for WednesdayAI configs.
2. Extend `apps/mobile/src/services/gateway-backends.test.ts` with:
   - YouMind descriptor test via `getGatewayBackendDescriptor`.
   - YouMind explicit branch test via `selectByBackend`.
   - WednesdayAI operations test via `getGatewayBackendOperations`.
3. Document the YouMind retain-as-compatibility disposition in the workstream as a
   follow-up finding (not a new WAI task — no code change required).

## Design

### gateway-backend-operations.ts changes

```ts
const WEDNESDAYAI_OPERATIONS: GatewayBackendOperations = {
  ...OPENCLAW_OPERATIONS,
  // WednesdayAI uses the OpenClaw-compatible baseline for Phase 2.
  // Adjust individual methods only after real WednesdayAI gateway
  // differences are confirmed.
};

export function getGatewayBackendOperations(config: GatewayConfig | null): GatewayBackendOperations {
  const kind = resolveGatewayBackendKind(config);
  if (kind === 'hermes') return HERMES_OPERATIONS;
  if (kind === 'wednesdayai') return WEDNESDAYAI_OPERATIONS;
  return OPENCLAW_OPERATIONS;
}
```

### New test cases

```ts
describe('getGatewayBackendOperations', () => {
  it('returns WEDNESDAYAI_OPERATIONS for wednesdayai config', () => {
    const ops = getGatewayBackendOperations({ backendKind: 'wednesdayai' } as any);
    expect(ops.usesConnectHandshake).toBe(true);
  });

  it('returns HERMES_OPERATIONS for hermes config', () => {
    const ops = getGatewayBackendOperations({ backendKind: 'hermes' } as any);
    expect(ops.usesConnectHandshake).toBe(false);
  });
});

describe('getGatewayBackendDescriptor — youmind', () => {
  it('returns the YouMind descriptor for the youmind kind', () => {
    const d = getGatewayBackendDescriptor('youmind');
    expect(d.kind).toBe('youmind');
    expect(d.label).toBe('YouMind');
  });
});

// In the selectByBackend describe block:
it('returns the explicit youmind branch when youmind option is provided', () => {
  expect(
    selectByBackend('youmind', { wednesdayai: 'W', openclaw: 'A', hermes: 'B', youmind: 'Y' })
  ).toBe('Y');
});
```

### YouMind disposition

YouMind is **retained as a named compatibility descriptor** in `GatewayBackendKind`,
`BACKENDS`, `YOUMIND_CAPABILITIES`, and `selectByBackend`. No behavior changes.
The decision is: retain for compatibility until a deliberate scoped-removal task
is created. A follow-up finding records this decision and sets the trigger condition
for the removal task (when YouMind saved configs drop below N% in telemetry).

## Decisions

- No irreversible decisions are made in this slice. YouMind retention is a
  compatibility hold, not a removal.

## Anchors

- `apps/mobile/src/services/gateway-backend-operations.ts`
- `apps/mobile/src/services/gateway-backends.test.ts`
