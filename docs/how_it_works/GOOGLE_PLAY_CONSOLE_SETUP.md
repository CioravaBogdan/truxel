# 🤖 Android Google Play Console Setup Guide

## Prerequisites
- Google Play Developer Account ($25 one-time fee)
- Truxel app uploaded to Internal Testing/Alpha/Beta
- Package Name: `io.truxel.app`

---

## Step 1: Access Google Play Console

1. Go to [Google Play Console](https://play.google.com/console/)
2. Sign in with your Google Developer account
3. Click **"All apps"**
4. Find **"Truxel"** in the list (or create app if not exists)

---

## Step 2: Navigate to Monetization Setup

1. In left sidebar, click **"Monetize"** section
2. Click **"Products"** → **"Subscriptions"**
3. You should see options to create subscription products

---

## Step 3: Create Standard Subscription

1. Click **"Create subscription"**
2. **Product ID**: `standard_monthly` ⚠️ MUST MATCH iOS
3. **Name**: Truxel Standard Plan
4. **Description**:
   ```
   Growing logistics companies need powerful search tools. 
   Get 30 searches per month, 5 community posts per day, 
   and standard support.
   ```
5. Click **"Continue"**

### Configure Billing Period:

- **Subscription period**: 1 month
- **Grace period**: 7 days (recommended)
- **Free trial**: None (or add 7-day trial if desired)
- Click **"Continue"**

### Set Pricing:

1. Click **"Add base plan"**
2. **Base plan ID**: `monthly-autorenew`
3. **Billing period**: 1 month
4. **Renewal type**: Auto-renewing
5. Click **"Continue"**

### Add Pricing for Regions:

1. **Default price**: Select **"Specify price by country"**
2. Add prices:
   - **Europe (EUR)**: €29.99
   - **United States (USD)**: $29.99
   - **Canada (CAD)**: $39.99 (or auto-convert)
   - **Mexico (MXN)**: $549 (or auto-convert)
   - **Romania (RON)**: 139.99 lei (or auto-convert)
3. Click **"Apply prices"**
4. Click **"Activate"**

---

## Step 4: Create Pro Subscription

1. Click **"Create subscription"** again
2. **Product ID**: `pro_monthly` ⚠️ MUST MATCH iOS
3. **Name**: Truxel Pro Plan
4. **Description**:
   ```
   Advanced logistics professionals need cutting-edge tools. 
   Get 50 searches per month, 10 community posts per day, 
   LinkedIn integration, AI matching, and priority support.
   ```

### Configure Billing:

- **Subscription period**: 1 month
- **Grace period**: 7 days
- **Free trial**: None
- **Base plan ID**: `monthly-autorenew`

### Pricing:

- **Europe (EUR)**: €49.99
- **United States (USD)**: $49.99
- **Canada (CAD)**: $69.99
- Add other regions

Click **"Activate"**

---

## Step 5: Create Fleet Manager Subscription

1. Create another subscription
2. **Product ID**: `fleet_manager_monthly` ⚠️ MUST MATCH iOS
3. **Name**: Truxel Fleet Manager Plan
4. **Description**:
   ```
   Freight forwarders need to post loads, not search. 
   Get 10 searches per month, 30 community posts per day, 
   and manage multiple drivers and routes.
   ```

### Configure Billing:

- **Subscription period**: 1 month
- **Grace period**: 7 days
- **Base plan ID**: `monthly-autorenew`

### Pricing:

- **Europe (EUR)**: €29.99
- **United States (USD)**: $29.99
- Add other regions

Click **"Activate"**

---

## Step 6: Create Search Pack (One-Time Purchase)

1. In left sidebar, click **"Products"** → **"In-app products"**
2. Click **"Create product"**
3. **Product ID**: `search_pack_25` ⚠️ MUST MATCH iOS
4. **Name**: 25 Search Credits
5. **Description**:
   ```
   Need extra searches this month? Purchase a pack of 25 
   additional search credits. Credits do not expire.
   ```
6. Click **"Continue"**

### Set Pricing:

1. **Default price**: Select **"Specify price by country"**
2. Add prices:
   - **Europe (EUR)**: €24.99
   - **United States (USD)**: $24.99
   - **Canada (CAD)**: $34.99
   - **Mexico (MXN)**: $449
3. Click **"Apply prices"**
4. **Status**: Set to **"Active"**
5. Click **"Save"**

---

## Step 7: Submit for Review

⚠️ **IMPORTANT**: Unlike iOS, Google Play products are usually available immediately or within hours!

1. All 4 products should now be **"Active"**
2. Google will review them automatically when you submit your app
3. No separate submission needed for products

---

## Step 8: Link Products to RevenueCat

### Get Product IDs from Google Play Console:

1. Go to each product page
2. Copy the **Product ID** (e.g., `standard_monthly`)

### Add to RevenueCat Dashboard:

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com/projects/proj56445e28)
2. Click **"Products"** in left sidebar
3. For each existing RevenueCat product:
   - Click the product
   - Scroll to **"Google Play Configuration"**
   - **Store Product ID**: Enter `standard_monthly`
   - **Base Plan ID**: Enter `monthly-autorenew` (for subscriptions only)
   - Click **"Save"**

