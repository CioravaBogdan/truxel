# Manual Post Credits Management

## 📊 System Overview

Sistemul de limită postări folosește **2 tabele** pentru tracking:

1. **`subscription_limits`** - Limite per tier (config globală)
2. **`user_post_usage`** - Usage tracking per user (contoare)

---

## 🗄️ Database Structure

### Table: `subscription_limits`

Conține limitele pentru fiecare subscription tier:

| Column | Type | Description |
|--------|------|-------------|
| `tier` | text | 'trial', 'standard', 'pro', 'premium' |
| `posts_per_month` | integer | Maxim postări/lună |
| `posts_per_day` | integer | Maxim postări/zi |
| `concurrent_active_posts` | integer | Maxim postări active simultan |
| `post_duration_hours` | integer | Durata validitate post (ore) |

**Current Limits:**
```sql
-- trial: 10/month, 2/day, 1 active, 24h duration
-- standard: 30/month, 5/day, 3 active, 24h duration
-- pro: 100/month, 15/day, 10 active, 48h duration
-- premium: unlimited (999/month), 30/day, 30 active, 72h duration
```

---

### Table: `user_post_usage`

Tracking usage per user:

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | uuid | ID user (FK → auth.users) |
| `posts_this_month` | integer | **Contador postări luna curentă** |
| `posts_today` | integer | **Contador postări ziua curentă** |
| `last_post_at` | timestamptz | Ultima postare |
| `month_reset_at` | timestamptz | Data reset lunar |
| `day_reset_at` | timestamptz | Data reset zilnic |

---

## 🎯 Pentru User ID: `b2e97bd7-4734-4462-ad6e-03f88a0f6c74`

### 1️⃣ Verifică tier-ul actual

```sql
SELECT subscription_tier 
FROM profiles 
WHERE user_id = 'b2e97bd7-4734-4462-ad6e-03f88a0f6c74';
```

**Rezultat așteptat:** `standard` (sau alt tier)

---

### 2️⃣ Verifică usage actual

```sql
SELECT * 
FROM user_post_usage 
WHERE user_id = 'b2e97bd7-4734-4462-ad6e-03f88a0f6c74';
```

**Rezultat așteptat:**
```
posts_this_month: 2
posts_today: 2
last_post_at: 2025-11-01 11:04:09
month_reset_at: 2025-11-01 00:00:00
day_reset_at: 2025-11-01 00:00:00
```

---

### 3️⃣ Verifică limite pentru tier

```sql
SELECT tier, posts_per_month, posts_per_day, concurrent_active_posts
FROM subscription_limits
WHERE tier = 'standard';  -- sau tier-ul actual al user-ului
```

**Rezultat pentru `standard`:**
```
tier: standard
posts_per_month: 30
posts_per_day: 5
concurrent_active_posts: 3
```

---

## 🔧 Cum să Adaugi Manual Postări

### Opțiunea 1: **Reset Contoare (Full Reset)**

Șterge toate contoarele pentru a da user-ului creditele complete:

```sql
-- ATENȚIE: Acest query RESETEAZĂ toate contoarele!
UPDATE user_post_usage 
SET 
  posts_this_month = 0,
  posts_today = 0,
  last_post_at = NULL,
  month_reset_at = date_trunc('month', now()),
  day_reset_at = date_trunc('day', now()),
  updated_at = now()
WHERE user_id = 'b2e97bd7-4734-4462-ad6e-03f88a0f6c74';
```

**Rezultat:**
- ✅ User poate posta din nou
- ✅ Creditele revin la maxim (30/lună, 5/zi pentru standard)
- ⚠️ Istoric pierdut (nu se păstrează câte postări a făcut)

---

### Opțiunea 2: **Scade Contoarele (Subtract Usage)**

Scade numărul de postări folosite pentru a da mai multe credite:

```sql
-- Exemplu: Scade 1 din posts_this_month și posts_today
UPDATE user_post_usage 
SET 
  posts_this_month = GREATEST(posts_this_month - 1, 0),
  posts_today = GREATEST(posts_today - 1, 0),
  updated_at = now()
WHERE user_id = 'b2e97bd7-4734-4462-ad6e-03f88a0f6c74';
```

**Exemplu pentru +5 postări:**
```sql
UPDATE user_post_usage 
SET 
  posts_this_month = GREATEST(posts_this_month - 5, 0),
  posts_today = GREATEST(posts_today - 5, 0),
  updated_at = now()
WHERE user_id = 'b2e97bd7-4734-4462-ad6e-03f88a0f6c74';
```

