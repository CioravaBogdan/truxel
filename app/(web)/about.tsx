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

const BRAND_ORANGE = '#FF6B35';

export default function AboutUs() {
  const { t } = useTranslation();
  const router = useRouter();

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
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.heroOverlay} />
        <View style={styles.section}>
          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <Truck size={18} color={BRAND_ORANGE} />
              <Text style={styles.heroBadgeText}>{t('web.about.hero_badge')}</Text>
            </View>
            <Text style={styles.heroTitle}>{t('web.about.hero_title')}</Text>
            <Text style={styles.heroSubtitle}>{t('web.about.hero_subtitle')}</Text>

            <View style={styles.heroButtons}>
              <TouchableOpacity
                style={styles.heroPrimary}
                onPress={() => router.push('/(auth)/register')}
              >
                <Text style={styles.heroPrimaryText}>{t('web.about.hero_cta')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.heroSecondary}
                onPress={() => router.push('/(web)/contact')}
              >
                <Text style={styles.heroSecondaryText}>{t('web.about.hero_secondary_cta')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.quoteCard}>
              <Quote size={24} color={BRAND_ORANGE} />
              <Text style={styles.quoteText}>{t('web.about.founder_quote')}</Text>
              <Text style={styles.quoteAuthor}>{t('web.founder.name')}</Text>
              <Text style={styles.quoteRole}>{t('web.founder.role')}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.section, styles.storySection]}>
        <Text style={styles.sectionEyebrow}>{t('web.about.journey_badge')}</Text>
        <Text style={styles.sectionTitle}>{t('web.about.journey_title')}</Text>
        <Text style={styles.sectionSubtitle}>{t('web.about.journey_subtitle')}</Text>

        <View style={styles.timelineGrid}>
          {timelineItems.map((item) => {
            const Icon = item.icon;
            return (
              <View key={item.titleKey} style={styles.timelineCard}>
                <View style={styles.timelineIcon}>
                  <Icon size={24} color={BRAND_ORANGE} />
                </View>
                <Text style={styles.timelineTitle}>{t(item.titleKey)}</Text>
                <Text style={styles.timelineDesc}>{t(item.descKey)}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={[styles.section, styles.missionSection]}>
        <View style={styles.missionCard}>
          <Text style={styles.sectionEyebrow}>{t('web.about.mission_badge')}</Text>
          <Text style={styles.sectionTitle}>{t('web.about.mission_title')}</Text>
          <Text style={styles.sectionSubtitle}>{t('web.about.mission_subtitle')}</Text>

          <View style={styles.missionList}>
            {missionPoints.map((key) => (
              <View key={key} style={styles.missionItem}>
                <View style={styles.missionBullet}>
                  <Sparkles size={16} color="#FFFFFF" />
                </View>
                <Text style={styles.missionText}>{t(key)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.coverageCard}>
          <Text style={styles.coverageTitle}>{t('web.about.coverage_title')}</Text>
          <Text style={styles.coverageSubtitle}>{t('web.about.coverage_subtitle')}</Text>
          <View style={styles.coverageList}>
            {coverageCountries.map((country) => (
              <View key={country} style={styles.coverageItem}>
                <MapPin size={18} color={BRAND_ORANGE} />
                <Text style={styles.coverageText}>{country}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.coverageFooter}>{t('web.about.coverage_footer')}</Text>
        </View>
      </View>

      <View style={[styles.section, styles.valuesSection]}>
        <Text style={styles.sectionEyebrow}>{t('web.about.values_badge')}</Text>
        <Text style={styles.sectionTitle}>{t('web.about.values_title')}</Text>
        <Text style={styles.sectionSubtitle}>{t('web.about.values_subtitle')}</Text>

        <View style={styles.valuesGrid}>
          {valueCards.map((value) => {
            const Icon = value.icon;
            return (
              <View key={value.titleKey} style={styles.valueCard}>
                <View style={styles.valueIcon}>
                  <Icon size={28} color={BRAND_ORANGE} />
                </View>
                <Text style={styles.valueTitle}>{t(value.titleKey)}</Text>
                <Text style={styles.valueDesc}>{t(value.descKey)}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={[styles.section, styles.impactSection]}>
        <Text style={styles.sectionEyebrow}>{t('web.about.impact_badge')}</Text>
        <Text style={styles.sectionTitle}>{t('web.about.impact_title')}</Text>
        <Text style={styles.sectionSubtitle}>{t('web.about.impact_subtitle')}</Text>

        <View style={styles.statsGrid}>
          {impactStats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statNumber}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.section, styles.ctaSection]}>
        <View style={styles.ctaContent}>
          <Text style={styles.ctaTitle}>{t('web.about.cta_title')}</Text>
          <Text style={styles.ctaSubtitle}>{t('web.about.cta_subtitle')}</Text>

          <View style={styles.heroButtons}>
            <TouchableOpacity
              style={[styles.heroPrimary, styles.ctaPrimary]}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.heroPrimaryText}>{t('web.about.cta_primary')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.heroSecondary, styles.ctaSecondary]}
              onPress={() => router.push('/(web)/pricing_web')}
            >
              <Text style={styles.heroSecondaryText}>{t('web.about.cta_secondary')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <WebFooter />
    </ScrollView>
  );
}

const rawStyles = {
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
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
    backgroundColor: '#0F172A',
    overflow: 'hidden',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    ...(Platform.OS === 'web' && {
      backgroundImage: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.8) 40%, rgba(15, 23, 42, 0.6) 100%)',
    }),
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
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  heroBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
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
    color: 'rgba(255, 255, 255, 0.82)',
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
    backgroundColor: BRAND_ORANGE,
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
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
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
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  quoteCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 24,
    borderRadius: 20,
    gap: 12,
    maxWidth: 640,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  quoteText: {
    fontSize: 18,
    color: '#E2E8F0',
    lineHeight: 28,
    fontStyle: 'italic',
  },
  quoteAuthor: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quoteRole: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  sectionEyebrow: {
    color: BRAND_ORANGE,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 16,
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: '#0F172A',
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
    color: '#475569',
    lineHeight: 28,
    maxWidth: 760,
    marginBottom: 32,
  },
  storySection: {
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  timelineIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.12)',
  },
  timelineTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  timelineDesc: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
  },
  missionSection: {
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    gap: 32,
    flexWrap: 'wrap',
  },
  missionCard: {
    flex: 1,
    minWidth: 340,
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    backgroundColor: BRAND_ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionText: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
    flex: 1,
  },
  coverageCard: {
    flex: 1,
    minWidth: 260,
    backgroundColor: '#0F172A',
    padding: 32,
    borderRadius: 24,
    gap: 16,
  },
  coverageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  coverageSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
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
    color: '#FFFFFF',
    fontWeight: '600',
  },
  coverageFooter: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 8,
  },
  valuesSection: {
    backgroundColor: '#FFFFFF',
  },
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  valueCard: {
    flex: 1,
    minWidth: 250,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  valueIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.12)',
  },
  valueTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  valueDesc: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
  },
  impactSection: {
    backgroundColor: '#F8FAFC',
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
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
  },
  ctaSection: {
    backgroundColor: '#0F172A',
  },
  ctaContent: {
    backgroundColor: '#111C33',
    borderRadius: 32,
    padding: 48,
    alignItems: 'center',
    gap: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  ctaTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 28,
    maxWidth: 640,
    marginBottom: 12,
  },
  ctaPrimary: {
    backgroundColor: BRAND_ORANGE,
  },
  ctaSecondary: {
    borderColor: 'rgba(255,255,255,0.45)',
  },
} as const;

const styles = StyleSheet.create(rawStyles as Record<string, any>);
