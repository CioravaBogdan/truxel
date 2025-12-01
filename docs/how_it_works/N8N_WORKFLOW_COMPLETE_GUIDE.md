# N8N Workflow Configuration - Complete Support System

## Overview
This document describes the complete N8N workflow for the Truxel chat support system, including:
1. Receiving messages from mobile app
2. Processing with AI agent (optional)
3. Sending responses via email
4. Sending push notifications to app

## Webhook Configuration ✅ (Already Done)

**URL:** `https://automation.truxel.io/webhook/70100ffe-0d06-4cff-9ad1-b7001713ab5c`
**Method:** POST
**Content-Type:** application/json

### Payload Structure:
```json
{
  "userId": "b2e97bd7-4734-4462-ad6e-03f88a0f6c74",
  "userName": "Heavy Forwarding",
  "userEmail": "cioravageorgebogdan@gmail.com",
  "message": "I have a question about pricing and plans",
  "timestamp": "2025-11-09T12:44:29.744Z",
  "platform": "ios",
  "userLanguage": "en",
  "subscriptionTier": "trial",
  "deviceInfo": "ios 18.6.2"
}
```

## N8N Workflow Nodes (To Be Implemented)

### Node 1: Webhook ✅ (Already Configured)
- **Type:** Webhook
- **Method:** POST
- **Path:** `70100ffe-0d06-4cff-9ad1-b7001713ab5c`
- **Response:** Using 'Respond to Webhook' Node
- **Output:** Full payload with user context

### Node 2: Extract Data
- **Type:** Set
- **Purpose:** Parse and structure incoming data
- **Output Variables:**
  ```javascript
  userId = {{ $json.body.userId }}
  userName = {{ $json.body.userName }}
  userEmail = {{ $json.body.userEmail }}
  message = {{ $json.body.message }}
  userLanguage = {{ $json.body.userLanguage }}
  subscriptionTier = {{ $json.body.subscriptionTier }}
  timestamp = {{ $json.body.timestamp }}
  ```

### Node 3: AI Agent Response (Optional - If You Want Automated Responses)

#### Option A: OpenAI GPT-4o-mini (Fast, cheap)
- **Type:** OpenAI
- **Model:** gpt-4o-mini
- **System Prompt:**
  ```
  You are a helpful customer support agent for Truxel, a logistics lead management app.
  
  Context:
  - Subscription Tiers: Trial (5 searches), Standard (€29.99/month, 30 searches), Pro (€49.99/month, 50 searches), Premium (€99.99/month, 100 searches)
  - Features: Search for logistics leads, Community posts (driver availability, load offers), Real-time notifications
  - Support Email: support@truxel.com
  - User Language: {{ $json.userLanguage }}
  - User Tier: {{ $json.subscriptionTier }}
  
  Instructions:
  1. Respond in the user's language ({{ $json.userLanguage }})
  2. Be helpful, professional, and concise
  3. If question is about pricing, explain tier differences
  4. If technical issue, acknowledge and say human agent will follow up
  5. Always end with: "Is there anything else I can help you with?"
  ```
- **User Message:** `{{ $json.message }}`
- **Temperature:** 0.7
- **Max Tokens:** 300

#### Option B: Skip AI (Direct to Human Agent)
- **Type:** Code (JavaScript)
- **Code:**
  ```javascript
  return {
    json: {
      response: "Thank you for contacting Truxel support. A member of our team will respond to your message shortly.",
      needsHumanAgent: true
    }
  };
  ```

### Node 4: Send Email Response
- **Type:** Send Email (Gmail/SendGrid/SMTP)
- **Configuration:**
  - **From:** support@truxel.com (or noreply@truxel.com)
  - **To:** `{{ $json.userEmail }}`
  - **Subject (EN):** "Re: Your Truxel Support Request"
  - **Subject (RO):** "Re: Solicitarea ta de suport Truxel"
  - **Body Template:**
    ```html
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007AFF; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f5f5f5; padding: 20px; }
        .message { background: white; padding: 15px; border-radius: 8px; margin: 10px 0; }
        .footer { background: #333; color: white; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
        .button { background: #007AFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Truxel Support</h1>
        </div>
        <div class="content">
          <p>Hi {{ $json.userName }},</p>
          
          <div class="message">
            <strong>Your message:</strong>
            <p>{{ $json.message }}</p>
          </div>
          
          <div class="message">
            <strong>Our response:</strong>
            <p>{{ $json.aiResponse || "A member of our support team will review your message and respond within 24 hours." }}</p>
          </div>
          
          <p>Need immediate help? You can also:</p>
          <ul>
            <li>Reply to this email</li>
            <li>Contact us via WhatsApp: +40 XXX XXX XXX</li>
            <li>Open a support chat in the Truxel app</li>
          </ul>
          
          <a href="https://truxel.app" class="button">Open Truxel App</a>
        </div>
        <div class="footer">
          <p>© 2025 Truxel - Logistics Lead Management</p>
          <p>office@infant.ro</p>
        </div>
      </div>
    </body>
    </html>
    ```

