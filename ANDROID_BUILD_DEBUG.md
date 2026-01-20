# Android Build Debug Log - Jan 20, 2026

## History of Attempts

### Attempt 1: "Split Stack" Strategy
*   **Action**: Created a custom plugin to inject Firebase only on Android, suspecting an iOS conflict.
*   **Result**: ❌ User feedback: iOS was fine, Android build was failing.
*   **Status**: Reverted.

### Attempt 2: Explicit Kotlin & Build Tools Version
*   **Action**: Added explicit `kotlinVersion: "1.9.20"` and `buildToolsVersion: "34.0.0"` to `app.config.js` and `gradle.properties` to fix potentially missing SDKs.
*   **Result**: ❌ Build Failed.
*   **Error**: `Can't find KSP version for Kotlin version '1.9.20'`.
*   **Root Cause**: Expo SDK 52+ / React Native 0.76+ requires Kotlin 2.x. Forcing 1.9.20 broke the build.

### Attempt 3: Clean Configuration (Default Kotlin)
*   **Action**: Removed explicit `kotlinVersion` to let Expo/Gradle pick the compatible default (Kotlin 2.1.20). Kept `compileSdkVersion: 34`.
*   **Result**: ❌ Build Failed.
*   **Error**: `Execution failed for task ':app:checkReleaseAarMetadata'.`
*   **Log Details**:
    ```
    Dependency 'androidx.camera:camera-mlkit-vision:1.5.0-rc01' requires libraries and applications that depend on it to compile against version 35 or later of the Android APIs.
    :app is currently compiled against android-34.
    ```
*   **Root Cause**: One of the dependencies (likely `expo-camera` or an indirect dependency) updated its requirements to Android SDK 35 (Vanilla Ice Cream). Our project was hardcoded to SDK 34 (`android.compileSdkVersion=34`).

## Required Fix
The build logs explicitly demand an upgrade to `compileSdkVersion` 35 or 36.

**Action Plan:**
1. Update `app.config.js` -> `android.compileSdkVersion` from 34 to 35.
2. Update `android/gradle.properties` -> `android.compileSdkVersion` from 34 to 35.
3. `expo-build-properties` plugin must reflect this change.

This should align the project with the requirements of the updated dependencies.
