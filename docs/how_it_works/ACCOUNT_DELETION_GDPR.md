# Account Deletion Feature - GDPR Compliance

## Overview
Implemented complete account deletion feature for App Store and Google Play compliance (GDPR requirements). Users can permanently delete their account and all associated data from the profile screen.

## What Was Added

### 1. Edge Function: `delete-user-account`
**Location**: `supabase/functions/delete-user-account/index.ts`

**What it deletes** (in order to respect foreign key constraints):
1. `community_interactions` - user's saves/unsaves
2. `user_post_usage` - usage tracking
3. `community_posts` - user's community posts
4. `user_leads` - junction table (My Book saves)
5. `searches` - search history
6. `transactions` - payment history
7. `user_search_credits` - credits
8. `support_messages` - support chat messages
9. `notification_log` - notifications
10. `profiles` - user profile
11. Avatar files from Storage bucket `profiles-avatars`
12. `auth.users` - authentication account (final step)

**What it PRESERVES**:
- `leads` table - public company data (not user-specific)
- Reference tables: `cities`, `subscription_tiers`, `subscription_limits`

### 2. Service Method
**File**: `services/authService.ts`
- Added `deleteAccount()` method
- Calls Edge Function with user's access token
- Handles RevenueCat logout
- Throws errors if deletion fails

### 3. UI Components

#### DeleteAccountModal Component
**File**: `components/DeleteAccountModal.tsx`
- **Two-step confirmation process**:
  - Step 1: Warning about permanent deletion + list of data to be deleted
  - Step 2: Final confirmation with critical warning
- Loading state during deletion
- Cannot close modal during deletion process
- Shows all data types that will be deleted

#### Profile Screen Updates
**File**: `app/(tabs)/profile.tsx`
- Added "Danger Zone" section at bottom (red-themed warning card)
- Delete Account button triggers modal
- `handleDeleteAccount()` method:
  - Calls `authService.deleteAccount()`
  - Clears local store
  - Navigates to landing page (web) or login (native)
  - Shows success/error toast

## Deployment Steps

### 1. Deploy Edge Function
```bash
# From project root
npx supabase functions deploy delete-user-account
```

### 2. Verify Function is Live
Go to Supabase Dashboard → Edge Functions → Check `delete-user-account` is deployed

### 3. Test Function (Optional)
```bash
# Get user access token from Supabase Dashboard (Auth → Users → Click user → Copy JWT)
# Test with curl:
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/delete-user-account \
  -H "Authorization: Bearer YOUR_USER_JWT" \
  -H "Content-Type: application/json"
```

## Testing Checklist

### Before Deploying to Production:
- [ ] Create test account
- [ ] Add test data:
  - [ ] Save some leads (My Book)
  - [ ] Create community posts
  - [ ] Save other users' posts
  - [ ] Perform searches
  - [ ] Upload avatar
- [ ] Open profile screen
- [ ] Click "Delete My Account" button
- [ ] Verify modal shows step 1 with data list
- [ ] Click "Continue"
- [ ] Verify modal shows step 2 with final warning
- [ ] Click "Delete My Account" (red button)
- [ ] Wait for loading spinner
- [ ] Verify success toast appears
- [ ] Verify redirect to landing page/login
- [ ] Try to log in with deleted account - should fail (user doesn't exist)

### Database Verification (After Test Deletion):
```sql
-- Check if user data was deleted (replace USER_ID with test user's ID)
SELECT * FROM profiles WHERE user_id = 'USER_ID'; -- Should be empty
SELECT * FROM user_leads WHERE user_id = 'USER_ID'; -- Should be empty
SELECT * FROM searches WHERE user_id = 'USER_ID'; -- Should be empty
SELECT * FROM community_posts WHERE user_id = 'USER_ID'; -- Should be empty
SELECT * FROM community_interactions WHERE user_id = 'USER_ID'; -- Should be empty
SELECT * FROM user_post_usage WHERE user_id = 'USER_ID'; -- Should be empty
SELECT * FROM transactions WHERE user_id = 'USER_ID'; -- Should be empty
SELECT * FROM user_search_credits WHERE user_id = 'USER_ID'; -- Should be empty

-- Verify leads table was NOT affected
SELECT COUNT(*) FROM leads; -- Should be unchanged
```

## App Store/Google Play Compliance

### App Store Connect
This feature satisfies:
- **App Privacy → Data Deletion**: Users can delete their account and all data
- **Privacy Policy Requirement**: Account deletion option is clearly visible
- URL to include in App Store submission: Link to Truxel Privacy Policy with account deletion section

### Google Play Console
This feature satisfies:
- **Data Safety Section → Account Deletion**: Users can request account deletion
- **Path**: Profile Screen → Danger Zone → Delete My Account
- Meets GDPR Right to Erasure requirements

## User Flow

```
Profile Screen
    ↓
[Delete My Account] button in Danger Zone
    ↓
Modal Step 1: Warning + Data List
    ↓
[Continue] button
    ↓
Modal Step 2: Final Confirmation
    ↓
[Delete My Account] (RED button)
    ↓
Loading spinner (2-5 seconds)
    ↓
Success Toast + Logout + Redirect
```

## Error Handling

### Possible Errors:
1. **Not authenticated** - User session expired
   - Solution: Shows error toast, user must re-login
2. **Edge Function error** - Server-side deletion failed
   - Solution: Shows specific error message, user can retry
3. **Network error** - No internet connection
   - Solution: Shows network error, user can retry when online

### What Happens on Error:
- Modal stays open
- Loading spinner stops
- Error toast appears with details
- User can retry deletion
- User can cancel and close modal

## Important Notes

1. **Deletion is PERMANENT** - No way to recover account after deletion
2. **Leads table preserved** - Public company data remains for other users
3. **Two-step confirmation** - Prevents accidental deletion
4. **Cannot interrupt** - Once deletion starts, cannot be cancelled (modal locks)
5. **RevenueCat cleanup** - User's RevenueCat data is also cleared
6. **Web + Native support** - Works on all platforms

## Maintenance

### If New User Tables Are Added:
1. Add deletion logic to Edge Function (`delete-user-account/index.ts`)
2. Add to list in DeleteAccountModal (Step 1)
3. Update this documentation

### If Deletion Fails:
- Check Supabase logs: Dashboard → Edge Functions → delete-user-account → Logs
- Look for foreign key constraint errors
- Ensure deletion order respects FK constraints (delete children before parents)

## Related Files
- Edge Function: `supabase/functions/delete-user-account/index.ts`
- Service: `services/authService.ts` (deleteAccount method)
- Modal: `components/DeleteAccountModal.tsx`
- Profile Screen: `app/(tabs)/profile.tsx`
- This Guide: `docs/how_it_works/ACCOUNT_DELETION_GDPR.md`
