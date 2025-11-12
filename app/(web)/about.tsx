import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Truck, Target, Heart, Users, MapPin, Zap } from 'lucide-react-native';
import { WebFooter } from '@/components/web/WebFooter';

export default function AboutUs() {
  const { t } = useTranslation();

  const values = [
    { icon: Target, title: 'Efficiency', desc: 'Save time with GPS-powered instant search' },
    { icon: Heart, title: 'Driver-First', desc: 'Built by truckers, for truckers' },
    { icon: Users, title: 'Community', desc: 'Connect drivers and businesses together' },
    { icon: Zap, title: 'Innovation', desc: 'Leveraging technology to simplify logistics' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.section}>
          <Truck size={64} color="#2563EB" />
          <Text style={styles.heroTitle}>About Truxel</Text>
          <Text style={styles.heroSubtitle}>
            Connecting truck drivers with logistics opportunities across Europe
          </Text>
        </View>
      </View>

      {/* Mission */}
      <View style={[styles.section, styles.missionSection]}>
        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={styles.sectionText}>
          Truxel was born from a simple observation: truck drivers spend too much time searching for clients and not enough time driving. We believe technology should make logistics easier, not harder.
          {'\n\n'}
          Our mission is to empower truck drivers with instant access to business opportunities wherever they are, using nothing more than their smartphone and GPS location.
        </Text>
      </View>

      {/* Story */}
      <View style={[styles.section, styles.storySection]}>
        <Text style={styles.sectionTitle}>Our Story</Text>
        <Text style={styles.sectionText}>
          Founded in 2024, Truxel emerged from real-world experience in the logistics industry. We saw firsthand how difficult it was for independent truck drivers to find clients consistently.
          {'\n\n'}
          Traditional methods - cold calling, visiting industrial areas, relying on word-of-mouth - are time-consuming and inefficient. We knew there had to be a better way.
          {'\n\n'}
          By combining GPS technology, comprehensive business databases, and mobile-first design, we created a tool that puts thousands of potential clients at drivers&apos; fingertips.
        </Text>
      </View>

      {/* Values */}
      <View style={[styles.section, styles.valuesSection]}>
        <Text style={styles.sectionTitle}>Our Values</Text>
        <View style={styles.valuesGrid}>
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <View key={index} style={styles.valueCard}>
                <Icon size={40} color="#2563EB" />
                <Text style={styles.valueTitle}>{value.title}</Text>
                <Text style={styles.valueDesc}>{value.desc}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Coverage */}
      <View style={[styles.section, styles.coverageSection]}>
        <Text style={styles.sectionTitle}>Where We Operate</Text>
        <Text style={styles.sectionText}>
          Truxel currently operates across 6 European countries:
        </Text>
        <View style={styles.countriesList}>
          <View style={styles.countryItem}>
            <MapPin size={20} color="#2563EB" />
            <Text style={styles.countryText}>🇷🇴 Romania</Text>
          </View>
          <View style={styles.countryItem}>
            <MapPin size={20} color="#2563EB" />
            <Text style={styles.countryText}>🇵🇱 Poland</Text>
          </View>
          <View style={styles.countryItem}>
            <MapPin size={20} color="#2563EB" />
            <Text style={styles.countryText}>🇹🇷 Turkey</Text>
          </View>
          <View style={styles.countryItem}>
            <MapPin size={20} color="#2563EB" />
            <Text style={styles.countryText}>🇱🇹 Lithuania</Text>
          </View>
          <View style={styles.countryItem}>
            <MapPin size={20} color="#2563EB" />
            <Text style={styles.countryText}>🇪🇸 Spain</Text>
          </View>
          <View style={styles.countryItem}>
            <MapPin size={20} color="#2563EB" />
            <Text style={styles.countryText}>🇬🇧 United Kingdom</Text>
          </View>
        </View>
        <Text style={styles.sectionText}>
          {'\n'}We&apos;re constantly expanding to new markets. Stay tuned for more countries coming soon!
        </Text>
      </View>

      {/* Team */}
      <View style={[styles.section, styles.teamSection]}>
        <Text style={styles.sectionTitle}>Our Commitment</Text>
        <Text style={styles.sectionText}>
          We&apos;re committed to:{'\n\n'}
          • Providing accurate, up-to-date company information{'\n'}
          • Protecting your privacy and data security{'\n'}
          • Offering fair, transparent pricing{'\n'}
          • Continuously improving based on driver feedback{'\n'}
          • Supporting the logistics community{'\n'}
          • Being GDPR compliant and respecting your rights
        </Text>
      </View>

      {/* Stats */}
      <View style={[styles.section, styles.statsSection]}>
        <Text style={styles.sectionTitle}>Truxel by Numbers</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>1,000+</Text>
            <Text style={styles.statLabel}>Active Drivers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>5,000+</Text>
            <Text style={styles.statLabel}>Companies Found</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>6</Text>
            <Text style={styles.statLabel}>Countries</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>6</Text>
            <Text style={styles.statLabel}>Languages</Text>
          </View>
        </View>
      </View>

      {/* Contact CTA */}
      <View style={[styles.section, styles.ctaSection]}>
        <Text style={styles.ctaTitle}>Have Questions?</Text>
        <Text style={styles.ctaText}>
          We&apos;d love to hear from you. Whether you&apos;re a driver looking for more information or a business interested in partnerships, get in touch.
        </Text>
        <View style={styles.ctaButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => Linking.openURL('mailto:office@truxel.io')}
          >
            <Text style={styles.primaryButtonText}>Email Us</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => Linking.openURL('tel:+40750492985')}
          >
            <Text style={styles.secondaryButtonText}>Call Us</Text>
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
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 20,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 600,
  },
  missionSection: {
    backgroundColor: '#FFFFFF',
  },
  storySection: {
    backgroundColor: '#F8FAFC',
  },
  valuesSection: {
    backgroundColor: '#FFFFFF',
  },
  coverageSection: {
    backgroundColor: '#F8FAFC',
  },
  teamSection: {
    backgroundColor: '#FFFFFF',
  },
  statsSection: {
    backgroundColor: '#F8FAFC',
  },
  ctaSection: {
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 24,
    textAlign: 'center',
  },
  sectionText: {
    fontSize: 18,
    color: '#64748B',
    lineHeight: 27,
  },
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    marginTop: 32,
  },
  valueCard: {
    flex: 1,
    minWidth: 250,
    padding: 32,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    alignItems: 'center',
  },
  valueTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  valueDesc: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  countriesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 24,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  countryText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 32,
    justifyContent: 'center',
    marginTop: 32,
  },
  statCard: {
    alignItems: 'center',
    minWidth: 200,
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
