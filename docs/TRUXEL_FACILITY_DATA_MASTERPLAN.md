# DATA ENGINE MASTERPLAN (v2.0)

> **Vision**: To create a standalone, scalable, and monetizable data engine that discovers, classifies, and enriches business data for specific industry verticals, starting with trucking logistics for Truxel.
>
> **Mission**: Evolve beyond a project-specific feature into a modular B2B data service. This engine will power the Truxel application while simultaneously being productized for external consumption via API, creating a new revenue stream.

---

## 1. Core Architecture: Modular & Service-Oriented

The architecture is redesigned to separate the **Core Data Engine** from its **Consumers**. This is the key to making it a reusable, monetizable product.

```
                                     +-------------------------+
                                     |      API GATEWAY        |
                                     | (Supabase + Kong/Cloudflare) |
                                     | - Auth (API Keys)       |
                                     | - Rate Limiting         |
                                     | - Usage Tracking        |
                                     +-----------+-------------+
                                                 |
                               +-----------------+-----------------+
                               |                                   |
                 +-------------v-------------+      +--------------v-------------+
                 |      TRUXEL APP (Consumer)  |      | EXTERNAL APIS (Consumers)  |
                 | - Mobile/Web Client         |      | - RapidAPI, Apify          |
                 | - Internal Dashboards       |      | - Direct Customer Integrations|
                 +-----------------------------+      +----------------------------+
                                                 |
                               +-----------------+-----------------+
                               |                                   |
                 +-------------v-------------+      +--------------v-------------+
                 |  OPERATIONAL CLI (Consumer) |      |    N8N WORKFLOWS (Consumer) |
                 | - `data-engine-cli`         |      | - Orchestration            |
                 | - Job Management, Stats     |      | - Scheduling, Monitoring   |
                 +-----------------------------+      +----------------------------+
                                                 |
                                     +-----------+-------------+
                                     | CORE DATA ENGINE (Product)|
+------------------------------------+-----------+-------------+------------------------------------+
|                                                                                                   |
|  +---------------------+  +-----------------------+  +-----------------------+  +----------------+ |
|  | Ingestion Pipelines |  | Classification Engine |  |  Enrichment Services  |  |  Deduplication | |
|  | - OSM, Outscraper   |  | - Rule-based (NAICS)  |  |  - Contact/Social     |  |  & Merging     | |
|  | - Gov Registries    |  | - Keyword Matching    |  |  - Verification       |  |  - Fuzzy Logic | |
|  | - User Submissions  |  | - LLM (Edge Cases)    |  |  - Financials         |  |  - Master Record| |
|  +---------------------+  +-----------------------+  +-----------------------+  +----------------+ |
|                                                                                                   |
|  +-----------------------------------------------------------------------------------------------+ |
|  |                                   DATABASE (Supabase PostgreSQL)                                | |
|  |  - `discovered_businesses`, `discovery_profiles`, `collection_jobs`, `api_usage_logs`           | |
|  +-----------------------------------------------------------------------------------------------+ |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
```

### Technology Stack

| Component | Technology | Justification |
|---|---|---|
| **Database** | **Supabase (PostgreSQL)** | Existing infrastructure, excellent for rapid development, PostGIS for geo-queries. |
| **Orchestration** | **n8n** | Existing infrastructure, visual workflows are perfect for managing complex data pipelines. |
| **Core Logic** | **Python Scripts** | Best ecosystem for data processing, scraping, and machine learning. |
| **API Gateway** | **Supabase Edge Functions + Kong (Optional)** | Supabase for simplicity; Kong for advanced rate-limiting, analytics, and billing integration if needed. |
| **Caching** | **Redis** | Existing infrastructure, essential for performance and reducing database load. |
| **Deployment** | **Contabo VPS (Docker)** | Existing infrastructure, cost-effective for running n8n, Redis, and Python scripts. |

---

