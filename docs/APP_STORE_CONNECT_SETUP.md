# 🍎 iOS App Store Connect Setup Guide

## Prerequisites
- Apple Developer Account ($99/year)
- Truxel app uploaded to TestFlight/App Review
- Bundle ID: `io.truxel.app`

---

## Step 1: Access App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Sign in with your Apple Developer credentials
3. Click **"My Apps"**
4. Find **"Truxel"** in the list (or create app if not exists)

---

## Step 2: Enable In-App Purchases

1. In your app's main page, click **"Features"** tab
2. Click **"In-App Purchases"** in the left sidebar
3. You should see the option to create new products

---

## Step 3: Create Subscription Groups

### What is a Subscription Group?
- A group of subscriptions where users can only have ONE active subscription at a time
- Users can upgrade/downgrade within the group
- Truxel needs 1 group with 3 tiers

### Create the Group:

1. Click **"Manage"** next to Subscription Groups
2. Click **"+"** to create a new group
3. **Reference Name**: `Truxel Logistics Subscriptions`
4. Click **"Create"**

---

## Step 4: Create Standard Subscription

1. Inside the subscription group, click **"+"** (Create Subscription)
2. **Reference Name**: `Truxel Standard Plan`
3. **Product ID**: `standard_monthly` ⚠️ IMPORTANT: Must match RevenueCat
4. Click **"Create"**

### Configure Standard Plan:

**Subscription Duration:**
- Select **"1 month"**

**Subscription Prices:**
- Click **"+"** to add prices
- **Europe (EUR)**: €29.99
- **United States (USD)**: $29.99
- **Canada (CAD)**: Auto-converts from USD
- **Mexico (MXN)**: Auto-converts from USD
- Add other regions as needed

**Localized Information (English - U.S.):**
- **Display Name**: Standard Plan
- **Description**: 
  ```
  Growing logistics companies need powerful search tools. 
  Get 30 searches per month, 5 community posts per day, 
  and standard support.
  ```

**App Store Promotion (Optional):**
- **Promotional Image**: Upload 1024x1024 image (Truxel brand assets)
- **Promotional Text**: "Start growing your logistics network today!"

**Review Information:**
- **Review Notes**: "Standard tier subscription for logistics search and community features."

---

## Step 5: Create Pro Subscription

1. Back in subscription group, click **"+"** again
2. **Reference Name**: `Truxel Pro Plan`
3. **Product ID**: `pro_monthly` ⚠️ IMPORTANT
4. Click **"Create"**

### Configure Pro Plan:

**Subscription Duration:**
- Select **"1 month"**

**Subscription Prices:**
- **Europe (EUR)**: €49.99
- **United States (USD)**: $49.99
- Add other regions

**Localized Information (English - U.S.):**
- **Display Name**: Pro Plan
- **Description**:
  ```
  Advanced logistics professionals need cutting-edge tools. 
  Get 50 searches per month, 10 community posts per day, 
  LinkedIn integration, AI matching, and priority support.
  ```

**App Store Promotion:**
- **Promotional Image**: Upload 1024x1024 image
- **Promotional Text**: "Unlock AI-powered matching and LinkedIn contacts!"

---

## Step 6: Create Fleet Manager Subscription

1. Create another subscription
2. **Reference Name**: `Truxel Fleet Manager Plan`
3. **Product ID**: `fleet_manager_monthly` ⚠️ IMPORTANT
4. Click **"Create"**

### Configure Fleet Manager:

**Subscription Duration:**
- Select **"1 month"**

**Subscription Prices:**
- **Europe (EUR)**: €29.99
- **United States (USD)**: $29.99

**Localized Information (English - U.S.):**
- **Display Name**: Fleet Manager Plan
- **Description**:
  ```
  Freight forwarders need to post loads, not search. 
  Get 10 searches per month, 30 community posts per day, 
  and manage multiple drivers and routes.
  ```

**App Store Promotion:**
- **Promotional Image**: Upload 1024x1024 image
- **Promotional Text**: "Perfect for freight forwarders managing loads!"

---

## Step 7: Create Search Pack (Consumable)

1. Go back to **"In-App Purchases"** main page
2. Click **"+"** (Create)
3. Select **"Consumable"** (not subscription)
4. **Reference Name**: `25 Search Credits Pack`
5. **Product ID**: `search_pack_25` ⚠️ IMPORTANT
6. Click **"Create"**

### Configure Search Pack:

**Price:**
- **Europe (EUR)**: €24.99
- **United States (USD)**: $24.99
- Add other regions

**Localized Information (English - U.S.):**
- **Display Name**: 25 Search Credits
- **Description**:
  ```
  Need extra searches this month? Purchase a pack of 25 
  additional search credits. Credits do not expire.
  ```

