# T4 Round 1 — Adversarial Code Review (opencode panelist)

Read-only review of the T3 remediation diff. Findings below are cited against the
real repository contents.

## Issue 1: Duplicate "Models" heading in the youmind ModelsScreen body
File: apps/mobile/src/screens/ConsoleScreen/ModelsScreen.tsx:74,119
Severity: medium
Category: regression

The screen sets the native-stack modal header title to `t('Models')` (line 74,
via `useNativeStackModalHeader`). The new youmind `EmptyState` branch (lines
117-122) renders `title={t('Models')}` as the body title too. The user therefore
sees the word "Models" twice in immediate succession: once in the top
navigation bar and again as the large centered `EmptyState` title directly
beneath it, with only the subtitle ("Model selection is not available for this
backend.") providing new information.

`EmptyState` renders its `title` at `FontSize.base` + `FontWeight.semibold`
(`src/components/ui/EmptyState.tsx:43-46`), so the body title is visually
prominent and reads as a deliberate heading, not a caption. The redundancy is
not accidental from i18n fallback either — the `"Models"` key resolves to
"Models" / "模型" in every locale (en/zh-Hans/ja/ko/de/es console.json), so the
duplication reproduces in all six languages.

The fix should either drop the `title` prop on the youmind `EmptyState` (the
header already carries the page title) and rely on `subtitle` alone, or use a
distinct body title (e.g. an existing key like `"No models available"` /
`"Unavailable"`) so the two headings are not identical strings.

Verification of the EmptyState props API: `EmptyState` accepts `icon?, title,
subtitle?, actionLabel?, onAction?` (EmptyState.tsx:6-12). The call site passes
only `title` and `subtitle`, so the props themselves are type-correct — the
defect is the *content* of `title`, not the prop usage.

## Issue 2: Subset test lacks an empty-set guard
File: apps/mobile/src/services/gateway.test.ts:2199-2204
Severity: low
Category: test-quality

The test `HERMES_BRIDGE_RETRY_METHODS ⊆ shouldTraceRequest` iterates
`retryMethods` and asserts `(client as any).shouldTraceRequest(method)` is true
for each. There is no `expect.hasAssertions()` and no size check on the Set
before the loop. If `HERMES_BRIDGE_RETRY_METHODS` were ever accidentally emptied
(or its members renamed so the Set literal contained zero entries), the
`for...of` body would execute zero times, the test would register zero
assertions, and Jest would still report the test as passing — the invariant
under test would silently disappear.

Jest does not fail on zero assertions unless `expect.hasAssertions()` /
`expect.assertions(N)` is declared. Adding `expect.hasAssertions()` at the top
of the test (or an explicit `expect(retryMethods.size).toBeGreaterThan(0)`)
would make a regression to an empty Set fail loudly instead of vacuously
passing.

The subset relationship itself is currently correct: `HERMES_BRIDGE_RETRY_METHODS`
(gateway.ts:174-188) contains 13 methods, all of which appear in the
`shouldTraceRequest` switch (gateway.ts:2776-2796). `shouldTraceRequest` has one
extra case (`connect`) that is intentionally not retryable, so subset (not
equality) is the right invariant — the test design is correct, it just needs
the guard.

## Checks that came up clean

- Fix 1 (deriveBaseUrl catch collapse, gateway-backend-operations.ts:287-301):
  the collapse is correct. `new URL()` throws only for missing/invalid scheme
  or malformed host; stripping query/hash/pathname cannot repair either
  failure, and the `ws(s?)://` → `http$1://` scheme swap is applied before the
  first parse in the try block. Any input that fails the try parse also fails
  a tail-stripped retry, so `return null` is equivalent to the old nested
  re-validation. No input class regresses.

- Fix 3 retry path coverage: the `config.get` retry test (lines 2154-2177)
  spies `sendRequest` (the inner transport) and drives through the public
  `client.request` → `sendBackendRequest` → `sendRequestWithHermesBridgeRetry`
  chain (gateway.ts:1059, 1381-1385), with `backendKind:'hermes'` and
  `activeRoute='relay'` set so `isHermesRelayBridgeRetryEligible` returns true.
  The retry genuinely exercises the wrapper.

- Fix 3 agents.files.get exclusion (lines 2179-2197): `agents.files.get` is not
  a member of `HERMES_BRIDGE_RETRY_METHODS` (only `agents.files.list` is), so
  `retryable` is false, `delays=[]`, the loop body throws on the first error,
  and `sendRequest` is called exactly once. Correct.

- i18n key coverage: `"Model selection is not available for this backend."`
  exists in all six locale console.json files (en, zh-Hans, ja, ko, de, es).
  `"Models"` exists in all six as well. No orphans.