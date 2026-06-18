---
doc_type: spec
status: shipped
workstream: wednesdayai-mobile-brand-conversion-implementation
change_kind: behaviour
---

# WednesdayAI Mobile Brand Conversion Implementation

**Date:** 2026-06-17
**Status:** shipped by `/wai:close`
**Author:** David Rudduck (via agent)

## Intent (what / why)

Implement the first small, safe behaviour-changing product and brand conversion slice for WednesdayAI Mobile.

The previous `wednesdayai-mobile-repo-setup-brand-conversion` workstream finished the evidence-gathering and planning stage. It recorded the repository import state, inventoried remaining Clawket/OpenClaw/Hermes/YouMind identity surfaces, documented native ID and release boundaries, planned README and visible product-copy changes, and defined the minimal path for adding `wednesdayai` through the central backend descriptor pattern.

This workstream turns those planning inputs into the first implementation slice. WednesdayAI Mobile should become the visible product identity in safe user-facing places, while Clawket remains preserved as hard-fork source/history and OpenClaw heritage remains explicit where it describes compatibility, protocol lineage, setup, diagnostics, or migration context.

The slice must avoid a broad string replacement. It should change only surfaces whose migration is already safe without choosing final production identifiers: paired README files, visible mobile product identity and permission copy, and the minimal `wednesdayai` backend identity in the existing descriptor registry. Backend identity must stay separate from transport identity.

## Users / who is affected

- **WednesdayAI Mobile users** should see WednesdayAI Mobile as the product identity in the app and primary repository documentation, not stale Clawket-first product copy.
- **Maintainers and release owners** need a small implementation slice that proves the conversion path without accidentally changing app IDs, package publication names, relay domains, or signing boundaries.
- **OpenClaw compatibility users** need OpenClaw labels, setup references, and protocol heritage preserved where those terms describe real compatibility behaviour.
- **Hermes compatibility users** need Hermes connection, relay, model, and runtime compatibility preserved while WednesdayAI becomes primary.
- **YouMind compatibility users and maintainers** need the current YouMind disposition left untouched until a scoped product decision confirms whether it remains or is removed.
- **Fork authors and contributors** need README language that describes WednesdayAI Mobile as the destination product while preserving Clawket hard-fork attribution and OpenClaw heritage.

## Success criteria

- SC1: `README.md` and `README.zh-CN.md` are updated together so the repository is WednesdayAI Mobile first, while preserving Clawket as hard-fork source/history and OpenClaw heritage where relevant.
- SC2: README verification proves both language files changed in the same implementation task and classifies remaining Clawket/OpenClaw/Hermes/YouMind README hits as attribution, compatibility, current package/command/path, or pending confirmation.
- SC3: Visible mobile app product identity and permission copy are converted to WednesdayAI wording only where no final production ID, scheme, owner, store listing, icon, splash, package name, or release metadata decision is required.
- SC4: React Native user-facing string changes, including locale-backed app UI or announcement copy if touched, keep all six supported locale files aligned: `en`, `zh-Hans`, `ja`, `ko`, `de`, and `es`.
- SC5: App config changes avoid choosing or changing final iOS bundle ID, Android package ID, share extension bundle ID, app group, Expo scheme, Expo slug, Expo owner, EAS project ID, Apple team, store IDs, icons, splash assets, screenshots, or store copy.
- SC6: The backend identity type and central descriptor registry include a minimal `wednesdayai` backend identity through the existing capability descriptor pattern.
- SC7: The implementation does not add `wednesdayai` to transport identity, does not model Hermes as a transport, and preserves transport values as connection routes such as `local`, `relay`, `tailscale`, `cloudflare`, and `custom`.
- SC8: OpenClaw, Hermes, and retained YouMind compatibility continue to be explicit backend identities or compatibility surfaces unless a separately scoped migration changes them.
- SC9: The first implementation task breakdown is small and reviewable: paired README conversion, safe mobile visible-identity copy, minimal backend descriptor addition, focused tests/checks, and targeted remaining-hit classification are separate tasks or clearly separate commits.
- SC10: Confirmation points are explicit before execution for final native IDs, app groups, Expo owner/project, public npm scope, public CLI name, relay domains, worker names, hosted documentation/support URLs, store metadata, and YouMind disposition.
- SC11: Verification includes a README pair check, locale/i18n alignment checks for any changed app strings, backend descriptor tests or typechecks, and targeted `rg` classification for remaining Clawket/OpenClaw/Hermes/YouMind hits.
- SC12: The diff is confined to the WednesdayAI Mobile repository and does not modify external OpenClaw, Hermes, or WednesdayAI-core repositories.

## Constraints

