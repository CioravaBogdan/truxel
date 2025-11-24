# Apple IAP & RevenueCat Product Status

## 🟢 Active Products (Production Ready)

### Standard Tier ($29.99/mo)
- **Entitlement:** `standard_access`
- **Web (Stripe):** `$rc_monthly` / `$rc_custom_standard_usd`
- **iOS:** `truxel_2999_1month`
- **Android:** `truxel_standard_monthly`
- **Influencer Special (Web):** `prod_TTs9XfKRBVir4Q` (RC: `prod787450dd1a`)
- **Influencer Special (iOS):** `truxel_standard_influencer`

### Pro Tier ($49.99/mo)
- **Entitlement:** `pro_access`
- **Web (Stripe):** `$rc_annual` / `$rc_custom_pro_usd`
- **iOS:** `truxel_4999_1month`
- **Android:** `truxel_pro_monthly`
- **Influencer Special (Web):** `prod_TTs7Rn03E1Porw` (RC: `prod9ec2a150e7`)
- **Influencer Special (iOS):** `truxel_pro_influencer`

### Fleet Manager ($29.99/mo)
- **Entitlement:** `fleet_manager_access` (Note: Check entitlement mapping)
- **Web (Stripe):** `$rc_custom_fleet_manager_usd`
- **iOS:** `truxel_2999_fleet_1month`
- **Android:** `truxel_fleet_manager_monthly`

### Pro Freighter ($49.99/mo)
- **Entitlement:** `pro_access` (Shared with Pro)
- **Web (Stripe):** `$rc_custom_pro_freighter_usd`
- **iOS:** `truxel_4999_profreighter_1month`
- **Android:** `truxel_pro_freighter_monthly`

### Search Pack Add-on ($24.99 / 25 searches)
- **Entitlement:** `search_credits`
- **Web (Stripe):** `one_time_25_searches`
- **iOS:** `truxel_2499_onetime`
- **Android:** `truxel_search_pack_25`

## 🎁 Offerings
- **Default:** `current` (Standard, Pro, Fleet, Freighter, Search Pack)
- **Influencer Special:** `influencer_special` (RC ID: `ofrngb59ae7fe93`)
  - Contains discounted products with 3-month intro pricing.

## 🔄 Webhook Logic
The Supabase Edge Function `revenuecat-webhook` maps entitlements to tiers:
- `fleet_manager_access` -> `premium` (Wait, check this mapping in code)
- `pro_access` -> `pro`
- `standard_access` -> `standard`

**Note:** Ensure `fleet_manager_access` is correctly mapped in the webhook if it differs from `premium`.
