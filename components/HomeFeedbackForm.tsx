import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/lib/theme';
import { useAuthStore } from '@/store/authStore';
import { supportChatService } from '@/services/supportChatService';
import { chatService } from '@/services/chatService';
import { reviewService } from '@/services/reviewService';
import { Send, AlertTriangle, Star } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

export const HomeFeedbackForm = () => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const { user, profile } = useAuthStore();
  
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || !user) return;

    setIsSending(true);
    try {
      // 1. Get or create conversation (headless)
      const conversation = await supportChatService.getOrCreateConversation({
        userId: user.id,
        userName: profile?.company_name || profile?.full_name,
        userEmail: user.email,
        subscriptionTier: profile?.subscription_tier,
      });

      if (!conversation) {
        throw new Error('Could not initialize conversation');
      }

      const textToSend = message.trim();

      // 2. Save to database
      await supportChatService.sendMessage({
        conversationId: conversation.id,
        message: textToSend,
        senderName: profile?.company_name || profile?.full_name,
      });

      // 3. Notify N8N webhook (fire and forget)
      chatService.sendSupportMessage({
        userId: user.id,
        userName: profile?.company_name || profile?.full_name || 'Unknown',
        userEmail: user.email || '',
        message: textToSend,
        userLanguage: i18n.language,
        subscriptionTier: profile?.subscription_tier || 'trial',
        expoPushToken: profile?.expo_push_token || undefined,
      }).catch((err) => {
        console.log('[HomeFeedback] N8N notification failed (non-critical):', err);
      });

      // 4. Success UI
      setMessage('');
      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: t('support.message_sent'),
      });

    } catch (error) {
      console.error('[HomeFeedback] Error sending message:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('support.error_sending'),
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleRateApp = () => {
    reviewService.requestInAppReview().then((success) => {
      if (!success) {
        reviewService.openStorePage();
      }
    });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View style={styles.wrapper}>
        {/* DIRECT FEEDBACK SECTION */}
        <View style={[
          styles.container, 
          { 
            backgroundColor: theme.colors.card, 
            borderColor: theme.colors.primary, 
            borderWidth: 2,
            shadowColor: theme.colors.primary,
            shadowOpacity: 0.15,
          }
        ]}>
          <View style={styles.headerRow}>
            <View style={[styles.iconBg, { backgroundColor: theme.colors.primary + '20' }]}>
              <AlertTriangle size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                {t('feedback.title', 'Is this app actually useful?')}
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                {t('feedback.description', "I'm an owner-operator building this. Tell me honestly what sucks or what you need properly here.")}
              </Text>
            </View>
          </View>

          <View style={[
            styles.inputContainer, 
            { 
              backgroundColor: theme.colors.background, 
              borderColor: theme.colors.border 
            }
          ]}>
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder={t('feedback.placeholder', 'Type properly here so I can improve it...')}
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              value={message}
              onChangeText={setMessage}
              maxLength={1000}
            />
            <TouchableOpacity 
              style={[
                styles.sendButton, 
                { backgroundColor: message.trim() ? theme.colors.primary : theme.colors.disabled }
              ]}
              onPress={handleSend}
              disabled={!message.trim() || isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Send size={24} color="#fff" style={{ marginLeft: 2 }} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* STORE RATING SECTION */}
        <View style={[
          styles.ratingContainer, 
          { 
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          }
        ]}>
          <View style={styles.ratingContent}>
            <View style={styles.ratingTextContainer}>
              <Text style={[styles.ratingTitle, { color: theme.colors.text }]}>
                {t('feedback.enjoying_app', 'Enjoying Truxel?')}
              </Text>
              <Text style={[styles.ratingSubtitle, { color: theme.colors.textSecondary }]}>
                {t('feedback.rate_us', 'Please leave us a review on the store.')}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.rateButton, { backgroundColor: theme.colors.secondary + '15' }]}
              onPress={handleRateApp}
            >
              <Star size={20} color={theme.colors.secondary} fill={theme.colors.secondary} />
              <Text style={[styles.rateButtonText, { color: theme.colors.secondary }]}>
                {t('feedback.rate_now', 'Rate App PO')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginBottom: 40,
    marginTop: 16,
    gap: 16, // Space between feedback and rating
  },
  // Feedback Styles
  container: {
    padding: 16,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '800', // Bolder title
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderRadius: 12,
    padding: 6,
    minHeight: 100, // Taller input area
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 88,
    textAlignVertical: 'top',
    fontSize: 15,
  },
  sendButton: {
    width: 48,
    height: 48, // Bigger touch target
    borderRadius: 24, // Circle
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  
  // Rating Styles
  ratingContainer: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  ratingSubtitle: {
    fontSize: 13,
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  rateButtonText: {
    fontWeight: '700',
    fontSize: 14,
  },
});
