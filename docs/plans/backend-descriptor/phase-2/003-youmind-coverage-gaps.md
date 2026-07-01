---
id: "003"
phase: 2
title: Fill youmind coverage gaps in gateway-backends.test.ts (descriptor + selectByBackend)
status: ready
depends_on: ["002"]
parallel: false
conflicts_with: []
files:
  - apps/mobile/src/services/gateway-backends.test.ts
irreversible: false
scope_test: "apps/mobile/src/services/gateway-backends.test.ts"
allowed_change: edit
covers_criteria: [SC1, SC2, SC4, SC5]
---
## Failing test (write first)

N/A — the youmind descriptor and selectByBackend implementations already work correctly.
These tests close coverage gaps identified in the plan's Tests section; they will PASS
when written. Covered by existing implementation in:
`apps/mobile/src/services/gateway-backends.ts`

## Change

Two insertions in `apps/mobile/src/services/gateway-backends.test.ts`.

**Apply Change B first (higher line ~204), then Change A (lower line ~89).** This keeps
Change A's offset stable after B inserts lines. Always locate anchors by exact string
match, not by line number.

---

### Change B (apply first) — add youmind test to `getGatewayBackendDescriptor` describe block

- **File:** `apps/mobile/src/services/gateway-backends.test.ts`
- **Anchor:** end of `describe('getGatewayBackendDescriptor', ...)` block — last test before closing `});` (~line 204–210)
- **Before:**

```ts
    it('returns the matching descriptor for a string kind', () => {
      expect(getGatewayBackendDescriptor('wednesdayai').kind).toBe('wednesdayai');
      expect(getGatewayBackendDescriptor('wednesdayai').label).toBe('WednesdayAI');
      expect(getGatewayBackendDescriptor('hermes').kind).toBe('hermes');
      expect(getGatewayBackendDescriptor('openclaw').kind).toBe('openclaw');
    });
  });
```

- **After:**

```ts
    it('returns the matching descriptor for a string kind', () => {
      expect(getGatewayBackendDescriptor('wednesdayai').kind).toBe('wednesdayai');
      expect(getGatewayBackendDescriptor('wednesdayai').label).toBe('WednesdayAI');
      expect(getGatewayBackendDescriptor('hermes').kind).toBe('hermes');
      expect(getGatewayBackendDescriptor('openclaw').kind).toBe('openclaw');
    });

    it('returns the YouMind compatibility descriptor for the youmind kind', () => {
      expect(getGatewayBackendDescriptor('youmind').kind).toBe('youmind');
      expect(getGatewayBackendDescriptor('youmind').label).toBe('YouMind');
    });
  });
```

---

### Change A (apply second) — add youmind tests to `selectByBackend` describe block

- **File:** `apps/mobile/src/services/gateway-backends.test.ts`
- **Anchor:** end of `describe('selectByBackend', ...)` block — last test before closing `});` (~line 89–92)
- **Before:**

```ts
    it('treats unknown string inputs as openclaw', () => {
      expect(selectByBackend('totally-unknown' as any, { wednesdayai: 'W', openclaw: 'A', hermes: 'B' })).toBe('A');
    });
  });
```

- **After:**

```ts
    it('treats unknown string inputs as openclaw', () => {
      expect(selectByBackend('totally-unknown' as any, { wednesdayai: 'W', openclaw: 'A', hermes: 'B' })).toBe('A');
    });

    it('returns the explicit youmind branch when a youmind option is provided', () => {
      expect(selectByBackend('youmind', { wednesdayai: 'W', openclaw: 'A', hermes: 'B', youmind: 'Y' })).toBe('Y');
    });

    it('falls back to the openclaw branch for youmind when no youmind option is provided', () => {
      expect(selectByBackend('youmind', { wednesdayai: 'W', openclaw: 'A', hermes: 'B' })).toBe('A');
    });
  });
```

---

Both Before strings are unique in the file by content.

## Allowed moves

Edit `apps/mobile/src/services/gateway-backends.test.ts` at the two anchors above only.
No imports, no other describe blocks, and no other test cases may be touched.

## STOP triggers

- Line numbers have shifted (the file was edited by task 001/002 imports) — re-read the file, locate the Before strings by content, not by line number.
- Before string not found verbatim — stop; do not guess or approximate the anchor.
- Any change outside the two insertion points above — stop.

## Done when

`WAI_TYPECHECK_CMD="cd apps/mobile && npm run typecheck" WAI_TEST_CMD="cd apps/mobile && npx jest --testPathPattern=gateway-backends.test --no-coverage" bash ~/.claude/wai/scripts/task-gate.sh backend-descriptor 003` exits 0 with all tests green (including the 3 new tests).
