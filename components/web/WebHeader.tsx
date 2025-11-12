import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

export function WebHeader() {
  const router = useRouter();
  const { t } = useTranslation();

  if (Platform.OS !== 'web') return null;

  return (
    <View style={styles.header}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.push('/(web)/index')} style={styles.logo}>
          <Text style={styles.logoText}>Truxel</Text>
        </TouchableOpacity>
        
        <View style={styles.nav}>
          <TouchableOpacity onPress={() => router.push('/(web)/features')}>
            <Text style={styles.navLink}>{t('web.nav.features')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(web)/pricing')}>
            <Text style={styles.navLink}>{t('web.nav.pricing')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(web)/about')}>
            <Text style={styles.navLink}>{t('web.nav.about')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(web)/contact')}>
            <Text style={styles.navLink}>{t('web.nav.contact')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginButtonText}>{t('web.nav.login')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.signupButton}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.signupButtonText}>{t('web.nav.signup')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 16,
    ...(Platform.OS === 'web' && {
      position: 'sticky' as any,
      top: 0,
      zIndex: 1000,
    }),
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 1200,
    marginHorizontal: 'auto',
    paddingHorizontal: 24,
    width: '100%',
  },
  logo: {
    paddingVertical: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563EB',
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  navLink: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer' as any,
    }),
  },
  loginButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  loginButtonText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '600',
  },
  signupButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#2563EB',
    borderRadius: 8,
  },
  signupButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
