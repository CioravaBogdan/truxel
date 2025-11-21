# Truxel Mobile Application

A mobile application for truck drivers to discover and manage logistics leads in their area. Built with Expo (React Native) and Supabase.

## Features

- **Multi-language Support**: English, Romanian, Polish, Turkish, Lithuanian, and Spanish
- **Location-Based Search**: Find companies within 5km radius using GPS or manual location selection
- **Lead Management**: Save, track, and manage potential business leads
- **Contact Templates**: Pre-filled email and WhatsApp templates for quick communication
- **Subscription Plans**: Trial, Standard, Pro (€49.99), and Premium tiers with search limits
- **Stripe Payments**: Secure payment processing for subscriptions and search packs
- **Additional Search Packs**: One-time purchases of 10, 25, or 50 searches
- **Credit Management**: Automatic tracking with priority-based consumption
- **Real-time Updates**: Get notified when search results are ready
- **CSV Export**: Export all your leads to CSV format

## Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- Supabase account and project
- n8n webhook endpoint configured

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create or update the `.env` file in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

**Note**: See `.env.example` for reference.

### 3. Set Up Supabase Database

**IMPORTANT**: For complete Stripe integration setup, see the detailed guides below.

#### Quick Database Setup

Run the complete migration in your Supabase SQL Editor:
`supabase/migrations/20251022084011_add_pro_tier_and_stripe_integration.sql`

#### Or use the basic setup below (legacy):

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email text NOT NULL,
  full_name text NOT NULL,
  phone_number text,
  company_name text,
  subscription_tier text DEFAULT 'trial' CHECK (subscription_tier IN ('trial', 'standard', 'premium')),
  subscription_status text DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
  trial_searches_used int DEFAULT 0,
  monthly_searches_used int DEFAULT 0,
  subscription_start_date timestamptz DEFAULT now(),
  subscription_renewal_date timestamptz,
  preferred_language text DEFAULT 'en' CHECK (preferred_language IN ('en', 'ro', 'pl', 'tr', 'lt', 'es')),
  expo_push_token text,
  stripe_customer_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  source_search_id uuid,
  company_name text NOT NULL,
  contact_person_name text,
  email text,
  phone text,
  whatsapp text,
  linkedin text,
  facebook text,
  instagram text,
  website text,
  industry text,
  address text,
  city text,
  country text,
  latitude decimal,
  longitude decimal,
  description text,
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'in_progress', 'won', 'lost')),
  user_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create searches table
CREATE TABLE IF NOT EXISTS searches (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  search_type text DEFAULT 'radius' CHECK (search_type IN ('radius', 'custom')),
  search_keywords text,
  search_address text,
  latitude decimal,
  longitude decimal,
  radius_km int DEFAULT 5,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  webhook_sent_at timestamptz,
  completed_at timestamptz,
  results_count int DEFAULT 0,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Create subscription_tiers table
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tier_name text UNIQUE NOT NULL,
  price decimal NOT NULL,
  searches_per_month int NOT NULL,
  description text,
  stripe_price_id text,
  created_at timestamptz DEFAULT now()
);

-- Create additional_search_packs table
CREATE TABLE IF NOT EXISTS additional_search_packs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  pack_name text UNIQUE NOT NULL,
  price decimal NOT NULL,
  searches_count int NOT NULL,
  stripe_price_id text,
  created_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('subscription', 'search_pack', 'renewal')),
  tier_or_pack_name text,
  amount decimal NOT NULL,
  stripe_payment_id text,
  stripe_subscription_id text,
  searches_added int,
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE additional_search_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Leads policies
CREATE POLICY "Users can view own leads"
  ON leads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leads"
  ON leads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads"
  ON leads FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads"
  ON leads FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Searches policies
CREATE POLICY "Users can view own searches"
  ON searches FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own searches"
  ON searches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own searches"
  ON searches FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Subscription tiers policies (public read)
CREATE POLICY "Anyone can view subscription tiers"
  ON subscription_tiers FOR SELECT
  TO authenticated
  USING (true);

-- Search packs policies (public read)
CREATE POLICY "Anyone can view search packs"
  ON additional_search_packs FOR SELECT
  TO authenticated
  USING (true);

-- Transactions policies
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert default subscription tiers
INSERT INTO subscription_tiers (tier_name, price, searches_per_month, description) VALUES
  ('trial', 0.00, 5, 'Free trial with 5 searches'),
  ('standard', 29.99, 15, '15 searches per month'),
  ('premium', 199.99, 100, '100 searches per month')
ON CONFLICT (tier_name) DO NOTHING;

-- Insert default search pack
INSERT INTO additional_search_packs (pack_name, price, searches_count) VALUES
  ('10_searches_pack', 24.99, 10)
