# T5 Adversarial Review — Round 1: Claude Issue Finding

All findings verified against the live source tree.

| # | File / Location | Issue | Severity | Type |
|---|-----------------|-------|----------|------|
| C1 | `gateway-backend-operations.ts:296-298` | Catch-block comment references deleted code — "the nested `new URL()` guard" and "both branches" no longer exist in the simplified function | low | comment accuracy |
| C2 | `gateway.ts:174-188` retry set | `agents.files.get` is excluded under a "read-modify-write exclusion" rationale, yet `agents.files.list` — also a pure read — IS in the retry set. The actual RMW hazard is the write (`setAgentFile`), not the get. The get-vs-list split is internally inconsistent with its own stated reason | low–med | logic/consistency |
| C3 | `gateway.test.ts` (Test 2, "does NOT retry agents.files.get") | Test calls `request('agents.files.get', …)` directly instead of the public `getAgentFile()` API. Wire method string matches, so the assertion pins the current exclusion, but a future refactor that changed `getAgentFile`'s wire method would leave this test green while silently breaking the intended exclusion | low | test rigor |
| C4 | Hermes relay resilience | Excluding `agents.files.get` from the retry set means a transient `[BRIDGE_UNAVAILABLE]` on a Hermes relay "view file" action surfaces an error to the user, while `agents.files.list`, `config.get`, `usage.cost`, etc. silently recover. Retrying a pure read is idempotent and safe; this is a preventable resilience gap | low | regression risk (Hermes UX) |

## Verified Correct (explicitly not flagged)

- **`deriveBaseUrl` simplification is behaviorally equivalent.** `new URL()` throws only on bad scheme/host/port; stripping query/hash/path cannot fix those, and the scheme swap is identical in both branches, so the removed string-recovery branch could never have returned non-null when the `try` path threw.
- **i18n is complete and valid.** All 6 locales have both `"No models available"` (pre-existing) and the new subtitle key with proper translations.
- **youmind EmptyState is capability-consistent.** `YOUMIND_CAPABILITIES` has `modelSelection: false`, `modelCatalog: false`, `configRead: false`. Copy is accurate and the header refresh button (gated on `supportsRuntimeSettings`) is correctly hidden.
- **Test 1 (config.get retry) is correct.** `config.get` ∈ retry set; one rejection + 750ms advance + resolve → 2 `sendRequest` calls.
- **Test 3 (subset invariant) is correct.** All 13 retry methods are present in `shouldTraceRequest`'s switch; the test would fail if any retry method were untraced.

## Justification

**C1 — comment references deleted code.** The new catch body has only `return null` plus a three-line comment. The comment reasons about "the nested `new URL()` guard" and "both branches," but the simplified function has a single `try`/`catch` and no nested guard. The conclusion ("always returns null") is verified correct, but a maintainer reading only the current file sees a comment describing structure that isn't there.

**C2 — get/list retry asymmetry.** `HERMES_BRIDGE_RETRY_METHODS` includes `agents.files.list` (a read) but not `agents.files.get` (also a read). The exclusion is labelled "read-modify-write exclusion" in the adjacent comment (gateway.ts:160-168), but the write side is `agents.files.set` — not in the set, correctly. The rationale doesn't distinguish `get` from `list`. Both are idempotent reads; the split looks accidental, not deliberate.

**C3 — test exercises the wrong layer.** Production reads a file via `getAgentFile()` (gateway.ts:1040-1042 → backend op at :186-189), not via the generic `request()`. The test verifies a hand-written method string is not in the retry set, which is valid for now but not future-proof.

**C4 — Hermes resilience gap.** The retry mechanism exists to recycle stale Hermes bridge sockets on transient `[BRIDGE_UNAVAILABLE]`. Excluding `agents.files.get` leaves a real inconsistency: a "view file" action on Hermes relay can fail on a transient blip while neighboring reads recover silently.
