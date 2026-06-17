# WednesdayAI Core App Extraction

## Decision

`WednesdayAI-core/apps/android`, `WednesdayAI-core/apps/ios`, `WednesdayAI-core/apps/macos`, and
`WednesdayAI-core/apps/shared` are not the future first-party mobile app base.

Treat those directories as references until a separate workstream archives, extracts, or removes
them. Do not delete, move, or archive them as part of this workstream.

WednesdayAI is a Hard fork of OpenClaw at v2026.3.2. First-party app release churn belongs in
separate app repositories; core should keep gateway/runtime/plugin contracts stable.

## Directories in scope

The old core app references are:

- `WednesdayAI-core/apps/android`;
- `WednesdayAI-core/apps/ios`;
- `WednesdayAI-core/apps/macos`;
- `WednesdayAI-core/apps/shared`.

The future active mobile repository is `ExpansionX/WednesdayAI-mobile`, starting from Clawket.

## Why they are not the mobile base

The old core apps are older OpenClaw-era implementations. They contain useful knowledge, but they
are not the best codebase source for the WednesdayAI Mobile product.

Reasons:

- Clawket has the stronger current Expo/React Native app shell.
- Clawket already separates backend identity from transport identity.
- Clawket already owns modern release scripts, QR pairing, Console surfaces, and mobile services.
- Keeping apps in core mixes engine and app release lifecycles.
- Fork authors should not need to clone WednesdayAI core to customise the mobile app.

## Preservation options

Before deletion or archival, preserve useful knowledge:

- Android development vs packaging split;
- Android native dependency and permission rebuild triggers;
- iOS signing, App Store metadata, RevenueCat/store setup, and release validation;
- macOS dev, build, archive, export, signing, and entitlements knowledge;
- Mac Catalyst feature gating for QR scanning, camera capture, file picking, and device identity;
- `apps/shared/OpenClawKit`, including `OpenClawProtocol`, `OpenClawKit`, and `OpenClawChatUI`
  protocol/chat UI packaging, as reference material only;
- any shared protocol, node, or gateway ideas not already documented elsewhere.

Preservation can be done by copying notes into `WednesdayAI-mobile` docs, creating a reference
archive, or moving the old apps to separate repositories.

## Extraction sequence

1. Create a separate irreversible workstream for extraction, archival, or removal.
2. Add an ADR for the chosen action.
3. Inventory useful docs, scripts, native capability notes, and protocol assumptions.
4. Copy or summarise useful knowledge into `WednesdayAI-mobile`.
5. Confirm no active core docs or scripts point at the old app directories as active surfaces.
6. Only then archive, extract, or remove directories.

## What must not move

Do not move gateway/runtime/plugin contracts out of core as part of app extraction.

Core should retain:

- gateway protocol;
- runtime contracts;
- plugin and skill APIs;
- backend capability metadata contracts;
- docs that define engine behaviour.

Mobile should own app release docs, signing, stores, native modules, and app-specific UX.

## Follow-up workstream requirements

Any deletion, archival, or repository move must be a separate irreversible workstream with:

- its own spec;
- ADR;
- `/wai:precheck`;
- explicit file inventory;
- preservation checklist;
- human-reviewed deletion or move approval;
- verification that core remains buildable and documented.

Use WednesdayAI naming, `wednesdayai` identifiers where appropriate, Australian English, direct
tone, OpenClaw heritage acknowledgement, and no upstream disparagement.
