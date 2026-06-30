# T5 Adversarial Review — Round 1: Codex Issue Finding

| Severity | File / Location | Issue | Why this matters |
|---|---|---|---|
| low | `apps/mobile/src/services/gateway.test.ts`, `HERMES_BRIDGE_RETRY_METHODS ⊆ shouldTraceRequest` test | Test couples directly to a private static implementation detail instead of exercising observable retry/trace behavior | The cast bypasses TypeScript privacy and locks the test to the internal name and storage shape of `HERMES_BRIDGE_RETRY_METHODS`. A refactor that preserves behavior but moves the set, derives it, or replaces it with capability metadata would break the test without a product regression. The test only proves `shouldTraceRequest(method)` returns `true`; it does not prove those methods are retried correctly. |
| low | `apps/mobile/src/services/gateway.test.ts`, `config.get` retry test | Retry coverage only proves a single retry, not the full two-attempt policy | Production defines `HERMES_BRIDGE_UNAVAILABLE_RETRY_DELAYS_MS = [750, 750]` (two retries), but the test rejects once then resolves. This verifies `config.get` is eligible for the first retry, but leaves the second retry delay uncovered. A bug that broke the second retry would not be caught. |

## Justification

The `ModelsScreen.tsx` change is not provably incorrect. The dispatch map explicitly includes `youmind`, and the new UI renders a valid `EmptyState` with string props matching the component interface. The added subtitle key is present in all six locale files with proper translations.

The `deriveBaseUrl` simplification is also not provably wrong from the supplied code alone. Without a concrete URL string that the previous fallback accepted and the new implementation rejects, it cannot be classified as a regression.

No critical, high, or medium severity issues found.
