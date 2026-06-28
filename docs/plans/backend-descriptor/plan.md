# Plan: backend-descriptor Phase 2

## Approach

The first slice shipped a complete `wednesdayai` backend descriptor, all capability
metadata, all dispatch helpers, and comprehensive test coverage. Two gaps remain:

1. `gateway-backend-operations.ts` has no `WEDNESDAYAI_OPERATIONS` constant —
   WednesdayAI silently falls through to `OPENCLAW_OPERATIONS` instead of having
   its own named object. Future maintainers cannot add WednesdayAI-specific
   operation overrides without first introducing the constant.

2. `gateway-backends.test.ts` is missing explicit coverage for `getGatewayBackendDescriptor('youmind')`
   and `selectByBackend` called with an explicit `youmind` branch value. The
   implementation already handles these cases correctly; the tests close the
   coverage gap the plan identifies.

The phases proceed TDD-first: write the reference-inequality failing test (Phase 1),
make it pass by adding `WEDNESDAYAI_OPERATIONS` (Phase 1), then add the youmind
coverage tests which exercise already-working code (Phase 2).

## Phases

1. **phase-1-operations-wednesdayai-explicit** — add `WEDNESDAYAI_OPERATIONS` to
   `gateway-backend-operations.ts` with TDD (failing test → implementation).
2. **phase-2-youmind-coverage-gaps** — fill the `youmind` descriptor and
   `selectByBackend` coverage gaps in `gateway-backends.test.ts`.

## Task order

| id | title | phase | deps/conflicts |
|----|-------|-------|----------------|
| 001 | Create gateway-backend-operations.test.ts with failing wednesdayai reference-inequality test | 1 | dep: - | conflicts: 002 |
| 002 | Add WEDNESDAYAI_OPERATIONS constant and update getGatewayBackendOperations dispatch | 1 | dep: 001 | conflicts: 001 |
| 003 | Fill youmind coverage gaps in gateway-backends.test.ts (descriptor + selectByBackend) | 2 | dep: 002 | conflicts: none |

## Execute notes

- Do not edit the frozen spec during execution. If the spec is wrong, stop and re-run `/wai:precheck` deliberately after a human-approved spec change.
- `WEDNESDAYAI_OPERATIONS` must not be exported from `gateway-backend-operations.ts`; public surface is `getGatewayBackendOperations` only.
- Record any content or sequencing decision not dictated by a task in `docs/plans/backend-descriptor/decisions-ledger.md`.
- Sibling advisory (task 001): `agent-avatar.test.ts` is an established test sibling in the same directory. It uses `jest.mock` because it mocks native Expo modules. `gateway-backend-operations.ts` is a pure function module with no external dependencies; no mock is needed. This divergence is deliberate and recorded in the decisions-ledger.
