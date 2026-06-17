---
id: "002"
phase: 1
title: Create the ordered WednesdayAI Mobile roadmap
status: ready
depends_on: ["001"]
parallel: false
conflicts_with: []
files:
  - ROADMAP.md
irreversible: false
scope_test: "N/A"
allowed_change: create
covers_criteria: [SC2, SC3, SC9, SC10]
---
## Failing test (write first)
N/A - documentation creation task.

## Change
- **File:** `ROADMAP.md`
- **Anchor:** New top-level file; `test ! -e ROADMAP.md` should be true before this task starts.
- **Before:** File does not exist.
- **After:** Create `ROADMAP.md` with these sections, in this order:
  - `# WednesdayAI Mobile Roadmap`
  - `## Starting point`
  - `## Phase 0 - Foundational documents`
  - `## Phase 1 - Repository setup and brand conversion`
  - `## Phase 2 - WednesdayAI backend identity`
  - `## Phase 3 - Direct gateway management`
  - `## Phase 4 - Voice-first companion loop`
  - `## Phase 5 - Mobile extension surface`
  - `## Phase 6 - Native capability modules`
  - `## Phase 7 - Polish, release, and ecosystem`
  - `## Cherry-pick source matrix`
  - `## Immediate next action`

The content must state all of the following:

- Before writing, perform the same read-only source scan that task `008` will preserve in `docs/architecture/reference-systems.md`. Record the exact scan inputs in `docs/plans/wednesdayai-mobile-init/decisions-ledger.md`:
  - `apps/mobile/AGENTS.md`
  - `apps/mobile/package.json`
  - `apps/mobile/src/services/gateway-backends.ts`
  - `docs/mobile/android-build.md`
  - `docs/mobile/ios-app-store-release.md`
  - `docs/relay/ARCHITECTURE.md`
  - `/Users/david/Code/reference/agents/openclaw/apps/android/README.md`
  - `/Users/david/Code/reference/agents/openclaw/apps/ios/README.md`
  - `/Users/david/Code/reference/agents/openclaw/apps/macos/README.md`
  - `/Users/david/Code/WednesdayAI-core/docs/brand/BRAND-GUIDELINES.md`
  - `/Users/david/Code/WednesdayAI-core/apps/android/README.md`
  - `/Users/david/Code/WednesdayAI-core/apps/ios/README.md`
  - `/Users/david/Code/WednesdayAI-core/apps/macos/README.md`
  - `/Users/david/Code/Saturday/apps/README.md`
  - `/Users/david/Code/Saturday/apps/gateway/README.md`
  - `/Users/david/Code/reference/agents/hermes-agent/apps/desktop/README.md`
  - `/Users/david/Code/reference/agents/argentos-core/apps/ios/README.md`
  - `/Users/david/Code/reference/agents/opcode`
  - `/Users/david/Code/reference/agents/claudia`
  - `/Users/david/Code/reference/agents/nanoclaw`
- Clawket is the codebase source for the hard fork.
- Upstream OpenClaw mobile apps and old `WednesdayAI-core/apps/*` are reference sources, not implementation starting points.
- The immediate next action after the founding docs is to set up `ExpansionX/WednesdayAI-mobile` from Clawket and begin the product/brand conversion to WednesdayAI.
- The cherry-pick matrix includes Clawket, upstream OpenClaw Android/iOS/macOS, WednesdayAI-core, Saturday apps, Hermes Desktop, opcode, Claudia, NanoClaw, ArgentOS, and industry mobile/agentic-interface guidance.
- For each cherry-pick source, the matrix must include at least one concrete feature or idea to borrow and a short order note. Required minimum entries:
  - Clawket: Expo/RN app shell, release scripts, capability registry, QR pairing, console surfaces, speech and node/camera services.
  - Upstream OpenClaw Android/iOS/macOS: reconnect/session recovery, onboarding, diagnostics, native node capability direction, and voice/screen/canvas ideas.
  - WednesdayAI-core: brand, gateway/runtime contracts, plugin/skill architecture, workspace lanes, provider runtime, wake/nudge, and active-run recovery semantics.
  - Saturday apps: app-surface separation, gateway/client provider abstraction, voice package direction, and independent mobile lifecycle.
  - Hermes Desktop: first-run setup, runtime probes, persistent logs, live tool output, file browser, settings, updates, and "same agent/config/sessions" promise.
  - ArgentOS: mobile-node model, wake/voice tests, gateway discovery, keychain/session tests, screen/camera capability tests, and release automation.
  - opcode: project/session browser, background-agent timelines, checkpoints, MCP/plugin management, and usage analytics.
  - Claudia: source-backed memory review, relationship/context surfaces, and commitment tracking patterns.
  - NanoClaw: forkable base philosophy, skill-installed capabilities, and isolation/security patterns.
  - Industry guidance: platform-native iOS/Android controls, transparent agent state, privacy boundaries, user control, interruptible voice turns, and text fallback.
- The implementation order prioritises repository setup before backend identity, direct management before advanced extension UI, and voice-first interaction before text-only polish.
- Use WednesdayAI naming, `wednesdayai` code identifiers where appropriate, Australian English, direct tone, OpenClaw heritage acknowledgement, and no upstream disparagement.

## Allowed moves
- Create only `ROADMAP.md`.
- Do not edit `VISION.md`; if a roadmap item conflicts with the vision, stop and record the contradiction.

## STOP triggers
- `ROADMAP.md` already exists before the task starts.
- The roadmap would require implementation or repository import in this task.
- The task cannot cover SC2, SC3, and SC10 without changing the frozen spec.

## Manual verification (record in decisions-ledger)
- `test -f ROADMAP.md` exits 0.
- `rg -n "Clawket|upstream OpenClaw|WednesdayAI-core/apps|ExpansionX/WednesdayAI-mobile|Immediate next action|Cherry-pick source matrix|voice-first|Hermes Desktop|ArgentOS|opcode|Claudia|NanoClaw|Industry guidance|Hard fork of OpenClaw|WednesdayAI|wednesdayai" ROADMAP.md` returns matches.
- Read the phase order and confirm repository setup appears before backend identity and code conversion.
- Read the cherry-pick matrix and confirm each required source has at least one concrete feature or idea to borrow.
- Confirm the decisions ledger records the exact source-scan inputs used for the roadmap.
- Read the document and confirm it uses Australian English, direct tone, and no upstream disparagement.

## Done when
`WAI_TYPECHECK_CMD=":" WAI_TEST_CMD=":" bash ~/.claude/wai/scripts/task-gate.sh wednesdayai-mobile-init 002` exits 0 after the manual verification checks above are recorded in `docs/plans/wednesdayai-mobile-init/decisions-ledger.md`.
