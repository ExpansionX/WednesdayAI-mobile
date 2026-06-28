---
id: "001"
phase: 1
title: Create gateway-backend-operations.test.ts with failing wednesdayai reference-inequality test
status: ready
depends_on: []
parallel: false
conflicts_with: ["002"]
files:
  - apps/mobile/src/services/gateway-backend-operations.test.ts
irreversible: false
scope_test: "apps/mobile/src/services/gateway-backend-operations.test.ts"
allowed_change: create
covers_criteria: [SC3]
---
## Failing test (write first)

This task IS the failing test. Create
`apps/mobile/src/services/gateway-backend-operations.test.ts` with the content
in the Change section. The first test — `'returns a WednesdayAI-specific operations
object distinct from the OpenClaw operations'` — FAILS on current code because
`getGatewayBackendOperations` dispatches wednesdayai to `OPENCLAW_OPERATIONS` (the
same constant reference openclaw gets), violating `.not.toBe(openclawOps)`.

The three remaining tests (`usesConnectHandshake` checks) will pass immediately
and act as non-regression guards.

Sibling: `apps/mobile/src/services/gateway-backends.test.ts` is the established
pattern for this services directory. Read it. Note its import style (named imports
from relative path, `as any` casts for partial config objects), describe/it nesting
depth, and the absence of beforeEach/afterEach. The new test file must follow the
same conventions; any divergence must be recorded in the decisions-ledger.

## Change

- **File:** `apps/mobile/src/services/gateway-backend-operations.test.ts`
- **Anchor:** new file — does not exist in the current tree
- **Before:** *(absent)*
- **After:** create with exactly:

```python
import { getGatewayBackendOperations } from './gateway-backend-operations';
import type { GatewayConfig } from '../types';

describe('gateway-backend-operations', () => {
  describe('getGatewayBackendOperations', () => {
    it('returns a WednesdayAI-specific operations object distinct from the OpenClaw operations', () => {
      const wednesdayaiOps = getGatewayBackendOperations({ backendKind: 'wednesdayai' } as GatewayConfig);
      const openclawOps = getGatewayBackendOperations({ backendKind: 'openclaw' } as GatewayConfig);
      expect(wednesdayaiOps).not.toBe(openclawOps);
    });

    it('returns usesConnectHandshake true for WednesdayAI (OpenClaw-compatible baseline)', () => {
      const ops = getGatewayBackendOperations({ backendKind: 'wednesdayai' } as GatewayConfig);
      expect(ops.usesConnectHandshake).toBe(true);
    });

    it('returns usesConnectHandshake false for Hermes', () => {
      const ops = getGatewayBackendOperations({ backendKind: 'hermes' } as GatewayConfig);
      expect(ops.usesConnectHandshake).toBe(false);
    });

    it('returns usesConnectHandshake true for OpenClaw', () => {
      const ops = getGatewayBackendOperations({ backendKind: 'openclaw' } as GatewayConfig);
      expect(ops.usesConnectHandshake).toBe(true);
    });
  });
});
```

## Allowed moves

Create `apps/mobile/src/services/gateway-backend-operations.test.ts` with the
exact content above. No other file may be touched.

## STOP triggers

- `gateway-backend-operations.test.ts` already exists — stop, re-read its content, reconcile with the executor before proceeding.
- Any change to `gateway-backend-operations.ts` — belongs in task 002, not this task.
- Any additional test cases beyond the four listed — stop, don't add them.

## Done when

After creating the file, the executor verifies:
1. `cd apps/mobile && npm run typecheck` passes (file compiles).
2. `cd apps/mobile && npx jest --testPathPattern=gateway-backend-operations.test --no-coverage` runs 4 tests; exactly 1 fails (`'returns a WednesdayAI-specific operations object distinct from the OpenClaw operations'`). Record this expected failure in the decisions-ledger before moving to task 002.

`WAI_TYPECHECK_CMD="cd apps/mobile && npm run typecheck" WAI_TEST_CMD="cd apps/mobile && npx jest --testPathPattern=gateway-backend-operations.test --no-coverage 2>&1 | grep -E 'Tests:|FAIL|PASS'" bash ~/.claude/wai/scripts/task-gate.sh backend-descriptor 001` exits 0 on the typecheck; the test failure is acceptable at this stage and is the TDD driver for task 002.
