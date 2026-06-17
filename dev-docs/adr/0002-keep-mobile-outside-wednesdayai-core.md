# ADR 0002: Keep Mobile Outside WednesdayAI Core

## Status

Accepted for `wednesdayai-mobile-init`.

## Context

`WednesdayAI-core` currently contains older app directories from an OpenClaw-era
implementation. The long-term WednesdayAI direction is a lean core with
extensible skills and plugins, plus independently developed client surfaces.

Keeping first-party mobile application development inside core would increase
engine churn, mix release lifecycles, and make it harder for others to fork or
customise the app without taking the whole engine repository.

## Decision

Do not use `WednesdayAI-core/apps/*` as the future mobile app base.

Develop first-party mobile in `ExpansionX/WednesdayAI-mobile`. Treat the old
core app directories as references until a later extraction, archival, or removal
workstream decides their final location.

## Consequences

- Core can focus on gateway/runtime/plugin contracts.
- Mobile can move at app-release speed with its own signing, stores, CI, and
  product documentation.
- Fork authors can take the mobile base without cloning the engine core.
- A future extraction/removal task must preserve any useful old app knowledge
  before deleting or archiving directories from core.

## Follow-ups

- Add extraction guidance to the WednesdayAI Mobile roadmap.
- Create a separate workstream before deleting, archiving, or moving old core
  app directories.
- Keep integration contracts between core, skills, plugins, and mobile explicit
  through gateway metadata rather than repo-local imports.