**Rezultat:**
- ✅ User primește +5 postări disponibile
- ✅ Contoarele ajustate corect
- ✅ Istoric păstrat (știi câte a făcut original)

---

### Opțiunea 3: **Upgrade Tier (Long-term Solution)**

Schimbă tier-ul subscription pentru limite mai mari:

```sql
-- Upgrade la PRO (100 posts/month, 15 posts/day)
UPDATE profiles 
SET 
  subscription_tier = 'pro',
  updated_at = now()
WHERE user_id = 'b2e97bd7-4734-4462-ad6e-03f88a0f6c74';
```

**Tiers disponibile:**
- `trial` - 10/lună, 2/zi
- `standard` - 30/lună, 5/zi ← (current)
- `pro` - 100/lună, 15/zi
- `premium` - 999/lună, 30/zi (unlimited)

---

## 🎯 Quick Fix Script

Pentru a da user-ului **instant access** la mai multe postări:

```sql
-- SOLUTION 1: Reset total (Fresh start)
UPDATE user_post_usage 
SET posts_this_month = 0, posts_today = 0
WHERE user_id = 'b2e97bd7-4734-4462-ad6e-03f88a0f6c74';

-- SAU

-- SOLUTION 2: Scade 3 postări din contoare (+3 disponibile)
UPDATE user_post_usage 
SET 
  posts_this_month = GREATEST(posts_this_month - 3, 0),
  posts_today = GREATEST(posts_today - 3, 0)
WHERE user_id = 'b2e97bd7-4734-4462-ad6e-03f88a0f6c74';

-- SAU

-- SOLUTION 3: Upgrade la PRO tier
UPDATE profiles 
SET subscription_tier = 'pro'
WHERE user_id = 'b2e97bd7-4734-4462-ad6e-03f88a0f6c74';
```

---

## 🔍 Verificare După Update

Rulează acest query pentru a verifica rezultatul:

```sql
SELECT 
  p.user_id,
  p.full_name,
  p.subscription_tier,
  sl.posts_per_month AS "Max/Month",
  sl.posts_per_day AS "Max/Day",
  upu.posts_this_month AS "Used This Month",
  upu.posts_today AS "Used Today",
  (sl.posts_per_month - upu.posts_this_month) AS "Remaining Month",
  (sl.posts_per_day - upu.posts_today) AS "Remaining Today"
FROM profiles p
LEFT JOIN user_post_usage upu ON p.user_id = upu.user_id
LEFT JOIN subscription_limits sl ON p.subscription_tier = sl.tier
WHERE p.user_id = 'b2e97bd7-4734-4462-ad6e-03f88a0f6c74';
```

**Output Example:**
```
user_id: b2e97bd7-4734-4462-ad6e-03f88a0f6c74
full_name: John Doe
subscription_tier: standard
Max/Month: 30
Max/Day: 5
Used This Month: 0  ← După reset
Used Today: 0       ← După reset
Remaining Month: 30
Remaining Today: 5
```

---

## 📋 Summary

| Tabel | Coloană pentru Credite | Acțiune |
|-------|------------------------|---------|
| `user_post_usage` | `posts_this_month` | **Scade pentru +credite** |
| `user_post_usage` | `posts_today` | **Scade pentru +credite** |
| `subscription_limits` | `posts_per_month` | ⚠️ NU modifica (config globală) |
| `profiles` | `subscription_tier` | Upgrade tier pentru limite mai mari |

---

## ⚡ Recommended Action

**Pentru user `b2e97bd7-4734-4462-ad6e-03f88a0f6c74`:**

Rulează în Supabase SQL Editor:

```sql
-- Reset complet (cel mai simplu)
UPDATE user_post_usage 
SET 
  posts_this_month = 0,
  posts_today = 0,
  updated_at = now()
WHERE user_id = 'b2e97bd7-4734-4462-ad6e-03f88a0f6c74';

-- Verifică rezultatul
SELECT 
  (SELECT posts_per_day FROM subscription_limits sl 
   JOIN profiles p ON p.subscription_tier = sl.tier 
   WHERE p.user_id = 'b2e97bd7-4734-4462-ad6e-03f88a0f6c74') - posts_today AS "Posts Available Today"
FROM user_post_usage 
WHERE user_id = 'b2e97bd7-4734-4462-ad6e-03f88a0f6c74';
```

**Rezultat așteptat:** `5` (standard tier limit)

---

**Gata! User-ul poate posta din nou!** 🚀
