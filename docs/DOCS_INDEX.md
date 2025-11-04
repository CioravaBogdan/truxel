# 📚 Documentație Truxel - Index

## � Structură Documentație

- **Root (`/docs`)**: Start rapid, summary-uri, changelog
- **[How It Works](./how_it_works/)**: Ghiduri tehnice active (implementare, integrări)
- **[Archive](./archive/)**: Documente istorice, planuri completate, migrații

---

## � Quick Start - Citește Primele

### Pentru Începători:
1. **[START_HERE.md](./START_HERE.md)** ⭐ Prima dată cu Truxel?
   - Overview aplicație
   - Setup rapid
   - First steps

2. **[QUICKSTART.md](./QUICKSTART.md)** - Development setup
   - Prerequisites
   - Installation
   - Configuration
   - Running the app

3. **[QUICK_START.md](./QUICK_START.md)** - Troubleshooting rapid
   - Rezolvare erori comune
   - 5 minute quick fix
   - Checklist verificare

---

## 📖 Documentation Hub

### 🔧 Technical Guides (Active)
👉 **[How It Works Folder](./how_it_works/README.md)**

**Core Documentation:**
- **[COMMUNITY_FEED_TECHNICAL_GUIDE.md](./how_it_works/COMMUNITY_FEED_TECHNICAL_GUIDE.md)** ⭐ MASTER GUIDE
  - Complete Community Feed reference
  - Architecture (UI → Store → Service → DB)
  - Database schema + RLS policies
  - All data flows and interactions

**Feature Guides:**
- [FIRE_AND_FORGET_PATTERN.md](./how_it_works/FIRE_AND_FORGET_PATTERN.md) - N8N webhooks
- [I18N_IMPLEMENTATION.md](./how_it_works/I18N_IMPLEMENTATION.md) - Translations (6 languages)
- [N8N_WEBHOOK_GUIDE.md](./how_it_works/N8N_WEBHOOK_GUIDE.md) - N8N automations
- [OAUTH_IMPLEMENTATION.md](./how_it_works/OAUTH_IMPLEMENTATION.md) - Google OAuth

**Infrastructure:**
- [DEPLOY_EDGE_FUNCTIONS.md](./how_it_works/DEPLOY_EDGE_FUNCTIONS.md) - Supabase functions
- [GOOGLE_OAUTH_SETUP.md](./how_it_works/GOOGLE_OAUTH_SETUP.md) - OAuth console setup
- [STRIPE_IMPLEMENTATION_GUIDE.md](./how_it_works/STRIPE_IMPLEMENTATION_GUIDE.md) - Payments
- [STRIPE_README.md](./how_it_works/STRIPE_README.md) - Stripe quick reference
- [SUBSCRIPTION_MANAGEMENT.md](./how_it_works/SUBSCRIPTION_MANAGEMENT.md) - Subscription tiers
- [TRUXEL_COMMUNITY_MASTER_PLAN.md](./how_it_works/TRUXEL_COMMUNITY_MASTER_PLAN.md) - Roadmap
- [WINDOWS_SETUP.md](./how_it_works/WINDOWS_SETUP.md) - Windows dev environment

### 📊 Project Overview
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - High-level overview
- **[SUMMARY.md](./SUMMARY.md)** - Current status
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history
- **[DOCUMENTATION_PACKAGE.md](./DOCUMENTATION_PACKAGE.md)** - Docs structure

### 📦 Archive (Historical)
👉 **[Archive Folder](./archive/README.md)**

Completed plans, old checklists, implemented features (historical reference only)

---

## 🎯 Găsește Documentul Potrivit:

