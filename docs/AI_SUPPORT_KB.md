# Truxel – Ghid complet pentru AI Suport (LLM-ready)

Document de cunostinte pentru agentul AI de suport Truxel (mobile + web). Raspunsurile trebuie sa fie concise, dar sa includa pasii de rezolvare, contextul tehnic, si cand e cazul sa indrume catre suport uman.

## Identitate & scop
- Produs: Truxel – app pentru soferi/dispeceri: cautare companii/lead-uri locale, management lead-uri, comunitate in timp real, abonamente/credite, notificari locatie.
- Platforme: iOS/Android (Expo React Native, Expo Router), Web (Expo web bundle).
- Ton suport: prietenos, practic; mentioneaza planuri Standard/Pro/Premium + pachete de cautari; daca nu se poate rezolva automat, directioneaza catre suport uman.

## Stack pe scurt
- Frontend: Expo RN 0.81, Expo SDK 54, TypeScript, Zustand (store), i18n, theming.
- Backend: Supabase (Auth, Postgres, RLS, Realtime, Storage, Edge Functions), RPC-uri custom (credite cautari, post limits etc.).
- Plati: RevenueCat (react-native-purchases pe mobil, purchases-js pe web), Stripe prin Edge Functions (checkout, manage-subscription, validate-coupon).
- Automatizari: n8n webhooks (cautari, logare locatie, chat).
- Siguranta native: toate apelurile sensibile trec prin `utils/safeNativeModules.ts` (Linking, WhatsApp, email, phone, GPS, notifications).

## Modele de date (cheie)
- `profiles`: user_id, email, full_name, phone_number, company_name, truck_type, search_radius_km, preferred_industries[], preferred_language, preferred_distance_unit (km/mi), expo_push_token, last_known_city/lat/lng, subscription_tier/status, stripe ids, created_at/updated_at.
- `searches`: user_id, search_keywords, address, lat/lng, radius_km, status (pending/completed/failed), webhook_sent_at, completed_at, results_count, error_message.
- `leads`: date companie globale (company_name, contact_person_name, email, phone/whatsapp, social, address/city/country, geo, industry, ai_match_score, match_reasons, google URLs, created/updated).
- `user_leads`: relatie user-lead (status, user_notes, saved_at, last_contacted_at, source_type search/community, source_id, source_search_id).
- `subscription_tiers`, `additional_search_packs`, `transactions`: monetizare.
- `community_posts`: post_type DRIVER_AVAILABLE / LOAD_AVAILABLE, origin/destination, metadata (truck/cargo), contact_phone/whatsapp, expires_at, view/contact counts.
- `community_interactions`: view, interested, contacted, saved.
- `support_conversations`, `support_messages`: chat RTC suport.
- `cities`: referinte geo pentru cautari/filtre.

## Autentificare & sesiuni
- Email/parola: `authService.signUp/signIn`, profile creat prin trigger DB, RevenueCat init la login.
- Google OAuth: browser flow; redirect web = origin, mobil = `truxel://auth/callback`; skipBrowserRedirect pe mobil.
- Apple Sign-In: doar pe build dev/EAS (nu Expo Go); verifica disponibilitatea iOS 13+.
- Logout: intai RevenueCat logout, apoi supabase.signOut; ignora erorile “session missing”.
- Session refresh: `sessionService` verifica la 5 min, reimprospateaza daca expira in <5 min si actualizeaza authStore.

## Credite de cautare & flux “Search”
- Tab `app/(tabs)/search.tsx`: 1-5 keywords separate prin virgula; auto GPS la mount; buton “Use current location”; radius din profil (default 5 km).
- Validari: >5 keywords = eroare; lipsa coords = eroare; fara credite = sugereaza achizitie abonament/pachet.
- Consum credite: `searchesService.initiateSearch` -> RPC `consume_search_credit` inainte de insert; daca webhook n8n esueaza, marcheaza `searches.status=failed` si `error_message`.
- n8n webhook payload: `search_id, user_id, keywords, address, lat, lng, radius_km, tier, features, credit_source`; URL din `n8nSearchWebhook` (env).
- Realtime: subscribes pe `searches` update pentru user; la `completed`/`failed` trimite local notification (safeScheduleNotification).
- Quick Search: foloseste `profile.preferred_industries` concatenate.
- FAQ rapide:
  - “Search ramane pending”: asteptare n8n; daca trece in failed, user poate reinitia (credit deja consumat).
  - “Nu am credite”: recomanda abonament/pachet; Expo Go nu suporta IAP, doar web Stripe.

## Lead management
- Salvare: `leadsService.createLead` face upsert pe phone (dedup global), apoi user_leads cu status/user_notes/source.
- Statusuri: new/contacted/in_progress/won/lost; last_contacted_at se updateaza la contact (email/whatsapp/phone) prin servicii.
- Deduplicare: `isDuplicateLead` verifica phone sau email+company pentru user; `convertPostToLead` arunca `DUPLICATE_LEAD` -> UI sa arate alerta.
- Export: `exportLeadsToCSV` cu campuri standard.
- My Book: `promoteLeadToMyBook` schimba source_type la community pentru lead deja salvat.
- Actiuni contact: intotdeauna prin `safeOpenEmail/WhatsApp/Phone`; daca nu reuseste, arata userMessage si sugereaza sa incerce alt canal.

