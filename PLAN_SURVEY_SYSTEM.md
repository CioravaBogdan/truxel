# 📊 Plan Implementare Sistem Sondaje (Market Research)

Acest document detaliază planul tehnic pentru implementarea funcționalității de sondaje în aplicația Truxel.

## 1. Obiective
- Colectarea de feedback și date de piață direct de la utilizatori.
- Targetare specifică (țară, tip abonament).
- Integrare cu sisteme externe (ex: N8N) pentru crearea sondajelor.
- Experiență utilizator non-intruzivă (widget).

## 2. Arhitectura Bazei de Date (Supabase)

Vom crea două tabele noi pentru a gestiona sondajele și răspunsurile.

### 2.1. Tabela `surveys` (Sondaje)
Această tabelă va stoca definiția sondajelor.

| Coloană | Tip | Descriere |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key |
| `title` | `text` | Titlul intern al sondajului (ex: "Feedback Q4") |
| `questions` | `jsonb` | Array cu întrebările. Ex: `["Ce funcție lipsește?", "Cât de des folosești X?"]` |
| `options` | `jsonb` | Array cu variantele de răspuns (dacă e multiple choice). Ex: `[["A", "B"], ["Zilnic", "Rar"]]` |
| `target_countries` | `text[]` | Array cu coduri de țară (ex: `['RO', 'DE', 'PL']`). `NULL` = toate țările. |
| `min_subscription_tier`| `text` | Nivel minim abonament (ex: `standard`). Exclude `trial`. |
| `status` | `text` | `active`, `completed`, `draft`, `archived`. |
| `starts_at` | `timestamptz` | Data de început (opțional). |
| `ends_at` | `timestamptz` | Data de sfârșit (opțional). |
| `created_at` | `timestamptz` | Default `now()`. |

> **Notă despre "coloana care numără răspunsurile":**
> Deși ai sugerat o coloană care să numere răspunsurile direct în tabela de sondaje, recomandăm stocarea răspunsurilor individuale într-o tabelă separată (`survey_responses`). Acest lucru permite:
> 1. Să știm **CINE** a răspuns (ca să nu le mai arătăm sondajul).
> 2. Să prevenim răspunsurile multiple de la același user.
> 3. Analiză mai detaliată ulterioară.
>
> Putem crea un `Database View` sau o funcție RPC care să returneze numărătoarea agregată dacă ai nevoie de ea simplificat în N8N.

### 2.2. Tabela `survey_responses` (Răspunsuri)
Stochează răspunsurile utilizatorilor.

| Coloană | Tip | Descriere |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key |
| `survey_id` | `uuid` | Foreign Key către `surveys.id` |
| `user_id` | `uuid` | Foreign Key către `auth.users.id` |
| `answers` | `jsonb` | Răspunsurile utilizatorului. Ex: `{"0": "A", "1": "Zilnic"}` (index întrebare -> răspuns) |
| `created_at` | `timestamptz` | Default `now()`. |

### 2.3. Modificări Tabela `profiles`
Pentru a putea filtra după țară, trebuie să ne asigurăm că avem țara utilizatorului salvată.
- **Adăugare coloană:** `country` (text, ISO code 2 chars).
- Aceasta va fi actualizată automat când utilizatorul își actualizează locația sau la înregistrare.

## 3. Logica de Business & Targetare

### 3.1. Reguli de Afișare (Client-Side & RLS)
Un sondaj va fi vizibil pentru un utilizator doar dacă:
1. `surveys.status` este `active`.
2. `surveys.target_countries` conține `profile.country` SAU este `NULL` (global).
3. `profile.subscription_tier` nu este `trial` (sau conform regulii `min_subscription_tier`).
4. Utilizatorul **NU** are deja o intrare în `survey_responses` pentru acest `survey_id`.

### 3.2. Fluxul de Date
1. **Admin/N8N:** Inserează un rând nou în `surveys` cu întrebările și țările țintă.
2. **Aplicație (Truxel):**
   - Interoghează Supabase pentru sondaje active care se potrivesc profilului curent.
   - Exclude sondajele la care userul a răspuns deja (folosind un `left join` sau filtrare client-side dacă lista e mică).
3. **Widget:**
   - Dacă există sondaje disponibile, afișează widget-ul.
   - Widget-ul arată: "Sondaj Nou Disponibil" sau "Ajută-ne cu 3 răspunsuri".
4. **Completare:**
   - Userul răspunde.
   - Aplicația trimite datele în `survey_responses`.
   - Widget-ul dispare imediat (local state update) și permanent (la următorul fetch).

## 4. Componente UI (React Native)

### 4.1. `SurveyWidget.tsx`
- **Locație:** Home Screen (Dashboard) sau Community Tab.
- **Design:** Un card compact, stil "Call to Action".
- **Props:** `surveyData`.

### 4.2. `SurveyModal.tsx`
- **Tip:** Modal full-screen sau bottom sheet.
- **Conținut:**
  - Titlu sondaj.
  - Lista de întrebări (renderizate dinamic din array-ul `questions`).
  - Input-uri: Radio Buttons (pentru single choice), Checkboxes (multiple), sau Text Input.
  - Buton "Trimite".

## 5. Integrare Externă (N8N)

Pentru a trimite sondajele din N8N, vei folosi nodul Supabase:
- **Operation:** Insert
- **Table:** `surveys`
- **Data:**
  ```json
  {
    "title": "Sondaj Preferințe Rute",
    "questions": ["Ce rute preferi?", "Ce tonaj?"],
    "options": [["Intern", "Extern"], ["<3.5t", ">3.5t"]],
    "target_countries": ["RO", "PL"],
    "status": "active",
    "min_subscription_tier": "standard"
  }
  ```

## 6. Pași de Implementare

1.  **Backend (Supabase):**
    - Rulare script SQL pentru crearea tabelelor `surveys` și `survey_responses`.
    - Adăugare coloană `country` în `profiles` (dacă nu există).
    - Configurare politici RLS (Row Level Security).
2.  **Frontend (Store):**
    - Creare `useSurveyStore` pentru a gestiona fetch-ul și starea sondajelor.
3.  **Frontend (UI):**
    - Implementare `SurveyWidget` și `SurveyModal`.
    - Integrare în ecranul principal.
4.  **Testare:**
    - Creare sondaj test din dashboard/SQL.
    - Verificare apariție la useri eligibili.
    - Verificare dispariție după completare.

---
Aștept feedback-ul tău pe acest plan. Dacă ești de acord, putem trece la pasul 1 (crearea structurii SQL).

INSERT INTO surveys (title, questions, options, status, target_countries)
VALUES (
  'Ce funcționalitate lipsește?',
  '["Ce ți-ar plăcea să vezi în Truxel?", "Cât de des folosești aplicația?"]'::jsonb,
  '[["Bursă de transport", "Mai multe lead-uri", "Altele"], ["Zilnic", "Săptămânal"]]'::jsonb,
  'active',
  ARRAY['RO']
);