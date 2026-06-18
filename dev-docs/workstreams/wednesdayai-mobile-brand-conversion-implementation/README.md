---
workstream: wednesdayai-mobile-brand-conversion-implementation
title: WednesdayAI Mobile Brand Conversion Implementation
status: implemented
owner: david
rescued_branches: []
contradictions: []
staging_pointers:
  - docs/plans/wednesdayai-mobile-brand-conversion-implementation
  - docs/superpowers/specs/2026-06-17-wednesdayai-mobile-brand-conversion-implementation.md
updated: 2026-06-18
---

# WednesdayAI Mobile Brand Conversion Implementation

First behaviour-changing implementation workstream for the WednesdayAI Mobile product and brand conversion.

This workstream converts the first safe visible surfaces from Clawket-first identity to WednesdayAI Mobile identity while preserving Clawket hard-fork attribution, OpenClaw heritage, Hermes compatibility, retained YouMind compatibility, and the backend/transport separation model.

## State

Spec, precheck, decomposition, execution, adversarial review, PR preparation, and documentation refresh have run for the first implementation slice.

Implemented scope:

- paired `README.md` / `README.zh-CN.md` conversion;
- safe mobile visible identity and permission copy;
- minimal `wednesdayai` backend descriptor addition through the central registry;
- explicit backend dispatch coverage for WednesdayAI, OpenClaw, Hermes, and retained YouMind paths touched by this slice;
- targeted verification and remaining-hit classification.

Post-review remediation expanded the original task files only where review found real regressions or stale guidance: QR/config backend preservation, WednesdayAI chat/session recovery copy, documentation command correctness, Hermes relay pairing copy, and current release checklist alignment. Those divergences are retained because they prevent user/admin/developer docs from contradicting the implemented product behavior.

Current execution evidence lives in `docs/plans/wednesdayai-mobile-brand-conversion-implementation/` and `docs/setup/brand-conversion-first-slice-hit-classification.md`.

Do not choose final native identifiers, public package names, relay domains, store metadata, or YouMind disposition in this workstream without explicit human confirmation.
