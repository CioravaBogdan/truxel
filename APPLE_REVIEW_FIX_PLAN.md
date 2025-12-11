# Apple App Store Review Fix Plan

This document outlines the steps required to address the rejection reasons from Apple Review (Submission ID: c59e86bc-43c6-461f-9200-0294d03a78f7).

## 1. Guideline 2.3.3 & 2.3.7 - Screenshots & Metadata

### Issues:
- **iPad Screenshots**: 13-inch iPad screenshots show an iPhone device frame.
- **Pricing in Screenshots**: Screenshots contain text like "Free", "5 searches on us", "$24.99".

### Action Plan:
1.  **iPad Screenshots**:
    *   **Option A (Recommended)**: Generate proper iPad screenshots.
        *   Use the iOS Simulator (iPad Pro 13-inch) to take screenshots.
        *   Ensure they are 2048 x 2732 pixels (portrait).
        *   **Do not** use an iPhone frame.
    *   **Option B (If iPad support is not critical)**: Disable iPad support.
        *   In `app.config.js`, set `ios.supportsTablet: false`.
        *   *Note: This will make the app run in iPhone compatibility mode on iPad (2x zoom).*
2.  **Remove Pricing Text**:
    *   Edit the screenshots to remove any mention of "Free", prices (e.g., "$24.99"), or specific offers ("5 searches on us").
    *   Focus on features: "Find Companies", "Manage Leads", "Community", etc.

## 2. Guideline 3.1.2 - Subscriptions (Links)

### Issues:
- Missing functional links to **Terms of Use (EULA)** and **Privacy Policy** in the app binary (Paywall/Pricing screen).

### Action Plan:
1.  **Update `app/(tabs)/pricing.tsx`**:
    *   Add a footer section below the subscription options.
    *   Include clickable links to:
        *   Privacy Policy: `https://truxel.app/privacy` (or your actual URL)
        *   Terms of Use (EULA): `https://truxel.app/terms` (or Apple's standard EULA if used).
2.  **App Store Connect**:
    *   Ensure the "Privacy Policy URL" field is filled.
    *   Add the EULA link to the App Description or the specific EULA field.

## 3. Guideline 3.1.1 - Promo Codes

### Issues:
- The app contains a custom promo code entry feature, which is not allowed for unlocking digital content outside of Apple's In-App Purchase system.

### Action Plan:
1.  **Remove Promo Code Input**:
    *   In `app/(tabs)/pricing.tsx`, remove the "Promo Code" input field and the associated logic (`redeem_promo_code`).
    *   *Alternative*: If you need promo codes, use **Apple Offer Codes** (configured in App Store Connect) and redeem them via the system sheet, not a custom text input.

## 4. Guideline 1.2 - User-Generated Content (UGC)

### Issues:
- Missing precautions for UGC (Community Posts).
- Needs: EULA agreement, Filtering, Flagging (Reporting), Blocking, and 24h action.

### Action Plan:
1.  **Add "Report Post" Feature**:
    *   Update `components/community/PostCard.tsx`.
    *   Add a "Report" button (e.g., in a 3-dot menu or visible icon).
    *   Implement a reporting flow (e.g., open a modal or send an email/API request to your backend).
2.  **Add "Block User" Feature**:
    *   Update `components/community/PostCard.tsx`.
    *   Add a "Block User" button.
    *   Implement logic to hide posts from blocked users locally or via backend filter.
3.  **EULA Agreement**:
    *   Ensure users agree to the EULA (stating "no tolerance for objectionable content") during Sign Up or before their first post.
    *   Add a checkbox or explicit text in the Sign Up screen or "Create Post" modal.
4.  **Moderation**:
    *   Ensure you have a way to view reported posts and delete them within 24 hours. (This can be a simple admin dashboard or manual database check for now).

## Summary of Code Changes Required

1.  **`app.config.js`**: (Optional) Set `ios.supportsTablet: false` if not supporting iPad properly.
2.  **`app/(tabs)/pricing.tsx`**:
    *   Remove Promo Code input.
    *   Add Privacy Policy & EULA links.
3.  **`components/community/PostCard.tsx`**:
    *   Add Report/Block functionality.
4.  **`app/(auth)/sign-up.tsx`** (or similar):
    *   Ensure EULA agreement is clear.

---

**Q: Is it mandatory to upload iPad pictures?**
**A:** Yes, because your app is currently configured as a "Universal" app (`ios.supportsTablet: true`).
*   **If you want to keep iPad support**: You MUST upload iPad screenshots. You can use the iOS Simulator to take them if you don't have a physical device.
*   **If you don't care about iPad**: You can set `ios.supportsTablet: false` in your `app.config.js` and rebuild. Then you won't need iPad screenshots, but the app will look like a zoomed-in iPhone app on iPads.
