# Community Feature Plan (Drivers Availability & Routes)

## 1) Goal & Scope (MVP)
- Two community feeds shown on Home:
  - Drivers Availability: quick posts like “I’m here → heading [N/E/S/W]” or “I’m here → heading to [City]”.
  - Available Routes (posted by drivers): minimal route ads “From [A] → To [B] (time window)”.
- One‑tap templates, auto location from phone, no free‑text while driving.
- Filters: city search (typeahead), direction (for availability), time window, radius.
- Contact actions only via WhatsApp/Call (no in‑app chat for MVP).
- Post TTL: 4 hours (auto expire), realtime updates.

Non‑Goals (MVP): in‑app chat, pricing, advanced moderation workflows, complex mapping/corridors.


## 2) UX Overview (Home)
- Home segmented control: “Disponibil” | “Curse”.
- Quick Post bar (large buttons, 1‑tap):
  - Disponibil: “Sunt aici → N”, “Sunt aici → E”, “Sunt aici → S”, “Sunt aici → V”, “Sunt aici → [city pick]”.
  - Curse: “Am cursă [select A] → [select B] (azi/mâine)”.
- Filter bar:
  - City (typeahead select from cities), Direction (N/E/S/W), Time (today/tomorrow), Radius (25/50/100km).
- Feed list:
  - Cards with city names and relative age, distance from user (optional), button for WhatsApp/Call.
- Safety while driving:
  - If speed > X km/h, show only large template buttons; hide text inputs; quick confirmations only.


## 3) Templates (predefined, localized)
- Drivers Availability
  - T1: “Sunt aici → merg spre [N/E/S/W]” (params: direction, location=auto, start=now)
  - T2: “Sunt aici → merg spre [City]” (params: dest_city, location=auto, start=now)
- Available Routes
  - T1: “Am cursă [A] → [B] (azi/mâine)” (params: origin_city, dest_city, departure_window)
- Implementation notes
  - Store selected template key, computed fields (e.g., direction_cardinal) and needed params.
  - Use i18n keys in `locales/*` for all user‑visible strings.


## 4) City Search Strategy (low cost, easy)
- Choose: Supabase ‘cities’ table + fuzzy search (no paid API calls at runtime):
  - Import an open dataset (GeoNames/OSM derived) with major cities (country, name, lat/lng). Start with top ~20k cities.
  - Enable `pg_trgm` for fuzzy search by name, optionally bigram index.
  - Client typeahead queries Supabase directly, results cached client‑side.
- Why this approach:
  - Zero per‑query cost after import, low complexity, no external rate limits.
  - Works offline-ish with local cache after first queries.
- Alternatives (later if needed):
  - Edge Function proxy to Google Places/Mapbox with caching; higher complexity + potential cost.


## 5) Data Model (Supabase)

### 5.1 Tables

- cities
  - id uuid PK (or bigint if mirroring dataset)
  - name text NOT NULL
  - country text NOT NULL
  - lat decimal NOT NULL
  - lng decimal NOT NULL
  - geohash text GENERATED or computed on import
  - population int NULL (optional, for ranking)
  - created_at timestamptz DEFAULT now()
  - updated_at timestamptz DEFAULT now()
  - Indexes: (name) with pg_trgm, (country), (geohash)

- driver_availability (drivers’ live availability)
  - id uuid PK DEFAULT uuid_generate_v4()
  - user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
  - created_at timestamptz DEFAULT now()
  - updated_at timestamptz DEFAULT now()
  - expires_at timestamptz NOT NULL DEFAULT (now() + interval '4 hours')
  - status text DEFAULT 'active' CHECK (status IN ('active','expired','cancelled'))
  - origin_lat decimal NOT NULL
  - origin_lng decimal NOT NULL
  - origin_geohash text NOT NULL
  - origin_city_id uuid NULL REFERENCES cities(id) -- optional, if we snap to nearest city
  - origin_city text NULL, origin_country text NULL -- denormalized for read
  - direction_deg int NULL
  - direction_cardinal text NULL CHECK (direction_cardinal IN ('N','E','S','W'))
  - dest_city_id uuid NULL REFERENCES cities(id)
  - dest_city text NULL, dest_country text NULL
  - dest_lat decimal NULL, dest_lng decimal NULL, dest_geohash text NULL
  - template_key text NOT NULL
  - start_time timestamptz NULL -- default now
  - truck_type text NULL -- optional (not mandatory for MVP)
  - capacity text NULL -- optional (not mandatory for MVP)
  - Indexes: (origin_geohash), (dest_geohash), (expires_at), (user_id), (status)

