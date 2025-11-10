import Purchases, { 
  CustomerInfo,
  PurchasesPackage 
} from 'react-native-purchases';
import { autoDetectCurrency, CurrencyCode } from '@/utils/currency';
import * as Localization from 'expo-localization';

export interface OfferingPackage {
  identifier: string;
  packageType: string;
  revenueCatPackage: PurchasesPackage; // Keep original for purchase
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
 * Automatically filters to show only EUR or USD packages based on user locale
 * 
 * @returns Object containing subscriptions and search packs for user's currency
 */
export async function getOfferings(): Promise<TruxelOfferings> {
  try {
    const offerings = await Purchases.getOfferings();
    
    // Detect user currency (EUR or USD)
    const deviceLocale = Localization.getLocales()[0]?.languageTag || 'en';
    const userCurrency = autoDetectCurrency(deviceLocale);
    
    console.log(`💰 User currency detected: ${userCurrency} (locale: ${deviceLocale})`);
    
    // Get main subscription offering
    const defaultOffering = offerings.current;
    
    // Get search packs offering
    const searchPacksOffering = offerings.all['search_packs'];
    
    // Filter packages by currency
    const subscriptions = defaultOffering?.availablePackages.filter(pkg =>
      pkg.product.currencyCode === userCurrency
    ) || [];
    
    const searchPacks = searchPacksOffering?.availablePackages.filter(pkg =>
      pkg.product.currencyCode === userCurrency
    ) || [];
    
    console.log(`📦 Found ${subscriptions.length} subscriptions and ${searchPacks.length} search packs for ${userCurrency}`);
    
    return {
      subscriptions: subscriptions.map(formatPackage),
      searchPacks: searchPacks.map(formatPackage),
      userCurrency
    };
  } catch (error) {
    console.error('❌ Error fetching offerings:', error);
    return { 
      subscriptions: [], 
      searchPacks: [],
      userCurrency: 'EUR' // Default fallback
    };
  }
}

/**
 * Purchase a subscription or one-time product
 * 
 * @param pkg - The package to purchase (from getOfferings)
 * @returns CustomerInfo with updated entitlements
 * @throws Error if purchase fails or is cancelled
 */
export async function purchasePackage(pkg: OfferingPackage): Promise<CustomerInfo> {
  try {
    console.log(`🛒 Purchasing package: ${pkg.identifier}`);
    
    const { customerInfo } = await Purchases.purchasePackage(pkg.revenueCatPackage);
    
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
 * @returns CustomerInfo with restored entitlements
 */
export async function restorePurchases(): Promise<CustomerInfo> {
  try {
    console.log('🔄 Restoring purchases...');
    const customerInfo = await Purchases.restorePurchases();
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
 * @returns CustomerInfo
 */
export async function getCustomerInfo(): Promise<CustomerInfo> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
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
 */
function formatPackage(pkg: PurchasesPackage): OfferingPackage {
  return {
    identifier: pkg.identifier,
    packageType: pkg.packageType,
    revenueCatPackage: pkg,
    product: {
      identifier: pkg.product.identifier,
      title: pkg.product.title,
      description: pkg.product.description,
      priceString: pkg.product.priceString,
      price: pkg.product.price,
      currencyCode: pkg.product.currencyCode
    }
  };
}
