# Breakdown Review Round 2

Date: 2026-06-17

Reviewer set:

- Challenger A: same-family subagent, round-1 remediation check.
- Challenger B: same-family subagent, fidelity lens.
- Challenger C: same-family subagent, WAI gate lens.

## Verdict

VERDICT: REVISE

## Verified findings and fixes

### F1: Task `008` did not pin OpenClaw evidence inputs

Finding: `008` required an upstream OpenClaw section but did not name the local OpenClaw Android/iOS/macOS reference files.

Fix: task `008` now requires scanning:

- `/Users/david/Code/reference/agents/openclaw/apps/android/README.md`
- `/Users/david/Code/reference/agents/openclaw/apps/ios/README.md`
- `/Users/david/Code/reference/agents/openclaw/apps/macos/README.md`

### F2: Task `008` did not pin old WednesdayAI-core app evidence inputs

Finding: `008` required WednesdayAI-core app claims but did not name old app reference files.

Fix: task `008` now requires scanning:

- `/Users/david/Code/WednesdayAI-core/apps/android/README.md`
- `/Users/david/Code/WednesdayAI-core/apps/ios/README.md`
- `/Users/david/Code/WednesdayAI-core/apps/macos/README.md`

### F3: Task `008` used loose opcode/Claudia/NanoClaw language

Finding: `008` said to scan directory listings for equivalents "if present".

Fix: task `008` now names exact directories:

- `/Users/david/Code/reference/agents/opcode`
- `/Users/david/Code/reference/agents/claudia`
- `/Users/david/Code/reference/agents/nanoclaw`

### F4: Roadmap/reference evidence order could invalidate `ROADMAP.md`

Finding: `002` created `ROADMAP.md` before `008` performed the reference scan.

Fix: task `002` now performs the same read-only scan before writing `ROADMAP.md` and records the scan inputs in the decisions ledger.

### F5: `SETUP.md` and `FORKING.md` still lacked task-local SC9 checks

Finding: tasks `003` and `004` claimed SC9 but did not explicitly require and verify all brand/tone constraints.

Fix: tasks `003` and `004` now require and manually verify WednesdayAI naming, `wednesdayai` identifiers, Australian English, direct tone, OpenClaw heritage acknowledgement, and no upstream disparagement.

### F6: Read-only reference files in `files:` weakened the create gate

Finding: tasks `005`-`008` listed existing read-only reference docs in `files:` while using `allowed_change: create`; the current gate would allow accidental modifications to those listed files.

Fix: tasks `005`-`008` now list only their created output file in `files:`. Read-only references are named in the task body and must be recorded in the decisions ledger. Decision `D2` records this gate-safety choice.

## Verification after fixes

`bash /Users/david/.codex/plugins/cache/agent-plugins/wai/0.13.0/scripts/wai-plan-lint.sh wednesdayai-mobile-init` passes with SC coverage enforced. Remaining warnings are the acknowledged root `AGENTS.md` sibling warnings recorded in `docs/plans/wednesdayai-mobile-init/decisions-ledger.md`.
