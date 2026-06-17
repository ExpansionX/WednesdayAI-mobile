# Repository Metadata and Package Naming Plan

## Inputs

- `docs/setup/repository-import-state.md` records `ExpansionX/WednesdayAI-mobile` as the destination repository on branch `codex/wednesdayai-mobile-init`.
- `docs/setup/identity-surface-inventory.md` records current Clawket package, workspace, app config, CLI, relay, docs, and backend descriptor surfaces.
- `SETUP.md` requires docs links to point to WednesdayAI destinations and CI names/badges to use WednesdayAI Mobile.
- `AGENTS.md` requires any `README.md` update to update `README.zh-CN.md` in the same change.

## README and documentation links

- A future README implementation task must update `README.md` and `README.zh-CN.md` together.
- The paired README change should make WednesdayAI Mobile the primary product identity while preserving Clawket as the hard-fork source and OpenClaw heritage attribution where relevant.
- Documentation links should point at WednesdayAI Mobile destinations for this repository, setup, roadmap, architecture, issues, support, release notes, and package install guidance.
- Existing OpenClaw and Hermes links should remain where they describe compatibility backends, reference systems, installation prerequisites, or migration context.
- The README task should explicitly inventory image asset names and alt text such as `assets/clawket-hero.png` and `assets/clawket-app-store.png` before renaming or replacing assets.

## Root package metadata

- Root `package.json` currently uses `"name": "clawket"`.
- A future root package metadata task may rename this private monorepo package to a WednesdayAI Mobile private name after confirming npm workspace resolution.
- Root scripts currently address mobile workspace `clawket`, relay workspaces in `@clawket/*`, and publishable CLI package `@p697/clawket`.
- Root script updates should be split by surface:
  - mobile private workspace scripts;
  - relay/shared private or deploy-package scripts;
  - bridge CLI public package scripts;
  - release and publish scripts.
- This plan does not choose final package names.

## Private workspace package names

- Root package and private mobile workspace naming can be planned separately from publishable CLI names.
- Candidate private naming convention should use WednesdayAI Mobile language and `wednesdayai` identifiers, but final names should be set in the implementation task that updates workspace references and verifies package-manager behaviour.
- Private workspace package renames must update every local `npm run --workspace ...` reference in root scripts and package scripts.
- Relay/shared workspaces need a deploy-boundary review before renaming because worker package names, imports, wrangler names, and shared protocol imports are connected.
- Mobile package rename must be coordinated with Expo config only where package metadata feeds app config, such as `apps/mobile/app.config.js` reading `apps/mobile/package.json`.

## Publishable package and CLI names

- Public npm scope, CLI package name, and CLI binary name are confirmation points, not assumptions.
- The current publishable CLI package is `@p697/clawket`, and the current command is `clawket`.
- A future CLI naming task must decide whether to:
  - retain `clawket` as a compatibility command;
  - add a new WednesdayAI command as an alias;
  - rename the public package;
  - publish under a new scope;
  - preserve old config directories and install instructions for migration.
- Any public CLI or package rename must include install docs, package verification, bridge publish dry-run, migration notes, and compatibility messaging.
- Do not change npm publication identifiers until the owner confirms scope, package name, binary name, and migration policy.

## Package-lock impact

- `package-lock.json` must be included in any future package metadata implementation task if npm rewrites workspace package names.
- The implementation task should run the repo's package-manager install or lockfile update command in the same commit as package metadata changes.
- Lockfile changes should be reviewed for expected package name changes only, not dependency churn.
- If no lockfile change is produced, the implementation task should record that as verification rather than assuming the lockfile is irrelevant.

## Verification

- For README work, verify `README.md` and `README.zh-CN.md` changed together and still preserve Clawket/OpenClaw attribution.
- For root and private workspace package work, run package-manager workspace listing or targeted `npm run --workspace ...` commands that prove the new names resolve.
- For public CLI work, run bridge build, typecheck, tests, package verification, and publish dry-run before any release.
- For package-lock work, inspect `git diff -- package-lock.json` and confirm changes align with planned package metadata.
- For docs links, run a targeted `rg` over README files and setup docs for stale Clawket-only repository links after the implementation task.

## Confirmation points

- Final public npm scope.
- Final publishable bridge CLI package name.
- Final CLI binary name and whether `clawket` remains as compatibility alias.
- Final private root package name.
- Final private mobile workspace package name.
- Final private relay/shared package naming scheme.
- Final hosted docs, support, privacy, and release-note URLs.
- Final policy for compatibility references to Clawket package names, commands, config directories, relay domains, and persisted keys.
