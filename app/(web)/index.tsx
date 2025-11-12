import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import {
  MapPin, Users, FileText, Globe, MessageSquare, Linkedin,
  Brain, Bell, Zap, TrendingUp, Target, Star, CheckCircle
} from 'lucide-react-native';
import { WebFooter } from '@/components/web/WebFooter';

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
    { q: t('web.faq.q1'), a: t('web.faq.a1') },
    { q: t('web.faq.q2'), a: t('web.faq.a2') },
    { q: t('web.faq.q3'), a: t('web.faq.a3') },
    { q: t('web.faq.q4'), a: t('web.faq.a4') },
    { q: t('web.faq.q5'), a: t('web.faq.a5') },
    { q: t('web.faq.q6'), a: t('web.faq.a6') },
    { q: t('web.faq.q7'), a: t('web.faq.a7') },
    { q: t('web.faq.q8'), a: t('web.faq.a8') },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <View style={styles.heroBackground}>
          <View style={styles.floatingShape1} />
          <View style={styles.floatingShape2} />
          <View style={styles.floatingShape3} />
        </View>
        <View style={styles.section}>
          <Text style={styles.heroTitle}>{t('web.hero.title')}</Text>
          <Text style={styles.heroSubtitle}>{t('web.hero.subtitle')}</Text>
          <View style={styles.heroButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.primaryButtonText}>{t('web.hero.cta_primary')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/(web)/features')}
            >
              <Text style={styles.secondaryButtonText}>{t('web.cta.learn_more')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Trust Badge Section */}
      <View style={styles.trustSection}>
        <View style={styles.trustContent}>
          <View style={styles.trustIconGroup}>
            <Star size={32} color="#ff6b35" fill="#ff6b35" />
            <Star size={32} color="#ff6b35" fill="#ff6b35" />
            <Star size={32} color="#ff6b35" fill="#ff6b35" />
            <Star size={32} color="#ff6b35" fill="#ff6b35" />
            <Star size={32} color="#ff6b35" fill="#ff6b35" />
          </View>
          <Text style={styles.trustTitle}>{t('web.hero.trust_badge')}</Text>
          <View style={styles.trustFeatures}>
            <View style={styles.trustFeatureItem}>
              <CheckCircle size={20} color="#0fb988" />
              <Text style={styles.trustFeatureText}>No Broker Fees</Text>
            </View>
            <View style={styles.trustFeatureItem}>
              <CheckCircle size={20} color="#0fb988" />
              <Text style={styles.trustFeatureText}>Find Shippers in Dead Zones</Text>
            </View>
            <View style={styles.trustFeatureItem}>
              <CheckCircle size={20} color="#0fb988" />
              <Text style={styles.trustFeatureText}>Instant Contact Methods</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Problem-Solution Section */}
      <View style={[styles.section, styles.problemSolution]}>
        <View style={styles.twoColumn}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>{t('web.problem_solution.problem_title')}</Text>
            <Text style={styles.sectionText}>{t('web.problem_solution.problem_desc')}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>{t('web.problem_solution.solution_title')}</Text>
            <Text style={styles.sectionText}>{t('web.problem_solution.solution_desc')}</Text>
          </View>
        </View>
      </View>

      {/* How It Works */}
      <View style={[styles.section, styles.howItWorks]}>
        <Text style={styles.mainTitle}>{t('web.how_it_works.title')}</Text>
        <Text style={styles.mainSubtitle}>{t('web.how_it_works.subtitle')}</Text>
        <View style={styles.steps}>
          {[1, 2, 3, 4].map((num) => (
            <View key={num} style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{num}</Text>
              </View>
              <Text style={styles.stepTitle}>{t(`web.how_it_works.step${num}_title`)}</Text>
              <Text style={styles.stepDesc}>{t(`web.how_it_works.step${num}_desc`)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Features Grid */}
      <View style={[styles.section, styles.features]}>
        <Text style={styles.mainTitle}>{t('web.features.title')}</Text>
        <Text style={styles.mainSubtitle}>{t('web.features.subtitle')}</Text>
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <View key={index} style={styles.featureCard}>
                <Icon size={32} color="#2563EB" />
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDesc}>{feature.desc}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Social Proof */}
      <View style={[styles.section, styles.socialProof]}>
        <Text style={styles.mainTitle}>{t('web.social_proof.title')}</Text>
        <View style={styles.testimonials}>
          {[1, 2, 3].map((num) => (
            <View key={num} style={styles.testimonialCard}>
              <Text style={styles.testimonialText}>"{t(`web.social_proof.testimonial${num}`)}"</Text>
              <Text style={styles.testimonialAuthor}>{t(`web.social_proof.testimonial${num}_author`)}</Text>
            </View>
          ))}
        </View>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>1000+</Text>
            <Text style={styles.statLabel}>{t('web.social_proof.stats_drivers')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>5000+</Text>
            <Text style={styles.statLabel}>{t('web.social_proof.stats_companies')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>6</Text>
            <Text style={styles.statLabel}>{t('web.social_proof.stats_countries')}</Text>
          </View>
        </View>
      </View>

      {/* FAQ */}
      <View style={[styles.section, styles.faq]}>
        <Text style={styles.mainTitle}>{t('web.faq.title')}</Text>
        <View style={styles.faqList}>
          {faqs.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={styles.faqQuestion}>{faq.q}</Text>
              <Text style={styles.faqAnswer}>{faq.a}</Text>
            </View>
          ))}
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
              <Text style={styles.finalCtaBadgeText}>Built for Owner-Operators</Text>
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
                style={styles.downloadStoreButton}
                onPress={() => Linking.openURL('https://apps.apple.com')}
              >
                <Text style={styles.downloadStoreButtonText}>{t('web.final_cta.download_ios')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.downloadStoreButton}
                onPress={() => Linking.openURL('https://play.google.com')}
              >
                <Text style={styles.downloadStoreButtonText}>{t('web.final_cta.download_android')}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.finalCtaStats}>
              <View style={styles.finalCtaStat}>
                <Text style={styles.finalCtaStatNumber}>98%</Text>
                <Text style={styles.finalCtaStatLabel}>Success Rate</Text>
              </View>
              <View style={styles.finalCtaStat}>
                <Text style={styles.finalCtaStatNumber}>24/7</Text>
                <Text style={styles.finalCtaStatLabel}>Support</Text>
              </View>
              <View style={styles.finalCtaStat}>
                <Text style={styles.finalCtaStatNumber}>5★</Text>
                <Text style={styles.finalCtaStatLabel}>Rating</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <WebFooter />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  section: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    paddingHorizontal: 16,
    paddingVertical: 64,
    width: '100%',
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
    paddingVertical: 80,
    paddingHorizontal: 20,
    overflow: 'hidden',
    minHeight: 600,
    ...(Platform.OS === 'web' && {
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)',
      '@media (max-width: 768px)': {
        paddingVertical: 60,
        minHeight: 500,
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
    backgroundColor: 'rgba(37, 99, 234, 0.08)',
    ...(Platform.OS === 'web' && {
      animation: 'float 20s ease-in-out infinite',
      filter: 'blur(40px)',
    }),
  },
  floatingShape2: {
    position: 'absolute',
    bottom: '20%',
    left: '5%',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(15, 185, 136, 0.08)',
    ...(Platform.OS === 'web' && {
      animation: 'float 15s ease-in-out infinite reverse',
      filter: 'blur(40px)',
    }),
  },
  floatingShape3: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    ...(Platform.OS === 'web' && {
      animation: 'float 18s ease-in-out infinite',
      filter: 'blur(35px)',
    }),
  },
  heroTitle: {
    fontSize: 56,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: -1.5,
    color: '#0f172a',
    ...(Platform.OS === 'web' && {
      lineHeight: 64,
      '@media (max-width: 768px)': {
        fontSize: 36,
        lineHeight: 42,
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
    color: '#334155',
    textAlign: 'center',
    marginBottom: 40,
    maxWidth: 700,
    fontWeight: '500',
    lineHeight: 32,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 768px)': {
        fontSize: 18,
        lineHeight: 28,
        marginBottom: 32,
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
      background: 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%)',
      boxShadow: '0 10px 30px -5px rgba(255, 107, 53, 0.4)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '@media (max-width: 600px)': {
        width: '100%',
        paddingVertical: 18,
      },
    }),
    backgroundColor: '#ff6b35',
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 48,
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2563ea',
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
    color: '#2563ea',
    letterSpacing: 0.5,
  },
  trustSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 56,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
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
    color: '#1E293B',
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
    color: '#475569',
    ...(Platform.OS === 'web' && {
      '@media (max-width: 768px)': {
        fontSize: 16,
      },
    }),
  },
  problemSolution: {
    backgroundColor: '#FFFFFF',
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
    color: '#1E293B',
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
    color: '#64748B',
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
    ...(Platform.OS === 'web' && {
      background: 'linear-gradient(180deg, #FFFFFF 0%, #f0f9ff 50%, #e0f2fe 100%)',
    }),
    backgroundColor: '#f0f9ff',
  },
  mainTitle: {
    fontSize: 48,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: -1.5,
    color: '#0f172a',
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
    color: '#334155',
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
      background: 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%)',
      boxShadow: '0 15px 35px -10px rgba(255, 107, 53, 0.5), 0 0 0 4px rgba(255, 107, 53, 0.1)',
    }),
    backgroundColor: '#ff6b35',
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
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
  },
  stepDesc: {
    fontSize: 17,
    fontWeight: '500',
    color: '#475569',
    textAlign: 'center',
    lineHeight: 26,
  },
  features: {
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(37, 99, 234, 0.15)',
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
    color: '#0F172A',
    marginTop: 20,
    marginBottom: 12,
  },
  featureDesc: {
    fontSize: 17,
    fontWeight: '500',
    color: '#475569',
    lineHeight: 26,
  },
  socialProof: {
    position: 'relative',
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      background: 'linear-gradient(180deg, #FFFFFF 0%, #fef3f2 100%)',
    }),
    backgroundColor: '#fef3f2',
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
    backgroundColor: '#FFFFFF',
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
    color: '#1E293B',
    marginBottom: 16,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
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
    color: '#2563EB',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
    color: '#64748B',
  },
  faq: {
    backgroundColor: '#FFFFFF',
  },
  faqList: {
    gap: 24,
  },
  faqItem: {
    padding: 24,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  faqQuestion: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  faqAnswer: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
  },
  finalCtaContainer: {
    position: 'relative',
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      background: 'linear-gradient(135deg, #1e3a5f 0%, #2563ea 50%, #0fb988 100%)',
    }),
    backgroundColor: '#2563ea',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    backgroundColor: 'rgba(15, 185, 136, 0.15)',
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
    backgroundColor: 'rgba(255, 107, 53, 0.95)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 50,
    marginBottom: 24,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 10px 30px -5px rgba(255, 107, 53, 0.5)',
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
    gap: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 48,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 600px)': {
        flexDirection: 'column',
        alignItems: 'stretch',
        width: '100%',
        maxWidth: 400,
      },
    }),
  },
  signUpCtaButton: {
    paddingHorizontal: 56,
    paddingVertical: 22,
    borderRadius: 16,
    minWidth: 280,
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      background: 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%)',
      boxShadow: '0 20px 50px -10px rgba(255, 107, 53, 0.6)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      '@media (max-width: 600px)': {
        width: '100%',
        paddingVertical: 20,
      },
    }),
    backgroundColor: '#ff6b35',
  },
  signUpCtaButtonText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    ...(Platform.OS === 'web' && {
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
      '@media (max-width: 600px)': {
        fontSize: 18,
      },
    }),
  },
  downloadStoreButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
    minWidth: 200,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.2)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      '@media (max-width: 600px)': {
        width: '100%',
        paddingVertical: 14,
      },
    }),
  },
  downloadStoreButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 600px)': {
        fontSize: 15,
      },
    }),
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
});
