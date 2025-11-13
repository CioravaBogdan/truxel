import React, { useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { WebFooter } from '@/components/web/WebFooter';
import { Check, Compass, Shield, Truck, Zap } from 'lucide-react-native';

type Currency = 'EUR' | 'USD';

const BRAND_ORANGE = '#FF6B35';

interface FeatureKey {
  id: string;
  params?: Record<string, number>;
}

interface PricingTier {
  id: 'standard' | 'pro' | 'fleet_manager' | 'pro_freighter';
  translationKey: 'standard' | 'pro' | 'fleet' | 'freighter';
  priceEUR: string;
  priceUSD: string;
  accentColor: string;
  popular?: boolean;
  featureKeys: FeatureKey[];
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'standard',
    translationKey: 'standard',
    priceEUR: '29.99',
    priceUSD: '29.99',
    accentColor: BRAND_ORANGE,
    featureKeys: [
      { id: 'feature_searches', params: { count: 30 } },
      { id: 'feature_posts', params: { daily: 5, monthly: 30 } },
      { id: 'feature_filters' },
      { id: 'feature_saves' },
    ],
  },
  {
    id: 'pro',
    translationKey: 'pro',
    priceEUR: '49.99',
    priceUSD: '49.99',
    accentColor: '#2563EB',
    popular: true,
    featureKeys: [
      { id: 'feature_searches', params: { count: 50 } },
      { id: 'feature_posts', params: { daily: 10, monthly: 100 } },
      { id: 'feature_linkedin' },
      { id: 'feature_ai' },
      { id: 'feature_research' },
      { id: 'feature_priority' },
      { id: 'feature_export' },
    ],
  },
  {
    id: 'fleet_manager',
    translationKey: 'fleet',
    priceEUR: '29.99',
    priceUSD: '29.99',
    accentColor: '#0EA5E9',
    featureKeys: [
      { id: 'feature_searches', params: { count: 30 } },
      { id: 'feature_posts', params: { daily: 30, monthly: 900 } },
      { id: 'feature_concurrent', params: { count: 30 } },
      { id: 'feature_duration', params: { hours: 72 } },
      { id: 'feature_tools' },
      { id: 'feature_saved', params: { count_saved: 100 } },
    ],
  },
  {
    id: 'pro_freighter',
    translationKey: 'freighter',
    priceEUR: '49.99',
    priceUSD: '49.99',
    accentColor: '#0EA765',
    featureKeys: [
      { id: 'feature_searches', params: { count: 50 } },
      { id: 'feature_posts', params: { daily: 50, monthly: 1500 } },
      { id: 'feature_linkedin' },
      { id: 'feature_ai' },
      { id: 'feature_research' },
      { id: 'feature_concurrent', params: { count: 50 } },
      { id: 'feature_duration', params: { hours: 72 } },
      { id: 'feature_analytics' },
      { id: 'feature_support' },
      { id: 'feature_saved', params: { count_saved: 200 } },
    ],
  },
];

const ICONS = {
  standard: Truck,
  pro: Zap,
  fleet_manager: Shield,
  pro_freighter: Compass,
};

const FAQ_ITEMS = [
  {
    questionKey: 'q1',
    answerKeys: ['a1_part_standard', 'a1_part_pro', 'a1_part_fleet', 'a1_part_freighter'],
  },
  { questionKey: 'q2', answerKeys: ['a2'] },
  { questionKey: 'q3', answerKeys: ['a3'] },
  { questionKey: 'q4', answerKeys: ['a4_part_search', 'a4_part_post'] },
  { questionKey: 'q5', answerKeys: ['a5'] },
];

