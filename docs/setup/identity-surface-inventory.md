# Identity Surface Inventory

## Root package and scripts

- Root package name is still `clawket`: `package.json:2`.
- Root mobile scripts target the private mobile workspace name `clawket`: `package.json:27-42`.
- Root relay scripts target `@clawket/shared`, `@clawket/registry-worker`, `@clawket/relay-worker`, `@clawket/hermes-registry-worker`, and `@clawket/hermes-relay-worker`: `package.json:44-45`.
- Root bridge scripts target `@clawket/bridge-core`, `@clawket/bridge-runtime`, and publishable CLI package `@p697/clawket`: `package.json:64-90`.

First-slice implication: private workspace names can be planned separately from public package names and CLI command names. Public npm scope and bin names need human confirmation before changing.

## Mobile app configuration

- Mobile package name is still `clawket`: `apps/mobile/package.json:2`.
- Expo app display name is `Clawket`: `apps/mobile/app.json:3`.
- Expo slug is `clawket`: `apps/mobile/app.json:4`.
- iOS bundle identifier is `com.expansionx.clawket`: `apps/mobile/app.json:18`.
- Android package/application id is `com.expansionx.clawket`: `apps/mobile/app.json:44`.
- Expo scheme is `clawket`: `apps/mobile/app.json:108`.
- EAS project id is `972e845f-da81-44db-a908-24be4ca80288`: `apps/mobile/app.json:128`.
- Expo owner is `p697`: `apps/mobile/app.json:131`.
- Share extension bundle id is `com.expansionx.clawket.expo-sharing-extension`: `apps/mobile/app.json:117`.
- App group is `group.com.expansionx.clawket`: `apps/mobile/app.json:120`.
- Permission copy still says Clawket for camera, photos, speech, and location: `apps/mobile/app.json:20-22`, `apps/mobile/app.json:65`, `apps/mobile/app.json:71-72`.
- `apps/mobile/app.config.js:2` and `apps/mobile/app.config.js:32` read package metadata to derive the native version.
- `apps/mobile/eas.json` was included in the required scan and produced no Clawket or identifier hits.

First-slice implication: visible app name and permission copy should become WednesdayAI in a later app-config task, but final bundle ids, app groups, scheme, slug, owner, and EAS project ownership need confirmation.

## Bridge CLI package

- Publishable bridge CLI package is `@p697/clawket`: `apps/bridge-cli/package.json:2`.
- CLI description says `Clawket CLI for pairing and running the Relay bridge runtime`: `apps/bridge-cli/package.json:7`.
- CLI binary name is `clawket`: `apps/bridge-cli/package.json:9`.
- CLI build/typecheck/test scripts depend on `@clawket/bridge-core` and `@clawket/bridge-runtime`: `apps/bridge-cli/package.json:23-26`.
- CLI package dependencies are `@clawket/bridge-core` and `@clawket/bridge-runtime`: `apps/bridge-cli/package.json:52-53`.
- Source and tests contain operational Clawket-owned paths, URLs, headers, QR payload names, and example commands such as `.clawket`, `clawket pair`, `registry.clawket.ai`, `relay.clawket.ai`, and `x-clawket-pairing-sync-secret`: examples include `apps/bridge-cli/src/diagnostics.test.ts:106-135` and `apps/bridge-cli/src/index.test.ts:205-218`.

First-slice implication: the CLI is product-facing and publishable. Renaming package, binary, global install command, config directory, relay domains, and header names is release-sensitive and should be planned separately from private workspace naming.

## Relay and shared packages

- Relay/shared package names are still in the `@clawket` scope: `apps/relay-registry/package.json:2`, `apps/relay-worker/package.json:2`, `apps/hermes-relay-registry/package.json:2`, `apps/hermes-relay-worker/package.json:2`, `packages/relay-shared/package.json:2`, `packages/bridge-core/package.json:2`, and `packages/bridge-runtime/package.json:2`.
- Relay workers import `@clawket/shared`: `apps/relay-worker/src/relay/auth.ts:1`, `apps/hermes-relay-worker/src/relay/auth.ts:1`, `apps/relay-registry/src/index.ts:14`, and `apps/hermes-relay-registry/src/index.ts:14`.
- Cloudflare worker names remain `clawket-registry`, `clawket-hermes-registry`, `clawket-relay`, and `clawket-hermes-relay`: `apps/relay-registry/wrangler.toml:1`, `apps/hermes-relay-registry/wrangler.toml:1`, `apps/relay-worker/wrangler.toml:1`, and `apps/hermes-relay-worker/wrangler.toml:1`.
- Required release/config scan found these files: `apps/bridge-cli/.env.example`, `apps/hermes-relay-registry/wrangler.toml`, `apps/hermes-relay-worker/wrangler.toml`, `apps/mobile/.env.example`, `apps/relay-registry/wrangler.toml`, and `apps/relay-worker/wrangler.toml`.
- Required workflow scan found no `.github` workflow, `.yml`, `.yaml`, or `*workflow*` files at max depth 3.

First-slice implication: relay deploy unit names, shared protocol package names, public headers, and hosted domain names are release and compatibility boundaries. They should not be renamed by broad product-copy replacement.

## App source and UI copy

