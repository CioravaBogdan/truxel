# Truxel - Development TODO

**Last Updated:** October 22, 2025  
**Project Status:** Active Development

---

## ✅ Completed Tasks

### Phase 1: Initial Setup & Core Features (Oct 21-22, 2025)
- [x] **Project scaffolding** - Expo SDK 54 + TypeScript + Supabase + Stripe
- [x] **Authentication system** - Login/Register with Supabase Auth
- [x] **Database schema** - Users, profiles, leads, searches, subscriptions
- [x] **Tab navigation** - 5 tabs (Home, Search, Leads, Pricing, Profile)
- [x] **Supabase integration** - Auth, Database, Edge Functions
- [x] **Stripe integration** - Subscriptions + One-time purchases
- [x] **i18n support** - English, Romanian, Polish, Turkish, Lithuanian, Spanish

### Phase 2: Pricing & Subscription Management (Oct 22, 2025)
- [x] **Pricing screen** - Display subscription tiers and search packs
- [x] **Fixed pricing screen loading bug** - Replaced Supabase client with REST API
- [x] **RLS policies for anon users** - Allow public access to pricing tables
- [x] **iOS tab bar fix** - Adjusted height (85px) to prevent home indicator overlap
- [x] **Unified subscription management** - Removed duplicate subscription tab
- [x] **Created Stripe products** - 25 Search Credits Pack (€24.99)
- [x] **Database updates** - Added stripe_price_id to search packs
- [x] **Subscription buttons** - Subscribe/Upgrade/Downgrade/Cancel/Reactivate
- [x] **Alert confirmations** - User confirmation for all subscription actions

### Phase 3: Code Quality & Documentation (Oct 22, 2025)
- [x] **Enhanced error handling** - Detailed console.log debugging
- [x] **Supabase config logging** - Debug credentials and connection
- [x] **Migration organization** - Created 20251022140000_add_stripe_product_id.sql
- [x] **GitHub Copilot instructions** - Added .github/copilot-instructions.md
- [x] **Documentation organization** - Moved all .md files to docs/ folder
- [x] **Created TODO.md** - This file for project tracking

---

## 🔄 In Progress

### Phase 4: Profile Screen & User Preferences (Current Sprint)
- [ ] **Profile screen UI** - Personal info form (name, company, email)
- [ ] **Truck type selector** - Dropdown with truck types (3.5T, 7.5T, 12T, etc.)
- [ ] **Search radius selector** - Radio buttons (1km, 5km, 10km, 25km, 50km)
- [ ] **Industry preferences** - Multi-select with 20 industries (max 5 selections)
- [ ] **Database migration** - Add truck_type, search_radius_km, preferred_industries to profiles
- [ ] **Save profile functionality** - Update profiles table on save

---

## 📋 Upcoming Tasks (Prioritized)

### Phase 5: Smart Search & Default Industries
- [ ] **Default industry search** - Use preferred_industries when no keywords provided
- [ ] **Search Around Me** - Auto-populate with user's preferred industries
- [ ] **Profile integration** - Pass truck_type and radius to search queries

### Phase 6: n8n Webhook Integration
- [ ] **Create search webhook** - POST to n8n on search start
- [ ] **Search metadata** - Send user_id, search_id, subscription_tier, truck_type, radius, industries
- [ ] **Generate search_id** - Create in Supabase searches table before webhook
- [ ] **n8n workflow setup** - Configure lead processing based on subscription tier

### Phase 7: Lead Detail Card
- [ ] **Lead detail modal** - Display full lead info (company, contact, phone, email, address)
- [ ] **WhatsApp integration** - Button opens WhatsApp with template message
- [ ] **Email integration** - Button opens email client with pre-filled template
- [ ] **Template personalization** - Use user name and company from profile
- [ ] **Message templates** - Localized templates for all supported languages

### Phase 8: Extra Credits Validation
- [ ] **Active subscription check** - Require active subscription to buy extra credits
- [ ] **Validation UI** - Show error if user tries to buy credits without subscription
- [ ] **Upgrade prompt** - Suggest subscribing if user has no active plan

---

## 🎯 Future Enhancements (Backlog)

