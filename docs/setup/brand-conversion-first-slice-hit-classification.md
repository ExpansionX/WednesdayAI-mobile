# Brand Conversion First Slice Hit Classification

## Scope

This report classifies identity-related hits from the first WednesdayAI Mobile behaviour-changing slice. It covers tasks 000-004: pre-edit confirmation points, paired README framing, app config display and permission copy, the minimal `wednesdayai` backend descriptor, and explicit backend dispatch.

Post-execution adversarial reviews also required two follow-up classifications:

- ID-free visible app shell strings and the new manual connection default are part of the safe visible identity slice and were converted to WednesdayAI.
- The documentation refresh requested after execution is retained as source-backed user/admin/developer documentation, not as a production identifier migration.
- Round-3 review converted the in-app GitHub repository destination, fixed a WednesdayAI main-session regression, removed duplicated WednesdayAI poster branding, and aligned stale macOS submission bundle-ID guidance with the current checked-in native ID.
- The final code-review loop fixed stale Hermes pairing and self-hosting registry documentation, root-level release command examples and artifact paths, iOS lifetime-product validation guidance in both root and app-local release docs, and WednesdayAI-inclusive chat recovery copy. These remediations were needed because they corrected behaviour or admin guidance the first implementation slice now exposes; they did not choose new production identifiers.
- A subsequent standards/doc review aligned the mobile architecture instructions with the implemented `wednesdayai` backend identity, made WednesdayAI manual connection help backend-neutral instead of OpenClaw-specific, split self-hosting relay instructions into OpenClaw-compatible and Hermes Relay paths, and marked stale Catalyst enablement plans as historical now that Mac Catalyst scripts exist.

Task 000 recorded confirmation-bound surfaces before implementation edits began.

## Commands run

The exact task commands were run after the WAI per-task commits had left the worktree clean:

```bash
git diff --name-only
git diff --name-only | tr '\n' '\0' | xargs -0 rg -n "Clawket|OpenClaw|Hermes|YouMind|clawket|openclaw|hermes|youmind"
git diff --name-only | tr '\n' '\0' | xargs -0 rg -n "GatewayTransportKind|GatewayMode|isGatewayTransportKind|wednesdayai"
```

All three exact clean-worktree commands returned no implementation-file output.

To cover every implementation file changed by tasks 000-004 after per-task commits, the same scans were also run over the execution commit range:

```bash
git diff --name-only aec8afc..HEAD
git diff --name-only aec8afc..HEAD | tr '\n' '\0' | xargs -0 rg -n "Clawket|OpenClaw|Hermes|YouMind|clawket|openclaw|hermes|youmind"
git diff --name-only aec8afc..HEAD | tr '\n' '\0' | xargs -0 rg -n "GatewayTransportKind|GatewayMode|isGatewayTransportKind|wednesdayai"
git diff --name-only aec8afc..HEAD | rg "^(\\.\\./|/Users/lucy|/Users/david/.*/openclaw|/Users/lucy/.hermes|WednesdayAI-core|openclaw/|hermes-agent/)" || true
```

The range file list covered `README.md`, `README.zh-CN.md`, `apps/mobile/app.json`, backend type/descriptor/test files, `useAppBootstrap`, `ConfigScreenLayout`, all six touched config locale files, every explicit-dispatch call site, the task ledger, and the task 000 confirmation document. The external repository scan returned no matches.

## README paired-change check

`README.md` and `README.zh-CN.md` changed together.

Both README files now lead with `WednesdayAI Mobile`, describe the repository as a hard fork of Clawket, preserve OpenClaw heritage, and keep OpenClaw and Hermes compatibility explicit.

Remaining README Clawket hits are classified as hard-fork attribution, current package/command/default compatibility, asset filenames, App Store asset names, or proprietary module path. `@p697/clawket`, `clawket pair`, `CLAWKET_REGISTRY_URL`, relay examples, asset filenames, and the App Store URL remained unchanged.

## App config safe-copy check

`apps/mobile/app.json` changed only `expo.name` and permission copy from `Clawket` to `WednesdayAI`.

Confirmation-bound values stayed unchanged, including `slug: clawket`, `scheme: clawket`, `owner: p697`, iOS bundle ID `com.expansionx.clawket`, Android package `com.expansionx.clawket`, share extension bundle ID, app group `group.com.expansionx.clawket`, Apple team, asset paths, and EAS project ID `972e845f-da81-44db-a908-24be4ca80288`.

Round-2 review found the first pass under-scoped app-visible identity by limiting it to native config and permission copy. The following ID-free app surfaces are now WednesdayAI as well:

- Settings version label.
- Settings share/rate action labels and share payload text.
- Chat share poster app branding.
- New manual connection editor default backend identity.
- Settings and release-announcement GitHub links now point to the WednesdayAI Mobile repository.

These changes do not pick a final bundle ID, package ID, app group, Expo slug/scheme/owner, store listing ID, public CLI name, npm scope, relay domain, or billing product name.

## Backend descriptor check

`wednesdayai` was added as backend identity only, not transport identity.

The changed backend descriptor files add `wednesdayai` to `GatewayBackendKind`, `BACKENDS`, capability lookup, backend type guard coverage, backend label copy, and the direct consumers scoped in this first slice. Follow-up adversarial review also verified and remediated QR parsing, relay claim, manual editor auth, and docs-link seams so saved WednesdayAI configs keep their backend identity. `GatewayTransportKind`, `GatewayMode`, relay transport detection, and connection-route logic did not add `wednesdayai`.

Focused backend tests cover:

