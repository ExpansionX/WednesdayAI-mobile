# WednesdayAI Mobile Repository Setup and Brand Conversion Plan

Spec: `docs/superpowers/specs/2026-06-17-wednesdayai-mobile-repo-setup-brand-conversion.md` frozen by precheck at `98b859ca070af31616cb8cd8ff61e4e55d94eb91`.

This is a documentation and planning decomposition for the first repository setup and brand-conversion slice in `/Users/david/Code/WednesdayAI-mobile`. It does not rename packages, edit app identifiers, change backend code, or modify external repositories. It creates the evidence and task-ready plans needed before those behaviour-changing commits begin.

The first implementation slice is split by surface: import state, identity inventory, repository metadata/docs links, package/workspace naming, visible product identity, native ID and release boundaries, and the minimal `wednesdayai` backend descriptor. The goal is to prevent a broad Clawket-to-WednesdayAI sweep from mixing safe docs changes with app IDs, package publication, backend semantics, or release signing choices.

## Phases

1. **Repository and identity evidence** - record import/PR state and remaining identity surfaces from real files.
2. **First slice boundaries** - define docs, package, app identity, native ID, CI, and release boundaries without choosing final production identifiers.
3. **Backend descriptor plan** - define the minimal `wednesdayai` backend descriptor path through the existing capability registry pattern.

## Task order

| id | title | phase | deps/conflicts |
|----|-------|-------|----------------|
| 001 | Record repository import and PR state | 1 | dep: - | conflicts: none |
| 002 | Inventory current identity surfaces | 1 | dep: 001 | conflicts: none |
| 003 | Plan repository metadata and package naming | 2 | dep: 002 | conflicts: none |
| 004 | Plan visible product identity conversion | 2 | dep: 002 | conflicts: none |
| 005 | Inventory native IDs and CI release boundaries | 2 | dep: 002 | conflicts: none |
| 006 | Plan the minimal WednesdayAI backend descriptor | 3 | dep: 002,003,004,005 | conflicts: none |

## Execute notes

- Keep this workstream documentation/planning-only. Do not edit package metadata, source code, app config, bundle identifiers, release credentials, or backend descriptor code in these tasks.
- Use the destination checkout `/Users/david/Code/WednesdayAI-mobile`; do not use the old Codex worktree path as the implementation base.
- Read the closest `AGENTS.md` before any future task that touches a workspace. Root docs use root `AGENTS.md`; mobile tasks use `apps/mobile/AGENTS.md`; bridge tasks use `apps/bridge-cli/AGENTS.md`.
- Preserve OpenClaw and Hermes compatibility. Compatibility labels may remain where they describe actual compatibility flows.
- Record any undictated choice in `docs/plans/wednesdayai-mobile-repo-setup-brand-conversion/decisions-ledger.md`.
