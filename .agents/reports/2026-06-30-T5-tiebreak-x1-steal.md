# T5 Tiebreaker — X1 Steal Dispute (Claude adjudicating)

**Dispute:** OpenCode challenges Codex's X1 fix (`it.each` hardcode) as VALID+FLAWED.

## Verdict: STEAL STANDS

Codex's fix is genuinely flawed — not merely sub-optimal. All three of OpenCode's criticisms are valid.

## What the code actually is (verified)

- The original test iterates the **live** `HERMES_BRIDGE_RETRY_METHODS` set via `as unknown as` cast and asserts each method returns true from `(client as any).shouldTraceRequest(method)`. It is a true ∀-over-the-set property test.
- `shouldTraceRequest` has a switch returning true for 14 methods: the 13 retry methods + `connect`. The genuine invariant is **RETRY ⊆ TRACED**.
- HEAD's retry set has 13 entries, matching Codex's hardcoded list verbatim. The snapshot is currently accurate; the flaw is structural.

## Why OpenCode's criticisms are valid

### 1. Addition-drift — REAL and decisive

Codex's `it.each([...13 literals...])` iterates a hardcoded array fully decoupled from the actual set. Add a 14th retry method to `HERMES_BRIDGE_RETRY_METHODS` without adding it to the `it.each` list: the new method is never asserted, the 13 old cases still pass, the suite stays green. The invariant is violated in production (a retried method goes untraced) while the named guard reports success — a false negative. This is not hypothetical: the set is volatile by construction, and the test's whole purpose is the "developer adds a retry method, forgets the trace list" case — precisely the case Codex's version stops covering.

### 2. Invariant weakening — REAL (same defect, semantic framing)

The property degrades from "∀ m ∈ RETRY, traced(m)" (auto-tracking) to "these 13 fixed strings are traced" (snapshot). The test title still claims "every retry method is also traced," but it no longer checks *every* retry method — only a frozen 13. A regression guard that cannot detect the regression it is named for has a correctness defect relative to its spec.

### 3. Residual `(client as any).shouldTraceRequest` cast — REAL

Codex's R1 finding was "the test couples to private members; a rename returns `undefined`." Codex removed the private-**static** cast (by hardcoding) but **kept** the private-**method** cast. Rename `shouldTraceRequest` and `(client as any).shouldTraceRequest` is `undefined`, the call throws. The coupling Codex set out to remove is still present.

## Is OpenCode's alternative superior?

Yes on test semantics, with acceptable production cost. Exporting the constants and asserting `RETRY ⊆ TRACED` with no casts restores the auto-tracking property and removes both casts — strictly better than both the brittle original and Codex's snapshot. A lighter middle path also works: export the set, keep the switch, iterate the real set through a typed test seam — fixing brittleness without refactoring `shouldTraceRequest`.

## Why STEAL STANDS under the key rule

The rule: steal succeeds only if Codex's fix is **genuinely flawed**, not just "OpenCode's is marginally better." Codex's fix is valid (compiles, currently passes, removes the static cast) but **not sound** w.r.t. its own invariant — it provides false assurance for the most likely future regression and leaves its stated coupling problem half-solved. False assurance in a regression guard is a real defect.

## Decision

**STEAL STANDS.** Codex's `it.each` approach converts a self-updating invariant into a frozen snapshot. OpenCode's export-based alternative (or the lighter middle path: export set + keep switch + iterate set in test) is clearly superior.

**Points: OpenCode +3 (X1), Codex 0 for X1.**
