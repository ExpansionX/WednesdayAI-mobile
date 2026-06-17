# ADR 0001: Hard Fork Clawket for WednesdayAI Mobile

## Status

Accepted for `wednesdayai-mobile-init`.

## Context

WednesdayAI needs a first-party mobile application with a voice-first companion
experience, direct WednesdayAI system management, and a clean extension model for
skills and plugins.

Candidate starting points were:

- Clawket, a current React Native + Expo mobile app with backend/transport
  separation, pairing, console, node, speech, i18n, analytics, and release
  infrastructure.
- Upstream OpenClaw mobile apps, which have continued to advance but are no
  longer the WednesdayAI codebase base.
- Older Android/iOS/macOS app directories inside `WednesdayAI-core`, which are
  older OpenClaw-era references.
- A new app from scratch.

## Decision

Create `ExpansionX/WednesdayAI-mobile` as a hard fork from Clawket.

Use upstream OpenClaw, old WednesdayAI-core apps, Saturday apps, Hermes Desktop,
ArgentOS, and other reference systems as design and cherry-pick sources only.

## Consequences

- The new repository starts from the most capable current mobile shell.
- WednesdayAI can rename product identity, package metadata, app assets, docs,
  CI, and release boundaries without increasing churn inside `WednesdayAI-core`.
- OpenClaw-derived protocol compatibility can be retained deliberately where it
  helps migration, but WednesdayAI becomes the primary backend identity.
- Fork setup must explicitly handle history, licensing, attribution, bundle IDs,
  signing, release metadata, analytics names, and documentation links.

## Follow-ups

- Write `VISION.md` and `ROADMAP.md` in `ExpansionX/WednesdayAI-mobile`.
- Import or mirror Clawket into the new repository.
- Begin product/brand conversion from Clawket to WednesdayAI.
- Add a `wednesdayai` backend descriptor and capability matrix before broad UI
  changes.