### Features
- [ ] **Push notifications** - Notify users of new leads matching their preferences
- [ ] **Lead filtering** - Filter leads by industry, distance, date added
- [ ] **Lead notes** - Allow users to add private notes to leads
- [ ] **Lead history** - Track which leads user has contacted
- [ ] **Favorites** - Save favorite leads for quick access
- [ ] **Map view** - Display leads on interactive map
- [ ] **Route planning** - Plan optimal route to visit multiple leads
- [ ] **Offline mode** - Cache leads for offline viewing

### Technical Improvements
- [ ] **Performance optimization** - Lazy loading for lead lists
- [ ] **Caching strategy** - Cache pricing data and user preferences
- [ ] **Error tracking** - Integrate Sentry for error monitoring
- [ ] **Analytics** - Add analytics for user behavior tracking
- [ ] **A/B testing** - Test different UI variations
- [ ] **Unit tests** - Add Jest tests for critical functions
- [ ] **E2E tests** - Add Detox tests for main user flows

### Business Features
- [ ] **Referral program** - Invite friends for bonus credits
- [ ] **Loyalty rewards** - Reward active users with bonus searches
- [ ] **Premium features** - AI matching, LinkedIn contacts for Pro tier
- [ ] **Admin dashboard** - Manage users, subscriptions, and leads
- [ ] **Analytics dashboard** - Track user engagement and revenue

---

## 🐛 Known Issues

### High Priority
- ~~Pricing screen infinite loading~~ ✅ FIXED (Oct 22) - Replaced Supabase client with REST API
- ~~iOS tab bar overlaps home indicator~~ ✅ FIXED (Oct 22) - Adjusted height to 85px
- ~~Subscription tab duplicate~~ ✅ FIXED (Oct 22) - Unified into pricing screen

### Low Priority
- **Package versions outdated** - expo, react-native, stripe need updates (not critical)
- **SecureStore warning** - Token > 2048 bytes (consider splitting or using alternative storage)

---

## 📊 Development Metrics

### Code Stats
- **Total files:** ~50 TypeScript/JavaScript files
- **Lines of code:** ~3,000+ lines
- **Components:** 10+ reusable components
- **Screens:** 8 main screens
- **Services:** 4 service modules (auth, leads, searches, stripe)
- **Database tables:** 7 tables (users, profiles, leads, searches, subscription_tiers, additional_search_packs, transactions)

### Git Stats
- **Commits:** 10+ commits
- **Latest commit:** 464d2ab - "Fix pricing screen loading & unified subscription management"
- **Repository:** https://github.com/CioravaBogdan/truxel

---

## 🔧 Tech Stack

### Frontend
- **Framework:** Expo SDK ~54.0.15
- **Navigation:** expo-router ~6.0.13
- **Language:** TypeScript
- **State:** Zustand ^5.0.2
- **Maps:** react-native-maps ^1.18.3
- **i18n:** i18next ^23.4.0

### Backend
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **Functions:** Supabase Edge Functions
- **Automation:** n8n (webhooks)

### Payments
- **Provider:** Stripe
- **Integration:** @stripe/stripe-react-native ^0.38.6
- **Features:** Subscriptions, One-time payments, Webhooks

---

## 📝 Notes

### Important Reminders
- **Always test on physical iOS device** - Expo Go required
- **Reload after .env changes** - Restart Expo server with --clear flag
- **Use REST API for Supabase** - Client queries can timeout on mobile
- **Check RLS policies** - Ensure anon users can access public data
- **Test subscription flows** - Verify Stripe webhooks update database correctly

### Development Workflow
1. Create feature branch from main
2. Implement feature with incremental commits
3. Test on physical device (iOS)
4. Update TODO.md with progress
5. Merge to main and push to GitHub
6. Deploy Edge Functions if needed

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Expo CLI installed (`npm install -g expo-cli`)
- iOS device with Expo Go app
- Supabase account with project setup
- Stripe account with API keys

### Setup Commands
```bash
# Install dependencies
npm install

# Start Expo dev server
npx expo start

# Run database migrations
npx supabase db push

# Generate TypeScript types
npx supabase gen types typescript --local > types/database.types.ts
```

### Environment Variables
See `.env.example` for required variables:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`

---

**Next Sprint Goal:** Complete Profile Screen with truck type, radius, and industry preferences 🎯