## 2. Database Schema: The Multi-Industry Core

This schema is fundamentally redesigned for **configurability and monetization**. The key addition is the `discovery_profiles` table, which defines the rules for each industry vertical you want to target.

```sql
-- ============================================================================
-- DATA ENGINE SCHEMA v2.0
-- Purpose: A modular, multi-industry business discovery database.
-- ============================================================================

-- Required Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. CONFIGURATION: Defining What to Discover
-- ============================================================================

-- Defines an industry vertical (e.g., "Trucking", "Construction", "Hospitality")
CREATE TABLE IF NOT EXISTS discovery_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    target_industries TEXT[], -- e.g., ['Manufacturing', 'Logistics']
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rules for classifying businesses within a specific profile
CREATE TABLE IF NOT EXISTS classification_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES discovery_profiles(id) ON DELETE CASCADE,
    rule_type TEXT NOT NULL CHECK (rule_type IN ('include', 'exclude', 'boost', 'demote')),
    match_field TEXT NOT NULL, -- 'name', 'industry', 'address', 'description'
    match_type TEXT NOT NULL CHECK (match_type IN ('contains', 'regex', 'exact')),
    match_value TEXT NOT NULL,
    score_modifier INTEGER NOT NULL, -- Points to add/subtract
    priority INTEGER DEFAULT 100, -- Higher priority rules run first
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. CORE DATA: The Discovered Businesses
-- ============================================================================

CREATE TABLE IF NOT EXISTS discovered_businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    master_business_id UUID, -- Links duplicate entries to a single master record

    -- Core Info
    name TEXT NOT NULL,
    description TEXT,

    -- Location
    address TEXT,
    city TEXT,
    state_province TEXT,
    postal_code TEXT,
    country_code CHAR(2),
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    latitude DECIMAL(10, 8) GENERATED ALWAYS AS (ST_Y(location::geometry)) STORED,
    longitude DECIMAL(11, 8) GENERATED ALWAYS AS (ST_X(location::geometry)) STORED,

    -- Contact & Web
    phone TEXT,
    email TEXT,
    website TEXT,
    social_media JSONB, -- {"linkedin": "...", "facebook": "..."}

    -- Classification & Relevance
    industries TEXT[], -- e.g., ['Manufacturing', 'Automotive']
    naics_code TEXT,
    relevance_scores JSONB, -- {"profile_uuid_1": 85, "profile_uuid_2": 15}
    tags TEXT[],

    -- Operational Details
    operating_hours JSONB,
    employee_count_range TEXT, -- '1-10', '11-50', etc.
    year_established INTEGER,

    -- Data Provenance & Quality
    source TEXT NOT NULL, -- 'osm', 'outscraper', 'user_report'
    source_id TEXT, -- The ID from the original source
    source_data JSONB, -- Raw data from the source
    data_provenance JSONB, -- {"name": "osm", "email": "outscraper"}
    data_quality_score INTEGER CHECK (data_quality_score BETWEEN 0 AND 100),
    last_verified_at TIMESTAMPTZ,

    -- Status & Timestamps
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'duplicate', 'needs_review')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_source_business UNIQUE (source, source_id)
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_businesses_location ON discovered_businesses USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_businesses_relevance_scores ON discovered_businesses USING GIN (relevance_scores);
CREATE INDEX IF NOT EXISTS idx_businesses_name_trgm ON discovered_businesses USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_businesses_master_id ON discovered_businesses(master_business_id) WHERE master_business_id IS NOT NULL;

-- ============================================================================
-- 3. OPERATIONAL: Managing the Engine
-- ============================================================================

-- Tracks data collection jobs (e.g., "Scrape manufacturers in Bacau")
CREATE TABLE IF NOT EXISTS collection_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES discovery_profiles(id),
    source TEXT NOT NULL,
    params JSONB NOT NULL, -- e.g., {"city": "Bacau", "keywords": ["fabrica"]}
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    progress INTEGER DEFAULT 0,
    results JSONB, -- {"found": 150, "imported": 120, "duplicates": 30}
    cost DECIMAL(10, 4),
    n8n_execution_id TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Queue for background tasks like enrichment or deduplication
CREATE TABLE IF NOT EXISTS task_queue (
    id BIGSERIAL PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES discovered_businesses(id),
    task_type TEXT NOT NULL, -- 'enrich', 'classify', 'deduplicate'
    payload JSONB,
    priority INTEGER DEFAULT 5,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. MONETIZATION: Tracking API Usage
-- ============================================================================

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id), -- Link to a Supabase user
    api_key TEXT NOT NULL UNIQUE DEFAULT 'sk_' || replace(uuid_generate_v4()::text, '-', ''),
    description TEXT,
    rate_limit_per_minute INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_usage_logs (
    id BIGSERIAL PRIMARY KEY,
    api_key_id UUID NOT NULL REFERENCES api_keys(id),
    endpoint TEXT NOT NULL, -- e.g., '/v1/search'
    status_code INTEGER,
    ip_address INET,
    request_time TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SEED DATA: Initial Discovery Profile for Truxel
-- ============================================================================

-- 1. Create the "Trucking Logistics" profile
INSERT INTO discovery_profiles (id, name, description, target_industries)
VALUES ('your-trucking-profile-uuid', 'Trucking Logistics', 'Businesses relevant for freight and cargo transport.', '{"Manufacturing", "Warehousing", "Wholesale", "Agriculture", "Construction"}')
ON CONFLICT (name) DO NOTHING;

-- 2. Add classification rules for this profile
INSERT INTO classification_rules (profile_id, rule_type, match_field, match_type, match_value, score_modifier) VALUES
-- High-value includes
('your-trucking-profile-uuid', 'boost', 'name', 'regex', '(?i)(fabrica|factory|manufacturing|warehouse|depozit|distribution|logistics|3pl|freight)', 50),
-- High-value excludes
('your-trucking-profile-uuid', 'exclude', 'name', 'regex', '(?i)(restaurant|cafe|bar|salon|spa|gym|clinic|retail|shop|magazin)', -100),
-- Address-based boosts
('your-trucking-profile-uuid', 'boost', 'address', 'regex', '(?i)(industrial park|parc industrial|zona industriala|business park)', 20);
```

