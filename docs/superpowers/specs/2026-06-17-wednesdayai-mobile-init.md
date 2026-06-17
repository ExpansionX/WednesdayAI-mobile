---
doc_type: spec
status: active
workstream: wednesdayai-mobile-init
change_kind: docs
---

# WednesdayAI Mobile Init

**Date:** 2026-06-17
**Status:** active design settled by `/wai:spec`
**Author:** David Rudduck (via agent)

## Intent (what / why)

Create the foundation for `ExpansionX/WednesdayAI-mobile` as the first-party
WednesdayAI mobile application. The app should start from a hard fork of Clawket,
not from OpenClaw's current mobile apps and not from the older Android/iOS apps
inside `WednesdayAI-core`.

The new repository needs clear founding documents before implementation begins:

- `VISION.md` for the long-term product and architecture direction.
- `ROADMAP.md` for ordered implementation phases and cherry-pick candidates.
- supporting setup/fork documentation for converting Clawket into WednesdayAI
  Mobile.

The product goal is a voice-first mobile companion and operator surface for
WednesdayAI. Text chat remains available, but secondary. The app should eventually
manage a WednesdayAI installation directly without requiring a helper/bridge as
the default mental model, while still allowing optional relay or helper
infrastructure where it is useful for remote access, NAT traversal, or migration.

The ecosystem goal is the same as WednesdayAI core: provide a solid base others
can fork, customise, and extend. That includes both app-code customisation and
WednesdayAI-side skills/plugins that can add mobile affordances through stable
contracts rather than baking every feature into the mobile app.

## Users / who is affected

- **Everyday WednesdayAI users** who want a beautiful, simple voice-first
  companion on their phone, with text chat as a fallback rather than the centre of
  the product.
- **Operators / builders** who need to manage a local or remote WednesdayAI
  installation from mobile: pairing, health, logs, models, skills, plugins,
  agents, runs, approvals, and diagnostics.
- **WednesdayAI plugin and skill authors** who need a documented way to expose
  mobile actions, panels, cards, approvals, and voice affordances from
  WednesdayAI-side extensions.
- **Fork authors** who want to take the mobile app as a base and modify it for
  their own branded companion, business workflow, or device-capability product.
- **WednesdayAI-core maintainers** who need to remove first-party app churn from
  the core repository and keep core focused on gateway/runtime/plugin contracts.
- **Clawket / OpenClaw compatibility users** whose workflows may inform migration
  and compatibility, but should not define the new product identity.

## Success criteria

- SC1: A `VISION.md` draft exists for `WednesdayAI-mobile` defining the app as a
  voice-first, text-secondary WednesdayAI companion, direct installation manager,
  mobile node/capability provider, and extensible client surface.
- SC2: A `ROADMAP.md` draft exists listing features and ideas to cherry-pick from
  Clawket, upstream OpenClaw Android/iOS/macOS apps, WednesdayAI-core, Saturday
  apps, Hermes Desktop, opcode, Claudia, NanoClaw, ArgentOS, and other reference
  systems, with a clear implementation order.
- SC3: The initial fork plan chooses Clawket as the codebase source and explicitly
  rejects `WednesdayAI-core/apps/*` and upstream OpenClaw apps as implementation
  starting points.
- SC4: The fork setup plan covers repository import, history preservation decision,
  package/bundle identifiers, app display name, icons/splash, docs links,
  analytics naming, release metadata, CI, secrets, and store-signing boundaries.
- SC5: The plan defines `wednesdayai` as the first-class backend identity while
  preserving explicit compatibility paths for OpenClaw-derived protocol behaviour
  where useful.
- SC6: The plan defines direct gateway management as the default product path:
  local network discovery, manual URL, QR pairing, Tailscale/cloud/relay options,
  status, doctor, logs, reset, and service lifecycle where supported.
- SC7: The plan defines a mobile extensibility model where most enhancements are
  advertised by WednesdayAI plugins/skills through gateway metadata/actions, while
  native app modules are reserved for OS-level capabilities such as microphone,
  camera, notifications, contacts, calendar, location, widgets, share sheet, and
  screen/canvas capture.
- SC8: The plan includes extraction/removal guidance for old `apps/android`,
  `apps/ios`, `apps/macos`, and `apps/shared` from `WednesdayAI-core`, treating
  them as references or separate repositories rather than the future app base.
- SC9: The foundational documentation follows WednesdayAI brand guidance:
  `WednesdayAI` naming, `wednesdayai` code identifiers where appropriate,
  Australian English, direct tone, OpenClaw heritage acknowledgement, and no
  disparagement of upstream.
- SC10: The next implementable step after the docs is unambiguous: set up
  `ExpansionX/WednesdayAI-mobile` from Clawket and begin the product/brand
  conversion to WednesdayAI.

## Constraints

