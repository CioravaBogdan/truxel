# Truxel Data Engine (TDE) v2: The "Deep Drill" & Implicit Flywheel

## 1. Executive Summary
This revised Masterplan shifts focus to **North America**, introduces a **Custom "Deep Drill" Scraper**, and refines the validation model from "Active User Input" to **"Implicit Behavioral Signals"** (Save to My Book).

**Core Philosophy:**
1.  **Modular Scraper:** A standalone Dockerized service (Python + Playwright) that accepts HTTP requests. It can be deployed on our infrastructure OR pushed to Apify as an Actor.
2.  **Implicit Validation:** We don't annoy drivers with questions. If a driver saves a lead to "My Book", we treat that as a **High Confidence Vote**. We capture that lead forever in our Master DB.
3.  **North America First:** Prioritizing ThomasNet and US Industrial Zones.

---

## 2. Module A: The "Deep Drill" Scraper (Custom Build)

We will build a custom scraper from scratch (or heavily fork an open-source base) to ensure it is **modular** and **API-first**.

### 2.1. Technical Stack
*   **Engine:** Python + **Playwright** (Headless Browser).
    *   *Why:* Better than Selenium for handling dynamic JS and anti-bot detection.
*   **API Interface:** **FastAPI**.
    *   *Why:* Allows us to trigger scrapes via simple HTTP POST requests (e.g., from N8N or the App).
*   **Proxy Management:** **BrightData** or **Smartproxy** (Residential IPs).
    *   *Requirement:* Must support "Sticky Sessions" to keep the same IP while browsing a specific company's details.

### 2.2. Architecture (The "Apify-Ready" Design)
The scraper will be a Docker container. This allows us to:
1.  Run it on a cheap VPS (Hetzner) for internal use.
2.  Upload the *exact same Docker image* to Apify to sell it as an Actor.

**Endpoint:** `POST /scrape/v1/enrich`
```json
{
  "query": "Acme Logistics Inc, Chicago",
  "mode": "deep_drill",
  "proxy_country": "US"
}
```

**"Deep Drill" Output (JSON):**
The scraper will extract *everything*:
*   **Basic:** Name, Address, Phone, Website.
*   **Deep:**
    *   "People also search for" (Competitor discovery).
    *   "Popular times" (Indicates shift work/24h operations).
    *   Reviews (Sentiment analysis: "Fast loading" vs "Long wait").
    *   Photos (AI analysis: "Is there a loading dock visible?").

### 2.3. North America Specific Sources
*   **Google Maps:** (Via Residential Proxies) - The general layer.
*   **ThomasNet:** (Via Datacenter Proxies) - The "Gold Mine" for NA Manufacturing.
    *   *Strategy:* Scrape the "Categories" pages (e.g., "CNC Machining in Ohio") to get lists of verified manufacturers.
*   **OpenStreetMap (OSM):**
    *   *Automated:* The Truxel App will automatically query OSM for `landuse=industrial` in the user's viewport to show "Grey" (unverified) pins.

---

## 3. Module B: The "Implicit Flywheel" (Database Strategy)

Instead of asking drivers to verify, we watch what they *do*.

### 3.1. The Logic
1.  **Driver Action:** Driver searches for "Warehouses" -> Results appear (mixed quality).
2.  **The Signal:** Driver clicks **"Add to My Book"** (Save Lead).
3.  **The Capture:**
    *   The App saves the lead to the driver's personal list.
    *   **SIMULTANEOUSLY**, a Webhook fires to Supabase.
    *   We copy that lead into the `verified_industrial_leads` Master Table.
    *   We increment a `confidence_score`.

### 3.2. Supabase Schema Refinement

We need two distinct layers of data.

```sql
-- 1. The "Raw" Lake (OSM, ThomasNet dumps)
create table raw_industrial_data (
  id uuid primary key default gen_random_uuid(),
  source text, -- 'osm', 'thomasnet'
  raw_json jsonb,
  location geography(POINT),
  processed boolean default false
);

-- 2. The "Golden" Master (Verified Leads)
create table verified_industrial_leads (
  id uuid primary key default gen_random_uuid(),
  
  -- Core Info
  company_name text,
  address text,
  phone text,
  website text,
  location geography(POINT),
  
  -- Classification
  industry_type text, -- 'manufacturer', '3pl'
  naics_code text,
  
  -- The Flywheel Score
  confidence_score int default 1, -- Starts at 1 when first saved
  saved_by_count int default 1,   -- How many unique drivers saved this?
  last_interaction_at timestamptz default now(),
  
  -- Deep Drill Data
  opening_hours jsonb,
  loading_dock_features jsonb, -- { "has_ramp": true }
  
  unique(company_name, location) -- Prevent duplicates
);
```

---

## 4. Implementation Plan (10 Steps)

### Phase 1: The Scraper (The Engine)
1.  **Repo Setup:** Create `truxel-scraper-engine` (Python/FastAPI).
2.  **Proxy Integration:** Set up middleware to rotate Residential Proxies (BrightData) on 403 errors.
3.  **ThomasNet Module:** Build a specific parser for ThomasNet category pages (NA focus).
4.  **Google Maps Module:** Build the Playwright script to extract "Deep Details" (Reviews, Photos).
5.  **Dockerize:** Create `Dockerfile` to make it portable (Local -> VPS -> Apify).

### Phase 2: The Database & Flywheel
6.  **Supabase Migration:** Create the `verified_industrial_leads` table with the `confidence_score` column.
7.  **Webhook Setup:** Create a Supabase Edge Function `on-lead-saved`.
8.  **App Integration:** Modify `leadsService.ts` in Truxel. When `saveLead` is called, trigger the `on-lead-saved` function in the background.

### Phase 3: Automation & Monetization
9.  **OSM Auto-Ingest:** Set up a nightly cron job (N8N) that queries OSM for new industrial zones in target US States (e.g., Texas, Illinois) and dumps them into `raw_industrial_data`.
10. **Apify Launch:** Push the Docker image to Apify Store as "North America Industrial Lead Scraper".

---

## 5. Why This Wins
*   **No "Cold Start":** We populate the map immediately with OSM (Free) and ThomasNet (Scraped).
*   **High Quality:** We don't guess. We let the drivers tell us what's real by what they "Save".
*   **Revenue:** The Scraper itself becomes a product we sell to others who need B2B data.
