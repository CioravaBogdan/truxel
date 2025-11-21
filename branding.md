# Truxel Brand Guidelines & Design System

Acest document servește ca sursă unică de adevăr pentru designul și brandingul aplicației Truxel. Folosiți aceste specificații pentru a menține consistența vizuală în dezvoltarea viitoare.

## 1. Culori (Colors)

Definite în `lib/theme.tsx`. Sistemul suportă Dark Mode și Light Mode.

### Light Mode (The Professional)
*   **Primary (Navy):** `#0F172A` (Folosit pentru text principal, fundaluri dark hero, accente puternice)
*   **Secondary (Orange):** `#FF5722` (Culoarea de brand, butoane principale, badge-uri, icon-uri active)
*   **Background:** `#FFFFFF` (Web) / `#F1F5F9` (Mobile - Light Gray)
*   **Surface/Card:** `#FFFFFF` (Alb pur)
*   **Text:** `#0F172A` (Navy închis)
*   **Text Secondary:** `#64748B` (Slate 500)
*   **Border:** `#E2E8F0` (Slate 200)

### Dark Mode (Night Haul)
*   **Primary (Cyan Glow):** `#38BDF8` (Accente luminoase pe fundal închis)
*   **Secondary (Neon Orange):** `#FF6D00` (Versiune mai vibrantă a portocaliului)
*   **Background:** `#0F172A` (Deep Navy)
*   **Surface/Card:** `#1E293B` (Lighter Navy)
*   **Text:** `#F8FAFC` (Slate 50)
*   **Text Secondary:** `#94A3B8` (Slate 400)
*   **Border:** `#334155` (Slate 700)

### Status Colors
*   **Success:** `#10B981` (Light) / `#34D399` (Dark)
*   **Error:** `#EF4444` (Light) / `#F87171` (Dark)
*   **Warning:** `#F59E0B` (Light) / `#FBBF24` (Dark)
*   **Info:** `#0EA5E9` (Light) / `#38BDF8` (Dark)

---

## 2. Tipografie (Typography)

Fonturile sunt gestionate prin stiluri React Native.

### Headings
*   **Hero Title:** Size 48, Weight 900, LineHeight 56. (Mobile: Size 34)
*   **Section Title:** Size 40, Weight 900. (Mobile: Size 32)
*   **Card Title:** Size 20-24, Weight 700-800.
*   **Subtitle:** Size 18-20, LineHeight 28-32.

### Body
*   **Default:** Size 16, Weight 400-500.
*   **Small:** Size 13-14.
*   **Large/Lead:** Size 18.

### Special
*   **Eyebrow/Badge:** Uppercase, LetterSpacing 1.4, Weight 700, Size 13.
*   **Button Text:** Weight 600-800, LetterSpacing 0.4-0.6.

---

## 3. Spațiere și Layout (Spacing & Layout)

### Grid System (Web)
*   **Container Max Width:** 1200px
*   **Centrare:** `marginHorizontal: 'auto'`
*   **Padding Orizontal:** 24px (Desktop), 20px (Mobile)
*   **Padding Vertical Secțiuni:** 80px (Desktop), 48-64px (Mobile)
*   **Gap:** 12, 16, 24, 32, 48px.

### Border Radius
*   **Small:** 6px (Badge-uri mici)
*   **Medium:** 10px (Input-uri, Butoane standard)
*   **Large:** 16px (Carduri standard)
*   **Extra Large:** 24px (Carduri mari de prezentare - About page)
*   **Full:** 9999px (Badge-uri rotunde, Avatare)

### Shadows
Definite în `lib/theme.tsx` (`shadows.small`, `shadows.medium`, `shadows.large`).
*   Folosiți `...theme.shadows.medium` pentru carduri standard.

---

## 4. Componente (Components)

### Butoane (Buttons)
**Fișier:** `components/Button.tsx`

*   **Primary:** Fundal `theme.colors.secondary` (Orange) sau `theme.colors.primary` (Navy). Text Alb. Shadow small.
*   **Secondary/Outline:** Border 2px, fundal transparent.
*   **Ghost:** Fără fundal, doar text.
*   **Border Radius:** 8px (Standard), 14px (Hero).
*   **Padding:** Vertical 12-18px, Orizontal 24-36px.

