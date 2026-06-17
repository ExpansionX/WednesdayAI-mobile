# WednesdayAI Mobile Brand Conversion Implementation Plan

Spec: `docs/superpowers/specs/2026-06-17-wednesdayai-mobile-brand-conversion-implementation.md` frozen by precheck at `63f0d047145b2f65faf1cf2552fd91e4ba7be7f2`.

This is the first behaviour-changing implementation slice for WednesdayAI Mobile. It converts safe visible product identity surfaces while preserving Clawket hard-fork attribution, OpenClaw heritage, Hermes compatibility, retained YouMind compatibility, and the backend/transport split.

The plan is intentionally serial and small. A preflight task records confirmation-bound surfaces before any implementation edit. Documentation framing changes next so the repository reads as WednesdayAI Mobile while keeping current package and command boundaries. App config copy changes are restricted to display name plus permission copy, leaving all native IDs and Expo/EAS identifiers untouched. Backend identity is then added through the existing central descriptor registry with focused tests, followed by an explicit backend-dispatch task so WednesdayAI does not silently fall through OpenClaw control flow. The final task creates a classification report so remaining identity hits are explicitly sorted into compatibility, attribution, current operational names, or pending confirmation.

## Phases

0. **Confirmation preflight** - record what this slice may touch and which values remain human-confirmed follow-ups.
1. **README product framing** - make the paired README files WednesdayAI Mobile first while preserving Clawket/OpenClaw/Hermes compatibility context.
2. **Mobile visible app config copy** - update safe app display and permission copy without choosing final production identifiers.
3. **Backend descriptor identity and dispatch** - add minimal `wednesdayai` backend identity, then make dispatch call sites provide explicit WednesdayAI branches.
4. **Verification and classification** - record remaining identity hits and confirmation-bound surfaces after the slice.

## Task order

| id | title | phase | deps/conflicts |
|----|-------|-------|----------------|
| 000 | Confirm first-slice boundaries before edits | 0 | dep: - | conflicts: none |
| 001 | Convert paired README product framing | 1 | dep: 000 | conflicts: none |
| 002 | Update mobile app visible identity copy | 2 | dep: 001 | conflicts: none |
| 003 | Add minimal WednesdayAI backend descriptor | 3 | dep: 002 | conflicts: none |
| 004 | Make WednesdayAI backend dispatch explicit | 3 | dep: 003 | conflicts: none |
| 005 | Classify remaining identity hits | 4 | dep: 004 | conflicts: none |

## Execute notes

- Read root `AGENTS.md` before README and docs work. Read `apps/mobile/AGENTS.md` before app config or backend descriptor work.
- Treat planning inputs under `docs/setup/` and `docs/architecture/wednesdayai-backend-descriptor-plan.md` as read-only context unless a task explicitly lists one as a writable file.
- Do not broaden any task into package publication, CLI naming, relay deploy units, native ID migration, persisted data migration, store listing setup, or YouMind disposition.
- README/repository docs use `WednesdayAI Mobile`; app config display and permission copy use the shorter OS-facing name `WednesdayAI`.
- Every remaining Clawket/OpenClaw/Hermes/YouMind hit after a task must be classifiable as converted, compatibility, attribution, current package/command/path, persisted data, release boundary, or pending follow-up.
- If a task discovers that a confirmation-bound value must change, stop rather than guessing the value.
