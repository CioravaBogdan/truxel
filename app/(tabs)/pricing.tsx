import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ChatSupportModal } from '@/components/ChatSupportModal';
import { useAuthStore } from '@/store/authStore';
import { stripeService } from '@/services/stripeService';
import Constants from 'expo-constants';
import Toast from 'react-native-toast-message';
import {
  CreditCard,
  Check,
  Zap,
  Shield,
  Users,
  Sparkles,
  TrendingUp,
  TrendingDown,
  XCircle,
  Tag,
} from 'lucide-react-native';
import { SubscriptionTierData, AdditionalSearchPack } from '@/types/database.types';
import * as WebBrowser from 'expo-web-browser';

// Import RevenueCat for native builds
import { 
  getOfferings as getRevenueCatOfferings,
  purchasePackage as purchaseRevenueCatPackage,
  restorePurchases as restoreRevenueCatPurchases,
  getCustomerInfo,
  getUserTier,
  type OfferingPackage 
} from '@/services/revenueCatService';
import type { CustomerInfo } from 'react-native-purchases';

// TRUXEL: Use ONLY RevenueCat for all platforms (iOS, Android, Web)
const USE_REVENUECAT_ONLY = true;

type TierCommunityMeta = {
  daily?: number;
  monthly?: number;
  unlimited?: boolean;
  priority?: boolean;
  supportKey: string;
};

const TIER_COMMUNITY_META: Record<string, TierCommunityMeta> = {
  standard: {
    daily: 5,
    monthly: 30,
    supportKey: 'pricing.support_standard',
  },
  pro: {
    daily: 10,
    monthly: 100,
    priority: true,
    supportKey: 'pricing.support_priority',
  },
  fleet_manager: {
    daily: 30,
    monthly: 900,
    supportKey: 'pricing.support_standard',
  },
  pro_freighter: {
    daily: 50,
    monthly: 1500,
    priority: true,
    supportKey: 'pricing.support_priority',
  },
  premium: {
    unlimited: true,
    priority: true,
    supportKey: 'pricing.support_priority',
  },
};

