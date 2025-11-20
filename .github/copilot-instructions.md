# Truxel – Copilot Working Agreement

> Read every attachment/screenshot first, then plan your move. Keep answers short and point to the docs instead of rewriting them.

## Core Rules
- **Ask before touching Supabase schema, migrations, or edge functions.** No DB/infra edits without explicit approval.
- Keep working logic unless the user asks for a rewrite; prefer additive fixes guarded behind helpers/flags.
- Reference the exact file + reason for every change; respect scope hints (e.g., “search credits” means stay in that area).
- Read all screenshots/notes the user provides before coding.
- Follow **Plan → Execute → Verify**. Use the planning/todo tools when the task is more than trivial.
- Run tests/linters relevant to your edits or state why you skipped them. Quote the command you ran.
- Never push to GitHub unless the user literally says “github push” / “push la git”.

## Stack + Required Reading
- Expo Router + React Native (SDK 54), TypeScript, Zustand, i18next.
- Supabase (auth, RPCs, storage, edge functions) + n8n automations, RevenueCat + Stripe fallback.
- Safe native access must go through `utils/safeNativeModules.ts` and related services.
- Start with `docs/how_it_works/PROJECT_SUMMARY.md`, `DOCS_INDEX.md`, and `DOCUMENTATION_PACKAGE.md` for architecture, state charts, and ownership.

## Quick Doc Map
| Area | Start | Deep Dive |
| --- | --- | --- |
| Community feed | `how_it_works/TRUXEL_COMMUNITY_MASTER_PLAN.md` | `COMMUNITY_FEED_TECHNICAL_GUIDE.md`, `COMMUNITY_FEATURE_*` set |
| Leads & saved posts | `how_it_works/START_HERE.md` | `docs/archive/*LEADS*` |
| Monetization | `how_it_works/PRODUCTION_FEATURES_IMPLEMENTATION.md` | `MONETIZATION_GUIDE.md`, `STRIPE_IMPLEMENTATION_GUIDE.md`, `STRIPE_README.md`, `IMPLEMENTARE_REVENUECAT.md`, `STRIPE_PRICE_IDS_MAPPING.md`, `APP_STORE_CONNECT_SETUP.md`, `APPLE_IAP_COMPLETE_STATUS.md` |
| Automation & edge functions | `how_it_works/N8N_WEBHOOK_GUIDE.md` | `N8N_REALTIME_CHAT_GUIDE.md`, `N8N_WEBHOOKS_EAS_SETUP.md`, `N8N_WORKFLOW_COMPLETE_GUIDE.md`, `DEPLOY_EDGE_FUNCTIONS.md`, `FIRE_AND_FORGET_PATTERN.md` |
| Auth & OAuth | `OAUTH_IMPLEMENTATION.md` | `PLATFORM_SETUP_AUTH.md`, `GOOGLE_OAUTH_SETUP.md`, `OAUTH_AUDIT_COMPLETE.md` |
| Notifications | `NOTIFICATIONS_PLAN.md` | `CHAT_SUPPORT_*`, `REALTIME_CHAT_IMPLEMENTATION_COMPLETE.md` |
| Internationalization | `I18N_IMPLEMENTATION.md` | `DISTANCE_UNIT_IMPLEMENTATION.md` |
| Health checks | `IMPLEMENTATION_SUMMARY_2025_11_09.md` | `PROJECT_SUMMARY.md`, `SUMMARY.md`, `QUICK_TEST_GUIDE.md` |

## Workflow Expectations
1. Check TODOs/roadmaps before estimating work (`PROJECT_SUMMARY.md`, `TRUXEL_COMMUNITY_MASTER_PLAN.md`).
2. Confirm plan with the user when scope is ambiguous; do not sprint ahead without alignment.
3. Cite the doc that supports your decisions in every reply.
4. Respect file ownership—if someone just edited a file, avoid large refactors.
5. Surface risks/tech debt with pointers to follow-up docs.

## Safe Dev Practices
- All native modules must be wrapped via `utils/safeNativeModules.ts`; follow `services/nativeModulesService.ts` / `sessionService.ts` patterns for background work.
- Real-time stores must emit fresh array references (see `KNOWLEDGE_BASE.md` for the bookmark bug recap).
- Never bypass Supabase RLS; review `COMPLETE_PLATFORM_AUDIT.md` if you touch data access.
- Keep secrets in `.env` + `app.config.js`. Use `MISSING_EAS_VARIABLES.md` and `START_HERE.md` for env order; Stripe/RevenueCat IDs live in `STRIPE_PRICE_IDS_MAPPING.md` + `APPLE_IAP_COMPLETE_STATUS.md`.

## Communication & Summaries
- Mention what you tested (or why you couldn’t) and paste the command.
- Summaries stay under ~5 bullets, leading with outcomes, then risks/tests.
- When blocked, state the question, what you tried, and which doc you checked.

## Need Help?
- Marketing copy / positioning → `TRUXEL_MARKETING.md`
- Platform overviews / navigation → `DOCS_INDEX.md`
- History / context → `docs/archive/`

Stay focused, cite docs, and always ask before touching Supabase.
