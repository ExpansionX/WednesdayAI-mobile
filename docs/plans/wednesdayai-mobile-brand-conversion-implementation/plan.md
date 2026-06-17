# WednesdayAI Mobile Brand Conversion Implementation Plan

Spec: `docs/superpowers/specs/2026-06-17-wednesdayai-mobile-brand-conversion-implementation.md` frozen by precheck at `63f0d047145b2f65faf1cf2552fd91e4ba7be7f2`.

This is the first behaviour-changing implementation slice for WednesdayAI Mobile. It converts safe visible product identity surfaces while preserving Clawket hard-fork attribution, OpenClaw heritage, Hermes compatibility, retained YouMind compatibility, and the backend/transport split.

The plan is intentionally serial and small. Documentation framing changes first so the repository reads as WednesdayAI Mobile while keeping current package and command boundaries. App config copy changes next and are restricted to display name plus permission copy, leaving all native IDs and Expo/EAS identifiers untouched. Backend identity is then added through the existing central descriptor registry with focused tests. The final task creates a classification report so remaining identity hits are explicitly sorted into compatibility, attribution, current operational names, or pending confirmation.

## Phases

1. **README product framing** - make the paired README files WednesdayAI Mobile first while preserving Clawket/OpenClaw/Hermes compatibility context.
2. **Mobile visible app config copy** - update safe app display and permission copy without choosing final production identifiers.
3. **Backend descriptor identity** - add minimal `wednesdayai` backend identity through the existing type and descriptor registry pattern.
4. **Verification and classification** - record remaining identity hits and confirmation-bound surfaces after the slice.

## Task order

| id | title | phase | deps/conflicts |
|----|-------|-------|----------------|
| 001 | Convert paired README product framing | 1 | dep: - | conflicts: none |
| 002 | Update mobile app visible identity copy | 2 | dep: 001 | conflicts: none |
| 003 | Add minimal WednesdayAI backend descriptor | 3 | dep: 002 | conflicts: none |
| 004 | Classify remaining identity hits | 4 | dep: 003 | conflicts: none |

## Execute notes

- Read root `AGENTS.md` before README and docs work. Read `apps/mobile/AGENTS.md` before app config or backend descriptor work.
- Treat planning inputs under `docs/setup/` and `docs/architecture/wednesdayai-backend-descriptor-plan.md` as read-only context unless a task explicitly lists one as a writable file.
- Do not broaden any task into package publication, CLI naming, relay deploy units, native ID migration, persisted data migration, store listing setup, or YouMind disposition.
- Every remaining Clawket/OpenClaw/Hermes/YouMind hit after a task must be classifiable as converted, compatibility, attribution, current package/command/path, persisted data, release boundary, or pending follow-up.
- If a task discovers that a confirmation-bound value must change, stop rather than guessing the value.
