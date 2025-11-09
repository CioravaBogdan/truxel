-- Support Chat System
-- Real-time chat between users and support team

-- Chat Conversations Table
CREATE TABLE IF NOT EXISTS support_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT,
  user_email TEXT,
  subscription_tier TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'waiting_support', 'waiting_user', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  unread_count INTEGER DEFAULT 0
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES support_conversations(id) ON DELETE CASCADE NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'support', 'ai')),
  sender_name TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_support_conversations_user_id ON support_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_support_conversations_status ON support_conversations(status);
CREATE INDEX IF NOT EXISTS idx_support_conversations_updated_at ON support_conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_messages_conversation_id ON support_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON support_messages(created_at DESC);

-- Function to update conversation timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE support_conversations
  SET 
    updated_at = NOW(),
    last_message_at = NOW(),
    status = CASE 
      WHEN NEW.sender_type = 'user' THEN 'waiting_support'
      ELSE 'waiting_user'
    END
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation on new message
DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON support_messages;
CREATE TRIGGER trigger_update_conversation_timestamp
  AFTER INSERT ON support_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Function to increment unread count
CREATE OR REPLACE FUNCTION increment_unread_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sender_type != 'user' THEN
    UPDATE support_conversations
    SET unread_count = unread_count + 1
    WHERE id = NEW.conversation_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment unread on support message
DROP TRIGGER IF EXISTS trigger_increment_unread_count ON support_messages;
CREATE TRIGGER trigger_increment_unread_count
  AFTER INSERT ON support_messages
  FOR EACH ROW
  EXECUTE FUNCTION increment_unread_count();

-- RLS Policies
ALTER TABLE support_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own conversations
CREATE POLICY "Users can view own conversations"
  ON support_conversations FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create conversations
CREATE POLICY "Users can create conversations"
  ON support_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own conversations (mark as read)
CREATE POLICY "Users can update own conversations"
  ON support_conversations FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can view messages in their conversations
CREATE POLICY "Users can view own messages"
  ON support_messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM support_conversations WHERE user_id = auth.uid()
    )
  );

-- Users can insert messages in their conversations
CREATE POLICY "Users can insert own messages"
  ON support_messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM support_conversations WHERE user_id = auth.uid()
    )
    AND sender_type = 'user'
  );

-- Service role can do everything (for N8N webhook)
CREATE POLICY "Service can manage all conversations"
  ON support_conversations FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service can manage all messages"
  ON support_messages FOR ALL
  USING (true)
  WITH CHECK (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE support_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE support_messages;
