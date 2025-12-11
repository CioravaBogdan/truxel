# Truxel - Apple Review Fix & Feature Implementation Plan

This document outlines the technical steps to address the Apple App Store rejection and implement the requested features (Report/Block, iPad disable, Promo Code removal).

## 1. Database Changes (Supabase)

We need to add tables to handle user blocking and content reporting.

### New Migration: `20251210_report_block_system.sql`

#### Table: `user_blocks`
Stores which users have blocked other users.
- `id`: UUID (PK)
- `blocker_id`: UUID (FK to auth.users/profiles)
- `blocked_id`: UUID (FK to auth.users/profiles)
- `created_at`: Timestamp
- **Constraint**: Unique pair (blocker_id, blocked_id)

#### Table: `content_reports`
Stores reports against posts.
- `id`: UUID (PK)
- `reporter_id`: UUID (FK to auth.users/profiles)
- `post_id`: UUID (FK to community_posts)
- `reason`: Text
- `status`: Enum ('pending', 'resolved', 'dismissed')
- `created_at`: Timestamp

#### RLS Policies
- **user_blocks**:
  - INSERT: Authenticated users can block others.
  - SELECT: Users can see who they have blocked.
  - DELETE: Users can unblock.
- **content_reports**:
  - INSERT: Authenticated users can report posts.
  - SELECT: Only admins (service role) or the reporter can see.

## 2. App Configuration (iPad Support)

To avoid the requirement for iPad screenshots, we will disable iPad support.

- **File**: `app.config.js`
- **Change**: Set `ios.supportsTablet` to `false`.

## 3. Pricing & Promo Codes

Apple rejected the custom promo code field. We will remove it and rely on Apple Offer Codes / RevenueCat.

- **File**: `app/(tabs)/pricing.tsx`
- **Changes**:
  - Remove `promoCode` state and input UI.
  - Remove `handleRedeemCode` function.
  - Add "Redeem Offer Code" button (optional, calls `Purchases.presentCodeRedemptionSheet()`).
  - Add **Terms of Use** and **Privacy Policy** links at the bottom of the screen.

### Influencer Discount Strategy (No Custom Codes)
Instead of entering a code in the app:
1.  **Apple Offer Codes**: Create codes like "TRUXEL50" in App Store Connect.
2.  **Distribution**: Give the code to the influencer.
3.  **Redemption**: Users redeem it in the App Store settings or via a direct link (`https://apps.apple.com/redeem?ctx=offercodes&id={app_id}&code=TRUXEL50`).
4.  **App Logic**: RevenueCat automatically detects the discounted subscription. No code changes needed in the app logic!

## 4. Community Features (Report & Block)

### UI Changes
- **File**: `components/community/PostCard.tsx`
- **Changes**:
  - Add a "More Options" (3 dots) menu or specific buttons.
  - **Report**: Opens a confirmation dialog -> Calls `communityService.reportPost()`.
  - **Block**: Opens a confirmation dialog -> Calls `communityService.blockUser()`.

### Logic Changes
- **File**: `services/communityService.ts`
  - Add `reportPost(postId, reason)`
  - Add `blockUser(userId)`
  - Update `getPosts()` to filter out posts from blocked users.
    - *Strategy*: Fetch `blocked_users` list first, then use `.not('user_id', 'in', blockedIds)` in the post query.

- **File**: `store/communityStore.ts`
  - Add `blockedUsers` state.
  - Load blocked users on init.
  - Pass blocked list to `communityService.getPosts`.

## 5. Execution Order

1.  **Apply Database Migration** (I will create the SQL file).
2.  **Update `app.config.js`**.
3.  **Update `pricing.tsx`** (Remove promo, add links).
4.  **Update `communityService.ts` & `communityStore.ts`** (Backend logic).
5.  **Update `PostCard.tsx`** (Frontend UI).
6.  **Verify** everything builds and runs.

---
**Ready to proceed?** I will start with Step 1 (Database Migration) and Step 2 (App Config).
