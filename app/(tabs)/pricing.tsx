import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ChatSupportModal } from '@/components/ChatSupportModal';
import { useAuthStore } from '@/store/authStore';
import Toast from 'react-native-toast-message';
import {
  Check,
  Zap,
  Shield,
  Users,
  TrendingUp,
  TrendingDown,
  Truck,
  Compass,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { supabase } from '@/lib/supabase';

// Import RevenueCat for native builds
import { 
  getOfferings as getRevenueCatOfferings,
  purchasePackage as purchaseRevenueCatPackage,
  restorePurchases as restoreRevenueCatPurchases,
  getUserTier,
  getExpirationDate,
  type OfferingPackage 
} from '@/services/revenueCatService';

// UI Configuration from Web Version
const UI_TIERS = [
  {
    id: 'standard',
    mobileId: 'standard',
    icon: Truck,
    accentColor: '#64748B', // Slate (Basic)
    titleKey: 'web.pricing.cards.standard.title',
    taglineKey: 'web.pricing.cards.standard.tagline',
    descriptionKey: 'web.pricing.cards.standard.description',
    features: [
      { key: 'feature_searches', highlight: true },
      { key: 'feature_results', highlight: true },
      { key: 'feature_posts', highlight: true },
      { key: 'feature_community', highlight: false },
      { key: 'feature_crm', highlight: false },
      { key: 'feature_contact', highlight: false },
      { key: 'feature_sharing', highlight: false },
    ]
  },
  {
    id: 'pro',
    mobileId: 'pro',
    icon: Zap,
    accentColor: '#FF5722', // Brand Orange (Popular)
    titleKey: 'web.pricing.cards.pro.title',
    taglineKey: 'web.pricing.cards.pro.tagline',
    descriptionKey: 'web.pricing.cards.pro.description',
    popular: true,
    features: [
      { key: 'feature_searches', highlight: true },
      { key: 'feature_results', highlight: true },
      { key: 'feature_posts', highlight: true },
      { key: 'feature_linkedin', highlight: true },
      { key: 'feature_community', highlight: false },
      { key: 'feature_crm', highlight: false },
      { key: 'feature_contact', highlight: false },
      { key: 'feature_sharing', highlight: false },
    ]
  },
  {
    id: 'fleet',
    mobileId: 'fleet_manager',
    icon: Shield,
    accentColor: '#0F172A', // Brand Navy (Corporate)
    titleKey: 'web.pricing.cards.fleet.title',
    taglineKey: 'web.pricing.cards.fleet.tagline',
    descriptionKey: 'web.pricing.cards.fleet.description',
    features: [
      { key: 'feature_searches', highlight: true },
      { key: 'feature_results', highlight: true },
      { key: 'feature_posts', highlight: true },
      { key: 'feature_concurrent', highlight: true },
      { key: 'feature_community', highlight: false },
      { key: 'feature_crm', highlight: false },
      { key: 'feature_contact', highlight: false },
      { key: 'feature_sharing', highlight: false },
    ]
  },
  {
    id: 'freighter',
    mobileId: 'pro_freighter',
    icon: Compass,
    accentColor: '#10B981', // Success Green (Specialized)
    titleKey: 'web.pricing.cards.freighter.title',
    taglineKey: 'web.pricing.cards.freighter.tagline',
    descriptionKey: 'web.pricing.cards.freighter.description',
    features: [
      { key: 'feature_searches', highlight: true },
      { key: 'feature_results', highlight: true },
      { key: 'feature_posts', highlight: true },
      { key: 'feature_linkedin', highlight: true },
      { key: 'feature_concurrent', highlight: true },
      { key: 'feature_community', highlight: false },
      { key: 'feature_crm', highlight: false },
      { key: 'feature_contact', highlight: false },
      { key: 'feature_sharing', highlight: false },
    ]
  },
];

const FAQ_ITEMS = [
  {
    question: 'q1',
    answer: 'a1', // Note: This needs special handling for multipart answer
  },
  {
    question: 'q2',
    answer: 'a2',
  },
  {
    question: 'q3',
    answer: 'a3',
  },
  {
    question: 'q4',
    answer: 'a4', // Special handling
  },
  {
    question: 'q5',
    answer: 'a5',
  },
];

export default function PricingScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const authStore = useAuthStore();
  const profile = authStore?.profile;
  const refreshProfile = authStore?.refreshProfile;
  
  // RevenueCat state
  const [rcSubscriptions, setRcSubscriptions] = useState<OfferingPackage[]>([]);
  const [rcSearchPacks, setRcSearchPacks] = useState<OfferingPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasingPackage, setPurchasingPackage] = useState<string | null>(null);
  
  // UI State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
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
        Toast.show({
          type: 'success',
          text1: t('subscription.activated'),
          text2: t('subscription.activated_message', { tier: t(`subscription.${updatedProfile.subscription_tier}`, updatedProfile.subscription_tier) }),
          visibilityTime: 5000,
        });
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  }, [refreshProfile, t]);

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

    return tierName;
  };

  const loadRevenueCatOfferings = useCallback(async () => {
    // Note: For mobile (iOS/Android), we can load offerings without a user_id
    // The user_id is only required for web (Stripe) and for making purchases
    // We allow viewing prices without being logged in
    
    try {
      setIsLoading(true);
      
      // Use default offering (current)
      // Pass user_id if available, but it's optional for mobile
      const offerings = await getRevenueCatOfferings(profile?.user_id);
      
      // Trust getOfferings() to handle filtering and fallbacks for both Web and Mobile
      const userSubscriptions = offerings.subscriptions;
      const userSearchPacks = offerings.searchPacks;
      
      console.log(`📦 Loaded ${userSubscriptions.length} subscriptions, ${userSearchPacks.length} search packs`);
      
      // ✅ DEDUPLICATE: If multiple packages map to same tier, keep only first one
      const seenTiers = new Set<string>();
      const dedupedSubscriptions = userSubscriptions.filter((pkg) => {
        const tierName = getTierName(pkg.identifier);
        if (seenTiers.has(tierName)) {
          return false; // Skip duplicate
        }
        seenTiers.add(tierName);
        return true; // Keep first occurrence
      });
      
      // ✅ DEDUPLICATE search packs by identifier AND tier name
      const seenSearchPacks = new Set<string>();
      const dedupedSearchPacks = userSearchPacks.filter((pkg) => {
        const tierName = getTierName(pkg.identifier);
        // If it's a known search pack type, deduplicate by type
        if (tierName === 'search_pack') {
          if (seenSearchPacks.has('search_pack')) {
            return false;
          }
          seenSearchPacks.add('search_pack');
          return true;
        }
        
        // Fallback: deduplicate by identifier
        const packName = pkg.identifier;
        if (seenSearchPacks.has(packName)) {
          return false;
        }
        seenSearchPacks.add(packName);
        return true;
      });
      
      setRcSubscriptions(dedupedSubscriptions);
      setRcSearchPacks(dedupedSearchPacks);
      
    } catch (error: any) {
      console.error('❌ RevenueCat error:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.message || t('pricing.failed_load_options'),
      });
      setRcSubscriptions([]);
      setRcSearchPacks([]);
    } finally {
      setIsLoading(false);
    }
  }, [t, profile?.user_id]);

  useEffect(() => {
    // Load offerings immediately - works without login on mobile
    loadRevenueCatOfferings();
    
    // Only check subscription status if user is logged in
    if (profile?.user_id) {
      checkSubscriptionStatus();
    }
  }, [loadRevenueCatOfferings, checkSubscriptionStatus, profile?.user_id]);

  const handleRevenueCatPurchase = async (pkg: OfferingPackage) => {
    if (!profile?.user_id) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('pricing.login_to_continue'),
      });
      return;
    }

    // Determine if this is an upgrade/downgrade or new purchase
    const currentTier = profile?.subscription_tier;
    const isUpgradeOrChange = currentTier && currentTier !== 'trial';
    const targetTier = getTierName(pkg.identifier);
    
    console.log(`🛒 Purchase flow: currentTier=${currentTier}, targetTier=${targetTier}, isUpgrade=${isUpgradeOrChange}`);

    // Get searches per month for each tier
    const getSearchesForTier = (tier: string): number => {
      const searchLimits: Record<string, number> = {
        'pro_freighter': 50,
        'pro': 50,
        'fleet_manager': 30,
        'standard': 30,
        'trial': 5,
      };
      return searchLimits[tier] || 5;
    };

    try {
      setPurchasingPackage(pkg.identifier);
      
      const info = await purchaseRevenueCatPackage(pkg, profile.user_id);
      
      const newTier = getUserTier(info);
      const expirationDate = getExpirationDate(info);
      const searchCredits = getSearchesForTier(newTier);
      
      // Sync subscription data to Supabase immediately (don't wait for webhook)
      // This ensures the renewal date shows correctly in the UI
      // Also reset monthly_searches_used and set available_search_credits
      if (newTier !== 'trial') {
        console.log('📅 Syncing subscription to Supabase:', { tier: newTier, expirationDate, searchCredits });
        const { error: syncError } = await supabase
          .from('profiles')
          .update({
            subscription_tier: newTier,
            subscription_status: 'active',
            subscription_renewal_date: expirationDate,
            subscription_start_date: new Date().toISOString(),
            monthly_searches_used: 0, // Reset on subscription change
            available_search_credits: searchCredits, // Set based on tier
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', profile.user_id);
        
        if (syncError) {
          console.warn('⚠️ Failed to sync subscription to Supabase:', syncError);
          // Don't throw - the webhook will handle it eventually
        } else {
          console.log('✅ Subscription synced to Supabase');
        }
      }
      
      // Refresh profile to update local state
      await authStore.refreshProfile?.();
      
      // Get translated tier name for display
      const translatedTier = t(`subscription.${newTier}`, newTier);
      
      // Show appropriate message for upgrade vs new purchase
      // Both messages now include the tier name using i18n
      Toast.show({
        type: 'success',
        text1: isUpgradeOrChange 
          ? t('subscription.upgrade_success_title', { tier: translatedTier })
          : t('subscription.activated'),
        text2: isUpgradeOrChange
          ? t('subscription.upgrade_success_message', { tier: translatedTier })
          : t('subscription.activated_message', { tier: translatedTier }),
        visibilityTime: 5000,
      });
      
      // Reload offerings to update UI
      await loadRevenueCatOfferings();
    } catch (error: any) {
      console.error('❌ RevenueCat purchase failed:', error);
      
      if (error.message !== 'User cancelled purchase') {
        // Check for common iOS subscription errors
        const errorMsg = error.message?.toLowerCase() || '';
        let userMessage = error.message || t('pricing.purchase_failed_message');
        
        // iOS error when trying to purchase from different subscription group
        if (errorMsg.includes('cancel') && errorMsg.includes('subscription')) {
          userMessage = Platform.OS === 'ios' 
            ? t('pricing.ios_subscription_conflict', 'To change plans, please manage your subscription in iPhone Settings > Apple ID > Subscriptions.')
            : t('pricing.android_subscription_conflict', 'To change plans, please manage your subscription in Google Play Store > Subscriptions.');
        }
        
        Alert.alert(t('common.error'), userMessage);
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
        text2: t('pricing.login_to_restore'),
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const info = await restoreRevenueCatPurchases(profile.user_id);
      
      const tier = getUserTier(info);
      const expirationDate = getExpirationDate(info);
      
      // Sync restored subscription data to Supabase immediately
      if (tier !== 'trial') {
        console.log('📅 Syncing restored subscription to Supabase:', { tier, expirationDate });
        const { error: syncError } = await supabase
          .from('profiles')
          .update({
            subscription_tier: tier,
            subscription_status: 'active',
            subscription_renewal_date: expirationDate,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', profile.user_id);
        
        if (syncError) {
          console.warn('⚠️ Failed to sync restored subscription to Supabase:', syncError);
        } else {
          console.log('✅ Restored subscription synced to Supabase');
        }
      }
      
      await authStore.refreshProfile?.();
      
      Toast.show({
        type: 'success',
        text1: t('subscription.restored'),
        text2: t('subscription.restored_message', { tier: t(`subscription.${tier}`, tier) }),
      });
      
      await loadRevenueCatOfferings();
    } catch (error: any) {
      console.error('❌ Restore failed:', error);
      Alert.alert(
        t('common.error'),
        t('pricing.restore_failed_message')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const usageStats = useMemo(() => {
    if (!profile) return null;
    
    // Find active tier limit
    const activeTierName = profile.subscription_tier as string;
    let limit = 5; // Default trial
    
    if (activeTierName === 'standard') limit = 30;
    else if (activeTierName === 'pro') limit = 50;
    else if (activeTierName === 'fleet_manager') limit = 30;
    else if (activeTierName === 'pro_freighter') limit = 50;
    else if (activeTierName === 'premium') limit = 100;

    const used = profile.monthly_searches_used ?? 0;
    const percent = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
    const remaining = Math.max(0, limit - used);

    return { used, limit, percent, remaining };
  }, [profile]);

  const usageInsight = useMemo(() => {
    if (!usageStats) return null;

    if (usageStats.percent >= 80) {
      return {
        icon: <TrendingUp size={20} color={theme.colors.error} />,
        text: `You've used ${usageStats.percent}% of your monthly searches.`,
      };
    }

    return {
      icon: <TrendingDown size={20} color={theme.colors.success} />,
      text: `${usageStats.remaining} searches left this month.`,
    };
  }, [usageStats, theme.colors.error, theme.colors.success]);

  const renderFeatureText = (text: string, highlight: boolean) => {
    // If highlight is true, bold the entire text
    if (highlight) {
      return (
        <Text style={[styles.featureText, { color: theme.colors.text, fontWeight: '700' }]}>
          {text}
        </Text>
      );
    }

    // Otherwise, just bold the numbers
    const parts = text.split(/(\d+(?:[\.,]\d+)?)/);
    return (
      <Text style={[styles.featureText, { color: theme.colors.text }]}>
        {parts.map((part, index) => {
          const isNumber = /\d/.test(part);
          return (
            <Text
              key={index}
              style={isNumber ? { fontWeight: '700', color: theme.colors.primary } : undefined}
            >
              {part}
            </Text>
          );
        })}
      </Text>
    );
  };

  const openLegalLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Hero Section */}
        <View style={[styles.hero, { backgroundColor: theme.colors.secondary }]}>
          <View style={styles.webContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{t('web.pricing.hero_badge')}</Text>
          </View>
          
          <Text style={styles.heroTitle}>{t('web.pricing.hero_title')}</Text>
          <Text style={styles.heroSubtitle}>{t('web.pricing.hero_subtitle')}</Text>

          <View style={styles.highlights}>
            <View style={styles.highlight}>
              <Check size={16} color="white" strokeWidth={2.5} />
              <Text style={styles.highlightText}>{t('web.pricing.hero_feature1')}</Text>
            </View>
            <View style={styles.highlight}>
              <Check size={16} color="white" strokeWidth={2.5} />
              <Text style={styles.highlightText}>{t('web.pricing.hero_feature2')}</Text>
            </View>
            <View style={styles.highlight}>
              <Check size={16} color="white" strokeWidth={2.5} />
              <Text style={styles.highlightText}>{t('web.pricing.hero_feature3')}</Text>
            </View>
          </View>
          </View>
        </View>

        <View style={styles.webContainer}>
        {/* Current Subscription Card */}
        {profile?.subscription_tier !== 'trial' && profile?.subscription_status && (
          <Card style={[styles.currentSubscriptionCard, { backgroundColor: theme.colors.primary + '10', borderColor: theme.colors.primary + '40' }]}>
            <View style={styles.currentSubscriptionHeader}>
              <Shield size={24} color={theme.colors.primary} />
              <View style={styles.currentSubscriptionInfo}>
                <Text style={[styles.currentSubscriptionTitle, { color: theme.colors.text }]}>
                  {t(`pricing.tier_${profile.subscription_tier}`)} Plan
                </Text>
                <Text style={[styles.currentSubscriptionStatus, { color: theme.colors.textSecondary }]}>
                  {profile.subscription_status === 'active'
                    ? t('subscription.renews_on', {
                        date: (profile.subscription_renewal_date || profile.stripe_current_period_end)
                          ? new Date(profile.subscription_renewal_date || profile.stripe_current_period_end!).toLocaleDateString()
                          : t('subscription.soon')
                      })
                    : t('subscription.cancellation_pending')}
                </Text>
              </View>
            </View>
            <View style={[styles.creditInfo, { borderTopColor: theme.colors.border }]}>
              <Text style={[styles.creditLabel, { color: theme.colors.textSecondary }]}>
                {t('subscription.searches_remaining')}
              </Text>
              <Text style={[styles.creditValue, { color: theme.colors.text }]}>
                {profile.available_search_credits || 0}
              </Text>
            </View>
            {usageInsight && (
              <View style={[styles.usageInsight, { backgroundColor: theme.colors.info + '20' }]}>
                {usageInsight.icon}
                <Text style={[styles.usageInsightText, { color: theme.colors.text }]}>{usageInsight.text}</Text>
              </View>
            )}
          </Card>
        )}

        {/* Subscription Tiers */}
        <View style={styles.tiersContainer}>
          {rcSubscriptions.length === 0 && !isLoading && (
             <View style={{ width: '100%', padding: 20, alignItems: 'center' }}>
                <Text style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
                   {t('pricing.no_plans_available')}
                </Text>
                {Platform.OS === 'android' && (
                   <Text style={{ color: theme.colors.error, textAlign: 'center', marginTop: 8, fontSize: 12 }}>
                      {t('pricing.android_debug_hint')}
                   </Text>
                )}
             </View>
          )}
          {UI_TIERS.map((uiTier) => {
            // Find matching RevenueCat package
            const pkg = rcSubscriptions.find(p => getTierName(p.identifier) === uiTier.mobileId);
            
            // If no package found for this tier, skip it (or show as unavailable)
            if (!pkg) return null;

            const isActive = profile?.subscription_tier === uiTier.mobileId;
            const Icon = uiTier.icon;

            // --- PROMO LOGIC REMOVED ---
            let discountPercent = 0;
            let originalPriceDisplay = null;
            let finalDisplayPrice = pkg.product.priceString;
            
            // Calculate discount based on standard prices
            // Standard: $29.99, Pro: $49.99
            const standardPrices: Record<string, number> = {
                'standard': 29.99,
                'pro': 49.99,
                'fleet_manager': 29.99,
                'pro_freighter': 49.99
            };

            const standardPrice = standardPrices[uiTier.mobileId];
            
            // If we have a standard price and the current package price is lower, it's a deal!
            if (standardPrice && pkg.product.price < standardPrice - 0.5) { // 0.5 tolerance
                discountPercent = Math.round(((standardPrice - pkg.product.price) / standardPrice) * 100);
                
                // Format original price
                const symbol = pkg.product.priceString.replace(/[0-9.,\s]/g, '') || '€';
                originalPriceDisplay = `${symbol}${standardPrice.toFixed(2)}`;
            }

            // Dynamic values for translation
            const translationParams = {
              count: uiTier.mobileId === 'standard' || uiTier.mobileId === 'fleet_manager' ? 30 : 50,
              daily: uiTier.mobileId === 'standard' ? 5 : uiTier.mobileId === 'pro' ? 10 : uiTier.mobileId === 'fleet_manager' ? 30 : 50,
              monthly: uiTier.mobileId === 'standard' ? 30 : uiTier.mobileId === 'pro' ? 100 : uiTier.mobileId === 'fleet_manager' ? 900 : 1500,
            };

            return (
              <Card
                key={uiTier.id}
                style={[
                  styles.tierCard,
                  uiTier.popular && { 
                    borderColor: uiTier.accentColor, 
                    borderWidth: 2,
                    backgroundColor: uiTier.accentColor + '08', // Slight tint for contrast
                    shadowColor: uiTier.accentColor,
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                  },
                  isActive && { backgroundColor: '#F8FAFC', borderColor: theme.colors.success }
                ]}
              >
                {uiTier.popular && !isActive && (
                  <View style={[styles.popularBadge, { backgroundColor: uiTier.accentColor }]}>
                    <Text style={styles.popularBadgeText}>{t('web.pricing.cta_popular')}</Text>
                  </View>
                )}

                {isActive && (
                  <View style={[styles.popularBadge, { backgroundColor: theme.colors.success }]}>
                    <Text style={styles.popularBadgeText}>{t('pricing.current_plan')}</Text>
                  </View>
                )}

                <View style={[styles.iconCircle, { backgroundColor: `${uiTier.accentColor}15` }]}>
                  <Icon size={28} color={uiTier.accentColor} strokeWidth={2} />
                </View>

                <Text style={[styles.tierTitle, { color: theme.colors.text }]}>{t(uiTier.titleKey)}</Text>
                <Text style={[styles.tierTagline, { color: theme.colors.textSecondary }]}>{t(uiTier.taglineKey)}</Text>
                <Text style={[styles.tierDescription, { color: theme.colors.textSecondary }]}>{t(uiTier.descriptionKey)}</Text>

                <View style={styles.priceRow}>
                  <View>
                    {/* Strikethrough Original Price */}
                    {originalPriceDisplay && (
                       <Text style={{ textDecorationLine: 'line-through', color: theme.colors.textSecondary, fontSize: 16, fontWeight: '600', marginBottom: -4, opacity: 0.6 }}>
                          {originalPriceDisplay}
                       </Text>
                    )}

                    {pkg.product.introPrice ? (
                      <>
                        <Text style={[styles.price, { color: uiTier.accentColor, fontSize: 24 }]}>
                          {pkg.product.introPrice.priceString}
                        </Text>
                        
                        <Text style={[styles.perMonth, { color: theme.colors.textSecondary, fontSize: 11 }]}>
                          {t('pricing.intro_offer', { cycles: pkg.product.introPrice.cycles, period: pkg.product.introPrice.periodUnit.toLowerCase() })}
                        </Text>

                        <Text style={[styles.perMonth, { color: theme.colors.textSecondary, textDecorationLine: 'line-through', marginTop: 2 }]}>
                          {pkg.product.priceString}/{t('pricing.month')}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text style={[styles.price, { color: uiTier.accentColor }]}>
                          {finalDisplayPrice}
                        </Text>
                        <Text style={[styles.perMonth, { color: theme.colors.textSecondary }]}>/{t('pricing.month')}</Text>
                      </>
                    )}
                  </View>
                </View>

                <View style={styles.features}>
                  {uiTier.features.map((feature, index) => (
                    <View key={index} style={styles.feature}>
                      <Check size={18} color={uiTier.accentColor} strokeWidth={feature.highlight ? 3 : 2} />
                      {renderFeatureText(
                        t(`web.pricing.cards.${uiTier.id}.${feature.key}`, translationParams),
                        feature.highlight
                      )}
                    </View>
                  ))}
                </View>

                <Button
                  title={isActive ? t('pricing.current_plan') : t('pricing.subscribe')}
                  onPress={() => handleRevenueCatPurchase(pkg)}
                  loading={purchasingPackage === pkg.identifier}
                  disabled={isActive}
                  variant={isActive ? 'outline' : 'primary'}
                  style={!isActive ? { backgroundColor: uiTier.accentColor } : {}}
                />
              </Card>
            );
          })}
        </View>

        {/* Search Packs - Addon Section */}
        {rcSearchPacks.length > 0 && (
          <View style={styles.addonSection}>
            <View style={styles.sectionHeader}>
              <Users size={28} color={theme.colors.primary} />
              <View>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  {t('pricing.additional_searches')}
                </Text>
                <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                  {t('pricing.additional_searches_desc')}
                </Text>
              </View>
            </View>

            {/* Render ONLY the first available search pack to avoid duplication */}
            {(() => {
              const pack = rcSearchPacks[0]; // Take the first one
              if (!pack) return null;
              
              return (
                <Card key={pack.identifier} style={styles.packCard}>
                  <View style={styles.packHeader}>
                    <View>
                      <Text style={[styles.packName, { color: theme.colors.text }]}>
                        25 {t('pricing.searches')}
                      </Text>
                      <Text style={[styles.packDesc, { color: theme.colors.textSecondary }]}>
                        {t('pricing.one_time_purchase')}
                      </Text>
                    </View>
                    <Text style={[styles.packPrice, { color: theme.colors.primary }]}>
                      {pack.product.priceString}
                    </Text>
                  </View>

                  <Button
                    title={t('pricing.buy_now')}
                    onPress={() => handleRevenueCatPurchase(pack)}
                    loading={purchasingPackage === pack.identifier}
                    variant="primary"
                    style={{ backgroundColor: '#FF5722', marginTop: 12 }}
                    textStyle={{ color: '#FFFFFF', fontWeight: 'bold' }}
                  />
                </Card>
              );
            })()}
          </View>
        )}

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={[styles.faqTitle, { color: theme.colors.text }]}>{t('web.pricing.faq_title')}</Text>
          
          <View style={styles.faqList}>
            {FAQ_ITEMS.map((item, index) => {
              const isExpanded = expandedFaq === index;
              return (
                <View key={index} style={[styles.faqItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                  <TouchableOpacity
                    style={styles.faqQuestion}
                    onPress={() => setExpandedFaq(isExpanded ? null : index)}
                  >
                    <Text style={[styles.faqQuestionText, { color: theme.colors.text }]}>{t(`web.pricing.faq.${item.question}`)}</Text>
                    {isExpanded ? (
                      <ChevronUp size={20} color={theme.colors.secondary} />
                    ) : (
                      <ChevronDown size={20} color={theme.colors.secondary} />
                    )}
                  </TouchableOpacity>
                  {isExpanded && (
                    <View style={styles.faqAnswer}>
                      {/* Handle multipart answers for Q1 and Q4 */}
                      {item.question === 'q1' ? (
                        <View style={{ gap: 8 }}>
                          <Text style={[styles.faqAnswerText, { color: theme.colors.textSecondary }]}>• {t('web.pricing.faq.a1_part_standard')}</Text>
                          <Text style={[styles.faqAnswerText, { color: theme.colors.textSecondary }]}>• {t('web.pricing.faq.a1_part_pro')}</Text>
                          <Text style={[styles.faqAnswerText, { color: theme.colors.textSecondary }]}>• {t('web.pricing.faq.a1_part_fleet')}</Text>
                          <Text style={[styles.faqAnswerText, { color: theme.colors.textSecondary }]}>• {t('web.pricing.faq.a1_part_freighter')}</Text>
                        </View>
                      ) : item.question === 'q4' ? (
                        <View style={{ gap: 8 }}>
                          <Text style={[styles.faqAnswerText, { color: theme.colors.textSecondary }]}>🔍 {t('web.pricing.faq.a4_part_search')}</Text>
                          <Text style={[styles.faqAnswerText, { color: theme.colors.textSecondary }]}>📢 {t('web.pricing.faq.a4_part_post')}</Text>
                        </View>
                      ) : (
                        <Text style={[styles.faqAnswerText, { color: theme.colors.textSecondary }]}>{t(`web.pricing.faq.${item.answer}`)}</Text>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Restore Purchases & Support */}
        <View style={styles.footerActions}>
          
          {/* Promo Code Section moved up */}

          <Button
            title={t('subscription.restore_purchases')}
            onPress={handleRestorePurchases}
            loading={isLoading}
            variant="ghost"
          />
          
          <TouchableOpacity
            style={[styles.supportButton, { backgroundColor: theme.colors.info + '10', borderColor: theme.colors.info + '40' }]}
            onPress={() => setShowSupportModal(true)}
          >
            <Text style={[styles.supportButtonText, { color: theme.colors.info }]}>💬 {t('support.title')}</Text>
            <Text style={[styles.supportButtonSubtext, { color: theme.colors.info }]}>{t('support.need_help_choosing')}</Text>
          </TouchableOpacity>
        </View>

        </View>

        <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.webContainer}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>{t('pricing.footer_note')}</Text>
            
            {/* Legal Links */}
            <View style={styles.legalLinks}>
              <TouchableOpacity onPress={() => openLegalLink('https://truxel.com/privacy')}>
                <Text style={[styles.legalLinkText, { color: theme.colors.primary }]}>{t('auth.privacy_policy')}</Text>
              </TouchableOpacity>
              <Text style={[styles.legalSeparator, { color: theme.colors.textSecondary }]}>•</Text>
              <TouchableOpacity onPress={() => openLegalLink('https://truxel.com/terms')}>
                <Text style={[styles.legalLinkText, { color: theme.colors.primary }]}>{t('auth.terms_of_service')}</Text>
              </TouchableOpacity>
              <Text style={[styles.legalSeparator, { color: theme.colors.textSecondary }]}>•</Text>
              <TouchableOpacity onPress={() => openLegalLink('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}>
                <Text style={[styles.legalLinkText, { color: theme.colors.primary }]}>EULA</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

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
  },
  webContainer: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  hero: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 48,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 24,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    lineHeight: 40,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 24,
    opacity: 0.9,
    lineHeight: 24,
  },
  highlights: {
    gap: 12,
  },
  highlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  highlightText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  tiersContainer: {
    paddingHorizontal: 16,
    marginTop: -24, // Overlap hero
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  tierCard: {
    width: '48%',
    padding: 16,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 12,
  },
  popularBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  popularBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  tierTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tierTagline: {
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '600',
  },
  tierDescription: {
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    marginRight: 2,
  },
  perMonth: {
    fontSize: 12,
  },
  features: {
    gap: 8,
    marginBottom: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
  addonSection: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  packCard: {
    padding: 20,
    borderRadius: 16,
  },
  packHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  packName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  packDesc: {
    fontSize: 12,
  },
  packPrice: {
    fontSize: 20,
    fontWeight: '700',
  },
  faqSection: {
    marginTop: 40,
    paddingHorizontal: 16,
  },
  faqTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  faqList: {
    gap: 12,
  },
  faqItem: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestionText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 16,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 22,
  },
  footerActions: {
    marginTop: 32,
    paddingHorizontal: 16,
    gap: 16,
  },
  supportButton: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  supportButtonText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  supportButtonSubtext: {
    fontSize: 12,
    opacity: 0.8,
  },
  footer: {
    marginTop: 32,
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.8,
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    flexWrap: 'wrap',
  },
  legalLinkText: {
    fontSize: 12,
    fontWeight: '600',
  },
  legalSeparator: {
    marginHorizontal: 8,
    fontSize: 12,
  },
  currentSubscriptionCard: {
    marginHorizontal: 16,
    marginTop: -24,
    marginBottom: 24,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    marginBottom: 4,
  },
  currentSubscriptionStatus: {
    fontSize: 14,
  },
  creditInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    marginTop: 12,
  },
  creditLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  creditValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  usageInsight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  usageInsightText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
});
