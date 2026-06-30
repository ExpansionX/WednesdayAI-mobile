# T5 Adversarial Review — Round 2: Claude Remediation Proposals

You are the Claude panelist in Round 2 of the T5 adversarial tournament. In Round 1 you found 4
issues. Now propose working remediations for each. Read-only for research; do NOT run shell commands.

## Your Round 1 findings to remediate

### C1 — `deriveBaseUrl` catch comment references deleted code
**Location:** `apps/mobile/src/services/gateway-backend-operations.ts:295-299`

Current code:
```typescript
} catch {
  // Any URL malformed enough to fail new URL() in the try path also fails the nested
  // new URL() guard — the scheme swap is identical in both branches and stripping
  // query/hash/path cannot fix a bad host. This path always returns null.
  return null;
}
```

The comment mentions "the nested `new URL()` guard" and "both branches" — these were parts of the
OLD catch body that no longer exist in the simplified code. A reader of the current file sees a
comment describing deleted structure.

### C2 — `agents.files.get`/`agents.files.list` retry asymmetry
**Location:** `apps/mobile/src/services/gateway.ts:174-188` (HERMES_BRIDGE_RETRY_METHODS set)

`agents.files.get` is excluded from the retry set. `agents.files.list` is included. Both are reads.
The test labels the exclusion "read-modify-write exclusion" but the write side (`setAgentFile`) is
the concern, not the get. The asymmetry looks arbitrary from the comment alone.

**NOTE:** Before proposing a remediation, read `gateway.ts` lines 148-172 to understand the actual
documented rationale. Make sure your proposal is informed by what the code actually says.

### C3 — Test 2 calls `request()` directly instead of public `getAgentFile()` API
**Location:** `apps/mobile/src/services/gateway.test.ts:2179-2197`

The test `'does NOT retry agents.files.get on [BRIDGE_UNAVAILABLE] — read-modify-write exclusion'`
calls `client.request('agents.files.get', { agentId: 'main', name: 'plan.md' })` directly.
Production code calls `client.getAgentFile(name, agentId)`. A future refactor that renamed the
wire method would leave this test green while breaking the real exclusion.

### C4 — Hermes relay `agents.files.get` resilience gap
**Location:** Same as C2 (the exclusion decision)

By excluding `agents.files.get` from retry, a transient `[BRIDGE_UNAVAILABLE]` on a Hermes relay
"view file" action surfaces an error to the user, while `agents.files.list` and `config.get`
silently recover. Retrying a pure read is idempotent.

**NOTE:** Before proposing a remediation, verify by reading gateway.ts:155-168 whether this
exclusion is intentional by design or an accidental omission.

## Task

For each finding (C1–C4):
1. State whether the issue is REAL or a FALSE POSITIVE after inspecting the live source
2. If real: propose the exact code change with before/after snippets
3. Explain why your fix is correct and safe (no regressions)
4. If false positive: explain what you found that invalidates the finding

Write your report to `.agents/reports/2026-06-30-T5R2-claude-remediation-proposals.md`.
Use a heading per finding, include code blocks for before/after changes.