- driver_routes (available routes ads)
  - id uuid PK DEFAULT uuid_generate_v4()
  - user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
  - created_at timestamptz DEFAULT now()
  - updated_at timestamptz DEFAULT now()
  - expires_at timestamptz NOT NULL DEFAULT (now() + interval '4 hours')
  - status text DEFAULT 'active' CHECK (status IN ('active','expired','cancelled'))
  - origin_city_id uuid NOT NULL REFERENCES cities(id)
  - origin_city text NOT NULL, origin_country text NOT NULL
  - origin_lat decimal NOT NULL, origin_lng decimal NOT NULL, origin_geohash text NOT NULL
  - dest_city_id uuid NOT NULL REFERENCES cities(id)
  - dest_city text NOT NULL, dest_country text NOT NULL
  - dest_lat decimal NOT NULL, dest_lng decimal NOT NULL, dest_geohash text NOT NULL
  - departure_window text NOT NULL CHECK (departure_window IN ('now','today','tomorrow'))
  - template_key text NOT NULL
  - truck_type text NULL -- optional
  - capacity text NULL -- optional
  - Indexes: (origin_geohash), (dest_geohash), (expires_at), (user_id), (status)

- community_reports (optional, for abuse)
  - id uuid PK
  - reporter_user_id uuid REFERENCES auth.users(id)
  - subject_type text CHECK (subject_type IN ('availability','route'))
  - subject_id uuid NOT NULL
  - reason text
  - created_at timestamptz DEFAULT now()

### 5.2 Extensions
- Enable `uuid-ossp` (if not already).
- Enable `pg_trgm` for fuzzy city search: `CREATE EXTENSION IF NOT EXISTS pg_trgm;`

### 5.3 Policies (RLS)
- cities
  - SELECT: allow to `authenticated` (read‑only public dataset)
- driver_availability
  - SELECT: allow `authenticated` WHERE `status='active' AND expires_at>now()`
  - INSERT: allow `authenticated` with `WITH CHECK (auth.uid()=user_id)`
  - UPDATE/DELETE: allow only owner `USING (auth.uid()=user_id)`
  - Column exposure: lat/lng exact selectable by owner; for public selects prefer city + truncated geohash (client decides what to show)
- driver_routes
  - Same pattern as availability.
- community_reports
  - INSERT and SELECT by authenticated; optional moderation table is not exposed to all.

### 5.4 Triggers & Functions
- update `updated_at` on UPDATE (shared trigger function already present in repo; reuse pattern from README).
- expire posts: scheduled job (pgcron) or periodic cleanup Edge Function; also compute `status='expired'` on read if `expires_at<=now()`.
- rate limiting RPC `can_post_community(p_user_id)`:
  - Count user posts in last N hours; enforce per‑plan caps.


## 6) Queries & Filtering
- Nearby feed (Availability):
  - Compute user geohash, derive a region prefix (precision 5–6) and include the 8 neighbor prefixes for radius bucket.
  - SQL filter: `origin_geohash LIKE ANY (ARRAY[prefixes||'%']) AND expires_at>now() AND status='active'`
  - Direction filter: `direction_cardinal IN (...)` when set.
  - Destination filter: by `dest_city_id` if chosen.
- Routes feed (A→B):
  - Origin filter: `origin_city_id = :city_id` or by geohash prefixes around selected city.
  - Destination filter: `dest_city_id = :city_id` (optional for discovery around origin only).
  - Time filter: `departure_window IN ('now','today','tomorrow')`.
- City search (typeahead):
  - `SELECT id,name,country,lat,lng FROM cities WHERE name ILIKE '%q%' ORDER BY SIMILARITY(name, q) DESC LIMIT 10;`
  - Index: `CREATE INDEX cities_name_trgm ON cities USING GIN (name gin_trgm_ops);`


## 7) Client Architecture (App)
- Screens: Home (`app/(tabs)/index.tsx`) hosts segmented feeds. Optional separate tab later if needed.
- Services:
  - `services/communityService.ts`:
    - postAvailability({ template_key, origin, direction, dest_city })
    - postRoute({ template_key, origin_city, dest_city, departure_window })
    - listAvailability({ region_prefixes, direction?, dest_city_id?, limit, since })
    - listRoutes({ origin_city_id?, dest_city_id?, region_prefixes?, time_window?, limit })
    - subscribeAvailability(userRegion, onChange), subscribeRoutes(filters, onChange)
    - deleteMyPost(type, id)
  - `services/geoService.ts`:
    - searchCities(query)
    - getCityById(id)
