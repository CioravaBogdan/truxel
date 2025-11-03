# 🚛 Planul Director: Funcționalitatea "Comunitate" în Truxel

**Versiune:** 1.0 | **Data:** 31 Octombrie 2025 | **Status:** Final

---

## 1. Viziune și Obiective Strategice

### 1.1. Viziune
Transformarea Truxel dintr-o aplicație de lead management într-un ecosistem digital indispensabil pentru șoferii profesioniști, unde aceștia pot interacționa, colabora și găsi oportunități în timp real.

### 1.2. Obiective Cheie
- **Creșterea Angajamentului:** Transformarea aplicației într-o platformă pe care șoferii o deschid zilnic.
- **Valoare Adăugată:** Oferirea de unelte practice care rezolvă probleme reale (curse de retur, optimizare spațiu).
- **Efect de Rețea:** Crearea unei comunități unde valoarea crește exponențial cu numărul de utilizatori.
- **Monetizare:** Introducerea de noi pârghii de monetizare prin funcționalități premium legate de comunitate.

---

## 2. Conceptul Central și Experiența Utilizatorului (UI/UX)

### 2.1. Feed-ul Dual: Inima Comunității
Funcționalitatea va fi integrată direct pe ecranul principal (`Acasă`) și va fi structurată în jurul a două feed-uri, accesibile printr-un control `segmented` (tab-uri).

- **Feed 🟢 "Șoferi Disponibili":**
  - **Scop:** Șoferii își anunță disponibilitatea.
  - **Mecanism:** Postări ultra-rapide, bazate pe template-uri, cu preluare automată a locației.
  - **Exemple:** "Disponibil local în [Oraș]", "Caut retur spre [Oraș]", "Disponibil spre [Direcție]".

- **Feed 📦 "Curse Disponibile":**
  - **Scop:** Șoferii postează curse sau spațiu disponibil în camion.
  - **Mecanism:** Formular minim, optimizat pentru rapiditate.
  - **Exemple:** "Am [X] tone libere pe ruta [A] → [B]", "Retur gol din [Oraș]".

### 2.2. Principiul "One-Tap Posting"
Interfața va fi optimizată pentru șoferii aflați în mișcare.

- **Butoane Mari și Clare:** Template-urile vor fi prezentate ca butoane mari, ușor de apăsat.
- **Zero Text Liber (MVP):** Pentru a garanta siguranța, postarea se va face exclusiv prin selectarea de opțiuni, fără a necesita tastare.
- **Confirmare Simplă:** După selectarea unui template, un ecran de confirmare sumarizează postarea, care devine live cu un singur tap.

### 2.3. Mockup Conceptual UI

```
┌─────────────────────────────────┐
│  🚛 COMUNITATE                   │
│                                  │
│ ┌──────────┬──────────┐         │
│ │DISPONIBIL│  CURSE   │         │ <- Toggle
│ └──────────┴──────────┘         │
│                                  │
│ 🔍 Caută oraș...        [Filtre]│
│                                  │
│ ┌─────────────────────────────┐ │
│ │ [Avatar] Ion Popescu        │ │
│ │ 📍 București • 7.5T Prelată │ │
│ │ "Disponibil pentru curse    │ │
│ │  locale sau spre Moldova"   │ │
│ │ ⏰ Până la 18:00 azi       │ │
│ │ 👁 234 • 📍 2.5 km         │ │
│ │ [💬 Contact] [⭐ Salvează]  │ │
│ └─────────────────────────────┘ │
│                                  │
│        [+] Postează Acum        │ <- FAB
└─────────────────────────────────┘
```

---

## 3. Arhitectura Tehnică și Scalabilitate

### 3.1. Structura Bazei de Date (Supabase)
Vom folosi o arhitectură scalabilă, cu tabele normalizate și indecși optimizați pentru performanță.

#### Tabel Principal: `community_posts`
Un singur tabel pentru a gestiona toate tipurile de postări, asigurând mentenanță și interogări simple.

```sql
-- Enum pentru tipuri de postări, ușor de extins
CREATE TYPE community_post_type AS ENUM ('DRIVER_AVAILABLE', 'LOAD_AVAILABLE');
CREATE TYPE community_post_status AS ENUM ('active', 'matched', 'expired', 'cancelled');

CREATE TABLE community_posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_type community_post_type NOT NULL,
  status community_post_status NOT NULL DEFAULT 'active',

  -- Detalii locație
  origin_city text NOT NULL,
  origin_country_code text NOT NULL,
  origin_location geography(POINT, 4326) NOT NULL, -- SRID 4326 for GPS coords
  destination_city text,
  destination_country_code text,
  destination_location geography(POINT, 4326),

  -- Conținut și metadate
  template_key text NOT NULL, -- Cheia template-ului folosit (ex: 'local_availability')
  display_title text NOT NULL, -- Titlu generat automat pentru card
  metadata jsonb, -- Detalii flexibile: { "tons": 5, "truck_type": "prelata" }

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL, -- Va fi calculat la inserare (ex: now() + '4 hours')

  -- Statistici pentru relevanță
  view_count integer NOT NULL DEFAULT 0,
  contact_count integer NOT NULL DEFAULT 0
);

-- Indecși pentru performanță maximă
CREATE INDEX ON community_posts (user_id);
CREATE INDEX ON community_posts (post_type, status);
CREATE INDEX ON community_posts USING GIST (origin_location); -- Pentru căutări geografice
CREATE INDEX ON community_posts (origin_city text_pattern_ops); -- Pentru căutare rapidă după oraș
CREATE INDEX ON community_posts (expires_at) WHERE status = 'active';
```