export default function PricingScreen() {
  const { t } = useTranslation();
  const authStore = useAuthStore();
  const profile = authStore?.profile;
  const session = authStore?.session;
  const refreshProfile = authStore?.refreshProfile;
  
  // Stripe state (for Expo Go / web fallback)
  const [tiers, setTiers] = useState<SubscriptionTierData[]>([]);
  const [searchPacks, setSearchPacks] = useState<AdditionalSearchPack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingPriceId, setProcessingPriceId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // RevenueCat state (for native builds)
  const [rcSubscriptions, setRcSubscriptions] = useState<OfferingPackage[]>([]);
  const [rcSearchPacks, setRcSearchPacks] = useState<OfferingPackage[]>([]);
  const [rcCustomerInfo, setRcCustomerInfo] = useState<CustomerInfo | null>(null);
  const [userCurrency, setUserCurrency] = useState<'EUR' | 'USD'>('EUR');
  const [purchasingPackage, setPurchasingPackage] = useState<string | null>(null);
  const [debugError, setDebugError] = useState<string | null>(null); // Add debug error state
  
  // Coupon state (Stripe only - not used in RevenueCat native IAP)
  const [couponCode, setCouponCode] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [validatedCoupon, setValidatedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  
  // Support modal state
  const [showSupportModal, setShowSupportModal] = useState(false);

  const checkSubscriptionStatus = useCallback(async () => {
    const state = useAuthStore.getState();
    if (!state.profile || !state.session) {
      return;
    }

    const previousTier = state.profile.subscription_tier;

    try {
      await refreshProfile?.();
      const updatedProfile = useAuthStore.getState().profile;

      if (
        updatedProfile &&
        updatedProfile.subscription_tier !== 'trial' &&
        updatedProfile.subscription_tier !== previousTier
      ) {
        console.log('Subscription status changed:', {
          from: previousTier,
          to: updatedProfile.subscription_tier,
        });

        Toast.show({
          type: 'success',
          text1: t('subscription.activated'),
          text2: `Welcome to ${updatedProfile.subscription_tier} tier! 🎉`,
          visibilityTime: 5000,
        });
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  }, [refreshProfile, t]);

  const loadPricingData = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Loading pricing data...');
      console.log('Calling getAvailableSubscriptionTiers...');

      const tiersData = await stripeService.getAvailableSubscriptionTiers();
      console.log('Tiers received:', JSON.stringify(tiersData));

      console.log('Calling getAvailableSearchPacks...');
      const packsData = await stripeService.getAvailableSearchPacks();
      console.log('Packs received:', JSON.stringify(packsData));

      setTiers(tiersData || []);
      setSearchPacks(packsData || []);
    } catch (error: any) {
      console.error('Pricing error:', error);
      console.error('Error message:', error?.message);
      console.error('Error code:', error?.code);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.message || 'Failed to load pricing',
      });
      setTiers([]);
      setSearchPacks([]);
    } finally {
      console.log('Loading complete - setting isLoading to false');
      setIsLoading(false);
    }
  }, [t]);

  // ✅ Helper: Extract clean tier name from package identifier
  const getTierName = (identifier: string): string => {
    const mapping: Record<string, string> = {
      // Web/Stripe package identifiers
      '$rc_monthly': 'standard',
      '$rc_custom_standard_usd': 'standard',
      '$rc_custom_standard_eur': 'standard',
      '$rc_custom_pro_usd': 'pro',
      '$rc_custom_pro_eur': 'pro',
      '$rc_annual': 'pro',
      '$rc_custom_fleet_manager_usd': 'fleet_manager',
      '$rc_custom_fleet_manager_eur': 'fleet_manager',
      '$rc_custom_pro_freighter_usd': 'pro_freighter',
      '$rc_custom_pro_freighter_eur': 'pro_freighter',

      // iOS package identifiers (from App Store Connect)
      'truxel_2999_1month': 'standard',
      'truxel_4999_1month': 'pro',
      'truxel_2999_fleet_1month': 'fleet_manager',
      'truxel_4999_profreighter_1month': 'pro_freighter',
      'truxel_4999_frighter_1month': 'pro_freighter', // Handle typo in App Store Connect
      'truxel_2499_onetime': 'search_pack', // Search Pack addon (one-time purchase)
      'one_time_25_searches': 'search_pack', // New ID format

      // Android package identifiers (when ready)
      'truxel_standard_monthly': 'standard',
      'truxel_pro_monthly': 'pro',
      'truxel_fleet_manager_monthly': 'fleet_manager',
      'truxel_pro_freighter_monthly': 'pro_freighter',
      'truxel_search_pack_25': 'search_pack',
    };

    const cleanId = identifier.toLowerCase();

    // Check exact match first
    if (mapping[cleanId]) {
      console.log(`📋 Tier mapping: ${identifier} → ${mapping[cleanId]}`);
      return mapping[cleanId];
    }

    // Fallback: extract from identifier (e.g., "fleet_manager" from custom name)
    let tierName = 'standard'; // Default

    if (cleanId.includes('pro_freighter') || cleanId.includes('profreighter')) {
      tierName = 'pro_freighter';
    } else if (cleanId.includes('fleet')) {
      tierName = 'fleet_manager';
    } else if (cleanId.includes('4999') || cleanId.includes('49.99') || cleanId.includes('pro')) {
      tierName = 'pro';
    } else if (cleanId.includes('2999') || cleanId.includes('29.99') || cleanId.includes('standard')) {
      tierName = 'standard';
    }

    console.log(`⚠️ Tier fallback used: ${identifier} → ${tierName}`);
    return tierName;
  };

  // ✅ Helper: Get features for tier name (string key, not object)
  const getTierFeaturesByName = (tierName: string): string[] => {
    const tier = tiers.find((t) => t.tier_name === tierName);
    if (!tier) {
      // Fallback features for RevenueCat tiers without Stripe data
      const communityMeta = TIER_COMMUNITY_META[tierName];
      const features: string[] = [];
      
      if (tierName === 'standard') {
        features.push(`30 ${t('pricing.searches_per_month')}`);
        features.push(t('pricing.max_results', { count: 10 }));
        features.push(t('pricing.linkedin_contacts'));
      } else if (tierName === 'pro') {
        features.push(`50 ${t('pricing.searches_per_month')}`);
        features.push(t('pricing.linkedin_contacts'));
        features.push(t('pricing.ai_matching'));
        features.push(t('pricing.advanced_research'));
      } else if (tierName === 'fleet_manager') {
        features.push(`30 ${t('pricing.searches_per_month')}`);
        features.push(t('pricing.max_results', { count: 10 }));
        features.push('Manage multiple drivers and routes');
        features.push('Fleet tracking and logistics');
      } else if (tierName === 'pro_freighter') {
        features.push(`50 ${t('pricing.searches_per_month')}`);
        features.push(t('pricing.max_results', { count: 20 }));
        features.push(t('pricing.linkedin_contacts'));
        features.push(t('pricing.ai_matching'));
        features.push(t('pricing.advanced_research'));
      } else if (tierName === 'search_pack') {
        // Search Pack is one-time purchase, not subscription
        features.push('25 additional company searches');
        features.push('Never expires');
        features.push('Works with any plan');
        return features; // Return early, no community meta
      }
      
      // Add community features
      if (communityMeta) {
        features.push(t('pricing.community_contacts'));
        if (communityMeta.unlimited) {
          features.push(t('pricing.community_unlimited_posts'));
        } else if (communityMeta.daily && communityMeta.monthly) {
          features.push(
            t('pricing.community_posts_limit', {
              daily: communityMeta.daily,
              monthly: communityMeta.monthly,
            })
          );
        }
        if (communityMeta.priority) {
          features.push(t('pricing.community_priority'));
        }
        features.push(t(communityMeta.supportKey));
      }
      
      return features;
    }
    
    return getTierFeatures(tier); // Use existing function for Stripe tiers
  };

  const loadRevenueCatOfferings = useCallback(async () => {
    if (!profile?.user_id) {
      console.error('❌ No user_id available for RevenueCat');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('📦 Loading RevenueCat offerings for user:', profile.user_id);
      
      const offerings = await getRevenueCatOfferings(profile.user_id);
      
      // ✅ FIX: Filter to show ONLY user's currency (no duplicates)
      // 🔍 DEBUG: Log ALL package identifiers BEFORE filtering
      console.log('🔍 ALL subscriptions BEFORE filter:', offerings.subscriptions.map(p => ({
        id: p.identifier,
        currency: p.product.currencyCode,
        price: p.product.priceString
      })));
      
      // ON MOBILE: Trust getOfferings() which returns all available store packages
      // ON WEB: Filter by currency to avoid showing mixed currencies
      const userSubscriptions = Platform.OS === 'web' 
        ? offerings.subscriptions.filter((pkg) => pkg.product.currencyCode === offerings.userCurrency)
        : offerings.subscriptions;

      const userSearchPacks = Platform.OS === 'web'
        ? offerings.searchPacks.filter((pkg) => pkg.product.currencyCode === offerings.userCurrency)
        : offerings.searchPacks;
      
      // 🔍 DEBUG: Log AFTER currency filter (before tier dedup)
      console.log('🔍 AFTER currency filter (BEFORE tier dedup):', userSubscriptions.map(p => ({
        id: p.identifier,
        tierName: getTierName(p.identifier),
        currency: p.product.currencyCode
      })));
      
      // ✅ DEDUPLICATE: If multiple packages map to same tier, keep only first one
      const seenTiers = new Set<string>();
      const dedupedSubscriptions = userSubscriptions.filter((pkg) => {
        const tierName = getTierName(pkg.identifier);
        if (seenTiers.has(tierName)) {
          console.log(`🗑️ Removing duplicate tier: ${tierName} (package: ${pkg.identifier})`);
          return false; // Skip duplicate
        }
        seenTiers.add(tierName);
        return true; // Keep first occurrence
      });
      
      console.log('🔍 AFTER tier deduplication:', dedupedSubscriptions.map(p => ({
        id: p.identifier,
        tierName: getTierName(p.identifier)
      })));
      
      // ✅ DEDUPLICATE search packs by identifier AND tier name
      const seenSearchPacks = new Set<string>();
      const dedupedSearchPacks = userSearchPacks.filter((pkg) => {
        const tierName = getTierName(pkg.identifier);
        // If it's a known search pack type, deduplicate by type
        if (tierName === 'search_pack') {
          if (seenSearchPacks.has('search_pack')) {
            console.log(`🗑️ Removing duplicate search pack type: ${tierName} (package: ${pkg.identifier})`);
            return false;
          }
          seenSearchPacks.add('search_pack');
          return true;
        }
        
        // Fallback: deduplicate by identifier
        const packName = pkg.identifier;
        if (seenSearchPacks.has(packName)) {
          console.log(`🗑️ Removing duplicate search pack: ${packName}`);
          return false;
        }
        seenSearchPacks.add(packName);
        return true;
      });
      
      console.log('🔍 Search packs after dedup:', dedupedSearchPacks.map(p => p.identifier));
      
      setRcSubscriptions(dedupedSubscriptions);
      setRcSearchPacks(dedupedSearchPacks);
      setUserCurrency(offerings.userCurrency);
      
      const info = await getCustomerInfo(profile.user_id);
      setRcCustomerInfo(info as any);
      
      console.log('✅ RevenueCat offerings loaded:', {
        subscriptions: dedupedSubscriptions.length,
        searchPacks: dedupedSearchPacks.length,
        currency: offerings.userCurrency,
        currencyFiltered: `${offerings.subscriptions.length - userSubscriptions.length} packages removed`,
        tierDeduped: `${userSubscriptions.length - dedupedSubscriptions.length} duplicate tiers removed`
      });
    } catch (error: any) {
      console.error('❌ RevenueCat error:', error);
      setDebugError(error.message); // Capture error for debug UI
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.message || 'Failed to load pricing options',
      });
      setRcSubscriptions([]);
      setRcSearchPacks([]);
    } finally {
      setIsLoading(false);
    }
  }, [t, profile?.user_id]);

  useEffect(() => {
    console.log('📦 PricingScreen mounted - Loading RevenueCat offerings (Universal)');
    loadRevenueCatOfferings();
    
    
    checkSubscriptionStatus();
  }, [loadRevenueCatOfferings, loadPricingData, checkSubscriptionStatus]);

  useEffect(() => {
    const checkInterval = setInterval(() => {
      checkSubscriptionStatus();
    }, 5000);

    return () => clearInterval(checkInterval);
  }, [checkSubscriptionStatus]);

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: 'Please enter a coupon code',
      });
      return;
    }

    if (!session?.access_token) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: 'Not authenticated',
      });
      return;
    }

    try {
      setValidatingCoupon(true);
      setCouponError(null);
      console.log('Validating coupon:', couponCode);

      const result = await stripeService.validateCoupon(
        couponCode,
        session.access_token
      );

      if (result.valid && result.coupon) {
        setValidatedCoupon(result.coupon);
        setCouponError(null);
        Toast.show({
          type: 'success',
          text1: 'Coupon Applied!',
          text2: result.coupon.discount_text,
        });
      } else {
        setValidatedCoupon(null);
        setCouponError(result.error || 'Invalid coupon code');
        Toast.show({
          type: 'error',
          text1: 'Invalid Coupon',
          text2: result.error || 'This coupon code is not valid',
        });
      }
    } catch (error: any) {
      console.error('Coupon validation error:', error);
      setValidatedCoupon(null);
      setCouponError(error.message || 'Failed to validate coupon');
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.message || 'Failed to validate coupon',
      });
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setValidatedCoupon(null);
    setCouponError(null);
  };

  const handleSubscribe = async (tier: any) => {
    if (!tier.stripe_price_id) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: 'Pricing not configured',
      });
      return;
    }

    if (!session?.access_token) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: 'Not authenticated',
      });
      return;
    }

    try {
      setProcessingPriceId(tier.stripe_price_id);
      console.log('handleSubscribe: Creating checkout session for', tier.tier_name);

      const { url } = await stripeService.createCheckoutSession(
        tier.stripe_price_id,
        'subscription',
        'truxel://subscription-success',
        'truxel://subscription-cancelled',
        session.access_token,
        validatedCoupon?.id // Pass coupon code if validated
      );

      console.log('handleSubscribe: Opening checkout URL:', url);
      await WebBrowser.openBrowserAsync(url);
    } catch (error: any) {
      console.error('handleSubscribe error:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.message,
      });
    } finally {
      setProcessingPriceId(null);
    }
  };

  const handleBuySearchPack = async (pack: AdditionalSearchPack) => {
    if (!pack.stripe_price_id) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: 'Pricing not configured',
      });
      return;
    }

    if (!session?.access_token) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: 'Not authenticated',
      });
      return;
    }

    try {
      setProcessingPriceId(pack.stripe_price_id);
      console.log('handleBuySearchPack: Creating checkout session for', pack.pack_name);

      const { url } = await stripeService.createCheckoutSession(
        pack.stripe_price_id,
        'search_pack',
        'truxel://purchase-success',
        'truxel://purchase-cancelled',
        session.access_token,
        validatedCoupon?.id // Pass coupon code if validated
      );

      console.log('handleBuySearchPack: Opening checkout URL:', url);
      await WebBrowser.openBrowserAsync(url);
    } catch (error: any) {
      console.error('handleBuySearchPack error:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.message,
      });
    } finally {
      setProcessingPriceId(null);
    }
  };

  const handleRevenueCatPurchase = async (pkg: OfferingPackage) => {
    if (!profile?.user_id) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: 'Please login to continue',
      });
      return;
    }

    try {
      setPurchasingPackage(pkg.identifier);
      console.log('🛒 RevenueCat purchase:', pkg.identifier, 'for user:', profile.user_id);
      
      const info = await purchaseRevenueCatPackage(pkg, profile.user_id);
      setRcCustomerInfo(info as any);
      
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
      await loadRevenueCatOfferings();
    } catch (error: any) {
      console.error('❌ RevenueCat purchase failed:', error);
      
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

  const handleRestorePurchases = async () => {
    if (!profile?.user_id) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: 'Please login to restore purchases',
      });
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('🔄 Restoring RevenueCat purchases for user:', profile.user_id);
      
      const info = await restoreRevenueCatPurchases(profile.user_id);
      setRcCustomerInfo(info as any);
      
      const tier = getUserTier(info);
      console.log('✅ Purchases restored! Tier:', tier);
      
      await authStore.refreshProfile?.();
      
      Toast.show({
        type: 'success',
        text1: t('subscription.restored'),
        text2: `Your ${tier} subscription has been restored.`,
      });
      
      await loadRevenueCatOfferings();
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

  const handleUpgrade = async (tier: SubscriptionTierData) => {
    if (!tier.stripe_price_id) return;

    if (!session?.access_token) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: 'Not authenticated',
      });
      return;
    }

    Alert.alert(
      t('subscription.upgrade_confirm_title'),
      t('subscription.upgrade_confirm_message', {
        tier: tier.tier_name.toUpperCase(),
        price: `€${tier.price}`,
      }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('subscription.upgrade'),
          onPress: async () => {
            try {
              setProcessingPriceId(tier.stripe_price_id || null);
              console.log('handleUpgrade: Creating Stripe Checkout for upgrade to', tier.tier_name);
              
              // FIX: Use Stripe Checkout for upgrade (shows payment confirmation, no instant charge)
              const { url } = await stripeService.createCheckoutSession(
                tier.stripe_price_id!,
                'subscription', // This will be an upgrade, Stripe handles proration
                'truxel://subscription-success',
                'truxel://subscription-cancelled',
                session.access_token,
                validatedCoupon?.id
              );

              console.log('handleUpgrade: Opening Stripe Checkout:', url);
              await WebBrowser.openBrowserAsync(url);
              
              // Profile will be updated by webhook after successful payment
            } catch (error: any) {
              console.error('handleUpgrade error:', error);
              Toast.show({
                type: 'error',
                text1: t('common.error'),
                text2: error.message,
              });
            } finally {
              setProcessingPriceId(null);
            }
          },
        },
      ]
    );
  };

  const handleDowngrade = async (tier: SubscriptionTierData) => {
    if (!tier.stripe_price_id) return;

    if (!session?.access_token) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: 'Not authenticated',
      });
      return;
    }

    Alert.alert(
      t('subscription.downgrade_confirm_title'),
      t('subscription.downgrade_confirm_message', {
        tier: tier.tier_name.toUpperCase(),
        price: `€${tier.price}`,
      }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('subscription.downgrade'),
          onPress: async () => {
            try {
              setActionLoading('downgrade');
              console.log('handleDowngrade: Downgrading to', tier.tier_name);
              
              await stripeService.downgradeSubscription(tier.stripe_price_id!, session.access_token);
              
              Toast.show({
                type: 'success',
                text1: t('subscription.downgrade_success_title'),
                text2: t('subscription.downgrade_success_message'),
              });
              await loadPricingData();
              await refreshProfile();
            } catch (error: any) {
              console.error('handleDowngrade error:', error);
              Toast.show({
                type: 'error',
                text1: t('common.error'),
                text2: error.message,
              });
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const handleCancelSubscription = async () => {
    if (!session?.access_token) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: 'Not authenticated',
      });
      return;
    }

    Alert.alert(
      t('subscription.cancel_confirm_title'),
      t('subscription.cancel_confirm_message'),
      [
        { text: t('common.no'), style: 'cancel' },
        {
          text: t('subscription.yes_cancel'),
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading('cancel');
              console.log('handleCancelSubscription: Canceling subscription');
              
              await stripeService.cancelSubscription(session.access_token);
              
              Toast.show({
                type: 'success',
                text1: t('subscription.cancel_success_title'),
                text2: t('subscription.cancel_success_message'),
              });
              await loadPricingData();
              await refreshProfile();
            } catch (error: any) {
              console.error('handleCancelSubscription error:', error);
              Toast.show({
                type: 'error',
                text1: t('common.error'),
                text2: error.message,
              });
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const handleReactivateSubscription = async () => {
    if (!session?.access_token) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: 'Not authenticated',
      });
      return;
    }

    try {
      setActionLoading('reactivate');
      console.log('handleReactivateSubscription: Reactivating subscription');
      
      await stripeService.reactivateSubscription(session.access_token);
      
      Toast.show({
        type: 'success',
        text1: t('subscription.reactivate_success_title'),
        text2: t('subscription.reactivate_success_message'),
      });
      await loadPricingData();
      await refreshProfile();
    } catch (error: any) {
      console.error('handleReactivateSubscription error:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.message,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getTierIcon = (tierName: string) => {
    switch (tierName) {
      case 'standard':
        return <Zap size={32} color="#2563EB" />;
      case 'pro':
        return <Sparkles size={32} color="#7C3AED" />;
      case 'fleet_manager':
        return <Users size={32} color="#059669" />; // Green for fleet management
      case 'pro_freighter':
        return <TrendingUp size={32} color="#DC2626" />; // Red/Premium for Pro Freighter
      case 'premium':
        return <Shield size={32} color="#DC2626" />;
      case 'search_pack':
        return <Check size={32} color="#10B981" />; // Green checkmark for addon
      default:
        return <CreditCard size={32} color="#64748B" />;
    }
  };

  const getTierFeatures = (tier: SubscriptionTierData) => {
    const features: string[] = [];

    if (tier.searches_per_month) {
      features.push(`${tier.searches_per_month} ${t('pricing.searches_per_month')}`);
    }

    if (tier.max_results_per_search) {
      features.push(t('pricing.max_results', { count: tier.max_results_per_search }));
    }

    if (tier.linkedin_enabled) {
      features.push(t('pricing.linkedin_contacts'));
    }

    if (tier.ai_matching_enabled) {
      features.push(t('pricing.ai_matching'));
    }

    if (tier.advanced_research_enabled) {
      features.push(t('pricing.advanced_research'));
    }

    const communityMeta = TIER_COMMUNITY_META[tier.tier_name];

    if (communityMeta) {
      features.push(t('pricing.community_contacts'));

      if (communityMeta.unlimited) {
        features.push(t('pricing.community_unlimited_posts'));
      } else if (communityMeta.daily && communityMeta.monthly) {
        features.push(
          t('pricing.community_posts_limit', {
            daily: communityMeta.daily,
            monthly: communityMeta.monthly,
          })
        );
      }

      if (communityMeta.priority) {
        features.push(t('pricing.community_priority'));
      }

      features.push(t(communityMeta.supportKey));
    }

    return features;
  };

  const activeTier = useMemo(() => {
    if (!profile?.subscription_tier) {
      return undefined;
    }

    return tiers.find((tier) => tier.tier_name === profile.subscription_tier);
  }, [tiers, profile?.subscription_tier]);

  const usageStats = useMemo(() => {
    if (!activeTier || !profile) {
      return null;
    }

    const used = profile.monthly_searches_used ?? 0;
    const limit = activeTier.searches_per_month;
    const percent = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
    const remaining = Math.max(0, limit - used);

    return { used, limit, percent, remaining };
  }, [activeTier, profile]);

  const usageInsight = useMemo(() => {
    if (!usageStats) {
      return null;
    }

    if (usageStats.percent >= 80) {
      return {
        icon: <TrendingUp size={20} color="#DC2626" />,
        text: `You've used ${usageStats.percent}% of your monthly searches. Consider upgrading for more capacity.`,
      };
    }

    return {
      icon: <TrendingDown size={20} color="#10B981" />,
      text: `Keep going! ${usageStats.remaining} searches left this month.`,
    };
  }, [usageStats]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </SafeAreaView>
    );
  }

  const isCurrentTier = (tierName: string) => {
    return profile?.subscription_tier === tierName;
  };

  const calculateDiscountedPrice = (originalPrice: number) => {
    if (!validatedCoupon) return originalPrice;

    if (validatedCoupon.percent_off) {
      return originalPrice * (1 - validatedCoupon.percent_off / 100);
    } else if (validatedCoupon.amount_off) {
      const discountAmount = validatedCoupon.amount_off / 100; // Stripe stores in cents
      return Math.max(0, originalPrice - discountAmount);
    }
    return originalPrice;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <CreditCard size={40} color="#2563EB" />
          <Text style={styles.title}>{t('pricing.title')}</Text>
          <Text style={styles.subtitle}>{t('pricing.subtitle')}</Text>
        </View>

        {profile?.subscription_tier !== 'trial' && profile?.subscription_status && (
          <Card style={styles.currentSubscriptionCard}>
            <View style={styles.currentSubscriptionHeader}>
              <Shield size={24} color="#2563EB" />
              <View style={styles.currentSubscriptionInfo}>
                <Text style={styles.currentSubscriptionTitle}>
                  {t(`pricing.tier_${profile.subscription_tier}`)} Plan
                </Text>
                <Text style={styles.currentSubscriptionStatus}>
                  {profile.subscription_status === 'active'
                    ? `${t('subscription.renews_on')} ${
                        profile.stripe_current_period_end
                          ? new Date(profile.stripe_current_period_end).toLocaleDateString()
                          : ''
                      }`
                    : t('subscription.cancellation_pending')}
                </Text>
              </View>
            </View>
            <View style={styles.creditInfo}>
              <Text style={styles.creditLabel}>
                {t('subscription.searches_remaining')}
              </Text>
              <Text style={styles.creditValue}>
                {profile.available_search_credits || 0}
              </Text>
            </View>
            {usageInsight && (
              <View style={styles.usageInsight}>
                {usageInsight.icon}
                <Text style={styles.usageInsightText}>{usageInsight.text}</Text>
              </View>
            )}
          </Card>
        )}

        {/* Coupon Code Section - HIDDEN (RevenueCat doesn't support coupons in native IAP) */}
        {false && (
          <Card style={styles.couponCard}>
            <View style={styles.couponHeader}>
              <Tag size={24} color="#2563EB" />
              <Text style={styles.couponTitle}>Have a coupon code?</Text>
            </View>
            
            {!validatedCoupon ? (
              <View style={styles.couponInputContainer}>
                <TextInput
                  style={styles.couponInput}
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChangeText={(text) => {
                    setCouponCode(text.toUpperCase());
                    setCouponError(null);
                  }}
                  autoCapitalize="characters"
                  editable={!validatingCoupon}
                />
                <Button
                  title={validatingCoupon ? 'Validating...' : 'Apply'}
                  onPress={handleValidateCoupon}
                  loading={validatingCoupon}
                  variant="primary"
                  style={styles.couponButton}
                />
              </View>
            ) : (
              <View style={styles.couponAppliedContainer}>
                <View style={styles.couponAppliedInfo}>
                  <Check size={20} color="#10B981" />
                  <Text style={styles.couponAppliedText}>
                    Coupon Applied: {validatedCoupon.discount_text}
                  </Text>
                </View>
                <TouchableOpacity onPress={handleRemoveCoupon}>
                  <XCircle size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            )}
            
            {couponError && (
              <Text style={styles.couponError}>{couponError}</Text>
            )}
          </Card>
        )}

        {/* RevenueCat Universal Subscriptions (iOS, Android, Web) */}
        {rcSubscriptions.length > 0 && (
          <View style={styles.tiersContainer}>
            {rcSubscriptions.map((pkg) => {
              // ✅ Use helper function to extract clean tier name
              const tierName = getTierName(pkg.identifier);
              const isActive = profile?.subscription_tier === tierName;
              const features = getTierFeaturesByName(tierName); // ✅ Get features by tier name
              
              return (
                <Card
                  key={pkg.identifier}
                  style={
                    isActive
                      ? { ...styles.tierCard, ...styles.currentTierCard }
                      : styles.tierCard
                  }
                >
                  {isActive && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>
                        {t('pricing.current_plan')}
                      </Text>
                    </View>
                  )}

                  <View style={styles.tierHeader}>
                    {getTierIcon(tierName)}
                    <Text style={styles.tierName}>
                      {t(`pricing.tier_${tierName}`)}
                    </Text>
                    <Text style={styles.tierPrice}>
                      {pkg.product.priceString}
                      <Text style={styles.tierPriceUnit}>
                        /{t('pricing.month')}
                      </Text>
                    </Text>
                  </View>

                  {/* ✅ Display feature list for each tier */}
                  <View style={styles.featuresContainer}>
                    {features.map((feature, index) => (
                      <View key={index} style={styles.featureRow}>
                        <Check size={20} color="#10B981" />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>

                  <Button
                    title={isActive ? t('pricing.current_plan') : t('pricing.subscribe')}
                    onPress={() => handleRevenueCatPurchase(pkg)}
                    loading={purchasingPackage === pkg.identifier}
                    disabled={isActive}
                    variant={isActive ? 'outline' : 'primary'}
                  />
                </Card>
              );
            })}
          </View>
        )}

        {/* Stripe Subscriptions - HIDDEN (Using RevenueCat only) */}
        {false && tiers.length > 0 && (
          <View style={styles.tiersContainer}>
            {tiers.map((tier) => (
            <Card
              key={tier.id}
              style={
                isCurrentTier(tier.tier_name)
                  ? { ...styles.tierCard, ...styles.currentTierCard }
                  : styles.tierCard
              }
            >
              {isCurrentTier(tier.tier_name) && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>
                    {t('pricing.current_plan')}
                  </Text>
                </View>
              )}

              <View style={styles.tierHeader}>
                {getTierIcon(tier.tier_name)}
                <Text style={styles.tierName}>
                  {t(`pricing.tier_${tier.tier_name}`)}
                </Text>
                
                {validatedCoupon ? (
                  <View style={styles.priceWithDiscountContainer}>
                    <Text style={styles.originalPrice}>
                      €{tier.price.toFixed(2)}
                    </Text>
                    <Text style={styles.tierPrice}>
                      €{calculateDiscountedPrice(tier.price).toFixed(2)}
                      <Text style={styles.tierPriceUnit}>
                        /{t('pricing.month')}
                      </Text>
                    </Text>
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountBadgeText}>
                        {validatedCoupon.discount_text}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.tierPrice}>
                    €{tier.price.toFixed(2)}
                    <Text style={styles.tierPriceUnit}>
                      /{t('pricing.month')}
                    </Text>
                  </Text>
                )}
                
                {tier.description && (
                  <Text style={styles.tierDescription}>{tier.description}</Text>
                )}
              </View>

              <View style={styles.featuresContainer}>
                {getTierFeatures(tier).map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Check size={20} color="#10B981" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              {isCurrentTier(tier.tier_name) ? (
                <View style={styles.buttonGroup}>
                  <Button
                    title={t('pricing.current_plan')}
                    onPress={() => {}}
                    disabled={true}
                    variant="outline"
                  />
                  {profile?.subscription_status === 'active' && (
                    <Button
                      title={t('subscription.cancel_subscription')}
                      onPress={handleCancelSubscription}
                      loading={actionLoading === 'cancel'}
                      variant="ghost"
                    />
                  )}
                  {profile?.subscription_status === 'cancelled' && (
                    <Button
                      title={t('subscription.reactivate')}
                      onPress={handleReactivateSubscription}
                      loading={actionLoading === 'reactivate'}
                      variant="primary"
                    />
                  )}
                </View>
              ) : profile?.subscription_status === 'cancelled' ? (
                // FIX: If cancelled, show Subscribe button (not Upgrade)
                <Button
                  title={t('pricing.subscribe')}
                  onPress={() => handleSubscribe(tier)}
                  loading={processingPriceId === tier.stripe_price_id}
                  variant="primary"
                />
              ) : (
                <Button
                  title={
                    profile?.subscription_tier && 
                    tiers.findIndex(t => t.tier_name === tier.tier_name) >
                      tiers.findIndex(t => t.tier_name === profile.subscription_tier)
                      ? t('subscription.upgrade')
                      : profile?.subscription_tier && profile.subscription_tier !== 'trial'
                      ? t('subscription.downgrade')
                      : t('pricing.subscribe')
                  }
                  onPress={() => {
                    if (!profile?.subscription_tier || profile.subscription_tier === 'trial') {
                      handleSubscribe(tier);
                    } else {
                      const currentIndex = tiers.findIndex(t => t.tier_name === profile.subscription_tier);
                      const newIndex = tiers.findIndex(t => t.tier_name === tier.tier_name);
                      if (newIndex > currentIndex) {
                        handleUpgrade(tier);
                      } else {
                        handleDowngrade(tier);
                      }
                    }
                  }}
                  loading={processingPriceId === tier.stripe_price_id || actionLoading === 'upgrade' || actionLoading === 'downgrade'}
                  variant="primary"
                />
              )}
            </Card>
          ))}
          </View>
        )}

        {/* RevenueCat Search Packs (Universal) */}
        {rcSearchPacks.length > 0 && (
          <>
            <View style={styles.divider} />

            <View style={styles.section}>
              <Users size={32} color="#2563EB" />
              <Text style={styles.sectionTitle}>
                {t('pricing.additional_searches')}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {t('pricing.additional_searches_desc')}
              </Text>
            </View>

            <View style={styles.packsContainer}>
              {rcSearchPacks.map((pkg) => (
                <Card key={pkg.identifier} style={styles.packCard}>
                  <View style={styles.packHeader}>
                    <Text style={styles.packName}>
                      {getTierName(pkg.identifier) === 'search_pack' 
                        ? `25 ${t('pricing.searches')}` 
                        : pkg.product.title}
                    </Text>
                    <Text style={styles.packPrice}>{pkg.product.priceString}</Text>
                  </View>

                  <Button
                    title={t('pricing.buy_now')}
                    onPress={() => handleRevenueCatPurchase(pkg)}
                    loading={purchasingPackage === pkg.identifier}
                    variant="outline"
                  />
                </Card>
              ))}
            </View>

            {/* Restore Purchases Button for Native Builds */}
            <Button
              title={t('subscription.restore_purchases')}
              onPress={handleRestorePurchases}
              loading={isLoading}
              variant="ghost"
              style={{ marginTop: 16 }}
            />
          </>
        )}

        {/* Stripe Search Packs - HIDDEN (Using RevenueCat only) */}
        {false && searchPacks.length > 0 && (
          <>
            <View style={styles.divider} />

            <View style={styles.section}>
              <Users size={32} color="#2563EB" />
              <Text style={styles.sectionTitle}>
                {t('pricing.additional_searches')}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {t('pricing.additional_searches_desc')}
              </Text>
            </View>

            <View style={styles.packsContainer}>
              {searchPacks.map((pack) => (
                <Card key={pack.id} style={styles.packCard}>
                  <View style={styles.packHeader}>
                    <Text style={styles.packName}>
                      {pack.searches_count} {t('pricing.searches')}
                    </Text>
                    
                    {validatedCoupon ? (
                      <View style={styles.packPriceContainer}>
                        <Text style={styles.packOriginalPrice}>
                          €{pack.price.toFixed(2)}
                        </Text>
                        <Text style={styles.packPrice}>
                          €{calculateDiscountedPrice(typeof pack.price === 'string' ? parseFloat(pack.price) : pack.price).toFixed(2)}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.packPrice}>€{pack.price.toFixed(2)}</Text>
                    )}
                  </View>

                  <Button
                    title={t('pricing.buy_now')}
                    onPress={() => handleBuySearchPack(pack)}
                    loading={processingPriceId === pack.stripe_price_id}
                    variant="outline"
                  />
                </Card>
              ))}
            </View>
          </>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('pricing.footer_note')}</Text>
        </View>

        {/* Support Button */}
        <TouchableOpacity
          style={styles.supportButton}
          onPress={() => setShowSupportModal(true)}
        >
          <Text style={styles.supportButtonText}>💬 {t('support.title')}</Text>
          <Text style={styles.supportButtonSubtext}>{t('support.need_help_choosing')}</Text>
        </TouchableOpacity>

        {/* DEBUG INFO - Visible only when no subscriptions found */}
        {rcSubscriptions.length === 0 && !isLoading && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>⚠️ Debug Info (No Packages Found)</Text>
            <Text style={styles.debugText}>User ID: {profile?.user_id || 'Not logged in'}</Text>
            <Text style={styles.debugText}>Currency: {userCurrency}</Text>
            <Text style={styles.debugText}>Platform: {Platform.OS}</Text>
            <Text style={styles.debugText}>Error: {debugError || 'None'}</Text>
            <Text style={styles.debugText}>
              Check:
              1. App Store Connect &quot;Paid Apps Agreement&quot;
              2. RevenueCat &quot;Offering&quot; is Current
              3. Product IDs match exactly
            </Text>
            <Button 
              title="Retry Loading" 
              onPress={loadRevenueCatOfferings} 
              variant="outline"
              style={{ marginTop: 10 }}
            />
          </View>
        )}
      </ScrollView>

      {/* Chat Support Modal */}
      <ChatSupportModal
        visible={showSupportModal}
        onClose={() => setShowSupportModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
  tiersContainer: {
    gap: 16,
  },
  tierCard: {
    padding: 24,
    position: 'relative',
  },
  currentTierCard: {
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  currentBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tierHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  tierName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
  },
  tierPrice: {
    fontSize: 40,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 8,
  },
  tierPriceUnit: {
    fontSize: 18,
    fontWeight: '400',
    color: '#64748B',
  },
  tierDescription: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: 24,
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#1E293B',
    flex: 1,
  },
  buttonGroup: {
    gap: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 32,
  },
  section: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
  packsContainer: {
    gap: 16,
  },
  packCard: {
    padding: 20,
  },
  packHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  packName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  packPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563EB',
  },
  currentSubscriptionCard: {
    padding: 20,
    marginBottom: 24,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  currentSubscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  currentSubscriptionInfo: {
    flex: 1,
  },
  currentSubscriptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  currentSubscriptionStatus: {
    fontSize: 14,
    color: '#64748B',
  },
  creditInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 12,
  },
  usageInsight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  usageInsightText: {
    flex: 1,
    color: '#1E293B',
    fontSize: 14,
  },
  creditLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  creditValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  footer: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  // Coupon styles
  couponCard: {
    padding: 20,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  couponTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  couponInputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  couponInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
  },
  couponButton: {
    minWidth: 100,
  },
  couponAppliedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  couponAppliedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  couponAppliedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  couponError: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 8,
  },
  // Price with discount styles
  priceWithDiscountContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  originalPrice: {
    fontSize: 18,
    fontWeight: '400',
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginBottom: 4,
  },
  discountBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  discountBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Search pack discount styles
  packPriceContainer: {
    alignItems: 'flex-end',
  },
  packOriginalPrice: {
    fontSize: 16,
    fontWeight: '400',
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  // Support button styles
  supportButton: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  supportButtonText: {
    fontSize: 16,
    color: '#1E40AF',
    fontWeight: '600',
    marginBottom: 4,
  },
  supportButtonSubtext: {
    fontSize: 13,
    color: '#60A5FA',
  },
  debugContainer: {
    padding: 16,
    margin: 16,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#7F1D1D',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
