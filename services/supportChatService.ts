/**
 * Support Chat Service
 * 
 * Real-time chat system with Supabase Realtime.
 * Users can send messages and receive responses instantly.
 */

import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface SupportConversation {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  subscription_tier?: string;
  status: 'open' | 'waiting_support' | 'waiting_user' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  last_message_at: string;
  unread_count: number;
}

export interface SupportMessage {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'support' | 'ai';
  sender_name?: string;
  message: string;
  created_at: string;
  read_at?: string;
  metadata?: Record<string, any>;
}

class SupportChatService {
  private activeChannel: RealtimeChannel | null = null;

  /**
   * Get or create conversation for current user
   */
  async getOrCreateConversation(params: {
    userId: string;
    userName?: string;
    userEmail?: string;
    subscriptionTier?: string;
  }): Promise<SupportConversation | null> {
    try {
      // Try to find existing open conversation
      const { data: existing, error: fetchError } = await supabase
        .from('support_conversations')
        .select('*')
        .eq('user_id', params.userId)
        .in('status', ['open', 'waiting_support', 'waiting_user'])
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (existing && !fetchError) {
        return existing as SupportConversation;
      }

      // Create new conversation
      const { data: newConv, error: createError } = await supabase
        .from('support_conversations')
        .insert({
          user_id: params.userId,
          user_name: params.userName,
          user_email: params.userEmail,
          subscription_tier: params.subscriptionTier,
          status: 'open',
        })
        .select()
        .single();

      if (createError) {
        console.error('[SupportChatService] Error creating conversation:', createError);
        return null;
      }

      return newConv as SupportConversation;
    } catch (error) {
      console.error('[SupportChatService] Error in getOrCreateConversation:', error);
      return null;
    }
  }

  /**
   * Get conversation messages
   */
  async getMessages(conversationId: string): Promise<SupportMessage[]> {
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[SupportChatService] Error fetching messages:', error);
        return [];
      }

      return (data as SupportMessage[]) || [];
    } catch (error) {
      console.error('[SupportChatService] Error in getMessages:', error);
      return [];
    }
  }

  /**
   * Send message
   */
  async sendMessage(params: {
    conversationId: string;
    message: string;
    senderName?: string;
  }): Promise<SupportMessage | null> {
    try {
      console.log('[SupportChatService] Sending message to conversation:', params.conversationId);
      
      const { data, error } = await supabase
        .from('support_messages')
        .insert({
          conversation_id: params.conversationId,
          sender_type: 'user',
          sender_name: params.senderName,
          message: params.message,
        })
        .select()
        .single();

      if (error) {
        console.error('[SupportChatService] Error sending message:', error);
        return null;
      }

      console.log('[SupportChatService] Message sent:', data.id);
      return data as SupportMessage;
    } catch (error) {
      console.error('[SupportChatService] Error in sendMessage:', error);
      return null;
    }
  }

  /**
   * Subscribe to conversation updates (realtime)
   */
  subscribeToConversation(
    conversationId: string,
    onMessage: (message: SupportMessage) => void
  ): () => void {
    console.log('[SupportChatService] Subscribing to conversation:', conversationId);

    // Clean up existing subscription
    if (this.activeChannel) {
      supabase.removeChannel(this.activeChannel);
    }

    // Create new subscription
    this.activeChannel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log('[SupportChatService] New message received:', payload.new);
          onMessage(payload.new as SupportMessage);
        }
      )
      .subscribe((status) => {
        console.log('[SupportChatService] Subscription status:', status);
      });

    // Return cleanup function
    return () => {
      console.log('[SupportChatService] Unsubscribing from conversation');
      if (this.activeChannel) {
        supabase.removeChannel(this.activeChannel);
        this.activeChannel = null;
      }
    };
  }

  /**
   * Mark conversation as read (reset unread count)
   */
  async markAsRead(conversationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('support_conversations')
        .update({ unread_count: 0 })
        .eq('id', conversationId);

      if (error) {
        console.error('[SupportChatService] Error marking as read:', error);
      }
    } catch (error) {
      console.error('[SupportChatService] Error in markAsRead:', error);
    }
  }

  /**
   * Close conversation
   */
  async closeConversation(conversationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('support_conversations')
        .update({ status: 'closed' })
        .eq('id', conversationId);

      if (error) {
        console.error('[SupportChatService] Error closing conversation:', error);
      }
    } catch (error) {
      console.error('[SupportChatService] Error in closeConversation:', error);
    }
  }
}

export const supportChatService = new SupportChatService();
