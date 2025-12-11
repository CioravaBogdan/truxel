# Logistics Business Discovery Backend Plan

This plan turns the draft into actionable backend work that fits the current Supabase + n8n stack, prioritizing legal, cost-efficient data sources and high-precision filtering for manufacturers, warehouses, and logistics companies.

## Objectives
- 90-95% precision on industrial facilities (manufacturing, warehousing, logistics) with minimal retail noise.
- Reduce per-1K record cost by favoring licensed/open data before paid enrichment.
- Keep the mobile app flow unchanged: `searches` row + webhook to n8n → leads written back → realtime update to the app.

## Data Source Strategy (priority order)
1) Licensed B2B providers: ThomasNet/IndustryNet/Kompass, D&B/Veridion for global coverage, PIERS/ImportGenius for active shippers.
2) OpenStreetMap: Tags to target (`building=warehouse`, `industrial=factory|logistics`, `landuse=industrial`). Free, commercial-friendly with attribution.
3) Optional enrichment APIs: Outscraper/SerpApi/Apify to fetch phones/websites/emails only for shortlisted entities. Use only where ToS allows bulk storage.

## Filtering & Classification
- Primary: NAICS ranges 31-33 (manufacturing), 48-49 (transportation/warehousing), 42 (wholesale). High-value: 484121, 493110, 488510, 484230.
- Keywords include: manufacturing, warehouse, logistics, freight, distribution, fulfillment, 3pl, wholesale, cold storage. Exclude: restaurant, cafe, salon, spa, gym, clinic, retail, boutique, grocery.
- Geo/structure signals: industrial zoning codes, parcel size, loading docks, 24/7 hours, employee count >50.
- ML scoring (optional): zero-shot classification into MANUFACTURER | WAREHOUSE | LOGISTICS_COMPANY | DISTRIBUTOR | RETAIL; store `relevance_score` and `classification`.

## Supabase Schema (new industrial catalog)
- Enable PostGIS (separate schema or public): `create extension if not exists postgis;`
- Table `industrial_facilities` (proposed):  
  - `id uuid pk`, `name text`, `website text`, `phone text`, `email text`,  
  - `location geography(POINT)`, `address jsonb`, `city text`, `country text`,  
  - `naics_code text`, `category text`, `source text`, `source_ref text`,  
  - `relevance_score numeric`, `classification text`, `tags text[]`,  
  - `last_seen_at timestamptz`, `created_at`, `updated_at`.  
  - Index: `gist(location)`, `btree(naics_code)`, `btree(category)`.
- Keep the existing `leads` table as the app-facing results; populate it from `industrial_facilities` when fulfilling searches.

## Ingestion Pipeline (n8n or workers)
1) OSM harvester: Overpass queries per country/metro for the target tags; store geometry centroid and raw tags.
2) Licensed B2B ingest: CSV/API pulls from providers; normalize to common columns.
3) Import/export feed: ingest shipper/consignee records; map to facility entities.
4) Enrichment pass (optional): call commercial APIs for phones/websites/emails only on high-priority records; respect provider ToS.
5) Dedup/entity resolution: deterministic keys (name + city + approximate geo) + fuzzy matching; keep `source` and `source_ref` to trace provenance.
6) Classification/scoring: apply NAICS/keyword/ML rules; drop low scores.

## Search Execution Flow (fits current app)
1) App inserts `searches` row → n8n webhook receives `search_id`, `user_id`, lat/lng, radius, keywords, tier/features.  
2) n8n queries `industrial_facilities` via Supabase RPC/SQL using PostGIS radius filter and relevance threshold.  
3) For each hit, insert into `leads` with `source_search_id = search_id`; set status `pending` → `completed` and `results_count`.  
4) App already listens via Realtime; no client change needed beyond possibly showing new fields (category/naics).

## Cost Envelope (targets)
- OpenStreetMap + licensed datasets: near-zero marginal cost once licensed.  
- Enrichment APIs: target $0.50–2.50 per 1K lookups; cap calls via scoring threshold.  
- Infra: 2–4 vCPU workers + managed Postgres/PostGIS; ~$50–100/mo for 100K/month throughput (excluding enrichers).

## Compliance & Risk
- Favor licensed/open data; attribute OSM (ODbL) in-app.  
- Avoid bulk Google Maps scraping; use only providers/APIs whose terms allow storing business data.  
- Treat personal data carefully; prefer business contact data (role-based emails/phones).

## Implementation Steps (2–3 weeks)
1) DB: enable PostGIS; create `industrial_facilities` + indexes; add `relevance_score`, `classification`, `tags` to support ranking.  
2) n8n: build OSM ingest workflow; add CSV/API ingest for one licensed provider; add dedup + scoring nodes.  
3) Supabase RPC: create `get_nearby_facilities(lat, lng, radius_km, keywords?)` that returns ranked facilities.  
4) Fulfillment: update n8n search workflow to read from `industrial_facilities` and write into `leads` with `source_search_id`.  
5) Enrichment (optional toggle): add enrichment node gated by `relevance_score >= threshold` and daily quota.  
6) Observability: log ingest/enrich stats, enrichment spend, and search result precision; alert on empty-result searches.
