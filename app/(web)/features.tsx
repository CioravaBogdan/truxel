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

  const coreFeatures = [
    {
      icon: MapPin,
      title: t('web.features.gps_title'),
      desc: t('web.features.gps_desc'),
      details: [
        'Automatic location detection',
        '5km search radius',
        'Real-time GPS tracking',
        'Search anywhere you drive',
      ],
    },
    {
      icon: Users,
      title: t('web.features.community_title'),
      desc: t('web.features.community_desc'),
      details: [
        'Post driver availability',
        'Find available routes',
        'Connect with fellow truckers',
        'Real-time community feed',
      ],
    },
    {
      icon: FileText,
      title: t('web.features.leads_title'),
      desc: t('web.features.leads_desc'),
      details: [
        'Unlimited lead storage',
        'Status tracking (New, Contacted, Won, Lost)',
        'Add custom notes',
        'CSV export functionality',
      ],
    },
    {
      icon: MessageSquare,
      title: t('web.features.templates_title'),
      desc: t('web.features.templates_desc'),
      details: [
        'Pre-filled email templates',
        'WhatsApp message templates',
        'Auto-populate your contact info',
        'Professional messaging',
      ],
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
      title: 'Download & Sign Up',
      desc: 'Install Truxel from App Store or Google Play. Create your free account and get 5 trial searches.',
    },
    {
      step: 2,
      icon: Search,
      title: 'Enable GPS & Search',
      desc: 'Turn on your location and let Truxel find companies within 5km automatically.',
    },
    {
      step: 3,
      icon: Map,
      title: 'View Results',
      desc: 'Browse company details, contact information, and exact locations on the map.',
    },
    {
      step: 4,
      icon: Phone,
      title: 'Make Contact',
      desc: 'Reach out via email, WhatsApp, or phone using our pre-filled templates.',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.section}>
          <Text style={styles.heroTitle}>Powerful Features for Truck Drivers</Text>
          <Text style={styles.heroSubtitle}>
            Everything you need to find clients, manage leads, and grow your logistics business
          </Text>
        </View>
      </View>

      {/* Core Features */}
      <View style={[styles.section, styles.coreFeaturesSection]}>
        <Text style={styles.sectionTitle}>Core Features</Text>
        <Text style={styles.sectionSubtitle}>
          Available on all plans, including the free trial
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
        <Text style={styles.sectionTitle}>How It Works</Text>
        <Text style={styles.sectionSubtitle}>
          Start finding clients in 4 simple steps
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
          <Text style={styles.proBadgeText}>PRO PLAN</Text>
        </View>
        <Text style={styles.sectionTitle}>Advanced Features</Text>
        <Text style={styles.sectionSubtitle}>
          Unlock powerful tools with Pro tier subscription
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
        <Text style={styles.sectionTitle}>Additional Features</Text>

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
        <Text style={styles.ctaTitle}>Ready to Get Started?</Text>
        <Text style={styles.ctaText}>
          Download Truxel today and start finding clients instantly with 5 free trial searches
        </Text>
        <View style={styles.ctaButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.primaryButtonText}>Start Free Trial</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/(web)/pricing')}
          >
            <Text style={styles.secondaryButtonText}>View Pricing</Text>
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
