# T5 Tiebreaker — Claude adjudicates X1 steal dispute

You are Claude serving as neutral tiebreaker in a steal dispute. Read-only analysis only.
Do NOT write code files — write a report only.

## The dispute: X1 — Subset test couples to private static

### Background
Codex found that `gateway.test.ts:2199-2206` accesses the private static
`HERMES_BRIDGE_RETRY_METHODS` via an `as unknown as` cast. If the set is renamed, the cast
would return `undefined` and the test would fail (or break at runtime).

`shouldTraceRequest` is also accessed via `(client as any)`.

### Codex's R2 fix
Replace the private-cast dynamic loop with `it.each([...])` hardcoding all 13 methods:
```typescript
it.each([
  'sessions.list', 'chat.history', 'last-heartbeat', 'models.list',
  'model.current', 'model.get', 'agents.list', 'agent.identity.get',
  'sessions.usage', 'usage.cost', 'config.get', 'tools.catalog',
  'agents.files.list',
])('traces Hermes relay retryable read method %s', (method) => {
  expect((client as any).shouldTraceRequest(method)).toBe(true);
});
```

### OpenCode's R3 steal challenge
OpenCode says Codex's fix is VALID+FLAWED because:
1. **Trades rename-fragility for addition drift** — when a 14th method is added to `HERMES_BRIDGE_RETRY_METHODS`, the hardcoded list goes stale silently (the new method is never checked)
2. **Changes the invariant** — from "HERMES_BRIDGE_RETRY_METHODS ⊆ shouldTraceRequest" to "these 13 specific strings return true from shouldTraceRequest" — weaker than the original subset property
3. **Still uses `(client as any).shouldTraceRequest`** — the private-cast problem is only half-solved

OpenCode's steal fix:
```typescript
// gateway.ts — export both as module-level constants
export const HERMES_BRIDGE_RETRY_METHODS = new Set<string>([/* 13 methods */]);
export const HERMES_BRIDGE_TRACED_METHODS = new Set<string>([/* 14 methods including connect */]);

// GatewayClient uses HERMES_BRIDGE_TRACED_METHODS.has(method) in shouldTraceRequest

// gateway.test.ts — subset assertion with no casts
it('HERMES_BRIDGE_RETRY_METHODS ⊆ HERMES_BRIDGE_TRACED_METHODS', () => {
  expect(HERMES_BRIDGE_RETRY_METHODS.size).toBeGreaterThan(0);
  for (const method of HERMES_BRIDGE_RETRY_METHODS) {
    expect(HERMES_BRIDGE_TRACED_METHODS.has(method)).toBe(true);
  }
});
```

### Your task

Adjudicate this steal dispute:

1. Are OpenCode's criticisms of Codex's fix valid?
   - Is the addition-drift concern real? (If a 15th method is added to `HERMES_BRIDGE_RETRY_METHODS`
     but not to the `it.each` list, does the test silently miss it?)
   - Is the invariant weakening a real problem?
   - Is the remaining `(client as any)` cast a genuine remaining flaw?

2. Is OpenCode's alternative actually superior?
   - Does exporting `HERMES_BRIDGE_RETRY_METHODS` as a module constant represent a reasonable
     API/production change for a test quality improvement?
   - Is `HERMES_BRIDGE_TRACED_METHODS` as an exported constant the right approach, or does it
     change the shouldTraceRequest implementation in a risky way?

3. Final verdict:
   - STEAL STANDS: Codex's fix is genuinely FLAWED (not just "not optimal") → OpenCode earns X1 points, Codex 0 for X1
   - STEAL FAILS: Codex's fix is VALID+SOUND (even if OpenCode's is also good) → Codex keeps X1 points

Key rule: the steal only succeeds if the original fix is GENUINELY FLAWED. "OpenCode's fix is
marginally better" is not enough — the original must have a real defect.

Write your verdict to `.agents/reports/2026-06-30-T5-tiebreak-x1-steal.md`.
