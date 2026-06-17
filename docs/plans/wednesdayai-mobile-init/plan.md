# WednesdayAI Mobile Init Plan

Spec: `docs/superpowers/specs/2026-06-17-wednesdayai-mobile-init.md` frozen by precheck at `52aee2f237e697978dc8e8f60546c5cbcecc14a5`.

This is a documentation-only decomposition. It creates the founding documents that should seed `ExpansionX/WednesdayAI-mobile` from the Clawket hard fork, then records the fork/setup, backend/transport, extension, and extraction architecture needed before code conversion begins.

The tasks are intentionally file-isolated. Each task creates one document, with manual verification that checks the required product claims and cross-references. Later behaviour-changing workstreams can use these docs as anchors for the actual repository import, brand conversion, backend descriptor changes, package metadata changes, and app-store/release setup.

## Phases

1. **Founding product direction** — write the long-term vision and ordered roadmap.
2. **Fork setup contract** — document how Clawket becomes WednesdayAI Mobile and how the new repository is made forkable.
3. **Architecture contracts** — define backend/transport, extension, and core-app extraction boundaries.
4. **Reference evidence** — summarise cherry-pick sources and why each source matters.

## Task order

| id | title | phase | deps/conflicts |
|----|-------|-------|----------------|
| 001 | Create the WednesdayAI Mobile vision | 1 | dep: - | conflicts: none |
| 002 | Create the ordered WednesdayAI Mobile roadmap | 1 | dep: 001 | conflicts: none |
| 003 | Document the Clawket hard-fork setup | 2 | dep: 001 | conflicts: none |
| 004 | Document the forkable repository model | 2 | dep: 003 | conflicts: none |
| 005 | Document backend and transport architecture | 3 | dep: 001 | conflicts: none |
| 006 | Document plugin and skill mobile affordances | 3 | dep: 005 | conflicts: none |
| 007 | Document core app extraction guidance | 3 | dep: 003,004 | conflicts: none |
| 008 | Document reference-system cherry-picks | 4 | dep: 002,005,006,007 | conflicts: none |

## Execute notes

- Keep this workstream documentation-only. Do not rename packages, app IDs, assets, or source code in these tasks.
- Use WednesdayAI brand language from `WednesdayAI-core/docs/brand/BRAND-GUIDELINES.md`: `WednesdayAI`, `wednesdayai`, "Make it yours.", direct tone, Australian English, and OpenClaw heritage acknowledgement without disparagement.
- Do not edit the frozen spec during execution. If the spec is wrong, stop and rerun `/wai:precheck` deliberately after a human-approved spec change.
- Record any content or sequencing decision that is not dictated by a task in `docs/plans/wednesdayai-mobile-init/decisions-ledger.md`.
