import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Mobile SDK (iOS/Android)
import PurchasesMobile, { 
  CustomerInfo as CustomerInfoMobile,
  PurchasesPackage 
} from 'react-native-purchases';

// Web SDK
import { Purchases as PurchasesWebClass } from '@revenuecat/purchases-js';
import type { 
  CustomerInfo as CustomerInfoWeb,
  Package as PackageWeb,
  PurchaseResult
} from '@revenuecat/purchases-js';

import { autoDetectCurrency, CurrencyCode } from '@/utils/currency';
import * as Localization from 'expo-localization';

// Platform detection
const isWeb = Platform.OS === 'web';

// Unified CustomerInfo type
export type CustomerInfo = CustomerInfoMobile | CustomerInfoWeb;

// Web SDK instance (initialized lazily)
let webPurchasesInstance: InstanceType<typeof PurchasesWebClass> | null = null;

/**
 * Initialize RevenueCat for web platform
 * Called automatically on first use
 */
function initializeWebSDK(userId: string): InstanceType<typeof PurchasesWebClass> {
  if (webPurchasesInstance) {
    return webPurchasesInstance;
  }
  
  const apiKey = Constants.expoConfig?.extra?.revenueCatWebKey; // Web Billing API key
  
  if (!apiKey) {
    throw new Error('RevenueCat Web API key not configured. Set TRUXEL_REVENUECAT_WEB_KEY in .env');
  }
  
  console.log('🌐 Initializing RevenueCat Web SDK...');
  console.log('🔑 Using Web API key:', apiKey.substring(0, 10) + '...');
  
  webPurchasesInstance = PurchasesWebClass.configure({
    apiKey,
    appUserId: userId
  });
  
  return webPurchasesInstance;
}

export interface OfferingPackage {
  identifier: string;
  packageType: string;
  revenueCatPackage: PurchasesPackage | PackageWeb; // Keep original for purchase
  product: {
    identifier: string;
    title: string;
    description: string;
    priceString: string;
    price: number;
    currencyCode: string;
  };
}

export interface TruxelOfferings {
  subscriptions: OfferingPackage[];
  searchPacks: OfferingPackage[];
  userCurrency: CurrencyCode;
}

/**
 * Fetch available offerings from RevenueCat
 * Works on ALL platforms: iOS (StoreKit), Android (Play Billing), Web (Stripe)
 * Automatically filters to show only EUR or USD packages based on user locale
 * 
 * @param userId - Required for web initialization
 * @returns Object containing subscriptions and search packs for user's currency
 */
