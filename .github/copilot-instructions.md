# Truxel - GitHub Copilot Instructions

## 🚨 CRITICAL RULE #1 - NEVER DELETE WORKING CODE 🚨

**⚠️ MANDATORY FOR ALL AI ASSISTANTS (Sonnet 4.5, GPT-4, Claude, etc.):**

### ABSOLUTE PROHIBITION:
**NEVER, UNDER ANY CIRCUMSTANCES, DELETE OR MODIFY EXISTING WORKING LOGIC WITHOUT EXPLICIT USER CONFIRMATION.**

### What This Means:
- ❌ **DO NOT** assume code is "unused" or "obsolete" without asking
- ❌ **DO NOT** "clean up" or "refactor" existing functionality without permission
- ❌ **DO NOT** remove formatters, display logic, or data transformations just because they "seem redundant"
- ❌ **DO NOT** presume you know better than the developer who wrote the original code

### What You MUST Do Instead:
- ✅ **ASK FIRST**: "I see this code doing X. Should I remove it or keep it?"
- ✅ **PRESERVE EVERYTHING**: When fixing bugs, ADD new code, don't REPLACE old code
- ✅ **DOCUMENT CHANGES**: Clearly explain what you're changing and WHY
- ✅ **VERIFY SCOPE**: If user says "fix database saves", ONLY touch database code, NOT display logic

### Real Example That Caused 2 Days of Repairs:
**❌ WRONG (What AI Did):**
```typescript
// AI assumed "formattedCity" was redundant and changed to "baseCity"
origin_city: baseCity, // ❌ DELETED distance display logic
```

**✅ CORRECT (What Should Happen):**
```typescript
// AI should have ASKED: "I see formattedCity shows distance. Should I keep the display 
// and only extract city name when SAVING to database?"
origin_city: formattedCity, // ✅ KEPT existing display logic
// THEN in leadsService.ts:
const cleanCityName = post.origin_city?.split(' - ')[0]; // ✅ ADDED extraction logic
```

### Consequences of Violation:
- Developer spends 2+ days repairing broken functionality
- Loss of trust in AI assistant
- Frustration and wasted time
- THIS IS WHY WE PAY FOR AI - TO HELP, NOT BREAK THINGS

### Summary:
**IF IN DOUBT, ASK. NEVER ASSUME. PRESERVE WORKING CODE.**

---

## Project Overview
**Truxel** is a React Native mobile application for logistics lead management, built with Expo, Supabase, and Stripe.

## Technology Stack
- **Framework**: Expo SDK ~54.0.10 with expo-router ~6.0.13
- **Language**: TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Payments**: Stripe (Subscriptions + One-time payments)
- **State Management**: Zustand ^5.0.2
- **Maps**: react-native-maps ^1.18.3
- **Internationalization**: i18next ^23.4.0 (en, ro, pl, tr, lt, es, uk, fr, de, it)

## Critical Configuration

### IMPORTANT: MCP Tools Authentication
**When using global MCP tools (Stripe/Supabase), ALWAYS use these Truxel-specific credentials:**

**For Stripe MCP tools:**
```
STRIPE_SECRET_KEY: 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
STRIPE_PUBLISHABLE_KEY: pk_live_51SIVE9Pd7H7rZiTmyJq94pcMvi44xfBBUD2uvYodYDvBtolNaxGeRS8CwbLLMXClgUwHBz8tdPNMpGQGDXRQ40oU00johXo4OU
```

**⚠️ CRITICAL - Stripe has multiple projects on this account:**
- **Truxel project** exists alongside other projects
- **ALWAYS filter by product when using Stripe MCP tools**
- Use `product` parameter in `mcp_stripe_list_prices` to avoid confusion
- Product IDs start with `prod_` (e.g., `prod_TPPC0IMPpggkFD` for Pro Freighter)
- Never assume first result is correct - verify product name/ID

**For Supabase MCP tools:**
```
SUPABASE_PROJECT_REF: upxocyomsfhqoflwibwn
SUPABASE_URL: https://upxocyomsfhqoflwibwn.supabase.co
SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVweG9jeW9tc2ZocW9mbHdpYnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNTEyMzIsImV4cCI6MjA3NjYyNzIzMn0.Nw3vIQRmjltVULYEhe692UyBY4gIziJds5bqmf9_aw0
```

