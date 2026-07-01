I could not write `/Users/david/Code/WednesdayAI-mobile/.claude/worktrees/bridge-cse_017t4jHHDgStaaKTBnmEp4gm/.agents/reports/2026-06-29-T2R3-codex-reviews-opencode.md` because this session is read-only and the user also instructed not to modify repository state. Report content:

```markdown
# T2 R3 — Codex Review of OpenCode R2 Remediations

## REVIEW-1: REMEDIATION-1 — Stub global URL for GLM52-4 catch path
**Verdict**: SURVIVES
**Steal Claim**: NO
**Confidence**: Medium

### Analysis
The proposed spy is invasive but mechanically viable in this checkout. Jest runs in `testEnvironment: 'node'` with `ts-jest` diagnostics disabled (`apps/mobile/jest.config.cjs`), and Node exposes `global.URL` as writable/configurable. `deriveBaseUrl` calls the unqualified `new URL(...)` at `apps/mobile/src/services/gateway-backend-operations.ts:290` and again only in catch guard 2 at line 307. For the proposed input, forcing call 1 to throw routes to catch; catch computes `stripped`, validates it with call 2, and returns.

### Verdict reasoning
The fragility is real: a global constructor spy could catch unrelated `new URL()` calls, and `callCount === 2` is white-box. But the test body is synchronous and narrow, so no concrete repo-backed intervening call defeats it. It is stronger than accepting the current test, which still runs the try path because `host.invalid` parses successfully.

## REVIEW-2: REMEDIATION-2 — Remove `agents.files.get` from Hermes retry set
**Verdict**: SURVIVES
**Steal Claim**: NO
**Confidence**: High

### Analysis
The staleness concern is valid. `getAgentFile` returns `result.file` with no version/hash (`gateway-backend-operations.ts:186-194`), and `setAgentFile` sends only `{ agentId, name, content }` (`:195-198`). The editor flow reads content into local `originalContent` and later writes the edited content (`FileEditorView.tsx:57-64`, `:84-90`); `AgentUserInfoScreen` has the same read/write shape (`:106-114`, `:185-190`).

### Verdict reasoning
Removing retry does hurt pure display/search/preview flows: search cache loading swallows failed `getAgentFile` calls (`FileListView.tsx:195-203`), and heartbeat preview falls back to null (`HeartbeatSettingsScreen.tsx:238-248`). But that does not defeat the proposal because the write path has no server-side base protection. OpenCode’s distinction from `config.get` is accurate: config reads return `hash` and config writes pass `baseHash` (`gateway-backend-operations.ts:106-114`, `:152-169`).

## REVIEW-3: REMEDIATION-3 — Comment on `tools.catalog` newer-on-retry
**Verdict**: SURVIVES
**Steal Claim**: NO
**Confidence**: High

### Analysis
`fetchToolsCatalog` is a read-only catalog fetch that dispatches `tools.catalog` with `{ agentId, includePlugins: true }` and returns the result or an empty catalog (`gateway-backend-operations.ts:176-179`). I found no downstream write based on a catalog base token comparable to file content editing.

### Verdict reasoning
A comment-only remediation is limited, but the underlying conclusion survives: newer-on-retry is a display freshness issue, not an edit-base corruption issue.

## REVIEW-4: REMEDIATION-4 — Comment on rethrow stack preservation
**Verdict**: SURVIVES
**Steal Claim**: NO
**Confidence**: Medium

### Analysis
`sendRequestWithHermesBridgeRetry` rethrows the same caught object with `throw error` or `throw lastError` for `Error` instances (`gateway.ts:1376-1388`). That preserves object identity; ordinary JS engines do not allocate a new stack for the same `Error` object on rethrow.

### Verdict reasoning
The comment is a reasonable clarification. The only caveat is non-`Error` rejections, which are wrapped at the unreachable fallback line 1388, but OpenCode already calls that out.

## REVIEW-5: REMEDIATION-5 — Comment on Hermes-only retry eligibility
**Verdict**: PARTIAL-DEFEAT
**Steal Claim**: NO
**Confidence**: Medium

### Analysis
The core behavior is correct: retry eligibility requires `getBackendKind() === 'hermes'`, `activeRoute === 'relay'`, and method membership (`gateway.ts:1391-1395`). Non-Hermes calls therefore run with `delays = []` and only one send attempt (`:1371-1384`).

### Verdict reasoning
The proposed comment overclaims that “chat.send / chat.abort bypass this wrapper entirely” without the user-provided anchors proving that call-chain. The retry guard itself survives, but the remediation’s extra explanatory claim is not fully supported by the cited code slice. Keep the backend/route/set explanation; drop or separately prove the chat bypass claim.

## REVIEW-6: REMEDIATION-6 — Behavioral assertions for Hermes identity test
**Verdict**: SURVIVES
**Steal Claim**: NO
**Confidence**: High

### Analysis
The proposed expectations are correct. OpenClaw uses `/\/ws\/?$/` (`gateway-backend-operations.ts:237-242`), so `wss://host/v1/hermes/ws` becomes `https://host/v1/hermes`. Hermes uses `/\/v1\/hermes\/ws\/?$/` (`:245-264`), so the same URL strips to `https://host`.

### Verdict reasoning
There is redundancy with the existing dedicated behavior test at `gateway-backend-operations.test.ts:81-89`, which already asserts the same discriminating behavior for WednesdayAI/Hermes. But adding the checks to the identity test makes that test’s local claim true and would catch a wrong new Hermes override with a distinct function reference.
```

