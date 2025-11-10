import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/store/authStore';
import Toast from 'react-native-toast-message';
import { Check, Zap, Shield, Users, Sparkles, Package } from 'lucide-react-native';
import { 
  getOfferings, 
  purchasePackage, 
  restorePurchases,
  getCustomerInfo,
  getUserTier,
  type OfferingPackage 
} from '@/services/revenueCatService';
import type { CustomerInfo } from 'react-native-purchases';

export default function PricingScreen() {
  const { t } = useTranslation();
  const authStore = useAuthStore();
  const profile = authStore?.profile;
  
  const [subscriptions, setSubscriptions] = useState<OfferingPackage[]>([]);
  const [searchPacks, setSearchPacks] = useState<OfferingPackage[]>([]);
  const [userCurrency, setUserCurrency] = useState<'EUR' | 'USD'>('EUR');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasingPackage, setPurchasingPackage] = useState<string | null>(null);

  const loadOfferings = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('📦 Loading RevenueCat offerings...');
      
      const offerings = await getOfferings();
      setSubscriptions(offerings.subscriptions);
      setSearchPacks(offerings.searchPacks);
      setUserCurrency(offerings.userCurrency);
      
      const info = await getCustomerInfo();
      setCustomerInfo(info);
      
      console.log('✅ Offerings loaded:', {
        subscriptions: offerings.subscriptions.length,
        searchPacks: offerings.searchPacks.length,
        currency: offerings.userCurrency
      });
    } catch (error: any) {
      console.error('❌ Error loading offerings:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.message || 'Failed to load pricing options',
      });
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadOfferings();
  }, [loadOfferings]);

  const handlePurchase = async (pkg: OfferingPackage) => {
    if (!profile) {
      Alert.alert(t('common.error'), 'Please login to continue');
      return;
    }

    try {
      setPurchasingPackage(pkg.identifier);
      console.log('🛒 Purchasing package:', pkg.identifier);
      
      const info = await purchasePackage(pkg);
      setCustomerInfo(info);
      
      const newTier = getUserTier(info);
      console.log('✅ Purchase successful! New tier:', newTier);
      
      // Refresh profile to update local state
      await authStore.refreshProfile?.();
      
      Toast.show({
        type: 'success',
        text1: t('subscription.activated'),
        text2: `Welcome to ${newTier} tier! 🎉`,
        visibilityTime: 5000,
      });
      
      // Reload offerings to update UI
      await loadOfferings();
    } catch (error: any) {
      console.error('❌ Purchase failed:', error);
      
      if (error.message !== 'User cancelled purchase') {
        Alert.alert(
          t('common.error'),
          error.message || 'Purchase failed. Please try again.'
        );
      }
    } finally {
      setPurchasingPackage(null);
    }
  };

  const handleRestore = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Restoring purchases...');
      
      const info = await restorePurchases();
      setCustomerInfo(info);
      
      const tier = getUserTier(info);
      console.log('✅ Purchases restored! Tier:', tier);
      
      await authStore.refreshProfile?.();
      
      Toast.show({
        type: 'success',
        text1: t('subscription.restored'),
        text2: `Your ${tier} subscription has been restored.`,
      });
      
      await loadOfferings();
    } catch (error: any) {
      console.error('❌ Restore failed:', error);
      Alert.alert(
        t('common.error'),
        'Failed to restore purchases. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getTierIcon = (identifier: string) => {
    if (identifier.includes('standard')) return Shield;
    if (identifier.includes('pro')) return Zap;
    if (identifier.includes('fleet')) return Users;
    return Sparkles;
  };

  const getTierColor = (identifier: string) => {
    if (identifier.includes('standard')) return '#3b82f6'; // Blue
    if (identifier.includes('pro')) return '#8b5cf6'; // Purple
    if (identifier.includes('fleet')) return '#10b981'; // Green
    return '#f59e0b'; // Amber
  };

  const isCurrentSubscription = (pkg: OfferingPackage): boolean => {
    if (!customerInfo) return false;
    
    const entitlements = customerInfo.entitlements.active;
    
    if (pkg.identifier.includes('standard')) {
      return 'standard_access' in entitlements;
    }
    if (pkg.identifier.includes('pro')) {
      return 'pro_access' in entitlements;
    }
    if (pkg.identifier.includes('fleet')) {
      return 'fleet_manager_access' in entitlements;
    }
    
    return false;
  };

  if (isLoading && subscriptions.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('pricing.title', { defaultValue: 'Choose Your Plan' })}</Text>
          <Text style={styles.subtitle}>
            {t('pricing.subtitle', { 
              defaultValue: `Prices shown in ${userCurrency}` 
            })}
          </Text>
          
          {/* Restore Purchases Button */}
          <TouchableOpacity 
            style={styles.restoreButton}
            onPress={handleRestore}
            disabled={isLoading}
          >
            <Text style={styles.restoreButtonText}>
              {t('subscription.restore', { defaultValue: 'Restore Purchases' })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Subscription Plans */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('pricing.subscription_plans', { defaultValue: 'Subscription Plans' })}
          </Text>
          
          {subscriptions.map((pkg) => {
            const Icon = getTierIcon(pkg.identifier);
            const color = getTierColor(pkg.identifier);
            const isCurrent = isCurrentSubscription(pkg);
            const isPurchasing = purchasingPackage === pkg.identifier;
            
            return (
              <Card key={pkg.identifier} style={styles.tierCard}>
                <View style={styles.tierHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                    <Icon size={24} color={color} />
                  </View>
                  <View style={styles.tierInfo}>
                    <Text style={styles.tierName}>{pkg.product.title}</Text>
                    <Text style={styles.tierPrice}>
                      {pkg.product.priceString}
                      <Text style={styles.tierPeriod}>/month</Text>
                    </Text>
                  </View>
                  {isCurrent && (
                    <View style={styles.currentBadge}>
                      <Check size={16} color="#fff" />
                      <Text style={styles.currentBadgeText}>Current</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.tierDescription}>{pkg.product.description}</Text>

                <Button
                  title={
                    isCurrent 
                      ? t('subscription.current_plan', { defaultValue: 'Current Plan' })
                      : isPurchasing
                      ? t('common.loading', { defaultValue: 'Processing...' })
                      : t('subscription.subscribe', { defaultValue: 'Subscribe' })
                  }
                  onPress={() => handlePurchase(pkg)}
                  disabled={isCurrent || isPurchasing}
                  loading={isPurchasing}
                  style={isCurrent ? styles.currentButton : styles.subscribeButton}
                />
              </Card>
            );
          })}
        </View>

        {/* Search Packs */}
        {searchPacks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('pricing.search_packs', { defaultValue: 'Additional Search Credits' })}
            </Text>
            
            {searchPacks.map((pkg) => {
              const isPurchasing = purchasingPackage === pkg.identifier;
              
              return (
                <Card key={pkg.identifier} style={styles.packCard}>
                  <View style={styles.packHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: '#f59e0b15' }]}>
                      <Package size={24} color="#f59e0b" />
                    </View>
                    <View style={styles.packInfo}>
                      <Text style={styles.packName}>{pkg.product.title}</Text>
                      <Text style={styles.packPrice}>{pkg.product.priceString}</Text>
                    </View>
                  </View>

                  <Text style={styles.packDescription}>{pkg.product.description}</Text>

                  <Button
                    title={
                      isPurchasing
                        ? t('common.loading', { defaultValue: 'Processing...' })
                        : t('pricing.buy_now', { defaultValue: 'Buy Now' })
                    }
                    onPress={() => handlePurchase(pkg)}
                    disabled={isPurchasing}
                    loading={isPurchasing}
                    style={styles.buyButton}
                  />
                </Card>
              );
            })}
          </View>
        )}

        {/* Footer Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t('pricing.footer_info', { 
              defaultValue: 'All subscriptions auto-renew. Cancel anytime from your device settings.' 
            })}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  restoreButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  restoreButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  tierCard: {
    marginBottom: 16,
    padding: 20,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tierInfo: {
    flex: 1,
  },
  tierName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  tierPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  tierPeriod: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'normal',
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 4,
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  tierDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  subscribeButton: {
    marginTop: 8,
  },
  currentButton: {
    backgroundColor: '#e5e7eb',
  },
  packCard: {
    marginBottom: 16,
    padding: 20,
  },
  packHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  packInfo: {
    flex: 1,
  },
  packName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  packPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  packDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  buyButton: {
    marginTop: 8,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});