- English locale files contain Clawket product copy and OpenClaw/Hermes/YouMind compatibility copy. Examples: `apps/mobile/src/i18n/locales/en/config.json:52`, `apps/mobile/src/i18n/locales/en/config.json:142-146`, `apps/mobile/src/i18n/locales/en/config.json:320-325`, `apps/mobile/src/i18n/locales/en/config.json:345-347`, and `apps/mobile/src/i18n/locales/en/chat.json:21`, `apps/mobile/src/i18n/locales/en/chat.json:73-74`, `apps/mobile/src/i18n/locales/en/chat.json:273-279`.
- OpenClaw-specific UI strings remain in `common`, `config`, and `console` namespaces; examples include `apps/mobile/src/i18n/locales/en/common.json:73-82`, `apps/mobile/src/i18n/locales/en/config.json:81`, and `apps/mobile/src/i18n/locales/en/console.json:583-586`.
- Hermes-specific UI strings remain in console and chat namespaces; examples include `apps/mobile/src/i18n/locales/en/console.json:12-20`, `apps/mobile/src/i18n/locales/en/console.json:227-229`, and `apps/mobile/src/i18n/locales/en/chat.json:67`, `apps/mobile/src/i18n/locales/en/chat.json:278-279`.
- YouMind UI strings remain in config, chat, and console namespaces; examples include `apps/mobile/src/i18n/locales/en/config.json:58-73`, `apps/mobile/src/i18n/locales/en/chat.json:323-383`, and `apps/mobile/src/i18n/locales/en/console.json:942-972`.
- Storage tests include `clawket.*` persisted key names: `apps/mobile/src/services/storage-last-session.test.ts:31-168`.

First-slice implication: app-facing Clawket copy should move to WednesdayAI through i18n updates across all supported locales. OpenClaw, Hermes, and retained YouMind strings need compatibility review instead of blanket replacement.

## Backend descriptors

- Backend identity currently allows `openclaw`, `hermes`, and `youmind`: `apps/mobile/src/types/index.ts:33`.
- Transport identity currently allows `local`, `tailscale`, `cloudflare`, `custom`, and `relay`: `apps/mobile/src/types/index.ts:34`.
- Legacy `GatewayMode` still includes transports plus `hermes`: `apps/mobile/src/types/index.ts:35`.
- Central backend capability descriptors are present: `OPENCLAW_CAPABILITIES`, `HERMES_CAPABILITIES`, `YOUMIND_CAPABILITIES`, and `BACKENDS`: `apps/mobile/src/services/gateway-backends.ts:49-147`.
- Backend and transport resolvers remain centralized through `isGatewayTransportKind`, `isGatewayBackendKind`, `resolveGatewayBackendKind`, `resolveGatewayTransportKind`, `selectByBackend`, and `getGatewayModeLabel`: `apps/mobile/src/services/gateway-backends.ts:153-252`.

First-slice implication: `wednesdayai` should be added later as backend identity through this registry pattern. It must not be added as a transport. OpenClaw, Hermes, and YouMind require explicit compatibility disposition.

## Documentation

- Current `README.md` and `README.zh-CN.md` are still Clawket-first, including title, npm badge, App Store image alt text, overview copy, bridge command examples, and proprietary speech module note: `README.md:2-17`, `README.md:47-74`, `README.md:103-128`, `README.md:216-222`, `README.md:274`; mirrored Chinese anchors include `README.zh-CN.md:2-17`, `README.zh-CN.md:47-74`, `README.zh-CN.md:101-126`, `README.zh-CN.md:214-220`, `README.zh-CN.md:272`.
- Foundational WednesdayAI docs are already present and define the conversion direction: `VISION.md:75-109`, `ROADMAP.md:36-57`, `SETUP.md:43-46`, and `FORKING.md:59-78`.
- Architecture docs already require `wednesdayai` as primary backend identity and preserve transport separation: `docs/architecture/backend-transport.md:11-31`, `docs/architecture/backend-transport.md:145-156`.

First-slice implication: README conversion must update `README.md` and `README.zh-CN.md` together. Foundational docs should be treated as the current WednesdayAI direction, not stale Clawket product copy.

## Keep as compatibility or attribution

- Keep OpenClaw where the text describes OpenClaw-derived protocol behaviour, OpenClaw config, OpenClaw diagnostics, OpenClaw host approval, or hard-fork attribution.
- Keep Hermes where the text describes Hermes backend compatibility, Hermes relay isolation, Hermes model selection, Hermes bridge/runtime state, or Hermes-specific UI.
- Keep YouMind only while the product decides to retain that backend; if removed, do it through a scoped migration.
- Keep Clawket where the text records historical attribution, the hard-fork source, current published package names, current command names, current persisted keys, current relay deploy units, or proprietary module paths until a compatibility migration chooses replacements.

## Convert to WednesdayAI

- Convert visible product identity from Clawket to WednesdayAI in app display name, app-facing permission copy, README overview/title copy, user-facing onboarding/help copy, release/update announcement copy, and future repository metadata.
- Convert private package/workspace names only after deciding the workspace naming scheme and verifying root scripts.
- Add `wednesdayai` as primary backend identity through central backend descriptors, not as a transport and not through screen-level conditionals.
- Update docs links and badges to WednesdayAI Mobile destinations once repository metadata is chosen.

## Needs human confirmation

- Final iOS bundle identifier.
- Final iOS share extension bundle identifier.
- Final app group identifier.
- Final Android package/application id.
- Final Expo scheme and deep-link policy.
- Final Expo slug.
- Final Expo owner and EAS project id or project ownership.
- Final Apple team, signing identities, store listing identifiers, support URLs, privacy URLs, and legal URLs.
- Final public npm scope, bridge CLI package name, and CLI binary name.
- Final relay/registry hosted domains, worker names, KV/Durable Object names, public headers, and whether old Clawket relay endpoints remain compatibility aliases.
- Final disposition for YouMind as a retained backend identity.
