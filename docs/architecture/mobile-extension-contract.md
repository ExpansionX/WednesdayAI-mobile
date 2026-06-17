# Mobile Extension Contract

## Purpose

WednesdayAI Mobile should let WednesdayAI skills/plugins enhance the mobile experience without
forcing every domain feature into native app code.

The app renders a small set of gateway-advertised primitives. The WednesdayAI system owns domain
behaviour. Native modules own operating-system permissions, trusted rendering, release constraints,
and platform-specific capability boundaries.

WednesdayAI is a Hard fork of OpenClaw at v2026.3.2. This contract uses WednesdayAI naming,
`wednesdayai` identifiers where appropriate, Australian English, and direct product language.

## Gateway-advertised primitives

Gateway metadata may advertise:

- actions;
- status cards;
- approval prompts;
- settings panels;
- voice intents;
- notification intents;
- native permission requests.

Every primitive must include enough metadata for the app to decide whether it can be rendered,
whether confirmation is required, what permissions are needed, and what fallback text should be
shown.

## Actions

Actions are buttons or menu items backed by schema-validated inputs.

Each action should declare:

- stable id;
- label;
- short description;
- input schema;
- confirmation level;
- required backend capability;
- required native permission, if any;
- success and failure summary shape.

State-changing actions need confirmation before execution.

## Status cards

Status cards summarise system or plugin state.

Each card should declare:

- title;
- severity;
- freshness timestamp;
- source link or source id;
- short body;
- optional actions.

Cards should be compact, scannable, and safe to render without trusting arbitrary plugin HTML.

## Approval prompts

Approval prompts ask the user before an agent or plugin performs a sensitive action.

Each prompt should include:

- human-readable risk summary;
- requested action;
- actor;
- target system or file;
- expiry, if any;
- approve and deny actions;
- fallback text for voice or notification surfaces.

## Settings panels

Settings panels are backed by typed config schemas.

Panels should declare:

- config namespace;
- fields;
- defaults;
- validation rules;
- restart or reload impact;
- whether a change may interrupt active work.

Dangerous settings should require secondary confirmation.

## Voice intents

Voice intents describe short utterance hints and fallback text forms.

Each intent should declare:

- phrase hints;
- required backend capability;
- required native permission;
- confirmation level;
- text fallback;
- spoken success and failure summary.

Voice turns should be short, interruptible, and recoverable. Text fallback is mandatory for
precision and accessibility.

## Native permission mediation

Plugins may request file, media, camera, and share-sheet actions through gateway metadata, but the
native app mediates permission prompts and user-visible control.

The app should never let a plugin bypass native prompts for camera, microphone, photos, files,
contacts, calendar, location, notifications, secure storage, or local network access.

Platform/release constraints from the current mobile docs matter:

- Android native dependency, manifest, package, and permission changes require rebuild/reinstall.
- iOS release work owns signing, App Store metadata, RevenueCat/store secrets, and release
  validation.
- Mac Catalyst needs targeted feature gating for camera, QR scanning, file picking, and device
  identity assumptions.

## Native-only capability modules

These capabilities belong in native app modules:

- microphone;
- camera;
- screen/canvas capture;
- widgets;
- notifications;
- share extensions;
- contacts;
- calendar;
- location;
- secure storage;
- local network discovery;
- background execution;
- platform purchase flows.

Skills/plugins can request these capabilities only through the app-mediated contract.

## Security and review rules

- Gateway-advertised UI must be schema-validated.
- Rendered content must be bounded and safe.
- Native permissions must be visible and revocable.
- Notification intents must respect user-visible category and quiet-hours metadata.
- Sensitive actions need confirmation.
- Secrets, tokens, raw URLs with tokens, and message contents must not be sent as analytics.
- Unsupported capabilities should be disabled through metadata, not attempted optimistically.

## Not part of the first pass

The first pass does not create wire formats, plugin SDK code, native modules, or UI components.

It defines the shape future tasks should implement after the WednesdayAI backend identity and direct
management path are in place.
