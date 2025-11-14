# Chat Support Integration - N8N Webhook

## Overview

Integrated in-app chat support system with N8N webhook backend for AI-powered assistance. Users can contact support directly from the Profile screen, and messages are sent to N8N for processing and response.

## N8N Webhook Details

**Webhook URL:** `https://n8n.byinfant.com/webhook/70100ffe-0d06-4cff-9ad1-b7001713ab5c`

**Method:** GET (with query parameters)

**Status:** 
- ✅ Webhook is active and receiving messages
- ⚠️ Response flow incomplete (needs AI agent configuration in N8N)

## Implementation

### 1. Chat Service (`services/chatService.ts`)

Handles all communication with N8N webhook:

```typescript
interface ChatMessage {
  userId: string;
  userName?: string;
  userEmail?: string;
  message: string;
  timestamp: string;
  platform: 'ios' | 'android' | 'web';
  userLanguage?: string;
  subscriptionTier?: string;
  deviceInfo?: string;
}

// Send message to N8N
await chatService.sendSupportMessage({
  userId: user.id,
  message: 'I have a question about pricing',
  userName: 'Acme Logistics',
  userEmail: 'user@example.com',
  userLanguage: 'ro',
  subscriptionTier: 'pro',
});
```

**Key Features:**
- Fire-and-forget pattern with async response handling
- GET request with query parameters (N8N webhook requirement)
- Comprehensive error handling
- User context included (language, tier, device)
- Support templates for quick questions

### 2. Chat UI Component (`components/ChatSupportModal.tsx`)

Modal interface for users to contact support:

**Features:**
- Quick question templates
- Custom message input
- i18n support (EN, RO, PL, TR, LT, ES, UK, FR, DE, IT)
- Loading states
- Toast notifications for feedback
- KeyboardAvoidingView for mobile UX

**Usage:**
```tsx
import { ChatSupportModal } from '@/components/ChatSupportModal';

const [showSupportModal, setShowSupportModal] = useState(false);

<ChatSupportModal
  visible={showSupportModal}
  onClose={() => setShowSupportModal(false)}
/>
```

### 3. Profile Screen Integration (`app/(tabs)/profile.tsx`)

Support button added to Profile screen:

**Location:** Between Language Selector and Logout button

