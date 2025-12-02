import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Linking, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import {
  MapPin, Users, FileText, Globe, MessageSquare, Linkedin,
  Brain, Bell, Zap, TrendingUp, Target, Star, CheckCircle,
  Truck, Heart, Shield, Quote, DollarSign, Phone, ArrowRight
} from 'lucide-react-native';
import { WebFooter } from '@/components/web/WebFooter';
import { SeoHead } from '@/components/web/SeoHead';
import { useTheme } from '@/lib/theme';

if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes float {
      0%, 100% { transform: translate(0, 0); }
      25% { transform: translate(10px, -20px); }
      50% { transform: translate(-10px, 10px); }
      75% { transform: translate(15px, 5px); }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.6; }
      50% { transform: scale(1.1); opacity: 0.9; }
    }
    @keyframes gradientShift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
  `;
  document.head.appendChild(style);
}

export default function LandingPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useTheme();

  const trustFeatureKeys = [
    'web.hero.trust_features.no_broker_fees',
    'web.hero.trust_features.dead_zones',
    'web.hero.trust_features.instant_contact',
  ];

  const features = [
    { icon: MapPin, title: t('web.features.gps_title'), desc: t('web.features.gps_desc') },
    { icon: Zap, title: t('web.features.instant_contact_title'), desc: t('web.features.instant_contact_desc') },
    { icon: Users, title: t('web.features.community_title'), desc: t('web.features.community_desc') },
    { icon: FileText, title: t('web.features.leads_title'), desc: t('web.features.leads_desc') },
    { icon: MessageSquare, title: t('web.features.templates_title'), desc: t('web.features.templates_desc') },
    { icon: Linkedin, title: t('web.features.linkedin_title'), desc: t('web.features.linkedin_desc') },
    { icon: Brain, title: t('web.features.ai_title'), desc: t('web.features.ai_desc') },
    { icon: Bell, title: t('web.features.notifications_title'), desc: t('web.features.notifications_desc') },
  ];

  const faqs = [
    { q: t('web.faq.q1'), a: t('web.faq.a1'), icon: MapPin },
    { q: t('web.faq.q2'), a: t('web.faq.a2'), icon: Star },
    { q: t('web.faq.q3'), a: t('web.faq.a3'), icon: Target },
    { q: t('web.faq.q4'), a: t('web.faq.a4'), icon: FileText },
    { q: t('web.faq.q5'), a: t('web.faq.a5'), icon: Users },
    { q: t('web.faq.q6'), a: t('web.faq.a6'), icon: Globe },
    { q: t('web.faq.q7'), a: t('web.faq.a7'), icon: TrendingUp },
    { q: t('web.faq.q8'), a: t('web.faq.a8'), icon: CheckCircle },
  ];

  const socialProofStats = [
    {
      valueKey: 'web.social_proof.stat_values.drivers',
      labelKey: 'web.social_proof.stats_drivers',
    },
    {
      valueKey: 'web.social_proof.stat_values.companies',
      labelKey: 'web.social_proof.stats_companies',
    },
    {
      valueKey: 'web.social_proof.stat_values.countries',
      labelKey: 'web.social_proof.stats_countries',
    },
  ];

  const finalCtaStats = [
    {
      valueKey: 'web.final_cta.stats.success_rate.value',
      labelKey: 'web.final_cta.stats.success_rate.label',
    },
    {
      valueKey: 'web.final_cta.stats.support.value',
      labelKey: 'web.final_cta.stats.support.label',
    },
    {
      valueKey: 'web.final_cta.stats.rating.value',
      labelKey: 'web.final_cta.stats.rating.label',
    },
  ];

  // Passionate Navy to Warm Orange - represents the journey from the cold of the road to the warmth of success
  const heroGradient = theme.mode === 'dark'
    ? 'linear-gradient(135deg, #020617 0%, #0F172A 40%, #1a0f00 80%, #331800 100%)' // Deep Navy fading into warm amber
    : 'linear-gradient(135deg, #0F172A 0%, #1e3a5f 30%, #2d1810 70%, #4a2c17 100%)'; // Navy to warm brown - feels like a sunset on the highway

  const howItWorksGradient = theme.mode === 'dark'
    ? 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
    : 'linear-gradient(180deg, #FFFFFF 0%, #e0f2fe 50%, #f0f9ff 100%)'; // Light Blue

  const socialProofGradient = theme.mode === 'dark'
    ? 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)'
    : 'linear-gradient(180deg, #FFFFFF 0%, #e0f2fe 100%)'; // Light Blue

  const seoDescription =
    'Truxel conecteaza soferii de camion si companiile de transport cu harti live, lead-uri verificate si automatizari de comunicare, intr-o aplicatie web si mobila.';

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Truxel',
    url: 'https://truxel.io',
    description: seoDescription,
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Truxel',
    url: 'https://truxel.io',
    inLanguage: 'ro',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://truxel.io/?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <SeoHead
        title="Truxel | Platforma completa pentru transportatori si logistica"
        description={seoDescription}
        path="/"
        structuredData={[organizationSchema, websiteSchema]}
      />

      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Hero Section - Clean & Focused */}
      <View style={[styles.hero, Platform.OS === 'web' && { background: heroGradient } as any]}>
        <View style={styles.heroBackground}>
          <View style={styles.floatingShape1} />
          <View style={styles.floatingShape2} />
          <View style={styles.floatingShape3} />
        </View>
        <View style={styles.section}>
          {/* Eyebrow Badge */}
          <View style={styles.heroBadge}>
            <Truck size={16} color="#FF5722" />
            <Text style={styles.heroBadgeText}>{t('web.hero.trust_badge')}</Text>
          </View>
          
          <Text style={[styles.heroTitle, { color: Platform.OS === 'web' ? '#FFFFFF' : theme.colors.text }]}>
            {t('web.hero.title')}
          </Text>
          
          {/* Short tagline */}
          <Text style={styles.heroTagline}>
            Skip the brokers. Find shippers directly.
          </Text>
          
          <View style={styles.heroButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.primaryButtonText}>{t('web.hero.cta_primary')}</Text>
              <ArrowRight size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.secondaryButton, 
                { 
                  backgroundColor: Platform.OS === 'web' ? 'rgba(255,255,255,0.1)' : theme.colors.card, 
                  borderColor: Platform.OS === 'web' ? '#FFFFFF' : theme.colors.primary 
                }
              ]}
              onPress={() => router.push('/(web)/features')}
            >
              <Text style={[
                styles.secondaryButtonText, 
                { color: Platform.OS === 'web' ? '#FFFFFF' : theme.colors.primary }
              ]}>{t('web.cta.learn_more')}</Text>
            </TouchableOpacity>
          </View>
          
          {/* Founder Quote - Compact */}
          <View style={styles.heroFounderQuote}>
            <Text style={styles.heroQuoteText}>
              "{t('web.about.founder_quote')}"
            </Text>
            <View style={styles.heroFounderInfo}>
              <View style={styles.heroFounderAvatar}>
                <Text style={styles.heroFounderAvatarText}>GB</Text>
              </View>
              <Text style={styles.heroFounderName}>— George Bogdan, Founder</Text>
            </View>
          </View>

          {/* Mobile Experience & Download Buttons */}
          <View style={styles.mobileExperienceContainer}>
            <Text style={[styles.mobileExperienceText, { color: Platform.OS === 'web' ? 'rgba(255,255,255,0.8)' : theme.colors.textSecondary }]}>
              {t('web.hero.mobile_experience')}
            </Text>
            <View style={styles.heroStoreButtons}>
              <TouchableOpacity
                onPress={() => Linking.openURL('https://apps.apple.com/ro/app/truxel/id6739166827')}
                style={styles.storeBadgeContainer}
              >
                <Image 
                  source={require('@/assets/images/download_apple_store.svg')} 
                  style={styles.storeBadgeSmall}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => Linking.openURL('https://play.google.com/store/apps/details?id=io.truxel.app')}
                style={styles.storeBadgeContainer}
              >
                <Image 
                  source={require('@/assets/images/download_google_store.svg')} 
                  style={styles.storeBadgeSmall}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Value Props Strip - Visual Cards */}
      <View style={[styles.valuePropsBar, { backgroundColor: theme.mode === 'dark' ? '#1E293B' : '#FFFFFF' }]}>
        <View style={styles.valuePropsBarItems}>
          <View style={[styles.valuePropsCard, { backgroundColor: theme.mode === 'dark' ? '#0F172A' : '#FFF7ED' }]}>
            <View style={styles.valuePropsIconCircle}>
              <DollarSign size={20} color="#FF5722" />
            </View>
            <Text style={[styles.valuePropsCardTitle, { color: theme.colors.text }]}>Zero Broker Fees</Text>
            <Text style={[styles.valuePropsCardDesc, { color: theme.colors.textSecondary }]}>Keep 100% of your rate</Text>
          </View>
          <View style={[styles.valuePropsCard, { backgroundColor: theme.mode === 'dark' ? '#0F172A' : '#FFF7ED' }]}>
            <View style={styles.valuePropsIconCircle}>
              <MapPin size={20} color="#FF5722" />
            </View>
            <Text style={[styles.valuePropsCardTitle, { color: theme.colors.text }]}>GPS Search</Text>
            <Text style={[styles.valuePropsCardDesc, { color: theme.colors.textSecondary }]}>Find leads where you park</Text>
          </View>
          <View style={[styles.valuePropsCard, { backgroundColor: theme.mode === 'dark' ? '#0F172A' : '#FFF7ED' }]}>
            <View style={styles.valuePropsIconCircle}>
              <Phone size={20} color="#FF5722" />
            </View>
            <Text style={[styles.valuePropsCardTitle, { color: theme.colors.text }]}>Direct Contact</Text>
            <Text style={[styles.valuePropsCardDesc, { color: theme.colors.textSecondary }]}>WhatsApp, Email, Call</Text>
          </View>
          <View style={[styles.valuePropsCard, { backgroundColor: theme.mode === 'dark' ? '#0F172A' : '#FFF7ED' }]}>
            <View style={styles.valuePropsIconCircle}>
              <Users size={20} color="#FF5722" />
            </View>
            <Text style={[styles.valuePropsCardTitle, { color: theme.colors.text }]}>Driver Community</Text>
            <Text style={[styles.valuePropsCardDesc, { color: theme.colors.textSecondary }]}>Share routes & loads</Text>
          </View>
        </View>
      </View>

      {/* Features Grid - MOVED UP */}
      <View style={[styles.section, styles.features, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.mainTitle, { color: theme.colors.text }]}>{t('web.features.title')}</Text>
        <Text style={[styles.mainSubtitle, { color: theme.colors.textSecondary }]}>{t('web.features.subtitle')}</Text>
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <View key={index} style={[styles.featureCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <View style={[styles.featureIconContainer, { backgroundColor: theme.mode === 'dark' ? 'rgba(255, 87, 34, 0.15)' : '#FFF7ED' }]}>
                  <Icon size={28} color="#FF5722" />
                </View>
                <Text style={[styles.featureTitle, { color: theme.colors.text }]}>{feature.title}</Text>
                <Text style={[styles.featureDesc, { color: theme.colors.textSecondary }]}>{feature.desc}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Problem-Solution Section - Brand Colors (Navy + Orange) */}
      <View style={[styles.section, styles.problemSolution, { backgroundColor: theme.mode === 'dark' ? '#0F172A' : '#F8FAFC' }]}>
        <View style={styles.problemSolutionHeader}>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>THE REAL PROBLEM</Text>
          </View>
          <Text style={[styles.mainTitle, { color: theme.colors.text }]}>{t('web.problem_solution.problem_title')}</Text>
        </View>
        <View style={styles.twoColumn}>
          <View style={[styles.problemCard, { backgroundColor: theme.mode === 'dark' ? '#1E293B' : '#0F172A' }]}>
            <View style={styles.problemIcon}>
              <Text style={styles.problemIconText}>😤</Text>
            </View>
            <Text style={[styles.problemTitle, { color: '#FFFFFF' }]}>The Broker Trap</Text>
            <Text style={[styles.sectionText, { color: 'rgba(255, 255, 255, 0.8)' }]}>{t('web.problem_solution.problem_desc')}</Text>
          </View>
          <View style={[styles.solutionCard, { backgroundColor: '#FF5722' }]}>
            <View style={styles.solutionIcon}>
              <Text style={styles.solutionIconText}>🎯</Text>
            </View>
            <Text style={[styles.solutionTitle, { color: '#FFFFFF' }]}>{t('web.problem_solution.solution_title')}</Text>
            <Text style={[styles.sectionText, { color: 'rgba(255, 255, 255, 0.9)' }]}>{t('web.problem_solution.solution_desc')}</Text>
          </View>
        </View>
      </View>

      {/* How It Works */}
      <View style={[styles.section, styles.howItWorks, Platform.OS === 'web' && { background: howItWorksGradient } as any]}>
        <Text style={[styles.mainTitle, { color: theme.colors.text }]}>{t('web.how_it_works.title')}</Text>
        <Text style={[styles.mainSubtitle, { color: theme.colors.textSecondary }]}>{t('web.how_it_works.subtitle')}</Text>
        <View style={styles.steps}>
          {[1, 2, 3, 4].map((num) => (
            <View key={num} style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{num}</Text>
              </View>
              <Text style={[styles.stepTitle, { color: theme.colors.text }]}>{t(`web.how_it_works.step${num}_title`)}</Text>
              <Text style={[styles.stepDesc, { color: theme.colors.textSecondary }]}>{t(`web.how_it_works.step${num}_desc`)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Trust Stats Section - MOVED DOWN */}
      <View style={[styles.trustSection, { backgroundColor: theme.mode === 'dark' ? '#1E293B' : '#FFF7ED', borderColor: theme.colors.border }]}>
        <View style={styles.trustContent}>
          <View style={styles.trustIconGroup}>
            <Star size={28} color="#FF5722" fill="#FF5722" />
            <Star size={28} color="#FF5722" fill="#FF5722" />
            <Star size={28} color="#FF5722" fill="#FF5722" />
            <Star size={28} color="#FF5722" fill="#FF5722" />
            <Star size={28} color="#FF5722" fill="#FF5722" />
          </View>
          <Text style={[styles.trustSubtitle, { color: theme.colors.textSecondary }]}>Trusted by owner-operators across Europe</Text>
          <View style={styles.trustLogos}>
            <View style={[styles.trustLogoItem, { backgroundColor: theme.colors.card }]}>
              <Truck size={24} color={theme.colors.primary} />
              <Text style={[styles.trustLogoText, { color: theme.colors.text }]}>1000+</Text>
              <Text style={[styles.trustLogoLabel, { color: theme.colors.textSecondary }]}>Drivers</Text>
            </View>
            <View style={[styles.trustLogoItem, { backgroundColor: theme.colors.card }]}>
              <MapPin size={24} color={theme.colors.primary} />
              <Text style={[styles.trustLogoText, { color: theme.colors.text }]}>5000+</Text>
              <Text style={[styles.trustLogoLabel, { color: theme.colors.textSecondary }]}>Companies</Text>
            </View>
            <View style={[styles.trustLogoItem, { backgroundColor: theme.colors.card }]}>
              <Globe size={24} color={theme.colors.primary} />
              <Text style={[styles.trustLogoText, { color: theme.colors.text }]}>6</Text>
              <Text style={[styles.trustLogoLabel, { color: theme.colors.textSecondary }]}>Countries</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Social Proof / Testimonials */}
      <View style={[styles.section, styles.socialProof, Platform.OS === 'web' && { background: socialProofGradient } as any]}>
        <Text style={[styles.mainTitle, { color: theme.colors.text }]}>{t('web.social_proof.title')}</Text>
        <View style={styles.testimonials}>
          {[1, 2, 3].map((num) => (
            <View key={num} style={[styles.testimonialCard, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.testimonialText, { color: theme.colors.text }]}>"{t(`web.social_proof.testimonial${num}`)}"</Text>
              <Text style={[styles.testimonialAuthor, { color: theme.colors.primary }]}>{t(`web.social_proof.testimonial${num}_author`)}</Text>
            </View>
          ))}
        </View>
        <View style={styles.stats}>
          {socialProofStats.map((stat) => (
            <View key={stat.labelKey} style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>{t(stat.valueKey)}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t(stat.labelKey)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* FAQ */}
      <View style={[styles.section, styles.faq, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.mainTitle, { color: theme.colors.text }]}>{t('web.faq.title')}</Text>
        <View style={styles.faqGrid}>
          {faqs.map((faq, index) => {
            const Icon = faq.icon;
            return (
              <View key={index} style={[styles.faqCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Icon size={32} color={theme.colors.primary} />
                <Text style={[styles.faqQuestion, { color: theme.colors.text }]}>{faq.q}</Text>
                <Text style={[styles.faqAnswer, { color: theme.colors.textSecondary }]}>{faq.a}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Final CTA */}
      <View style={styles.finalCtaContainer}>
        <View style={styles.finalCtaBackground}>
          <View style={styles.finalCtaShape1} />
          <View style={styles.finalCtaShape2} />
        </View>
        <View style={[styles.section, styles.finalCta]}>
          <View style={styles.finalCtaContent}>
            <View style={styles.finalCtaBadge}>
              <Text style={styles.finalCtaBadgeText}>{t('web.final_cta.badge')}</Text>
            </View>
            <Text style={styles.finalCtaTitle}>{t('web.final_cta.title')}</Text>
            <Text style={styles.finalCtaSubtitle}>{t('web.final_cta.subtitle')}</Text>
            <View style={styles.downloadButtons}>
              <TouchableOpacity
                style={styles.signUpCtaButton}
                onPress={() => router.push('/(auth)/register')}
              >
                <Text style={styles.signUpCtaButtonText}>{t('web.hero.cta_primary')}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.storeButtonsRow}>
              <TouchableOpacity
                onPress={() => Linking.openURL('https://apps.apple.com')}
                style={styles.storeBadgeContainer}
              >
                <Image 
                  source={require('@/assets/images/download_apple_store.svg')} 
                  style={styles.storeBadge}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => Linking.openURL('https://play.google.com')}
                style={styles.storeBadgeContainer}
              >
                <Image 
                  source={require('@/assets/images/download_google_store.svg')} 
                  style={styles.storeBadge}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.finalCtaStats}>
              {finalCtaStats.map((stat) => (
                <View key={stat.labelKey} style={styles.finalCtaStat}>
                  <Text style={styles.finalCtaStatNumber}>{t(stat.valueKey)}</Text>
                  <Text style={styles.finalCtaStatLabel}>{t(stat.labelKey)}</Text>
                </View>
              ))}
            </View>
          </View>
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
  section: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    paddingHorizontal: 24,
    paddingVertical: 64,
    width: '100%',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      '@media (max-width: 768px)': {
        paddingHorizontal: 20,
        paddingVertical: 48,
      },
      '@media (max-width: 480px)': {
        paddingHorizontal: 16,
        paddingVertical: 40,
      },
    }),
  },
  hero: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
    overflow: 'hidden',
    minHeight: 600,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 768px)': {
        paddingVertical: 60,
        minHeight: 500,
        paddingHorizontal: 16,
      },
    }),
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  floatingShape1: {
    position: 'absolute',
    top: '10%',
    right: '10%',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 87, 34, 0.15)', // Passionate Orange
    ...(Platform.OS === 'web' && {
      animation: 'float 20s ease-in-out infinite',
      filter: 'blur(60px)',
    }),
  },
  floatingShape2: {
    position: 'absolute',
    bottom: '20%',
    left: '5%',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(15, 23, 42, 0.05)', // Subtle Navy
    ...(Platform.OS === 'web' && {
      animation: 'float 15s ease-in-out infinite reverse',
      filter: 'blur(50px)',
    }),
  },
  floatingShape3: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 87, 34, 0.1)', // Passionate Orange
    ...(Platform.OS === 'web' && {
      animation: 'float 18s ease-in-out infinite',
      filter: 'blur(45px)',
    }),
  },
  heroTitle: {
    fontSize: 56,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: -1.5,
    alignSelf: 'center',
    width: '100%',
    ...(Platform.OS === 'web' && {
      lineHeight: 64,
      '@media (max-width: 768px)': {
        fontSize: 40,
        lineHeight: 48,
        letterSpacing: -1,
      },
      '@media (max-width: 480px)': {
        fontSize: 32,
        lineHeight: 38,
      },
    }),
  },
  heroSubtitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 40,
    maxWidth: 800,
    fontWeight: '500',
    lineHeight: 32,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 20,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 768px)': {
        fontSize: 18,
        lineHeight: 28,
        marginBottom: 32,
        maxWidth: '100%',
      },
      '@media (max-width: 480px)': {
        fontSize: 16,
        lineHeight: 24,
      },
    }),
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 24,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 600px)': {
        flexDirection: 'column',
        width: '100%',
        maxWidth: 400,
      },
    }),
  },
  primaryButton: {
    paddingHorizontal: 48,
    paddingVertical: 20,
    borderRadius: 16,
    minWidth: 200,
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      background: 'linear-gradient(135deg, #FF5722 0%, #FF8A65 100%)',
      boxShadow: '0 10px 30px -5px rgba(255, 87, 34, 0.5)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      '@media (max-width: 600px)': {
        width: '100%',
        paddingVertical: 18,
      },
    }),
    backgroundColor: '#FF5722',
  },
  primaryButtonText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    ...(Platform.OS === 'web' && {
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    }),
  },
  secondaryButton: {
    paddingHorizontal: 48,
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 2,
    minWidth: 200,
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 12px -2px rgba(37, 99, 234, 0.2)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '@media (max-width: 600px)': {
        width: '100%',
        paddingVertical: 18,
      },
    }),
  },
  secondaryButtonText: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  trustSection: {
    paddingVertical: 56,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 768px)': {
        paddingVertical: 40,
      },
    }),
  },
  trustContent: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    paddingHorizontal: 16,
    alignItems: 'center',
    width: '100%',
  },
  trustIconGroup: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  trustTitle: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: -0.5,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 768px)': {
        fontSize: 26,
        marginBottom: 24,
      },
      '@media (max-width: 480px)': {
        fontSize: 22,
      },
    }),
  },
  trustFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 32,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      '@media (max-width: 768px)': {
        gap: 20,
        flexDirection: 'column',
      },
    }),
  },
  trustFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  trustFeatureText: {
    fontSize: 18,
    fontWeight: '600',
    ...(Platform.OS === 'web' && {
      '@media (max-width: 768px)': {
        fontSize: 16,
      },
    }),
  },
  problemSolution: {
  },
  twoColumn: {
    flexDirection: 'row',
    gap: 48,
    flexWrap: 'wrap',
  },
  column: {
    flex: 1,
    minWidth: 300,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 16,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 768px)': {
        fontSize: 26,
      },
      '@media (max-width: 480px)': {
        fontSize: 24,
      },
    }),
  },
  sectionText: {
    fontSize: 18,
    lineHeight: 27,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 768px)': {
        fontSize: 16,
        lineHeight: 24,
      },
    }),
  },
  howItWorks: {
    position: 'relative',
    overflow: 'hidden',
  },
  mainTitle: {
    fontSize: 48,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: -1.5,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 768px)': {
        fontSize: 36,
        letterSpacing: -1,
      },
      '@media (max-width: 480px)': {
        fontSize: 30,
      },
    }),
  },
  mainSubtitle: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 64,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 768px)': {
        fontSize: 18,
        marginBottom: 48,
      },
      '@media (max-width: 480px)': {
        fontSize: 16,
        marginBottom: 40,
      },
    }),
  },
  steps: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 32,
    justifyContent: 'center',
  },
  step: {
    flex: 1,
    minWidth: 250,
    maxWidth: 280,
    alignItems: 'center',
  },
  stepNumber: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...(Platform.OS === 'web' && {
      background: 'linear-gradient(135deg, #FF5722 0%, #FF8A65 100%)',
      boxShadow: '0 15px 35px -10px rgba(255, 87, 34, 0.5), 0 0 0 4px rgba(255, 87, 34, 0.15)',
    }),
    backgroundColor: '#FF5722',
  },
  stepNumberText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    ...(Platform.OS === 'web' && {
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    }),
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  stepDesc: {
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 26,
  },
  features: {
    position: 'relative',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  featureCard: {
    flex: 1,
    minWidth: 250,
    maxWidth: 380,
    padding: 32,
    borderRadius: 20,
    borderWidth: 2,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(37, 99, 234, 0.05)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '@media (max-width: 768px)': {
        minWidth: '100%',
        padding: 24,
      },
    }),
  },
  featureTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 20,
    marginBottom: 12,
  },
  featureDesc: {
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 26,
  },
  socialProof: {
    position: 'relative',
    overflow: 'hidden',
  },
  testimonials: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    marginBottom: 48,
  },
  testimonialCard: {
    flex: 1,
    minWidth: 280,
    padding: 24,
    borderRadius: 12,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      '@media (max-width: 768px)': {
        minWidth: '100%',
        padding: 20,
      },
    }),
  },
  testimonialText: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    fontSize: 14,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 48,
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
  },
  faq: {
    position: 'relative',
  },
  faqGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  faqCard: {
    flex: 1,
    minWidth: 250,
    maxWidth: 380,
    padding: 32,
    borderRadius: 20,
    borderWidth: 2,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(37, 99, 234, 0.05)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '@media (max-width: 768px)': {
        minWidth: '100%',
        padding: 24,
      },
    }),
  },
  faqQuestion: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 12,
  },
  faqAnswer: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  finalCtaContainer: {
    position: 'relative',
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 40%, #FF5722 100%)', // Navy to Passionate Orange - Brand colors
    }),
    backgroundColor: '#FF5722',
  },
  finalCtaBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  finalCtaShape1: {
    position: 'absolute',
    top: '-10%',
    right: '-5%',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    ...(Platform.OS === 'web' && {
      animation: 'float 25s ease-in-out infinite',
    }),
  },
  finalCtaShape2: {
    position: 'absolute',
    bottom: '-15%',
    left: '-5%',
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    ...(Platform.OS === 'web' && {
      animation: 'float 20s ease-in-out infinite reverse',
    }),
  },
  finalCta: {
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  finalCtaContent: {
    alignItems: 'center',
  },
  finalCtaBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 50,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(10px)',
      boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1)',
    }),
  },
  finalCtaBadgeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    ...(Platform.OS === 'web' && {
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    }),
  },
  finalCtaTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -1.5,
    ...(Platform.OS === 'web' && {
      textShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      '@media (max-width: 768px)': {
        fontSize: 36,
        letterSpacing: -1,
      },
      '@media (max-width: 480px)': {
        fontSize: 30,
      },
    }),
  },
  finalCtaSubtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 48,
    maxWidth: 700,
    lineHeight: 32,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 768px)': {
        fontSize: 18,
        lineHeight: 28,
        marginBottom: 36,
      },
      '@media (max-width: 480px)': {
        fontSize: 16,
        lineHeight: 24,
      },
    }),
  },
  downloadButtons: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 24,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 600px)': {
        flexDirection: 'column',
        alignItems: 'stretch',
        width: '100%',
        maxWidth: 400,
      },
    }),
  },
  storeButtonsRow: {
    flexDirection: 'row',
    gap: 24,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 48,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 600px)': {
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      },
    }),
  },
  storeBadgeContainer: {
    ...(Platform.OS === 'web' && {
      transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      ':hover': {
        transform: 'scale(1.05)',
      },
    }),
  },
  storeBadge: {
    width: 220,
    height: 66,
  },
  signUpCtaButton: {
    paddingHorizontal: 56,
    paddingVertical: 22,
    borderRadius: 16,
    minWidth: 280,
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      backgroundColor: '#FFFFFF',
      boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.2), 0 0 0 4px rgba(255, 255, 255, 0.3)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      '@media (max-width: 600px)': {
        width: '100%',
        paddingVertical: 20,
      },
    }),
    backgroundColor: '#FFFFFF',
  },
  signUpCtaButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FF5722',
    letterSpacing: 0.5,
  },
  // Hero Tagline
  heroTagline: {
    fontSize: 20,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginBottom: 32,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 768px)': {
        fontSize: 17,
        marginBottom: 24,
      },
    }),
  },
  // Hero Badge Styles
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 87, 34, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 87, 34, 0.3)',
  },
  heroBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF8A65',
    letterSpacing: 0.5,
  },
  // Value Props Bar - Redesigned with Cards
  valuePropsBar: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 768px)': {
        paddingVertical: 32,
      },
    }),
  },
  valuePropsBarItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'center',
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
    ...(Platform.OS === 'web' && {
      '@media (max-width: 900px)': {
        gap: 16,
      },
      '@media (max-width: 600px)': {
        flexDirection: 'column',
        alignItems: 'center',
      },
    }),
  },
  valuePropsCard: {
    flex: 1,
    minWidth: 220,
    maxWidth: 280,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      ':hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 30px rgba(255, 87, 34, 0.15)',
      },
      '@media (max-width: 600px)': {
        minWidth: 280,
        maxWidth: 320,
      },
    }),
  },
  valuePropsIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 87, 34, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  valuePropsCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  valuePropsCardDesc: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  valuePropsBarText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginBottom: 16,
    maxWidth: 600,
    lineHeight: 24,
  },
  valuePropsBarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valuePropsBarItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  heroValueProps: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
    marginBottom: 32,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 768px)': {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      },
    }),
  },
  heroValueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroValueText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  // Hero Founder Quote (below buttons)
  heroFounderQuote: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
    maxWidth: 600,
    opacity: 0.9,
  },
  heroQuoteIcon: {
    marginBottom: 16,
  },
  heroQuoteText: {
    fontSize: 15,
    fontWeight: '400',
    fontStyle: 'italic',
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 24,
    marginBottom: 12,
  },
  heroFounderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroFounderAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF5722',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroFounderAvatarText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroFounderName: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  // Feature Icon Container
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  // Founder Section Styles (keeping for backward compatibility)
  founderSection: {
    paddingVertical: 64,
    paddingHorizontal: 24,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 768px)': {
        paddingVertical: 48,
        paddingHorizontal: 20,
      },
    }),
  },
  founderContent: {
    maxWidth: 800,
    marginHorizontal: 'auto',
    alignItems: 'center',
  },
  founderQuoteIcon: {
    marginBottom: 20,
    opacity: 0.8,
  },
  founderQuote: {
    fontSize: 22,
    fontWeight: '500',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 32,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 768px)': {
        fontSize: 18,
        lineHeight: 28,
      },
    }),
  },
  founderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  founderAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF5722',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 12px rgba(255, 87, 34, 0.3)',
    }),
  },
  founderAvatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  founderName: {
    fontSize: 18,
    fontWeight: '700',
  },
  founderTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Trust Section Updates
  trustSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 32,
  },
  trustLogos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    justifyContent: 'center',
  },
  trustLogoItem: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    minWidth: 120,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    }),
  },
  trustLogoText: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 12,
  },
  trustLogoLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  // Problem-Solution Updates
  problemSolutionHeader: {
    alignItems: 'center',
    marginBottom: 48,
  },
  sectionBadge: {
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
    marginBottom: 16,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF5722',
    letterSpacing: 1.5,
  },
  problemCard: {
    flex: 1,
    minWidth: 300,
    padding: 32,
    borderRadius: 20,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.3)',
      '@media (max-width: 768px)': {
        minWidth: '100%',
      },
    }),
  },
  solutionCard: {
    flex: 1,
    minWidth: 300,
    padding: 32,
    borderRadius: 20,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 20px 40px -10px rgba(255, 87, 34, 0.4)',
      '@media (max-width: 768px)': {
        minWidth: '100%',
      },
    }),
  },
  problemIcon: {
    marginBottom: 16,
  },
  problemIconText: {
    fontSize: 40,
  },
  solutionIcon: {
    marginBottom: 16,
  },
  solutionIconText: {
    fontSize: 40,
  },
  problemTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
  },
  solutionTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
  },
  finalCtaStats: {
    flexDirection: 'row',
    gap: 48,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 32,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 600px)': {
        gap: 32,
      },
    }),
  },
  finalCtaStat: {
    alignItems: 'center',
  },
  finalCtaStatNumber: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    ...(Platform.OS === 'web' && {
      textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      '@media (max-width: 600px)': {
        fontSize: 32,
      },
    }),
  },
  finalCtaStatLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  // Mobile Experience Styles
  mobileExperienceContainer: {
    marginTop: 40,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  mobileExperienceText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16,
    maxWidth: 500,
    lineHeight: 24,
  },
  heroStoreButtons: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  storeBadgeSmall: {
    width: 140,
    height: 42,
  },
});
