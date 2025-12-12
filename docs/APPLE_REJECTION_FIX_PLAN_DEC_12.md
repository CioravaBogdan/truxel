# Apple App Store Rejection Fix Plan (Dec 12, 2025)

This document outlines the steps to address the rejection issues reported by Apple on December 12, 2025.

## 1. Guideline 2.3.7 - Performance - Accurate Metadata
**Issue:** Screenshots include references to the price (e.g., "$29.99", "Free", "Discount").
**Action:**
- [ ] **Edit Screenshots:** Open your design tool (Figma/Canva) and remove ANY text that mentions specific prices, "Free", or "Discount".
- [ ] **Replace Screenshots:** Upload the new, price-free screenshots to App Store Connect for all device sizes.

## 2. Guideline 2.3.2 - Performance - Accurate Metadata
**Issue:** `ONE_TIME_25_SEARCHES` has the same Display Name and Description.
**Action:**
- [ ] **Update App Store Connect:**
    - Go to **App Store Connect > In-App Purchases**.
    - Select `ONE_TIME_25_SEARCHES`.
    - Change **Display Name** to: `25 Search Credits` (max 30 chars).
    - Change **Description** to: `Get 25 additional lead searches.` (max 45 chars).
    - Ensure they are *different*.
- [ ] **Update RevenueCat (Optional but recommended):**
    - Ensure the product name in RevenueCat matches for consistency.

## 3. Guideline 3.1.2 - Business - Payments - Subscriptions
**Issue:** Missing functional link to Terms of Use (EULA) in App Description/Metadata.
**Action:**
- [ ] **Update App Description:**
    - Go to **App Store Connect > App Information** (or the version page).
    - In the **Description** field, add the following at the bottom:
      ```text
      Terms of Use (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
      Privacy Policy: https://truxel.com/privacy
      ```
    - *Note:* Since you use the standard Apple EULA, you can link to it directly.
- [ ] **Verify App Binary:**
    - The links ARE present in the app (`PricingScreen`), but ensure they work.
    - Open the app, go to the Pricing screen, scroll to the bottom, and tap "Terms of Service" and "Privacy Policy". Ensure they open correctly in the browser.

## 4. Guideline 3.0 - Business
**Issue:** Confirmation of $49.99 price for `Monthly Access Pro`.
**Action:**
- [ ] **Reply to Apple:**
    - In App Store Connect, reply to the rejection message:
      > "Yes, I confirm that $49.99 USD is the intended price for the 'Monthly Access Pro' in-app purchase product."

## 5. Guideline 2.1 - Performance - App Completeness
**Issue:** Error "Sandbox receipt used in production" during IAP purchase.
**Diagnosis:** This error occurs when the app (built for Production) tries to validate a receipt from a Sandbox account (Apple Reviewer) against the Production URL. RevenueCat handles this automatically *IF* the Shared Secret is correct.
**Action:**
- [ ] **Verify Shared Secret in RevenueCat:**
    - Go to **RevenueCat Dashboard > App Settings > iOS**.
    - Ensure the **App Store Shared Secret** matches exactly what is in **App Store Connect > Users and Access > Shared Secret**.
    - Your `.env` has: `TRUXEL_IOS_APP_SHARED_SECRET=45d310ca90494ce8bc04ed398f88d12d`. Verify this is the one in RevenueCat.
- [ ] **Verify Bundle ID:**
    - Ensure RevenueCat App Bundle ID matches `io.truxel.app` (from your `app.config.js`).
- [ ] **Reply to Apple:**
    - Once you verified the Shared Secret, tell Apple:
      > "We are using RevenueCat for subscription management, which automatically handles the 'Sandbox receipt used in production' error by retrying validation with the Sandbox environment. We have verified our App Store Shared Secret configuration. Please try purchasing again."

## Summary Checklist for Resubmission
1. [ ] Screenshots updated (no prices).
2. [ ] `ONE_TIME_25_SEARCHES` metadata updated (unique name/desc).
3. [ ] App Description updated with EULA/Privacy links.
4. [ ] Shared Secret verified in RevenueCat.
5. [ ] Reply sent to Apple confirming price and explaining RevenueCat setup.
