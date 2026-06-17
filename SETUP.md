# WednesdayAI Mobile Setup

## Source repository

Create `ExpansionX/WednesdayAI-mobile` from Clawket.

Clawket is the source repository for the hard fork because it already has the current mobile app
shell, Expo/React Native workflow, release scripts, capability registry, QR pairing, Console
surfaces, speech services, and node/camera foundations.

Do not start from upstream OpenClaw mobile apps. Do not start from old `WednesdayAI-core/apps/*`.
Those systems are references only.

WednesdayAI remains a Hard fork of OpenClaw at v2026.3.2. Keep that attribution visible while
converting product language to WednesdayAI.

## Import strategy

Choose one import strategy before writing code:

1. Preserve Clawket history when the new repository should retain detailed provenance.
2. Import a clean seed when the new repository should start with a compact public history.

Either strategy must keep attribution for Clawket and OpenClaw-derived work. Record the chosen
strategy in the new repository before the first product conversion commit.

## Repository checklist

- Confirm repository: `ExpansionX/WednesdayAI-mobile`.
- Confirm default branch and branch protection.
- Confirm licence and attribution files.
- Confirm `README.md`, `VISION.md`, `ROADMAP.md`, `SETUP.md`, and `FORKING.md` are present.
- Confirm docs links point to WednesdayAI destinations.
- Confirm CI names and workflow badges use WednesdayAI Mobile.
- Confirm issue templates and PR templates do not retain stale Clawket-only wording.

## Product identity checklist

- App display name: WednesdayAI or WednesdayAI Mobile, pending final product decision.
- Code/config identifier: `wednesdayai`.
- Visible copy: WednesdayAI.
- Heritage copy: Hard fork of OpenClaw at v2026.3.2.
- Tagline where appropriate: Make it yours.
- Tone: direct, Australian English, no upstream disparagement.

## Mobile package identifiers

Do not choose final production identifiers without human confirmation.

Setup tasks must inventory and prepare changes for:

- package name;
- workspace name;
- native iOS bundle ID;
- native Android application ID;
- macOS Catalyst bundle ID, if retained;
- app schemes and deep links;
- Expo app slug and owner;
- store listing identifiers;
- release channel names.

Use safe placeholders in docs until signing and store ownership are confirmed.

## App assets and launch surfaces

Inventory every user-visible app surface:

- icon;
- adaptive icon;
- splash screen;
- app display name;
- notification name;
- deep-link name;
- onboarding copy;
- settings/help links;
- store screenshots and preview text.

Replace Clawket product identity with WednesdayAI identity only after the repository import is
stable.

## CI and release boundaries

The new repository owns its own mobile CI and release lifecycle.

Setup must cover:

- typecheck and test commands;
- Expo prebuild/build checks;
- iOS archive path;
- Android AAB/APK build path;
- macOS Catalyst path, if retained;
- public config validation;
- release notes;
- versioning policy;
- branch and tag naming.

Do not collapse mobile release steps back into `WednesdayAI-core`.

## Secrets and signing

Never commit signing material or production secrets.

Setup must define where the fork owner provides:

- Apple signing credentials;
- Android upload keystore;
- EAS credentials, if used;
- analytics tokens;
- billing/store credentials;
- support and legal links;
- relay/cloud endpoint secrets.

Use `.env.example` and release docs for placeholders. Keep production values in local secret stores or
CI secret managers.

## Analytics and telemetry names

Rename analytics events, dashboards, and environment variables deliberately.

Use stable, low-noise event names that describe business outcomes rather than UI trivia. Do not send
message contents, secrets, raw URLs with tokens, or high-cardinality user data.

## Store metadata

Store metadata belongs to the mobile repository lifecycle.

Prepare placeholders for:

- app title;
- subtitle;
- description;
- keywords;
- privacy nutrition labels;
- screenshots;
- support URL;
- privacy URL;
- release notes;
- age rating and permission explanations.

Final values need human review before release.

## First verification pass

After setup, verify:

- repository imports cleanly;
- package manager install works;
- typecheck command works;
- iOS, Android, and macOS docs still describe runnable paths;
- public config validation works;
- app name and bundle identifiers are not half-renamed;
- OpenClaw heritage acknowledgement remains present;
- old `WednesdayAI-core/apps/*` and upstream OpenClaw mobile are still treated as references.

## Not in this setup step

This setup does not implement backend changes, rename native projects, change bundle IDs, upload
store metadata, modify remotes, add secrets, or run the final hard fork import.

Those actions come after the founding docs are accepted and the repository setup task is explicitly
started.
