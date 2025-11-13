import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe } from 'lucide-react-native';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  if (Platform.OS !== 'web') return null;

  return (
    <View style={styles.header}>
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
            <Text style={styles.navLink}>{t('web.nav.features')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(web)/pricing_web')}>
            <Text style={styles.navLink}>{t('web.nav.pricing')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(web)/about')}>
            <Text style={styles.navLink}>{t('web.nav.about')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(web)/contact')}>
            <Text style={styles.navLink}>{t('web.nav.contact')}</Text>
          </TouchableOpacity>
        </View>

        {/* Auth Buttons + Language - Right */}
        <View style={styles.authButtons}>
          {/* Language Selector */}
          <View style={styles.langSelector}>
            <TouchableOpacity
              style={styles.langButton}
              onPress={() => setLangMenuOpen(!langMenuOpen)}
            >
              <Globe size={20} color="#64748B" />
              <Text style={styles.langButtonText}>{i18n.language.toUpperCase()}</Text>
            </TouchableOpacity>
            
            {langMenuOpen && (
              <View style={styles.langDropdown}>
                {LANGUAGES.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.langOption,
                      i18n.language === lang.code && styles.langOptionActive,
                    ]}
                    onPress={() => {
                      i18n.changeLanguage(lang.code);
                      setLangMenuOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.langOptionText,
                        i18n.language === lang.code && styles.langOptionTextActive,
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
            <Text style={styles.loginButtonText}>{t('web.nav.login')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.signupButton}
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
            <X size={28} color="#1F2937" />
          ) : (
            <Menu size={28} color="#1F2937" />
          )}
        </TouchableOpacity>
      </View>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <View style={styles.mobileMenu}>
          <TouchableOpacity 
            style={styles.mobileMenuItem}
            onPress={() => {
              router.push('/(web)/features');
              setMobileMenuOpen(false);
            }}
          >
            <Text style={styles.mobileMenuText}>{t('web.nav.features')}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.mobileMenuItem}
            onPress={() => {
              router.push('/(web)/pricing_web');
              setMobileMenuOpen(false);
            }}
          >
            <Text style={styles.mobileMenuText}>{t('web.nav.pricing')}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.mobileMenuItem}
            onPress={() => {
              router.push('/(web)/about');
              setMobileMenuOpen(false);
            }}
          >
            <Text style={styles.mobileMenuText}>{t('web.nav.about')}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.mobileMenuItem}
            onPress={() => {
              router.push('/(web)/contact');
              setMobileMenuOpen(false);
            }}
          >
            <Text style={styles.mobileMenuText}>{t('web.nav.contact')}</Text>
          </TouchableOpacity>
          
          <View style={styles.mobileMenuDivider} />
          
          <TouchableOpacity 
            style={[styles.mobileMenuItem, styles.mobileLoginButton]}
            onPress={() => {
              router.push('/(auth)/login');
              setMobileMenuOpen(false);
            }}
          >
            <Text style={styles.mobileLoginText}>{t('web.nav.login')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.mobileMenuItem, styles.mobileSignupButton]}
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
    color: '#2563EB',
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
    backgroundColor: '#F8FAFC',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#E2E8F0',
      },
    }),
  },
  langButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  langDropdown: {
    position: 'absolute',
    top: 48,
    right: 0,
    backgroundColor: '#FFFFFF',
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
        backgroundColor: '#F8FAFC',
      },
    }),
  },
  langOptionActive: {
    backgroundColor: '#EFF6FF',
  },
  langOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  langOptionTextActive: {
    color: '#2563EB',
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
    color: '#374151',
    fontWeight: '500',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer' as any,
      transition: 'color 0.2s ease',
      ':hover': {
        color: '#2563EB',
      },
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
    ...(Platform.OS === 'web' && {
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#1d4ed8',
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
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
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
    color: '#374151',
    fontWeight: '500',
  },
  mobileMenuDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  mobileLoginButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  mobileLoginText: {
    fontSize: 18,
    color: '#2563EB',
    fontWeight: '600',
    textAlign: 'center',
  },
  mobileSignupButton: {
    backgroundColor: '#2563EB',
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

