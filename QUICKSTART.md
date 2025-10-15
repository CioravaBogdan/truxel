# Quick Start Guide

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Expo CLI installed globally: `npm install -g expo-cli`
- [ ] Supabase project created at https://supabase.com
- [ ] n8n webhook endpoint configured

## Setup Steps

### 1. Install Dependencies (2 minutes)

```bash
npm install
```

### 2. Configure Supabase (5 minutes)

1. Go to your Supabase project dashboard
2. Copy your project URL and anon key
3. Update `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Create Database Tables (3 minutes)

1. Open Supabase SQL Editor
2. Copy contents of `supabase-migration.sql`
3. Paste and run the SQL
4. Verify tables are created in Table Editor

### 4. Configure n8n Webhook (10 minutes)

Your n8n workflow must:

1. **Receive POST request** at: `https://n8n.byinfant.com/webhook/logistics-lead-webhook`

2. **Extract these parameters**:
   - `search_id` (uuid)
   - `user_id` (uuid)
   - `keywords` (string)
   - `address` (string)
   - `latitude` (number)
   - `longitude` (number)
   - `radius_km` (number, always 5)

3. **Scrape/fetch company data** from Google Maps or other sources within 5km radius

4. **Insert leads into Supabase**:
   ```javascript
   // For each company found
   INSERT INTO leads (
     user_id,
     source_search_id,
     company_name,
     contact_person_name,
     email,
     phone,
     whatsapp,
     address,
     city,
     latitude,
     longitude,
     industry
   ) VALUES (...)
   ```

5. **Update search status when complete**:
   ```javascript
   UPDATE searches
   SET status = 'completed',
       completed_at = NOW(),
       results_count = X
   WHERE id = search_id
   ```

### 5. Start Development Server (1 minute)

```bash
npm run dev
```

Then:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR with Expo Go app on physical device

## Testing the App

### Create Test Account

1. Open app in simulator/device
2. Click "Don't have an account?"
3. Register with:
   - Email: test@example.com
   - Password: test123
   - Full Name: Test User
   - Phone: +40123456789
   - Company: Test Transport

### Test Search Flow

1. Go to Search tab
2. Click "Search Around Me" or enter address manually
3. Enter keywords: "logistics warehouse"
4. Click "Start Search"
5. Confirm the search
6. App will send webhook to n8n
7. n8n processes and adds leads
8. App will update when complete

### Verify Database

Check Supabase Table Editor:
- `profiles` table should have 1 row
- `searches` table should have 1 row with status "pending"
- After n8n completes: `leads` table should have results

## Common Issues

### "Network error" on login
- Check Supabase URL and key are correct in `.env`
- Verify Supabase project is not paused

### Search doesn't complete
- Check n8n workflow is active
- Verify webhook URL is correct
- Check n8n logs for errors
- Ensure n8n has Supabase connection configured

### Location not working
- Grant location permissions when prompted
- Use physical device for better GPS accuracy
- Simulators may have limited location capabilities

### App crashes on start
- Run `expo start -c` to clear cache
- Delete `node_modules` and run `npm install`
- Check for TypeScript errors: `npm run typecheck`

## Next Steps

1. **Configure Stripe** for subscriptions (optional for testing)
2. **Add Google Maps API key** in `app.json` for better map experience
3. **Set up push notifications** with Expo push service
4. **Test on real devices** for best experience
5. **Build for production** with EAS Build when ready

## Support

Need help? Check:
- README.md for detailed documentation
- Expo docs: https://docs.expo.dev
- Supabase docs: https://supabase.com/docs
- n8n docs: https://docs.n8n.io

## Subscription Tiers (Already Configured)

- **Trial**: 5 searches total, free
- **Standard**: 15 searches/month, €29.99
- **Premium**: 100 searches/month, €199.99
- **Add-on Pack**: 10 searches, €24.99

Users start with Trial automatically on registration.