export async function getOfferings(userId?: string): Promise<TruxelOfferings> {
  try {
    console.log(`🌍 Platform: ${Platform.OS} | isWeb: ${isWeb}`);

    // Detect user currency (EUR or USD)
    const deviceLocale = Localization.getLocales()[0]?.languageTag || 'en';
    const userCurrency = autoDetectCurrency(deviceLocale);
    console.log(`💰 User currency detected: ${userCurrency} (locale: ${deviceLocale})`);

    let offerings;

    if (isWeb) {
      // Web: Use purchases-js SDK (Stripe backend)
      if (!userId) {
        console.warn('⚠️ User ID required for web payments');
        return {
          subscriptions: [],
          searchPacks: [],
          userCurrency
        };
      }

      console.log('🌐 Initializing web SDK for user:', userId);
      const webSDK = initializeWebSDK(userId);
      console.log('🌐 Fetching offerings from web SDK...');
      offerings = await webSDK.getOfferings();
      console.log('🌐 Offerings received:', offerings);
    } else {
      // Mobile: Use react-native-purchases (native IAP)
      console.log('📱 Fetching offerings from mobile SDK...');
      offerings = await PurchasesMobile.getOfferings();
      console.log('📱 Offerings received:', offerings);
    }

    // Get main subscription offering
    const defaultOffering = offerings.current;

    // Get search packs offering
    const searchPacksOffering = offerings.all['search_packs'];

    console.log('📦 Available offerings:', {
      hasCurrentOffering: !!defaultOffering,
      currentOfferingId: defaultOffering?.identifier,
      allOfferingIds: Object.keys(offerings.all || {}),
      hasSearchPacks: !!searchPacksOffering
    });

    if (!defaultOffering) {
      console.warn('⚠️ No current offering found in RevenueCat Dashboard');
      console.warn('   Please create an offering and set it as current in RevenueCat Dashboard');
      return {
        subscriptions: [],
        searchPacks: [],
        userCurrency
      };
    }

    // Log all available packages BEFORE filtering
    console.log('📦 Available packages in current offering:',
      defaultOffering.availablePackages.map((pkg: any) => ({
        id: pkg.identifier,
        currency: pkg.product?.currencyCode || 'N/A',
        price: pkg.product?.priceString || 'N/A'
      }))
    );

    if (searchPacksOffering) {
      console.log('📦 Available search packs:',
        searchPacksOffering.availablePackages.map((pkg: any) => ({
          id: pkg.identifier,
          currency: pkg.product?.currencyCode || 'N/A',
          price: pkg.product?.priceString || 'N/A'
        }))
      );
    }

    // Filter packages by currency
    let subscriptions = defaultOffering.availablePackages.filter((pkg: any) => {
      const pkgCurrency = pkg.product?.currencyCode;
      const matches = pkgCurrency === userCurrency;
      if (!matches) {
        console.log(`⏭️ Skipping package ${pkg.identifier} (currency: ${pkgCurrency}, wanted: ${userCurrency})`);
      }
      return matches;
    }) || [];

    let searchPacks = searchPacksOffering?.availablePackages.filter((pkg: any) => {
      const pkgCurrency = pkg.product?.currencyCode;
      const matches = pkgCurrency === userCurrency;
      if (!matches) {
        console.log(`⏭️ Skipping search pack ${pkg.identifier} (currency: ${pkgCurrency}, wanted: ${userCurrency})`);
      }
      return matches;
    }) || [];

    console.log(`✅ Filtered to ${subscriptions.length} subscriptions and ${searchPacks.length} search packs for ${userCurrency}`);

    // FALLBACK: If no packages found for user currency, show ALL packages
    if (subscriptions.length === 0 && defaultOffering.availablePackages.length > 0) {
      console.warn('⚠️ No subscriptions found for currency:', userCurrency);
      console.warn('   Showing ALL available currencies as fallback');
      subscriptions = defaultOffering.availablePackages;
    }

    if (searchPacks.length === 0 && searchPacksOffering?.availablePackages.length > 0) {
      console.warn('⚠️ No search packs found for currency:', userCurrency);
      console.warn('   Showing ALL available currencies as fallback');
      searchPacks = searchPacksOffering.availablePackages;
    }

    if (subscriptions.length === 0 && searchPacks.length === 0) {
      console.warn('⚠️ No packages found at all!');
      console.warn('   Check RevenueCat Dashboard to ensure:');
      console.warn('   1. Products are created in Stripe/App Store/Play Store');
      console.warn('   2. Products are added to Offerings');
      console.warn('   3. An Offering is set as "Current"');
    }

    return {
      subscriptions: subscriptions.map(formatPackage),
      searchPacks: searchPacks.map(formatPackage),
      userCurrency
    };
  } catch (error: any) {
    console.error('❌ Error fetching offerings:', error);
    console.error('   Error details:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack
    });
    return {
      subscriptions: [],
      searchPacks: [],
      userCurrency: 'EUR' // Default fallback
    };
  }
}

/**
 * Purchase a subscription or one-time product
 * Works on all platforms: iOS/Android (native IAP) and Web (Stripe)
 * 
 * @param pkg - The package to purchase (from getOfferings)
 * @param userId - Required for web initialization
 * @returns CustomerInfo with updated entitlements
 * @throws Error if purchase fails or is cancelled
 */
export async function purchasePackage(pkg: OfferingPackage, userId?: string): Promise<CustomerInfo> {
  try {
    console.log(`🛒 Purchasing package: ${pkg.identifier} on ${Platform.OS}`);
    
    let customerInfo: CustomerInfo;
    
    if (isWeb) {
      // Web: Use purchases-js SDK
      if (!userId) {
        throw new Error('User ID required for web payments');
      }
      
      const webSDK = initializeWebSDK(userId);
      const result = await webSDK.purchase({
        rcPackage: pkg.revenueCatPackage as PackageWeb
      });
      customerInfo = result.customerInfo;
    } else {
      // Mobile: Use react-native-purchases
      const result = await PurchasesMobile.purchasePackage(pkg.revenueCatPackage as PurchasesPackage);
      customerInfo = result.customerInfo;
    }
    
    console.log('✅ Purchase successful!');
    console.log('Entitlements:', Object.keys(customerInfo.entitlements.active));
    
    return customerInfo;
  } catch (error: any) {
    if (error.userCancelled) {
      console.log('ℹ️ User cancelled purchase');
      throw new Error('User cancelled purchase');
    }
    
    console.error('❌ Purchase failed:', error);
    throw new Error(error.message || 'Purchase failed');
  }
}

