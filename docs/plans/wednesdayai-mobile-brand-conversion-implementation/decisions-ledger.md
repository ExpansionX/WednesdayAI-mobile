# Decisions Ledger: wednesdayai-mobile-brand-conversion-implementation

The executor appends dated rows here when a task requires a choice not already locked by the spec or task file.

| id | task | decision | rationale |
|----|------|----------|-----------|
| D0 | decompose | Keep read-only planning inputs out of task `files:` lists. | Prior WAI ledgers established that `files:` is the write allow-list; reference docs are named in task bodies and verification instead. |
| D1 | decompose | Split the first behaviour-changing slice into README, app config, backend descriptor, and classification tasks. | This maps the spec's four implementation surfaces to small serial commits and prevents safe product-copy work from mixing with confirmation-bound IDs, package names, relay domains, or YouMind disposition. |
| D2 | decompose | Do not include a six-locale React Native string task in this first slice. | The scoped app-visible copy change is limited to `apps/mobile/app.json`; if locale-backed UI copy is needed later, it should be a separate six-locale task under `apps/mobile/AGENTS.md`. |
| D3 | decompose | Let `selectByBackend` accept an optional `wednesdayai` branch and fall back to OpenClaw-compatible behaviour when absent. | This introduces explicit WednesdayAI dispatch support without forcing every existing call site to change in the minimal descriptor slice. Future UI tasks can opt into a WednesdayAI branch deliberately. |
| D4 | decompose | Treat `docs/setup/identity-surface-inventory.md` as a read-only sibling for task 004 rather than listing it in task `files:`. | The classification report follows the inventory/report pattern and was authored after reading the existing setup inventory, metadata, visible identity, native ID, and backend descriptor planning docs. Listing those docs in task `files:` would allow accidental edits during a create-only evidence task. |