| Situație | Document Recomandat |
|----------|---------------------|
| 🆕 **Prima dată cu Truxel** | [START_HERE.md](./START_HERE.md) |
| 🪟 **Setup pe Windows** | [how_it_works/WINDOWS_SETUP.md](./how_it_works/WINDOWS_SETUP.md) |
| ❌ **Eroare la pornire** | [QUICK_START.md](./QUICK_START.md) |
| 🔍 **Înțeleg Community Feed** | [how_it_works/COMMUNITY_FEED_TECHNICAL_GUIDE.md](./how_it_works/COMMUNITY_FEED_TECHNICAL_GUIDE.md) |
| 💳 **Stripe integration** | [how_it_works/STRIPE_IMPLEMENTATION_GUIDE.md](./how_it_works/STRIPE_IMPLEMENTATION_GUIDE.md) |
| 🌐 **Translations** | [how_it_works/I18N_IMPLEMENTATION.md](./how_it_works/I18N_IMPLEMENTATION.md) |
| � **OAuth setup** | [how_it_works/GOOGLE_OAUTH_SETUP.md](./how_it_works/GOOGLE_OAUTH_SETUP.md) |
| 🔌 **N8N webhooks** | [how_it_works/N8N_WEBHOOK_GUIDE.md](./how_it_works/N8N_WEBHOOK_GUIDE.md) |
| ☁️ **Deploy functions** | [how_it_works/DEPLOY_EDGE_FUNCTIONS.md](./how_it_works/DEPLOY_EDGE_FUNCTIONS.md) |
| 📊 **Project status** | [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) |
| 📝 **Version history** | [CHANGELOG.md](./CHANGELOG.md) |

---

## ⚡ Start Rapid - 30 secunde:

```powershell
# 1. Navighează în proiect
cd e:\truxel

# 2. Instalează dependencies
npm install

# 3. Configurează .env cu credențiale Supabase
# (Vezi QUICKSTART.md pentru detalii)

# 4. Pornește aplicația
npx expo start
```

**Nu funcționează?** 👉 [QUICK_START.md](./QUICK_START.md)

---

## 🆘 Probleme Comune:

### "package.json does not exist"
➡️ **Cauză:** Ești în directorul greșit  
➡️ **Soluție:** [QUICK_START.md](./QUICK_START.md) - Verifică path-ul

### "Supabase connection error"
➡️ **Cauză:** Lipsesc credențiale în .env  
➡️ **Soluție:** [QUICKSTART.md](./QUICKSTART.md) - Configurare environment

### "Metro bundler errors"
➡️ **Cauză:** Cache corupt  
➡️ **Soluție:** `npx expo start --clear` sau vezi [how_it_works/WINDOWS_SETUP.md](./how_it_works/WINDOWS_SETUP.md)

### "How does Community Feed work?"
➡️ **Soluție:** [how_it_works/COMMUNITY_FEED_TECHNICAL_GUIDE.md](./how_it_works/COMMUNITY_FEED_TECHNICAL_GUIDE.md) - Complete guide

### "Need to deploy Edge Functions?"
➡️ **Soluție:** [how_it_works/DEPLOY_EDGE_FUNCTIONS.md](./how_it_works/DEPLOY_EDGE_FUNCTIONS.md)

---

## 📞 Suport

**Documentație completă:** Citește documentele din [how_it_works/](./how_it_works/)  
**Issues GitHub:** [Raportează probleme](https://github.com/CioravaBogdan/truxel/issues)  
**Email:** office@infant.ro

---

## ✅ Checklist Prima Rulare:

- [ ] Am citit [START_HERE.md](./START_HERE.md) sau [QUICKSTART.md](./QUICKSTART.md)
- [ ] Sunt în directorul corect (văd package.json)
- [ ] Am rulat `npm install`
- [ ] Am configurat `.env` cu credențiale Supabase (URL + Anon Key)
- [ ] Am Node.js instalat
- [ ] Am rulat `npx expo start`

**Totul bifat?** Aplicația ar trebui să pornească! 🚀

Pentru detalii tehnice despre cum funcționează sistemul, vezi [how_it_works/](./how_it_works/)

---

**Ultima Actualizare:** 4 Noiembrie 2025  
**Versiune:** 2.0 - Reorganized with how_it_works & archive structure