#### Tabele Auxiliare
- **`community_interactions`**: Stochează acțiuni (ex: `saved`, `contacted`, `reported`).
- **`saved_filters`**: Permite utilizatorilor să-și salveze seturile de filtre preferate.
- **`cities`**: O tabelă locală cu orașe mari, pentru a evita costurile cu API-uri externe.

### 3.2. Integrarea cu Abonamentele (Monetizare)
Limitarea postărilor se va face server-side pentru a preveni abuzul.

1.  **Coloană în `profiles`**: Adăugăm `community_posts_remaining` (integer) și `community_posts_reset_at` (timestamptz) în tabela `profiles`.
2.  **Supabase RPC Function**: Creăm o funcție `can_user_post()` care va fi apelată înainte de fiecare inserare.
    ```sql
    CREATE OR REPLACE FUNCTION can_user_post(p_user_id uuid)
    RETURNS boolean AS $$
    DECLARE
      posts_today int;
      plan_limit int;
    BEGIN
      -- Obține limita planului utilizatorului (ex: din `subscriptions` sau `profiles`)
      SELECT s.post_limit INTO plan_limit FROM subscriptions s WHERE s.user_id = p_user_id;
      IF plan_limit IS NULL THEN plan_limit := 5; END IF; -- Limită default pentru planul gratuit

      -- Numără postările din ultimele 24 de ore
      SELECT count(*) INTO posts_today FROM community_posts
      WHERE user_id = p_user_id AND created_at > now() - interval '24 hours';

      RETURN posts_today < plan_limit;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    ```
3.  **RLS Policy**: Politica de `INSERT` pe `community_posts` va verifica `can_user_post(auth.uid())`.

### 3.3. Notificări Push Inteligente
- **Mecanism:** Vom folosi Supabase Edge Functions, declanșate la inserarea unei noi postări.
- **Logica de Matching:**
  1. O nouă postare este creată (`POST A`).
  2. Edge Function-ul caută utilizatori cu filtre salvate care se potrivesc cu `POST A`.
  3. De asemenea, caută alți utilizatori activi în proximitatea geografică a postării.
  4. Trimite notificări push personalizate via Expo Push Service către utilizatorii relevanți.
- **Exemplu:** "O nouă cursă pe ruta ta preferată (București → Cluj) a fost adăugată."

---

## 4. Roadmap de Implementare Fazat

### FAZA 1: MVP - Fundația (2 săptămâni)
**Obiectiv:** Lansarea funcționalității de bază pentru a colecta feedback.
1.  **Database:** Crearea migrării pentru tabelele `community_posts` și `cities`.
2.  **UI:** Implementarea tab-urilor pe ecranul principal.
3.  **Servicii:** Crearea `communityService` și `geoService` (cu căutare în tabela locală `cities`).
4.  **Funcționalitate Core:**
    - Afișarea feed-ului (fără filtre avansate).
    - Crearea de postări de tip `DRIVER_AVAILABLE` folosind template-uri și locație GPS.
    - Butoane de contact (WhatsApp/Apel).
    - Expirare automată a postărilor (verificare în query).

### FAZA 2: Funcționalități Esențiale (2 săptămâni)
**Obiectiv:** Îmbunătățirea experienței și adăugarea de context.
1.  **Filtre:** Implementarea filtrelor de bază (căutare oraș, tip postare).
2.  **Postare Curse:** Adăugarea formularului pentru `LOAD_AVAILABLE`.
3.  **Integrare Abonamente:** Implementarea logicii de limitare a postărilor.
4.  **UI Polish:** Adăugarea de stări de încărcare (skeleton loaders) și empty states.

### FAZA 3: Angajament și Reținere (2 săptămâni)
**Obiectiv:** Transformarea utilizatorilor ocazionali în utilizatori fideli.
1.  **Notificări Push:** Implementarea Edge Function pentru notificări de match.
2.  **Interacțiuni:** Adăugarea funcționalității de "Salvare postare".
3.  **Filtre Salvate:** Implementarea tabelei `saved_filters` și a interfeței corespunzătoare.
4.  **Analytics:** Integrarea evenimentelor de bază pentru a măsura adopția și utilizarea.

### FAZA 4: Optimizare și Scalare (Continuu)
**Obiectiv:** Asigurarea performanței și fiabilității pe măsură ce comunitatea crește.
1.  **Performanță:** Optimizarea interogărilor, cache-ing agresiv, virtualizarea listelor.
2.  **Moderare:** Implementarea funcționalității de "Raportare postare".
3.  **Rating System:** (Opțional, post-lansare) Introducerea unui sistem de rating între șoferi.
4.  **Testare:** Adăugarea de teste automate (unit, integration, E2E).

---

## 5. Metrici de Succes și KPI-uri

- **Adopție:**
  - `% de utilizatori activi care postează în prima săptămână` (Target: >15%)
  - `Număr de postări zilnice` (Target: >100 după prima lună)
- **Angajament:**
  - `Rata de contact per postare` (Target: >10%)
  - `DAU/MAU ratio` pentru secțiunea comunitate (Target: >30%)
- **Retenție:**
  - `D7 Retention` pentru utilizatorii care au postat (Target: >40%)
- **Performanță Tehnică:**
  - `Timpul de încărcare al feed-ului` (Target: <1.5s)
  - `Rata de erori la postare` (Target: <0.1%)

---

## 6. Pași Următori Imediați

1.  **Validarea Planului:** Revizuirea acestui document cu toți stakeholderii.
2.  **Crearea Task-urilor:** Descompunerea **FAZEI 1** în task-uri concrete în sistemul de project management.
3.  **Start Implementare:** Începerea lucrului la primul task: **crearea migrării SQL pentru baza de date**.
