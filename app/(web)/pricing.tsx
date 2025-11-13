import React from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { WebFooter } from '@/components/web/WebFooter';
import { Check, Truck, Zap, Shield } from 'lucide-react-native';

// Pricing tiers based on Supabase + RevenueCat data
const PRICING_TIERS = [
  {
    id: 'standard',
    name: 'Standard',
    priceEUR: '29.99',
    priceUSD: '29.99',
    searches: 30,
    posts: { daily: 5, monthly: 30 },
    features: [
      '30 company searches per month',
      '5 posts per day (30/month)',
      'Basic filters',
      'Unlimited saved leads',
      'Contact visibility',
    ],
    popular: false,
    stripePriceEUR: 'price_1SL14lPd7H7rZiTmkgHF1iCZ',
    stripePriceUSD: 'price_1SRq8vPd7H7rZiTmqkNNJIlZ',
  },
  {
    id: 'pro',
    name: 'Pro',
    priceEUR: '49.99',
    priceUSD: '49.99',
    searches: 50,
    posts: { daily: 10, monthly: 100 },
    features: [
      '50 company searches per month',
      '10 posts per day (100/month)',
      'LinkedIn contact profiles',
      'AI-powered matching',
      'Advanced research tools',
      'Priority display',
      'Export leads',
    ],
    popular: true,
    stripePriceEUR: 'price_1SL14rPd7H7rZiTmKnpBjJaS',
    stripePriceUSD: 'price_1SRq8MPd7H7rZiTmtx8muOmd',
  },
  {
    id: 'fleet_manager',
    name: 'Fleet Manager',
    priceEUR: '29.99',
    priceUSD: '29.99',
    searches: 30,
    posts: { daily: 30, monthly: 900 },
    features: [
      '30 company searches per month',
      '30 posts per day (900/month)',
      '30 concurrent active posts',
      '72-hour post duration',
      'Freight forwarder tools',
      '100 saved posts',
    ],
    popular: false,
    stripePriceEUR: 'price_1SRpzzPd7H7rZiTmOQrenjIN',
    stripePriceUSD: 'price_1SRq6ePd7H7rZiTmAywE2Chw',
  },
  {
    id: 'pro_freighter',
    name: 'Pro Freighter',
    priceEUR: '49.99',
    priceUSD: '49.99',
    searches: 50,
    posts: { daily: 50, monthly: 1500 },
    features: [
      '50 company searches per month',
      '50 posts per day (1500/month)',
      'LinkedIn contact profiles',
      'AI-powered matching',
      'Advanced research tools',
      '50 concurrent active posts',
      '72-hour post duration',
      'Analytics dashboard',
      'Priority support',
      '200 saved posts',
    ],
    popular: false,
    stripePriceEUR: 'price_1SSeuIPd7H7rZiTmrvSm4KII',
    stripePriceUSD: 'price_1SSaM4Pd7H7rZiTmGAwBzJRa',
  },
];

