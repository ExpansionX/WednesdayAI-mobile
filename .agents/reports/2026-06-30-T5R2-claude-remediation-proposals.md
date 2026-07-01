# T5 Adversarial Review — Round 2: Claude Remediation Proposals

**Scope:** C1–C4 from Round 1. All verified against live source before proposing.

## Verdict Summary

| Finding | Verdict | Action |
|---------|---------|--------|
| C1 — stale `deriveBaseUrl` catch comment | **REAL** | Rewrite comment to match current single-`try` code |
| C2 — `agents.files.get`/`list` retry asymmetry | **FALSE POSITIVE** | Rationale documented at `gateway.ts:157-169`; no change |
| C3 — test calls `request()` not `getAgentFile()` | **REAL** | Swap test to use `client.getAgentFile()` |
| C4 — `agents.files.get` resilience "gap" | **FALSE POSITIVE** | Deliberate, documented design decision; no change |

---

## C1 — `deriveBaseUrl` comment references deleted code (REAL)

The `try` body has exactly ONE `new URL()` call and NO branches. The comment's "nested `new URL()` guard"
and "both branches" describe a prior catch implementation that no longer exists.

**Before:**
```typescript
} catch {
  // Any URL malformed enough to fail new URL() in the try path also fails the nested
  // new URL() guard — the scheme swap is identical in both branches and stripping
  // query/hash/path cannot fix a bad host. This path always returns null.
  return null;
}
```

**After:**
```typescript
} catch {
  // urlText is not a parseable absolute URL even after the ws(s)->http(s) scheme swap
  // (missing host, relative path, or otherwise malformed). There is no base URL to
  // derive, so callers receive null.
  return null;
}
```

Comment-only change; runtime behavior byte-for-byte identical.

---

## C2 — `agents.files.get`/`agents.files.list` asymmetry (FALSE POSITIVE)

`gateway.ts:152-169` fully documents the rationale immediately above `HERMES_BRIDGE_RETRY_METHODS`:

> *agents.files.get is intentionally EXCLUDED even though it is a read with no backend side effect.
> It is the edit base for read-modify-write flows: the file editor fetches content → user edits →
> setAgentFile writes it back. Auto-retrying after a [BRIDGE_UNAVAILABLE] can silently return NEWER
> file content if the file changed in the ~750ms gap, so a subsequent write targets a base the user
> never saw. setAgentFile takes no base-hash token (unlike config.get whose write pair
> patchConfig/setConfig pass back baseHash for server-side staleness rejection), so there is no
> backend guard.*
>
> *tools.catalog and agents.files.list are pure display reads. On retry they may return a NEWER
> snapshot... harmless for UI refresh; no downstream write depends on a first-attempt catalog/list base.*

The asymmetry is intentional. No code change warranted.

---

## C3 — Test exercises wrong API layer (REAL)

Both paths converge at `sendRequestWithHermesBridgeRetry` with the same method string today, but
a future rename would leave the direct `request()` call green while no longer exercising the real exclusion.

**Before:**
```typescript
await expect(
  client.request('agents.files.get', { agentId: 'main', name: 'plan.md' }),
).rejects.toThrow('[BRIDGE_UNAVAILABLE]');
expect(sendRequestSpy).toHaveBeenCalledTimes(1);
```

**After:**
```typescript
await expect(
  client.getAgentFile('plan.md', 'main'),
).rejects.toThrow('[BRIDGE_UNAVAILABLE]');
expect(sendRequestSpy).toHaveBeenCalledTimes(1);
```

`getAgentFile(name, agentId)` is the public API at `gateway.ts:1040`. The mock rejects propagate
unchanged; `sendRequest` spy count stays at 1.

---

## C4 — `agents.files.get` resilience gap (FALSE POSITIVE)

`gateway.ts:164-166`: *"A transient [BRIDGE_UNAVAILABLE] surfacing as an error the user retries
explicitly is honest; a silent base shift is not. Pure display reads lose auto-retry, which is an
acceptable cost."*

Adding `agents.files.get` to the retry set would reintroduce the silent-base-shift hazard.
Not a gap — a deliberate correctness tradeoff.

---

## Net: 2 real (C1 comment rewrite, C3 API swap), 2 false positives withdrawn (C2, C4)
