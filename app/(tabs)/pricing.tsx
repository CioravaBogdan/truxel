import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/store/authStore';
import { stripeService } from '@/services/stripeService';
import Toast from 'react-native-toast-message';
import {
  CreditCard,
  Check,
  Zap,
  Shield,
  Users,
  Sparkles,
} from 'lucide-react-native';
import { SubscriptionTierData, AdditionalSearchPack } from '@/types/database.types';
import * as WebBrowser from 'expo-web-browser';

export default function PricingScreen() {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const [tiers, setTiers] = useState<SubscriptionTierData[]>([]);
  const [searchPacks, setSearchPacks] = useState<AdditionalSearchPack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingPriceId, setProcessingPriceId] = useState<string | null>(null);

  useEffect(() => {
    loadPricingData();
  }, []);

  const loadPricingData = async () => {
    try {
      setIsLoading(true);
      const [tiersData, packsData] = await Promise.all([
        stripeService.getAvailableSubscriptionTiers(),
        stripeService.getAvailableSearchPacks(),
      ]);
      setTiers(tiersData);
      setSearchPacks(packsData);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (tier: SubscriptionTierData) => {
    if (!tier.stripe_price_id) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: 'Pricing not configured',
      });
      return;
    }

    try {
      setProcessingPriceId(tier.stripe_price_id);

      const { url } = await stripeService.createCheckoutSession(
        tier.stripe_price_id,
        'subscription',
        'myapp://subscription-success',
        'myapp://subscription-cancelled'
      );

      await WebBrowser.openBrowserAsync(url);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.message,
      });
    } finally {
      setProcessingPriceId(null);
    }
  };

  const handleBuySearchPack = async (pack: AdditionalSearchPack) => {
    if (!pack.stripe_price_id) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: 'Pricing not configured',
      });
      return;
    }

    try {
      setProcessingPriceId(pack.stripe_price_id);

      const { url } = await stripeService.createCheckoutSession(
        pack.stripe_price_id,
        'search_pack',
        'myapp://purchase-success',
        'myapp://purchase-cancelled'
      );

      await WebBrowser.openBrowserAsync(url);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.message,
      });
    } finally {
      setProcessingPriceId(null);
    }
  };

  const getTierIcon = (tierName: string) => {
    switch (tierName) {
      case 'standard':
        return <Zap size={32} color="#2563EB" />;
      case 'pro':
        return <Sparkles size={32} color="#7C3AED" />;
      case 'premium':
        return <Shield size={32} color="#DC2626" />;
      default:
        return <CreditCard size={32} color="#64748B" />;
    }
  };

  const getTierFeatures = (tier: SubscriptionTierData) => {
    const features = [
      `${tier.searches_per_month} ${t('pricing.searches_per_month')}`,
      `${t('pricing.max_results', { count: tier.max_results_per_search })}`,
    ];

    if (tier.linkedin_enabled) {
      features.push(t('pricing.linkedin_contacts'));
    }

    if (tier.ai_matching_enabled) {
      features.push(t('pricing.ai_matching'));
    }

    if (tier.advanced_research_enabled) {
      features.push(t('pricing.advanced_research'));
    }

    return features;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </SafeAreaView>
    );
  }

  const isCurrentTier = (tierName: string) => {
    return profile?.subscription_tier === tierName;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <CreditCard size={40} color="#2563EB" />
          <Text style={styles.title}>{t('pricing.title')}</Text>
          <Text style={styles.subtitle}>{t('pricing.subtitle')}</Text>
        </View>

        <View style={styles.tiersContainer}>
          {tiers.map((tier) => (
            <Card
              key={tier.id}
              style={[
                styles.tierCard,
                isCurrentTier(tier.tier_name) && styles.currentTierCard,
              ]}
            >
              {isCurrentTier(tier.tier_name) && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>
                    {t('pricing.current_plan')}
                  </Text>
                </View>
              )}

              <View style={styles.tierHeader}>
                {getTierIcon(tier.tier_name)}
                <Text style={styles.tierName}>
                  {t(`pricing.tier_${tier.tier_name}`)}
                </Text>
                <Text style={styles.tierPrice}>
                  €{tier.price.toFixed(2)}
                  <Text style={styles.tierPriceUnit}>
                    /{t('pricing.month')}
                  </Text>
                </Text>
                {tier.description && (
                  <Text style={styles.tierDescription}>{tier.description}</Text>
                )}
              </View>

              <View style={styles.featuresContainer}>
                {getTierFeatures(tier).map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Check size={20} color="#10B981" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <Button
                title={
                  isCurrentTier(tier.tier_name)
                    ? t('pricing.current_plan')
                    : t('pricing.subscribe')
                }
                onPress={() => handleSubscribe(tier)}
                disabled={isCurrentTier(tier.tier_name)}
                loading={processingPriceId === tier.stripe_price_id}
                variant={isCurrentTier(tier.tier_name) ? 'outline' : 'primary'}
              />
            </Card>
          ))}
        </View>

        {searchPacks.length > 0 && (
          <>
            <View style={styles.divider} />

            <View style={styles.section}>
              <Users size={32} color="#2563EB" />
              <Text style={styles.sectionTitle}>
                {t('pricing.additional_searches')}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {t('pricing.additional_searches_desc')}
              </Text>
            </View>

            <View style={styles.packsContainer}>
              {searchPacks.map((pack) => (
                <Card key={pack.id} style={styles.packCard}>
                  <View style={styles.packHeader}>
                    <Text style={styles.packName}>
                      {pack.searches_count} {t('pricing.searches')}
                    </Text>
                    <Text style={styles.packPrice}>€{pack.price.toFixed(2)}</Text>
                  </View>

                  <Button
                    title={t('pricing.buy_now')}
                    onPress={() => handleBuySearchPack(pack)}
                    loading={processingPriceId === pack.stripe_price_id}
                    variant="outline"
                  />
                </Card>
              ))}
            </View>
          </>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('pricing.footer_note')}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
  tiersContainer: {
    gap: 16,
  },
  tierCard: {
    padding: 24,
    position: 'relative',
  },
  currentTierCard: {
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  currentBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tierHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  tierName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
  },
  tierPrice: {
    fontSize: 40,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 8,
  },
  tierPriceUnit: {
    fontSize: 18,
    fontWeight: '400',
    color: '#64748B',
  },
  tierDescription: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: 24,
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#1E293B',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 32,
  },
  section: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
  packsContainer: {
    gap: 16,
  },
  packCard: {
    padding: 20,
  },
  packHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  packName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  packPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563EB',
  },
  footer: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});
