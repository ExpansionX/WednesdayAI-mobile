# WednesdayAI Mobile Vision

## Make it yours

WednesdayAI Mobile is the first-party mobile companion and operator surface for WednesdayAI.
It exists to make a WednesdayAI system feel present, useful, and owned by the person running it.

The product promise follows the wider WednesdayAI promise: Make it yours. The app should be
simple enough for everyday use and explicit enough for builders who need to see what their system
is doing.

## Product north star

The north star is a voice-first, text-secondary mobile app that can talk with WednesdayAI,
show what it is doing, and manage the installation behind it.

The app should eventually let a user pair with, inspect, repair, and operate a WednesdayAI system
without treating a helper or bridge as the default mental model. Helpers, relays, and hosted
routes are still useful for remote access, difficult networks, and migration, but the user-facing
model is direct WednesdayAI management wherever possible.

## Who it serves

WednesdayAI Mobile serves everyday users, operators, plugin authors, and fork authors.

Everyday users need a calm companion that speaks, listens, confirms important actions, and keeps
text available when precision matters.

Operators need mobile access to pairing, status, logs, models, providers, skills, plugins, agents,
runs, approvals, files, diagnostics, and service lifecycle controls.

Plugin and skill authors need a stable way to expose mobile actions, cards, approvals, voice
intents, and settings without patching the native app.

Fork authors need a solid base they can customise for their own branded companion, workflow, or
device capability product.

## Voice-first, text-secondary

The long-term interaction model is voice-first. Push-to-talk, wake mode where platform rules allow
it, interruption, cancel, spoken summaries, visible listening state, and recoverable transcripts
belong at the centre of the experience.

Text chat remains a fallback and precision surface. It should be excellent, but it should not be
the only organising metaphor.

## Direct WednesdayAI management

The app should manage a WednesdayAI installation directly wherever possible. Core flows include
local discovery, manual URL, QR pairing, Tailscale, cloud, relay options, status, doctor, logs,
reset, model/provider controls, skills, plugins, agents, runs, approvals, files, and service
lifecycle where the connected system supports it.

The user should always be able to see what system is connected, whether the route is local or
remote, what is currently running, what is waiting for approval, and what changed.

## Mobile as a capability provider

Mobile is not only a client. It can be a capability provider for WednesdayAI.

Native modules should own OS-level capabilities: microphone, camera, screen/canvas capture,
notifications, widgets, share sheet, secure storage, contacts, calendar, location, and local
network discovery. These capabilities need explicit permission prompts, user-visible state, and
clear revocation paths.

## Extensible by forks, skills, and plugins

Most domain-specific enhancements should come from WednesdayAI skills/plugins through stable
contracts rather than being baked into the mobile app.

The app should render gateway-advertised actions, status cards, approval prompts, settings panels,
voice intents, and permission-mediated native requests. Native code should be reserved for OS
integration, trusted rendering, platform release requirements, and the core interaction shell.

## Relationship to OpenClaw and Clawket

WednesdayAI is a Hard fork of OpenClaw at v2026.3.2. WednesdayAI Mobile starts from Clawket as the
mobile hard-fork source because Clawket already has the strongest current app shell and
backend/transport separation.

Upstream OpenClaw mobile apps and the older `WednesdayAI-core/apps/*` implementations are reference
systems, not the implementation base. They can inform narrow cherry-picks and migration notes.

## Experience principles

- Show the system state before asking the user to trust the system.
- Keep voice turns short, interruptible, and recoverable.
- Confirm state-changing actions before they run.
- Prefer direct controls over hidden automation.
- Keep backend identity separate from transport identity.
- Let extensions add capability without bloating the native app.
- Use Australian English, direct wording, and visible ownership.

## Non-goals

- Do not rebuild every WednesdayAI plugin as native app code.
- Do not make old `WednesdayAI-core/apps/*` the future mobile base.
- Do not make relay or helper infrastructure the permanent default product model.
- Do not hide autonomy, permissions, or remote access behind companion-style magic.
- Do not disparage upstream OpenClaw; acknowledge the heritage and describe what WednesdayAI does differently.

## First horizon

The first horizon is documentation and setup: `VISION.md`, `ROADMAP.md`, fork/setup guidance,
backend/transport architecture, extension contracts, core app extraction guidance, and
reference-system evidence.

After that, the immediate implementation step is to set up `ExpansionX/WednesdayAI-mobile` from
Clawket and begin the product and brand conversion to WednesdayAI.
