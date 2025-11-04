# Community Feature Plan – Combined (Best‑Of Variant)

This document merges your proposed plans with the previously created plans, focusing on: clean UX, scalable & clean Supabase design, ease of implementation, notifications, and subscription‑based monthly limits.

See also:
- `COMMUNITY_FEATURE_IMPLEMENTATION_PLAN.md` (root) – full implementation plan ready for execution
- `docs/COMMUNITY_PLAN.md` – detailed design
- `docs/COMMUNITY_VARIANT_RECOMMENDED.md` – rationale for the recommended variant

Highlights
- Two Home feeds (segmented): „Sunt disponibil” and „Curse disponibile”.
- One‑tap templates with auto‑location; minimal forms; safe while driving.
- Unified table `community_posts` + `cities` + `community_interactions`.
- City search: local `cities` + pg_trgm (no per‑query costs). Optional Edge fallback.
- TTL 4h, realtime, WhatsApp/Call contact only in MVP.
- Monthly post limits per subscription tier with RPC credit checks.

Key Templates
- Disponibil: „Local”, „Spre [Direcție]”, „Retur spre [Oraș]”, „Liber până la [Oră/Dată]”.
- Curse: „Marfă [A]→[B]”, „Plec spre [Dest], [X]t libere”, „Retur gol [Oraș]”, „Caut partener spre [Dest]”.

Data Model (summary)
- `cities` (uuid, name, country, lat/lng, geohash, population?; GIN trigram on name)
- `community_posts` (unified; origin/dest, geohash, template_key, display_text, metadata jsonb, status, expires_at)
- `community_interactions` (interested/contacted/saved)
- Extend `subscription_tiers` with `community_posts_per_month` and add RPCs: `get_total_post_credits`, `consume_post_credit`.

Roadmap (MVP → Core → Engagement → Optimize)
- MVP: schema+tabele+RLS, Home UI with segmented feeds + Quick Post, filters (city/direction/time), realtime, limits per tier.
- Core: city Edge fallback, push notifications on match, report/block, advanced filters, pagination.
- Engagement: saved posts, history, rating, share, analytics.
- Optimize: cache/offline, push fine‑tuning, optional PostGIS/H3.