### Carduri (Cards)

#### Post Cards (Community)
**Fișier:** `components/community/PostCard.tsx`
*   **Structură:**
    1.  **Header:** Avatar, Nume/Companie, Badge "Your Post" (dacă e cazul), Acțiuni (Save/Delete).
    2.  **Content:** Indicator Tip (Driver/Load), Ruta (Badge-uri Origin -> Dest), Descriere, Tag-uri (Data, Tonaj, Preț).
    3.  **Footer:** Statistici (Timp, Vizualizări), Butoane Contact (WhatsApp, Call, Email).
*   **Stil:** `borderRadius: 20`, `padding: 16`, `shadow`. Border colorat în funcție de tip (Secondary pentru Driver, Info pentru Load).

#### Lead Cards (Detalii)
**Fișier:** `components/leads/LeadDetailModal.tsx`
*   **Structură:**
    1.  **Company Card:** Avatar mare centrat, Nume, Locație, Industrie.
    2.  **Secțiuni:** Contact Info (Listă), Online Presence (Grid butoane), Locație, Note.
*   **Stil:** `borderRadius: 16`, `padding: 24`, `backgroundColor: theme.colors.surface`.

#### Feature/Value Cards (Web)
**Fișier:** `app/(web)/about.tsx` (exemplu)
*   **Structură:** Icon în container colorat, Titlu, Descriere.
*   **Stil:** `borderRadius: 24`, `padding: 28`, `borderWidth: 1`.

---

## 5. Structura Fișierelor (File Structure)

Unde găsiți elementele de brand:

| Element | Locație | Descriere |
| :--- | :--- | :--- |
| **Theme & Colors** | `lib/theme.tsx` | Definițiile centrale pentru culori, spațiere, umbre. |
| **Icons** | `lucide-react-native` | Setul standard de iconițe. |
| **Global Components** | `components/` | `Button.tsx`, `Card.tsx`, `Input.tsx`. |
| **Web Components** | `components/web/` | `WebFooter.tsx`, `WebHeader` (dacă există). |
| **Community** | `components/community/` | `PostCard.tsx`, `CommunityFeed.tsx`. |
| **Leads** | `components/leads/` | `LeadDetailModal.tsx`. |
| **Pages (Web)** | `app/(web)/` | `about.tsx`, `contact.tsx`, `pricing_web.tsx`. |
| **Assets** | `assets/images/` | Logo-uri, imagini de fundal, badge-uri store. |

## 6. Cum să construiești o pagină nouă (Web)

1.  **Container:** Folosește `ScrollView` cu `backgroundColor: theme.colors.background`.
2.  **Hero Section:**
    *   Background: `#0F172A` (Navy).
    *   Text: Centrat, Alb.
    *   Badge: Opțional, deasupra titlului.
    *   Butoane: Primary (Orange) + Secondary (Transparent cu border alb).
3.  **Content Sections:**
    *   `maxWidth: 1200`, `marginHorizontal: 'auto'`.
    *   Titluri de secțiune aliniate stânga sau centru.
    *   Folosește Grid-uri (`flexDirection: 'row', flexWrap: 'wrap'`) pentru carduri.
4.  **Footer:** Include `<WebFooter />` la final.

## 7. Cum să construiești un Card nou

1.  Importă `useTheme` din `@/lib/theme`.
2.  Folosește `theme.colors.card` pentru fundal.
3.  Adaugă `theme.shadows.medium` pentru elevație.
4.  Border Radius: `theme.borderRadius.lg` (16) sau `xl` (24).
5.  Padding: `24` sau `28`.
6.  Border: `1px` solid `theme.colors.border`.

```tsx
const { theme } = useTheme();

<View style={{
  backgroundColor: theme.colors.card,
  borderRadius: theme.borderRadius.lg,
  padding: 24,
  borderWidth: 1,
  borderColor: theme.colors.border,
  ...theme.shadows.medium
}}>
  {/* Content */}
</View>
```