export default function WebPricingPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [currency, setCurrency] = useState<Currency>('USD');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  if (Platform.OS !== 'web') {
    return null;
  }

  const heroHighlights = useMemo(
    () => [
      { icon: Zap, text: t('web.pricing.hero_feature1') },
      { icon: Shield, text: t('web.pricing.hero_feature2') },
      { icon: Check, text: t('web.pricing.hero_feature3') },
    ],
    [t],
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.webContainer}>
        <View style={styles.hero}>
          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <Truck size={16} color={BRAND_ORANGE} />
              <Text style={styles.heroBadgeText}>{t('web.pricing.hero_badge')}</Text>
            </View>

            <Text style={styles.heroTitle}>{t('web.pricing.hero_title')}</Text>
            <Text style={styles.heroSubtitle}>{t('web.pricing.hero_subtitle')}</Text>

            <View style={styles.heroHighlights}>
              {heroHighlights.map((item, index) => {
                const Icon = item.icon;
                return (
                  <View key={index} style={styles.heroHighlight}>
                    <Icon size={18} color={BRAND_ORANGE} />
                    <Text style={styles.heroHighlightText}>{item.text}</Text>
                  </View>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.heroCta}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.heroCtaText}>{t('web.pricing.hero_cta')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.currencySection}>
          <Text style={styles.currencyLabel}>{t('web.pricing.currency_label')}</Text>
          <View style={styles.currencyToggle}>
            <TouchableOpacity
              style={[styles.currencyButton, currency === 'EUR' && styles.currencyButtonActive]}
              onPress={() => setCurrency('EUR')}
            >
              <Text
                style={[styles.currencyText, currency === 'EUR' && styles.currencyTextActive]}
              >
                {t('web.pricing.currency_eur')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.currencyButton, currency === 'USD' && styles.currencyButtonActive]}
              onPress={() => setCurrency('USD')}
            >
              <Text
                style={[styles.currencyText, currency === 'USD' && styles.currencyTextActive]}
              >
                {t('web.pricing.currency_usd')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.pricingGrid}>
          {PRICING_TIERS.map((tier) => {
            const price = currency === 'EUR' ? tier.priceEUR : tier.priceUSD;
            const priceSymbol = currency === 'EUR' ? '€' : '$';
            const cardKey = `web.pricing.cards.${tier.translationKey}` as const;
            const IconComponent = ICONS[tier.id];

            return (
              <View
                key={tier.id}
                style={[
                  styles.pricingCard,
                  tier.popular && styles.pricingCardPopular,
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.iconWrapper, { backgroundColor: `${tier.accentColor}1A` }]}> 
                    <IconComponent size={24} color={tier.accentColor} />
                  </View>
                  <View style={styles.cardTitleBlock}>
                    <Text style={styles.tierName}>{t(`${cardKey}.title`)}</Text>
                    <Text style={styles.tierTagline}>{t(`${cardKey}.tagline`)}</Text>
                  </View>
                  {tier.popular && (
                    <View style={styles.popularChip}>
                      <Text style={styles.popularChipText}>{t('web.pricing.cta_popular')}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.priceRow}>
                  <Text style={[styles.priceSymbol, { color: tier.accentColor }]}>{priceSymbol}</Text>
                  <Text style={styles.priceValue}>{price}</Text>
                  <Text style={styles.pricePeriod}>{t('web.pricing.per_month')}</Text>
                </View>

                <View style={styles.featuresContainer}>
                  {tier.featureKeys.map((feature) => (
                    <View key={feature.id} style={styles.featureRow}>
                      <Check size={18} color={tier.accentColor} style={styles.featureIcon} />
                      <Text style={styles.featureText}>
                        {t(`${cardKey}.${feature.id}`, feature.params)}
                      </Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.ctaButton, { backgroundColor: tier.accentColor }]}
                  onPress={() => router.push('/(auth)/register')}
                >
                  <Text style={styles.ctaButtonText}>{t('web.pricing.cta')}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>{t('web.pricing.faq_title')}</Text>

          {FAQ_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.questionKey}
              style={styles.faqItem}
              onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{t(`web.pricing.faq.${item.questionKey}`)}</Text>
                <Text style={styles.faqIcon}>{expandedFaq === index ? '−' : '+'}</Text>
              </View>

              {expandedFaq === index && (
                <View style={styles.faqAnswerBlock}>
                  {item.answerKeys.map((answerKey) => (
                    <Text key={answerKey} style={styles.faqAnswerText}>
                      {t(`web.pricing.faq.${answerKey}`)}
                    </Text>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <WebFooter />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  webContainer: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 80,
  },
  hero: {
    marginBottom: 56,
    borderRadius: 24,
    padding: 40,
    backgroundColor: '#FFF7F2',
    ...(Platform.OS === 'web' && {
      backgroundImage: 'linear-gradient(135deg, #FF6B35 0%, #FF9156 100%)',
      color: '#FFFFFF',
      boxShadow: '0 25px 50px -12px rgba(255, 107, 53, 0.35)',
    }),
  },
  heroContent: {
    gap: 24,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  heroBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  heroTitle: {
    fontSize: 44,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 52,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 768px)': {
        fontSize: 32,
        lineHeight: 40,
      },
    }),
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 28,
    maxWidth: 640,
  },
  heroHighlights: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  heroHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  heroHighlightText: {
    fontSize: 15,
    color: '#FFFFFF',
    maxWidth: 240,
  },
  heroCta: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 999,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 20px 25px -15px rgba(0,0,0,0.35)',
      },
    }),
  },
  heroCtaText: {
    fontSize: 16,
    fontWeight: '700',
    color: BRAND_ORANGE,
    letterSpacing: 0.4,
  },
  currencySection: {
    marginBottom: 40,
    gap: 12,
    alignItems: 'center',
  },
  currencyLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  currencyToggle: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    gap: 4,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 10px 25px -15px rgba(15, 23, 42, 0.25)',
    }),
  },
  currencyButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  currencyButtonActive: {
    backgroundColor: BRAND_ORANGE,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  currencyTextActive: {
    color: '#FFFFFF',
  },
  pricingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    justifyContent: 'space-between',
    marginBottom: 80,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 1024px)': {
        gap: 20,
      },
    }),
  },
  pricingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '48%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 24,
    ...(Platform.OS === 'web' && {
      transition: 'all 0.3s ease',
      boxShadow: '0 25px 50px -20px rgba(15, 23, 42, 0.2)',
      ':hover': {
        transform: 'translateY(-10px)',
        boxShadow: '0 35px 60px -30px rgba(15, 23, 42, 0.4)',
      },
      '@media (max-width: 1024px)': {
        width: '100%',
      },
    }),
  },
  pricingCardPopular: {
    borderWidth: 2,
    borderColor: BRAND_ORANGE,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleBlock: {
    flex: 1,
    gap: 4,
  },
  popularChip: {
    backgroundColor: 'rgba(255, 107, 53, 0.12)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  popularChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: BRAND_ORANGE,
    letterSpacing: 0.6,
  },
  tierName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  tierTagline: {
    fontSize: 15,
    color: '#64748B',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  priceSymbol: {
    fontSize: 24,
    fontWeight: '700',
  },
  priceValue: {
    fontSize: 44,
    fontWeight: '800',
    color: '#0F172A',
  },
  pricePeriod: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 6,
  },
  featuresContainer: {
    gap: 12,
    flexGrow: 1,
  },
  featureRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  featureIcon: {
    marginTop: 2,
  },
  featureText: {
    fontSize: 15,
    color: '#475569',
    flex: 1,
    lineHeight: 22,
  },
  ctaButton: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
      ':hover': {
        transform: 'translateY(-2px)',
      },
    }),
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  faqSection: {
    maxWidth: 800,
    marginHorizontal: 'auto',
  },
  faqTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 32,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        boxShadow: '0 4px 10px -2px rgba(15, 23, 42, 0.2)',
      },
    }),
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  faqIcon: {
    fontSize: 26,
    fontWeight: '600',
    color: BRAND_ORANGE,
    marginLeft: 16,
  },
  faqAnswerBlock: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  faqAnswerText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
  },
});
