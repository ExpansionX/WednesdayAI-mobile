# macOS Adaptation Plan

Updated: 2026-06-18

Status: historical plan with current runbook pointers. The Mac Catalyst build/archive/export scripts now exist; use [macos-dev.md](./macos-dev.md) and [macos-app-store-submission.md](./macos-app-store-submission.md) for active commands.

## Conclusion

WednesdayAI Mobile should target `Mac Catalyst` first.

Reason:

- The current app is already an iOS native app with a full `ios/` Xcode project.
- React Native 0.83 already exposes `Platform.isMacCatalyst`, so most adjustments can stay inside the existing iOS codepath instead of creating a separate macOS app.
- Apple officially supports bringing an iPad app to Mac with Mac Catalyst.
- The lighter "run iPhone/iPad app on Apple Silicon Mac" route is not enough here because it only covers Apple Silicon Macs and the app is currently configured as iPhone-first.

## Current State

### Native project state

- The repository now has dedicated app-local scripts for Mac Catalyst development and release validation:
  - `npm run dev:macos`
  - `npm run build:macos`
  - `npm run archive:macos`
  - `npm run export:macos`
- Mac Catalyst uses a Mac-specific entitlements path while preserving the iOS entitlements path.
- The share extension remains excluded from Mac Catalyst.
- The active runbooks are `apps/mobile/docs/macos-dev.md` and `apps/mobile/docs/macos-app-store-submission.md`.

Earlier notes in this document describe the planning baseline from March 2026. Treat them as historical context, not as current setup instructions.

### JavaScript/runtime state

- React Native in this repo already includes `Platform.isMacCatalyst` in `node_modules/react-native/Libraries/Utilities/Platform.ios.js`.
- The QR flow is already split into:
  - live camera scanner in `src/contexts/GatewayScannerContext.tsx`
  - QR import from image in the same file
- Chat attachments are already split into:
  - photo library
  - camera capture
  - file picker
  in `src/hooks/useChatAttachments.ts`
- There are many `Platform.OS === 'ios'` checks across the app. On Mac Catalyst, `Platform.OS` is still `ios`, so some current "iPhone/iPad only" assumptions would incorrectly apply to Mac too.

## Recommended product approach

Keep one app, one codebase, and one UI system.

Do not build a separate "desktop-first" interface. Reuse the current mobile/iPad layout and only add targeted platform adjustments where Mac interaction is meaningfully different.

That matches your requirement and is also the lowest-risk path.

## Recommended technical route

### Route A: Mac Catalyst

This should be the main shipping path.

Current implementation status:

1. Use the existing Mac Catalyst scripts for build/archive/export.
2. Keep current iOS release behavior unchanged unless a scoped macOS submission task changes it.
3. Continue using targeted platform adjustments only where Mac interaction differs from iPhone/iPad.
4. Validate submission details through `apps/mobile/docs/macos-app-store-submission.md`.

### Route B: "Designed for iPad/iPhone" on Apple Silicon Macs

This is only a fallback or temporary internal test path.

Why not treat this as the main solution:

- It does not give a real Mac app target.
- It is limited to Apple Silicon Macs.
- It does not provide the same signed Catalyst archive/export path.
- Store presentation and desktop affordances are weaker than a Catalyst build.

## Concrete app areas that need adjustment

### 1. QR scanning

This is the cleanest change.

Current state:

- Config screen already supports both "Scan QR Code" and "Upload QR Image".
- QR image decode already uses `Camera.scanFromURLAsync(...)`.

Recommended Mac behavior:

- Hide live camera scanning on Mac Catalyst.
- Make "Upload QR Image" the primary action.
- Keep the same QR payload parsing logic.

Impact:

- Low risk.
- Mostly UI branching, not business logic changes.

### 2. Chat image capture

Current state:

- Chat attachment menu offers `Take Photo`, `Photo Library`, and `Choose File`.
- Agent node handlers also expose camera capture and image picking.

Recommended Mac behavior:

- Replace `Take Photo` with `Choose Image` or route it to the image library/file chooser.
- Keep `Choose File`.
- Keep `Photo Library` only if it behaves well under Catalyst; otherwise collapse to one image-picker action.

### 3. iOS-only assumptions that would misfire on Mac

Examples in the current code:

- `ActionSheetIOS` usage in `src/screens/ConfigScreen/ConfigScreenLayout.tsx`
- many `Platform.OS === 'ios'` branches in `App.tsx`
- device identity reported as iOS/iPhone in `src/services/gateway.ts` and `src/services/node-client.ts`
- node device info reporting `systemName: 'iOS'` in `src/services/node-handlers.ts`

