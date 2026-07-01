---
id: "002"
phase: 1
title: Add WEDNESDAYAI_OPERATIONS constant and update getGatewayBackendOperations dispatch
status: ready
depends_on: ["001"]
parallel: false
conflicts_with: []
files:
  - apps/mobile/src/services/gateway-backend-operations.ts
irreversible: false
scope_test: "apps/mobile/src/services/gateway-backend-operations.test.ts"
allowed_change: edit
covers_criteria: [SC3, SC4, SC5]
---
## Failing test (write first)

N/A — test written in task 001. After task 001, the test
`'returns a WednesdayAI-specific operations object distinct from the OpenClaw operations'`
in `apps/mobile/src/services/gateway-backend-operations.test.ts` is already failing.
This task makes it pass.

## Change

- **File:** `apps/mobile/src/services/gateway-backend-operations.ts`
- **Anchor:** `getGatewayBackendOperations` function and the blank line before it (lines 246–252)
- **Before:** (exact text — copy-paste-able)

```javascript
};

export function getGatewayBackendOperations(config: GatewayConfig | null): GatewayBackendOperations {
  return resolveGatewayBackendKind(config) === 'hermes'
    ? HERMES_OPERATIONS
    : OPENCLAW_OPERATIONS;
}
```

- **After:**

```javascript
};

const WEDNESDAYAI_OPERATIONS: GatewayBackendOperations = {
  ...OPENCLAW_OPERATIONS,
};

export function getGatewayBackendOperations(config: GatewayConfig | null): GatewayBackendOperations {
  const kind = resolveGatewayBackendKind(config);
  if (kind === 'hermes') return HERMES_OPERATIONS;
  if (kind === 'wednesdayai') return WEDNESDAYAI_OPERATIONS;
  return OPENCLAW_OPERATIONS;
}
```

The `};` line on the first line is the closing brace of `HERMES_OPERATIONS`. It must remain as-is — it is the anchor that makes the Before text unique in the file.

## Allowed moves

Edit `apps/mobile/src/services/gateway-backend-operations.ts` only at the anchor
described above. No imports, no other functions, no exports, no types may be changed.
`WEDNESDAYAI_OPERATIONS` must NOT be exported — it is internal to the module; the
public surface is `getGatewayBackendOperations` only.

## STOP triggers

- The `};` anchor line is not at line 246 — re-read the file and locate the actual line before making the edit.
- Any other function in the file needs editing — stop, this task is too broad.
- `OPENCLAW_OPERATIONS` is not in scope at the insertion point (it would be if you accidentally placed `WEDNESDAYAI_OPERATIONS` before `OPENCLAW_OPERATIONS`) — stop, placement is wrong.
- Test suite has failures OTHER than the expected pre-existing test failures from task 001 — stop, investigate.

## Done when

`WAI_TYPECHECK_CMD="cd apps/mobile && npm run typecheck" WAI_TEST_CMD="cd apps/mobile && npx jest --testPathPatterns=gateway-backend-operations.test --no-coverage" bash ~/.claude/wai/scripts/task-gate.sh backend-descriptor 002` exits 0 with all 4 tests in `gateway-backend-operations.test.ts` passing.