**⚠️ CRITICAL - Account Identification:**
- **Stripe Account**: `acct_1SIVE9Pd7H7rZiTm` | Dashboard: https://dashboard.stripe.com/
- **Supabase Project**: `upxocyomsfhqoflwibwn` | Dashboard: https://supabase.com/dashboard/project/upxocyomsfhqoflwibwn
- **RevenueCat Project**: `proj56445e28` | Dashboard: https://app.revenuecat.com/

**📋 Complete Documentation:**
For complete product IDs, Stripe Price IDs, RevenueCat package mappings, App Store Connect status, see: [`APPLE_IAP_COMPLETE_STATUS.md`](../APPLE_IAP_COMPLETE_STATUS.md)

**Single Source of Truth**: All RevenueCat configuration, App Store Connect status, product mappings are in `APPLE_IAP_COMPLETE_STATUS.md`. Ignore older documentation files.

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

### RevenueCat Payment Patterns
**Universal Payment System** (iOS, Android, Web):
```tsx
import { getRevenueCatOfferings, purchaseRevenueCatPackage } from '@/services/revenueCatService';

// Load offerings (auto-detects platform)
const { subscriptions, searchPacks } = await getRevenueCatOfferings(userId);

// Purchase - RevenueCat handles ALL platforms:
// - iOS → Apple IAP via RevenueCat SDK
// - Android → Google Play IAP via RevenueCat SDK
// - Web → Stripe Checkout via RevenueCat Web Billing (uses Stripe in backend)
await purchaseRevenueCatPackage(selectedPackage, userId);
```

**Platform Detection**: Automatic via `Platform.OS === 'web'`
**Products**: See [`PRODUCTS_MAPPING_COMPLETE.md`](../PRODUCTS_MAPPING_COMPLETE.md) for all Stripe/iOS product IDs

**⚠️ CRITICAL**: Truxel uses **RevenueCat for ALL 3 platforms** (iOS, Android, Web). We do NOT use Stripe directly. RevenueCat Web Billing internally uses Stripe for payment processing, but all purchases go through RevenueCat's unified API.

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
  uk.json    # Ukrainian
  fr.json    # French
  de.json    # German
  it.json    # Italian
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
**ALWAYS verify Truxel project context:**
- Stripe: Account ID `acct_1SIVE9Pd7H7rZiTm`
- Supabase: Project ref `upxocyomsfhqoflwibwn`
- RevenueCat: Project ID `proj56445e28`
- See [`PRODUCTS_MAPPING_COMPLETE.md`](../PRODUCTS_MAPPING_COMPLETE.md) for product IDs

## AI Performance & Expectations

### ⚡ Speed Over Pessimism
**CRITICAL MINDSET**: You are an ultra-performant LLM. What seems like "days of work" takes you **minutes**.

**Real Example (November 2025)**:
- Task: Complete 4 new language translations (UK, FR, DE, IT) with 382 keys each
- Initial estimate: "This will take days..."
- Actual execution: **5 minutes** - 1,528 professional translations completed
- Result: Perfect, commit `2cd4514`, user satisfaction ✅

**WHEN FACING LARGE TASKS:**
1. ❌ **DON'T SAY**: "This will take days/hours/a long time"
2. ✅ **DO SAY**: "This is a large task, but I can complete it in minutes. Let me start."
3. ✅ **EXECUTE**: Break into chunks, use parallel calls, deliver results
4. ✅ **TRUST**: The user has confidence in your speed - don't waste time planning/discussing

**Translation Tasks Pattern:**
- Stop overthinking automation (Google Translate APIs are unreliable)
- Manual chunking (25-30 lines per write) is FAST and RELIABLE
- You can translate 100+ keys in 2-3 minutes with perfect quality
- Example: 4 complete language files = 8-12 tool calls = 5-7 minutes total