ON CONFLICT (pack_name) DO NOTHING;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source_search ON leads(source_search_id);
CREATE INDEX IF NOT EXISTS idx_searches_user_id ON searches(user_id);
CREATE INDEX IF NOT EXISTS idx_searches_status ON searches(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 4. Configure n8n Webhook

Your n8n workflow should:
1. Receive webhook POST requests at `https://n8n.byinfant.com/webhook/logistics-lead-webhook`
2. Process the search parameters (keywords, location, radius)
3. Scrape/fetch company data from Google Maps or other sources
4. Insert leads into Supabase `leads` table with matching `user_id` and `source_search_id`
5. Update the `searches` table status to "completed" and set `results_count`

Expected webhook payload:
```json
{
  "search_id": "uuid",
  "user_id": "uuid",
  "keywords": "logistics warehouse",
  "address": "Bucharest, Romania",
  "latitude": 44.4268,
  "longitude": 26.1025,
  "radius_km": 5
}
```

### 5. Configure Google Maps (Optional)

For iOS, add your Google Maps API key to `app.json`:
```json
{
  "ios": {
    "config": {
      "googleMapsApiKey": "YOUR_GOOGLE_MAPS_API_KEY"
    }
  }
}
```

For Android, add your Google Maps API key to `app.json`:
```json
{
  "android": {
    "config": {
      "googleMaps": {
        "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
      }
    }
  }
}
```

## Running the App

### Development Mode

```bash
npm run dev
```

This will start the Expo development server. You can then:
- Press `i` to open iOS simulator
- Press `a` to open Android emulator
- Scan the QR code with Expo Go app on your physical device

### Type Checking

```bash
npm run typecheck
```

### Building for Production

For iOS:
```bash
eas build --platform ios
```

For Android:
```bash
eas build --platform android
```

## App Structure

```
app/
├── (auth)/          # Authentication screens
│   ├── login.tsx
│   └── register.tsx
├── (tabs)/          # Main app tabs
│   ├── index.tsx    # Home screen
│   ├── search.tsx   # Search screen
│   ├── leads.tsx    # Leads list screen
│   └── profile.tsx  # Profile screen
└── _layout.tsx      # Root layout with auth provider

components/          # Reusable UI components
├── Button.tsx
├── Input.tsx
├── Card.tsx
└── StatusBadge.tsx

services/           # API and business logic
├── authService.ts
├── leadsService.ts
└── searchesService.ts

store/              # Zustand state management
├── authStore.ts
├── leadsStore.ts
└── searchesStore.ts

lib/                # Configuration and utilities
├── supabase.ts     # Supabase client
└── i18n.ts         # Internationalization config

locales/            # Translation files
├── en.json
├── ro.json
├── pl.json
├── tr.json
├── lt.json
└── es.json

types/              # TypeScript type definitions
└── database.types.ts
```

## Key Features Implementation

### Search Flow
1. User selects location (GPS, address, or map)
2. User enters keywords
3. App checks if user has searches remaining
4. App decrements search count immediately
5. App creates search record with "pending" status
6. App sends webhook to n8n
7. App subscribes to search status updates via Supabase Realtime
8. When n8n completes, it updates search status to "completed"
9. App receives update and shows notification
10. User can view lead results

### Lead Management
- View all leads in a filterable list
- Filter by status, contact availability
- Sort by distance, name, or date
- Update lead status and notes
- Send pre-filled emails and WhatsApp messages
- Export leads to CSV

### Subscription System
- **Trial**: 5 total searches, free
- **Standard**: 15 searches/month, €9.99
- **Pro**: 30 searches/month, €49.99 (LinkedIn + AI matching)
- **Premium**: 100 searches/month, €99.99
- **Search Packs**: 10/25/50 searches, €4.99/€9.99/€17.99 one-time

### Communication Templates
Pre-filled templates include:
- User's name and company
- User's phone and email
- Lead contact name and company
- Current location

## Troubleshooting

### Database Connection Issues
- Verify Supabase URL and anon key in `.env`
- Check that RLS policies are properly configured
- Ensure user is authenticated before making requests

### Webhook Not Working
- Check n8n workflow is active and accessible
- Verify webhook URL in `services/searchesService.ts`
- Check n8n logs for errors
- Ensure n8n has correct Supabase credentials

### Location Not Working
- Check location permissions are granted
- Verify Google Maps API key is configured
- Test on physical device (simulators may have issues)

### Build Errors
- Clear cache: `expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run typecheck`

## Stripe Integration

This project includes complete Stripe payment integration for subscriptions and search packs. For detailed setup instructions, see:

### 📚 Documentation

- **[STRIPE_README.md](STRIPE_README.md)** - Overview and architecture
- **[STRIPE_IMPLEMENTATION_GUIDE.md](STRIPE_IMPLEMENTATION_GUIDE.md)** - Complete step-by-step setup
- **[STRIPE_SETUP_CHECKLIST.md](STRIPE_SETUP_CHECKLIST.md)** - Track your implementation progress
- **[DEPLOY_EDGE_FUNCTIONS.md](DEPLOY_EDGE_FUNCTIONS.md)** - Deploy Supabase Edge Functions
- **[verify_database_setup.sql](verify_database_setup.sql)** - Verify database configuration
- **[update_stripe_price_ids.sql](update_stripe_price_ids.sql)** - Update Stripe Price IDs

### Quick Stripe Setup

1. Create products in Stripe Dashboard (Test mode)
2. Copy Price IDs and update database
3. Deploy Edge Functions to Supabase
4. Configure webhook endpoint
5. Update `.env` with Stripe publishable key
6. Test with test card: 4242 4242 4242 4242

For complete instructions, see **STRIPE_IMPLEMENTATION_GUIDE.md**.

## Support

For issues or questions, contact: support@truxel.com

## License

Proprietary - All rights reserved
