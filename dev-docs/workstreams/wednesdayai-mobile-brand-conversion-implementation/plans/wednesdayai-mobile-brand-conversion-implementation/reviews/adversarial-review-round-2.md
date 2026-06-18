# Adversarial Review Round 2

Topic: `wednesdayai-mobile-brand-conversion-implementation`

Branch reviewed: `codex/add-wednesdayai-mobile-slice`

Reviewed range: `codex/wednesdayai-mobile-init..668269d5a44aa0cc42f6990dda60942f41f1f279`

## Review environment

The user requested Codex, Gemini, and Opus adversarial review after `/wai:execute`, `/dr:adversarial-review`, PR creation, and `/dr:document`.

The branch was clean, pushed, and open as PR #3 before this round. Reviewers were asked whether the plan was followed, where it diverged, whether divergence needed documentation, and whether unnecessary divergence should be remediated.

## Reviewer verdicts

### Codex

Verdict: `REVISE`

Accepted findings:

- App config display and permission copy had been converted, but settings version/share/rate copy and chat poster branding still presented Clawket on ID-free visible app surfaces.
- New manual connection creation still defaulted to OpenClaw even though `wednesdayai` was now a first-class backend option.
- The post-execution documentation refresh broadened the diff beyond the original task-file implementation list and needed an explicit rationale if retained.

### Gemini

Verdict: `APPROVE`

Gemini did not find blocking issues. Its tool mode was more constrained than the other reviewers, so this approval was treated as useful but weaker evidence.

It classified the QR, relay claim, manual auth, and docs-link remediations from round 1 as necessary divergences because they prevented `wednesdayai` identity loss.

### Opus

Verdict: `APPROVE WITH SHOULD-FIX`

Accepted finding:

- Mixed in-app brand remained after merge. `Clawket Pro`, Clawket CLI/Bridge, and OpenClaw-specific help were defensibly retained, but settings version/share/rate/poster branding were ID-free app identity surfaces that needed either remediation or a clear confirmation note.

Opus also noted that `SELF_HOSTING_MODEL.md` still existed while READMEs now point to `docs/self-hosting.md`.

## Assessment

The original plan was followed for the narrow task-file sequence, but the plan under-scoped visible app identity by treating app-visible conversion as native config and permission copy only.

That divergence was not needed and could produce a user-facing mixed-brand experience. It was remediated.

The documentation refresh was a real divergence from the original implementation task list, but it was needed because the user explicitly requested user, developer, and admin documentation after the PR was created. It is retained and documented as a post-execution docs update, not as a production identifier migration.

## Remediation

Implemented fixes:

- New create-editor defaults now start as `wednesdayai` plus `custom` transport.
- The editor still uses the existing OpenClaw-compatible auth helper for WednesdayAI and OpenClaw direct configs.
- Settings version, share, rate, and share payload strings now use WednesdayAI through all six config locales.
- Chat share poster branding now uses the localized WednesdayAI app label through all six chat locales.
- The manual connection help now shows when the selected backend requires OpenClaw-compatible direct auth, so the new WednesdayAI default is not left without guidance.
- `docs/setup/brand-conversion-first-slice-hit-classification.md`, this review record, and the decisions ledger now record why the app-visible remediation happened and why the documentation refresh stayed in scope.
- `docs/self-hosting.md` and `SELF_HOSTING_MODEL.md` now clarify that `docs/self-hosting.md` is the maintained audience-facing guide and the root file is legacy source material.

Retained intentionally:

- `Clawket Pro` billing/product entitlement copy.
- Clawket CLI, Bridge, package, command, storage-key, and relay compatibility copy.
- OpenClaw-specific help and setup copy.
- Native IDs, app groups, Expo owner/project/slug/scheme, public CLI name, npm scope, relay domains, hosted URLs, store IDs, and YouMind disposition.

## Focused Re-Review

After remediation, Gemini performed a focused read-only re-review and returned `APPROVE` with only informational findings. It confirmed that the mixed visible app identity issue was fixed, the manual editor default remains `wednesdayai` plus `custom` transport, retained Clawket/OpenClaw/Hermes/YouMind hits are justified, and no blocking regression was detected.

Focused Codex and Opus reruns were started in read-only/plan modes but produced no actionable output before being interrupted. Their earlier completed round-2 findings were the basis for the remediation above.

## Verification

- `node -e "for (const f of process.argv.slice(1)) JSON.parse(require('fs').readFileSync(f,'utf8'));" apps/mobile/src/i18n/locales/{en,zh-Hans,ja,ko,de,es}/config.json apps/mobile/src/i18n/locales/{en,zh-Hans,ja,ko,de,es}/chat.json` passed.
- Locale parity check for all six `config.json` and `chat.json` files passed.
- `npm run mobile:test -- --runInBand apps/mobile/src/screens/ConfigScreen/qrPayload.test.ts apps/mobile/src/screens/ConfigScreen/QRScannerScreen.test.ts apps/mobile/src/hooks/gatewayScanFlow.test.ts apps/mobile/src/hooks/useGatewayConfigForm.test.ts apps/mobile/src/services/gateway-doc-links.test.ts apps/mobile/src/services/gateway-backends.test.ts` passed with 6 suites and 100 tests.
- `npm run mobile:config:check` passed.
- `git diff --check` passed.
- README pair and identity-hit classification scans were rerun and reviewed.

Expected known exception:

- Full `npm run mobile:typecheck` remains a pre-existing native component typing baseline failure recorded in the decisions ledger. The failure cluster is still `WebView`, `BlurView`, `CameraView`, and `WebViewMessageEvent.nativeEvent`; this round did not broaden scope to repair that baseline.