- **No implementation before founding docs.** This workstream starts with intent,
  vision, roadmap, and fork/setup documentation. Code changes come after the
  founding direction is written.
- **Clawket is the base.** Use Clawket as the hard-fork source because it already
  has the best modern cross-platform app shell and backend/transport separation.
- **WednesdayAI-core apps are not the base.** The old Android/iOS/macOS apps in
  core are older OpenClaw-era implementations and should be extracted or archived
  as references, not developed in place.
- **OpenClaw upstream is reference-only.** Upstream has advanced mobile ideas, but
  the repository must not be adopted wholesale. Cherry-pick concepts and narrow
  fixes deliberately.
- **Voice-first direction.** Any roadmap must prioritise push-to-talk, wake mode,
  interruption/cancel, live activity, approvals, and spoken feedback ahead of
  text-only chat polish.
- **Direct-management goal.** The app should not permanently depend on a Clawket
  helper as the default path. Helper/relay flows may exist, but the product model
  is direct WednesdayAI management where possible.
- **Extensibility over core bloat.** Plugin/skill-driven mobile affordances should
  be preferred over adding every feature directly to the app, mirroring
  WednesdayAI's lean-core philosophy.
- **Brand alignment.** Use WednesdayAI product language and brand guidelines from
  `WednesdayAI-core`; do not retain Clawket product identity except as migration
  history.
- **Repository boundaries.** `WednesdayAI-mobile`, `WednesdayAI-skills`, and
  `WednesdayAI-plugins` are separate repositories with separate lifecycles. The
  mobile roadmap should describe integration points, not collapse them back into
  core.

## Out of scope

- Implementing the hard fork in this PRD step.
- Migrating Clawket code, changing bundle IDs, or renaming assets in this step.
- Extracting `WednesdayAI-core/apps/*` in this step.
- Building the plugin-projected mobile UI runtime in this step.
- Deciding every final native capability module. The PRD only requires that the
  roadmap classify OS-level capabilities separately from plugin-projected UI.
- Guaranteeing OpenClaw or Hermes parity as a product goal. Compatibility can be
  retained when useful, but WednesdayAI Mobile is the primary product.

## Approach

Use this workstream to create the founding documentation and migration plan for
`ExpansionX/WednesdayAI-mobile`, then decompose implementation into small,
verifiable repository setup and product conversion tasks.

The approach is:

1. Treat Clawket as the implementation seed because it already has the strongest
   current app shell: React Native + Expo, iOS/Android/macOS packaging scripts,
   QR pairing, relay/local/custom connection modes, capability-gated Console
   screens, agent/session/files/models/cron/logs/usage surfaces, node/camera
   services, speech-recognition plumbing, i18n, analytics, and release docs.
2. Keep upstream OpenClaw mobile apps, old `WednesdayAI-core/apps/*`, Saturday
   apps, and reference agent apps as source material, not the codebase base.
   The roadmap should cherry-pick ideas and narrow fixes, not restart from an
   older app or import upstream wholesale.
3. Make `wednesdayai` a first-class backend identity in the fork. The existing
   Clawket split between backend identity and transport identity becomes the
   core architectural inheritance: `wednesdayai` describes the product/runtime;
   `local`, `relay`, `tailscale`, `cloudflare`, and `custom` describe connection
   routes.
4. Put direct WednesdayAI gateway management ahead of helper-driven pairing.
   Relay/helper flows remain useful for migration and remote access, but the
   long-term default user model is "my phone manages my WednesdayAI system".
5. Establish an extension contract where WednesdayAI-side skills/plugins can
   advertise mobile actions, panels, approvals, status cards, voice intents, and
   permissions through gateway metadata. The native app owns OS-level capability
   modules and rendering safety; extensions own domain behaviour.
6. Write `VISION.md`, `ROADMAP.md`, and setup/fork docs before code conversion.
   The first implementation tasks after these docs are repo import, product
   identity rename, package/bundle metadata, CI/release boundaries, and a minimal
   WednesdayAI backend descriptor.

## Design / architecture

### Repository shape

`ExpansionX/WednesdayAI-mobile` should start as a standalone repository copied
from this Clawket monorepo, with history preservation decided explicitly during
setup. The initial import should keep the useful monorepo boundaries until the
fork proves what can be simplified:

- `apps/mobile`: first-party WednesdayAI mobile app.
- `apps/bridge-cli`, `packages/bridge-core`, and `packages/bridge-runtime`:
  transitional compatibility surfaces while direct WednesdayAI management is
  built out.
- `apps/relay-*` and `packages/relay-shared`: optional remote-access and pairing
  infrastructure, not the primary product mental model.
- New top-level docs: `VISION.md`, `ROADMAP.md`, `FORKING.md`, `SETUP.md`, and
  `docs/architecture/backend-transport.md`.