- Use the completed planning inputs as binding context:
  - `docs/setup/repository-import-state.md`
  - `docs/setup/identity-surface-inventory.md`
  - `docs/setup/repository-metadata-package-naming-plan.md`
  - `docs/setup/visible-product-identity-conversion-plan.md`
  - `docs/setup/native-ids-ci-release-boundaries.md`
  - `docs/architecture/wednesdayai-backend-descriptor-plan.md`
  - `dev-docs/workstreams/wednesdayai-mobile-repo-setup-brand-conversion/spec/2026-06-17-wednesdayai-mobile-repo-setup-brand-conversion.md`
  - `dev-docs/workstreams/wednesdayai-mobile-repo-setup-brand-conversion/plans/wednesdayai-mobile-repo-setup-brand-conversion/plan.md`
- Keep this first implementation slice intentionally small. Do not combine docs conversion, app ID migration, package publication changes, relay migration, and backend architecture redesign in one sweep.
- Do not perform broad Clawket-to-WednesdayAI string replacement. Every changed hit must be classified by surface and reason.
- If `README.md` changes, `README.zh-CN.md` must change in the same implementation task.
- User-facing React Native strings must respect `apps/mobile/AGENTS.md`: visible strings go through `t()` and supported locale files stay aligned.
- Add `wednesdayai` as backend identity only through the central backend descriptor pattern. Keep backend identity separate from transport identity.
- Preserve OpenClaw and Hermes connection stability and functional completeness during coexistence.
- Preserve retained YouMind compatibility unless a scoped migration explicitly changes it.
- Do not choose final iOS bundle ID, Android package ID, share extension bundle ID, app group, Expo scheme, Expo slug, Expo owner, EAS project ID, public npm scope, public CLI name, relay domains, worker names, or YouMind disposition without human confirmation.
- Do not modify external OpenClaw, Hermes, or WednesdayAI-core repositories.

## Out of scope

- Finalising production native identifiers, app groups, Expo owner/project, store listings, signing identities, screenshots, icons, splash assets, support URLs, privacy URLs, or legal URLs.
- Renaming public npm packages, npm scopes, bridge CLI package names, CLI binary names, config directories, persisted keys, relay domains, public headers, worker names, KV namespaces, or Durable Objects.
- Removing or weakening OpenClaw, Hermes, or YouMind compatibility.
- Deciding the final YouMind product disposition.
- Redesigning the gateway protocol, relay protocol, bridge lifecycle, pairing flow, diagnostics model, or backend operation architecture.
- Replacing compatibility labels where they describe real OpenClaw, Hermes, YouMind, Clawket package, command, path, config, relay, or persisted-data surfaces.
- Modifying external source repositories.

## Approach

Execute the first implementation slice in narrow, independently reviewable tasks. Each task should change one surface and include its own focused verification rather than relying on a single repo-wide rename.

The intended task breakdown is:

1. **README pair conversion:** update `README.md` and `README.zh-CN.md` together so the repository presents as WednesdayAI Mobile first, while preserving Clawket hard-fork attribution, OpenClaw heritage, and current package/command/path references that are not yet migrated.
2. **Mobile visible identity copy:** update only app-visible product name and permission copy that can safely become WednesdayAI without touching final native identifiers, package names, scheme, owner/project, app groups, icons, splash assets, screenshots, or store metadata.
3. **Minimal backend descriptor:** add `wednesdayai` as a backend identity through `GatewayBackendKind` and the existing `gateway-backends.ts` descriptor registry, using evidence-backed compatibility capabilities and preserving OpenClaw, Hermes, and retained YouMind descriptors.
4. **Focused verification and hit classification:** run targeted checks for README pairing, locale alignment if strings changed, backend descriptor type/tests, mobile config output where app config changed, and remaining Clawket/OpenClaw/Hermes/YouMind hits.

Do not combine this work with package publication, CLI naming, relay deploy-unit naming, persisted key migration, native ID migration, store listing setup, or YouMind disposition. Those remain confirmation-bound follow-up workstreams.

## Design / architecture

### Documentation conversion

The README conversion is the first visible repository identity change. It should change the product framing, headings, overview copy, and WednesdayAI Mobile documentation links where those are repo/product surfaces. It should preserve:

- Clawket as hard-fork source/history and any still-current package, command, config path, persisted key, proprietary module path, or relay endpoint reference.
- OpenClaw where the text describes OpenClaw-derived protocol behaviour, compatibility, setup, diagnostics, host approval, or heritage.
- Hermes where the text describes Hermes compatibility, relay isolation, local bridge/runtime, model selection, or diagnostics.
- YouMind while retained as a compatibility backend/account surface.

The English and Chinese README files are treated as one paired artifact. A later task may reword one language idiomatically, but the same semantic changes must land in both files.

### Mobile visible identity conversion

The mobile app change is limited to surfaces where WednesdayAI is a safe user-visible product identity today:

- Expo display name or other app-facing display copy that does not force a production ID decision.
- Permission prompt text in `apps/mobile/app.json`.
- Locale-backed product copy in React Native namespaces only if the task explicitly touches that copy and updates all six locales.
- Release/update announcement copy only if the implementation task scopes it and updates all six React Native locales.

The implementation must not change `bundleIdentifier`, Android package/application ID, share extension bundle ID, app group, Expo scheme, Expo slug, Expo owner, EAS project ID, Apple team, screenshots, icons, splash assets, package names, public URLs, or store metadata. Existing config validation should be used to prove the safe app-config edits do not accidentally move those values.

### Backend descriptor addition

`wednesdayai` is added as backend identity, not transport identity. The implementation should extend the existing central pattern rather than adding screen-level product checks:

- Add `wednesdayai` to `GatewayBackendKind`.
- Add a `WEDNESDAYAI_CAPABILITIES` descriptor in `apps/mobile/src/services/gateway-backends.ts`.
- Add a `wednesdayai` entry to `BACKENDS`.
- Update backend-kind guards and `selectByBackend` behaviour only as required by the existing helper structure.
- Keep `GatewayTransportKind` limited to connection routes: `local`, `relay`, `tailscale`, `cloudflare`, and `custom`.
- Keep the legacy Hermes mode compatibility shape from becoming a product-as-transport model.

Capability values for `wednesdayai` should start from the OpenClaw-compatible baseline only where the planning evidence supports current OpenClaw-derived gateway compatibility. Any unsupported or unverified action should remain gated by capability metadata rather than being exposed optimistically in UI.

### Compatibility model

OpenClaw, Hermes, and retained YouMind remain explicit compatibility identities or surfaces throughout this slice. The implementation should not collapse OpenClaw into WednesdayAI or infer WednesdayAI from OpenClaw labels. It should also avoid making YouMind an accidental default: retained YouMind references stay because disposition is out of scope, not because the product decision is settled.

Transport behaviour remains owned by transport helpers and gateway connection code. Backend identity answers which product/runtime capability model is active; transport identity answers how the app connects.

### Confirmation gates

Before any task attempts a confirmation-bound surface, it must stop and ask for human confirmation. Confirmation-bound surfaces include final native IDs, app groups, Expo owner/project, app scheme/slug, app/store metadata, public npm scope, public CLI package/bin names, relay domains, worker names, hosted docs/support/legal URLs, and YouMind disposition.

## Decisions

- DEC1: This workstream is behaviour-changing because it updates visible product identity and backend identity metadata. `change_kind` remains `behaviour`.
- DEC2: The first implementation slice changes only safe product-identity surfaces and a minimal backend descriptor. Production IDs, package publication names, relay deploy units, persisted data keys, and public CLI names remain unchanged.
- DEC3: `wednesdayai` is introduced as a backend identity through the central descriptor registry, not as a transport and not through scattered screen-level conditionals.
- DEC4: OpenClaw, Hermes, and retained YouMind compatibility remain explicit in this slice. Any later product-disposition change requires a separate scoped workstream.
- DEC5: No ADR is required for this spec because the settled design keeps production/public identifiers, dependencies, contracts, and compatibility commitments unchanged.

## Test strategy

Each decomposed task should name the verification commands it owns. The expected verification set for the whole slice is:

- README pair check: prove `README.md` and `README.zh-CN.md` changed together and classify remaining README hits with targeted `rg -n "Clawket|OpenClaw|Hermes|YouMind" README.md README.zh-CN.md`.
- App config check, if `apps/mobile/app.json` changes: run the existing mobile config validation commands that cover the changed platform surface, including `npm run mobile:config:check` from the repository root where available.
- Locale/i18n check, if React Native strings change: verify all six locale files for the touched namespace have aligned keys, then run the repo's targeted mobile typecheck or i18n validation command if one exists.
- Backend descriptor check: run focused tests or typechecks for `GatewayBackendKind`, `isGatewayBackendKind('wednesdayai')`, `isGatewayTransportKind('wednesdayai') === false`, backend descriptor lookup, and `selectByBackend` coverage for WednesdayAI, OpenClaw, Hermes, and retained YouMind.
- Transport separation check: targeted search or tests must confirm `wednesdayai` is not added to `GatewayTransportKind`, legacy `GatewayMode`, relay transport handling, or connection-route detection.
- Compatibility hit classification: run targeted `rg` scans for `Clawket`, `OpenClaw`, `Hermes`, `YouMind`, `clawket`, `openclaw`, `hermes`, and `youmind` over touched surfaces and classify remaining hits as converted, compatibility, attribution, current package/command/path, persisted data, or pending follow-up.
- External boundary check: confirm the final diff is confined to this repository and does not include external OpenClaw, Hermes, or WednesdayAI-core paths.
