# Truxel - GitHub Copilot Instructions

## Project Overview
**Truxel** is a React Native mobile application for logistics lead management, built with Expo, Supabase, and Stripe.

## Technology Stack
- **Framework**: Expo SDK ~54.0.10 with expo-router ~6.0.13
- **Language**: TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Payments**: Stripe (Subscriptions + One-time payments)
- **State Management**: Zustand ^5.0.2
- **Maps**: react-native-maps ^1.18.3
- **Internationalization**: i18next ^23.4.0 (en, ro, pl, tr, lt, es)

## Critical Configuration

### IMPORTANT: MCP Tools Authentication
**When using global MCP tools (Stripe/Supabase), ALWAYS use these Truxel-specific credentials:**

**For Stripe MCP tools:**
```
STRIPE_SECRET_KEY: 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
STRIPE_PUBLISHABLE_KEY: pk_live_51SIVE9Pd7H7rZiTmyJq94pcMvi44xfBBUD2uvYodYDvBtolNaxGeRS8CwbLLMXClgUwHBz8tdPNMpGQGDXRQ40oU00johXo4OU
```

**For Supabase MCP tools:**
```
SUPABASE_PROJECT_REF: upxocyomsfhqoflwibwn
SUPABASE_URL: https://upxocyomsfhqoflwibwn.supabase.co
SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVweG9jeW9tc2ZocW9mbHdpYnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNTEyMzIsImV4cCI6MjA3NjYyNzIzMn0.Nw3vIQRmjltVULYEhe692UyBY4gIziJds5bqmf9_aw0
```

