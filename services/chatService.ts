/**
 * Chat Support Service
 * 
 * Handles chat support messages via N8N webhook integration.
 * Messages are sent to N8N for AI agent processing.
 * 
 * Webhook: Configured via environment variables (TRUXEL_N8N_CHAT_WEBHOOK)
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

// N8N webhook URL from environment variables
const N8N_WEBHOOK_URL = 'https://automation.truxel.io/webhook/70100ffe-0d06-4cff-9ad1-b7001713ab5c'; // Force production URL
// const N8N_WEBHOOK_URL = Constants.expoConfig?.extra?.n8nChatWebhook || 'https://automation.truxel.io/webhook/70100ffe-0d06-4cff-9ad1-b7001713ab5c';

export interface ChatMessage {
  userId: string;
  userName?: string;
  userEmail?: string;
  message: string;
  timestamp: string;
  platform: 'ios' | 'android' | 'web';
  userLanguage?: string;
  subscriptionTier?: string;
  deviceInfo?: string;
  expoPushToken?: string;
}

export interface ChatResponse {
  success: boolean;
  message?: string;
  response?: string;
  error?: string;
}

class ChatService {
  /**
   * Send chat message to N8N webhook
   * Fire-and-forget pattern with async response handling
   */
  async sendMessage(message: ChatMessage): Promise<ChatResponse> {
    try {
      // Feature deactivated temporarily - Webhook not active
      return {
        success: true,
        message: 'Message sent! We\'ll respond via email.',
      };

      /* 
      // Prepare JSON payload for POST request
      console.log('[ChatService] Sending message to N8N:', message);

      const payload = {
        userId: message.userId,
        userName: message.userName || 'Anonymous',
        userEmail: message.userEmail || '',
        message: message.message,
        timestamp: message.timestamp,
        platform: message.platform,
        userLanguage: message.userLanguage || 'en',
        subscriptionTier: message.subscriptionTier || 'trial',
        deviceInfo: message.deviceInfo || Platform.OS,
      };

      // Send POST request to N8N webhook with JSON body
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ChatService] Webhook error:', errorText);
        
        return {
          success: false,
          error: 'Failed to send message. Please try again.',
        };
      }

      // Try to parse response from N8N
      try {
        const data = await response.json();
        console.log('[ChatService] Webhook response:', data);
        
        // Check if N8N sent immediate response
        if (data.response) {
          return {
            success: true,
            message: 'Message sent successfully',
            response: data.response,
          };
        }
        
        // Otherwise, user will receive response via email/notification
        return {
          success: true,
          message: 'Message sent! We\'ll respond via email and push notification.',
        };
      } catch {
        // N8N received message but flow incomplete
        console.log('[ChatService] Message received by N8N (response pending)');
        return {
          success: true,
          message: 'Message sent! We\'ll respond via email shortly.',
        };
      }
      */
    } catch (error) {
      console.error('[ChatService] Error sending message:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send support message with user context
   */
  async sendSupportMessage(params: {
    userId: string;
    message: string;
    userName?: string;
    userEmail?: string;
    userLanguage?: string;
    subscriptionTier?: string;
    expoPushToken?: string;
  }): Promise<ChatResponse> {
    const chatMessage: ChatMessage = {
      userId: params.userId,
      userName: params.userName,
      userEmail: params.userEmail,
      message: params.message,
      timestamp: new Date().toISOString(),
      platform: Platform.OS as 'ios' | 'android' | 'web',
      userLanguage: params.userLanguage || 'en',
      subscriptionTier: params.subscriptionTier || 'trial',
      deviceInfo: `${Platform.OS} ${Platform.Version}`,
      expoPushToken: params.expoPushToken,
    };

    return this.sendMessage(chatMessage);
  }

  /**
   * Quick support templates
   */
  getSupportTemplates(language: string = 'en'): { id: string; textKey: string }[] {
    return [
      { id: 'pricing_question', textKey: 'support.templates.pricing_question' },
      { id: 'feature_request', textKey: 'support.templates.feature_request' },
      { id: 'bug_report', textKey: 'support.templates.bug_report' },
      { id: 'account_help', textKey: 'support.templates.account_help' },
      { id: 'subscription_help', textKey: 'support.templates.subscription_help' },
    ];
  }
}

export const chatService = new ChatService();