export default function WebPricingPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [currency, setCurrency] = React.useState<'EUR' | 'USD'>('USD');
  const [expandedFaq, setExpandedFaq] = React.useState<number | null>(null);

  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.webContainer}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <Truck size={16} color="#FF6B35" />
              <Text style={styles.heroBadgeText}>{t('pricing.tier_trial', 'FREE TRIAL INCLUDED')}</Text>
            </View>
            
            <Text style={styles.heroTitle}>
              {t('web.pricing.hero_title', 'Find Loads. Find Drivers. Grow Your Business.')}
            </Text>
            
            <Text style={styles.heroSubtitle}>
              {t('web.pricing.hero_subtitle', 'Join thousands of logistics professionals connecting daily. Start free, upgrade when you\'re ready.')}
            </Text>

            <View style={styles.heroFeatures}>
              <View style={styles.heroFeature}>
                <Zap size={20} color="#FF6B35" />
                <Text style={styles.heroFeatureText}>
                  {t('web.pricing.hero_feature1', 'Instant access - no credit card required')}
                </Text>
              </View>
              <View style={styles.heroFeature}>
                <Shield size={20} color="#FF6B35" />
                <Text style={styles.heroFeatureText}>
                  {t('web.pricing.hero_feature2', 'Cancel anytime - no questions asked')}
                </Text>
              </View>
              <View style={styles.heroFeature}>
                <Check size={20} color="#FF6B35" />
                <Text style={styles.heroFeatureText}>
                  {t('web.pricing.hero_feature3', '5 free searches to test the platform')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Currency Toggle */}
        <View style={styles.currencySection}>
          <Text style={styles.currencyLabel}>{t('web.pricing.currency_label', 'Select Currency:')}</Text>
          <View style={styles.currencyToggle}>
            <TouchableOpacity
              style={[styles.currencyButton, currency === 'EUR' && styles.currencyButtonActive]}
              onPress={() => setCurrency('EUR')}
            >
              <Text style={[styles.currencyText, currency === 'EUR' && styles.currencyTextActive]}>EUR (€)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.currencyButton, currency === 'USD' && styles.currencyButtonActive]}
              onPress={() => setCurrency('USD')}
            >
              <Text style={[styles.currencyText, currency === 'USD' && styles.currencyTextActive]}>USD ($)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pricing Cards */}
        <View style={styles.pricingGrid}>
          {PRICING_TIERS.map((tier) => (
            <View
              key={tier.id}
              style={[styles.pricingCard, tier.popular && styles.popularCard]}
            >
              {tier.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>MOST POPULAR</Text>
                </View>
              )}
              
              <Text style={styles.tierName}>{tier.name}</Text>
              
              <View style={styles.priceContainer}>
                <Text style={styles.priceSymbol}>{currency === 'EUR' ? '€' : '$'}</Text>
                <Text style={styles.priceAmount}>
                  {currency === 'EUR' ? tier.priceEUR : tier.priceUSD}
                </Text>
                <Text style={styles.pricePeriod}>/month</Text>
              </View>

              <View style={styles.featuresContainer}>
                {tier.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Check size={20} color="#10B981" style={styles.checkIcon} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.ctaButton, tier.popular && styles.ctaButtonPrimary]}
                onPress={() => router.push('/(auth)/register')}
              >
                <Text style={[styles.ctaButtonText, tier.popular && styles.ctaButtonTextPrimary]}>
                  Get Started
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
          
          {/* FAQ 1 */}
          <TouchableOpacity 
            style={styles.faqItem}
            onPress={() => setExpandedFaq(expandedFaq === 0 ? null : 0)}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>Which plan is right for me?</Text>
              <Text style={styles.faqIcon}>{expandedFaq === 0 ? '−' : '+'}</Text>
            </View>
            {expandedFaq === 0 && (
              <Text style={styles.faqAnswer}>
                <Text style={styles.faqBold}>Standard</Text> is perfect for independent drivers or small operations doing 1-5 searches per week.{'\n\n'}
                <Text style={styles.faqBold}>Pro</Text> suits logistics companies that need LinkedIn contacts and AI matching for efficient prospecting.{'\n\n'}
                <Text style={styles.faqBold}>Fleet Manager</Text> is designed for freight forwarders who post many routes (30/day, 900/month).{'\n\n'}
                <Text style={styles.faqBold}>Pro Freighter</Text> combines everything - high search volume (50/month), LinkedIn, AI, and maximum posting capacity (50/day, 1500/month).
              </Text>
            )}
          </TouchableOpacity>

          {/* FAQ 2 */}
          <TouchableOpacity 
            style={styles.faqItem}
            onPress={() => setExpandedFaq(expandedFaq === 1 ? null : 1)}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>Can I change my plan later?</Text>
              <Text style={styles.faqIcon}>{expandedFaq === 1 ? '−' : '+'}</Text>
            </View>
            {expandedFaq === 1 && (
              <Text style={styles.faqAnswer}>
                Yes! You can upgrade or downgrade your plan at any time from your profile settings. Upgrades take effect immediately, and you'll be charged a prorated amount. Downgrades take effect at the end of your current billing cycle.
              </Text>
            )}
          </TouchableOpacity>

          {/* FAQ 3 */}
          <TouchableOpacity 
            style={styles.faqItem}
            onPress={() => setExpandedFaq(expandedFaq === 2 ? null : 2)}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>What payment methods do you accept?</Text>
              <Text style={styles.faqIcon}>{expandedFaq === 2 ? '−' : '+'}</Text>
            </View>
            {expandedFaq === 2 && (
              <Text style={styles.faqAnswer}>
                We accept all major credit cards (Visa, Mastercard, American Express) via Stripe. You can pay in EUR or USD. All payments are secure and encrypted. We also support Apple Pay and Google Pay on mobile devices.
              </Text>
            )}
          </TouchableOpacity>

          {/* FAQ 4 */}
          <TouchableOpacity 
            style={styles.faqItem}
            onPress={() => setExpandedFaq(expandedFaq === 3 ? null : 3)}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>Is there a free trial?</Text>
              <Text style={styles.faqIcon}>{expandedFaq === 3 ? '−' : '+'}</Text>
            </View>
            {expandedFaq === 3 && (
              <Text style={styles.faqAnswer}>
                Yes! All new users automatically start with a trial tier that includes 5 searches per month and 2 posts per day. This allows you to test the platform before committing to a paid plan. No credit card required for the trial.
              </Text>
            )}
          </TouchableOpacity>

          {/* FAQ 5 */}
          <TouchableOpacity 
            style={styles.faqItem}
            onPress={() => setExpandedFaq(expandedFaq === 4 ? null : 4)}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>What's the difference between searches and posts?</Text>
              <Text style={styles.faqIcon}>{expandedFaq === 4 ? '−' : '+'}</Text>
            </View>
            {expandedFaq === 4 && (
              <Text style={styles.faqAnswer}>
                <Text style={styles.faqBold}>Searches</Text> allow you to find logistics companies in our database with filters like location, company size, and specialization. Each search counts toward your monthly limit.{'\n\n'}
                <Text style={styles.faqBold}>Posts</Text> are your availability announcements (e.g., "I'm available in Warsaw" or "I have a route from Berlin to Paris"). Other users can see your posts and contact you directly. Post limits are daily and monthly.
              </Text>
            )}
          </TouchableOpacity>
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
  header: {
    alignItems: 'center',
    marginBottom: 64,
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 16,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 768px)': {
        fontSize: 36,
      },
    }),
  },
  subtitle: {
    fontSize: 20,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 600,
  },
  currencyToggle: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    gap: 4,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
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
    backgroundColor: '#2563EB',
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
    gap: 32,
    justifyContent: 'center',
    marginBottom: 80,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 768px)': {
        flexDirection: 'column',
        alignItems: 'center',
      },
    }),
  },
  pricingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    width: 320,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      ':hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        borderColor: '#2563EB',
      },
      '@media (max-width: 768px)': {
        width: '100%',
        maxWidth: 400,
      },
    }),
  },
  popularCard: {
    borderColor: '#2563EB',
    borderWidth: 3,
  },
  popularBadge: {
    backgroundColor: '#2563EB',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 16,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  tierName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 24,
  },
  priceSymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2563EB',
    marginTop: 8,
  },
  priceAmount: {
    fontSize: 48,
    fontWeight: '800',
    color: '#1E293B',
  },
  pricePeriod: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
  },
  featuresContainer: {
    marginBottom: 32,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  checkIcon: {
    marginTop: 2,
  },
  featureText: {
    fontSize: 15,
    color: '#475569',
    flex: 1,
  },
  ctaButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#E2E8F0',
      },
    }),
  },
  ctaButtonPrimary: {
    backgroundColor: '#2563EB',
    ...(Platform.OS === 'web' && {
      ':hover': {
        backgroundColor: '#1d4ed8',
      },
    }),
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  ctaButtonTextPrimary: {
    color: '#FFFFFF',
  },
  faqSection: {
    maxWidth: 800,
    marginHorizontal: 'auto',
  },
  faqTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 32,
    textAlign: 'center',
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
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
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
    fontSize: 24,
    fontWeight: '600',
    color: '#2563EB',
    marginLeft: 16,
  },
  faqAnswer: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  faqBold: {
    fontWeight: '700',
    color: '#1E293B',
  },
});