/**
 * Restore previous purchases
 * Useful when user reinstalls app or logs in on new device
 * 
 * @param userId - Required for web initialization
 * @returns CustomerInfo with restored entitlements
 */
export async function restorePurchases(userId?: string): Promise<CustomerInfo> {
  try {
    console.log(`🔄 Restoring purchases on ${Platform.OS}...`);
    
    let customerInfo: CustomerInfo;
    
    if (isWeb) {
      // Web: Restore is automatic on getCustomerInfo
      if (!userId) {
        throw new Error('User ID required for web');
      }
      const webSDK = initializeWebSDK(userId);
      customerInfo = await webSDK.getCustomerInfo();
    } else {
      // Mobile: Use react-native-purchases
      customerInfo = await PurchasesMobile.restorePurchases();
    }
    
    console.log('✅ Purchases restored!');
    console.log('Active entitlements:', Object.keys(customerInfo.entitlements.active));
    return customerInfo;
  } catch (error) {
    console.error('❌ Failed to restore purchases:', error);
    throw error;
  }
}

/**
 * Get current user's customer info (entitlements, subscriptions, etc.)
 * 
 * @param userId - Required for web initialization
 * @returns CustomerInfo
 */
export async function getCustomerInfo(userId?: string): Promise<CustomerInfo> {
  try {
    let customerInfo: CustomerInfo;
    
    if (isWeb) {
      if (!userId) {
        throw new Error('User ID required for web');
      }
      const webSDK = initializeWebSDK(userId);
      customerInfo = await webSDK.getCustomerInfo();
    } else {
      customerInfo = await PurchasesMobile.getCustomerInfo();
    }
    
    return customerInfo;
  } catch (error) {
    console.error('❌ Failed to get customer info:', error);
    throw error;
  }
}

/**
 * Check if user has a specific entitlement
 * 
 * Entitlement IDs:
 * - standard_access
 * - pro_access
 * - fleet_manager_access
 * - search_credits
 * 
 * @param customerInfo - Customer info from getCustomerInfo()
 * @param entitlementId - Entitlement lookup key from RevenueCat
 * @returns true if user has active entitlement
 */
export function hasEntitlement(customerInfo: CustomerInfo, entitlementId: string): boolean {
  const entitlement = customerInfo.entitlements.active[entitlementId];
  return entitlement !== undefined;
}

/**
 * Get user's current subscription tier
 * 
 * @param customerInfo - Customer info from getCustomerInfo()
 * @returns 'trial' | 'standard' | 'pro' | 'fleet_manager'
 */
export function getUserTier(customerInfo: CustomerInfo): string {
  if (hasEntitlement(customerInfo, 'pro_access')) {
    return 'pro';
  }
  if (hasEntitlement(customerInfo, 'fleet_manager_access')) {
    return 'fleet_manager';
  }
  if (hasEntitlement(customerInfo, 'standard_access')) {
    return 'standard';
  }
  return 'trial';
}

/**
 * Get remaining search credits from search_credits entitlement
 * Note: For one-time purchases, RevenueCat doesn't track quantity
 * You'll need to track usage in Supabase
 * 
 * @param customerInfo - Customer info from getCustomerInfo()
 * @returns true if user has purchased search credits
 */
export function hasSearchCredits(customerInfo: CustomerInfo): boolean {
  return hasEntitlement(customerInfo, 'search_credits');
}

/**
 * Format RevenueCat package for display
 * Works for both mobile (PurchasesPackage) and web (Package) types
 */
function formatPackage(pkg: PurchasesPackage | PackageWeb): OfferingPackage {
  // Check if it's a web package
  const isWebPackage = 'rcBillingProduct' in pkg;
  
  if (isWebPackage) {
    // Web package structure
    const webProduct = pkg.rcBillingProduct;
    return {
      identifier: pkg.identifier,
      packageType: pkg.packageType,
      revenueCatPackage: pkg,
      product: {
        identifier: webProduct.identifier,
        title: webProduct.title,
        description: webProduct.description || '',
        priceString: webProduct.currentPrice.formattedPrice,
        price: webProduct.currentPrice.amountMicros / 1000000,
        currencyCode: webProduct.currentPrice.currency
      }
    };
  } else {
    // Mobile package structure
    const mobileProduct = pkg.product;
    return {
      identifier: pkg.identifier,
      packageType: pkg.packageType,
      revenueCatPackage: pkg,
      product: {
        identifier: mobileProduct.identifier,
        title: mobileProduct.title,
        description: mobileProduct.description,
        priceString: mobileProduct.priceString,
        price: mobileProduct.price,
        currencyCode: mobileProduct.currencyCode
      }
    };
  }
}