### Product ID Mapping:

| RevenueCat Product | Google Play Product ID | Base Plan ID | Description |
|--------------------|----------------------|--------------|-------------|
| Standard Plan EUR | `standard_monthly` | `monthly-autorenew` | €29.99/month |
| Standard Plan USD | `standard_monthly` | `monthly-autorenew` | $29.99/month |
| Pro Plan EUR | `pro_monthly` | `monthly-autorenew` | €49.99/month |
| Pro Plan USD | `pro_monthly` | `monthly-autorenew` | $49.99/month |
| Fleet Manager EUR | `fleet_manager_monthly` | `monthly-autorenew` | €29.99/month |
| Fleet Manager USD | `fleet_manager_monthly` | `monthly-autorenew` | $29.99/month |
| Search Pack 25 EUR | `search_pack_25` | (none) | €24.99 |
| Search Pack 25 USD | `search_pack_25` | (none) | $24.99 |

⚠️ **NOTE**: Same Product ID for EUR and USD - Google handles regional pricing automatically!

---

## Step 9: Test with License Testers

### Create Test Accounts:

1. In Google Play Console, go to **"Setup"** → **"License testing"**
2. Click **"Create list"**
3. **List name**: "Truxel Internal Testers"
4. Add Gmail addresses (must be Gmail accounts):
   ```
   tester1@gmail.com
   tester2@gmail.com
   your-email@gmail.com
   ```
5. **License response**: Select **"RESPOND_NORMALLY"** (simulates real purchases)
6. Click **"Save"**

### Add Testers to Internal Testing Track:

1. Go to **"Release"** → **"Internal testing"**
2. Click **"Testers"** tab
3. Add email list created above
4. Click **"Save"**

### Send Test Link:

1. Copy the **"Copy link"** URL from Internal Testing page
2. Send to testers
3. Testers must:
   - Open link on Android device
   - Click **"Become a tester"**
   - Download Truxel from Play Store

---

## Step 10: Test Purchases

### On Android Device:

1. Install Truxel from Internal Testing track
2. Open app and go to Pricing screen
3. Try to purchase a subscription
4. Google Play will show:
   - "Test purchase - no charge"
   - Complete purchase instantly
5. Verify purchase completed in app

### Verify in RevenueCat:

1. Go to RevenueCat Dashboard
2. Click **"Customers"**
3. Search for your test user
4. Verify entitlements are active

---

## Step 11: Add to .env File

After getting RevenueCat API keys:

```bash
# Android RevenueCat API Key (from RevenueCat Dashboard > Apps > Truxel Android)
TRUXEL_REVENUECAT_ANDROID_KEY=goog_xxxxxxxxxxxxxxxxxxxxx
```

---

## Step 12: Configure Google Play Service Account (for RevenueCat)

### Why Needed?
RevenueCat needs access to your Google Play account to validate purchases and manage subscriptions.

### Create Service Account:

1. In Google Play Console, go to **"Setup"** → **"API access"**
2. Click **"Choose a project to link"**
3. Select existing project or create new one
4. Click **"Link"**
5. Under "Service accounts", click **"Create new service account"**
6. You'll be redirected to Google Cloud Console

