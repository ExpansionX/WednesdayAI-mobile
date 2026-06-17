# WednesdayAI Mobile Roadmap

## Starting point

WednesdayAI Mobile starts from Clawket. Clawket is the codebase source for the hard fork because it
already has the modern Expo/React Native shell, release scripts, backend/transport separation, QR
pairing, Console surfaces, speech plumbing, and mobile node services needed for a serious first
version.

Upstream OpenClaw Android, iOS, and macOS apps are reference sources. The older
`WednesdayAI-core/apps/*` implementations are also reference sources. Neither is the implementation
starting point for the new app.

WednesdayAI remains a Hard fork of OpenClaw at v2026.3.2. The mobile repository should acknowledge
that heritage while converting visible product language to WednesdayAI and using `wednesdayai`
identifiers in code and configuration.

## Phase 0 - Foundational documents

Create the founding documents before code conversion:

- `VISION.md`
- `ROADMAP.md`
- `SETUP.md`
- `FORKING.md`
- backend/transport architecture
- mobile extension contract
- core app extraction guidance
- reference-system evidence

Done means the next implementable action is unambiguous and no executor needs to infer the product
direction from scattered notes.

## Phase 1 - Repository setup and brand conversion

Set up `ExpansionX/WednesdayAI-mobile` from Clawket and begin the product/brand conversion to
WednesdayAI.

Order:

1. Decide history strategy and attribution.
2. Import the Clawket repository shape.
3. Rename package/workspace/product metadata where safe.
4. Replace visible Clawket identity with WednesdayAI.
5. Update app display names, docs links, analytics names, release metadata, CI labels, and safe
   placeholder signing references.
6. Leave final production bundle identifiers and store metadata behind explicit human decisions.

## Phase 2 - WednesdayAI backend identity

Add `wednesdayai` as the primary backend identity. Keep backend identity separate from transport
identity:

- backend: `wednesdayai`, compatibility descriptors for OpenClaw-derived behaviour where useful;
- transport: `local`, `relay`, `tailscale`, `cloudflare`, `custom`.

Use a central capability registry and backend operation helpers. Do not implement WednesdayAI as a
transport and do not scatter backend checks through screens.

## Phase 3 - Direct gateway management

Make direct WednesdayAI management the default product path.

Order:

1. Local discovery and manual URL.
2. QR pairing.
3. Tailscale/cloud/relay options.
4. Status, doctor, logs, reset, and service lifecycle.
5. Models, providers, skills, plugins, agents, runs, approvals, files, and diagnostics.

Relay and helper flows stay available for remote access, NAT traversal, and migration. They are not
the permanent user-facing centre.

## Phase 4 - Voice-first companion loop

Put voice ahead of text-only polish:

1. Push-to-talk.
2. Wake mode where platform rules allow it.
3. Live activity and visible listening state.
4. Interrupt and cancel.
5. Spoken summaries.
6. Transcript repair.
7. Confirmation before state-changing actions.
8. Text fallback for precision and accessibility.

The app should always show connected system, active run, pending approvals, current microphone
state, and whether an action is local, remote, or relayed.

## Phase 5 - Mobile extension surface

Let WednesdayAI skills/plugins add mobile affordances through gateway metadata:

- action buttons;
- status cards;
- approval prompts;
- settings panels;
- voice intents;
- notification intents;
- native permission-mediated file, media, camera, and share-sheet requests.

The native app owns rendering safety, permissions, and OS integration. Plugins own domain
behaviour.

## Phase 6 - Native capability modules

Add native modules when the operating system requires native ownership:

- microphone;
- camera;
- screen/canvas capture;
- notifications and widgets;
- share extensions;
- contacts, calendar, location;
- secure storage;
- local network discovery;
- background execution;
- platform purchase and release flows.

Every capability needs explicit permission state, visible user control, and a revocation path.

## Phase 7 - Polish, release, and ecosystem

After the core loop is stable, polish the mobile experience:

- iOS and Android platform-native navigation and controls;
- accessibility;
- performance;
- offline/error states;
- release automation;
- store metadata;
- examples for forks;
- examples for `WednesdayAI-skills` and `WednesdayAI-plugins`.

## Cherry-pick source matrix

| Source | Borrow | Avoid / reference-only | Order note |
|--------|--------|------------------------|------------|
| Clawket | Expo/RN app shell, iOS/Android/macOS release scripts, capability registry, QR pairing, Console surfaces, speech, node/camera services. | Preserve as source, not brand identity. | First implementation base. |
| Upstream OpenClaw Android/iOS/macOS | Reconnect/session recovery, onboarding, diagnostics, native node capability direction, voice/screen/canvas ideas. | Do not replace the Clawket base with upstream apps. | Cherry-pick after repository setup. |
| WednesdayAI-core | Brand, gateway/runtime contracts, plugin/skill architecture, workspace lanes, provider runtime, wake/nudge, active-run recovery semantics, and `apps/shared/OpenClawKit` protocol/chat UI reference points. | Do not move app churn back into core or make `apps/shared` the new app base. | Drives backend identity, extension contracts, and shared-protocol preservation. |
| Saturday apps | App-surface separation, gateway/client provider abstraction, voice package direction, independent mobile lifecycle. | Do not collapse Saturday consumer product assumptions into WednesdayAI Mobile. | Use for repo and provider-boundary design. |
| Hermes Desktop | First-run setup, runtime probes, persistent logs, live tool output, file browser, settings, updates, same agent/config/sessions promise. | Do not copy desktop-first layout directly to mobile. | Use for setup, diagnostics, and continuity. |
| ArgentOS | Mobile-node model, wake/voice tests, gateway discovery, keychain/session tests, screen/camera capability tests, release automation. | Do not force Swift-only assumptions into Expo/RN. | Use for native capability and testing shape. |
| opcode | Project/session browser, background-agent timelines, checkpoints, MCP/plugin management, usage analytics. | Do not centre developer dashboards over everyday voice UX. | Use after direct management basics. |
| Claudia | Source-backed memory review, relationship/context surfaces, commitment tracking patterns. | Avoid companion dark patterns or opaque emotional hooks. | Use for memory/context review surfaces. |
| NanoClaw | Forkable base philosophy, skill-installed capabilities, isolation/security patterns. | Do not make every fork capability core-owned. | Use for fork and extension guidance. |
| Industry guidance | Platform-native iOS/Android controls, transparent agent state, privacy boundaries, user control, interruptible voice turns, text fallback. | Do not imitate platform-hostile or engagement-seeking patterns. | Applies to every user-facing phase. |

## Immediate next action

Set up `ExpansionX/WednesdayAI-mobile` from Clawket and begin the product/brand conversion to
WednesdayAI.

That action should not start from upstream OpenClaw mobile or from old `WednesdayAI-core/apps/*`.
Those systems remain reference inputs for the roadmap and later cherry-picks.
