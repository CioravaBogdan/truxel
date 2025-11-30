# N8N Webhook Configuration for EAS Builds

## Overview

Truxel uses N8N webhooks for:
1. **Search Automation** - Lead scraping workflow
2. **City Analytics** - Location tracking for database enrichment
3. **Chat Support** - AI-powered support responses

These webhooks are configured via environment variables to allow different URLs for development/production.

---

## 📋 Environment Variables Required

### Local Development (.env file):
```bash
# N8N Webhook URLs
EXPO_PUBLIC_N8N_SEARCH_WEBHOOK=https://n8n.byinfant.com/webhook/51f66c9a-0283-4711-b034-337c66e1bedd
EXPO_PUBLIC_N8N_CITY_WEBHOOK=https://n8n.byinfant.com/webhook/700ac3c5-d6aa-4e35-9181-39fe0f48d7bf
EXPO_PUBLIC_N8N_CHAT_WEBHOOK=https://n8n.byinfant.com/webhook/70100ffe-0d06-4cff-9ad1-b7001713ab5c
```

### EAS Build Secrets (Production):
```bash
TRUXEL_N8N_SEARCH_WEBHOOK=https://automation.truxel.io/webhook/51f66c9a-0283-4711-b034-337c66e1bedd
TRUXEL_N8N_CITY_WEBHOOK=https://automation.truxel.io/webhook/700ac3c5-d6aa-4e35-9181-39fe0f48d7bf
TRUXEL_N8N_CHAT_WEBHOOK=https://automation.truxel.io/webhook/70100ffe-0d06-4cff-9ad1-b7001713ab5c
```

---

## 🚀 Setting Up EAS Secrets

### Step 1: Add Secrets to EAS
Run these commands in terminal:

```bash
# N8N Search Webhook (Lead scraping)
eas secret:create --scope project --name TRUXEL_N8N_SEARCH_WEBHOOK --value https://automation.truxel.io/webhook/51f66c9a-0283-4711-b034-337c66e1bedd --type string

# N8N City Webhook (Location analytics)
eas secret:create --scope project --name TRUXEL_N8N_CITY_WEBHOOK --value https://automation.truxel.io/webhook/700ac3c5-d6aa-4e35-9181-39fe0f48d7bf --type string

# N8N Chat Webhook (Support AI)
eas secret:create --scope project --name TRUXEL_N8N_CHAT_WEBHOOK --value https://automation.truxel.io/webhook/70100ffe-0d06-4cff-9ad1-b7001713ab5c --type string
```

### Step 2: Verify Secrets
```bash
eas secret:list
```

You should see:
```
TRUXEL_N8N_SEARCH_WEBHOOK
TRUXEL_N8N_CITY_WEBHOOK
TRUXEL_N8N_CHAT_WEBHOOK
TRUXEL_SUPABASE_URL
TRUXEL_SUPABASE_ANON_KEY
TRUXEL_STRIPE_PUBLISHABLE_KEY
```

### Step 3: Build with Secrets
```bash
eas build --platform ios --profile production
```

EAS will automatically inject secrets into the build.

---

## 📂 Where These Are Used

### 1. Search Webhook (searchesService.ts)
```typescript
import Constants from 'expo-constants';

const WEBHOOK_URL = Constants.expoConfig?.extra?.n8nSearchWebhook || 
  'https://automation.truxel.io/webhook/51f66c9a-0283-4711-b034-337c66e1bedd';
```

**When triggered:**
- User initiates a search (Search tab)
- Sends keywords, location, user info to N8N
- N8N scrapes leads and stores in database

**Payload:**
```json
{
  "search_id": "uuid",
  "user_id": "uuid",
  "keywords": "logistics, transport",
  "latitude": 44.4268,
  "longitude": 26.1025,
  "address": "Bucharest, Romania",
  "radius": 10
}
```

### 2. City Webhook (cityService.ts)
```typescript
import Constants from 'expo-constants';

const webhookUrl = Constants.expoConfig?.extra?.n8nCityWebhook || 
  'https://automation.truxel.io/webhook/700ac3c5-d6aa-4e35-9181-39fe0f48d7bf';
```

**When triggered:**
- QuickPostBar: User posts "I'M AVAILABLE" or "I HAVE ROUTE"
- Sends location data for analytics and database enrichment

