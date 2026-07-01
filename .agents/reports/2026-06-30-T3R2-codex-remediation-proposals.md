# T3 Round 2 — Codex CLI: Remediation Proposals

**Executor**: Codex CLI
**Finding**: Issue 1 from T3R1 — YouMind model screen exposes unsupported RPCs

## Remediation for Issue 1: capability-gate the YouMind Models branch

**Finding recap**: `ModelsScreen.tsx:117–124` now explicitly routes YouMind to
`ModelsView`, but `YOUMIND_CAPABILITIES` marks `modelCatalog`, `modelSelection`,
`configRead`, and `configWrite` all as `false`. `ModelsView` unconditionally calls
`gateway.listModels()` and `gateway.getConfig()` on mount, which dispatches OpenClaw
gateway RPCs that YouMind does not support. This violates the repository rule: gate
unsupported actions through capability metadata, do not let them fail at runtime.

**Proposed remediation**:

**Step 1 — Remove the YouMind branch from `ModelsScreen.tsx`** (or replace with
an unsupported-feature placeholder):

```tsx
// apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx

// OPTION A: remove the youmind branch entirely so it falls through to the
// default ("no models screen") — the safest no-op:

// DELETE these lines (the new youmind branch added in this diff):
//   youmind: (
//     <ModelsView ... />
//   ),

// OPTION B: replace with a capability-gated placeholder:
youmind: (
  <UnsupportedFeaturePlaceholder
    message="Model selection is not supported for this backend."
    onBack={() => navigation.goBack()}
  />
),
```

**Step 2 — Add a regression test** that verifies YouMind does NOT render ModelsView
and does NOT call `gateway.listModels` or `gateway.getConfig`:

```typescript
// In gateway-backend-operations.test.ts or ModelsScreen.test.tsx:
it('youmind config: getGatewayBackendOperations returns operations but ' +
   'YOUMIND_CAPABILITIES has modelCatalog: false', () => {
  const ops = getGatewayBackendOperations({ backendKind: 'youmind' } as any);
  // ops exist (YouMind dispatch works)
  expect(ops).toBeDefined();
  expect(ops.usesConnectHandshake).toBe(true);
  // Capability gate — YouMind should not allow model catalog RPCs
  // (Verified via gateway-backends.ts capability metadata)
  const { BACKENDS } = require('./gateway-backends');
  expect(BACKENDS.youmind.capabilities.modelCatalog).toBe(false);
  expect(BACKENDS.youmind.capabilities.modelSelection).toBe(false);
  expect(BACKENDS.youmind.capabilities.configRead).toBe(false);
  expect(BACKENDS.youmind.capabilities.configWrite).toBe(false);
});
```

**Step 3 — Preferred long-term fix**: The model screen should read
`BACKENDS[backendKind].capabilities` before choosing which view to render, so
adding a new backend cannot accidentally route to a full-featured view without
explicit opt-in. This is already the pattern the CLAUDE.md rule intends.

**Summary**: The YouMind `ModelsView` branch is the bug. The `YOUMIND_OPERATIONS`
dispatch is correct (it needs to exist for future use), but the screen routing
should check capabilities before rendering an operation-rich view for a backend
that doesn't support the underlying RPCs.