- Store:
  - `store/communityStore.ts` for feed state (selected tab, filters, data, loading), active post states.
- UI Components:
  - QuickPostBar (buttons for templates)
  - CityPicker (typeahead powered by cities table)
  - FiltersBar (direction, time, radius)
  - FeedList (cards for availability/routes)
- Location:
  - Reuse pattern from `app/(tabs)/search.tsx` for permissions and current location.
- Driving safety:
  - Read speed from `expo-location`; if > threshold, show only one‑tap templates; disable text inputs.


## 8) Realtime & Notifications
- Realtime feed updates:
  - Supabase Realtime `postgres_changes` on `driver_availability` and `driver_routes` with client‑side filters (region/time/status).
- Notifications (phase 2):
  - On INSERT, an Edge Function selects interested users nearby or matching a city subscription and sends Expo push (uses `profiles.expo_push_token`).


## 9) Privacy, Safety, Moderation
- Privacy:
  - Publicly display city and approximate area only; do not show precise lat/lng in UI.
  - TTL 4h; allow users to delete their posts.
- Safety:
  - Driving mode UI; haptic/visual confirmation; no chat.
- Abuse prevention:
  - Rate limits per user/plan via RPC; optional `community_reports` to report posts; allow block list later.


## 10) Metrics (basic)
- Counters: posts/day by type, unique posters, views per post, contact taps (WhatsApp/Call), time‑to‑first‑interest.
- Quality: template usage distribution, city match rates, feed latency (post → visible).


## 11) Rollout Plan & Tasks

### Phase 1 (MVP, 3–5 days)
- DB
  - Create tables: `cities`, `driver_availability`, `driver_routes`.
  - Enable `pg_trgm`, add indexes, RLS policies, triggers for `updated_at`.
  - Seed top cities (CSV import). Optionally per country initially.
- App
  - Home segmented control + two feeds.
  - Quick Post bar (availability: N/E/S/W + pick city; routes: pick A→B + time).
  - Filters: city (typeahead), direction, time, radius (geohash prefix).
  - Realtime subscribe; auto‑expire locally when `expires_at` passed.
  - Contact buttons (WhatsApp/Call) using profile phone.
- Acceptance
  - Post in 2 taps; appears in feed in <2s; expires after 4h; filtered by city; contact works.

### Phase 2 (Cities & Alerts, 3–5 days)
- Cities
  - Better ranking (by population); client cache results; recent searches.
- Alerts (optional)
  - Edge Function to push notify users on new matching posts (same city/region).
- Anti‑abuse
  - RPC rate limit; simple report action; hide by reporter locally.

### Phase 3 (Polish)
- Map view toggle, distance display, better direction inference from device heading.
- Performance: pagination, debounced city search, batch realtime updates.


## 12) i18n Keys (examples)
- community.tab_availability, community.tab_routes
- community.quick.avail.heading_n, heading_e, heading_s, heading_w, heading_city
- community.quick.route.from_city, to_city, time_now, time_today, time_tomorrow
- community.filters.city_placeholder, direction, time, radius
- community.feed.card.avail.title, .route.title
- community.actions.call, .whatsapp, .delete, .report
- community.toast.posted, .deleted, .error


## 13) Risks & Mitigations
- City data quality → start with curated set; improve over time.
- Realtime volume → paginate, limit radius; add server‑side filters later.
- Abuse/spam → rate limit; report; later moderation tools.
- Driving safety → big buttons; disable text; audio/haptic feedback.


## 14) Implementation Notes
- Geohash
  - Use precision 6 for ~1.2km cells for region buckets; include 8 neighbors for radius effect.
  - Client computes geohash from GPS; for cities, precompute on import.
- Direction inference
  - Use `expo-location` heading when available; else user taps a direction.
- Minimal routes (as requested)
  - Required: origin_city, dest_city, departure_window (‘now/today/tomorrow’).
  - Optional: truck_type/capacity; no price/contact message in MVP.


## 15) Sample DDL (reference only; final SQL belongs in migrations)

-- cities (simplified)
CREATE TABLE cities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  country text NOT NULL,
  lat decimal NOT NULL,
  lng decimal NOT NULL,
  geohash text,
  population int,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX cities_name_trgm ON cities USING GIN (name gin_trgm_ops);

