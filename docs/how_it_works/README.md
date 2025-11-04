# How It Works - Technical Documentation

This folder contains **active technical documentation** explaining how Truxel's key features work.

## 📚 Documentation Index

### Core System Documentation

#### **COMMUNITY_FEED_TECHNICAL_GUIDE.md** ⭐ MASTER GUIDE
Complete technical reference for the Community Feed system:
- Architecture (UI → Store → Service → Database)
- Database schema and RLS policies
- Zustand state management
- Service layer implementation
- GPS filtering and location
- User interactions (WhatsApp, Email, Call)
- Complete data flows
- Performance optimizations
- Debugging guide

**Use this for**: Understanding Community Feed at every level

---

### Feature-Specific Guides

#### **FIRE_AND_FORGET_PATTERN.md**
N8N webhook integration pattern:
- Why fire-and-forget is critical
- Implementation examples
- When to use vs when NOT to use
- Analytics webhook best practices

**Use this for**: Integrating non-blocking webhooks

#### **I18N_IMPLEMENTATION.md**
Internationalization system:
- Translation key structure
- Language files (en, ro, pl, tr, lt, es)
- Component usage patterns
- Language switching logic

**Use this for**: Adding translations, supporting new languages

#### **N8N_WEBHOOK_GUIDE.md**
N8N automation integration:
- Webhook endpoints setup
- Data payload formats
- Error handling
- Use cases (analytics, city auto-population)

**Use this for**: Setting up N8N automations

#### **OAUTH_IMPLEMENTATION.md**
Google OAuth authentication:
- Setup process
- Token management
- Error handling
- Security considerations

**Use this for**: Understanding/modifying OAuth flow

---

### Infrastructure & Setup

#### **DEPLOY_EDGE_FUNCTIONS.md**
Supabase Edge Functions deployment:
- Function structure
- Environment variables
- Deployment commands
- Troubleshooting

**Use this for**: Deploying Stripe webhooks, serverless functions

#### **GOOGLE_OAUTH_SETUP.md**
Google Cloud Console configuration:
- OAuth consent screen
- Credentials setup
- Redirect URIs
- API scopes

**Use this for**: Setting up Google OAuth from scratch

#### **STRIPE_IMPLEMENTATION_GUIDE.md**
Stripe payment integration:
- Subscription setup
- One-time payments
- Webhook handling
- Testing procedures

**Use this for**: Understanding payment flows

#### **STRIPE_README.md**
Stripe quick reference:
- Price IDs
- Product IDs
- Common operations
- CLI commands

**Use this for**: Quick Stripe lookups

#### **SUBSCRIPTION_MANAGEMENT.md**
Subscription tier management:
- Tier definitions (trial, standard, pro, premium)
- Limit enforcement
- Upgrade/downgrade flows
- Database queries

**Use this for**: Managing subscription logic

#### **TRUXEL_COMMUNITY_MASTER_PLAN.md**
Community feature master plan:
- Feature roadmap
- Architecture decisions
- Implementation phases
- Future enhancements

**Use this for**: Long-term community feature planning

#### **WINDOWS_SETUP.md**
Development environment setup on Windows:
- Prerequisites
- Installation steps
- Common issues
- Troubleshooting

**Use this for**: Onboarding new Windows developers

---

## 🗂️ Organization

- **Active Docs** (this folder): Current implementation references
- **Archive** (`../archive/`): Completed tasks, old plans, deprecated guides
- **Root Docs** (`../`): Quick starts, summaries, changelogs

---

## 📝 Maintenance Guidelines

### When to Update

1. **Feature Changes**: Update relevant guide immediately
2. **New Features**: Create new guide or update COMMUNITY_FEED_TECHNICAL_GUIDE.md
3. **Breaking Changes**: Update CHANGELOG.md + affected guides
4. **Deprecation**: Move to archive, note in CHANGELOG.md

### Documentation Standards

- Use Markdown formatting
- Include code examples
- Add "Last Updated" date
- Explain **why**, not just **how**
- Keep diagrams up-to-date
- Link related documents

---

**Last Updated**: November 4, 2025  
**Maintained By**: Truxel Development Team
