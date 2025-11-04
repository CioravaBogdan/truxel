# Community Variant – Recommended (Ease, Scale, Clean UX, Low Cost)

## Summary
- Home hosts two feeds (segmented):
  - "Sunt disponibil" (availability) – 1‑tap templates with auto‑location.
  - "Curse disponibile" (routes) – A→B minimal posts with time window.
- City search uses a local `cities` table + `pg_trgm` (no paid API calls).
- Realtime via Supabase; posts auto‑expire in 4h; contact via WhatsApp/Call only.
- Geohash prefix filtering for performance; PostGIS/H3 can be added later if needed.

## Why This Variant
- Ease of implementation: simple tables + lightweight client; reuses existing Expo location/permissions patterns.
- Scalability: indexed lookups by geohash/city; TTL keeps datasets small; realtime subscriptions scoping by region.
- Clean UX: two clear feeds on Home; large 1‑tap buttons; minimal forms; safe while driving.
- Cost: zero per‑query cost for cities; optional notifications added later via Edge Function.

## UX Flows
- Availability quick post:
  - 1‑tap: "Sunt aici → N/E/S/W" or "Sunt aici → spre [Oraș]".
  - Auto‑location; start_time defaults to now; 4h TTL.
- Routes quick post:
  - Minimal: "Am cursă [A] → [B]" + time window: now/today/tomorrow.
- Filters & feed:
  - City typeahead, direction (availability), time window (routes), radius (via geohash region).
  - Cards show cities, relative age, and buttons: WhatsApp/Call.
- Driving safety:
  - If speed > threshold, only large 1‑tap buttons visible; inputs disabled.

## Data Model (Supabase)
- cities
  - id (uuid), name, country, lat, lng, geohash, population?, created_at, updated_at
  - Indexes: GIN trigram on `name`; btree on `geohash`, `country`.
- driver_availability
  - id, user_id, created_at, updated_at, expires_at (default now+4h), status ('active','expired','cancelled')
  - origin_lat/lng, origin_geohash, origin_city_id?, origin_city, origin_country
  - direction_deg?, direction_cardinal? ('N','E','S','W')
  - dest_city_id?, dest_city?, dest_country?, dest_lat/lng?, dest_geohash?
  - template_key, start_time?, truck_type?, capacity?
  - Indexes: origin_geohash, dest_geohash, expires_at, user_id, status
- driver_routes
  - id, user_id, created_at, updated_at, expires_at (now+4h), status
  - origin_city_id, origin_city, origin_country, origin_lat/lng, origin_geohash
  - dest_city_id, dest_city, dest_country, dest_lat/lng, dest_geohash
  - departure_window ('now','today','tomorrow'), template_key, truck_type?, capacity?
  - Indexes: origin_geohash, dest_geohash, expires_at, user_id, status
- RLS
  - SELECT public active items: status='active' AND expires_at>now().
  - INSERT/UPDATE/DELETE only by owner (auth.uid()=user_id).
- TTL & housekeeping
  - Trigger or scheduled job to mark expired; client also filters out expired.

## City Search (Low Cost)
- Seed `cities` with curated top cities (GeoNames/OSM derived).
- Enable `pg_trgm` for fuzzy `name` search. Query: ILIKE + SIMILARITY(name, q) ORDER BY similarity DESC LIMIT 10.
- Client caches recent results; no paid API usage.

## Realtime & Notifications
- Realtime: subscribe to `driver_availability` and `driver_routes`; filter client‑side by region prefixes/time/status.
- Notifications (Phase 2): Edge Function on INSERT → find nearby subscribers or city matches → push via Expo using `profiles.expo_push_token`.

## Scalability Notes
- Geohash precision 6 (~1.2km); include 8 neighbors for radius; adjust for density.
- Indexes on geohash/time/user keep scans bounded; TTL limits table growth.
- Optional upgrades later: PostGIS/H3 for corridor and distance queries.

## Clean UX Guidelines
- Two tabs on Home (segmented control), consistent Quick Post bar per tab.
- Default choices (now/today) to avoid extra taps; large buttons.
- Show city + approximate area only; no precise lat/lng in UI.

## Implementation Phases
- Phase 1 (MVP)
  - DB: create `cities`, `driver_availability`, `driver_routes`; RLS; indexes; seed cities.
  - App: Home segmented control; Quick Post bars; filters; feed lists; realtime; WhatsApp/Call.
- Phase 2 (Cities & Alerts)
  - Better city ranking/cache; add Edge Function for push notifications; RPC rate limiting; basic report.
- Phase 3 (Polish)
  - Map toggle; distance display; better direction inference; pagination performance.

## Acceptance Criteria
- Post availability N/E/S/W with auto‑location in ≤2s; auto‑expires after 4h.
- Post route A→B with time window in ≤2s; filters by city/time work instantly.
- Contact buttons launch WhatsApp/Call; no text input needed while driving.

## Cost Considerations
- No runtime paid API for city search; Supabase realtime within plan; optional push costs minimal.