### Node 5: Send Push Notification (If User Has Expo Push Token)

#### Check if Push Token Exists
- **Type:** IF
- **Condition:** `{{ $json.expoPushToken }}` is not empty

#### Send to Expo Push API
- **Type:** HTTP Request
- **Method:** POST
- **URL:** `https://exp.host/--/api/v2/push/send`
- **Headers:**
  ```json
  {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
  ```
- **Body:**
  ```json
  {
    "to": "{{ $json.expoPushToken }}",
    "sound": "default",
    "title": "Support Response",
    "body": "We've responded to your support message. Check your email!",
    "data": {
      "type": "support_response",
      "userId": "{{ $json.userId }}",
      "timestamp": "{{ $now }}",
      "screen": "profile"
    },
    "priority": "high",
    "channelId": "support-messages"
  }
  ```

**Note:** Pentru a obține `expoPushToken`, trebuie să-l incluzi în payload-ul original sau să faci un query în Supabase.

### Node 6: Get Expo Push Token from Supabase
- **Type:** Supabase
- **Operation:** Select
- **Table:** profiles
- **Filter:** `user_id = {{ $json.userId }}`
- **Select:** `expo_push_token`

### Node 7: Log to Database (Optional - For Support Ticket History)
- **Type:** Supabase
- **Operation:** Insert
- **Table:** support_messages (create new table)
- **Data:**
  ```json
  {
    "user_id": "{{ $json.userId }}",
    "user_email": "{{ $json.userEmail }}",
    "message": "{{ $json.message }}",
    "response": "{{ $json.aiResponse }}",
    "status": "resolved",
    "created_at": "{{ $json.timestamp }}",
    "responded_at": "{{ $now }}"
  }
  ```

### Node 8: Respond to Webhook ✅ (Already Exists)
- **Type:** Respond to Webhook
- **Response Code:** 200
- **Body:**
  ```json
  {
    "success": true,
    "message": "Message received. Response sent via email and push notification.",
    "response": "{{ $json.aiResponse }}"
  }
  ```

## Complete N8N Workflow Diagram

```
┌─────────────────┐
│  Webhook (POST) │ ← Mobile app sends message
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Extract Data   │ ← Parse userId, email, message, etc.
└────────┬────────┘
         │
         v
    ┌────┴────┐
    │   IF    │ ← Want AI response?
    └────┬────┘
         │
    ┌────┴──────────────┐
    │                   │
    v                   v
┌─────────┐      ┌──────────────┐
│ AI Agent│      │ Skip to Human│
│(OpenAI) │      │    Agent     │
└────┬────┘      └──────┬───────┘
     │                  │
     └──────┬───────────┘
            v
   ┌─────────────────┐
   │ Get Push Token  │ ← Query Supabase for expo_push_token
   │  from Supabase  │
   └────────┬────────┘
            │
            v
   ┌─────────────────┐
   │  Send Email     │ ← Gmail/SendGrid
   └────────┬────────┘
            │
            v
       ┌────┴────┐
       │   IF    │ ← Has push token?
       └────┬────┘
            │
         Yes│
            v
   ┌─────────────────┐
   │ Send Push Notif │ ← Expo Push API
   └────────┬────────┘
            │
            v
   ┌─────────────────┐
   │ Log to Database │ ← Optional: support_messages table
   └────────┬────────┘
            │
            v
   ┌─────────────────┐
   │ Respond to      │ ← Send success response to app
   │   Webhook       │
   └─────────────────┘
```

## Testing the Workflow

