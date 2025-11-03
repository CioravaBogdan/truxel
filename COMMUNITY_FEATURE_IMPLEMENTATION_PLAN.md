# Truxel – Community Feature Implementation Plan (Combined & Optimized)

## Executive Summary
- Home integrează două feed‑uri (toggle):
  - “Sunt disponibil” – postări 1‑tap cu locație automată și template‑uri rapide.
  - “Curse disponibile” – postări A→B minimale cu fereastră temporală.
- Arhitectură recomandată: tabel unificat `community_posts` (+ `community_interactions`, `cities`) pentru simplitate, scalabilitate și mentenanță redusă.
- Căutare orașe: tabel local `cities` + fuzzy search (`pg_trgm`) pentru cost zero pe query; fallback opțional prin Edge Function la Nominatim/Mapbox/Google.
- TTL implicit: 4h (MVP) cu auto‑expire; realtime prin Supabase; contact prin WhatsApp/Call.
- Abonamente: limite de postări/lună per tier, cu RPC de consum similar la “search credit”.


## UX Concept (Clean & Safe)
- Segmented control pe Home: „Disponibil” | „Curse”.
- Quick Post (one‑tap) cu butoane mari; când viteza > prag, ascundem input‑uri și păstrăm doar 1‑tap.
- Filtre rapide: căutare oraș (typeahead), direcție (N/E/S/W) pentru disponibilitate, timp pentru curse, rază (geohash region).
- Carduri simple: oraș(e), direcție sau A→B, timp relativ, tonaj (dacă e cazul), butoane WhatsApp/Call.
- FAB: „Postează” (deschide selectorul de template‑uri adecvate tabului curent).

Template‑uri „Sunt disponibil” (1‑tap)
- „Disponibil pentru curse locale”
- „Disponibil pentru curse spre [DIRECȚIE]” (N/E/S/W)
- „Disponibil pentru retur spre [ORAȘ]”
- „Liber până la [ORĂ/DATĂ]”

Template‑uri „Curse disponibile”
- „Am loc pentru marfă de la [A] la [B]”
- „Plec spre [DESTINAȚIE], am [X] tone libere”
- „Retur gol de la [ORAȘ]”
- „Caut partener pentru cursă spre [DESTINAȚIE]”


## Data Model (Unified, Supabase‑clean)

### Tipuri
- `post_type` enum: `DRIVER_AVAILABLE`, `LOAD_AVAILABLE` (extensibil: `PARTNER_SEARCH`, `PARKING_SPOT`, etc.)
- `post_status` enum: `active`, `matched`, `expired`, `cancelled`

### Tabele
- `cities`
  - id (uuid), name, country, lat, lng, geohash, population?, created_at, updated_at
  - Index: GIN trigram pe `name`, btree pe `geohash`, `country`

- `community_posts` (tabel unificat)
  - id uuid PK, user_id uuid (FK → profiles.user_id), post_type post_type NOT NULL, status post_status DEFAULT `active`
  - origin_city text NOT NULL, origin_lat decimal NOT NULL, origin_lng decimal NOT NULL, origin_geohash text NOT NULL, origin_city_id uuid? (FK → cities)
  - destination_city text?, dest_lat decimal?, dest_lng decimal?, dest_geohash text?, dest_city_id uuid? (FK → cities)
  - template_key text, display_text text NOT NULL
  - metadata jsonb DEFAULT '{}' (ex.: disponibil până la, direcție, tone libere, preț/km)
  - created_at timestamptz DEFAULT now(), expires_at timestamptz NOT NULL (MVP: now()+interval '4 hours')
  - Indexuri: (status WHERE status='active'), (origin_geohash), (dest_geohash), (expires_at), (user_id), GIN(metadata)

- `community_interactions`
  - id uuid PK, post_id uuid FK → community_posts, user_id uuid, interaction_type enum(`interested`, `contacted`, `saved`), created_at

- Extensii
  - `uuid-ossp` (dacă nu e activă), `pg_trgm` (fuzzy search pe `cities.name`)

### RLS (Row‑Level Security)
- `cities`: SELECT pentru `authenticated` (read‑only)
- `community_posts`:
  - SELECT: `status='active' AND expires_at>now()` pentru `authenticated`
  - INSERT/UPDATE/DELETE: doar proprietar (`auth.uid()=user_id`)
- `community_interactions`: INSERT/SELECT pentru `authenticated`; DELETE/UPDATE doar proprietar

### TTL & Housekeeping
- Trigger sau job programat pentru setarea statusului `expired` după `expires_at` (client oricum filtrează `expires_at>now()`).


