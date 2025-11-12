import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

export function WebFooter() {
  const router = useRouter();
  const { t } = useTranslation();

  if (Platform.OS !== 'web') return null;

  return (
    <View style={styles.footer}>
      <View style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.title}>Truxel</Text>
          <Text style={styles.description}>
            {t('web.footer.tagline')}
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('web.footer.product')}</Text>
          <TouchableOpacity onPress={() => router.push('/(web)/features')}>
            <Text style={styles.link}>{t('web.nav.features')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(web)/pricing')}>
            <Text style={styles.link}>{t('web.nav.pricing')}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('web.footer.company')}</Text>
          <TouchableOpacity onPress={() => router.push('/(web)/about')}>
            <Text style={styles.link}>{t('web.nav.about')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(web)/contact')}>
            <Text style={styles.link}>{t('web.nav.contact')}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('web.footer.legal')}</Text>
          <TouchableOpacity onPress={() => router.push('/(web)/privacy')}>
            <Text style={styles.link}>{t('web.footer.privacy')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(web)/terms')}>
            <Text style={styles.link}>{t('web.footer.terms')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(web)/refund')}>
            <Text style={styles.link}>{t('web.footer.refund')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(web)/cookies')}>
            <Text style={styles.link}>{t('web.footer.cookies')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.bottom}>
        <Text style={styles.copyright}>
          © {new Date().getFullYear()} Truxel. {t('web.footer.rights')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 48,
    marginTop: 64,
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    maxWidth: 1200,
    marginHorizontal: 'auto',
    paddingHorizontal: 24,
    width: '100%',
    gap: 32,
  },
  section: {
    minWidth: 200,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  link: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer' as any,
    }),
  },
  bottom: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    paddingHorizontal: 24,
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    width: '100%',
  },
  copyright: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
