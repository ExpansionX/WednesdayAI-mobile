---
doc_type: spec
status: shipped
workstream: wednesdayai-mobile-repo-setup-brand-conversion
change_kind: docs
---

# WednesdayAI Mobile Repository Setup and Brand Conversion

**Date:** 2026-06-17
**Status:** shipped
**Author:** David Rudduck (via agent)

## Intent (what / why)

Set up `ExpansionX/WednesdayAI-mobile` as the long-term destination repository for WednesdayAI Mobile and plan the first safe product/brand conversion slice from the Clawket seed.

The previous `wednesdayai-mobile-init` workstream created the founding product and architecture documents. This workstream turns that direction into an evidence-backed setup plan for the actual destination repository: verify the import state, record remaining Clawket identifiers, define safe rename boundaries, and prepare the first implementation slice without choosing irreversible production app identifiers before human confirmation.

WednesdayAI is the primary product identity. OpenClaw and Hermes compatibility remains explicit during coexistence. Backend identity and transport identity stay separate: backend identity answers which product/runtime the app manages, while transport identity answers how the app connects.

## Users / who is affected

- **WednesdayAI Mobile maintainers** need a current, repo-local plan for the first brand-conversion commits.
- **Mobile app users** should see WednesdayAI as the product identity, not stale Clawket-first copy.
- **OpenClaw and Hermes compatibility users** need existing connection paths preserved while WednesdayAI becomes primary.
- **Release owners** need a clear inventory of bundle IDs, app IDs, schemes, EAS ownership, signing, CI, and release metadata before final production choices are made.
- **Fork authors** need repository metadata and documentation that describe WednesdayAI Mobile as the base while preserving attribution.

## Success criteria

- SC1: The workstream records current import state: repository URL, default branch, active branch, remote tracking, latest pushed commit, and current PR state.
- SC2: The workstream records remaining Clawket/OpenClaw/Hermes/YouMind identity surfaces relevant to the first conversion slice, including docs, root package metadata, mobile app config, bridge CLI package metadata, app UI copy, deep links, and backend descriptors.
- SC3: The first implementation slice explicitly covers repository metadata and documentation links, including the paired `README.md` and `README.zh-CN.md` documentation rule.
- SC4: The first implementation slice explicitly covers package and workspace naming, while separating private workspace names from publishable CLI package names.
- SC5: The first implementation slice explicitly covers visible Clawket to WednesdayAI product identity in app-facing copy and configuration, with i18n and translation boundaries called out.
- SC6: The first implementation slice inventories bundle/application identifiers, app scheme/deep links, EAS owner/project id, signing IDs, and store identifiers, but does not choose final production identifiers without confirmation.
- SC7: The first implementation slice checks CI/release boundaries, including the absence or presence of GitHub workflows, package scripts, mobile config validation, release docs, relay deploy units, bridge publish steps, and signing/secrets placeholders.
- SC8: The first implementation slice defines a minimal `wednesdayai` backend descriptor plan that keeps `wednesdayai`, `openclaw`, `hermes`, and retained `youmind` identity explicit and keeps transports limited to `local`, `relay`, `tailscale`, `cloudflare`, and `custom`.
- SC9: The workstream preserves external source boundaries: no changes to external OpenClaw, Hermes, or WednesdayAI-core repositories.
- SC10: The workstream leaves the next `/wai:execute` run with small, verifiable tasks and no broad, unbounded brand sweep.

## Constraints

- Work only in `/Users/david/Code/WednesdayAI-mobile`.
- Treat Clawket as the hard-fork source and WednesdayAI Mobile as the destination and long-term home.
- Do not treat old `WednesdayAI-core/apps/*` as the implementation base.
- Do not modify external OpenClaw, Hermes, or WednesdayAI-core repositories unless explicitly asked.
- Preserve OpenClaw and Hermes connection stability while adding WednesdayAI identity.
- Keep backend identity separate from transport identity.
- Do not model Hermes or WednesdayAI as transport modes.
- Do not choose final production iOS bundle IDs, Android application IDs, macOS bundle IDs, app groups, EAS owner/project IDs, store listing identifiers, signing identities, or public package names without human confirmation.
- If `README.md` changes, `README.zh-CN.md` must change in the same implementation task.
- App UI copy changes must respect `apps/mobile/AGENTS.md`: user-facing strings go through i18n and all supported locale files must stay aligned.
- Bridge CLI changes must respect `apps/bridge-cli/AGENTS.md`: lifecycle, diagnostics, pairing, and Hermes support remain additive and must not weaken OpenClaw behaviour.

## Out of scope

