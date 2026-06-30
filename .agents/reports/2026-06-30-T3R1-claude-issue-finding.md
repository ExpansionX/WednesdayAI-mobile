# T3 Round 1 — Claude CLI (Opus 4.8): Issue Finding

**Executor**: Claude Code CLI (`claude-opus-4-8`, effort=medium)
**Diff range**: `main..HEAD` (code files only)
**Date**: 2026-06-30

## Issue 1: `deriveBaseUrl` catch-path tests validate nothing

**File**: `apps/mobile/src/services/gateway-backend-operations.test.ts:153-167`
**Severity**: low
**Category**: test-quality

**Finding**: The `catch` branch of `deriveBaseUrl`
(`gateway-backend-operations.ts:295-312`) can never return a non-null value in
the test environment. `new URL()` throws only on a malformed scheme/host/port.
The only pre-host transform (`ws→http` scheme swap) is identical in both the try
and catch branches, and none of the catch-specific strips (`split('?')`,
`split('#')`, `$`-anchored `wsPathPattern` replacement, trailing-slash removal)
can reach the host to make it parseable. So `try-throws ⟺ Guard-2-throws` →
the catch always returns `null`. The two "catch path" tests at lines 153–167 only
assert `toBeNull()`, meaning they would pass unchanged against a trivially
simplified `catch { return null }` body. They pin nothing about the actual
stripping logic in the catch branch.

**Evidence**:
- `gateway-backend-operations.ts:295-312` — catch branch: strip query, strip
  hash, replace `wsPathPattern`, strip trailing slash, then `new URL(stripped)`.
  Any URL that fails the outer `new URL(urlText)` has a defect in
  scheme/host/port that also fails the inner guard.
- `gateway-backend-operations.test.ts:153-160` — `'GEMINI-3: bare ws:// returns null'`
  asserts `toBeNull()`.
- `gateway-backend-operations.test.ts:162-167` — `'catch path → null (malformed host)'`
  asserts `toBeNull()`.

**Proposed remediation**: Either:
(a) collapse the catch to `return null` and keep the two tests as a contract
guard (honest: the tests document the invariant "malformed always returns null"),
or
(b) add a test that can exercise the non-null path through the catch — which
requires a URL implementation where `new URL('ws://bad')` throws but
`new URL('http://bad')` succeeds. If no such environment exists (RN Hermes URL
is stricter than node's), option (a) is correct and the stripping code in catch
is dead.

## Verified clean (no bug)

- Retry-set ↔ `shouldTraceRequest` parity holds (trace = retry ∪ {connect});
  `agents.files.get` and all write methods correctly excluded from auto-retry.
- `fetchUsage` / `fetchCostSummary` field mapping is complete (7/7 and 5/5
  params); no truncation.
- `ModelsScreen` YouMind branch equals the previous `youmind ?? openclaw`
  runtime fallback — no behavioral regression.
- `WEDNESDAYAI_OPERATIONS` / `YOUMIND_OPERATIONS` objects are module-private;
  new distinct object identity is safe.
