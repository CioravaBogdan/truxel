import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/lib/theme';

export function WebFooter() {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useTheme();

  if (Platform.OS !== 'web') return null;

  return (
    <View style={[styles.footer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
      <View style={styles.container}>
        <View style={styles.section}>
          <Text style={[styles.title, { color: theme.colors.primary }]}>Truxel</Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            {t('web.footer.tagline')}
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('web.footer.product')}</Text>
          <TouchableOpacity onPress={() => router.push('/(web)/features')}>
            <Text style={[styles.link, { color: theme.colors.textSecondary }]}>{t('web.nav.features')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(web)/pricing_web')}>
            <Text style={[styles.link, { color: theme.colors.textSecondary }]}>{t('web.nav.pricing')}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('web.footer.company')}</Text>
          <TouchableOpacity onPress={() => router.push('/(web)/about')}>
            <Text style={[styles.link, { color: theme.colors.textSecondary }]}>{t('web.nav.about')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(web)/contact')}>
            <Text style={[styles.link, { color: theme.colors.textSecondary }]}>{t('web.nav.contact')}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('web.footer.legal')}</Text>
          <TouchableOpacity onPress={() => router.push('/(web)/privacy')}>
            <Text style={[styles.link, { color: theme.colors.textSecondary }]}>{t('web.footer.privacy')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(web)/terms')}>
            <Text style={[styles.link, { color: theme.colors.textSecondary }]}>{t('web.footer.terms')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(web)/refund')}>
            <Text style={[styles.link, { color: theme.colors.textSecondary }]}>{t('web.footer.refund')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(web)/cookies')}>
            <Text style={[styles.link, { color: theme.colors.textSecondary }]}>{t('web.footer.cookies')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={[styles.bottom, { borderTopColor: theme.colors.border }]}>
        <Text style={[styles.copyright, { color: theme.colors.textSecondary }]}>
          © {new Date().getFullYear()} Truxel. {t('web.footer.rights')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    borderTopWidth: 1,
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
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  link: {
    fontSize: 14,
    marginBottom: 8,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer' as any,
      transition: 'color 0.2s ease',
      ':hover': {
        opacity: 0.8,
      },
    }),
  },
  bottom: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    paddingHorizontal: 24,
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    width: '100%',
  },
  copyright: {
    fontSize: 14,
    textAlign: 'center',
  },
});