**⚠️ CRITICAL - Account Identification:**
- **Stripe Truxel Account**: `acct_1SIVE9Pd7H7rZiTm` (separate account from KidBooksmith)
  - Email: office@infant.ro (shared company email)
  - Dashboard: https://dashboard.stripe.com/
  - Products: Currently empty (new project - logistics/leads products to be created)
  - DO NOT confuse with KidBooksmith products (DISCOVER/MAGIC/CINEMA for children's books)
  
- **Supabase Truxel Project**: `upxocyomsfhqoflwibwn`
  - Database contains: `leads`, `searches`, `profiles` tables
  - Dashboard: https://supabase.com/dashboard/project/upxocyomsfhqoflwibwn

**⚠️ VERIFICATION CHECKLIST:**
Before using any Stripe or Supabase MCP tool, verify you're operating on the Truxel project:
- ✅ Stripe: Account ID is `acct_1SIVE9Pd7H7rZiTm`
- ✅ Stripe: Products list should be empty OR contain Truxel logistics products (NOT children's books)
- ✅ Supabase: Project ref is `upxocyomsfhqoflwibwn`
- ✅ Supabase: Database has `leads` table (logistics data, NOT book-related tables)
- ❌ NEVER use KidBooksmith credentials (different project, different Stripe account)

### Environment Variables
Always use these exact credentials for this project:

**Supabase:**
- URL: `https://upxocyomsfhqoflwibwn.supabase.co`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVweG9jeW9tc2ZocW9mbHdpYnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNTEyMzIsImV4cCI6MjA3NjYyNzIzMn0.Nw3vIQRmjltVULYEhe692UyBY4gIziJds5bqmf9_aw0`

**Stripe:**
- Publishable Key: `pk_live_51SIVE9Pd7H7rZiTmyJq94pcMvi44xfBBUD2uvYodYDvBtolNaxGeRS8CwbLLMXClgUwHBz8tdPNMpGQGDXRQ40oU00johXo4OU`
- Secret Key: Stored in `.env` and `.mcp/.env` (never commit these files!)

### Brand Identity
- **Name**: Truxel (NOT LogisticsLead - already rebranded)
- **Package**: com.truxel.app
- **Slug**: truxel
- **Scheme**: truxel://

## Code Style & Patterns

### File Structure
```
app/              # Expo Router file-based navigation
  (auth)/         # Authentication screens (login, register)
  (tabs)/         # Main app tabs (index, leads, search, pricing, profile, community)
  _layout.tsx     # Root layout with auth routing
components/       # Reusable UI components
  community/      # Community feature components
    PostCard.tsx          # Post display with contact buttons
    CommunityFeed.tsx     # Main feed with filters
    QuickPostBar.tsx      # Quick post creation
    TemplateSelector.tsx  # Template selection modal
    CitySearchModal.tsx   # City search with cache
services/         # API services (auth, leads, searches, stripe, community, city)
store/            # Zustand stores (authStore, leadsStore, searchesStore, communityStore)
supabase/         # Edge Functions and migrations
  functions/
    create-checkout-session/
    manage-subscription/
    stripe-webhook/
    stripe-redirect/
  migrations/
```

### Community Feature Architecture (New - Active Feature)
**Critical Pattern**: Community posts use **i18n translation keys** instead of hardcoded text.

**Template Pattern:**
```typescript
// ❌ WRONG - Hardcoded Romanian text
const template = {
  id: 'available_now',
  text: 'Sunt disponibil acum' // DON'T DO THIS
};

// ✅ CORRECT - Translation key pattern
const template = {
  id: 'available_now',
  textKey: 'community.templates.available_now' // Translation key
};

// Usage in component:
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
<Text>{t(template.textKey)}</Text>
```

**Database Tables:**
- `community_posts` - User posts (driver availability, load offers)
- `user_post_usage` - Tracks posts_this_month, posts_today per user
- `subscription_limits` - Tier-based limits (posts_per_month, posts_per_day)
- `community_interactions` - Saves, contacts, views

**Key Components:**
- `PostCard.tsx` - Display post with WhatsApp/Email/Call buttons (pre-populated messages)
- `CommunityFeed.tsx` - Infinite scroll feed with real-time updates
- `QuickPostBar.tsx` - Quick buttons: "I'M AVAILABLE", "I HAVE ROUTE"
- `TemplateSelector.tsx` - Modal for selecting post template
- `CitySearchModal.tsx` - GPS + search + cached cities

**Contact Buttons (PostCard.tsx):**
```typescript
// WhatsApp - Pre-populated contextual message
const message = t('community.whatsapp_driver_available', {
  myName: myCompany,
  theirName: theirCompany,
  city: post.origin_city
});
const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

// Email - Pre-filled subject and body
const subject = t('community.email_subject_driver', { city: post.origin_city });
const body = t('community.email_body_driver', { myName, theirName, city });
const emailUrl = `mailto:${email}?subject=${subject}&body=${body}`;

// Call - Direct phone call
const phoneUrl = `tel:${phoneNumber}`;
```

**Trial Tier Protection:**
```typescript
if (profile?.subscription_tier === 'trial') {
  Alert.alert(
    t('community.upgrade_required'),
    t('community.upgrade_required_message')
  );
  return;
}
```

**Zustand Store Pattern (communityStore.ts):**
```typescript
import { useCommunityStore } from '@/store/communityStore';

const { 
  posts, 
  loadPosts, 
  createPost, 
  savePost, 
  recordContact 
} = useCommunityStore();

// Load posts with filters
await loadPosts(true); // true = reset pagination

// Create post
const post = await createPost(userId, postData);

// Record interaction
await recordContact(postId, userId);
```

### Navigation Guard Pattern
**CRITICAL**: Always guard navigation in `app/_layout.tsx` to prevent mounting errors:
```tsx
const [isNavigationReady, setIsNavigationReady] = useState(false);

useEffect(() => {
  const timer = setTimeout(() => setIsNavigationReady(true), 100);
  return () => clearTimeout(timer);
}, []);

useEffect(() => {
  if (!isNavigationReady) return; // Guard
  // ... navigation logic
}, [isAuthenticated, segments, isNavigationReady]);
```

### Supabase Patterns
**Auth Store Integration:**
```tsx
import { useAuthStore } from '@/store/authStore';

const { user, isAuthenticated, signIn, signOut } = useAuthStore();
```

**Edge Function Calls:**
```tsx
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase.functions.invoke('function-name', {
  body: { /* payload */ }
});
```

### Stripe Patterns
**Client-side (Mobile):**
```tsx
import Constants from 'expo-constants';

const publishableKey = Constants.expoConfig?.extra?.stripePublishableKey;
```

**Server-side (Edge Functions):**
```tsx
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
```

### Supabase RPC Functions (PostgreSQL Functions)
**Usage Pattern:**
```tsx
// Call database function with parameters
const { data, error } = await supabase.rpc('function_name', {
  p_user_id: userId,
  p_param: value
});
```

**Common RPC Functions:**
- `can_user_post(p_user_id)` - Check post limits (returns CanPostResponse)
- `check_duplicate_post(p_user_id, p_origin_city)` - Anti-spam check
- `increment_post_usage(p_user_id)` - Increment post counters
- `get_total_search_credits(p_user_id)` - Get available search credits
- `increment(table_name, column_name, row_id)` - Generic counter increment

**Example (communityService.ts):**
```typescript
async canUserPost(userId: string): Promise<CanPostResponse> {
  const { data, error } = await supabase.rpc('can_user_post', {
    p_user_id: userId
  });
  
  if (error) throw error;
  return data as CanPostResponse;
}
```

### N8N Webhooks - Fire-and-Forget Pattern
**CRITICAL**: Webhooks must NOT block user operations. Use void return, no await.

**❌ WRONG - Blocking Operation:**
```typescript
async sendLocationToWebhook(data: LocationData): Promise<boolean> {
  const response = await fetch(webhookUrl, { 
    method: 'POST',
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(5000) // Still blocks for 5 seconds!
  });
  return response.ok;
}
```

**✅ CORRECT - Fire-and-Forget:**
```typescript
sendLocationToWebhook(data: LocationData): void {
  // Fire and forget - don't await, don't return Promise
  fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).catch(() => {
    // Silently ignore errors - analytics webhook failure is non-critical
  });
}
```

**Usage:**
```typescript
// No await, no error handling - instant return
sendLocationToWebhook({ city, lat, lng });
// User continues immediately, webhook fires in background
```

**When to Use:**
- Analytics/telemetry webhooks (N8N)
- Non-critical notifications
- Background data sync
- Logging/monitoring events

**When NOT to Use:**
- Payment processing
- User data mutations
- Critical business logic
- Operations requiring confirmation

### i18n Translation Pattern
**CRITICAL**: All user-facing text must use translation keys.

**File Structure:**
```
locales/
  en.json    # English (default, fallback)
  ro.json    # Romanian
  pl.json    # Polish
  tr.json    # Turkish
  lt.json    # Lithuanian
  es.json    # Spanish
```

**Translation Key Convention:**
```json
{
  "community": {
    "templates": {
      "available_now": "I'm available now",
      "available_today": "I'm available today"
    },
    "whatsapp_driver_available": "Hello! I'm {{myName}}. I saw you're available in {{city}}.",
    "email_subject_driver": "Availability in {{city}}",
    "upgrade_required": "Upgrade Required"
  }
}
```

**Component Usage:**
```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();
  
  // Simple translation
  <Text>{t('community.upgrade_required')}</Text>
  
  // With variables
  <Text>{t('community.whatsapp_driver_available', {
    myName: 'Acme Logistics',
    city: 'Bucharest'
  })}</Text>
  
  // With fallback (if key missing)
  <Text>{t('community.unknown_key', { 
    defaultValue: 'Fallback text'
  })}</Text>
  
  // Current language
  const currentLang = i18n.language; // 'en', 'ro', etc.
}
```

**Language Switching:**
```tsx
// Set from user profile (app/_layout.tsx)
const userLanguage = profile?.preferred_language || 'en';
if (i18n.language !== userLanguage) {
  i18n.changeLanguage(userLanguage);
}
```

**Best Practices:**
- **Never** hardcode user-facing text in Romanian or any language
- Always use `t(key)` for dynamic text
- Use `defaultValue` for graceful degradation
- Nest keys logically: `section.subsection.key`
- Keep keys consistent across all language files

## Development Commands

### Start Development Server
```bash
# Local network (phone + PC on same WiFi)
npx expo start

