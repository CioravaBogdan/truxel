# 🚨 ACTION REQUIRED: Manual Steps for Apple Rejection Fix

I have analyzed your App Store Connect account, but I cannot automatically update the metadata because the necessary tools to "list versions" and "list in-app purchases" are not available to me, and the RevenueCat connection is currently unstable.

**You must perform the following 3 steps manually in App Store Connect.**

## 1. Update App Description (Guideline 3.1.2)
**Goal:** Add the missing EULA and Privacy Policy links.

1.  Log in to [App Store Connect](https://appstoreconnect.apple.com).
2.  Go to **My Apps** -> **Truxel**.
3.  Select the **1.0** version (likely marked as "Rejected").
4.  Scroll down to the **Description** field.
5.  **Copy and paste** this text at the very bottom of your existing description:

```text
Terms of Use (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
Privacy Policy: https://truxel.com/privacy
```

6.  Click **Save**.

## 2. Update IAP Metadata (Guideline 2.3.2)
**Goal:** Make the Name and Description of `ONE_TIME_25_SEARCHES` unique.

1.  In App Store Connect, go to **In-App Purchases** (in the sidebar).
2.  Select the product with Product ID: `ONE_TIME_25_SEARCHES`.
3.  Update the fields:
    *   **Display Name:** `25 Search Credits`
    *   **Description:** `Get 25 additional lead searches.`
4.  Click **Save**.

## 3. Verify RevenueCat Shared Secret (Guideline 2.1)
**Goal:** Fix the "Sandbox receipt used in production" error.

1.  **Get the Secret from Apple:**
    *   In App Store Connect, go to **App Information** (General section).
    *   Scroll to **App-Specific Shared Secret** -> Click **Manage**.
    *   Copy the code (it should match: `45d310ca90494ce8bc04ed398f88d12d`).
2.  **Update RevenueCat:**
    *   Log in to [RevenueCat Dashboard](https://app.revenuecat.com).
    *   Go to your Project -> **App Settings** (in the sidebar) -> **iOS App**.
    *   Paste the code into the **App Store Shared Secret** field.
    *   Click **Save Changes**.

## 4. Reply to Apple (Guideline 3.0)
1.  Go to the **App Review** section in App Store Connect.
2.  Reply to their message with:

> "1. We have updated the screenshots to remove all price references.
> 2. We have updated the 'ONE_TIME_25_SEARCHES' metadata to have unique Name and Description.
> 3. We have added the EULA and Privacy Policy links to the App Description.
> 4. We confirm that $49.99 USD is the intended price for 'Monthly Access Pro'.
> 5. Regarding the receipt error: We use RevenueCat, which automatically handles sandbox receipts. We have verified that our App Store Shared Secret is correctly configured in RevenueCat. Please try the purchase again."

3.  Click **Submit for Review**.
