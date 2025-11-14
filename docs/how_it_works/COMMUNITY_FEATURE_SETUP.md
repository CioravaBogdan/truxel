# Community Feature Setup Guide

## Overview
The Community feature allows truck drivers and logistics companies to post availability and routes in real-time, creating a dynamic marketplace for finding loads and drivers.

## Database Setup

### 1. Run migrations in Supabase Dashboard

Go to the SQL Editor in your Supabase Dashboard and run the following files in order:

1. **community_setup.sql** - Creates all necessary tables, functions, and RLS policies
2. **cities_import.sql** - Imports city data for Romania, Poland, Turkey, Lithuania, and Spain

### 2. Enable Required Extensions

The following extensions should be enabled (the migration scripts handle this):
- `pg_trgm` - For fuzzy text search in city names
- `postgis` - For geospatial queries (if using location-based features)

### 3. Verify Setup

Run this query to verify everything is set up correctly:

```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'community_posts',
  'cities',
  'subscription_limits',
  'user_post_usage',
  'community_interactions',
  'community_notifications'
);

-- Check cities are loaded
SELECT COUNT(*) as city_count FROM cities;

-- Check functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'check_post_limits',
  'expire_old_posts',
  'increment_view_count'
);
```

## Frontend Setup

### 1. Install Dependencies

```bash
npm install lodash date-fns @types/lodash
```

### 2. Features Implemented

- **Quick Post Bar** - 2-tap posting interface with template selection
- **Community Feed** - Real-time feed with tabs for Available Drivers and Available Routes
- **City Search** - Free local city search without API costs
- **Post Templates** - 8 pre-defined templates for common scenarios
- **Subscription Limits** - Server-side enforcement of posting limits
- **Contact Actions** - WhatsApp and Phone integration for premium users

### 3. Key Components

- `components/community/CommunityFeed.tsx` - Main feed component
- `components/community/QuickPostBar.tsx` - Posting interface
- `components/community/PostCard.tsx` - Individual post display
- `components/community/CitySearchModal.tsx` - City selection
- `components/community/TemplateSelector.tsx` - Template selection modal

### 4. Services

- `services/communityService.ts` - All community-related API calls
- `services/cityService.ts` - City search and caching
- `store/communityStore.ts` - Zustand store for state management

## Usage

### For Users

1. **Posting** - Tap the Quick Post button, select a template, choose location
2. **Viewing** - Browse the Community tab to see available drivers and routes
3. **Contacting** - Premium users can contact via WhatsApp or phone directly

### Subscription Tiers

- **Trial**: Can view posts but cannot contact
- **Basic**: 5 posts/month, can contact
- **Pro**: 20 posts/month, can contact
- **Enterprise**: 50 posts/month, can contact

All users have a hard cap of 10 posts per day to prevent spam.

### Post Lifecycle

- Posts expire after 24 hours automatically
- Duplicate posts (same template/location) prevented for 15 minutes
- Real-time updates via Supabase subscriptions

## Testing Checklist

- [ ] Create a test post as a driver
- [ ] Create a test post as a company
- [ ] Verify city search works
- [ ] Test subscription limits
- [ ] Verify posts expire after 24 hours
- [ ] Test WhatsApp/Phone contact buttons
- [ ] Check real-time updates work
- [ ] Verify duplicate prevention

## Troubleshooting

### Common Issues

1. **"Cannot find cities"** - Make sure cities_import.sql was run
2. **"Post limit exceeded"** - Check user_post_usage table
3. **Real-time not working** - Verify Supabase Realtime is enabled
4. **Contact buttons not working** - Check subscription tier

### Debug Queries

```sql
-- Check user's current usage
SELECT * FROM user_post_usage WHERE user_id = 'USER_ID';

-- View active posts
SELECT * FROM community_posts
WHERE expires_at > NOW()
ORDER BY created_at DESC;

-- Check subscription limits
SELECT * FROM subscription_limits;
```

## Future Enhancements

- Push notifications for nearby posts
- Advanced filters (cargo type, price range)
- Post analytics and conversion tracking
- Automated matching algorithm
- Premium visibility boost options