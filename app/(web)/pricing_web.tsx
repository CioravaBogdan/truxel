import React, { useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { WebFooter } from '@/components/web/WebFooter';
import { SeoHead } from '@/components/web/SeoHead';
import { Check, Compass, Shield, Truck, Zap, Star } from 'lucide-react-native';
import { useTheme } from '@/lib/theme';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

type Currency = 'EUR' | 'USD';

interface FeatureKey {
  id: string;
  params?: Record<string, any>;
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

const ICONS = {
  standard: Truck,
  pro: Zap,
  fleet_manager: Shield,
  pro_freighter: Compass,
};

const COMMON_FEATURES = ['feature_community', 'feature_crm', 'feature_contact', 'feature_sharing'];

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
  const { theme } = useTheme();
  const [currency, setCurrency] = useState<Currency>('USD');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const PRICING_TIERS: PricingTier[] = useMemo(() => [
    {
      id: 'standard',
      translationKey: 'standard',
      priceEUR: '29.99',
      priceUSD: '29.99',
      accentColor: '#3B82F6', // Blue (Matches GPS feature)
      featureKeys: [
        { id: 'feature_searches', params: { count: 30 } },
        { id: 'feature_results' },
        { id: 'feature_posts', params: { daily: 5, monthly: 30 } },
        { id: 'feature_community' },
        { id: 'feature_crm' },
        { id: 'feature_contact' },
        { id: 'feature_sharing' },
      ],
    },
    {
      id: 'pro',
      translationKey: 'pro',
      priceEUR: '49.99',
      priceUSD: '49.99',
      accentColor: theme.colors.secondary, // Orange (Matches Leads feature)
      popular: true,
      featureKeys: [
        { id: 'feature_searches', params: { count: 50 } },
        { id: 'feature_results' },
        { id: 'feature_posts', params: { daily: 10, monthly: 100 } },
        { id: 'feature_linkedin' },
        { id: 'feature_community' },
        { id: 'feature_crm' },
        { id: 'feature_contact' },
        { id: 'feature_sharing' },
      ],
    },
    {
      id: 'fleet_manager',
      translationKey: 'fleet',
      priceEUR: '29.99',
      priceUSD: '29.99',
      accentColor: '#10B981', // Emerald (Matches Community feature)
      featureKeys: [
        { id: 'feature_searches', params: { count: 30 } },
        { id: 'feature_results' },
        { id: 'feature_posts', params: { daily: 30, monthly: 900 } },
        { id: 'feature_concurrent', params: { count: 30 } },
        { id: 'feature_community' },
        { id: 'feature_crm' },
        { id: 'feature_contact' },
        { id: 'feature_sharing' },
      ],
    },
    {
      id: 'pro_freighter',
      translationKey: 'freighter',
      priceEUR: '49.99',
      priceUSD: '49.99',
      accentColor: '#8B5CF6', // Violet (Matches Templates feature)
      featureKeys: [
        { id: 'feature_searches', params: { count: 50 } },
        { id: 'feature_results' },
        { id: 'feature_posts', params: { daily: 50, monthly: 1500 } },
        { id: 'feature_linkedin' },
        { id: 'feature_concurrent', params: { count: 50 } },
        { id: 'feature_community' },
        { id: 'feature_crm' },
        { id: 'feature_contact' },
        { id: 'feature_sharing' },
      ],
    },
  ], [theme.colors.secondary]);

  const heroHighlights = useMemo(
    () => [
      { icon: Zap, text: t('web.pricing.hero_feature1') },
      { icon: Shield, text: t('web.pricing.hero_feature2') },
      { icon: Check, text: t('web.pricing.hero_feature3') },
    ],
    [t],
  );

  const seoDescription =
    'Planurile Truxel pentru soferi, dispeceri si manageri de flota includ lead-uri verificate, harta live, CRM si automatizari pentru transport.';

  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <>
      <SeoHead
        title="Preturi Truxel | Planuri pentru soferi, flote si companii de transport"
        description={seoDescription}
        path="/pricing_web"
      />

      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      {/* Hero Section with Gradient */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroGradient}
      >
        <View style={styles.heroContent}>
          <View style={styles.heroBadge}>
            <Star size={16} color="#FFC107" fill="#FFC107" />
            <Text style={styles.heroBadgeText}>{t('web.pricing.hero_badge')}</Text>
          </View>
          
          <Text style={styles.heroTitle}>
            {t('web.pricing.hero_title')}
          </Text>
          
          <Text style={styles.heroSubtitle}>
            {t('web.pricing.hero_subtitle')}
          </Text>

          <View style={styles.heroHighlights}>
            {heroHighlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <View key={index} style={styles.highlightItem}>
                  <Icon size={20} color={theme.colors.secondary} />
                  <Text style={styles.highlightText}>{item.text}</Text>
                </View>
              );
            })}
          </View>

          {/* Currency Toggle */}
          <View style={styles.currencyToggle}>
            <Text style={[styles.currencyLabel, { color: '#94A3B8' }]}>{t('web.pricing.currency_label')}</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleOption, currency === 'EUR' && styles.toggleActive]}
                onPress={() => setCurrency('EUR')}
              >
                <Text style={[styles.toggleText, currency === 'EUR' && styles.toggleTextActive]}>EUR (€)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleOption, currency === 'USD' && styles.toggleActive]}
                onPress={() => setCurrency('USD')}
              >
                <Text style={[styles.toggleText, currency === 'USD' && styles.toggleTextActive]}>USD ($)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.webContainer}>
        {/* Pricing Cards */}
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
                  { 
                    backgroundColor: theme.colors.card,
                    borderColor: tier.popular ? tier.accentColor : theme.colors.border,
                    borderWidth: tier.popular ? 2 : 1,
                    transform: tier.popular && !isMobile ? [{ scale: 1.05 }] : [],
                    zIndex: tier.popular ? 10 : 1,
                  }
                ]}
              >
                {tier.popular && (
                  <View style={[styles.popularBadge, { backgroundColor: tier.accentColor }]}>
                    <Text style={styles.popularText}>{t('web.pricing.cta_popular')}</Text>
                  </View>
                )}

                <View style={styles.cardHeader}>
                  <View style={[styles.iconWrapper, { backgroundColor: `${tier.accentColor}1A` }]}> 
                    <IconComponent size={24} color={tier.accentColor} />
                  </View>
                  <View style={styles.cardTitleBlock}>
                    <Text style={[styles.tierName, { color: theme.colors.text }]}>{t(`${cardKey}.title`)}</Text>
                    <Text style={[styles.tierTagline, { color: theme.colors.textSecondary }]}>{t(`${cardKey}.tagline`)}</Text>
                  </View>
                </View>

                <View style={styles.priceRow}>
                  <Text style={[styles.priceSymbol, { color: theme.colors.text }]}>{priceSymbol}</Text>
                  <Text style={[styles.priceValue, { color: theme.colors.text }]}>{price}</Text>
                  <Text style={[styles.pricePeriod, { color: theme.colors.textSecondary }]}>{t('web.pricing.per_month')}</Text>
                </View>

                <Text style={[styles.tierDescription, { color: theme.colors.textSecondary }]}>
                  {t(`${cardKey}.description`)}
                </Text>

                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                <View style={styles.featuresContainer}>
                  {tier.featureKeys.map((feature) => {
                    const isCommon = COMMON_FEATURES.includes(feature.id);
                    return (
                      <View key={feature.id} style={styles.featureRow}>
                        <Check 
                          size={18} 
                          color={isCommon ? theme.colors.text : tier.accentColor} 
                          style={styles.featureIcon} 
                        />
                        <Text style={[
                          styles.featureText, 
                          { 
                            color: theme.colors.text,
                            fontWeight: isCommon ? '400' : '700',
                          }
                        ]}>
                          {t(`${cardKey}.${feature.id}`, feature.params)}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={[
                    styles.ctaButton,
                    { backgroundColor: tier.popular ? tier.accentColor : 'transparent', borderColor: tier.accentColor, borderWidth: 2 }
                  ]}
                  onPress={() => router.push('/(auth)/register')}
                >
                  <Text style={[
                    styles.ctaButtonText,
                    { color: tier.popular ? '#FFFFFF' : tier.accentColor }
                  ]}>
                    {t('web.pricing.cta')}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <View style={styles.faqSection}>
          <Text style={[styles.faqTitle, { color: theme.colors.text }]}>{t('web.pricing.faq_title')}</Text>

          {FAQ_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.questionKey}
              style={[styles.faqItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1 }]}
              onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
            >
              <View style={styles.faqHeader}>
                <Text style={[styles.faqQuestion, { color: theme.colors.text }]}>{t(`web.pricing.faq.${item.questionKey}`)}</Text>
                <Text style={[styles.faqIcon, { color: theme.colors.secondary }]}>{expandedFaq === index ? '−' : '+'}</Text>
              </View>

              {expandedFaq === index && (
                <View style={[styles.faqAnswerBlock, { borderTopColor: theme.colors.border }]}>
                  {item.answerKeys.map((answerKey) => (
                    <Text key={answerKey} style={[styles.faqAnswerText, { color: theme.colors.textSecondary }]}>
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroGradient: {
    paddingTop: 120,
    paddingBottom: 100,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroContent: {
    maxWidth: 1200,
    width: '100%',
    alignItems: 'center',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    marginBottom: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroBadgeText: {
    color: '#FFC107',
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: isMobile ? 42 : 64,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: isMobile ? 48 : 72,
    marginBottom: 24,
    maxWidth: 900,
  },
  heroSubtitle: {
    fontSize: isMobile ? 18 : 24,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 700,
    marginBottom: 48,
    lineHeight: 32,
  },
  heroHighlights: {
    flexDirection: isMobile ? 'column' : 'row',
    gap: 24,
    marginBottom: 48,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
  },
  highlightText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '500',
  },
  currencyToggle: {
    alignItems: 'center',
    gap: 12,
  },
  currencyLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  toggleOption: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: '#FFFFFF',
  },
  toggleText: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 14,
  },
  toggleTextActive: {
    color: '#0F172A',
  },
  webContainer: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 80,
    marginTop: -60, // Overlap hero
  },
  pricingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    justifyContent: 'center',
    alignItems: 'stretch',
    marginBottom: 80,
  },
  pricingCard: {
    width: isMobile ? '100%' : '48%', // 2 columns
    minWidth: 280,
    borderRadius: 24,
    padding: 24,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 40,
    paddingVertical: 4,
    borderRadius: 100,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleBlock: {
    flex: 1,
    gap: 4,
  },
  tierName: {
    fontSize: 18,
    fontWeight: '700',
  },
  tierTagline: {
    fontSize: 12,
    maxWidth: 150,
  },
  tierDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    minHeight: 60, // Ensure alignment
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  priceSymbol: {
    fontSize: 24,
    fontWeight: '600',
    marginRight: 4,
  },
  priceValue: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
  },
  pricePeriod: {
    fontSize: 14,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    marginBottom: 24,
  },
  featuresContainer: {
    gap: 16,
    marginBottom: 32,
    flex: 1,
  },
  featureRow: {
    flexDirection: 'row',
    gap: 12,
  },
  featureIcon: {
    marginTop: 2,
  },
  featureText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  ctaButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  faqSection: {
    maxWidth: 800,
    marginHorizontal: 'auto',
    width: '100%',
  },
  faqTitle: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 48,
    textAlign: 'center',
  },
  faqItem: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 16,
  },
  faqIcon: {
    fontSize: 20,
    fontWeight: '600',
  },
  faqAnswerBlock: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  faqAnswerText: {
    fontSize: 16,
    lineHeight: 24,
  },
});