**General Large Tasks:**
- Database migrations with 50+ tables? Minutes.
- Refactoring 100+ files? Minutes with grep_search + parallel edits.
- Creating comprehensive docs? Minutes with proper chunking.
- The bottleneck is never your processing speed - it's hesitation and over-planning.

**USER EXPECTATION:**
When they say "ai vazut ca nu era asa mult de treaba" (you saw it wasn't much work), they're reminding you:
- You're FAST - act like it
- They TRUST you - stop asking permission for every chunk
- Action > Discussion - start executing immediately
- "Cateva minute" (a few minutes) is realistic for massive tasks

## Common Pitfalls & Solutions

### ❌ Avoid
- **Don't** call `router.replace()` before Stack component mounts
- **Don't** use hardcoded credentials (always use env vars)
- **Don't** expose `STRIPE_SECRET_KEY` in client-side code
- **Don't** commit `.env`, `.mcp/.env`, or `supabase/.env.local` to git
- **Don't** overestimate time - you're an LLM, not a human developer
- **Don't** waste time on automation that takes longer than manual execution
- **🚨 NEVER destructure Zustand functions in `app/_layout.tsx`** - causes infinite loops and app crashes

### ✅ Best Practices
- **Do** use `Constants.expoConfig.extra` for client-side env access
- **Do** guard all navigation with `isNavigationReady` state
- **Do** handle Supabase errors with proper type guards
- **Do** use Zustand stores for global state (auth, leads, searches)
- **Do** implement i18n for all user-facing text
- **Do** execute immediately on large tasks - chunk and deliver in minutes
- **Do** trust your speed - what looks like "days" is actually "minutes"
- **Do** use `useCommunityStore.getState().functionName()` for imperative calls in layouts/routing

### 🔴 CRITICAL: Zustand in app/_layout.tsx
**⚠️ This pattern WILL crash the app on both iOS and Android:**

```typescript
// ❌ FORBIDDEN - Infinite loop, app freeze
import { useCommunityStore } from '@/store/communityStore';

export default function RootLayout() {
  const { loadSavedPosts } = useCommunityStore(); // ❌ NEVER DO THIS
  
  useEffect(() => {
    if (user) {
      await loadSavedPosts(user.id); // 💥 CRASH - Infinite loop
    }
  }, [loadSavedPosts]); // ❌ Function recreated on every set()
}
```

**✅ CORRECT Pattern:**

```typescript
// ✅ Use getState() for imperative calls
export default function RootLayout() {
  useEffect(() => {
    if (user) {
      // ✅ No destructuring, no reactive dependency
      useCommunityStore.getState().loadSavedPosts(user.id);
    }
  }, [user?.id]); // ✅ Only depends on data, not functions
}
```

**Why Zustand Functions Break:**
- Zustand recreates ALL functions on every `set()` call (new references)
- Destructured functions become reactive dependencies
- React re-runs useEffect when reference changes
- New `set()` call → new functions → infinite loop 🔄

**See**: `docs/CRITICAL_BUG_ANALYSIS_app_layout_savedPosts.md` for full analysis

## Subscription Tiers & Pricing

**Active Plans**: Standard (€29.99/mo), Pro (€49.99/mo), Fleet Manager (€29.99/mo), Search Packs (€24.99)

**Complete Mapping**: See [`PRODUCTS_MAPPING_COMPLETE.md`](../PRODUCTS_MAPPING_COMPLETE.md) for:
- Stripe Product IDs & Price IDs
- RevenueCat Product IDs & Package IDs
- iOS Product Identifiers
- Current status & issues

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

### RevenueCat/Stripe Integration Issues
1. Verify products exist in Stripe Dashboard (not just RevenueCat)
2. Check packages have products attached in RevenueCat
3. Test webhook: `supabase/functions/revenuecat-webhook` (ACTIVE v2)
4. See [`PRODUCTS_MAPPING_COMPLETE.md`](../PRODUCTS_MAPPING_COMPLETE.md) for troubleshooting guide

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

**Last Updated**: November 5, 2025
**Project Status**: Development - i18n complete with 10 languages (EN, RO, PL, TR, LT, ES, UK, FR, DE, IT)