-- driver_availability
CREATE TABLE driver_availability (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '4 hours'),
  status text DEFAULT 'active' CHECK (status IN ('active','expired','cancelled')),
  origin_lat decimal NOT NULL,
  origin_lng decimal NOT NULL,
  origin_geohash text NOT NULL,
  origin_city_id uuid NULL REFERENCES cities(id),
  origin_city text,
  origin_country text,
  direction_deg int,
  direction_cardinal text CHECK (direction_cardinal IN ('N','E','S','W')),
  dest_city_id uuid,
  dest_city text,
  dest_country text,
  dest_lat decimal,
  dest_lng decimal,
  dest_geohash text,
  template_key text NOT NULL,
  start_time timestamptz
);
CREATE INDEX da_origin_geo_idx ON driver_availability(origin_geohash);
CREATE INDEX da_expires_idx ON driver_availability(expires_at);
CREATE INDEX da_user_idx ON driver_availability(user_id);

-- driver_routes (minimal)
CREATE TABLE driver_routes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '4 hours'),
  status text DEFAULT 'active' CHECK (status IN ('active','expired','cancelled')),
  origin_city_id uuid NOT NULL REFERENCES cities(id),
  origin_city text NOT NULL,
  origin_country text NOT NULL,
  origin_lat decimal NOT NULL,
  origin_lng decimal NOT NULL,
  origin_geohash text NOT NULL,
  dest_city_id uuid NOT NULL REFERENCES cities(id),
  dest_city text NOT NULL,
  dest_country text NOT NULL,
  dest_lat decimal NOT NULL,
  dest_lng decimal NOT NULL,
  dest_geohash text NOT NULL,
  departure_window text NOT NULL CHECK (departure_window IN ('now','today','tomorrow')),
  template_key text NOT NULL
);
CREATE INDEX dr_origin_geo_idx ON driver_routes(origin_geohash);
CREATE INDEX dr_dest_geo_idx ON driver_routes(dest_geohash);
CREATE INDEX dr_expires_idx ON driver_routes(expires_at);
CREATE INDEX dr_user_idx ON driver_routes(user_id);

-- RLS (outline)
ALTER TABLE driver_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY da_select_active ON driver_availability FOR SELECT TO authenticated USING (status='active' AND expires_at>now());
CREATE POLICY da_insert_own ON driver_availability FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id);
CREATE POLICY da_modify_own ON driver_availability FOR UPDATE USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
CREATE POLICY da_delete_own ON driver_availability FOR DELETE USING (auth.uid()=user_id);

ALTER TABLE driver_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY dr_select_active ON driver_routes FOR SELECT TO authenticated USING (status='active' AND expires_at>now());
CREATE POLICY dr_insert_own ON driver_routes FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id);
CREATE POLICY dr_modify_own ON driver_routes FOR UPDATE USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
CREATE POLICY dr_delete_own ON driver_routes FOR DELETE USING (auth.uid()=user_id);


## 16) Task Backlog (detailed)
- Database
  - Migrations for `cities`, `driver_availability`, `driver_routes`.
  - Extensions `uuid-ossp`, `pg_trgm`; indexes and RLS.
  - Seed cities (CSV import + optional geohash compute during import).
- App (Home)
  - Add segmented control and two feed containers.
  - Quick Post (availability: 4 directions + pick city; routes: pick A→B + time).
  - CityPicker component backed by `cities` table (debounced, 10 results).
  - Filters bar and persistence in Zustand (per tab).
  - Feed cards + actions (WhatsApp/Call; delete own post).
  - Realtime subscription + pagination.
  - Driving mode UI gating by speed.
- Services/Store
  - communityService (CRUD, list, subscribe).
  - geoService (typeahead and lookup by id).
  - communityStore (filters, data, status, errors).
- QA/Polish
  - Empty states, error toasts, internationalization, basic analytics events.


## 17) Acceptance Criteria (MVP)
- Post availability via single tap (N/E/S/W) with auto location, appears in feed <2s.
- Post route A→B with city selections and time window; visible <2s.
- Both posts auto‑expire at 4h and disappear from feed.
- Filters by city, direction/time update the list instantly.
- Tapping WhatsApp/Call opens respective app with driver’s phone.


## 18) Notes on Costs
- No per‑query cost for city search (local Supabase table + indexes).
- Supabase Realtime within current plan limits; geohash prefix filtering keeps payloads small.
- Push notifications optional and can be added later.

