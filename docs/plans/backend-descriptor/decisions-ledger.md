# Decisions Ledger: backend-descriptor

The executor appends dated rows here when a task requires a choice not already locked by the spec or task file.

| id | task | decision | rationale |
|----|------|----------|-----------|
| D0 | decompose | `agent-avatar.test.ts` is not a pattern sibling for `gateway-backend-operations.test.ts`. | `agent-avatar.test.ts` uses `jest.mock` to intercept native Expo modules (`expo-image-picker`). `gateway-backend-operations.ts` is a pure function module with no external dependencies or native calls; no mock setup is needed. The structural divergence (no `jest.mock` block) is correct and intentional. |
| D1 | decompose | YouMind retained as a named compatibility descriptor. | YouMind is already present in `GatewayBackendKind`, `BACKENDS`, `YOUMIND_CAPABILITIES`, and `selectByBackend`. The Phase 2 decomposition treats this as "retain-as-compatibility" without a code change, consistent with the prior D17 decision in the wednesdayai-mobile-init ledger. A scoped removal task should be created when YouMind saved-config telemetry warrants it. |
| D2 | decompose | `WEDNESDAYAI_OPERATIONS` is not exported from `gateway-backend-operations.ts`. | The public surface is `getGatewayBackendOperations`; exposing the constant would let callers bypass the dispatch and couple to the internal object. The reference-inequality test (task 001/002) proves distinctness by calling through the public function, not by comparing exported constants. |
