# 🧪 Quick Test Guide - Real-Time Chat

## Test 1: Manual Message Insert (Fastest Test)

**Purpose**: Verify Supabase Realtime works without N8N

### Steps:
1. Open Truxel app
2. Go to Profile → Contact Support
3. Chat window opens (empty state: "No messages yet")
4. Keep app open!
5. Open Supabase Dashboard in browser: https://supabase.com/dashboard/project/upxocyomsfhqoflwibwn/editor
6. Go to SQL Editor
7. **First, get your user ID:**
   ```sql
   SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;
   ```
8. **Create a conversation:**
   ```sql
   INSERT INTO support_conversations (user_id, user_name, user_email, status)
   VALUES (
     'YOUR-USER-ID-HERE',
     'Test User',
     'your-email@example.com',
     'open'
   )
   RETURNING id;
   ```
   Copy the returned `id` (conversation_id)

9. **Send a test message:**
   ```sql
   INSERT INTO support_messages (conversation_id, sender_type, sender_name, message)
   VALUES (
     'CONVERSATION-ID-FROM-STEP-8',
     'support',
     'Test Support',
     'Hello! This is a real-time test message from Supabase. If you see this instantly, Realtime works! 🎉'
   );
   ```

10. **Expected Result**: 
    - Message appears INSTANTLY in app (no refresh needed!)
    - Chat window shows message bubble (grey, left-aligned)
    - Timestamp shows current time
    - Sender name: "Test Support"

---

## Test 2: Send Message from App

**Purpose**: Test full flow (app → database → N8N webhook)

### Steps:
1. Open app → Profile → Contact Support
2. Type: "Test message from mobile app"
3. Press Send
4. **Expected**:
   - Message appears immediately in chat (blue bubble, right)
   - Chat stays open (doesn't close)
   - Loading indicator briefly while sending

5. **Verify in Supabase Dashboard:**
   ```sql
   SELECT * FROM support_conversations 
   WHERE user_id = 'YOUR-USER-ID' 
   ORDER BY created_at DESC LIMIT 1;
   ```
   Should show: `status = 'waiting_support'`

6. **Check messages:**
   ```sql
   SELECT 
     sender_type, 
     sender_name, 
     message, 
     created_at
   FROM support_messages
   WHERE conversation_id = 'YOUR-CONVERSATION-ID'
   ORDER BY created_at ASC;
   ```
   Should show your message with `sender_type = 'user'`

7. **Check N8N webhook** (if configured):
   - Go to N8N: https://n8n.byinfant.com
   - Check executions → Should see webhook received
   - Payload should include: `conversationId`, `message`, `userId`

---

## Test 3: Full AI Response Flow

**Purpose**: Test complete cycle with N8N + AI

### Prerequisites:
- N8N workflow imported and active
- Supabase credentials configured in N8N
- OpenAI credentials configured in N8N

### Steps:
1. Open app → Contact Support
2. Type: "What are your pricing plans?"
3. Press Send
4. **Expected within 5 seconds**:
   - AI response appears in chat
   - Message bubble (grey, left-aligned)
   - Sender: "AI Assistant"
   - Response mentions pricing tiers

5. **Verify N8N execution:**
   - Go to N8N executions
   - Click on latest execution
   - Check each node:
     - ✅ Webhook received
     - ✅ Function prepared context
     - ✅ OpenAI generated response
     - ✅ Supabase inserted message
     - ✅ Conversation status updated

---

## Test 4: Multi-turn Conversation

**Purpose**: Test conversation persistence and history

### Steps:
1. Send message: "Hello"
2. Wait for response (or insert manual response)
3. Send message: "What is Standard plan?"
4. Wait for response
5. **Close and reopen app**
6. Go to Contact Support again
7. **Expected**:
   - All previous messages visible
   - Conversation history preserved
   - Scrolled to bottom (latest message)

---

## Test 5: Multiple Users

**Purpose**: Verify RLS policies (users can't see each other's chats)

### Steps:
1. User A sends message
2. User B opens Contact Support
3. **Expected**:
   - User B sees empty state OR their own previous messages
   - User B CANNOT see User A's messages
   - Each user has separate conversation

---

## Common Issues & Fixes

### Issue: Message sent but doesn't appear
**Fix:**
1. Check browser console for errors
2. Verify Supabase connection
3. Check RLS policies: `SELECT * FROM support_messages;` (should fail for non-service users)

### Issue: N8N not receiving webhook
**Fix:**
1. Check webhook URL in `services/chatService.ts`
2. Verify N8N workflow is "Active" (green toggle)
3. Check N8N execution logs for errors

### Issue: AI response not appearing
**Fix:**
1. Check N8N execution - which node failed?
2. Verify Supabase Service Role Key in N8N credentials
3. Check OpenAI API key and credits
4. Manually insert test response (SQL from Test 1)

### Issue: Realtime not working
**Fix:**
1. Check Supabase Realtime status:
   ```sql
   SELECT tablename FROM pg_publication_tables 
   WHERE pubname = 'supabase_realtime' 
   AND tablename LIKE 'support_%';
   ```
   Should return: `support_conversations`, `support_messages`

2. Check browser console for Realtime subscription errors
3. Verify app has internet connection

---

## Quick Verification Queries

### Get all conversations:
```sql
SELECT 
  c.id,
  c.user_name,
  c.user_email,
  c.status,
  c.unread_count,
  COUNT(m.id) as message_count,
  MAX(m.created_at) as last_message_at
FROM support_conversations c
LEFT JOIN support_messages m ON m.conversation_id = c.id
GROUP BY c.id
ORDER BY MAX(m.created_at) DESC NULLS LAST;
```

### Get conversation with messages:
```sql
SELECT 
  m.sender_type,
  m.sender_name,
  m.message,
  m.created_at
FROM support_messages m
WHERE m.conversation_id = 'YOUR-CONVERSATION-ID'
ORDER BY m.created_at ASC;
```

### Check Realtime subscriptions (PostgreSQL):
```sql
SELECT * FROM pg_stat_subscription;
```

---

## Success Indicators

✅ **Database Working**:
- Conversations created with correct user_id
- Messages inserted with correct sender_type
- Timestamps populated automatically
- Status updates on new messages

✅ **Realtime Working**:
- Messages appear without refresh
- Appears within 1-2 seconds
- No need to close/reopen app

✅ **N8N Working**:
- Webhook executions visible in N8N
- AI responses generated
- Messages inserted by N8N have sender_type='ai'

✅ **Security Working**:
- Users can only see own conversations
- Users can only insert sender_type='user'
- Service role (N8N) can insert any sender_type

---

## Next Steps After Testing

1. ✅ Verify all tests pass
2. 🎨 Customize AI prompt in N8N (Function node)
3. 📱 Test on physical device (not just simulator)
4. 🔔 Enable push notifications (optional)
5. 👥 Add human support handoff (optional)
6. 📊 Monitor conversation metrics

---

**Ready to test?** Start with Test 1 - it's the fastest way to verify Realtime works! 🚀
