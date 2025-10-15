import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import Toast from 'react-native-toast-message';
import {
  User,
  Mail,
  Phone,
  Building2,
  Globe,
  LogOut,
  CreditCard,
} from 'lucide-react-native';
import i18n from '@/lib/i18n';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'lt', name: 'Lietuvių', flag: '🇱🇹' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

const SUBSCRIPTION_TIERS = {
  trial: { name: 'Trial', searches: 5 },
  standard: { name: 'Standard', searches: 15, price: 29.99 },
  premium: { name: 'Premium', searches: 100, price: 199.99 },
};

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { profile, reset } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleChangeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    if (profile) {
      authService.updateProfile(profile.user_id, {
        preferred_language: languageCode as any,
      }).catch(console.error);
    }
    Toast.show({
      type: 'success',
      text1: t('profile.profile_updated'),
    });
  };

  const handleLogout = () => {
    Alert.alert(
      t('common.logout'),
      t('auth.logout_confirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.confirm'),
          onPress: async () => {
            setIsLoading(true);
            try {
              await authService.signOut();
              reset();
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: t('common.error'),
                text2: error.message,
              });
            } finally {
              setIsLoading(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (!profile) return null;

  const tierInfo = SUBSCRIPTION_TIERS[profile.subscription_tier];
  const searchesUsed =
    profile.subscription_tier === 'trial'
      ? profile.trial_searches_used
      : profile.monthly_searches_used;
  const searchesTotal = tierInfo.searches;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('profile.title')}</Text>
        </View>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.account_info')}</Text>

          <View style={styles.infoRow}>
            <User size={20} color="#64748B" />
            <Text style={styles.infoText}>{profile.full_name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Mail size={20} color="#64748B" />
            <Text style={styles.infoText}>{profile.email}</Text>
          </View>

          {profile.phone_number && (
            <View style={styles.infoRow}>
              <Phone size={20} color="#64748B" />
              <Text style={styles.infoText}>{profile.phone_number}</Text>
            </View>
          )}

          {profile.company_name && (
            <View style={styles.infoRow}>
              <Building2 size={20} color="#64748B" />
              <Text style={styles.infoText}>{profile.company_name}</Text>
            </View>
          )}
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>{t('subscription.title')}</Text>

          <View style={styles.subscriptionHeader}>
            <View>
              <Text style={styles.subscriptionTier}>
                {tierInfo.name} {t('subscription.title')}
              </Text>
              {tierInfo.price && (
                <Text style={styles.subscriptionPrice}>
                  {t('subscription.price_month', { price: tierInfo.price })}
                </Text>
              )}
            </View>
            <CreditCard size={32} color="#2563EB" />
          </View>

          <View style={styles.searchesProgress}>
            <Text style={styles.searchesText}>
              {t('subscription.searches_used', {
                used: searchesUsed,
                total: searchesTotal,
              })}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(searchesUsed / searchesTotal) * 100}%` },
                ]}
              />
            </View>
          </View>

          {profile.subscription_tier === 'trial' && (
            <Button
              title={t('home.upgrade')}
              onPress={() => {
                Toast.show({
                  type: 'info',
                  text1: 'Coming Soon',
                  text2: 'Subscription upgrade will be available soon',
                });
              }}
              variant="outline"
            />
          )}
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.language')}</Text>

          <View style={styles.languageGrid}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageButton,
                  i18n.language === lang.code && styles.languageButtonActive,
                ]}
                onPress={() => handleChangeLanguage(lang.code)}
              >
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <Text
                  style={[
                    styles.languageName,
                    i18n.language === lang.code && styles.languageNameActive,
                  ]}
                >
                  {lang.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Button
          title={t('common.logout')}
          onPress={handleLogout}
          variant="outline"
          loading={isLoading}
          style={styles.logoutButton}
        />

        <Text style={styles.version}>
          {t('profile.version')} 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoText: {
    fontSize: 16,
    color: '#1E293B',
    marginLeft: 12,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subscriptionTier: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  subscriptionPrice: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  searchesProgress: {
    marginBottom: 16,
  },
  searchesText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563EB',
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  languageButtonActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  languageFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  languageName: {
    fontSize: 14,
    color: '#64748B',
  },
  languageNameActive: {
    color: '#2563EB',
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 8,
  },
  version: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 24,
  },
});