**Payload:**
```json
{
  "lat": 44.4268,
  "lng": 26.1025,
  "nearest_city_id": "bucharest",
  "nearest_city_name": "Bucharest",
  "distance": 0,
  "user_id": "uuid",
  "timestamp": "2025-11-09T12:00:00Z"
}
```

**Fire-and-Forget Pattern:**
- No `await`, returns immediately
- User doesn't wait for N8N response
- If N8N is down, app continues normally

### 3. Chat Webhook (chatService.ts)
```typescript
import Constants from 'expo-constants';

const N8N_WEBHOOK_URL = Constants.expoConfig?.extra?.n8nChatWebhook || 
  'https://automation.truxel.io/webhook/70100ffe-0d06-4cff-9ad1-b7001713ab5c';
```

**When triggered:**
- User sends message in ChatSupportModal (Profile tab)
- Sends message to N8N for AI processing

**Payload (GET request):**
```
GET https://automation.truxel.io/webhook/70100ffe-0d06-4cff-9ad1-b7001713ab5c?
  userId=uuid&
  userName=John Doe&
  message=I need help with search&
  platform=ios&
  timestamp=2025-11-09T12:00:00Z
```

**Expected Response:**
```json
{
  "success": true,
  "response": "AI-generated reply",
  "conversationId": "uuid"
}
```

---

## 🔒 Security Notes

### Why These Are Exposed (Client-Side):
1. **Public Webhooks**: N8N webhooks are designed to be publicly accessible
2. **No Sensitive Data**: Webhook URLs don't contain authentication secrets
3. **Rate Limiting**: N8N has built-in rate limiting per IP
4. **Input Validation**: N8N workflows validate all incoming data

### What IS Secret:
- ❌ Webhook URLs → Public (OK to expose)
- ✅ Supabase Anon Key → Public (RLS protects data)
- ✅ Stripe Publishable Key → Public (designed for client)
- 🔒 Stripe Secret Key → Server-only (Edge Functions)
- 🔒 Supabase Service Role → Server-only (Edge Functions)

---

## 🧪 Testing

### Local Development:
```bash
# Start app with local .env
npx expo start

# Test search webhook
# (Use Search tab, start a search)

# Test city webhook  
# (Use Community tab, post "I'M AVAILABLE")

# Test chat webhook
# (Use Profile tab, open chat support, send message)
```

### Production Build:
```bash
# Build with EAS secrets
eas build --platform ios --profile production

# Install TestFlight build
# Test all 3 webhook features
# Check N8N logs to verify webhooks received
```

---

## 🐛 Troubleshooting

### Webhook Not Firing:
1. Check `Constants.expoConfig?.extra` in debugger
2. Verify EAS secrets with `eas secret:list`
3. Check N8N webhook logs
4. Test webhook directly with curl:
```bash
curl -X POST https://automation.truxel.io/webhook/51f66c9a-0283-4711-b034-337c66e1bedd \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Fallback to Hardcoded URLs:
If env vars not found, code falls back to hardcoded production URLs:
```typescript
const URL = Constants.expoConfig?.extra?.n8nSearchWebhook || 
  'https://automation.truxel.io/webhook/51f66c9a-0283-4711-b034-337c66e1bedd';
```

This ensures app works even if secrets misconfigured.

---

## 📝 Checklist Before Build

- [ ] Created `.env` file with `EXPO_PUBLIC_N8N_*` variables
- [ ] Added N8N secrets to EAS: `eas secret:create`
- [ ] Verified secrets exist: `eas secret:list`
- [ ] Updated `app.config.js` to expose env vars in `extra`
- [ ] Updated services to use `Constants.expoConfig?.extra`
- [ ] Tested locally with `npx expo start`
- [ ] Ready for `eas build --platform ios --profile production`

---

## 🔗 Related Files

- **Config**: `app.config.js` (exposes env vars to app)
- **Services**:
  - `services/searchesService.ts` (search webhook)
  - `services/cityService.ts` (city webhook)
  - `services/chatService.ts` (chat webhook)
- **Documentation**:
  - `.github/copilot-instructions.md` (N8N fire-and-forget pattern)
  - `docs/CHAT_SUPPORT_INTEGRATION.md` (chat webhook details)
  - `docs/how_it_works/N8N_WEBHOOK_GUIDE.md` (N8N setup guide)

---

**Created:** November 9, 2025  
**For Build:** 8+  
**Status:** Ready for EAS secrets setup
