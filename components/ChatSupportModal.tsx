/**
 * Chat Support Modal - Real-time Conversation
 * 
 * WhatsApp-style chat with message history, quick templates, and instant responses.
 * Uses Supabase Realtime for live message delivery.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { supportChatService, SupportMessage, SupportConversation } from '@/services/supportChatService';
import { chatService } from '@/services/chatService';
import Toast from 'react-native-toast-message';

interface ChatSupportModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ChatSupportModal({ visible, onClose }: ChatSupportModalProps) {
  const { t, i18n } = useTranslation();
  const { user, profile } = useAuthStore();
  
  const [conversation, setConversation] = useState<SupportConversation | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);

  // Get templates
  const templates = chatService.getSupportTemplates(i18n.language);

  // Load conversation and history when modal opens
  useEffect(() => {
    if (!visible || !user) {
      return;
    }

    const loadConversation = async () => {
      setIsLoadingHistory(true);
      try {
        // Get or create conversation
        const conv = await supportChatService.getOrCreateConversation({
          userId: user.id,
          userName: profile?.company_name || profile?.full_name,
          userEmail: user.email,
          subscriptionTier: profile?.subscription_tier,
        });

        if (!conv) {
          Toast.show({
            type: 'error',
            text1: t('common.error'),
            text2: 'Failed to load conversation',
          });
          return;
        }

        setConversation(conv);

        // Load message history
        const msgs = await supportChatService.getMessages(conv.id);
        setMessages(msgs);

        // Show templates only if no messages
        if (msgs.length === 0) {
          setShowTemplates(true);
        }

        // Mark as read
        await supportChatService.markAsRead(conv.id);

        // Scroll to bottom after messages load
        setTimeout(() => {
          if (msgs.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: false });
          }
        }, 100);
      } catch (error) {
        console.error('[ChatSupportModal] Error loading conversation:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadConversation();
  }, [visible, user, profile, t]);

  // Subscribe to new messages (Realtime)
  useEffect(() => {
    if (!conversation) return;

    const unsubscribe = supportChatService.subscribeToConversation(
      conversation.id,
      (newMessage) => {
        // Only add if it's not from current user (avoid duplicates)
        if (newMessage.sender_type !== 'user') {
          setMessages((prev) => [...prev, newMessage]);
          // Auto-scroll to bottom
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      }
    );

    return unsubscribe;
  }, [conversation]);

  const handleSendMessage = async (messageText?: string) => {
    if (!user || !conversation) return;

    const textToSend = messageText || inputMessage.trim();
    if (!textToSend) return;

    setIsSending(true);
    try {
      // 1. Save to database
      const sentMessage = await supportChatService.sendMessage({
        conversationId: conversation.id,
        message: textToSend,
        senderName: profile?.company_name || profile?.full_name,
      });

      if (sentMessage) {
        // Add to local state immediately (optimistic update)
        setMessages((prev) => [...prev, sentMessage]);
        setInputMessage('');
        setShowTemplates(false);

        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);

        // 2. Notify N8N webhook (fire and forget)
        chatService.sendSupportMessage({
          userId: user.id,
          userName: profile?.company_name || profile?.full_name || 'Unknown',
          userEmail: user.email || '',
          message: textToSend,
          userLanguage: i18n.language,
          subscriptionTier: profile?.subscription_tier || 'trial',
          expoPushToken: profile?.expo_push_token || undefined,
        }).catch((err) => {
          console.log('[ChatSupportModal] N8N notification failed (non-critical):', err);
        });
      }
    } catch (error) {
      console.error('[ChatSupportModal] Error sending message:', error);
      Toast.show({
        type: 'error',
        text1: t('support.error_sending'),
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleTemplateSelect = (template: { id: string; textKey: string }) => {
    const templateText = t(template.textKey);
    handleSendMessage(templateText);
  };

  const renderMessage = ({ item }: { item: SupportMessage }) => {
    const isUser = item.sender_type === 'user';
    const time = new Date(item.created_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={[
        styles.messageBubbleContainer,
        isUser ? styles.userMessageContainer : styles.supportMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.supportBubble
        ]}>
          {!isUser && item.sender_name && (
            <Text style={styles.senderName}>{item.sender_name}</Text>
          )}
          <Text style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.supportMessageText
          ]}>
            {item.message}
          </Text>
          <Text style={[
            styles.timestamp,
            isUser ? styles.userTimestamp : styles.supportTimestamp
          ]}>
            {time}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('support.title')}</Text>
          {conversation?.status === 'waiting_support' && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>⏳</Text>
            </View>
          )}
          {conversation?.status !== 'waiting_support' && <View style={{ width: 40 }} />}
        </View>

        {/* Content */}
        {isLoadingHistory ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>{t('common.loading')}...</Text>
          </View>
        ) : showTemplates ? (
          // Quick Templates View
          <ScrollView style={styles.templatesContainer} contentContainerStyle={styles.templatesContent}>
            <Text style={styles.templatesTitle}>{t('support.quick_questions')}</Text>
            {templates.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={styles.templateButton}
                onPress={() => handleTemplateSelect(template)}
                disabled={isSending}
              >
                <Text style={styles.templateButtonText}>{t(template.textKey)}</Text>
                <Text style={styles.templateArrow}>→</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.customMessageButton}
              onPress={() => setShowTemplates(false)}
              disabled={isSending}
            >
              <Text style={styles.customMessageButtonText}>
                {t('support.write_custom_message')}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        ) : messages.length === 0 ? (
          // Empty State
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>{t('support.no_messages_yet')}</Text>
            <Text style={styles.emptyDescription}>{t('support.start_conversation')}</Text>
            
            <TouchableOpacity
              style={styles.showTemplatesButton}
              onPress={() => setShowTemplates(true)}
            >
              <Text style={styles.showTemplatesButtonText}>
                {t('support.quick_questions')} →
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Messages View
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => {
              if (messages.length > 0) {
                flatListRef.current?.scrollToEnd({ animated: false });
              }
            }}
          />
        )}

        {/* Input - Only show if not showing templates */}
        {!showTemplates && (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          >
            <View style={styles.inputContainer}>
              {messages.length > 0 && (
                <TouchableOpacity
                  style={styles.templatesToggle}
                  onPress={() => setShowTemplates(true)}
                >
                  <Text style={styles.templatesToggleText}>⚡</Text>
                </TouchableOpacity>
              )}
              
              <TextInput
                style={styles.input}
                placeholder={t('support.message_placeholder')}
                value={inputMessage}
                onChangeText={setInputMessage}
                multiline
                maxLength={500}
                editable={!isSending}
              />
              
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputMessage.trim() || isSending) && styles.sendButtonDisabled
                ]}
                onPress={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isSending}
              >
                {isSending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.sendButtonIcon}>▲</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  closeButton: {
    padding: 8,
    width: 40,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    width: 40,
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  templatesContainer: {
    flex: 1,
  },
  templatesContent: {
    padding: 20,
  },
  templatesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  templateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  templateButtonText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  templateArrow: {
    fontSize: 18,
    color: '#007AFF',
    marginLeft: 8,
  },
  customMessageButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  customMessageButtonText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  showTemplatesButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  showTemplatesButtonText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubbleContainer: {
    marginBottom: 12,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  supportMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  supportBubble: {
    backgroundColor: '#F0F0F0',
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  supportMessageText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  userTimestamp: {
    color: '#FFFFFF',
    opacity: 0.7,
  },
  supportTimestamp: {
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  templatesToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  templatesToggleText: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 10,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
