import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe } from 'lucide-react-native';
import { useTheme } from '@/lib/theme';

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'ro', label: 'RO' },
  { code: 'pl', label: 'PL' },
  { code: 'tr', label: 'TR' },
  { code: 'lt', label: 'LT' },
  { code: 'es', label: 'ES' },
  { code: 'uk', label: 'UK' },
  { code: 'fr', label: 'FR' },
  { code: 'de', label: 'DE' },
  { code: 'it', label: 'IT' },
];

export function WebHeader() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  if (Platform.OS !== 'web') return null;

  return (
    <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
      <View style={styles.container}>
        {/* Logo - Left */}
        <Link href="/" style={styles.logoContainer}>
          <Image 
            source={require('@/assets/images/360x120.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Link>
        
        {/* Navigation Links - Center */}
        <View style={styles.desktopNav}>
          <TouchableOpacity onPress={() => router.push('/(web)/features')}>
            <Text style={[styles.navLink, { color: theme.colors.text }]}>{t('web.nav.features')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(web)/pricing_web')}>
            <Text style={[styles.navLink, { color: theme.colors.text }]}>{t('web.nav.pricing')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(web)/about')}>
            <Text style={[styles.navLink, { color: theme.colors.text }]}>{t('web.nav.about')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(web)/contact')}>
            <Text style={[styles.navLink, { color: theme.colors.text }]}>{t('web.nav.contact')}</Text>
          </TouchableOpacity>
        </View>

        {/* Auth Buttons + Language - Right */}
        <View style={styles.authButtons}>
          {/* Language Selector */}
          <View style={styles.langSelector}>
            <TouchableOpacity
              style={[styles.langButton, { backgroundColor: theme.colors.card }]}
              onPress={() => setLangMenuOpen(!langMenuOpen)}
            >
              <Globe size={20} color={theme.colors.textSecondary} />
              <Text style={[styles.langButtonText, { color: theme.colors.textSecondary }]}>{i18n.language.toUpperCase()}</Text>
            </TouchableOpacity>
            
            {langMenuOpen && (
              <View style={[styles.langDropdown, { backgroundColor: theme.colors.card }]}>
                {LANGUAGES.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.langOption,
                      i18n.language === lang.code && { backgroundColor: theme.colors.primary + '1A' },
                    ]}
                    onPress={() => {
                      i18n.changeLanguage(lang.code);
                      setLangMenuOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.langOptionText,
                        { color: theme.colors.textSecondary },
                        i18n.language === lang.code && { color: theme.colors.primary, fontWeight: '600' },
                      ]}
                    >
                      {lang.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={[styles.loginButtonText, { color: theme.colors.primary }]}>{t('web.nav.login')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.signupButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.signupButtonText}>{t('web.nav.signup')}</Text>
          </TouchableOpacity>
        </View>

        {/* Mobile Hamburger */}
        <TouchableOpacity 
          style={styles.hamburger}
          onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X size={28} color={theme.colors.text} />
          ) : (
            <Menu size={28} color={theme.colors.text} />
          )}
        </TouchableOpacity>
      </View>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <View style={[styles.mobileMenu, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
          <TouchableOpacity 
            style={styles.mobileMenuItem}
            onPress={() => {
              router.push('/(web)/features');
              setMobileMenuOpen(false);
            }}
          >
            <Text style={[styles.mobileMenuText, { color: theme.colors.text }]}>{t('web.nav.features')}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.mobileMenuItem}
            onPress={() => {
              router.push('/(web)/pricing_web');
              setMobileMenuOpen(false);
            }}
          >
            <Text style={[styles.mobileMenuText, { color: theme.colors.text }]}>{t('web.nav.pricing')}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.mobileMenuItem}
            onPress={() => {
              router.push('/(web)/about');
              setMobileMenuOpen(false);
            }}
          >
            <Text style={[styles.mobileMenuText, { color: theme.colors.text }]}>{t('web.nav.about')}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.mobileMenuItem}
            onPress={() => {
              router.push('/(web)/contact');
              setMobileMenuOpen(false);
            }}
          >
            <Text style={[styles.mobileMenuText, { color: theme.colors.text }]}>{t('web.nav.contact')}</Text>
          </TouchableOpacity>
          
          <View style={[styles.mobileMenuDivider, { backgroundColor: theme.colors.border }]} />
          
          <TouchableOpacity 
            style={[styles.mobileMenuItem, styles.mobileLoginButton, { backgroundColor: theme.colors.card }]}
            onPress={() => {
              router.push('/(auth)/login');
              setMobileMenuOpen(false);
            }}
          >
            <Text style={[styles.mobileLoginText, { color: theme.colors.primary }]}>{t('web.nav.login')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.mobileMenuItem, styles.mobileSignupButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              router.push('/(auth)/register');
              setMobileMenuOpen(false);
            }}
          >
            <Text style={styles.mobileSignupText}>{t('web.nav.signup')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    paddingVertical: 16,
    ...(Platform.OS === 'web' && {
      position: 'sticky' as any,
      top: 0,
      zIndex: 1000,
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' as any,
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
    ...(Platform.OS === 'web' && {
      '@media (max-width: 968px)': {
        paddingHorizontal: 16,
      },
    }),
  },
  logo: {
    paddingVertical: 8,
    flex: 0,
  },
  logoContainer: {
    paddingVertical: 8,
    flex: 0,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.2s ease, opacity 0.2s ease',
      ':hover': {
        opacity: 0.8,
        transform: 'scale(1.02)',
      },
    }),
  },
  logoImage: {
    width: 180,
    height: 60,
    ...(Platform.OS === 'web' && {
      pointerEvents: 'none', // Make image non-blocking for clicks
    }),
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  desktopNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
    flex: 1,
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      '@media (max-width: 968px)': {
        display: 'none',
      },
    }),
  },
  authButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 0,
    ...(Platform.OS === 'web' && {
      '@media (max-width: 968px)': {
        display: 'none',
      },
    }),
  },
  langSelector: {
    position: 'relative',
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        opacity: 0.8,
      },
    }),
  },
  langButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  langDropdown: {
    position: 'absolute',
    top: 48,
    right: 0,
    borderRadius: 8,
    paddingVertical: 8,
    minWidth: 120,
    zIndex: 1000,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    }),
  },
  langOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
      ':hover': {
        opacity: 0.8,
      },
    }),
  },
  langOptionActive: {
  },
  langOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  langOptionTextActive: {
    fontWeight: '600',
  },
  hamburger: {
    padding: 8,
    display: 'none',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer' as any,
      '@media (max-width: 968px)': {
        display: 'flex',
      },
    }),
  },
  navLink: {
    fontSize: 16,
    fontWeight: '500',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer' as any,
      transition: 'color 0.2s ease',
      ':hover': {
        opacity: 0.8,
      },
    }),
  },
  loginButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  signupButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    ...(Platform.OS === 'web' && {
      transition: 'all 0.2s ease',
      ':hover': {
        opacity: 0.9,
        transform: 'translateY(-1px)',
      },
    }),
  },
  signupButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  mobileMenu: {
    borderTopWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    ...(Platform.OS === 'web' && {
      '@media (min-width: 969px)': {
        display: 'none',
      },
    }),
  },
  mobileMenuItem: {
    paddingVertical: 12,
  },
  mobileMenuText: {
    fontSize: 18,
    fontWeight: '500',
  },
  mobileMenuDivider: {
    height: 1,
    marginVertical: 16,
  },
  mobileLoginButton: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  mobileLoginText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  mobileSignupButton: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  mobileSignupText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
});

