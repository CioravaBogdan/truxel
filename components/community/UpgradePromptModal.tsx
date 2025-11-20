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
import { useTheme } from '../../lib/theme';

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
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.header, { backgroundColor: theme.colors.primary + '10' }]}>
            <View style={[styles.badge, { backgroundColor: theme.colors.warning + '20' }]}>
              <Sparkles color={theme.colors.warning} size={18} />
              <Text style={[styles.badgeText, { color: theme.colors.warning }]}>{t('community.upgrade_modal.badge')}</Text>
            </View>
            <Text style={[styles.title, { color: theme.colors.text }]}>{t('community.upgrade_modal.title')}</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {t('community.upgrade_modal.subtitle', {
                remaining: trialPostsRemaining ?? 0,
              })}
            </Text>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <View style={[styles.tierCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
              <View style={styles.tierHeader}>
                <ShieldCheck color={theme.colors.primary} size={20} />
                <View>
                  <Text style={[styles.tierName, { color: theme.colors.text }]}>{t('community.upgrade_modal.tier_name')}</Text>
                  <Text style={[styles.tierPrice, { color: theme.colors.primary }]}>{t('community.upgrade_modal.tier_price')}</Text>
                </View>
              </View>
              <Text style={[styles.tierDescription, { color: theme.colors.textSecondary }]}>{t('community.upgrade_modal.tier_description')}</Text>

              <View style={styles.featureList}>
                <FeatureRow text={t('community.upgrade_modal.feature_contacts')} color={theme.colors.text} dotColor={theme.colors.primary} />
                <FeatureRow text={t('community.upgrade_modal.feature_posts')} color={theme.colors.text} dotColor={theme.colors.primary} />
                <FeatureRow text={t('community.upgrade_modal.feature_support')} color={theme.colors.text} dotColor={theme.colors.primary} />
              </View>
            </View>

            <View style={[styles.secondaryCard, { backgroundColor: theme.colors.secondary + '10' }]}>
              <TrendingUp color={theme.colors.secondary} size={20} />
              <Text style={[styles.secondaryText, { color: theme.colors.secondary }]}>{t('community.upgrade_modal.secondary_cta')}</Text>
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
              <Text style={[styles.dismissText, { color: theme.colors.textSecondary }]}>{t('community.upgrade_modal.not_now')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function FeatureRow({ text, color, dotColor }: { text: string, color: string, dotColor: string }) {
  return (
    <View style={styles.featureRow}>
      <View style={[styles.featureDot, { backgroundColor: dotColor }]} />
      <Text style={[styles.featureText, { color: color }]}>{text}</Text>
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
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 16,
  },
  tierCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
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
  },
  tierPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  tierDescription: {
    fontSize: 13,
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
  },
  featureText: {
    fontSize: 13,
    flex: 1,
  },
  secondaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 16,
  },
  secondaryText: {
    fontSize: 13,
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
  },
});

export default UpgradePromptModal;