## City Search (Low‑Cost First)
- Primar: tabel `cities` + `pg_trgm` și query cu ILIKE + SIMILARITY → cost zero pe query.
- Client cache (5‑10 min), debounce 300ms, limitare la 10 rezultate.
- Opțional fallback (Edge Function): Nominatim/Mapbox/Google cu ratelimit & caching în `cities`.


## Realtime & Notifications
- Realtime: subscribe la `community_posts` cu filtre client side pe regiune (prefix geohash + vecini), `status`, `expires_at`.
- Notificări (Phase 2): Edge Function la INSERT
  - Match pe: oraș/regiune, direcție (pentru availability), rute (A→B), tonaj/truck type (dacă relevant).
  - Push prin Expo (folosește `profiles.expo_push_token`).
  - Rate limit notificări per utilizator (ex.: max N/h).


## Subscriptions & Limits (Posts per Month)
- Extindere `subscription_tiers` cu `community_posts_per_month int NOT NULL DEFAULT ...` (valori configurabile per tier).
- Contorizare lunar: 
  - fie `profiles.monthly_community_posts_used` + reset lunar,
  - fie tabel `community_post_usage` (user_id, created_at) + funcție care numără în intervalul lunar curent.
- RPC `get_total_post_credits(p_user_id)` → returnează `posts_remaining` (bazat pe tier + cumpărături extra, dacă adăugăm pachete).
- RPC `consume_post_credit(p_user_id)` → verifică și consumă creditul înainte de INSERT în `community_posts` (identic ca pattern cu „search credit”).
- Rate limit zilnic (siguranță spam): ex. max 10/zi indiferent de tier, configurabil.

Exemplu alocări (configurabil în DB):
- Trial: 5 postări/lună
- Standard: 30/lună
- Pro: 60/lună
- Premium: 200/lună


## Filtering & Matching (Performant cu Geohash)
- Disponibil: filtrare pe `origin_geohash` (prefix precizie 6 + 8 vecini), `direction` (în metadata) și `dest_city_id` (dacă setat).
- Curse: `origin_city_id` și/sau `dest_city_id`; alternativ geohash pentru zone metropolitane.
- Timp: `expires_at>now()`; „now/today/tomorrow” în metadata pentru rute.


## UI Structure & Files
- Home (`app/(tabs)/index.tsx`): segmente “Disponibil”/“Curse”; Quick Post bar; filtre de bază; feed list; FAB „Postează”.
- Noi (propunere directoare):
  - `app/(tabs)/community/`: `_layout.tsx`, `index.tsx`, `create-availability.tsx`, `create-ride.tsx`, `post/[id].tsx`
  - `components/community/`: `PostCard.tsx`, `QuickPostButton.tsx`, `TemplateSelector.tsx`, `CitySearchInput.tsx`, `FilterBar.tsx`, `PostActions.tsx`
  - `services/`: `communityService.ts`, `citySearchService.ts`, `matchingService.ts`
  - `store/`: `communityStore.ts`
  - `types/`: `community.types.ts`


## Safety, Privacy, Moderation
- Siguranță: modul „condus” (doar 1‑tap), confirmare haptic/vizual, fără chat in‑app la MVP.
- Privacy: afișăm oraș + zonă aproximativă; nu expunem lat/lng exacte; TTL 4h, ștergere postare proprie.
- Anti‑abuz: rate limit, report/block, validări în RPC/Edge.


## Rollout Plan
- Phase 1 (MVP – 2–3 săptămâni)
  - DB: `cities`, `community_posts`, `community_interactions`, RLS, indexuri, TTL 4h.
  - Abonamente: `community_posts_per_month` în `subscription_tiers` + RPC `get_total_post_credits`/`consume_post_credit`.
  - App: Home cu segmente, Quick Post bar, filtre (city/direction/time), feed realtime, contact WhatsApp/Call.
- Phase 2 (Core – 2 săptămâni)
  - City search fallback Edge Function + caching; push pe match; rate limit notificări; report/block.
  - Filtre avansate: truck type, tonaj; paginare performantă.
- Phase 3 (Engagement – 2 săptămâni)
  - Saved posts, istoric colaborări, rating, share; analytics evenimente.
- Phase 4 (Optimize – 1 săptămână)
  - Cache, offline, fine‑tuning push, PostGIS/H3 dacă e nevoie.


## Acceptance Criteria (MVP)
- Postare disponibilitate în ≤2s, vizibilă în feed, expiră după 4h.
- Postare cursă A→B cu time window în ≤2s, filtrabilă după oraș/direcție/timp.
- Limite lunare per tier aplicate corect; mesaje clare când nu mai sunt credite.
- Realtime feed; WhatsApp/Call funcționale; UI curat în modul condus.


## Costs & Risks
- Cost redus: city search local; Realtime în limite; push opțional.
- Riscuri: volum (mitigat geohash+paginare), abuz (rate limit+report), calitatea orașelor (seed + iterații).

