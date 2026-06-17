# Breakdown Review Round 1

Date: 2026-06-17

Reviewer set:

- Challenger A: same-family subagent, surgical mechanics.
- Challenger B: same-family subagent, fidelity and completeness.
- Challenger C: same-family subagent, executor gate and WAI contract.

Note: the requested Opus/Codex/Gemini bridge set was not available in this session. Three independent same-family challenger contexts were used instead.

## Verdict

VERDICT: REVISE

## Verified findings and fixes

### F1: SC2 was not fully enforced in `ROADMAP.md`

Finding: task `002` required source names and broad order, but did not require concrete per-source cherry-pick ideas inside `ROADMAP.md`.

Fix: task `002` now requires a concrete cherry-pick entry for Clawket, upstream OpenClaw, WednesdayAI-core, Saturday apps, Hermes Desktop, ArgentOS, opcode, Claudia, NanoClaw, and industry guidance. Manual verification now checks those entries.

### F2: SC5 OpenClaw-derived compatibility was only a heading

Finding: task `005` claimed SC5 but did not require explicit OpenClaw-derived protocol compatibility boundaries.

Fix: task `005` now requires retained pairing payload fields, gateway request/response semantics, relay compatibility, auth/token handling, and migration fallbacks to be named as compatibility surfaces.

### F3: SC9 brand/tone compliance was not task-local

Finding: several foundational docs relied on the global plan note but did not locally require WednesdayAI naming, `wednesdayai` identifiers, Australian English, direct tone, OpenClaw heritage acknowledgement, and no upstream disparagement.

Fix: tasks `002`, `005`, `006`, `007`, and `008` now require and manually verify brand/tone compliance.

### F4: Task `008` left local reference-scan inputs undefined

Finding: task `008` required source-system claims to be grounded in a local scan, but did not name the paths or commands to inspect.

Fix: task `008` now names the required local scan inputs and requires the exact inputs to be recorded in the decisions ledger.

### F5: Architecture docs lacked cross-directory sibling/reference alignment

Finding: tasks `005`-`008` create new docs under `docs/architecture/`, while related docs already exist under `docs/relay/`, `docs/bridge/architecture/`, and `docs/mobile/`.

Fix: tasks `005`-`008` now list relevant sibling/reference docs in `files:`, require them to be read before writing, and require divergences to be recorded in the decisions ledger.

### F6: `Done when` commands lacked inline WAI gate env

Finding: all eight tasks used bare `bash ~/.claude/wai/scripts/task-gate.sh ...` commands.

Fix: all task `Done when` sections now use inline `WAI_TYPECHECK_CMD=":" WAI_TEST_CMD=":"` gate commands and state that manual verification must be recorded in the decisions ledger first.

## Verification after fixes

`bash /Users/david/.codex/plugins/cache/agent-plugins/wai/0.13.0/scripts/wai-plan-lint.sh wednesdayai-mobile-init` passes with SC coverage enforced. Remaining warnings are the acknowledged root `AGENTS.md` sibling warnings recorded in `docs/plans/wednesdayai-mobile-init/decisions-ledger.md`.
