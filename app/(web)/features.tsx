import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import {
  MapPin, Users, FileText, Globe, MessageSquare, Linkedin,
  Brain, Bell, Download, Check, Search, Map, Phone
} from 'lucide-react-native';
import { WebFooter } from '@/components/web/WebFooter';

export default function FeaturesPage() {
  const { t } = useTranslation();
  const router = useRouter();

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
    },
    {
      icon: Users,
      title: t('web.features.community_title'),
      desc: t('web.features.community_desc'),
      details: coreFeatureDetails.community,
    },
    {
      icon: FileText,
      title: t('web.features.leads_title'),
      desc: t('web.features.leads_desc'),
      details: coreFeatureDetails.leads,
    },
    {
      icon: MessageSquare,
      title: t('web.features.templates_title'),
      desc: t('web.features.templates_desc'),
      details: coreFeatureDetails.templates,
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

  const additionalFeatures = [
    {
      icon: Globe,
      title: t('web.features.multilang_title'),
      desc: t('web.features.multilang_desc'),
    },
    {
      icon: Bell,
      title: t('web.features.notifications_title'),
      desc: t('web.features.notifications_desc'),
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
    <ScrollView style={styles.container}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.section}>
          <Text style={styles.heroTitle}>{t('web.features_page.hero_title')}</Text>
          <Text style={styles.heroSubtitle}>{t('web.features_page.hero_subtitle')}</Text>
        </View>
      </View>

      {/* Core Features */}
      <View style={[styles.section, styles.coreFeaturesSection]}>
        <Text style={styles.sectionTitle}>{t('web.features_page.core.title')}</Text>
        <Text style={styles.sectionSubtitle}>
          {t('web.features_page.core.subtitle')}
        </Text>

        <View style={styles.featuresGrid}>
          {coreFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <View key={index} style={styles.featureCard}>
                <Icon size={48} color="#2563EB" />
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDesc}>{feature.desc}</Text>
                <View style={styles.featureDetails}>
                  {feature.details.map((detail, idx) => (
                    <View key={idx} style={styles.detailRow}>
                      <Check size={16} color="#10B981" />
                      <Text style={styles.detailText}>{detail}</Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* How It Works */}
      <View style={[styles.section, styles.howItWorksSection]}>
        <Text style={styles.sectionTitle}>{t('web.features_page.how.title')}</Text>
        <Text style={styles.sectionSubtitle}>
          {t('web.features_page.how.subtitle')}
        </Text>

        <View style={styles.stepsContainer}>
          {howItWorks.map((item) => {
            const Icon = item.icon;
            return (
              <View key={item.step} style={styles.stepCard}>
                <View style={styles.stepHeader}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{item.step}</Text>
                  </View>
                  <Icon size={32} color="#2563EB" style={styles.stepIcon} />
                </View>
                <Text style={styles.stepTitle}>{item.title}</Text>
                <Text style={styles.stepDesc}>{item.desc}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Pro Features */}
      <View style={[styles.section, styles.proFeaturesSection]}>
        <View style={styles.proBadge}>
          <Text style={styles.proBadgeText}>{t('web.features_page.pro.badge')}</Text>
        </View>
        <Text style={styles.sectionTitle}>{t('web.features_page.pro.title')}</Text>
        <Text style={styles.sectionSubtitle}>
          {t('web.features_page.pro.subtitle')}
        </Text>

        <View style={styles.proFeaturesGrid}>
          {proFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <View key={index} style={styles.proFeatureCard}>
                <Icon size={40} color="#7C3AED" />
                <Text style={styles.proFeatureTitle}>{feature.title}</Text>
                <Text style={styles.proFeatureDesc}>{feature.desc}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Additional Features */}
      <View style={[styles.section, styles.additionalSection]}>
        <Text style={styles.sectionTitle}>{t('web.features_page.additional.title')}</Text>

        <View style={styles.additionalGrid}>
          {additionalFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <View key={index} style={styles.additionalCard}>
                <Icon size={32} color="#2563EB" />
                <View style={styles.additionalContent}>
                  <Text style={styles.additionalTitle}>{feature.title}</Text>
                  <Text style={styles.additionalDesc}>{feature.desc}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* CTA */}
      <View style={[styles.section, styles.ctaSection]}>
        <Text style={styles.ctaTitle}>{t('web.features_page.cta.title')}</Text>
        <Text style={styles.ctaText}>
          {t('web.features_page.cta.subtitle')}
        </Text>
        <View style={styles.ctaButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.primaryButtonText}>{t('web.hero.cta_primary')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/(web)/pricing')}
          >
            <Text style={styles.secondaryButtonText}>{t('web.features_page.cta.secondary')}</Text>
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
    backgroundColor: '#FFFFFF',
  },
  section: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    paddingHorizontal: 16,
    paddingVertical: 64,
    width: '100%',
  },
  hero: {
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 20,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 700,
  },
  coreFeaturesSection: {
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 48,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  featureCard: {
    flex: 1,
    minWidth: 280,
    padding: 32,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  featureTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  featureDesc: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
    marginBottom: 20,
  },
  featureDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#64748B',
  },
  howItWorksSection: {
    backgroundColor: '#F8FAFC',
  },
  stepsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  stepCard: {
    flex: 1,
    minWidth: 250,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepIcon: {
    marginLeft: 'auto',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  stepDesc: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
  },
  proFeaturesSection: {
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  proBadge: {
    alignSelf: 'center',
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  proBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  proFeaturesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  proFeatureCard: {
    flex: 1,
    minWidth: 300,
    padding: 32,
    backgroundColor: '#FAF5FF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  proFeatureTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  proFeatureDesc: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
  },
  additionalSection: {
    backgroundColor: '#F8FAFC',
  },
  additionalGrid: {
    gap: 16,
  },
  additionalCard: {
    flexDirection: 'row',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    gap: 20,
  },
  additionalContent: {
    flex: 1,
  },
  additionalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  additionalDesc: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
  },
  ctaSection: {
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  ctaText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    maxWidth: 600,
    marginBottom: 32,
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2563EB',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
