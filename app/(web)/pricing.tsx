import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { WebFooter } from '@/components/web/WebFooter';
import { Check, Truck, Zap, Shield, Compass } from 'lucide-react-native';
import { useTheme } from '@/lib/theme';

type Currency = 'EUR' | 'USD';

interface PricingTier {
  id: 'standard' | 'pro' | 'fleet' | 'freighter';
  icon: any;
  priceEUR: string;
  priceUSD: string;
  accentColor: string;
  popular?: boolean;
  features: string[];
}

const FAQ_ITEMS = [
  {
    question: 'faq_which_plan',
    answer: 'faq_which_plan_answer',
  },
  {
    question: 'faq_change_plans',
    answer: 'faq_change_plans_answer',
  },
  {
    question: 'faq_payments',
    answer: 'faq_payments_answer',
  },
  {
    question: 'faq_searches_vs_posts',
    answer: 'faq_searches_vs_posts_answer',
  },
  {
    question: 'faq_cancel_access',
    answer: 'faq_cancel_access_answer',
  },
];

export default function WebPricingPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme } = useTheme();
  const [currency, setCurrency] = useState<Currency>('USD');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const TIERS: PricingTier[] = [
    {
      id: 'standard',
      icon: Truck,
      priceEUR: '29.99',
      priceUSD: '29.99',
      accentColor: theme.colors.secondary,
      features: [
        'feature_searches_30',
        'feature_posts_5_30',
        'feature_filters',
        'feature_saved',
      ],
    },
    {
      id: 'pro',
      icon: Zap,
      priceEUR: '49.99',
      priceUSD: '49.99',
      accentColor: '#2563EB',
      popular: true,
      features: [
        'feature_searches_50',
        'feature_posts_10_100',
        'feature_linkedin',
        'feature_ai',
        'feature_research',
        'feature_priority',
        'feature_export',
      ],
    },
    {
      id: 'fleet',
      icon: Shield,
      priceEUR: '29.99',
      priceUSD: '29.99',
      accentColor: '#0EA5E9',
      features: [
        'feature_searches_30',
        'feature_posts_30_900',
        'feature_concurrent_30',
        'feature_duration_72',
        'feature_workflows',
        'feature_templates_100',
      ],
    },
    {
      id: 'freighter',
      icon: Compass,
      priceEUR: '49.99',
      priceUSD: '49.99',
      accentColor: '#0EA765',
      features: [
        'feature_searches_50',
        'feature_posts_50_1500',
        'feature_linkedin',
        'feature_ai_dispatch',
        'feature_research_multi',
        'feature_concurrent_50',
        'feature_duration_72_refresh',
        'feature_analytics',
        'feature_support_priority',
        'feature_templates_200',
      ],
    },
  ];

  const handleGetStarted = () => {
    if (Platform.OS === 'web') {
      router.push('/register');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={[styles.hero, { backgroundColor: theme.colors.secondary }]}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{t('web.pricing.hero_badge')}</Text>
        </View>
        
        <Text style={styles.heroTitle}>{t('web.pricing.hero_title')}</Text>
        <Text style={styles.heroSubtitle}>{t('web.pricing.hero_subtitle')}</Text>

        <View style={styles.highlights}>
          <View style={styles.highlight}>
            <Check size={16} color="white" strokeWidth={2.5} />
            <Text style={styles.highlightText}>{t('web.pricing.hero_feature1')}</Text>
          </View>
          <View style={styles.highlight}>
            <Check size={16} color="white" strokeWidth={2.5} />
            <Text style={styles.highlightText}>{t('web.pricing.hero_feature2')}</Text>
          </View>
          <View style={styles.highlight}>
            <Check size={16} color="white" strokeWidth={2.5} />
            <Text style={styles.highlightText}>{t('web.pricing.hero_feature3')}</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.ctaButton, { backgroundColor: theme.colors.card }]} onPress={handleGetStarted}>
          <Text style={[styles.ctaButtonText, { color: theme.colors.secondary }]}>{t('web.pricing.hero_cta')}</Text>
        </TouchableOpacity>
      </View>

      {/* Currency Toggle */}
      <View style={styles.currencySection}>
        <Text style={[styles.currencyLabel, { color: theme.colors.text }]}>{t('web.pricing.currency_label')}</Text>
        <View style={[styles.currencyToggle, { backgroundColor: theme.colors.card, shadowColor: theme.shadows.small.shadowColor }]}>
          <TouchableOpacity
            style={[styles.currencyButton, currency === 'EUR' && { backgroundColor: theme.colors.secondary }]}
            onPress={() => setCurrency('EUR')}
          >
            <Text style={[styles.currencyButtonText, { color: currency === 'EUR' ? theme.colors.white : theme.colors.textSecondary }]}>
              {t('web.pricing.currency_eur')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.currencyButton, currency === 'USD' && { backgroundColor: theme.colors.secondary }]}
            onPress={() => setCurrency('USD')}
          >
            <Text style={[styles.currencyButtonText, { color: currency === 'USD' ? theme.colors.white : theme.colors.textSecondary }]}>
              {t('web.pricing.currency_usd')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pricing Cards */}
      <View style={styles.pricingGrid}>
        {TIERS.map((tier) => {
          const Icon = tier.icon;
          const price = currency === 'EUR' ? tier.priceEUR : tier.priceUSD;
          const currencySymbol = currency === 'EUR' ? '€' : '$';

          return (
            <View
              key={tier.id}
              style={[
                styles.pricingCard,
                { 
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                  shadowColor: theme.shadows.medium.shadowColor 
                },
                tier.popular && { borderColor: tier.accentColor, borderWidth: 2 },
              ]}
            >
              {tier.popular && (
                <View style={[styles.popularBadge, { backgroundColor: tier.accentColor }]}>
                  <Text style={styles.popularBadgeText}>{t('web.pricing.cta_popular')}</Text>
                </View>
              )}

              <View style={[styles.iconCircle, { backgroundColor: `${tier.accentColor}15` }]}>
                <Icon size={28} color={tier.accentColor} strokeWidth={2} />
              </View>

              <Text style={[styles.tierTitle, { color: theme.colors.text }]}>{t(`web.pricing.cards.${tier.id}.title`)}</Text>
              <Text style={[styles.tierTagline, { color: theme.colors.textSecondary }]}>{t(`web.pricing.cards.${tier.id}.tagline`)}</Text>

              <View style={styles.priceRow}>
                <Text style={[styles.price, { color: tier.accentColor }]}>
                  {currencySymbol}{price}
                </Text>
                <Text style={[styles.perMonth, { color: theme.colors.textSecondary }]}>{t('web.pricing.per_month')}</Text>
              </View>

              <View style={styles.features}>
                {tier.features.map((featureKey, index) => (
                  <View key={index} style={styles.feature}>
                    <Check size={18} color={tier.accentColor} strokeWidth={2.5} />
                    <Text style={[styles.featureText, { color: theme.colors.text }]}>
                      {t(`web.pricing.cards.${tier.id}.${featureKey}`)}
                    </Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.tierButton,
                  tier.popular
                    ? { backgroundColor: tier.accentColor }
                    : { backgroundColor: theme.colors.card, borderWidth: 2, borderColor: tier.accentColor },
                ]}
                onPress={handleGetStarted}
              >
                <Text
                  style={[
                    styles.tierButtonText,
                    tier.popular ? { color: 'white' } : { color: tier.accentColor },
                  ]}
                >
                  {t('web.pricing.cta')}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {/* FAQ Section */}
      <View style={styles.faqSection}>
        <Text style={[styles.faqTitle, { color: theme.colors.text }]}>{t('web.pricing.faq_title')}</Text>
        
        <View style={styles.faqList}>
          {FAQ_ITEMS.map((item, index) => {
            const isExpanded = expandedFaq === index;
            return (
              <View key={index} style={[styles.faqItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => setExpandedFaq(isExpanded ? null : index)}
                >
                  <Text style={[styles.faqQuestionText, { color: theme.colors.text }]}>{t(`web.pricing.${item.question}`)}</Text>
                  <Text style={[styles.faqIcon, { color: theme.colors.secondary }]}>{isExpanded ? '−' : '+'}</Text>
                </TouchableOpacity>
                {isExpanded && (
                  <View style={styles.faqAnswer}>
                    <Text style={[styles.faqAnswerText, { color: theme.colors.textSecondary }]}>{t(`web.pricing.${item.answer}`)}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>

      <WebFooter />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    padding: 48,
    borderRadius: 24,
    margin: 24,
    marginTop: 40,
    alignItems: 'flex-start',
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  badgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    lineHeight: 56,
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'white',
    marginBottom: 32,
    opacity: 0.95,
    lineHeight: 28,
  },
  highlights: {
    gap: 12,
    marginBottom: 32,
  },
  highlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  highlightText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
  ctaButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  currencySection: {
    alignItems: 'center',
    marginVertical: 40,
  },
  currencyLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  currencyToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  currencyButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  currencyButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  pricingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 24,
    marginBottom: 60,
  },
  pricingCard: {
    width: 320,
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    position: 'relative',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  popularBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  popularBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  tierTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tierTagline: {
    fontSize: 14,
    marginBottom: 24,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  price: {
    fontSize: 48,
    fontWeight: 'bold',
    marginRight: 8,
  },
  perMonth: {
    fontSize: 16,
  },
  features: {
    gap: 12,
    marginBottom: 32,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  tierButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  tierButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  faqSection: {
    maxWidth: 800,
    marginHorizontal: 'auto',
    width: '100%',
    paddingHorizontal: 24,
    marginBottom: 60,
  },
  faqTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 48,
  },
  faqList: {
    gap: 16,
  },
  faqItem: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
  },
  faqQuestionText: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
  },
  faqIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  faqAnswer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 0,
  },
  faqAnswerText: {
    fontSize: 15,
    lineHeight: 24,
  },
});
