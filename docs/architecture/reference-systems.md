# Reference Systems

## How to use this document

Use this document as a source map for WednesdayAI Mobile. It records what each reference system does
well, what to borrow, what to avoid or treat as reference-only, and where the idea belongs in the
implementation order.

WednesdayAI is a Hard fork of OpenClaw at v2026.3.2. This document uses WednesdayAI naming,
`wednesdayai` identifiers where appropriate, Australian English, direct tone, and no upstream
disparagement.

## Clawket

- Does well: Expo/React Native mobile shell, iOS/Android/macOS scripts, QR pairing, relay/local
  connection handling, capability registry, Console surfaces, speech, node/camera services, i18n,
  analytics, and release documentation.
- Borrow: app shell and release infrastructure first.
- Avoid/reference-only: Clawket product identity and assumptions that OpenClaw is the primary
  backend.
- Order: first implementation base.

## Upstream OpenClaw

- Does well: native mobile experiments, Android onboarding, iOS node role, foreground node
  capabilities, push/location/camera/canvas/screen ideas, macOS signing notes, reconnect/session
  recovery direction, and diagnostics.
- Borrow: narrow fixes and ideas for onboarding, recovery, native node capabilities, voice, screen,
  canvas, and diagnostics.
- Avoid/reference-only: do not replace the Clawket base with upstream Android, iOS, or macOS apps.
- Order: cherry-pick after repository setup and WednesdayAI identity are in place.

## WednesdayAI-core

- Does well: brand, gateway/runtime contracts, plugin/skill architecture, lean-core philosophy,
  workspace lanes, provider runtime, wake/nudge concepts, active-run recovery semantics, and
  `apps/shared/OpenClawKit` protocol/chat UI packaging.
- Borrow: brand language, `wednesdayai` identity, gateway contracts, plugin/skill extension model,
  direct-management semantics, and shared protocol/UI ideas that survive the move out of core.
- Avoid/reference-only: old `WednesdayAI-core/apps/android`, `apps/ios`, `apps/macos`, and
  `apps/shared` are not the future app base.
- Order: drives backend identity, extension contracts, and core app extraction guidance.

## Saturday apps

- Does well: separates deployable app surfaces, uses a gateway boundary, shares packages, and keeps
  mobile as its own lifecycle rather than a core subdirectory.
- Borrow: app-surface separation, gateway/client provider abstraction, voice package direction, and
  independent mobile lifecycle.
- Avoid/reference-only: do not copy Saturday consumer product assumptions into WednesdayAI Mobile.
- Order: use for repository and provider-boundary design.

## Hermes Desktop

- Does well: first-run setup, runtime health probes, persistent logs, live tool output, file browser,
  settings, updates, and same agent/config/sessions continuity.
- Borrow: setup flow, diagnostics, persistent logs, continuity promise, and polished settings.
- Avoid/reference-only: do not copy desktop-first layout directly to mobile.
- Order: use after repository setup when designing direct management and diagnostics.

## ArgentOS

- Does well: mobile-node model, native iOS scaffold, gateway discovery tests, keychain/session tests,
  wake/voice test direction, screen/camera capability tests, and fastlane release setup.
- Borrow: mobile-node concept, voice/wake testing shape, discovery/session/keychain tests, and native
  capability verification discipline.
- Avoid/reference-only: do not force Swift-only assumptions into the Expo/React Native base.
- Order: use for native capability modules and test strategy.

## opcode

- Does well: project/session browsing, background-agent concepts, execution history, checkpoints,
  MCP/plugin management, and usage analytics.
- Borrow: project/session browser patterns, background-agent timelines, checkpoints, MCP/plugin
  management, and usage analytics.
- Avoid/reference-only: do not let developer-dashboard density displace everyday voice-first UX.
- Order: use after direct management basics are stable.

## Claudia

- Does well: source-backed memory/context surfaces, relationship/context review, visualisation, and
  commitment tracking patterns.
- Borrow: memory review, contextual continuity, and source-backed explanations.
- Avoid/reference-only: avoid companion dark patterns, opaque emotional hooks, and engagement-first
  design.
- Order: use for companion context and memory review after the core loop works.

## NanoClaw

- Does well: forkable base philosophy, customisation docs, skill-installed capabilities,
  isolation/security docs, setup/upgrade notes, and provider migration guidance.
- Borrow: forkability, skills as capability delivery, isolation model, and upgrade recovery.
- Avoid/reference-only: do not make every fork capability core-owned.
- Order: use for fork guidance, extension boundaries, and security posture.

## Industry guidance

- Does well: Apple Human Interface Guidelines for native controls, discoverability,
  privacy-sensitive permissions, and Siri/App Intents direction where appropriate; Material Design
  for Android navigation, accessibility, component behaviour, and adaptive UI; responsible-agent
  guidance for transparency, reliability, safety, privacy, accountability, inclusiveness, and
  human-centred oversight.
- Borrow: iOS and Android native interaction patterns, visible autonomy, consent before sensitive
  actions, clear display of what the agent can access, what it is waiting on, what it changed, how to
  stop it, undo/cancel where possible, privacy boundaries, and recoverable multimodal flows.
- Avoid/reference-only: avoid platform-hostile UI, hidden autonomy, and engagement-seeking companion
  patterns.
- Order: applies to every user-facing phase.

## Cherry-pick order

1. Clawket app shell and release infrastructure first.
2. WednesdayAI brand and backend identity second.
3. Direct management and diagnostics third.
4. Voice-first companion loop fourth.
5. Plugin/skill mobile affordance contract fifth.
6. Native OS capability modules and polish after the core loop is stable.

This order matches `ROADMAP.md`.
