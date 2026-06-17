# Visible Product Identity Conversion Plan

## Inputs

- `VISION.md` and `ROADMAP.md` make WednesdayAI Mobile the primary product identity.
- `docs/setup/identity-surface-inventory.md` identifies current Clawket app config, README, locale, update announcement, and compatibility label surfaces.
- `apps/mobile/AGENTS.md` requires React Native user-facing strings to go through `t()` and all six React Native locale files: `en`, `zh-Hans`, `ja`, `ko`, `de`, and `es`.
- `apps/mobile/AGENTS.md` also defines separate Office WebView locale handling for Office game strings.

## App configuration copy

- Visible product identity should become WednesdayAI or WednesdayAI Mobile where the user is seeing this product.
- App display name, permission prompts, notification-facing labels, deep-link display copy, splash/icon alt text, and store-facing descriptions should be treated as user-visible identity surfaces.
- Current app config copy still says Clawket in Expo display name and permission descriptions. A future implementation task should update those surfaces together and verify the native config output.
- App icons, splash assets, adaptive icons, screenshots, and App Store / Play Store preview assets are future implementation surfaces, not part of this docs-only task.
- Final store copy and final production app IDs are confirmation points and are not chosen by this plan.

## UI and i18n boundaries

- App UI string changes must go through `t()` when the changed string is user-facing.
- React Native locale updates must cover all six supported locale files: `en`, `zh-Hans`, `ja`, `ko`, `de`, and `es`.
- Existing locale keys that contain Clawket product identity should move to WednesdayAI wording only when the user is seeing this mobile product, not when the key describes a compatibility backend, migration command, historical source, or still-current package name.
- Office game strings follow the separate Office runtime locale rules: English fallback through the key and translations in the non-English Office locale files.
- Hardcoded screen/component strings should not be introduced during conversion.

## Release/update announcements

- Chat release/update modal copy is a visible product identity surface and should be reviewed for Clawket-to-WednesdayAI conversion.
- Any changed release/update announcement string must follow the same React Native six-locale rule.
- Release/update copy should keep OpenClaw and Hermes names where it describes compatibility support or backend-specific capabilities.
- Final store release notes, App Store text, Play Store text, screenshots, and preview descriptions need human review before release.

## Analytics labels

- Analytics names should move deliberately to WednesdayAI naming where they describe this app, release funnel, onboarding, pairing, or product-level outcomes.
- Analytics compatibility dimensions may still use `openclaw`, `hermes`, `youmind`, `local`, `relay`, `tailscale`, `cloudflare`, and `custom` when those values describe backend identity or transport identity.
- Analytics must not send message contents, secrets, auth tokens, raw URLs with tokens, high-cardinality user data, or sensitive gateway payloads.
- Analytics changes should stay centralized in the existing analytics helpers rather than scattered raw capture calls.

## Compatibility labels to keep

- Keep OpenClaw where the UI or docs identify an OpenClaw backend, OpenClaw config, OpenClaw diagnostics, OpenClaw host approval, OpenClaw install/update command, or OpenClaw-derived protocol compatibility.
- Keep Hermes where the UI or docs identify a Hermes backend, Hermes relay, Hermes local bridge, Hermes model selection, Hermes session/history, or Hermes-specific runtime action.
- Keep YouMind while retained as a compatibility backend and account/workspace surface; remove it only through a scoped migration if the product chooses not to retain it.
- Keep Clawket where the text is historical attribution, current hard-fork source, current published package, current command, current config path, current persisted key, current relay endpoint, or proprietary module path until an implementation task explicitly migrates that surface.

## Verification

- Run targeted `rg` checks for Clawket product copy after conversion and classify every remaining hit as compatibility, attribution, current package/command/path, persisted data, or pending follow-up.
- Verify all six React Native locale files stay aligned when user-facing strings change.
- Verify Office game locale files stay aligned when Office strings change.
- Verify OpenClaw and Hermes compatibility labels remain where backend-specific actions, diagnostics, or setup paths require them.
- Verify analytics changes do not include message contents, secrets, tokens, or raw token-bearing URLs.
- Verify app icons, splash assets, and store screenshots are inventoried separately before any asset replacement.

## Confirmation points

- Final visible app name: WednesdayAI or WednesdayAI Mobile.
- Final App Store and Play Store title, subtitle, description, keywords, screenshots, preview copy, release notes, support URL, privacy URL, and legal URL.
- Final app icon, splash, adaptive icon, and screenshot direction.
- Final production bundle/application IDs, scheme, app groups, EAS owner/project, and signing identities.
- Final policy for whether Clawket remains visible in migration copy, command compatibility, package compatibility, or legal attribution.