Recommended fix:

- Introduce a shared helper:
  - `isMacCatalyst`
  - `isAppleDesktop`
  - `isTouchFirstApple`
- Migrate feature gating from raw `Platform.OS === 'ios'` to intent-based checks.

This is one of the most important cleanup items before enabling Catalyst.

### 4. Widgets and share extension

Current state:

- The native project includes `ExpoWidgetsTarget`.
- The native project includes `expo-sharing-extension`.
- `expo-widgets` is documented as iOS-focused.
- `expo-sharing` share-into-app support is documented as iOS-specific and experimental.

Recommendation:

- Treat widgets and share extension as likely non-essential for the first Mac release.
- First Catalyst build should focus on the main app target.
- If these targets block Mac builds, exclude them from the Mac configuration rather than forcing parity on day one.

### 5. Orientation and windowing

Current state:

- `app.json` sets `orientation: "portrait"`.

For Mac:

- Portrait-only assumptions are a poor fit for resizable desktop windows.
- We should move to iPad-friendly layout behavior before Catalyst.

This does not mean creating a desktop layout. It means making the current layout survive wider windows.

### 6. Save/share flows

Current state:

- Some flows save to photo library.
- Some flows use iOS share sheet behavior.

Mac follow-up:

- Saving images/files may be better routed to file export or normal sharing instead of Photos.
- These should be checked after the first Catalyst build compiles.

## Proposed implementation order

### Phase 0: Feasibility spike

Goal: get a local Mac Catalyst build running as early as possible.

Status: historical. The repository now has local Mac Catalyst build scripts; use `npm run dev:macos` or `npm run build:macos`.

Tasks:

1. Enable iPad support in Expo/native config.
2. Validate Mac Catalyst in the Podfile/Xcode target.
3. Attempt a local Catalyst build.
4. Identify native modules/targets that fail.

Deliverable:

- a compiled local Mac build, even if some features are temporarily disabled.

### Phase 1: Runtime compatibility cleanup

Goal: stop treating Mac Catalyst as a normal iPhone.

Tasks:

1. Add a platform helper module.
2. Update raw `Platform.OS === 'ios'` checks in high-risk areas.
3. Fix device/system labels sent to Gateway.
4. Prefer non-camera import flows on Mac.

### Phase 2: UX polish for Mac

Goal: keep the app looking like WednesdayAI Mobile, but avoid obviously mobile-only behavior.

Tasks:

1. Make QR import the default connect path on Mac.
2. Adjust attachment menus.
3. Review modal sizing, tab widths, and scroll regions on wider windows.
4. Disable or defer unsupported extras.

### Phase 3: Store readiness

Goal: prepare for Mac App Store review.

Tasks:

1. Confirm signing/capabilities for the Mac variant.
2. Verify all privacy permission strings still make sense on Mac.
3. Validate entitlements and unsupported extension targets.
4. Test release build and App Store packaging flow.

## Expected risk level by area

- Low risk:
  - QR import flow
  - attachment picker relabeling
  - runtime helper and JS gating
- Medium risk:
  - iPad/window layout cleanup
  - App Store/store-review/share behavior differences
- Higher risk:
  - native target changes for Catalyst
  - widgets/share-extension coexistence in Mac build
  - any third-party native module with incomplete Catalyst support

## Recommendation for the next coding step

The next practical step is not broad UI work.

It is this:

1. turn on the native prerequisites for iPad + Mac Catalyst in a working branch
2. try a real local Catalyst build
3. fix the first layer of native blockers
4. then start the JS-level feature gating

That will tell us very quickly whether the project can ship as a Catalyst app with small adjustments, or whether a native dependency forces a different path.

## External references

- Apple: [Mac Catalyst](https://developer.apple.com/mac-catalyst/)
- Apple: [Creating a Mac version of your iPad app](https://developer.apple.com/documentation/uikit/creating-a-mac-version-of-your-ipad-app)
- Apple: [Distributing your iPhone or iPad app on Macs with Apple silicon](https://developer.apple.com/documentation/appstoreconnectapi/managing-your-app-s-availability/distributing-your-ios-app-on-macs-with-apple-silicon)
- Expo: [Additional platform support](https://docs.expo.dev/modules/additional-platform-support/)
- Expo: [expo-camera](https://docs.expo.dev/versions/latest/sdk/camera/)
- Expo: [expo-sharing](https://docs.expo.dev/versions/latest/sdk/sharing/)
- Expo: [expo-widgets](https://docs.expo.dev/versions/latest/sdk/widgets/)
