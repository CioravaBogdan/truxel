# 🚨 Solution: Delete P8 Key to Unlock the Field

It seems RevenueCat **hides** the Shared Secret input field when a P8 key is active, but Apple's error ("Sandbox receipt used in production") specifically requires the Shared Secret to be fixed in many cases.

**We need to temporarily remove the P8 key to force the Shared Secret field to appear.**

## Step 1: Delete the P8 Key
1.  In the RevenueCat Dashboard (where you took the screenshot).
2.  Look at the **In-app purchase key configuration** section (top of your screenshot).
3.  You should see the file `PBSXH578W4.p8`.
4.  There should be a **Delete** or **Remove** button/icon near it (or at the bottom of that section).
    *   *Note: Do NOT click "Delete app" at the very bottom of the page.*
5.  **Delete the P8 key.**

## Step 2: Add the Shared Secret
1.  Refresh the page.
2.  Now, expand the **App-specific shared secret (Legacy)** section again.
3.  The text input field should now be visible!
4.  Paste the code: `45d310ca90494ce8bc04ed398f88d12d`
5.  Click **Save Changes**.

## Step 3: (Optional) Re-add P8 Key
*   After saving the Shared Secret, you can re-upload the P8 key if you wish, but **having the Shared Secret saved is the priority** to fix the Apple rejection.
*   RevenueCat works perfectly fine with just the Shared Secret (Legacy).

## Step 4: Reply to Apple
Once the Shared Secret is saved, send the reply to Apple.
