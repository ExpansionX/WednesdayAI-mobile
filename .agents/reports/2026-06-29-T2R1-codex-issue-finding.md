I did not write `/Users/david/Code/WednesdayAI-mobile/.claude/worktrees/bridge-cse_017t4jHHDgStaaKTBnmEp4gm/.agents/reports/2026-06-29-T2R1-codex-issue-finding.md` because the request also said not to modify files and the sandbox is read-only. Report content:

```markdown
## ISSUE-1: GLM52-4 regression test does not exercise the catch path it claims
**Severity**: Low
**Location**: apps/mobile/src/services/gateway-backend-operations.test.ts:101
**[STEAL-ELIGIBLE]**
**Description**: The GLM52-4 test says it forces the `deriveBaseUrl` catch path and pins catch-path query stripping, but the input URL is syntactically valid. `deriveBaseUrl` parses it in the try path, strips `url.search`, strips the pathname, and returns successfully. This leaves the intended catch-path regression untested.
**Evidence**: The implementation enters the try path with `new URL(...)`, clears `url.search`, rewrites `url.pathname`, and returns at lines 289-294. The catch-path split/strip logic is only at lines 295-310. The test claims “force the catch path” at lines 101-108 while using `ws://host.invalid/v1/hermes/ws?token=abc`. A direct Node probe confirmed that URL parses: `PARSES http://host.invalid/v1/hermes/ws?token=abc`.
**Impact**: A future regression in the catch-path ordering, such as applying `wsPathPattern` before stripping `?token=abc`, would not be caught by this “GLM52-4 regression” test. The production code may currently be correct, but the remediation’s claimed coverage is false.
```

No additional confirmed issues found in the reviewed scope. The retry path is gated by `backendKind === 'hermes'`, `activeRoute === 'relay'`, and membership in `HERMES_BRIDGE_RETRY_METHODS`; the mutating shared operations I checked (`model.set`, `config.patch`, `config.set`, `agents.files.set`) are not in that set.

