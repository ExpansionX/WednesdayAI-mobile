# Adversarial Review Round 3

Topic: `wednesdayai-mobile-brand-conversion-implementation`

Branch reviewed: `codex/add-wednesdayai-mobile-slice`

Reviewed range: `origin/codex/wednesdayai-mobile-init...2bdcaca`

## Review environment

Target was a pushed branch diff. Push gate passed before dispatch:

- `HEAD`: `2bdcaca`
- upstream: `origin/codex/add-wednesdayai-mobile-slice`
- ahead/behind: `0/0`

Governing intent was the first small WednesdayAI Mobile brand-conversion implementation slice plus the later documentation-update request. Reviewers were asked to verify plan fidelity, classify divergence, and surface regressions with file/line evidence.

## Reviewer results

### Codex

Verdict: `REVISE`

Accepted findings:

- `[BLOCKING]` The shared GitHub repository URL still pointed at `https://github.com/p697/clawket`, so Settings and release-announcement actions opened the old Clawket repository instead of the WednesdayAI Mobile repository.
- `[SHOULD-FIX]` Chat share poster branding could render `WednesdayAI x WednesdayAI` for the primary WednesdayAI backend.
- `[SHOULD-FIX]` Both macOS App Store submission guides still instructed maintainers to use stale bundle ID `com.p697.clawket`, contradicting the current checked-in `com.expansionx.clawket` native-ID inventory and iOS release docs.

### Gemini

Verdict: `REVISE`

Accepted findings:

- `[BLOCKING]` `apps/mobile/App.tsx` reset every non-OpenClaw backend to agent `main`; because WednesdayAI uses the OpenClaw-compatible multi-agent baseline in this first slice, WednesdayAI connections would lose per-agent selection.
- `[SHOULD-FIX]` Some native developer docs still presented Clawket as the primary app display/product identity after the documentation refresh request.

Gemini ran in a constrained read-only/plan mode and reported tool limitations, but its cited `App.tsx` control-flow finding was verified locally and accepted.

### Opus

Opus was launched with the same prompt but did not produce actionable output within the review window. This round proceeded on the completed 2-of-3 challenger results, as allowed by the adversarial-review resilience rule.

## Consolidation

| # | Issue (cited) | Tag | Accepted? | Impact if shipped | Remediation |
|---|---------------|-----|-----------|-------------------|-------------|
| 1 | `apps/mobile/src/config/app-links.ts:1`, `apps/mobile/src/screens/ConfigScreen/ConfigScreenLayout.tsx:900`, `apps/mobile/src/features/app-updates/releases.ts:195` - app GitHub actions still opened `p697/clawket` | [BLOCKING] | yes | Converted product sends users to the wrong source repository | Point the shared app-link constant to `https://github.com/ExpansionX/WednesdayAI-mobile` and update imports |
| 2 | `apps/mobile/App.tsx:531` - non-OpenClaw backends were forced to `main` | [BLOCKING] | yes | WednesdayAI would lose OpenClaw-compatible per-agent selection | Use `resolveGlobalMainSessionKey(backendKind)` so only global-main backends are forced |
| 3 | `apps/mobile/src/screens/ChatScreen/components/ChatSharePosterModal.tsx:190,288` - WednesdayAI backend could render duplicated branding | [SHOULD-FIX] | yes | User-facing poster reads `WednesdayAI x WednesdayAI` | Render a single WednesdayAI label when the backend label already equals the product label |
| 4 | `apps/mobile/docs/macos-app-store-submission.md:41-45`, `docs/mobile/macos-app-store-submission.md:41-45` - stale `com.p697.clawket` submission instruction | [SHOULD-FIX] | yes | Release docs contradict current checked-in native ID and can send maintainers to the wrong App Store Connect setup | Update both duplicated docs to `com.expansionx.clawket` and WednesdayAI Mobile product wording |
| 5 | `apps/mobile/docs/android-onboarding.md:5`, `apps/mobile/docs/macos-catalyst-plan.md:7,200`, `docs/mobile/macos-catalyst-plan.md:7,200` - product-facing developer-doc prose remained Clawket-first | [SHOULD-FIX] | yes | Documentation refresh remains visibly mixed-brand in safe prose surfaces | Reword product-facing prose to WednesdayAI Mobile while preserving retained Clawket-era paths and signing variables |

## Remediation

Implemented fixes:

- `apps/mobile/App.tsx` now derives forced global agent behaviour from `resolveGlobalMainSessionKey(backendKind)`, preserving WednesdayAI and OpenClaw per-agent selection while keeping Hermes and YouMind on `main`.
- `apps/mobile/src/config/app-links.ts` now exports `WEDNESDAYAI_MOBILE_GITHUB_REPO_URL` pointing to the WednesdayAI Mobile repository; Settings and app-update actions use it.
- `ChatSharePosterModal` now avoids `WednesdayAI x WednesdayAI` while retaining compatibility co-branding for non-WednesdayAI backends.
- macOS submission docs under both `apps/mobile/docs/` and `docs/mobile/` now name WednesdayAI Mobile and the current checked-in `com.expansionx.clawket` bundle ID.
- Android onboarding and Mac Catalyst planning prose now use WednesdayAI Mobile where the docs describe the product, without renaming retained Clawket-era env vars, file paths, app artifacts, or commerce identifiers.
- Decisions ledger and hit-classification docs were updated to explain the divergence and why each remediation stayed inside the first-slice boundary.

## Re-review

Focused local re-review after remediation:

- No `CLAWKET_GITHUB_REPO_URL` references remain.
- No production source renders a hard-coded `WednesdayAI x WednesdayAI` poster label; remaining mentions in this review record and the decisions ledger describe the remediated finding.
- No `com.p697.clawket` occurrence remains in macOS App Store submission docs; remaining `com.p697.clawket.pro.*` hits are billing-product identifiers retained by release-boundary scope.
- `App.tsx` no longer hardcodes an OpenClaw-only agent-preservation branch.

## Lessons Learned

The third review caught behaviour hidden behind retained compatibility labels. The first two rounds treated visible identity as copy and descriptor work, but the real product experience also included outbound repository links, session-selection control flow, and generated poster composition. Future brand slices should review action destinations and runtime state guards, not just labels.

Standing debt accepted: Clawket-era package names, CLI names, app IDs, paths, billing product IDs, storage keys, and store listing references remain until scoped human-confirmed migrations change them.
