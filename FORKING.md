# Forking WednesdayAI Mobile

## What this repository gives you

WednesdayAI Mobile is intended to be a solid base others can fork and customise.

The base gives you:

- a mobile app shell;
- WednesdayAI product direction;
- backend/transport separation;
- direct management goals;
- voice-first interaction goals;
- plugin/skill extension boundaries;
- release and setup guidance.

It should be useful as an official WednesdayAI app and as a starting point for your own branded
mobile companion or operator surface.

## What to customise in app code

Customise app code when the change belongs to the native user experience or platform release.

Good app-code customisation targets:

- native UX and navigation;
- branding and visual identity;
- app display name, icons, splash, and store metadata;
- OS integrations;
- platform permissions;
- proprietary product flows;
- native modules;
- app-store purchase or subscription surfaces;
- release signing and CI.

These changes belong to the fork owner because they affect the app binary, store listing, or
platform trust boundary.

## What to extend through WednesdayAI skills and plugins

Prefer WednesdayAI skills/plugins for domain features that can be advertised through gateway
metadata/actions.

Good skill/plugin extension targets:

- domain-specific actions;
- status cards;
- approval prompts;
- settings panels;
- voice intents;
- notification intents;
- workflow-specific commands;
- integration-specific cards and summaries.

The mobile app should render stable primitives. The WednesdayAI system should own domain behaviour.

## Brand and attribution

Use WednesdayAI naming and `wednesdayai` code identifiers where appropriate. Use Australian English,
direct tone, and no upstream disparagement.

Keep OpenClaw heritage attribution where legally or ethically required. Suggested wording:

> WednesdayAI is a Hard fork of OpenClaw at v2026.3.2.

Forks should not imply they are official WednesdayAI unless they are maintained by the official
project. If you change the product name, update visible copy, package names, app IDs, analytics
names, store metadata, icons, screenshots, and support links together.

## Backend compatibility

A fork can keep WednesdayAI compatibility, add its own backend descriptor, or retain
OpenClaw-derived compatibility where that helps users migrate.

Keep backend identity separate from transport identity:

- backend identity: what product/runtime the app is managing;
- transport identity: how the app connects.

Do not model a product backend as a transport.

## Native capability boundaries

Native capability code belongs in the app when the operating system requires it:

- microphone;
- camera;
- notifications;
- widgets;
- share extensions;
- screen/canvas capture;
- contacts, calendar, and location;
- secure storage;
- local network discovery;
- background execution.

Domain features should stay in WednesdayAI skills/plugins unless they need native permission,
platform release, or trusted rendering support.

## Release ownership

Release signing, store accounts, analytics projects, support links, legal links, and secrets belong
to the fork owner.

Do not reuse official WednesdayAI credentials in a fork. Do not commit signing material. Keep
production values in local secret stores or CI secret managers.

## Upstreaming improvements

Upstream improvements when they make the shared base better:

- capability registry improvements;
- accessibility fixes;
- platform bug fixes;
- clearer extension primitives;
- release documentation improvements;
- security and privacy hardening.

Keep fork-specific branding, proprietary workflows, and private integrations in the fork unless they
are intentionally being contributed back.