---

## 3. Data Pipelines: Generic & Configurable

The Python scripts and n8n workflows will be modified to be profile-driven.

### n8n Workflow: `Generic Data Collection`
Instead of separate workflows for each source, a single, more powerful workflow is triggered by a `collection_jobs` record.

1.  **Trigger**: `Schedule: Every 1 minute` checks `collection_jobs` for `status = 'pending'`.
2.  **Fetch Job**: Picks up one pending job and marks it as `'running'`.
3.  **Switch (by `source` field)**:
    *   **Case 'osm'**: Executes `osm_importer.py --job-id {{ $json.id }}`.
    *   **Case 'outscraper'**: Executes `outscraper_scraper.py --job-id {{ $json.id }}`.
    *   **Case 'gov_registry'**: Executes `gov_importer.py --job-id {{ $json.id }}`.
4.  **Post-Processing**:
    *   The Python script handles the import and updates the job status to `'completed'` or `'failed'`.
    *   On completion, the script adds all new business IDs to the `task_queue` for `'classify'` and `'deduplicate'`.

### Python Script: `importer.py` (Unified)
A single, robust script handles fetching job details and executing the correct logic.

```python
# Example: /root/truxel-discovery/importer.py

def main():
    job_id = get_job_id_from_args()
    job = supabase.get_job(job_id) # Fetches job, profile, and rules
    
    if job.source == 'osm':
        data = fetch_from_osm(job.params)
    elif job.source == 'outscraper':
        data = fetch_from_outscraper(job.params)
    
    imported_records = supabase.batch_import(data)
    
    # Queue next steps
    supabase.add_to_task_queue(
        business_ids=[rec['id'] for rec in imported_records],
        task_type='classify',
        payload={'profile_id': job.profile_id}
    )
    
    supabase.update_job_status(job_id, 'completed', {'imported': len(imported_records)})
```