### In Google Cloud Console:

1. Click **"+ CREATE SERVICE ACCOUNT"**
2. **Service account name**: `RevenueCat API Access`
3. **Service account ID**: `revenuecat-api`
4. Click **"CREATE AND CONTINUE"**
5. **Role**: Select **"Service Account User"**
6. Click **"CONTINUE"**
7. Click **"DONE"**

### Grant Permissions in Play Console:

1. Back in Google Play Console > API access
2. Find your new service account in the list
3. Click **"Manage Play Console permissions"**
4. Under "Financial data":
   - [x] View financial data
   - [x] Manage orders and subscriptions
5. Click **"Invite user"**
6. Click **"Send invite"**

### Generate API Key:

1. Click on your service account name
2. Click **"Create new key"**
3. Select **"JSON"**
4. Click **"CREATE"**
5. A JSON file will download - **SAVE THIS SECURELY!**

### Upload to RevenueCat:

1. Go to RevenueCat Dashboard
2. Click **"Apps"** → **"Truxel Android"**
3. Scroll to **"Google Play Configuration"**
4. Click **"Upload Service Account JSON"**
5. Upload the JSON file downloaded above
6. Click **"Save"**

---

## Common Issues & Solutions

### ❌ "Product not found"
**Solution**: 
1. Verify Product IDs match exactly between Play Console and RevenueCat
2. Wait 10-15 minutes for Google's servers to sync
3. Rebuild app with `eas build`

### ❌ "Failed to connect to billing service"
**Solution**:
1. Check internet connection
2. Verify Google Play Services is up-to-date
3. Clear Google Play Store cache

### ❌ "This item is already owned"
**Solution**:
1. Go to Google Play Store app
2. Menu → Subscriptions
3. Cancel test subscription
4. Wait 5 minutes
5. Try again

### ❌ "Service account doesn't have permissions"
**Solution**:
1. Go back to Play Console > API access
2. Re-invite service account with correct permissions
3. Re-upload JSON to RevenueCat

---

## Submission Checklist

- [ ] Created Standard subscription (standard_monthly, €29.99/month)
- [ ] Created Pro subscription (pro_monthly, €49.99/month)
- [ ] Created Fleet Manager subscription (fleet_manager_monthly, €29.99/month)
- [ ] Created Search Pack in-app product (search_pack_25, €24.99)
- [ ] Added pricing for EUR, USD, CAD, MXN, RON regions
- [ ] Set all products to "Active" status
- [ ] Created license testing list with test accounts
- [ ] Added testers to Internal Testing track
- [ ] Linked Product IDs to RevenueCat products (with Base Plan IDs)
- [ ] Created Google Cloud service account
- [ ] Granted Play Console permissions to service account
- [ ] Generated and uploaded service account JSON to RevenueCat
- [ ] Added TRUXEL_REVENUECAT_ANDROID_KEY to .env
- [ ] Tested purchases on Android device
- [ ] Verified entitlements in RevenueCat dashboard

---

## Key Differences: iOS vs Android

| Feature | iOS App Store | Android Google Play |
|---------|--------------|---------------------|
| **Review Time** | 1-3 business days | Instant or few hours |
| **Testing** | Sandbox accounts (separate email) | License testers (Gmail) |
| **Regional Pricing** | Handled by Apple | Handled by Google |
| **Service Account** | Not needed | Required for RevenueCat |
| **Product ID Format** | `standard_monthly` | `standard_monthly` + `monthly-autorenew` |
| **Purchase Confirmation** | Biometric/password | Google Play prompt |

---

## Next Steps

1. ✅ Complete iOS App Store Connect setup
2. ✅ Complete Android Google Play Console setup
3. ⏭️ Build apps with EAS:
   ```bash
   eas build --profile production --platform all
   ```
4. ⏭️ Test purchases on both iOS and Android
5. ⏭️ Submit to App Review (iOS) and Production (Android)

---

**File**: `GOOGLE_PLAY_CONSOLE_SETUP.md`  
**Related**: `APP_STORE_CONNECT_SETUP.md`, `REVENUECAT_SETUP_COMPLETE.md`
