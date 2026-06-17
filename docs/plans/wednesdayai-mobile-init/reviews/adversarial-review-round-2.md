# Adversarial Review Round 2

## Target

Pushed branch `codex/wednesdayai-mobile-init` at
`6624b5df964c35692a9be8e9378f8df460164c25`, reviewed against the
`wednesdayai-mobile-init` WAI spec and decomposed plan.

## Resilience record

- Codex ran locally against the checkout with read-only sandboxing. It returned `REVISE`.
- Gemini ran locally through the CLI in plan/read-only mode. It returned `APPROVE` while still
  listing `[SHOULD-FIX]` findings, so the cited findings were treated as review findings.
- Opus was started through the local Claude CLI in plan mode but produced no review output after
  repeated polls. The run proceeded on the two completed families under the adversarial-review
  2-of-3 resilience rule.
- The linked `dr` `0.5.0` skill file was initially readable, but its referenced
  `references/challenger-prompt.md` was unavailable during execution. The challenger prompt was
  taken from the installed `0.4.0` skill reference with the same review contract.

## Consolidation

| # | Issue (cited) | Tag | Accepted? | Impact if shipped | Remediation |
|---|---------------|-----|-----------|-------------------|-------------|
| 1 | `ROADMAP.md:149`, `docs/architecture/reference-systems.md:98` — industry guidance compressed Apple HIG, Siri/App Intents, Material Design, responsible-agent transparency/accountability/inclusiveness, visible agent access/waiting/change/stop state, and undo/cancel expectations into generic platform/privacy wording despite the spec naming those guardrails. | [SHOULD-FIX] | yes | Future implementation tasks could treat industry guidance as cosmetic polish instead of concrete mobile and agentic-interface constraints. | Expanded `ROADMAP.md` and `docs/architecture/reference-systems.md` with the named guardrails and operational agent-state expectations. |
| 2 | `SETUP.md:32` — repository seed checklist named only root docs and omitted the architecture docs produced by the workstream. | [SHOULD-FIX] | yes | The new `WednesdayAI-mobile` repository could be seeded without the backend/transport, extension, extraction, and reference-system contracts. | Added the four `docs/architecture/*.md` artifacts to the setup import checklist. |
| 3 | `FORKING.md:62` — downstream fork attribution wording only gave the official WednesdayAI heritage statement. | [SHOULD-FIX] | yes | Fork authors could misstate provenance or imply their app is official WednesdayAI while trying to preserve OpenClaw heritage. | Added downstream fork wording that identifies the fork's relationship to WednesdayAI Mobile and preserves the OpenClaw heritage statement. |
| 4 | `docs/architecture/core-app-extraction.md:47` — the dedicated extraction guide still referred only to broad shared protocol ideas and did not explicitly name `apps/shared/OpenClawKit`. | [SHOULD-FIX] | yes | The later extraction workstream could miss the concrete shared package that prior review required preserving as reference material. | Added `apps/shared/OpenClawKit`, `OpenClawProtocol`, `OpenClawKit`, and `OpenClawChatUI` to the preservation inventory as reference-only material. |

## Lessons learned

The second pass caught places where the previous remediation was present in some documents but not
carried into the operational docs that the next implementation step will follow. The important
pattern is to propagate review fixes into the setup checklist and extraction guide, not only the
vision and roadmap. The run also exposed a tooling issue in the `dr` plugin cache: the `0.5.0`
skill path referenced by the invocation did not retain its companion prompt file, so this review
had to fall back to the installed `0.4.0` reference prompt.

## Post-remediation verification

- `rg -n "Apple Human Interface Guidelines|Siri/App Intents|Material Design|accountability|inclusiveness|what the agent can access|what it is waiting on|what it changed|how to stop it|undo/cancel" ROADMAP.md docs/architecture/reference-systems.md`
  found the expanded industry guardrails.
- `rg -n "backend-transport.md|mobile-extension-contract.md|core-app-extraction.md|reference-systems.md" SETUP.md`
  found the architecture import checklist.
- `rg -n "fork of WednesdayAI Mobile|Hard fork of OpenClaw" FORKING.md` found both downstream
  fork attribution and official heritage wording.
- `rg -n "OpenClawKit|OpenClawProtocol|OpenClawChatUI" docs/architecture/core-app-extraction.md`
  found the named shared package preservation inventory.
- `bash /Users/david/.codex/plugins/cache/agent-plugins/wai/0.13.0/scripts/wai-plan-lint.sh wednesdayai-mobile-init`
  passed.
- `bash /Users/david/.codex/plugins/cache/agent-plugins/wai/0.13.0/scripts/wai-evidence.sh wednesdayai-mobile-init`
  skipped as expected for `change_kind=docs`.
