# iOS App Store Release Checklist

This document tracks the local Xcode release process and App Store Connect items needed to ship WednesdayAI Mobile with the currently retained Clawket-era release infrastructure.

## Current App Identifiers

- App display name: `WednesdayAI`
- Current checked-in bundle ID: `com.expansionx.clawket`
- Expo slug: `clawket`
- URL scheme: `clawket`
- Expo owner: `p697`
- Apple Team ID: keep local to the release environment
- App Store Connect app ID: keep local to the release environment
- RevenueCat entitlement: `Clawket Pro`
- RevenueCat offering: `default`
- RevenueCat packages:
  - `$rc_monthly`
  - `$rc_annual`
  - `$rc_lifetime`
- App Store subscription group: `Clawket Pro`
- App Store products:
  - `com.p697.clawket.pro.monthly`
  - `com.p697.clawket.pro.yearly`
  - `com.p697.clawket.pro.lifetime`

The first WednesdayAI Mobile brand-conversion slice updates visible app identity only. It does not choose final App Store metadata, RevenueCat identifiers, subscription names, Expo owner/project, URL scheme, or public package naming. Keep those values unchanged unless a later scoped migration explicitly changes them.

## 1. App Store Connect Checklist

### Account and agreement

- [ ] `Paid Applications Agreement` is active
- [ ] Banking is configured
- [ ] Tax forms are configured

### Subscription products

- [ ] `Clawket Pro Monthly` is configured
- [ ] `Clawket Pro Yearly` is configured
- [ ] `Clawket Pro Lifetime` is configured if the active RevenueCat offering still exposes lifetime purchase or upgrade UI
- [ ] All active products are in the same subscription group or IAP family expected by App Store Connect: `Clawket Pro`
- [ ] All active products have pricing configured
- [ ] All active products have required localizations
- [ ] All active products have a review screenshot
- [ ] All active products are attached to the app version that will be submitted for review

### App metadata

- [ ] App privacy answers are complete
- [ ] Age rating is complete
- [ ] Export compliance is configured in `Info.plist` via `ITSAppUsesNonExemptEncryption = NO`
- [ ] Sign-in / demo / review notes are complete if needed
- [ ] Support URL is valid
- [ ] Marketing URL is valid if you use one
- [ ] Release notes / "What's New" text is ready

## 2. RevenueCat Checklist

- [ ] App Store app exists in RevenueCat
- [ ] In-App Purchase Key is uploaded
- [ ] App Store Connect API Key is uploaded
- [ ] `default` offering uses:
  - [ ] `$rc_monthly` -> `com.p697.clawket.pro.monthly`
  - [ ] `$rc_annual` -> `com.p697.clawket.pro.yearly`
  - [ ] `$rc_lifetime` -> `com.p697.clawket.pro.lifetime`, unless a scoped billing migration has removed lifetime from the app and offering
- [ ] `Clawket Pro` entitlement is attached to every active monthly, yearly, and lifetime product
- [ ] No app build is using `EXPO_PUBLIC_REVENUECAT_TEST_API_KEY`

## 3. Local Build Environment Checklist

- [ ] Start from `.env.example` for local env shape
- [ ] `npm run config:check:ios` passes
- [ ] `.env.local` or local shell environment contains `EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY`
- [ ] `.env.local` or local shell environment contains `EXPO_PUBLIC_REVENUECAT_PRO_ENTITLEMENT_ID=Clawket Pro`
- [ ] `.env.local` or local shell environment contains `EXPO_PUBLIC_REVENUECAT_PRO_OFFERING_ID=default`
- [ ] `EXPO_PUBLIC_REVENUECAT_TEST_API_KEY` is not set for TestFlight / production
- [ ] `EXPO_PUBLIC_UNLOCK_PRO` is not set for TestFlight / production
- [ ] `ios/.xcode.env` still contains the generated env-source block for `.env` and `.env.local`
- [ ] Xcode is signed into the Apple Developer account that owns the app
- [ ] The correct team is selected for the current native app target
- [ ] A valid iOS Distribution or Apple Distribution signing identity is available on this Mac

### When Adding A New Mobile Environment Variable

Use this checklist in the same PR:

- [ ] Add the key to `apps/mobile/.env.example`
- [ ] If React Native client code reads it, use the `EXPO_PUBLIC_*` prefix
- [ ] Wire it through `src/config/public.ts` or another shared config module
- [ ] Update `scripts/check-public-config.mjs` if release validation should enforce it
- [ ] Update this release checklist if the new variable is required for TestFlight or App Store builds
- [ ] Re-run `npm run config:check:ios` before archiving

## 4. Pre-Build Commands

Build the WebView assets before any release or TestFlight build:

```bash
cd office-game && npm run build && cd ..
```

Optional validation:

```bash
npx tsc --noEmit
npm test -- --runInBand
```

## 5. Refresh Native Project If Needed

If Expo config, plugins, permissions, bundle identifiers, or other managed native settings changed since the last iOS release build, refresh the iOS native project before archiving:

```bash
npx expo prebuild --platform ios
```

If the native iOS project is already up to date and no Expo-managed native config changed, you can skip this step.

## 6. Open Xcode Workspace

Open:

- `ios/Clawket.xcworkspace`

Before archiving, verify:

- signing is correct for the main app target
- the selected scheme is `Clawket`
- the selected destination is `Any iOS Device (arm64)`
- the marketing version and build number match the release you intend to upload

## 7. Archive In Xcode

Use Xcode:

1. `Product` -> `Archive`
2. Wait for Organizer to open
3. Select the new archive
4. Click `Distribute App`
5. Choose `App Store Connect`
6. Choose `Upload`
7. Keep the default validation and upload options unless this release needs a specific override
8. Complete the upload

If Xcode reports signing or capability issues, fix them locally before retrying the archive.

## 8. Upload Targets

### TestFlight upload

Use the local archive flow above, then distribute the uploaded build to internal or external testers from App Store Connect.

### Final App Review build

Use the same local archive and upload flow, then attach the uploaded build to the app version you submit for review in App Store Connect.

## 9. TestFlight Validation Checklist

Before submitting to App Review, verify on a TestFlight or store-distribution build:

- [ ] Free user sees the Pro paywall at the correct gated entry points
- [ ] Monthly purchase succeeds
- [ ] Yearly purchase succeeds
- [ ] Lifetime purchase succeeds if `$rc_lifetime` is still present in the active offering
- [ ] Restore purchases succeeds after reinstall
- [ ] Membership card shows the correct plan type
- [ ] Existing Pro user sees the read-only paywall state
- [ ] Paywall shows the correct Lifetime CTA and does not show auto-renewal legal copy when `Lifetime` is selected, if lifetime remains active
- [ ] Debug-only RevenueCat App User ID is hidden unless Debug Mode is enabled

## 10. Known Expected Warning Before Review

RevenueCat may show warnings like:

- product status is `READY_TO_SUBMIT`
- offering packages point at products that are not yet approved

This is expected before App Review. These warnings should disappear after the active subscription and lifetime products are submitted with the app version and approved by Apple.

## 11. Recommended Release Order

1. Finish App Store Connect metadata
2. Build Office assets and run optional validation
3. Refresh the iOS native project if needed with `npx expo prebuild --platform ios`
4. Archive locally in Xcode
5. Upload to TestFlight from Xcode Organizer
6. Confirm the build appears in App Store Connect / TestFlight
7. Re-run monthly / yearly / lifetime / restore validation for every product still exposed by the active offering
8. Archive and upload the final review build locally from Xcode
9. Attach all active subscription and lifetime products to the app version
10. Submit the app version for review
