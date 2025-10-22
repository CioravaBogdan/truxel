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
  (tabs)/         # Main app tabs (index, leads, search, pricing, profile)
  _layout.tsx     # Root layout with auth routing
components/       # Reusable UI components
services/         # API services (auth, leads, searches, stripe)
store/            # Zustand stores
supabase/         # Edge Functions and migrations
  functions/
    create-checkout-session/
    manage-subscription/
    stripe-webhook/
  migrations/
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

## Stripe Products & Pricing

### Active Subscription Plans
1. **DISCOVER - Explorer Plan** (`prod_T451Cn4NrG1oAo`)
   - 10 digital books/month
   - Price: `price_1S7wy6F3XNcbs4ifSzxtehgh`

2. **MAGIC - Creator Plan** (`prod_T453xNoLXjLXT9`)
   - Advanced features + priority support
   - Price: `price_1S7wxLF3XNcbs4ifFXK8nTH0`

3. **CINEMA - Professional Plan** (`prod_T454yb8eSyFXdQ`)
   - Unlimited + premium + dedicated support
   - Price: `price_1S7wwUF3XNcbs4ifcuLm8n1i`

### One-time Products
- Personalized Children's Book
- Professional Audiobook Narration
- 10 Extra Illustrations
- Child Photo Integration
- Custom Moral Lesson
- Premade Ebook

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