---

## 4. API & Monetization Strategy

This is the new public-facing layer of the product.

### API Endpoints (v1)

| Endpoint | Method | Description | Monetization |
|---|---|---|---|
| `POST /v1/search` | POST | Search for businesses near a location for a given profile. | 1 credit per request |
| `GET /v1/business/{id}` | GET | Retrieve detailed information for a single business. | 1 credit per request |
| `POST /v1/enrich` | POST | Request enrichment (e.g., find emails, social media) for a business. | 5-10 credits per request |
| `GET /v1/profiles` | GET | List available discovery profiles (e.g., Trucking, Construction). | Free |

### Implementation

1.  **API Keys**: Use the `api_keys` table. All requests must include a valid `Authorization: Bearer sk_...` header.
2.  **Edge Functions**: Implement each endpoint as a Supabase Edge Function. The function will first validate the API key, then execute the core logic.
3.  **Usage Logging**: On every request, the Edge Function logs the call to the `api_usage_logs` table.
4.  **Billing**: A separate process (e.g., a monthly n8n workflow) can aggregate usage from `api_usage_logs` and integrate with Stripe for billing, or provide data for RapidAPI's billing system.

---

## 5. Operational Tooling: `data-engine-cli`

A command-line interface for managing the engine, making operations much easier.

**File**: `/root/truxel-discovery/cli.py` (using `argparse` or `click`)

### Example Commands

```bash
# Create and start a new collection job for the trucking profile in Romania
$ python cli.py jobs create --profile trucking-logistics --source osm --params '{"country_code": "RO"}'

# Check the status of all running jobs
$ python cli.py jobs list --status running

# Manually trigger classification for a batch of businesses
$ python cli.py tasks queue --task-type classify --limit 500

# View overall system statistics
$ python cli.py stats view

# Create a new API key for a customer
$ python cli.py keys create --description "New Customer LLC"
```

---

## 6. Go-to-Market & Implementation Plan

### Phased Rollout

**Phase 1: Core Engine Refactor (Weeks 1-2)**
- [ ] **Goal**: Implement the new multi-industry database schema.
- [ ] Migrate existing data to the new structure.
- [ ] Refactor Python scripts and n8n workflows to be profile-driven.
- [ ] **Outcome**: A functional, configurable data engine powering only the Truxel app.

**Phase 2: API & Monetization Layer (Weeks 3-4)**
- [ ] **Goal**: Build the public-facing API.
- [ ] Implement the `api_keys` and `api_usage_logs` tables.
- [ ] Develop and deploy the v1 Edge Function endpoints (`/search`, `/business/{id}`).
- [ ] Set up basic API documentation.
- [ ] **Outcome**: A functional, secured API ready for internal and trusted-partner use.

**Phase 3: Advanced Features & Deduplication (Weeks 5-6)**
- [ ] **Goal**: Improve data quality and expand capabilities.
- [ ] Implement the background deduplication and merging pipeline.
- [ ] Develop the `/enrich` endpoint and its backing workflow.
- [ ] Build the `data-engine-cli` for easier operations.
- [ ] **Outcome**: A robust, production-grade data engine.

**Phase 4: Public Launch (Weeks 7-8)**
- [ ] **Goal**: Launch on a public marketplace.
- [ ] Create a new "Construction Suppliers" discovery profile to prove multi-industry capability.
- [ ] Publish the API on RapidAPI.
- [ ] Create marketing materials and developer-friendly documentation.
- [ ] **Outcome**: The data engine is now a public product generating its first external revenue.