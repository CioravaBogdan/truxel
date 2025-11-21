import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import {
  Truck,
  Target,
  Users,
  Sparkles,
  LineChart,
  MapPin,
  Handshake,
  Quote,
} from 'lucide-react-native';
import { WebFooter } from '@/components/web/WebFooter';
import { useTheme } from '@/lib/theme';

export default function AboutUs() {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme } = useTheme();

  const timelineItems = useMemo(
    () => [
      { icon: Truck, titleKey: 'web.founder.timeline.step1.title', descKey: 'web.founder.timeline.step1.desc' },
      { icon: LineChart, titleKey: 'web.founder.timeline.step2.title', descKey: 'web.founder.timeline.step2.desc' },
      { icon: Sparkles, titleKey: 'web.founder.timeline.step3.title', descKey: 'web.founder.timeline.step3.desc' },
    ],
    [],
  );

  const missionPoints = useMemo(
    () => [
      'web.about.mission.point1',
      'web.about.mission.point2',
      'web.about.mission.point3',
    ],
    [],
  );

  const valueCards = useMemo(
    () => [
      { icon: Target, titleKey: 'web.about.values.owner_operator.title', descKey: 'web.about.values.owner_operator.desc' },
      { icon: Users, titleKey: 'web.about.values.community.title', descKey: 'web.about.values.community.desc' },
      { icon: Handshake, titleKey: 'web.about.values.partners.title', descKey: 'web.about.values.partners.desc' },
      { icon: Sparkles, titleKey: 'web.about.values.innovation.title', descKey: 'web.about.values.innovation.desc' },
    ],
    [],
  );

  const impactStats = useMemo(
    () => [
      {
        value: t('web.about.impact.stats.drivers.value'),
        label: t('web.about.impact.stats.drivers.label'),
      },
      {
        value: t('web.about.impact.stats.companies.value'),
        label: t('web.about.impact.stats.companies.label'),
      },
      {
        value: t('web.about.impact.stats.countries.value'),
        label: t('web.about.impact.stats.countries.label'),
      },
      {
        value: t('web.about.impact.stats.connections.value'),
        label: t('web.about.impact.stats.connections.label'),
      },
    ],
    [t],
  );

  const coverageCountries = useMemo(
    () => [
      t('web.about.coverage.romania'),
      t('web.about.coverage.uk'),
      t('web.about.coverage.us'),
      t('web.about.coverage.spain'),
      t('web.about.coverage.poland'),
      t('web.about.coverage.turkey'),
    ],
    [t],
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.hero, { backgroundColor: theme.colors.background }]}>
        <View style={styles.section}>
          <View style={styles.heroContent}>
            <View style={[styles.heroBadge, { backgroundColor: theme.colors.primary + '1F' }]}>
              <Truck size={18} color={theme.colors.primary} />
              <Text style={[styles.heroBadgeText, { color: theme.colors.primary }]}>{t('web.about.hero_badge')}</Text>
            </View>
            <Text style={[styles.heroTitle, { color: theme.colors.text }]}>{t('web.about.hero_title')}</Text>
            <Text style={[styles.heroSubtitle, { color: theme.colors.textSecondary }]}>{t('web.about.hero_subtitle')}</Text>

            <View style={styles.heroButtons}>
              <TouchableOpacity
                style={[styles.heroPrimary, { backgroundColor: theme.colors.secondary }]}
                onPress={() => router.push('/(auth)/register')}
              >
                <Text style={styles.heroPrimaryText}>{t('web.about.hero_cta')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.heroSecondary, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}
                onPress={() => router.push('/(web)/contact')}
              >
                <Text style={[styles.heroSecondaryText, { color: theme.colors.text }]}>{t('web.about.hero_secondary_cta')}</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.quoteCard, { backgroundColor: theme.colors.secondary + '15', borderColor: theme.colors.secondary }]}>
              <Quote size={24} color={theme.colors.secondary} />
              <Text style={[styles.quoteText, { color: theme.colors.text }]}>{t('web.about.founder_quote')}</Text>
              <Text style={[styles.quoteAuthor, { color: theme.colors.text }]}>{t('web.founder.name')}</Text>
              <Text style={[styles.quoteRole, { color: theme.colors.textSecondary }]}>{t('web.founder.role')}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.section, styles.storySection, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.sectionEyebrow, { color: theme.colors.secondary }]}>{t('web.about.journey_badge')}</Text>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('web.about.journey_title')}</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>{t('web.about.journey_subtitle')}</Text>

        <View style={styles.timelineGrid}>
          {timelineItems.map((item) => {
            const Icon = item.icon;
            return (
              <View key={item.titleKey} style={[styles.timelineCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <View style={[styles.timelineIcon, { backgroundColor: `${theme.colors.secondary}1F` }]}>
                  <Icon size={24} color={theme.colors.secondary} />
                </View>
                <Text style={[styles.timelineTitle, { color: theme.colors.text }]}>{t(item.titleKey)}</Text>
                <Text style={[styles.timelineDesc, { color: theme.colors.textSecondary }]}>{t(item.descKey)}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={[styles.section, styles.missionSection, { backgroundColor: theme.colors.surface }]}>
        <View style={[styles.missionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.sectionEyebrow, { color: theme.colors.secondary }]}>{t('web.about.mission_badge')}</Text>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('web.about.mission_title')}</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>{t('web.about.mission_subtitle')}</Text>

          <View style={styles.missionList}>
            {missionPoints.map((key) => (
              <View key={key} style={styles.missionItem}>
                <View style={[styles.missionBullet, { backgroundColor: theme.colors.secondary }]}>
                  <Sparkles size={16} color="#FFFFFF" />
                </View>
                <Text style={[styles.missionText, { color: theme.colors.textSecondary }]}>{t(key)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.coverageCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.coverageTitle, { color: theme.colors.text }]}>{t('web.about.coverage_title')}</Text>
          <Text style={[styles.coverageSubtitle, { color: theme.colors.textSecondary }]}>{t('web.about.coverage_subtitle')}</Text>
          <View style={styles.coverageList}>
            {coverageCountries.map((country) => (
              <View key={country} style={styles.coverageItem}>
                <MapPin size={18} color={theme.colors.secondary} />
                <Text style={[styles.coverageText, { color: theme.colors.text }]}>{country}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.coverageFooter, { color: theme.colors.textSecondary }]}>{t('web.about.coverage_footer')}</Text>
        </View>
      </View>

      <View style={[styles.section, styles.valuesSection, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.sectionEyebrow, { color: theme.colors.secondary }]}>{t('web.about.values_badge')}</Text>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('web.about.values_title')}</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>{t('web.about.values_subtitle')}</Text>

        <View style={styles.valuesGrid}>
          {valueCards.map((value) => {
            const Icon = value.icon;
            return (
              <View key={value.titleKey} style={[styles.valueCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <View style={[styles.valueIcon, { backgroundColor: `${theme.colors.secondary}1F` }]}>
                  <Icon size={28} color={theme.colors.secondary} />
                </View>
                <Text style={[styles.valueTitle, { color: theme.colors.text }]}>{t(value.titleKey)}</Text>
                <Text style={[styles.valueDesc, { color: theme.colors.textSecondary }]}>{t(value.descKey)}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={[styles.section, styles.impactSection, { backgroundColor: '#0F172A' }]}>
        <Text style={[styles.sectionEyebrow, { color: theme.colors.secondary }]}>{t('web.about.impact_badge')}</Text>
        <Text style={[styles.sectionTitle, { color: '#FFFFFF' }]}>{t('web.about.impact_title')}</Text>
        <Text style={[styles.sectionSubtitle, { color: '#94A3B8' }]}>{t('web.about.impact_subtitle')}</Text>

        <View style={styles.statsGrid}>
          {impactStats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={[styles.statNumber, { color: '#FFFFFF' }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: '#94A3B8' }]}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.section, styles.ctaSection, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.ctaContent, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.ctaTitle, { color: theme.colors.text }]}>{t('web.about.cta_title')}</Text>
          <Text style={[styles.ctaSubtitle, { color: theme.colors.textSecondary }]}>{t('web.about.cta_subtitle')}</Text>

          <View style={styles.heroButtons}>
            <TouchableOpacity
              style={[styles.heroPrimary, styles.ctaPrimary, { backgroundColor: theme.colors.secondary }]}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.heroPrimaryText}>{t('web.about.cta_primary')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.heroSecondary, styles.ctaSecondary, { borderColor: theme.colors.border }]}
              onPress={() => router.push('/(web)/pricing_web')}
            >
              <Text style={[styles.heroSecondaryText, { color: theme.colors.text }]}>{t('web.about.cta_secondary')}</Text>
            </TouchableOpacity>
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
  },
  section: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    paddingHorizontal: 24,
    paddingVertical: 80,
    width: '100%',
    ...(Platform.OS === 'web' && {
      '@media (max-width: 992px)': {
        paddingHorizontal: 32,
        paddingVertical: 64,
      },
      '@media (max-width: 600px)': {
        paddingHorizontal: 20,
        paddingVertical: 48,
      },
    }),
  },
  hero: {
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
    gap: 28,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  heroBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '900',
    lineHeight: 56,
    maxWidth: 760,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 768px)': {
        fontSize: 34,
        lineHeight: 42,
      },
    }),
  },
  heroSubtitle: {
    fontSize: 20,
    lineHeight: 32,
    maxWidth: 720,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  heroPrimary: {
    paddingVertical: 18,
    paddingHorizontal: 36,
    borderRadius: 14,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 25px 45px -20px rgba(255, 107, 53, 0.6)',
      },
    }),
  },
  heroPrimaryText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  heroSecondary: {
    paddingVertical: 18,
    paddingHorizontal: 36,
    borderRadius: 14,
    borderWidth: 2,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'border-color 0.2s ease, transform 0.2s ease',
      ':hover': {
        borderColor: '#FFFFFF',
        transform: 'translateY(-2px)',
      },
    }),
  },
  heroSecondaryText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  quoteCard: {
    padding: 24,
    borderRadius: 20,
    gap: 12,
    maxWidth: 640,
    borderWidth: 1,
  },
  quoteText: {
    fontSize: 18,
    lineHeight: 28,
    fontStyle: 'italic',
  },
  quoteAuthor: {
    fontSize: 16,
    fontWeight: '700',
  },
  quoteRole: {
    fontSize: 14,
  },
  sectionEyebrow: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 16,
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 40,
    fontWeight: '900',
    marginBottom: 12,
    textAlign: 'left',
    ...(Platform.OS === 'web' && {
      '@media (max-width: 768px)': {
        fontSize: 32,
      },
    }),
  },
  sectionSubtitle: {
    fontSize: 18,
    lineHeight: 28,
    maxWidth: 760,
    marginBottom: 32,
  },
  storySection: {
  },
  timelineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  timelineCard: {
    flex: 1,
    minWidth: 260,
    padding: 28,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
  },
  timelineIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  timelineDesc: {
    fontSize: 16,
    lineHeight: 24,
  },
  missionSection: {
    flexDirection: 'row',
    gap: 32,
    flexWrap: 'wrap',
  },
  missionCard: {
    flex: 1,
    minWidth: 340,
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
  },
  missionList: {
    marginTop: 24,
    gap: 18,
  },
  missionItem: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  missionBullet: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
  coverageCard: {
    flex: 1,
    minWidth: 260,
    padding: 32,
    borderRadius: 24,
    gap: 16,
  },
  coverageTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  coverageSubtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  coverageList: {
    gap: 12,
    marginTop: 12,
  },
  coverageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coverageText: {
    fontSize: 16,
    fontWeight: '600',
  },
  coverageFooter: {
    fontSize: 14,
    marginTop: 8,
  },
  valuesSection: {
  },
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  valueCard: {
    flex: 1,
    minWidth: 250,
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    gap: 12,
  },
  valueIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  valueDesc: {
    fontSize: 16,
    lineHeight: 24,
  },
  impactSection: {
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 32,
    justifyContent: 'center',
  },
  statCard: {
    alignItems: 'center',
    minWidth: 220,
    gap: 8,
  },
  statNumber: {
    fontSize: 44,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  ctaSection: {
  },
  ctaContent: {
    borderRadius: 32,
    padding: 48,
    alignItems: 'center',
    gap: 20,
    borderWidth: 1,
  },
  ctaTitle: {
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
    maxWidth: 640,
    marginBottom: 12,
  },
  ctaPrimary: {
  },
  ctaSecondary: {
  },
});
