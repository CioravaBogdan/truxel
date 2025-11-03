import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Sparkles, TrendingUp } from 'lucide-react-native';
import { Button } from '../Button';

interface UpgradePromptModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgradeNow: () => void;
  onViewPlans: () => void;
  isProcessing?: boolean;
  trialPostsRemaining?: number;
}

export function UpgradePromptModal({
  visible,
  onClose,
  onUpgradeNow,
  onViewPlans,
  isProcessing = false,
  trialPostsRemaining,
}: UpgradePromptModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.badge}>
              <Sparkles color="#FBBF24" size={18} />
              <Text style={styles.badgeText}>{t('community.upgrade_modal.badge')}</Text>
            </View>
            <Text style={styles.title}>{t('community.upgrade_modal.title')}</Text>
            <Text style={styles.subtitle}>
              {t('community.upgrade_modal.subtitle', {
                remaining: trialPostsRemaining ?? 0,
              })}
            </Text>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.tierCard}>
              <View style={styles.tierHeader}>
                <ShieldCheck color="#2563EB" size={20} />
                <View>
                  <Text style={styles.tierName}>{t('community.upgrade_modal.tier_name')}</Text>
                  <Text style={styles.tierPrice}>{t('community.upgrade_modal.tier_price')}</Text>
                </View>
              </View>
              <Text style={styles.tierDescription}>{t('community.upgrade_modal.tier_description')}</Text>

              <View style={styles.featureList}>
                <FeatureRow text={t('community.upgrade_modal.feature_contacts')} />
                <FeatureRow text={t('community.upgrade_modal.feature_posts')} />
                <FeatureRow text={t('community.upgrade_modal.feature_support')} />
              </View>
            </View>

            <View style={styles.secondaryCard}>
              <TrendingUp color="#10B981" size={20} />
              <Text style={styles.secondaryText}>{t('community.upgrade_modal.secondary_cta')}</Text>
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <Button
              title={t('community.upgrade_modal.upgrade_now')}
              onPress={onUpgradeNow}
              loading={isProcessing}
              style={styles.primaryButton}
            />
            <Button
              title={t('community.upgrade_modal.view_plans')}
              onPress={onViewPlans}
              variant="outline"
              style={styles.secondaryButton}
            />
            <TouchableOpacity onPress={onClose} style={styles.dismiss}
              accessibilityRole="button"
              accessibilityLabel={t('community.upgrade_modal.not_now')}
            >
              <Text style={styles.dismissText}>{t('community.upgrade_modal.not_now')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function FeatureRow({ text }: { text: string }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureDot} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FDE68A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#4B5563',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 16,
  },
  tierCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tierName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  tierPrice: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  tierDescription: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  featureList: {
    gap: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
  },
  featureText: {
    fontSize: 13,
    color: '#1F2937',
    flex: 1,
  },
  secondaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 16,
  },
  secondaryText: {
    fontSize: 13,
    color: '#047857',
    flex: 1,
    lineHeight: 19,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
    gap: 12,
  },
  primaryButton: {
    width: '100%',
  },
  secondaryButton: {
    width: '100%',
  },
  dismiss: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  dismissText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
});

export default UpgradePromptModal;