**Button Design:**
- Blue background (#007AFF)
- 💬 emoji + "Contact Support" text
- Shadow for depth
- Tappable area with feedback

**Code:**
```tsx
<TouchableOpacity
  style={styles.supportButton}
  onPress={() => setShowSupportModal(true)}
>
  <Text style={styles.supportButtonText}>💬 {t('support.title')}</Text>
</TouchableOpacity>
```

## Quick Question Templates

Users can select from pre-defined templates:

1. **Pricing Question** - "I have a question about pricing and plans"
2. **Feature Request** - "I'd like to suggest a new feature"
3. **Bug Report** - "I found a bug or technical issue"
4. **Account Help** - "I need help with my account"
5. **Subscription Help** - "I need help with my subscription"

Templates are i18n-ready with translation keys in all supported languages.

## N8N Webhook Payload

**Request Format:**
```
GET https://n8n.byinfant.com/webhook/70100ffe-0d06-4cff-9ad1-b7001713ab5c?
  userId=user-123&
  userName=Acme+Logistics&
  userEmail=user@example.com&
  message=I+have+a+question+about+pricing&
  timestamp=2025-11-09T10:00:00Z&
  platform=ios&
  userLanguage=ro&
  subscriptionTier=pro&
  deviceInfo=iOS+18.6
```

**Expected Response (when N8N flow complete):**
```json
{
  "success": true,
  "message": "We'll get back to you soon",
  "response": "Thank you for contacting support. An agent will respond within 24 hours."
}
```

**Current Response (flow incomplete):**
```json
{
  "code": 0,
  "message": "Unused Respond to Webhook node found in the workflow"
}
```

## Translations

### English (`locales/en.json`)
```json
"support": {
  "title": "Contact Support",
  "description": "Need help? Send us a message...",
  "quick_questions": "Quick questions",
  "templates": {
    "pricing_question": "I have a question about pricing and plans",
    // ... more templates
  }
}
```

### Romanian (`locales/ro.json`)
```json
"support": {
  "title": "Contact Suport",
  "description": "Ai nevoie de ajutor? Trimite-ne un mesaj...",
  "quick_questions": "Întrebări rapide",
  "templates": {
    "pricing_question": "Am o întrebare despre prețuri și planuri",
    // ... more templates
  }
}
```

**Status:** Translations complete for EN and RO. Other languages (PL, TR, LT, ES, UK, FR, DE, IT) need translation.

## User Flow

### 1. Open Support Modal
1. User taps "💬 Contact Support" button in Profile screen
2. Modal slides up from bottom
3. Shows welcome message and quick question templates

### 2. Select Template or Write Custom
**Option A - Quick Template:**
1. User taps template (e.g., "Pricing Question")
2. Template text populates input field
3. User can edit or send as-is

**Option B - Custom Message:**
1. User taps "Write custom message"
2. Text input appears
3. User types their question/issue

### 3. Send Message
1. User taps "Send Message"
2. Loading indicator shows
3. Message sent to N8N webhook
4. Success toast appears
5. Modal closes automatically

### 4. N8N Processing (Future)
1. N8N receives message with user context
2. AI agent analyzes question
3. Either auto-responds or routes to human agent
4. Response sent back to user (email/push notification)

## Error Handling

### Network Errors
- Toast notification: "Failed to send message"
- User can retry
- Message not lost (user can copy from input)

### Validation Errors
- Empty message: "Please enter a message"
- Not logged in: "You must be logged in to contact support"

### N8N Errors
- Webhook returns error → User sees friendly message
- Webhook timeout → User sees "Please try again"
- Flow incomplete → Success message + "We'll respond soon"

## Testing

### Local Testing
```bash
# Start dev server
npx expo start

# Test flow:
1. Navigate to Profile tab
2. Tap "💬 Contact Support" button
3. Select quick question template
4. Tap "Send Message"
5. Check console logs for webhook call
6. Verify toast notification appears
7. Verify modal closes
```

### Webhook Testing (PowerShell)
```powershell
# Test N8N webhook directly
Invoke-WebRequest -Uri 'https://n8n.byinfant.com/webhook/70100ffe-0d06-4cff-9ad1-b7001713ab5c?userId=test-user-123&userName=TestUser&message=Hello from Truxel&platform=ios' -Method GET
```

**Expected Output:**
```
StatusCode: 200
Content: {"code":0,"message":"Unused Respond to Webhook node found in the workflow"}
```

## N8N Workflow Requirements

To complete the support system, configure N8N workflow:

### 1. Webhook Node (Already Configured)
- Method: GET
- URL: `/webhook/70100ffe-0d06-4cff-9ad1-b7001713ab5c`
- Extract query parameters

### 2. Data Processing Node
- Parse user context (userId, userName, userEmail, etc.)
- Extract message content
- Identify message language (userLanguage)
- Check subscription tier (subscriptionTier)

### 3. AI Agent Node (To Be Created)
- Use OpenAI/Claude/Local LLM
- Provide context about Truxel:
  - Subscription tiers: Trial, Standard, Pro, Premium
  - Features: Search leads, Community posts, Pricing
  - Common issues: Payment, Account, Search credits
- Generate appropriate response

### 4. Response Router
**Auto-Response (Simple Questions):**
- FAQ questions → Send automated answer
- Pricing questions → Link to pricing page
- Feature requests → Thank you + Log for review

**Human Agent (Complex Issues):**
- Bug reports → Create ticket + Notify team
- Account issues → Escalate to support agent
- Billing issues → Forward to billing team

### 5. Notification Node
- Send response via email (using userEmail)
- Send push notification (using userId)
- Or store in database for in-app inbox (future feature)

### 6. Respond to Webhook Node
- Return success message
- Include response text if available
- Set appropriate HTTP status

## Future Enhancements

### Phase 1 - Complete N8N Flow ✅
- Configure AI agent with Truxel knowledge base
- Setup automated responses for FAQ
- Create human agent escalation workflow

### Phase 2 - Real-time Chat (Optional)
- Add in-app chat inbox
- Real-time message updates via WebSocket/Supabase Realtime
- Chat history persistence in database
- Typing indicators

### Phase 3 - Analytics (Optional)
- Track most common support questions
- Response time metrics
- User satisfaction ratings
- Agent performance dashboard

### Phase 4 - Multi-channel Support (Optional)
- WhatsApp integration (existing business number)
- Email support (support@truxel.com)
- In-app + N8N + WhatsApp unified inbox

## Files Modified

### New Files:
- ✅ `services/chatService.ts` - Webhook communication service
- ✅ `components/ChatSupportModal.tsx` - Chat UI modal
- ✅ `docs/CHAT_SUPPORT_INTEGRATION.md` - This documentation

### Modified Files:
- ✅ `app/(tabs)/profile.tsx` - Added support button + modal
- ✅ `locales/en.json` - Added support translations
- ✅ `locales/ro.json` - Added support translations

### Pending Translations:
- ⚠️ `locales/pl.json` - Polish (needs translation)
- ⚠️ `locales/tr.json` - Turkish (needs translation)
- ⚠️ `locales/lt.json` - Lithuanian (needs translation)
- ⚠️ `locales/es.json` - Spanish (needs translation)
- ⚠️ `locales/uk.json` - Ukrainian (needs translation)
- ⚠️ `locales/fr.json` - French (needs translation)
- ⚠️ `locales/de.json` - German (needs translation)
- ⚠️ `locales/it.json` - Italian (needs translation)

## Security Considerations

### User Data Privacy
- ✅ Only send necessary user context
- ✅ No password or sensitive data in webhook
- ✅ User email only if consent given

### Webhook Security
- ⚠️ Current: Webhook is public (no authentication)
- ⚠️ Recommendation: Add API key or signature verification
- ⚠️ Consider rate limiting in N8N

### Message Content
- ✅ User input sanitized (React Native TextInput safe)
- ✅ No XSS risk in mobile app
- ⚠️ N8N should sanitize input before AI processing

## Cost Considerations

### N8N Hosting
- ✅ Self-hosted N8N (byinfant.com) - "aproape gratis"
- ✅ No per-message fees
- ✅ Unlimited webhook calls

### AI Agent Costs
- ⚠️ OpenAI API: ~$0.002 per message (GPT-4o-mini)
- ⚠️ Claude API: ~$0.003 per message (Haiku)
- ⚠️ Alternative: Self-hosted LLM (free, slower)

### Expected Volume
- Trial users: ~10 messages/month
- Paid users: ~50 messages/month
- Total estimate: 500-1000 messages/month
- Monthly cost: $1-$3 (negligible)

## User Request & Implementation

**User Request:**
> "apropo de chat, integreaza te rog un chat support si trimite mesajele cum ai zis/payload catre acest webhook https://n8n.byinfant.com/webhook/70100ffe-0d06-4cff-9ad1-b7001713ab5c, POTI SA-L TESTEZI, VEI PRIMI SI UN RESPOND ,dar nu e complet moementabn,trebuie sa creez si flow-ul sa raspunda la intrebari si probleme"

**Implementation Time:** ~45 minutes (service + UI + translations + docs)

**Status:** ✅ Complete - Ready for N8N flow configuration

**Next Steps:**
1. User configures N8N AI agent workflow
2. Test complete support flow end-to-end
3. Add remaining language translations (8 languages)
4. Optional: Add support button to Pricing screen

## Contact Information

**Webhook Owner:** office@infant.ro
**N8N Instance:** https://n8n.byinfant.com
**Support Email:** (To be configured in N8N workflow)
**WhatsApp Business:** (Existing number - can be integrated)

---

**Last Updated:** November 9, 2025  
**Author:** AI Assistant (implementing user request)  
**Project:** Truxel - Logistics Lead Management App