The old app directories in `WednesdayAI-core` should be extracted, archived, or
converted to reference material in a separate follow-up workstream. They should
not remain an active first-party app surface inside core.

### Backend and transport model

The mobile fork should extend Clawket's backend registry instead of replacing it
with ad hoc WednesdayAI checks:

- Backend identities: `wednesdayai` first, with compatibility descriptors for
  `openclaw` and any retained transitional backends.
- Transport identities: `local`, `relay`, `tailscale`, `cloudflare`, `custom`.
- Capability descriptors: each backend advertises supported console entries,
  voice affordances, management operations, plugin-projected UI primitives, and
  native permission requirements.
- Gateway operations: backend-specific request semantics live behind service
  helpers/adapters; screens consume descriptors and operation bundles.

This keeps the fork aligned with the current Clawket rule that product backend
identity and connection transport are separate concerns. It also gives
WednesdayAI a clean place to add capabilities such as workspace lanes, provider
runtime state, active-run recovery, wake/nudge gates, plugin metadata, and
mobile-node APIs without making every screen branch manually.

### Product surfaces

The initial app should be organised around four durable surfaces:

- **Voice:** push-to-talk, wake mode when platform rules permit it,
  interrupt/cancel, spoken summaries, transcript repair, action confirmation,
  and fast fallback to text.
- **Companion:** chat, memory/context review, current run status, approvals,
  notifications, and a simple home state that answers "what is WednesdayAI
  doing now?"
- **System:** pairing/discovery, status, doctor, logs, models, providers,
  skills, plugins, agents, runs, files, service lifecycle, and reset flows.
- **Extensions:** plugin/skill-projected cards, actions, settings panels,
  approval prompts, voice intents, and deep links with explicit permission and
  capability metadata.

Text chat remains available everywhere it is useful, but it is not the main
organising metaphor. The app should expose agentic state clearly: connected
system, active agent/run, pending approvals, current microphone/listening state,
background activity, and whether an action is local, remote, or relayed.

### Extension contract

WednesdayAI plugins and skills should not need to patch the native app for most
mobile affordances. The mobile app should render a small, stable set of gateway
advertised primitives:

- action buttons with schema-validated inputs and confirmation levels;
- status cards with severity, freshness, and source links;
- approval prompts with human-readable risk summaries;
- settings panels backed by typed config schemas;
- voice intents with short utterance hints, required permissions, and fallback
  text forms;
- file/media/camera/share-sheet requests mediated by native permission prompts;
- notification intents with user-visible category and quiet-hours metadata.

Native app changes are reserved for OS integrations that cannot be expressed
through gateway metadata: microphone, camera, screen/canvas capture, widgets,
notifications, share extensions, contacts/calendar/location, secure storage,
local network discovery, background execution, and platform purchase flows.

### Reference-system borrowing plan

Borrow from Clawket:

- Expo/RN app shell, iOS/Android/macOS packaging scripts, release docs, i18n,
  analytics discipline, QR scanner, connection cache, gateway services,
  capability registry, console descriptors, node/camera services, and speech
  module.

Borrow from upstream OpenClaw:

- Current mobile reconnection/session recovery ideas, native node capability
  direction, onboarding, diagnostics, and any narrow fixes that still apply to
  the OpenClaw-derived protocol. Do not import upstream as the base.

Borrow from WednesdayAI-core:

- Brand, gateway/runtime contracts, workspace-lane and provider-runtime model,
  plugin/skill architecture, wake/nudge concepts, active-run recovery semantics,
  and lean-core extension philosophy.

Borrow from Saturday:

- Separate deployable app surfaces, provider abstraction between platform UI and
  gateway transport, gateway/client boundary discipline, voice package ideas,
  and the principle that mobile is its own lifecycle rather than a subdirectory
  of engine core.

Borrow from Hermes Desktop:

- First-run setup, runtime health probes, persistent logs, polished settings,
  live tool output, file browser, update flow, and "same agent, same config,
  same sessions" cross-surface promise.

Borrow from ArgentOS:

- Mobile-node model, SwiftUI/native proof points for wake/voice, gateway
  discovery, keychain/session tests, screen/camera capability tests, and
  platform-specific release automation discipline.

Borrow from opcode, Claudia, NanoClaw, and other reference agents:

- Project/session browsers, background-agent timelines, checkpoints, MCP/plugin
  management, source-backed memory review, forkable base philosophy, and
  isolation/security patterns.

### Industry best-practice guardrails

The founding docs should align the mobile experience with current platform and
agentic-interface guidance:

- Follow Apple Human Interface Guidelines for platform-native controls,
  discoverability, privacy-sensitive permissions, and Siri/App Intents style
  system integration where appropriate.
- Follow Material Design for Android interaction density, accessibility,
  navigation, and component behaviour rather than cloning iOS patterns.
