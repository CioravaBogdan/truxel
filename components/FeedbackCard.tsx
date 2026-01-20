import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MessageSquare, AlertTriangle } from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { FeedbackModal } from './FeedbackModal';

export const FeedbackCard = () => {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setModalVisible(true)}
        style={[
          styles.card,
          { 
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            shadowColor: theme.colors.shadow
          }
        ]}
      >
        <View style={styles.iconContainer}>
          <View style={[styles.iconBg, { backgroundColor: theme.colors.secondary + '15' }]}>
            <AlertTriangle size={20} color={theme.colors.secondary} />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Is this app actually useful?
          </Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            I'm an owner-operator, not a pro developer. I tried to build something useful, but I need honest feedback. Tell me what sucks.
          </Text>
          <View style={styles.actionRow}>
            <Text style={[styles.actionText, { color: theme.colors.primary }]}>
              Send Direct Feedback
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      
      <FeedbackModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  iconContainer: {
    marginRight: 16,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