- `resolveGatewayBackendKind({ backendKind: 'wednesdayai' })`
- `getGatewayBackendDescriptor('wednesdayai')`
- `isGatewayBackendKind('wednesdayai')`
- `isGatewayTransportKind('wednesdayai') === false`
- explicit `selectByBackend('wednesdayai', ...)`
- `resolveGlobalMainSessionKey('wednesdayai')`
- WednesdayAI relay/custom labels and default relay name
- QR parsing and relay claim preservation for `backendKind: 'wednesdayai'`
- WednesdayAI manual editor credential preservation
- WednesdayAI Nodes documentation routing
- WednesdayAI per-agent session preservation through the same global-main-session helper used by OpenClaw, Hermes, and YouMind.

OpenClaw, Hermes, and retained YouMind compatibility remain explicit.

## Remaining hit classifications

### Converted in this slice

- README primary product name and introductory framing now use `WednesdayAI Mobile`.
- App display name and OS permission copy now use `WednesdayAI`.
- Backend identity now includes `wednesdayai`.
- Explicit dispatch call sites now include deliberate `wednesdayai` branches.
- All six mobile config locale files include `WednesdayAI` backend and app-shell keys. All six chat locale files include the poster branding product label.
- App GitHub links now resolve to `https://github.com/ExpansionX/WednesdayAI-mobile`.
- Mac Catalyst submission guidance now names the current checked-in iOS bundle ID `com.expansionx.clawket` instead of the stale `com.p697.clawket`.
- Chat connection recovery copy now tells users to check WednesdayAI, OpenClaw, or Hermes when the default WednesdayAI backend cannot be reached.
- WednesdayAI manual direct-auth help now avoids `openclaw.json` and OpenClaw Gateway wording; OpenClaw manual help keeps the OpenClaw-specific auth-file instructions.

### Compatibility or attribution

- `OpenClaw` remains for inherited backend compatibility, OpenClaw-specific config screens, OpenClaw protocol docs, OpenClaw release/permission surfaces, and hard-fork heritage.
- `Hermes` remains for Hermes backend compatibility, Hermes-specific bridge/model/cron handling, and Hermes documentation.
- `Clawket` remains where it describes hard-fork source/history, current bridge/package/command compatibility, Clawket Pro billing/product entitlement copy, OpenClaw-specific help/setup flows, or retained release-boundary values.
- `YouMind` remains in the existing backend support matrix and saved-account flows; this slice does not decide YouMind disposition.

### Documentation follow-up retained after review

The documentation refresh added or aligned user/admin/developer guidance after execution at the user's request. These docs are retained because they describe current compatibility and release boundaries without changing production identifiers:

- `docs/self-hosting.md`
- `docs/mobile/android-build.md`
- `docs/mobile/ios-app-store-release.md`
- `docs/mobile/macos-app-store-submission.md`
- `docs/mobile/macos-catalyst-plan.md`
- `docs/mobile/macos-dev.md`
- `apps/mobile/docs/android-build.md`
- `apps/mobile/docs/android-onboarding.md`
- `apps/mobile/docs/ios-app-store-release.md`
- `apps/mobile/docs/google-play-closed-testing.md`
- `apps/mobile/docs/macos-app-store-submission.md`
- `apps/mobile/docs/macos-catalyst-plan.md`
- `apps/mobile/docs/macos-dev.md`
- `docs/architecture/wednesdayai-backend-descriptor-plan.md`

The root `SELF_HOSTING_MODEL.md` remains legacy planning/source material. `docs/self-hosting.md` is the maintained audience-facing self-hosting guide.

### Current package, command, path, persisted data, or release boundary

- `@p697/clawket`, `clawket pair`, `CLAWKET_REGISTRY_URL`, bridge scripts, relay examples, storage keys such as `clawket.*`, package/workspace names, asset filenames, native IDs, app groups, owner/project identifiers, and store/listing references remain current compatibility or release-boundary values.
- App Store, Android Play, local module, and storage references retain existing identifiers unless a later human-confirmed migration changes them.
- Billing product identifiers such as `com.p697.clawket.pro.*` remain retained Clawket-era commerce identifiers until a scoped billing migration changes them.
- Hermes pairing documentation preserves the current command boundary: default `clawket pair` uses Hermes Relay for Hermes, while `clawket pair --local` remains the explicit local-pairing escape hatch.
- README self-hosting documentation now distinguishes OpenClaw registry requirements from Hermes Relay's production-registry default and the `CLAWKET_HERMES_REGISTRY_URL` self-hosting override.
- Root-level Android and iOS release docs use root-safe npm commands, explicit `cd apps/mobile` / `cd apps/mobile/android` context, or `apps/mobile/*` paths; app-local commands remain appropriate only in app-local docs.
- The maintained self-hosting guide now documents separate OpenClaw-compatible relay and Hermes Relay worker stacks and pairing commands.
- The Catalyst plan docs are retained as historical planning context and point to the active macOS development and submission runbooks.

### Pending confirmation

- Final iOS bundle ID, Android package ID, share extension bundle ID, app group, Expo scheme, Expo slug, Expo owner, EAS project ID, Apple team, store listing IDs, public npm scope, public CLI name, relay domains, worker names, hosted docs/support/legal URLs, store metadata, and YouMind disposition remain unchosen.

## Confirmation points not chosen

This slice did not choose final native IDs, app groups, Expo owner/project values, public package names, public CLI names, relay domains, worker names, hosted URLs, store metadata, or YouMind disposition.

Current values such as `com.expansionx.clawket`, `group.com.expansionx.clawket`, `clawket`, `p697`, `972e845f-da81-44db-a908-24be4ca80288`, `@p697/clawket`, `clawket pair`, and Clawket relay names remain unchanged.

## External repository boundary

No external OpenClaw, Hermes, or WednesdayAI-core path appears in `git diff --name-only aec8afc..HEAD`.

No files outside this repository were modified.
