import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Send, Star, MessageSquare } from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { reviewService } from '@/services/reviewService';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
}

export const FeedbackModal = ({ visible, onClose }: FeedbackModalProps) => {
  const { theme } = useTheme();
  const [feedbackText, setFeedbackText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendFeedback = async () => {
    if (!feedbackText.trim()) return;
    
    setLoading(true);
    // Simulate a small delay for UI feedback before opening mail client
    setTimeout(() => {
      reviewService.sendFeedbackEmail(feedbackText);
      setLoading(false);
      setFeedbackText('');
      onClose();
    }, 500);
  };

  const handleRateApp = () => {
    onClose();
    // Try in-app review first, fallback to store page
    reviewService.requestInAppReview().then((success) => {
      if (!success) {
        reviewService.openStorePage();
      }
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        >
          <BlurView intensity={20} style={StyleSheet.absoluteFill} />
        </TouchableOpacity>

        <View style={[styles.content, { backgroundColor: theme.colors.card }]}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                Developer Feedback
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                I'm an owner-operator building this. Tell me what's broken or what you need.
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.background }]}>
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Ex: I need a filter for... The search is slow..."
                placeholderTextColor={theme.colors.textSecondary + '80'}
                multiline
                textAlignVertical="top"
                value={feedbackText}
                onChangeText={setFeedbackText}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: theme.colors.primary },
                !feedbackText.trim() && styles.disabledButton
              ]}
              onPress={handleSendFeedback}
              disabled={!feedbackText.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.sendButtonText}>Send to Developer</Text>
                  <Send size={18} color="#fff" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

            <View style={styles.ratingContainer}>
              <Text style={[styles.ratingTitle, { color: theme.colors.text }]}>
                Enjoying Truxel?
              </Text>
              <Text style={[styles.ratingSubtitle, { color: theme.colors.textSecondary }]}>
                A 5-star rating helps other drivers find us.
              </Text>
              
              <TouchableOpacity
                style={[styles.rateButton, { borderColor: theme.colors.border }]}
                onPress={handleRateApp}
              >
                <Star size={20} color={theme.colors.warning} fill={theme.colors.warning} />
                <Text style={[styles.rateButtonText, { color: theme.colors.text }]}>
                  Rate on App Store
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  content: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    maxWidth: '90%',
    lineHeight: 20,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  inputContainer: {
    borderRadius: 12,
    padding: 12,
    height: 140,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 24,
  },
  ratingContainer: {
    alignItems: 'center',
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 50,
    borderWidth: 1,
  },
  rateButtonText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
});
