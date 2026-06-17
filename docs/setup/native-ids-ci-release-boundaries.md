# Native ID and CI/Release Boundary Inventory

## Current native identifiers

- iOS `bundleIdentifier`: `com.expansionx.clawket` from `apps/mobile/app.json:18`.
- Android package/application id: `com.expansionx.clawket` from `apps/mobile/app.json:44`.
- Expo scheme/deep-link scheme: `clawket` from `apps/mobile/app.json:108`.
- Share extension bundle id: `com.expansionx.clawket.expo-sharing-extension` from `apps/mobile/app.json:117`.
- App group identifier: `group.com.expansionx.clawket` from `apps/mobile/app.json:120`.
- No replacement production native identifiers are chosen in this document.

## Expo and EAS identifiers

- Expo owner: `p697` from `apps/mobile/app.json:131`.
- EAS project id: `972e845f-da81-44db-a908-24be4ca80288` from `apps/mobile/app.json:128`.
- `apps/mobile/eas.json` requires EAS CLI `>= 18.0.0`, uses `appVersionSource: remote`, defines `development`, `preview`, `testflight`, and `production` build profiles, and defines empty `testflight` and `production` submit profiles.
- `apps/mobile/app.config.js:32-40` derives version from `apps/mobile/package.json` and can override `appleTeamId` from `EXPO_APPLE_TEAM_ID`.
- Final Expo owner, EAS project id, and EAS ownership policy need human confirmation.

## Signing and app groups

- Current Apple team id in static app config: `C97YF26G4F` from `apps/mobile/app.json:36`.
- `EXPO_APPLE_TEAM_ID` is present as a local/release-engineering placeholder in `apps/mobile/.env.example`.
- `EXPO_ANDROID_VERSION_CODE` is present as a local/release-engineering placeholder in `apps/mobile/.env.example`.
- Android release signing is wired through `./plugins/with-android-release-signing` from `apps/mobile/app.json:104`.
- iOS JSC build settings are wired through `./plugins/with-ios-jsc-build-settings` from `apps/mobile/app.json:105`.
- Final Apple team id, signing credentials, Android upload keystore, app groups, and store signing setup need human confirmation and must not be committed as secrets.

## CI state

- Required workflow scan found no `.github` workflow, `.yml`, `.yaml`, or `*workflow*` files at max depth 3.
- No GitHub Actions workflow boundary exists yet in this repository snapshot.
- Future CI setup must cover install, mobile config checks, typecheck, tests, bridge package verification, relay tests/typechecks, and release dry-run boundaries before enabling store or package publication.

## Release scripts

- Mobile config validation scripts exist in `apps/mobile/package.json:27-29`: `config:check`, `config:check:android`, and `config:check:ios`.
- Mobile Android scripts exist in `apps/mobile/package.json:22-24`: `build:android:aab`, `build:android:apk`, and `build:android:pro-temp`.
- Mobile macOS scripts exist in `apps/mobile/package.json:19-21`: `build:macos`, `archive:macos`, and `export:macos`.
- Root mobile orchestration scripts call the `clawket` workspace for config, Android, and macOS flows: `package.json:35-40`.
- Future renames must update root orchestration and mobile package scripts together.

## Relay deploy units

- Relay wrangler configs found by the required scan:
  - `apps/relay-registry/wrangler.toml`
  - `apps/relay-worker/wrangler.toml`
  - `apps/hermes-relay-registry/wrangler.toml`
  - `apps/hermes-relay-worker/wrangler.toml`
- Root relay dev/deploy/tail scripts use `scripts/relay/run-wrangler.mjs`: `package.json:47-63`.
- Relay deploy scripts include `relay:deploy:registry`, `relay:deploy:worker`, `relay:deploy:hermes-registry`, and `relay:deploy:hermes-worker`: `package.json:53-56`.
- Relay deploy unit names, worker names, KV/Durable Object bindings, domains, and public headers are release boundaries and need explicit compatibility review before renaming.

## Bridge publish path

- Bridge CLI package verification script is `verify:package`: `apps/bridge-cli/package.json:40`.
- Bridge CLI publish dry-run script is `publish:dry-run`: `apps/bridge-cli/package.json:42`.
- Root bridge publish boundary scripts target current public package `@p697/clawket`: `package.json:68-69`.
- Public package publish names, npm scope, CLI package name, CLI binary name, config directories, and migration aliases need human confirmation.

## Secrets and placeholders

- Mobile `.env.example` contains public analytics, RevenueCat, support, privacy, terms, docs, OpenClaw release URLs, Office dev URL, YouMind OAuth/client placeholders, `EXPO_APPLE_TEAM_ID`, and `EXPO_ANDROID_VERSION_CODE`.
- Bridge `.env.example` contains default Clawket registry URLs: `CLAWKET_PACKAGE_DEFAULT_REGISTRY_URL=https://registry.clawket.ai` and `CLAWKET_PACKAGE_DEFAULT_REGISTRY_FALLBACK_URL=https://clawket-registry.clawket.workers.dev`.
- Required config scan found no Dockerfile at max depth 3.
- Signing material, upload keystores, EAS credentials, store credentials, analytics secrets, billing secrets, relay/cloud secrets, and production tokens must stay outside the repository.

## Confirmation points

- Final iOS bundleIdentifier.
- Final Android package/application id.
- Final Expo scheme, slug, owner, and EAS project id.
- Final share extension bundle id and app group.
- Final Apple team id and signing identities.
- Final App Store and Play Store listing identifiers.
- Final Android upload keystore and release-signing flow.
- Final CI provider, GitHub Actions workflow names, and required checks.
- Final relay worker names, wrangler deploy targets, KV/Durable Object names, hosted domains, and compatibility aliases.
- Final bridge public package name, public npm scope, CLI binary name, publish process, and migration policy.

## Verification

- Re-run the required `rg` scans for `bundleIdentifier`, Android package, scheme, owner, projectId, appleTeamId, app groups, and `com.expansionx.clawket` before changing app config.
- Re-run workflow scans and record whether `.github` workflows exist before adding CI.
- Run mobile config checks before release changes: `npm run mobile:config:check`, `npm run mobile:config:check:ios`, and any Android-specific config check required by the implementation task.
- Run relay typecheck/test and deploy dry-run or staging deploy checks before changing wrangler deploy units.
- Run bridge build, typecheck, tests, `verify-package`, and `publish:dry-run` before changing public package publication settings.
