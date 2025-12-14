# Subscription tier not updating in Supabase (TestFlight) — Debug log

Date: 2025-12-14

## Symptom
- In the app (TestFlight), user appears to upgrade to **Pro**.
- In RevenueCat dashboard, subscription **does not show the expected change**.
- In Supabase (`profiles.subscription_tier`), the tier stays **standard**.

## Observations (from Supabase)
- `profiles` row for the test user stayed `subscription_tier = standard` while the app UI showed Pro.
- `transactions` table contained repeated `tier_or_pack_name = standard` entries.
- Supabase Edge Function request logs show `POST 200` calls to `revenuecat-webhook`, meaning *some* events reached the endpoint, but the tier mapping still resulted in `standard`.

## Root cause (code)
The app was deriving the purchased tier using **RevenueCat package identifier** (`pkg.identifier`).

Problem: for RevenueCat default packages, the identifier is often the same across multiple products (e.g. `$rc_monthly`).
That caused this:
- `getTierName('$rc_monthly')` returned `standard` (hardcoded mapping)
- The UI and purchase selection/dedup logic could mismatch tiers and even select the wrong package
- Supabase sync after purchase could write the wrong tier

In other words: the code was using the wrong key to identify *which* product was bought.

## Fix implemented
### 1) App (pricing)
Changed tier detection and package selection to use the **store product identifier**:
- Use `pkg.product.identifier` instead of `pkg.identifier` when:
  - deduplicating offerings
  - selecting which package belongs to each tier
  - deciding `targetTier` and `purchasedTier`
  - setting/loading purchase state

This product identifier is the real StoreKit product id on iOS (ex: `truxel_4999_1month`).

### 2) Supabase webhook
Changed tier mapping to prefer `event.product_id`:
- Map tier from `event.product_id` first (source of truth at purchase time)
- Fallback to entitlements mapping if product id is unknown

This avoids cases where entitlements are delayed or temporarily stale.

## Notes / limits
- App Store Connect subscription groups cannot be verified via App Store Connect MCP tools here.
- RevenueCat per-customer event logs are not available through the MCP tools used in this workspace.

## Next steps to validate
1) In TestFlight app, attempt upgrade again.
2) Confirm RevenueCat shows the new product under the customer.
3) Confirm Supabase `profiles.subscription_tier` updates to `pro` and `available_search_credits` matches expected.
4) If still not updating:
   - capture device logs from app purchase flow (console logs around purchase)
   - verify that the package’s `product.identifier` matches the expected iOS product ids in App Store Connect
