# Phase 3: Architecture Contracts

Goal: record the architecture boundaries that prevent the mobile fork from drifting into scattered backend checks or app-specific core bloat.

Tasks:

- `005-create-backend-transport-doc.md` creates `docs/architecture/backend-transport.md`.
- `006-create-mobile-extension-contract.md` creates `docs/architecture/mobile-extension-contract.md`.
- `007-create-core-app-extraction-doc.md` creates `docs/architecture/core-app-extraction.md`.

Exit criteria:

- `wednesdayai` is defined as the primary backend identity and not as a transport.
- Direct gateway management, optional relay/helper flows, and plugin/skill-projected mobile affordances are documented.
- Old `WednesdayAI-core/apps/*` directories are explicitly treated as references/extraction candidates, not the active app base.