- Executing the brand conversion in this planning step.
- Finalising production bundle IDs, app groups, app schemes, store metadata, EAS project ownership, package scopes, or publishable CLI names.
- Removing OpenClaw, Hermes, or YouMind compatibility.
- Redesigning relay protocols, bridge lifecycle, gateway contracts, or plugin/skill contracts.
- Modifying external source repositories.
- Creating a GitHub PR if no PR is needed for the planning artifacts.

## Approach

Create a small WAI task tree that starts with evidence and inventory before any rename. The first executable slice is documentation and planning only: it captures import state, identity surfaces, release boundaries, and the minimal backend descriptor plan. Later behaviour-changing workstreams can use those documents to make package, app config, UI copy, backend descriptor, and release pipeline changes safely.

The implementation plan should be intentionally sequential:

1. Verify repository import state and current GitHub state.
2. Inventory identity and release surfaces from real files.
3. Plan documentation and metadata changes as a paired README/root-doc update.
4. Plan package/workspace naming separately from public package/bin decisions.
5. Plan visible product identity changes with mobile i18n constraints.
6. Inventory native identifiers and release/CI boundaries without choosing final IDs.
7. Plan the minimal `wednesdayai` backend descriptor and compatibility matrix.

## Design / architecture

### Import and repository state

The destination repository is `ExpansionX/WednesdayAI-mobile`. The active checkout should record:

- `origin` fetch/push URL;
- default branch;
- active branch and upstream tracking branch;
- current head commit;
- whether a PR exists for the active branch;
- whether `.github` workflows exist;
- whether the worktree is clean before implementation begins.

This evidence belongs in the workstream plan so later agents do not infer repository state from the old Clawket seed or from the prior Codex worktree.

### Identity conversion boundaries

Brand conversion is split into surfaces instead of handled as one broad search-and-replace:

- repository docs and links;
- root package metadata and workspace script references;
- app package metadata;
- Expo display name, slug, owner/project id, scheme, native package IDs, app groups, and permission copy;
- bridge CLI package metadata, binary command, and publish boundaries;
- relay worker package names and deploy units;
- app UI strings and locale files;
- backend descriptors and compatibility labels;
- analytics names and release/update announcement copy.

Each surface needs its own verification. Some strings should remain as compatibility labels (`OpenClaw`, `Hermes`) or historical attribution (`Clawket` as hard-fork source). Other strings should convert to WednesdayAI product identity.

### Bundle and identifier inventory

The first slice may inventory identifiers but must not finalise production IDs. Current examples requiring confirmation include:

- iOS bundle identifier;
- iOS share extension bundle identifier;
- app group identifier;
- Android package/application ID;
- Expo scheme;
- Expo slug;
- Expo owner and project id;
- EAS project ownership;
- Apple team ID;
- App Store / Play Store listing identifiers;
- public npm scope, CLI package name, and CLI binary command.

Safe placeholder documentation is allowed. Production values need explicit human approval.

### Backend descriptor plan

`wednesdayai` should become the primary backend identity through the existing backend capability registry pattern. The plan must preserve explicit descriptors for OpenClaw and Hermes compatibility and decide whether YouMind remains as a compatibility backend or is removed through a later scoped migration.

The minimal descriptor plan must keep:

- `GatewayBackendKind` as backend identity;
- `GatewayTransportKind` as transport identity;
- transport values limited to `local`, `relay`, `tailscale`, `cloudflare`, and `custom`;
- backend-specific operations behind helpers/adapters;
- UI availability through capability metadata, not optimistic runtime failures.

### Verification design

This workstream is documentation/planning, so verification is mostly evidence-based:

- WAI plan lint must pass.
- Repository state commands must be recorded in the generated inventory task.
- Identity scans must cite real files and line anchors.
- CI/release inventory must explicitly note missing `.github` workflows if absent.
- Backend descriptor plan must cite the current type and capability registry files.
- No external repositories may appear in the diff.

## Decisions

- DEC1: This workstream is documentation/planning only (`change_kind: docs`). It prepares the first implementation slice but does not perform code or configuration edits.
- DEC2: App identifiers and public package/bin names are intentionally left as confirmation points, not guessed by the task author.
- DEC3: The minimal backend descriptor plan must extend the existing centralized backend registry pattern rather than adding screen-level WednesdayAI conditionals.

## Test strategy

- Run WAI precheck to freeze this spec before decomposition.
- Run `wai-plan-lint.sh wednesdayai-mobile-repo-setup-brand-conversion` after writing the plan and tasks.
- Run `task-status.sh wednesdayai-mobile-repo-setup-brand-conversion` to confirm task readiness.
- Use manual verification tasks for repository-state and inventory artifacts.
- Confirm `git diff --name-only` contains only WednesdayAI Mobile repository files.