**App Store Promotion:**
- **Promotional Image**: Upload 1024x1024 image
- **Promotional Text**: "Boost your search capacity!"

**Review Information:**
- **Review Notes**: "One-time purchase of 25 additional search credits."

---

## Step 8: Submit Products for Review

⚠️ **CRITICAL**: You CANNOT test in-app purchases until Apple approves them!

1. For each product (subscriptions + consumable):
   - Review all information
   - Click **"Submit for Review"**
2. Apple typically reviews in **1-3 business days**
3. You'll receive email when approved

---

## Step 9: Link Products to RevenueCat

### Get Product IDs from App Store Connect:

1. Go to each product page
2. Copy the **Product ID** (e.g., `standard_monthly`)

### Add to RevenueCat Dashboard:

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com/projects/proj56445e28)
2. Click **"Products"** in left sidebar
3. For each existing RevenueCat product:
   - Click the product (e.g., "Standard Plan EUR")
   - Scroll to **"App Store Configuration"**
   - **Store Product ID**: Enter `standard_monthly`
   - Click **"Save"**

### Product ID Mapping:

| RevenueCat Product | App Store Product ID | Description |
|--------------------|---------------------|-------------|
| Standard Plan EUR | `standard_monthly` | €29.99/month |
| Standard Plan USD | `standard_monthly` | $29.99/month (same ID, different region) |
| Pro Plan EUR | `pro_monthly` | €49.99/month |
| Pro Plan USD | `pro_monthly` | $49.99/month |
| Fleet Manager EUR | `fleet_manager_monthly` | €29.99/month |
| Fleet Manager USD | `fleet_manager_monthly` | $29.99/month |
| Search Pack 25 EUR | `search_pack_25` | €24.99 |
| Search Pack 25 USD | `search_pack_25` | $24.99 |

⚠️ **NOTE**: Same Product ID for EUR and USD - Apple handles regional pricing automatically!

---

## Step 10: Test in Sandbox

### Enable Sandbox Testing:

1. Go to **"Users and Access"** in App Store Connect
2. Click **"Sandbox Testers"**
3. Click **"+"** to create a test account
4. Fill in:
   - **Email**: Use a NEW email (not your Apple ID)
   - **Password**: Create a test password
   - **First/Last Name**: Test User
   - **Country**: United States (or Romania for EUR testing)
5. Click **"Create"**

### Test on Device:

1. Build Truxel app with EAS:
   ```bash
   eas build --profile development --platform ios
   ```
2. Install on your iPhone
3. Sign out of your real Apple ID in **Settings > App Store**
4. Open Truxel app
5. Try to purchase a subscription
6. When prompted, sign in with your **Sandbox Test Account**
7. Purchase should complete instantly (no actual charge)

### Verify in RevenueCat:

1. Go to RevenueCat Dashboard
2. Click **"Customers"**
3. Search for your test user
4. Verify entitlements are active

---

## Step 11: Add to .env File

After getting RevenueCat API keys:

```bash
# iOS RevenueCat API Key (from RevenueCat Dashboard > Apps > Truxel iOS)
TRUXEL_REVENUECAT_IOS_KEY=appl_xxxxxxxxxxxxxxxxxxxxx
```

---

## Common Issues & Solutions

### ❌ "Product IDs not found"
**Solution**: Wait 1-2 hours after Apple approves products. Apple's servers need time to sync.

### ❌ "Cannot connect to iTunes Store"
**Solution**: Make sure you're signed in with a Sandbox Test Account, not your real Apple ID.

### ❌ "This In-App Purchase has already been bought"
**Solution**: Sandbox test accounts have unlimited purchases. Sign out and back in to reset.

### ❌ "Product not available in your country"
**Solution**: Make sure you added pricing for the region your test account is in.

---

## Submission Checklist

- [ ] Created subscription group "Truxel Logistics Subscriptions"
- [ ] Created Standard subscription (standard_monthly, €29.99/month)
- [ ] Created Pro subscription (pro_monthly, €49.99/month)
- [ ] Created Fleet Manager subscription (fleet_manager_monthly, €29.99/month)
- [ ] Created Search Pack consumable (search_pack_25, €24.99)
- [ ] Added pricing for EUR, USD, CAD, MXN regions
- [ ] Uploaded promotional images (1024x1024)
- [ ] Wrote localized descriptions
- [ ] Submitted all 4 products for review
- [ ] Created sandbox test accounts (US and EU)
- [ ] Linked Product IDs to RevenueCat products
- [ ] Added TRUXEL_REVENUECAT_IOS_KEY to .env
- [ ] Tested purchases in sandbox mode
- [ ] Verified entitlements in RevenueCat dashboard

---

## Next Steps

Once iOS is complete, continue to **Android Google Play Console Setup** →

**File**: `GOOGLE_PLAY_CONSOLE_SETUP.md`
