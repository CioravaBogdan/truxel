# Truxel - GitHub Copilot Instructions

## 🚨 CRITICAL RULE #1 - NEVER DELETE WORKING CODE 🚨
**⚠️ MANDATORY FOR ALL AI ASSISTANTS (Sonnet 4.5, GPT-4, Claude, etc.):**
** La fiecare github  commit, rise app versions,

**ABSOLUTE PROHIBITION:**
NEVER, UNDER ANY CIRCUMSTANCES, DELETE OR MODIFY EXISTING WORKING LOGIC WITHOUT EXPLICIT USER CONFIRMATION.

### What This Means:
❌ DO NOT PUSH GITHUB WITHOUT ME TELLING YOU!!!
❌ DO NOT assume code is "unused" or "obsolete" without asking
❌ DO NOT "clean up" or "refactor" existing functionality without permission
❌ DO NOT remove formatters, display logic, or data transformations just because they "seem redundant"
❌ DO NOT presume you know better than the developer who wrote the original code

### What You MUST Do Instead:
✅ ASK FIRST: "I see this code doing X. Should I remove it or keep it?"
✅ PRESERVE EVERYTHING: When fixing bugs, ADD new code, don't REPLACE old code
✅ DOCUMENT CHANGES: Clearly explain what you're changing and WHY
✅ VERIFY SCOPE: If user says "fix database saves", ONLY touch database code, NOT display logic

### Summary:
**IF IN DOUBT, ASK. NEVER ASSUME. PRESERVE WORKING CODE.**

---

## 🎨 UI/UX & Branding (NEW)
**Strictly follow `branding.md` for all design decisions.**
- **Source of Truth:** `branding.md` defines all Colors, Typography, Spacing, and Component styles.
- **Theme:** Use `lib/theme.tsx` variables.
- **Components:** Re-use `Button.tsx`, `Card.tsx`, `WebFooter.tsx`.
- **Marketing:** See `TRUXEL_MARKETING.md` for copy/positioning.

---

## Project Overview
Truxel is a React Native mobile application for logistics lead management, built with Expo, Supabase, and Stripe.

## Technology Stack
- **Framework:** Expo SDK ~54.0.10 with expo-router ~6.0.13
- **Language:** TypeScript
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Payments:** Stripe (Subscriptions + One-time payments)
- **State Management:** Zustand ^5.0.2
- **Maps:** react-native-maps ^1.18.3
- **Internationalization:** i18next ^23.4.0 (en, ro, pl, tr, lt, es, uk, fr, de, it)

## Critical Configuration
**IMPORTANT: MCP Tools Authentication**
When using global MCP tools (Stripe/Supabase), ALWAYS use these Truxel-specific credentials:

### For Stripe MCP tools:
- **STRIPE_SECRET_KEY:** `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`
- **STRIPE_PUBLISHABLE_KEY:** `pk_live_51SIVE9Pd7H7rZiTmyJq94pcMvi44xfBBUD2uvYodYDvBtolNaxGeRS8CwbLLMXClgUwHBz8tdPNMpGQGDXRQ40oU00johXo4OU`
- **⚠️ CRITICAL:** Stripe has multiple projects. ALWAYS filter by product when using Stripe MCP tools. Product IDs start with `prod_`.

### For Supabase MCP tools:
- **SUPABASE_PROJECT_REF:** `upxocyomsfhqoflwibwn`
- **SUPABASE_URL:** `https://upxocyomsfhqoflwibwn.supabase.co`
- **SUPABASE_ANON_KEY:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVweG9jeW9tc2ZocW9mbHdpYnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNTEyMzIsImV4cCI6MjA3NjYyNzIzMn0.Nw3vIQRmjltVULYEhe692UyBY4gIziJds5bqmf9_aw0`

### Account Identification:
- **Stripe Account:** `acct_1SIVE9Pd7H7rZiTm`
- **Supabase Project:** `upxocyomsfhqoflwibwn`
- **RevenueCat Project:** `proj56445e28`
- **Documentation:** See `APPLE_IAP_COMPLETE_STATUS.md` for all IDs.

## Brand Identity
- **Name:** Truxel (NOT LogisticsLead)
- **Package:** `com.truxel.app`
- **Slug:** `truxel`
- **Scheme:** `truxel://`

## Code Style & Patterns
### File Structure
- `app/`: Expo Router file-based navigation
- `components/`: Reusable UI components
- `services/`: API services
- `store/`: Zustand stores
- `supabase/`: Edge Functions and migrations

### UI Patterns & Gestures (NEW)
- **LeadDetailModal:**
  - Uses `react-native-gesture-handler` + `reanimated`.
  - **Swipe Down to Close:** Implemented with `Gesture.Pan().simultaneousWithExternalGesture(scrollViewRef)`.
  - **Logic:** `activeOffsetY([-1000, 10])` allows pull-down to close while preserving ScrollView functionality.
  - **Data Display:** ALWAYS render the `description` field (AI-generated) if available.
- **Navigation:**
  - **Home -> Lead:** When opening a lead from "Recent Leads", reset all filters (`country`, `city`, `status`) and navigate to `(tabs)/leads` with `selectedTab: 'latest'`.

### Community Feature Architecture
- **Template Pattern:** Use translation keys (`community.templates.available_now`), NOT hardcoded text.
- **Database:** `community_posts`, `user_post_usage`, `subscription_limits`.
- **Zustand:** Use `useCommunityStore` for state.
- **Navigation Guard:** Always guard navigation in `app/_layout.tsx` with `isNavigationReady`.

### Supabase Patterns
- **Auth:** Use `useAuthStore`.
- **Edge Functions:** `supabase.functions.invoke('function-name')`.
- **RPC:** `supabase.rpc('function_name', params)`.

### RevenueCat Payment Patterns
- **Universal System:** `getRevenueCatOfferings`, `purchaseRevenueCatPackage`.
- **Platform Detection:** Automatic.

### N8N Webhooks - Fire-and-Forget
- **Rule:** Webhooks must NOT block user operations. Use `void` return, no `await`.

### i18n Translation Pattern
- **CRITICAL:** All user-facing text must use translation keys.
- **Files:** `locales/*.json`.
- **Usage:** `t('section.key')`.

## AI Performance & Expectations
- **Speed:** Execute large tasks in minutes.
- **Mindset:** You are an ultra-performant LLM.
- **Action:** Break into chunks, use parallel calls, deliver results.

## Common Pitfalls & Solutions
- ❌ Don't call `router.replace()` before mount.
- ❌ Don't use hardcoded credentials in client code.
- ❌ Don't destructure Zustand functions in `app/_layout.tsx` (Infinite Loop Risk).
- ✅ Use `useCommunityStore.getState().action()` for imperative calls.

## Git Workflow
- **Protected:** `.env`, `.mcp/.env`, `node_modules/`.
- **Safe:** `app/`, `components/`, `services/`, `store/`.

## Support Resources
- Expo, Supabase, Stripe Docs.
- **Project Status:** Development - i18n complete.
