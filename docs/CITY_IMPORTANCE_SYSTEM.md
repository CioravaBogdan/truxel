# City Importance & Categorization System

## Overview
The application uses an **Importance Score** system (0.0 to 1.0) to categorize and prioritize cities in search results, suggestions, and location services. This system ensures that major hubs (like Bucharest, Cluj, Timișoara) appear first, while still allowing smaller localities to be discoverable.

## Database Structure (`cities` table)

The `cities` table in Supabase contains the following key columns for categorization:

| Column | Type | Description |
| :--- | :--- | :--- |
| `importance` | `float` | A value between `0.0` and `1.0` indicating the city's tier. |
| `population` | `integer` | The city's population (used as a secondary sort factor). |
| `usage_count` | `integer` | Tracks how many times a city has been selected/used (for dynamic scoring). |
| `is_user_generated` | `boolean` | Flags cities auto-created by user location data. |

## Importance Tiers (Implicit)

While there is no explicit "Category" column (e.g., "Tier 1"), the `importance` score effectively creates the following tiers:

| Score | Tier Description | Examples |
| :--- | :--- | :--- |
| **1.0** | **Capital / Major Hub** | București |
| **0.9** | **Major Regional Cities** | Cluj-Napoca, Timișoara, Iași |
| **0.7 - 0.8** | **Large Cities** | Constanța, Craiova, Brașov, Galați |
| **0.5 - 0.6** | **Medium Cities** | Sibiu, Bacău, Oradea, Ploiești |
| **0.3 - 0.4** | **Small Cities** | Alba Iulia, Giurgiu, Zalău |
| **0.2** | **Towns** | Mangalia, Câmpina |
| **0.5** | **User Generated (Default)** | New locations discovered by users |

## How It Works

### 1. Search Prioritization (`CityService`)
When a user searches for a city (e.g., "Buc"), the system sorts results using a weighted approach:
1.  **Importance (Primary):** Higher importance cities appear first.
2.  **Population (Secondary):** Among cities with similar importance, larger population wins.

```typescript
// services/cityService.ts
queryBuilder = queryBuilder
  .order('importance', { ascending: false })
  .order('population', { ascending: false });
```

### 2. Dynamic Importance Scoring (Auto-Population)
The system is designed to "learn" which cities are important to *your* specific users, even if they are small on the map.

*   **Auto-Discovery:** When a user grants location access in a new place, the `auto_populate_city` PostgreSQL function creates the city if it doesn't exist.
*   **Default Score:** New user-generated cities get a default importance of `0.5`.
*   **Usage Boosting:** The `increment_city_usage` function increases a city's score based on activity.

```sql
-- supabase/migrations/20251031_auto_populate_cities.sql
UPDATE cities
SET usage_count = COALESCE(usage_count, 0) + 1,
    importance_score = LEAST(1.0, 0.5 + (COALESCE(usage_count, 0) * 0.01))
WHERE id = p_city_id;
```
*Every 100 uses increases the importance by 1.0 (capped at 1.0).*

### 3. Major Cities Caching
For performance, "Major Cities" (Population > 50k) are cached locally on the device to allow for offline location resolution and quick "Popular Cities" lists without hitting the database.

## Related Files
*   `services/cityService.ts`: Application logic for searching and sorting.
*   `supabase/community_setup.sql`: Table definition and initial data.
*   `supabase/cities_import.sql`: Bulk import of cities with pre-defined importance scores.
*   `supabase/migrations/20251031_auto_populate_cities.sql`: Logic for dynamic scoring and auto-discovery.
