# N8N Real-Time Chat Integration Guide

## Overview
This guide shows how to set up N8N to respond to support messages in real-time by writing directly to the Supabase database.

## Architecture

```
User sends message (mobile app)
  ↓
Saved to support_messages (sender_type='user')
  ↓
N8N webhook receives notification
  ↓
AI/Human processes message
  ↓
N8N writes response to support_messages (sender_type='support' or 'ai')
  ↓
Supabase Realtime broadcasts new message
  ↓
Mobile app receives update instantly
  ↓
Message appears in chat window
```

## Step 1: Webhook Receives Message

Your existing webhook continues to work:
- URL: `https://n8n.byinfant.com/webhook/70100ffe-0d06-4cff-9ad1-b7001713ab5c`
- Method: POST
- Content-Type: application/json

**Payload:**
```json
{
  "userId": "b2e97bd7-4734-4462-ad6e-03f88a0f6c74",
  "userName": "Heavy Forwarding",
  "userEmail": "cioravageorgebogdan@gmail.com",
  "message": "I have a question about pricing",
  "conversationId": "uuid-here",  // NEW - CRITICAL for responding
  "timestamp": "2025-11-09T12:44:29.744Z",
  "platform": "ios",
  "userLanguage": "en",
  "subscriptionTier": "trial",
  "deviceInfo": "ios 18.6.2",
  "expoPushToken": "ExponentPushToken[...]"
}
```

**⚠️ CRITICAL**: The `conversationId` field identifies which conversation to respond to.

## Step 2: Process Message (AI or Human)

Use your existing AI agent or human support workflow to generate a response.

Example N8N nodes:
- **OpenAI Node**: Generate AI response
- **HTTP Request**: Send to custom AI service
- **Manual Input**: For human support agents

## Step 3: Write Response to Supabase

Add a **Supabase** node to your N8N workflow:

### Configuration:
- **Operation**: Insert
- **Table**: `support_messages`
- **Authentication**: Use Supabase Service Role Key (not anon key!)

### Data to Insert:
```json
{
  "conversation_id": "{{ $json.body.conversationId }}",
  "sender_type": "ai",  // or "support" for human responses
  "sender_name": "AI Assistant",  // or "Support Team" or agent name
  "message": "{{ $json.aiResponse }}"  // The generated response
}
```

### Full Example (N8N JSON):
```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "httpMethod": "POST",
        "path": "70100ffe-0d06-4cff-9ad1-b7001713ab5c"
      }
    },
    {
      "name": "OpenAI",
      "type": "n8n-nodes-base.openAi",
      "parameters": {
        "operation": "complete",
        "text": "User question: {{ $json.body.message }}\n\nProvide helpful support response:"
      }
    },
    {
      "name": "Supabase Insert Response",
      "type": "n8n-nodes-base.supabase",
      "parameters": {
        "operation": "insert",
        "tableId": "support_messages",
        "additionalFields": {
          "conversation_id": "={{ $json.body.conversationId }}",
          "sender_type": "ai",
          "sender_name": "AI Assistant",
          "message": "={{ $('OpenAI').item.json.choices[0].text }}"
        }
      },
      "credentials": {
        "supabaseApi": {
          "id": "your-supabase-credential-id",
          "name": "Supabase Truxel"
        }
      }
    }
  ]
}
```

## Step 4: Update Conversation Status (Optional)

Add another Supabase node to update conversation status:

### Configuration:
- **Operation**: Update
- **Table**: `support_conversations`
- **Filter**: `id=eq.{{ $json.body.conversationId }}`

### Data to Update:
```json
{
  "status": "waiting_user"  // Indicates support has responded
}
```

This will:
1. Clear the "waiting for support" status
2. Show user that response is ready
3. Trigger any unread count updates

## Step 5: Supabase Credentials Setup

In N8N, add Supabase credentials:

### Name: `Supabase Truxel`
### Type: `Supabase API`
### Configuration:
```
Host: https://upxocyomsfhqoflwibwn.supabase.co
Service Role Key: <get from Supabase dashboard>
```

**⚠️ IMPORTANT**: Use **Service Role Key**, not anon key!
- Service Role Key bypasses RLS (Row Level Security)
- Anon key will fail to write support messages

### Where to Find Service Role Key:
1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/upxocyomsfhqoflwibwn
2. Click Settings → API
3. Copy "Service Role Key" (secret, never commit to git!)

## Complete N8N Workflow Example

```
┌─────────────┐
│  Webhook    │ Receives message from mobile app
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Function   │ Extract message, conversationId
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  OpenAI     │ Generate AI response
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Supabase   │ Insert response message
│  (Insert)   │ Table: support_messages
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Supabase   │ Update conversation status
│  (Update)   │ Table: support_conversations
└─────────────┘
```

## Sender Types

Choose appropriate `sender_type`:

- **`user`**: Message from mobile app user (app handles this)
- **`ai`**: Automated AI response (use for bot responses)
- **`support`**: Human support agent (use when human responds)

**Sender Name Examples:**
- AI: "AI Assistant", "Bot", "Truxel Assistant"
- Human: "Support Team", "Alex from Support", "Customer Care"

## Testing

### 1. Test Message Flow:
1. Open Truxel app
2. Tap Profile → Contact Support
3. Send a test message
4. Check N8N execution log
5. Verify message appears in Supabase `support_messages` table
6. Verify response appears in app chat window

### 2. Check Supabase Data:
```sql
-- View conversation
SELECT * FROM support_conversations
WHERE user_id = 'user-uuid-here'
ORDER BY updated_at DESC;

-- View messages
SELECT * FROM support_messages
WHERE conversation_id = 'conversation-uuid-here'
ORDER BY created_at ASC;
```

### 3. Test Realtime Updates:
1. Send message from app
2. Manually insert response in Supabase SQL editor:
```sql
INSERT INTO support_messages (conversation_id, sender_type, sender_name, message)
VALUES (
  'conversation-uuid-here',
  'support',
  'Test Support',
  'This is a test response'
);
```
3. Response should appear instantly in app (no refresh needed!)

## Troubleshooting

### Message Not Appearing in App:
1. Check Supabase Realtime is enabled (migration includes this)
2. Verify `conversation_id` matches active conversation
3. Check browser console for Realtime subscription errors
4. Verify Service Role Key in N8N credentials

### N8N Can't Write to Database:
1. Verify using Service Role Key (not anon key)
2. Check Supabase URL is correct
3. Test credentials with simple SELECT query first
4. Check N8N execution log for error details

### Conversation Not Found:
1. Verify webhook receives `conversationId` in payload
2. Check `conversationId` is valid UUID
3. Query Supabase to confirm conversation exists
4. User may have multiple conversations (use most recent)

## Security Notes

### RLS Policies:
- Users can only read their own conversations/messages
- Service role bypasses RLS (necessary for N8N to write)
- Never expose Service Role Key in client-side code

### Message Validation:
Add validation in N8N:
```javascript
// Function node - Validate message
if (!$json.body.conversationId) {
  throw new Error('Missing conversationId');
}

if (!$json.body.message || $json.body.message.trim() === '') {
  throw new Error('Empty message');
}

return $json;
```

## Optional Enhancements

### 1. Typing Indicator:
```json
// Before processing - set typing=true
{
  "operation": "update",
  "table": "support_conversations",
  "filter": "id=eq.{{ $json.body.conversationId }}",
  "data": {
    "typing": true
  }
}

// After response - set typing=false
{
  "operation": "update",
  "table": "support_conversations",
  "filter": "id=eq.{{ $json.body.conversationId }}",
  "data": {
    "typing": false
  }
}
```

### 2. Push Notification (Offline Users):
```json
{
  "name": "Send Push Notification",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "url": "https://exp.host/--/api/v2/push/send",
    "method": "POST",
    "bodyParameters": {
      "to": "={{ $json.body.expoPushToken }}",
      "title": "Support Response",
      "body": "You have a new message from support"
    }
  }
}
```

### 3. Response Time Tracking:
```json
{
  "operation": "update",
  "table": "support_conversations",
  "filter": "id=eq.{{ $json.body.conversationId }}",
  "data": {
    "first_response_at": "NOW()",
    "response_time_seconds": "EXTRACT(EPOCH FROM (NOW() - created_at))"
  }
}
```

## Migration Required

The database schema is already created. To apply:

1. **Option A - Supabase Dashboard:**
   - Go to SQL Editor
   - Copy content from `supabase/migrations/20251109_create_support_chats.sql`
   - Paste and run

2. **Option B - Supabase CLI:**
   ```bash
   supabase db push
   ```

3. **Verify Tables Exist:**
   ```sql
   SELECT tablename FROM pg_tables
   WHERE schemaname = 'public'
   AND tablename LIKE 'support_%';
   ```

   Should return:
   - `support_conversations`
   - `support_messages`

## Summary

✅ **What's Complete:**
- Database schema with conversations + messages
- Supabase Realtime enabled
- Mobile app with WhatsApp-style chat UI
- Message history and real-time updates
- RLS policies for security

🔄 **What You Need to Do:**
1. Apply SQL migration to Supabase
2. Add Supabase nodes to N8N workflow
3. Configure Supabase credentials (Service Role Key)
4. Test end-to-end flow

📝 **Key Points:**
- Use `conversationId` from webhook payload
- Use Service Role Key for N8N
- Set `sender_type` to 'ai' or 'support'
- Supabase Realtime handles live updates automatically
- No polling needed - messages appear instantly!

---

**Last Updated**: November 9, 2025
**Project**: Truxel Real-Time Support Chat
