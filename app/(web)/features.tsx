import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Dimensions, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  MapPin, Users, FileText, Globe, MessageSquare, Linkedin,
  Brain, Bell, Download, Check, Search, Map, Phone,
  ChevronRight, Star, Shield, Truck
} from 'lucide-react-native';
import { WebFooter } from '@/components/web/WebFooter';
import { useTheme } from '@/lib/theme';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

export default function FeaturesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme } = useTheme();

  type CoreFeatureKey = 'gps' | 'community' | 'leads' | 'templates';
  type HowStepKey = 'step1' | 'step2' | 'step3' | 'step4';

  const coreFeatureDetails = t('web.features_page.core.details', {
    returnObjects: true,
  }) as Record<CoreFeatureKey, string[]>;

  const howSteps = t('web.features_page.how.steps', {
    returnObjects: true,
  }) as Record<HowStepKey, { title: string; desc: string }>;

  const coreFeatures = [
    {
      icon: MapPin,
      title: t('web.features.gps_title'),
      desc: t('web.features.gps_desc'),
      details: coreFeatureDetails.gps,
      gradient: ['#3B82F6', '#1D4ED8'] // Blue gradient
    },
    {
      icon: Users,
      title: t('web.features.community_title'),
      desc: t('web.features.community_desc'),
      details: coreFeatureDetails.community,
      gradient: ['#10B981', '#059669'] // Emerald gradient
    },
    {
      icon: FileText,
      title: t('web.features.leads_title'),
      desc: t('web.features.leads_desc'),
      details: coreFeatureDetails.leads,
      gradient: ['#F59E0B', '#D97706'] // Amber gradient
    },
    {
      icon: MessageSquare,
      title: t('web.features.templates_title'),
      desc: t('web.features.templates_desc'),
      details: coreFeatureDetails.templates,
      gradient: ['#8B5CF6', '#6D28D9'] // Violet gradient
    },
  ];

  const proFeatures = [
    {
      icon: Linkedin,
      title: t('web.features.linkedin_title'),
      desc: t('web.features.linkedin_desc'),
    },
    {
      icon: Brain,
      title: t('web.features.ai_title'),
      desc: t('web.features.ai_desc'),
    },
  ];

  const howItWorks = [
    {
      step: 1,
      icon: Download,
      title: howSteps.step1.title,
      desc: howSteps.step1.desc,
    },
    {
      step: 2,
      icon: Search,
      title: howSteps.step2.title,
      desc: howSteps.step2.desc,
    },
    {
      step: 3,
      icon: Map,
      title: howSteps.step3.title,
      desc: howSteps.step3.desc,
    },
    {
      step: 4,
      icon: Phone,
      title: howSteps.step4.title,
      desc: howSteps.step4.desc,
    },
  ];

  return (
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
            <Text style={styles.heroBadgeText}>{t('web.hero.trust_badge')}</Text>
          </View>
          
          <Text style={styles.heroTitle}>
            {t('web.features_page.hero_title')}
          </Text>
          
          <Text style={styles.heroSubtitle}>
            {t('web.features_page.hero_subtitle')}
          </Text>

          <View style={styles.heroButtons}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.colors.secondary }]}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.primaryButtonText}>{t('web.hero.cta_primary')}</Text>
              <ChevronRight size={20} color="#FFF" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => router.push('/(web)/pricing')}
            >
              <Text style={styles.outlineButtonText}>{t('web.features_page.cta.secondary')}</Text>
            </TouchableOpacity>
          </View>

          {/* Stats / Trust Indicators */}
          <View style={styles.trustIndicators}>
            <View style={styles.trustItem}>
              <Shield size={24} color="#94A3B8" />
              <Text style={styles.trustText}>{t('web.hero.trust_features.no_broker_fees')}</Text>
            </View>
            <View style={styles.trustDivider} />
            <View style={styles.trustItem}>
              <Map size={24} color="#94A3B8" />
              <Text style={styles.trustText}>{t('web.hero.trust_features.dead_zones')}</Text>
            </View>
            <View style={styles.trustDivider} />
            <View style={styles.trustItem}>
              <Phone size={24} color="#94A3B8" />
              <Text style={styles.trustText}>{t('web.hero.trust_features.instant_contact')}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Core Features Grid */}
      <View style={[styles.section, { backgroundColor: theme.colors.background }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('web.features_page.core.title')}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            {t('web.features_page.core.subtitle')}
          </Text>
        </View>

        <View style={styles.gridContainer}>
          {coreFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <View key={index} style={[styles.card, { backgroundColor: theme.colors.card, shadowColor: theme.colors.text }]}>
                <LinearGradient
                  colors={feature.gradient}
                  style={styles.iconContainer}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Icon size={32} color="#FFFFFF" />
                </LinearGradient>
                
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{feature.title}</Text>
                <Text style={[styles.cardDesc, { color: theme.colors.textSecondary }]}>{feature.desc}</Text>
                
                <View style={styles.divider} />
                
                <View style={styles.detailsList}>
                  {feature.details.map((detail, idx) => (
                    <View key={idx} style={styles.detailItem}>
                      <View style={[styles.checkCircle, { backgroundColor: theme.colors.success + '20' }]}>
                        <Check size={12} color={theme.colors.success} />
                      </View>
                      <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>{detail}</Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* How It Works - Dark Section */}
      <View style={[styles.darkSection, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: '#FFFFFF' }]}>
            {t('web.features_page.how.title')}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: '#94A3B8' }]}>
            {t('web.features_page.how.subtitle')}
          </Text>
        </View>

        <View style={styles.stepsGrid}>
          {howItWorks.map((item, index) => {
            const Icon = item.icon;
            return (
              <View key={index} style={styles.stepItem}>
                <View style={styles.stepIconWrapper}>
                  <View style={[styles.stepNumber, { backgroundColor: theme.colors.secondary }]}>
                    <Text style={styles.stepNumberText}>{item.step}</Text>
                  </View>
                  <View style={styles.stepIconBg}>
                    <Icon size={32} color={theme.colors.primary} />
                  </View>
                </View>
                <Text style={styles.stepTitle}>{item.title}</Text>
                <Text style={styles.stepDesc}>{item.desc}</Text>
                {index < howItWorks.length - 1 && !isMobile && (
                  <View style={styles.connectorLine} />
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Pro Features - Split Layout */}
      <View style={[styles.section, { backgroundColor: theme.colors.background }]}>
        <View style={styles.proContainer}>
          <View style={styles.proHeader}>
            <View style={[styles.badge, { backgroundColor: theme.colors.secondary }]}>
              <Text style={styles.badgeText}>{t('web.features_page.pro.badge')}</Text>
            </View>
            <Text style={[styles.sectionTitle, { color: theme.colors.text, textAlign: 'left' }]}>
              {t('web.features_page.pro.title')}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary, textAlign: 'left' }]}>
              {t('web.features_page.pro.subtitle')}
            </Text>
          </View>

          <View style={styles.proGrid}>
            {proFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <View key={index} style={[styles.proCard, { borderColor: theme.colors.border }]}>
                  <View style={[styles.proIconBox, { backgroundColor: theme.colors.primary + '10' }]}>
                    <Icon size={40} color={theme.colors.primary} />
                  </View>
                  <View style={styles.proContent}>
                    <Text style={[styles.proTitle, { color: theme.colors.text }]}>{feature.title}</Text>
                    <Text style={[styles.proDesc, { color: theme.colors.textSecondary }]}>{feature.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Final CTA */}
      <LinearGradient
        colors={[theme.colors.secondary, '#EA580C']} // Orange gradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.ctaSection}
      >
        <View style={styles.ctaContent}>
          <View style={styles.ctaTextContainer}>
            <Text style={styles.ctaTitle}>{t('web.features_page.cta.title')}</Text>
            <Text style={styles.ctaSubtitle}>{t('web.features_page.cta.subtitle')}</Text>
          </View>
          <View style={styles.ctaActions}>
            <TouchableOpacity
              style={styles.ctaButtonWhite}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={[styles.ctaButtonText, { color: theme.colors.secondary }]}>
                {t('web.hero.cta_primary')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <WebFooter />
    </ScrollView>
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
  },
  heroContent: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
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
  heroButtons: {
    flexDirection: isMobile ? 'column' : 'row',
    gap: 16,
    marginBottom: 64,
    width: isMobile ? '100%' : 'auto',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  outlineButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  trustIndicators: {
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: 'center',
    gap: 24,
    paddingTop: 48,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    justifyContent: 'center',
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trustText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  trustDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    display: isMobile ? 'none' : 'flex',
  },
  section: {
    paddingVertical: 96,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    maxWidth: 800,
    marginHorizontal: 'auto',
    marginBottom: 64,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 30,
  },
  gridContainer: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 32,
    justifyContent: 'center',
  },
  card: {
    flex: 1,
    minWidth: 300,
    maxWidth: 500,
    padding: 32,
    borderRadius: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  cardDesc: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 24,
  },
  detailsList: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailText: {
    fontSize: 15,
    fontWeight: '500',
  },
  darkSection: {
    paddingVertical: 96,
    paddingHorizontal: 24,
  },
  stepsGrid: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 48,
    justifyContent: 'center',
  },
  stepItem: {
    flex: 1,
    minWidth: 250,
    alignItems: 'center',
    position: 'relative',
  },
  stepIconWrapper: {
    position: 'relative',
    marginBottom: 24,
  },
  stepIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  stepNumber: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  stepDesc: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
  },
  connectorLine: {
    position: 'absolute',
    top: 40,
    right: -24,
    width: 48,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  proContainer: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
  },
  proHeader: {
    marginBottom: 64,
    alignItems: 'flex-start',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  proGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 32,
  },
  proCard: {
    flex: 1,
    minWidth: 350,
    flexDirection: 'row',
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
    gap: 24,
    alignItems: 'flex-start',
  },
  proIconBox: {
    padding: 16,
    borderRadius: 16,
  },
  proContent: {
    flex: 1,
  },
  proTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  proDesc: {
    fontSize: 16,
    lineHeight: 24,
  },
  ctaSection: {
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  ctaContent: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 32,
  },
  ctaTextContainer: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  ctaSubtitle: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    maxWidth: 600,
  },
  ctaActions: {
    flexDirection: 'row',
    gap: 16,
  },
  ctaButtonWhite: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
});
