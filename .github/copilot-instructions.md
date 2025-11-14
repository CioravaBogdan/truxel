# Truxel – Copilot Working Agreement

> Always read this file before touching the codebase. Keep responses concise and point to the existing docs instead of restating them.

## 1. Collaboration Principles
1. **Do not delete or rewrite working logic unless the user explicitly requests it.** When in doubt, ask.
2. **Prefer additive changes.** Wrap fixes behind feature flags or helper functions when possible.
3. **Explain every modification.** Reference files/lines and why the change is required.
4. **Respect scope.** If the user mentions “search credits”, do not change community UI unless instructed.
5. **Test or explain why you cannot.** Say exactly which command you ran (or why it was skipped).

## 2. Core Stack Overview
- Expo Router + React Native (Expo SDK 54), TypeScript, Zustand, i18next.
- Supabase (auth, SQL tables, RPCs, Storage, Edge Functions) with n8n automations.
- RevenueCat (native + web) + Stripe fallback.
- Safe native wrappers live in `utils/safeNativeModules.ts` and must be used for Linking, Notifications, Location, etc.

Detailed architecture, component maps, and state charts live in:
- `docs/how_it_works/PROJECT_SUMMARY.md`
- `docs/how_it_works/DOCUMENTATION_PACKAGE.md`
- `docs/how_it_works/DOCS_INDEX.md`

## 3. High-Level Workflows & References
| Area | Start Here | Deeper Dive |
| --- | --- | --- |
| **Community feed + templates** | `docs/how_it_works/TRUXEL_COMMUNITY_MASTER_PLAN.md` | `docs/how_it_works/COMMUNITY_FEATURE_FINAL_PLAN.md`, `docs/how_it_works/COMMUNITY_FEATURE_IMPLEMENTATION_PLAN.md`, `docs/how_it_works/COMMUNITY_FEATURE_SETUP.md`, `docs/how_it_works/COMMUNITY_FILTER_IMPLEMENTATION_STATUS.md`, `docs/how_it_works/COMMUNITY_FEED_TECHNICAL_GUIDE.md` |
| **Lead management & saved posts** | `docs/how_it_works/START_HERE.md` | Archived audits under `docs/archive/*LEADS*` |
| **Stripe / RevenueCat / App Stores** | `docs/how_it_works/PRODUCTION_FEATURES_IMPLEMENTATION.md` | `docs/how_it_works/STRIPE_IMPLEMENTATION_GUIDE.md`, `docs/how_it_works/STRIPE_README.md`, `docs/how_it_works/STRIPE_PRICE_IDS_MAPPING.md`, `docs/how_it_works/APP_STORE_CONNECT_SETUP.md`, `docs/how_it_works/APPLE_IAP_COMPLETE_STATUS.md`, `docs/how_it_works/IMPLEMENTARE_REVENUECAT.md`, `docs/how_it_works/GOOGLE_PLAY_CONSOLE_SETUP.md` |
| **Automation (n8n, Edge Functions)** | `docs/how_it_works/N8N_WEBHOOK_GUIDE.md` | `docs/how_it_works/N8N_REALTIME_CHAT_GUIDE.md`, `docs/how_it_works/N8N_WEBHOOKS_EAS_SETUP.md`, `docs/how_it_works/N8N_WORKFLOW_COMPLETE_GUIDE.md`, `docs/how_it_works/DEPLOY_EDGE_FUNCTIONS.md`, `docs/how_it_works/FIRE_AND_FORGET_PATTERN.md` |
| **Auth & OAuth** | `docs/how_it_works/OAUTH_IMPLEMENTATION.md` | `docs/how_it_works/GOOGLE_OAUTH_SETUP.md`, `docs/how_it_works/OAUTH_AUDIT_COMPLETE.md` |
| **Internationalization & Distance Units** | `docs/how_it_works/I18N_IMPLEMENTATION.md` | `docs/how_it_works/DISTANCE_UNIT_IMPLEMENTATION.md` |
| **Support Chat** | `docs/how_it_works/CHAT_SUPPORT_INTEGRATION.md` | `docs/how_it_works/CHAT_SUPPORT_FINAL_SUMMARY.md`, `docs/how_it_works/REALTIME_CHAT_IMPLEMENTATION_COMPLETE.md` |
| **Marketing & positioning** | `docs/how_it_works/TRUXEL_MARKETING.md` | Use for copywriting and KPI references |
| **Quick health checks** | `docs/how_it_works/IMPLEMENTATION_SUMMARY_2025_11_09.md` | `docs/how_it_works/PROJECT_SUMMARY.md`, `docs/how_it_works/SUMMARY.md`, `docs/how_it_works/QUICK_TEST_GUIDE.md` |
| **Special cases / history** | `docs/how_it_works/KNOWLEDGE_BASE.md` | Archives live under `docs/archive/` |

## 4. Environment & Credentials
> Never commit secrets. Use `.env` + `app.config.js` for runtime values.

- Supabase: see `docs/how_it_works/MISSING_EAS_VARIABLES.md` for required env var names and `docs/how_it_works/START_HERE.md` for setup order.
- Stripe & RevenueCat: product/price IDs are in `docs/how_it_works/STRIPE_PRICE_IDS_MAPPING.md` and `docs/how_it_works/APPLE_IAP_COMPLETE_STATUS.md`.
- n8n webhooks: documented in `docs/how_it_works/N8N_WEBHOOK_GUIDE.md`.

## 5. Workflow Expectations
1. **Read TODO/roadmap** (`docs/how_it_works/PROJECT_SUMMARY.md` + `docs/how_it_works/TRUXEL_COMMUNITY_MASTER_PLAN.md`) before scoping work.
2. **Plan > Execute > Verify.** Use the planning tool for multi-step tasks unless trivial.
3. **Mention docs in replies** when guidance comes from them.
4. **Respect file ownership.** If the user has touched a file recently (see git diff), avoid massive rewrites.
5. **Surface risks.** If you see tech debt (e.g., duplicated logic across community + leads), note it with doc references for follow-up.

## 6. Safe Dev Practices
- All native calls go through `utils/safeNativeModules.ts` (crash history summarized in `docs/how_it_works/IOS_CRASH_FIXES_SUMMARY.md`).
- Use `services/nativeModulesService.ts` and `services/sessionService.ts` patterns when adding new background tasks.
- Real-time features must emit fresh array references in Zustand stores (bookmark issue recap in `docs/how_it_works/KNOWLEDGE_BASE.md`).
- Never bypass Supabase RLS assumptions; consult `docs/how_it_works/COMPLETE_PLATFORM_AUDIT.md` if you need table policies.

## 7. Pull Request & Summary Style
- Reference relevant docs in PR descriptions (e.g., “see `docs/how_it_works/STRIPE_IMPLEMENTATION_GUIDE.md#web-flow`”).
- Keep summaries under ~5 bullet points; lead with outcomes, then risks/tests.

## 8. Need Help?
- For business/marketing language: `docs/how_it_works/TRUXEL_MARKETING.md`
- For platform-wide questions: `docs/how_it_works/DOCS_INDEX.md`
- For historical issues: search `docs/archive/`

_Total lines: < 200_