- For voice UI, keep turns short, interruption-friendly, recoverable, and
  multimodal. Every spoken action that changes state needs visible confirmation,
  undo/cancel where possible, and a text fallback.
- For agentic systems, make autonomy visible: show what the agent is doing, what
  it can access, what it is waiting on, what it changed, and how to stop it.
- Treat privacy, security, transparency, accountability, and inclusiveness as
  product requirements. The app should avoid engagement-seeking companion dark
  patterns and focus on utility, control, and user-owned systems.

## Decisions

- DEC1: Start `ExpansionX/WednesdayAI-mobile` from a hard fork of Clawket, not upstream OpenClaw mobile and not `WednesdayAI-core/apps/*`; this is a migration and rename decision linked to ADR `dev-docs/adr/0001-hard-fork-clawket-for-wednesdayai-mobile.md`.
- DEC2: Move first-party mobile app development out of `WednesdayAI-core` and
  treat the old core app directories as references or extraction candidates.
  This is a repository-boundary decision that may lead to future cleanup or
  archival. ADR: `dev-docs/adr/0002-keep-mobile-outside-wednesdayai-core.md`.
- DEC3: Preserve backend/transport separation and add `wednesdayai` as the
  primary backend identity through the capability registry rather than treating
  WednesdayAI as a transport or scattered screen condition.
- DEC4: Make direct WednesdayAI gateway management the default product path,
  while keeping relay/helper modes as optional transports for remote access,
  transition support, and difficult networks.
- DEC5: Prefer gateway-advertised plugin/skill mobile affordances over native
  app feature bloat. Native code should be added for OS-level capabilities and
  trusted rendering only.
- DEC6: Keep `change_kind: docs` for this workstream because it creates and
  settles planning documentation only. Behaviour-changing fork/setup tasks must
  use their own future specs/tasks with the appropriate `change_kind`.

## Test strategy

This workstream is documentation-only, so verification is structural rather than
runtime:

- Confirm the spec frontmatter has `status: active`, `doc_type: spec`, the
  `wednesdayai-mobile-init` workstream slug, and `change_kind: docs`.
- Confirm the required WAI sections exist and are non-empty: Intent, Success
  criteria, Approach, Design / architecture, Decisions, and Test strategy.
- Confirm irreversible migration/repository decisions link to ADRs under
  `dev-docs/adr/`.
- Confirm future `VISION.md`, `ROADMAP.md`, setup, fork, and extraction tasks can
  map to the stable SC ids in this spec.
- For later implementation tasks, require targeted checks around mobile
  typecheck/tests, i18n key parity, config validation, Expo prebuild/build
  scripts, and capability-registry tests whenever code is touched.

## Source systems reviewed / consulted

- Clawket monorepo: current app shell, backend/transport split, relay/bridge
  behaviour, mobile console, chat, model, cron, usage, file, and connection flows.
- WednesdayAI-core: brand guidelines, gateway protocol, agent lifecycle, run
  recovery, nudge, heartbeat/wake gates, plugin/skill architecture, and old native
  app references.
- Upstream OpenClaw: current Android/iOS/macOS app ideas, reconnect fixes,
  onboarding, native node capabilities, voice/screen/canvas surfaces, and mobile
  diagnostics.
- Saturday apps: gateway/client provider abstraction, desktop native IPC model,
  admin dashboard ideas, consumer app positioning, and future mobile placeholder.
- Hermes Desktop: runtime setup, live tool output, file browser, voice, settings,
  update flow, and polished desktop companion patterns.
- opcode: session/project browser, background agents, execution history, usage
  analytics, MCP management, checkpoints, and timeline UX.
- Claudia: relationship/memory/commitment UX and source-backed memory surfaces.
- NanoClaw: forkable base philosophy, skill-installed capabilities, and security
  via isolation.
- ArgentOS: mobile node model, foreground service, shared session, gateway
  discovery, and marketplace/connectors direction.
- Apple Human Interface Guidelines: platform-native controls, privacy-sensitive
  permissions, and Siri/App Intents integration direction
  (`https://developer.apple.com/design/human-interface-guidelines`,
  `https://developer.apple.com/design/human-interface-guidelines/siri`).
- Material Design: Android-native navigation, accessibility, component
  behaviour, and adaptive UI guidance (`https://m3.material.io/`).
- Microsoft Responsible AI and agent-design guidance: transparency, reliability,
  safety, privacy, accountability, and human-centred agent oversight
  (`https://www.microsoft.com/en-us/ai/principles-and-approach`,
  `https://learn.microsoft.com/en-us/agents/design-guidelines/responsible-ai`).

## Hand-off

Design settled here. Next: `/wai:precheck wednesdayai-mobile-init`, then
`/wai:decompose wednesdayai-mobile-init`.