## Comunitate
- Postari: DRIVER_AVAILABLE / LOAD_AVAILABLE cu template-uri predefinite; TTL setat in DB (expires_at), status active/expired/cancelled.
- Limite & anti-spam: RPC `can_user_post` (per tier zi/luna, active concurrente), `check_duplicate_post` blocheaza post similar 15 min.
- Interactiuni: `record_community_interaction` pentru view/saved/contacted; saved posts apar in tab Hot Leads din Leads si in tab Saved din Community.
- Feed: filtre pe origin_country/name, origin_city ilike, dest_city; pagination cursor pe created_at; initializeaza filtre cu GPS via `cityService.getCurrentLocationCity`.
- Conversie in lead: `convertPostToLead` creeaza lead + user_leads source_type=community; dedup inclus.
- Statistici: `getCommunityStats` (total/active posts, conversions, contacts).

## Notificari & locatie
- `notificationService`: initializeaza permisii, Expo push token salvat in profil; polling la 7 min pentru postari comunitate cu match pe `profiles.last_known_city`; trimite local notification “New load in <city>”.
- `cityService`: cautari fuzzy in `cities`, popular cities, GPS + reverse geocode cu safe wrappers, nearest major city calc (Haversine), trimite telemetry la webhook oras (fire-and-forget).

## Plati, abonamente, credite
- RevenueCat (mobil & web):
  - Chei in app.config.js: `revenueCatIosKey`, `revenueCatAndroidKey`, `revenueCatWebKey`.
  - Entitlements: `standard_access`, `pro_access`, `fleet_manager_access`, `search_credits`; `getUserTier` map: pro/fleet/standard/trial fallback.
  - Offerings: filtru valuta EUR/USD pe web; fallback afiseaza toate daca nu exista match; Expo Go nu suporta RevenueCat.
  - Cumparare/refacere: `purchasePackage`, `restorePurchases`, `getCustomerInfo`; cer `userId` pe web.
- Stripe (Edge Functions):
  - Functions: `create-checkout-session`, `manage-subscription` (cancel/reactivate/upgrade/downgrade), `validate-coupon`, `stripe-redirect`.
  - `stripeService.getAvailableSubscriptionTiers / getAvailableSearchPacks` folosesc Supabase REST; necesita doar anon key.
  - Checkout link (web) foloseste success/cancel HTML redirect; necesita accessToken (user JWT).
- Credite cautare: RPC `get_total_search_credits` intoarce purchased + subscription + total; consum prin `consume_search_credit`.

## Suport & chat
- Chat RTC intern: tabele `support_conversations/messages`, Realtime subscribe `conversation:<id>`; status open/waiting_support/waiting_user/resolved/closed; unread_count reset cu `markAsRead`; `getOrCreateConversation` reia thread existent.
- n8n Chat webhook: `chatService.sendMessage` la `n8nChatWebhook` (env) cu context user (id, nume, email, limba, tier, device); raspuns instant daca n8n returneaza json.response, altfel mesaj ca vor raspunde pe email/notificare.
- Template-uri rapide: pricing_question, feature_request, bug_report, account_help, subscription_help (chei i18n).

## Web landing
- `(web)` pages: home, features, pricing, about, contact, privacy, terms, refund, cookies, data-deletion. Web checkout Stripe/RevenueCat JS.

## Mediu & variabile (prefix EXPO/Constants)
- `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `TRUXEL_REVENUECAT_WEB_KEY` (+ iOS/Android keys in app.config.js)
- `EXPO_PUBLIC_N8N_SEARCH_WEBHOOK`, `EXPO_PUBLIC_N8N_CITY_WEBHOOK`, `EXPO_PUBLIC_N8N_CHAT_WEBHOOK`
- Optional Google Maps API keys (app.json iOS/Android) pentru harti.

## Troubleshooting & raspunsuri gata de folosit
- Fara credite cautare: “Nu mai ai cautari disponibile. Alege un abonament sau cumpara un pachet de cautari din ecranul Pricing. In Expo Go nu merg IAP; foloseste build EAS sau web pentru Stripe.”
- Search blocat/fail: verifica conexiune, asteapta update Realtime; daca status=failed, retry; webhook n8n poate fi jos.
- RevenueCat nu merge: pe Expo Go nu functioneaza; asigura-te ca app este build EAS si ca cheile RevenueCat sunt setate; oferta curenta setata in dashboard.
- Stripe erroare checkout: user trebuie logat; accessToken lipsa -> reia login; verifica conexiune HTTPS.
- Apple/Google login: Apple doar pe iOS 13+ si build dev; Google merge prin browser (web/mobil).
- Locatie esuata: cere permisiuni din setari; Android foloseste Low accuracy rapid, iOS Balanced; daca reverse geocode esueaza, user poate introduce manual adresa.
- Comunitate: “Nu pot posta” -> limita tier/zi/luna sau post duplicat in ultimele 15 min; verificati `can_user_post` reason.
- Duplicat lead la convertire: mesaj “Lead deja salvat” (cod DUPLICATE_LEAD); sugereaza deschidere lead existent in My Book.
- Notificari lipsa: verifica permisiuni push si ca `last_known_city` e setat in profil; app trebuie deschisa o data dupa login pentru init.

## Stil raspuns suport (LLM)
- Intai clarifica problema in 1-2 intrebari scurte daca lipseste context (ex: “Ce mesaj de eroare vezi?”).
- Ofera pasii concreti (max 4-5 bullets), mentioneaza restrictii platforma (Expo Go vs build/EAS) si service relevant (RevenueCat/Stripe/n8n).
- Daca tine de configurare chei/cont, redirectioneaza catre suport uman dupa rezumarea diagnostic-ului.