### 1. Test Webhook Reception
```bash
# PowerShell
$body = @{
  userId = "test-user-123"
  userName = "Test User"
  userEmail = "test@example.com"
  message = "Test support message"
  timestamp = "2025-11-09T12:00:00Z"
  platform = "ios"
  userLanguage = "en"
  subscriptionTier = "trial"
  deviceInfo = "ios 18.6"
} | ConvertTo-Json

Invoke-WebRequest -Uri 'https://automation.truxel.io/webhook/70100ffe-0d06-4cff-9ad1-b7001713ab5c' -Method POST -Body $body -ContentType 'application/json'
```

### 2. Test with Real User Data
- Open Truxel app
- Navigate to Profile
- Tap "💬 Contact Support"
- Select template: "I have a question about pricing and plans"
- Tap "Send Message"
- **Expected:**
  - ✅ Success toast in app
  - ✅ Email received within 1 minute
  - ✅ Push notification received

### 3. Verify Email Delivery
- Check `userEmail` inbox
- Should receive formatted email with:
  - Header: "Truxel Support"
  - User's original message quoted
  - AI/human response
  - Footer with contact info

### 4. Verify Push Notification
- Check phone notifications
- Should see:
  - Title: "Support Response"
  - Body: "We've responded to your support message..."
  - Tap → Opens Truxel app

## Database Schema (Optional - For Support History)

### Create `support_messages` Table in Supabase:

```sql
CREATE TABLE support_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT,
  message TEXT NOT NULL,
  response TEXT,
  status TEXT DEFAULT 'pending', -- pending, resolved, escalated
  platform TEXT, -- ios, android, web
  user_language TEXT,
  subscription_tier TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  response_method TEXT, -- ai, human, email
  CONSTRAINT valid_status CHECK (status IN ('pending', 'resolved', 'escalated'))
);

-- Index for user queries
CREATE INDEX idx_support_messages_user_id ON support_messages(user_id);
CREATE INDEX idx_support_messages_status ON support_messages(status);

-- RLS Policies
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own messages
CREATE POLICY "Users can view own messages"
  ON support_messages FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert (N8N webhook)
CREATE POLICY "Service can insert messages"
  ON support_messages FOR INSERT
  WITH CHECK (true);
```

## Cost Estimation

### OpenAI API (GPT-4o-mini)
- Input: ~150 tokens (system prompt + user message)
- Output: ~100 tokens (response)
- Cost per message: ~$0.0005
- Monthly estimate (500 messages): **$0.25**

### SendGrid/Gmail (Email)
- Free tier: 100 emails/day
- Cost: **$0**

### Expo Push Notifications
- Free (unlimited)
- Cost: **$0**

### N8N Hosting
- Self-hosted: **~$0** (already running)

**Total Monthly Cost: ~$0.25** (negligible)

## Implementation Steps

### Step 1: Basic Response (Email Only) ⚠️ RECOMMENDED START HERE
1. Configure Send Email node in N8N
2. Test email delivery
3. Verify app receives success message

### Step 2: Add AI Agent (Optional)
1. Add OpenAI node
2. Configure system prompt
3. Test AI responses
4. Iterate on prompt quality

### Step 3: Add Push Notifications
1. Add Supabase query for `expo_push_token`
2. Configure Expo Push API call
3. Test notification delivery
4. Verify deep linking works

### Step 4: Add Database Logging (Optional)
1. Create `support_messages` table
2. Add Insert node in N8N
3. Build admin dashboard (future)

## Troubleshooting

### Issue: Email Not Received
- Check spam folder
- Verify SendGrid/Gmail credentials
- Check N8N execution logs
- Test with different email provider

### Issue: Push Notification Not Received
- Verify `expo_push_token` exists in database
- Check Expo Push API response
- Ensure app has notification permissions
- Test with Expo Push Notification Tool: https://expo.dev/notifications

### Issue: Webhook Times Out
- Check N8N workflow execution time
- Ensure 'Respond to Webhook' node exists
- Verify no infinite loops in workflow

## Next Steps

1. **Now (Priority 1):** Setup email response in N8N
2. **Next Week:** Add AI agent for automated responses
3. **Later:** Add push notifications
4. **Future:** Build in-app message inbox

---

**Webhook Status:** ✅ Receiving messages successfully  
**Email Response:** ⚠️ To be configured  
**Push Notifications:** ⚠️ To be configured  
**AI Agent:** ⚠️ Optional - Not configured

**Last Updated:** November 9, 2025
