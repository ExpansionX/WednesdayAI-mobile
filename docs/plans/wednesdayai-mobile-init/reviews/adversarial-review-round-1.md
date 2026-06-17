# Adversarial Review Round 1

Target: branch `codex/wednesdayai-mobile-init` at `f62f8d9`.

Governing intent: execute the docs-only `wednesdayai-mobile-init` plan faithfully, then ensure the
next implementation step is a Clawket hard fork into `ExpansionX/WednesdayAI-mobile`, not a restart
from upstream OpenClaw or old `WednesdayAI-core/apps/*`.

## Models run

| Challenger | How it ran | Result |
|------------|------------|--------|
| Codex | `codex exec` against the local checkout in read-only sandbox mode. | `VERDICT: REVISE`; found missing `apps/shared` evidence and stale workstream state. |
| Gemini | `gemini --approval-mode plan` against the local checkout. | `VERDICT: REVISE`; found missing wake mode/live activity priority. |
| Claude Opus | `claude -p --model opus --permission-mode plan` against the local checkout. | `VERDICT: APPROVE` with SHOULD-FIX follow-ups; found stale workstream state and missing backend disposition for `hermes`/`youmind`. |

## Consolidation

| # | Issue | Tag | Accepted? | Impact if shipped | Remediation |
|---|-------|-----|-----------|-------------------|-------------|
| 1 | `ROADMAP.md` phase 4 omitted `wake mode` and `live activity` even though the spec requires them ahead of text-only polish. | [SHOULD-FIX] | yes | Future voice work could under-prioritise always-visible agent state and permissible wake flows. | Added wake mode and live activity to `VISION.md` and `ROADMAP.md`. |
| 2 | `WednesdayAI-core/apps/shared` was named by the spec, but roadmap/reference evidence focused on Android/iOS/macOS and did not preserve `OpenClawKit` shared protocol/chat UI ideas. | [SHOULD-FIX] | yes | Future extraction work could miss shared protocol/UI knowledge while treating the core app scan as complete. | Added OpenClawKit/shared protocol reference points to `ROADMAP.md`, `docs/architecture/reference-systems.md`, and the decisions ledger. |
| 3 | `dev-docs/workstreams/wednesdayai-mobile-init/README.md` still said the next step was precheck/decompose after execution had passed. | [SHOULD-FIX] | yes | Later agents could rerun planning instead of starting repository setup/product conversion. | Updated the workstream status and next step. |
| 4 | `docs/architecture/backend-transport.md` did not state what happens to existing `hermes` and `youmind` backend identities when adding `wednesdayai`. | [SHOULD-FIX] | yes | The next backend implementation task could collapse backend identity into transport or leave stale screen branches. | Added explicit compatibility/removal disposition rules for `openclaw`, `hermes`, `youmind`, and `wednesdayai`. |
| 5 | `docs/architecture/reference-systems.md` says its cherry-pick order matches `ROADMAP.md`, but the lists are coarser than one-to-one. | [INFO] | no | Low; task 008 required that exact order and it is directionally consistent. | Accepted as wording debt; no code or process risk. |

## Lessons learned

The original execute loop proved the task files mechanically, but the cross-model pass caught gaps
between the task wording and the broader spec: voice priority language, `apps/shared` evidence, and
post-execution workstream state. The needed remediation was documentation alignment, not code
changes, because the implementation was intentionally docs-only.
