import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Linking, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/lib/theme';
import { Facebook, Twitter, Linkedin, Mail, Phone, Youtube } from 'lucide-react-native';

export function WebFooter() {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useTheme();

  if (Platform.OS !== 'web') return null;

  // Modern Dark Theme for Footer
  const footerBg = '#0F172A'; // Slate 900
  const footerText = '#FFFFFF'; // Pure White for maximum contrast
  const footerTitle = '#FF5722'; // Brand Orange for titles
  const footerBorder = '#334155'; // Slate 700

  return (
    <View style={[styles.footer, { backgroundColor: footerBg, borderTopColor: footerBorder }]}>
      <View style={styles.container}>
        {/* Brand Column */}
        <View style={styles.brandSection}>
          <Image 
            source={require('@/assets/images/360x120.png')} 
            style={styles.footerLogo}
            resizeMode="contain"
          />
          <Text style={[styles.tagline, { color: '#E2E8F0' }]}>
            {t('web.footer.tagline')}
          </Text>
          <View style={styles.socialRow}>
            <TouchableOpacity onPress={() => Linking.openURL('https://www.youtube.com/@Truxel_io')} style={styles.socialIcon}>
              <Youtube size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL('https://www.facebook.com/truxel.io')} style={styles.socialIcon}>
              <Facebook size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL('https://www.linkedin.com/company/truxel-io')} style={styles.socialIcon}>
              <Linkedin size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL('https://x.com/truxel_io')} style={styles.socialIcon}>
              <Twitter size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Links Columns */}
        <View style={styles.linksContainer}>
          <View style={styles.column}>
            <Text style={[styles.columnTitle, { color: footerTitle }]}>{t('web.footer.product')}</Text>
            <TouchableOpacity onPress={() => router.push('/(web)/features')}>
              <Text style={[styles.link, { color: footerText }]}>{t('web.nav.features')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(web)/pricing_web')}>
              <Text style={[styles.link, { color: footerText }]}>{t('web.nav.pricing')}</Text>
            </TouchableOpacity>
            
            <View style={styles.storeButtons}>
              <TouchableOpacity onPress={() => Linking.openURL('https://apps.apple.com/ro/app/truxel/id6739166827')}>
                <Image 
                  source={require('@/assets/images/download_apple_store.svg')} 
                  style={styles.storeBadge}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL('https://play.google.com/store/apps/details?id=io.truxel.app')}>
                <Image 
                  source={require('@/assets/images/download_google_store_footer.png')} 
                  style={styles.storeBadge}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.column}>
            <Text style={[styles.columnTitle, { color: footerTitle }]}>{t('web.footer.company')}</Text>
            <TouchableOpacity onPress={() => router.push('/(web)/about')}>
              <Text style={[styles.link, { color: footerText }]}>{t('web.nav.about')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(web)/contact')}>
              <Text style={[styles.link, { color: footerText }]}>{t('web.nav.contact')}</Text>
            </TouchableOpacity>
            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <Mail size={16} color={footerTitle} />
                <Text style={[styles.contactText, { color: footerText }]}>office@truxel.io</Text>
              </View>
              <View style={styles.contactItem}>
                <Phone size={16} color={footerTitle} />
                <Text style={[styles.contactText, { color: footerText }]}>+40 750 492 985</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.column}>
            <Text style={[styles.columnTitle, { color: footerTitle }]}>{t('web.footer.legal')}</Text>
            <TouchableOpacity onPress={() => router.push('/(web)/privacy')}>
              <Text style={[styles.link, { color: footerText }]}>{t('web.footer.privacy')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(web)/terms')}>
              <Text style={[styles.link, { color: footerText }]}>{t('web.footer.terms')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(web)/data-deletion')}>
              <Text style={[styles.link, { color: footerText }]}>Data Deletion</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(web)/refund')}>
              <Text style={[styles.link, { color: footerText }]}>{t('web.footer.refund')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(web)/cookies')}>
              <Text style={[styles.link, { color: footerText }]}>{t('web.footer.cookies')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <View style={[styles.bottom, { borderTopColor: footerBorder }]}>
        <Text style={[styles.copyright, { color: '#94A3B8' }]}>
          © {new Date().getFullYear()} Truxel. {t('web.footer.rights')}
        </Text>
        <View style={styles.bottomLinks}>
          <Text style={[styles.bottomLink, { color: '#94A3B8' }]}>Made with ❤️ for Truckers</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingTop: 80,
    paddingBottom: 40,
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    maxWidth: 1200,
    marginHorizontal: 'auto',
    paddingHorizontal: 24,
    width: '100%',
    gap: 48,
    marginBottom: 64,
  },
  brandSection: {
    maxWidth: 300,
    minWidth: 250,
  },
  footerLogo: {
    width: 180,
    height: 60,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 17,
    lineHeight: 28,
    marginBottom: 32,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 16,
  },
  socialIcon: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      outlineStyle: 'none' as any,
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: 'rgba(255,255,255,0.2)',
        transform: 'translateY(-2px)',
      },
    }),
  },
  linksContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 48,
    justifyContent: 'flex-end',
    ...(Platform.OS === 'web' && {
      '@media (max-width: 768px)': {
        justifyContent: 'flex-start',
        width: '100%',
      },
    }),
  },
  column: {
    minWidth: 160,
  },
  columnTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 24,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  link: {
    fontSize: 16,
    marginBottom: 16,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      outlineStyle: 'none' as any,
      transition: 'color 0.2s ease',
      ':hover': {
        color: '#FF5722',
        transform: 'translateX(4px)',
      },
    }),
  },
  storeButtons: {
    marginTop: 16,
    gap: 12,
  },
  storeBadge: {
    width: 140,
    height: 42,
  },
  contactInfo: {
    marginTop: 8,
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 15,
  },
  bottom: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    paddingHorizontal: 24,
    paddingTop: 32,
    borderTopWidth: 1,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  copyright: {
    fontSize: 15,
  },
  bottomLinks: {
    flexDirection: 'row',
    gap: 24,
  },
  bottomLink: {
    fontSize: 15,
  },
});