# With tunnel (different networks - use only if needed)
npx expo start --tunnel

# Clear cache if changes not reflected
npx expo start --clear
```

### Database Operations
```bash
# Run Supabase locally
npx supabase start

# Apply migrations
npx supabase db push

# Generate TypeScript types
npx supabase gen types typescript --local > types/database.types.ts
```

### Using MCP Tools
**ALWAYS specify Truxel credentials when using global MCP servers:**
- Use `stripe` MCP server with Truxel secret key (sk_live_51SIVE9...)
- Use `supabase-infant` MCP server with project ref `upxocyomsfhqoflwibwn`
- Never mix credentials from other projects (KidBooksmith, InfantCare, etc.)

## Common Pitfalls & Solutions

### ❌ Avoid
- **Don't** call `router.replace()` before Stack component mounts
- **Don't** use hardcoded credentials (always use env vars)
- **Don't** expose `STRIPE_SECRET_KEY` in client-side code
- **Don't** commit `.env`, `.mcp/.env`, or `supabase/.env.local` to git

### ✅ Best Practices
- **Do** use `Constants.expoConfig.extra` for client-side env access
- **Do** guard all navigation with `isNavigationReady` state
- **Do** handle Supabase errors with proper type guards
- **Do** use Zustand stores for global state (auth, leads, searches)
- **Do** implement i18n for all user-facing text

## Subscription Tiers & Pricing

### Active Subscription Plans (Truxel Logistics)
**⚠️ NOTE**: Products to be created in Stripe Dashboard for Truxel logistics app:

1. **Trial** - FREE
   - 5 total searches
   - 1 post/month (Community)
   - Basic features

2. **Standard** - €29.99/month
   - 15 searches/month
   - 5 posts/month
   - Standard support

3. **Pro** - €49.99/month
   - 30 searches/month
   - 15 posts/month
   - LinkedIn integration
   - AI matching

4. **Premium** - €99.99/month
   - 100 searches/month
   - Unlimited posts
   - Priority support
   - Advanced features

### One-time Search Packs
- 10 searches - €4.99
- 25 searches - €9.99
- 50 searches - €17.99

**Database**: See `subscription_tiers` and `additional_search_packs` tables in Supabase

## Debugging Tips

### Navigation Errors
If you see "Attempted to navigate before mounting the Root Layout component":
1. Check `isNavigationReady` state in `app/_layout.tsx`
2. Clear Metro cache: `npx expo start --clear`
3. Verify no navigation calls outside useEffect guards

### Supabase Connection Issues
1. Verify URL and anon key in `.env`
2. Check `lib/supabase.ts` initialization
3. Test auth endpoints in Supabase Dashboard

### Stripe Webhook Issues
1. Verify `STRIPE_WEBHOOK_SECRET` in `supabase/.env.local`
2. Check webhook signature validation in `stripe-webhook/index.ts`
3. Test with Stripe CLI: `stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook`

## Git Workflow
**Protected Files** (never commit):
- `.env`
- `.mcp/.env`
- `supabase/.env.local`
- `node_modules/`
- `.expo/`

**Safe to commit**:
- `.env.example` (template only)
- `app.config.js` (uses env vars via `extra`)
- All source code in `app/`, `components/`, `services/`, `store/`

## Support Resources
- **Expo Docs**: https://docs.expo.dev/
- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **React Native Maps**: https://github.com/react-native-maps/react-native-maps

---

**Last Updated**: October 22, 2025
**Project Status**: Development (navigation fix applied, ready for testing)
