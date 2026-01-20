import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// RevenueCat API Keys from Expo config
const REVENUECAT_API_KEY = {
  ios: Constants.expoConfig?.extra?.revenueCatIosKey || '',
  android: Constants.expoConfig?.extra?.revenueCatAndroidKey || '',
};

// Track if RevenueCat is initialized
let isRevenueCatInitialized = false;

/**
 * Check if RevenueCat is initialized and ready to use
 */
export function isRevenueCatReady(): boolean {
  return isRevenueCatInitialized;
}

/**
 * Initialize RevenueCat SDK
 * Should be called after user authentication
 * 
 * @param userId - Supabase user ID to link with RevenueCat
 */
export async function initRevenueCat(userId: string): Promise<void> {
  try {
    // Enable debug logging in development
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    // Configure based on platform
    const apiKey = Platform.select({
      ios: REVENUECAT_API_KEY.ios,
      android: REVENUECAT_API_KEY.android,
    });

    if (!apiKey) {
      console.warn(`RevenueCat ${Platform.OS} API key not found in app.config.js`);
      return;
    }

    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      console.warn('RevenueCat: Unsupported platform');
      return;
    }

    let configured = false;
    try {
      configured = await Purchases.isConfigured();
    } catch {
      // Older SDK versions might not expose isConfigured reliably.
      configured = false;
    }

    // IMPORTANT:
    // - The app also configures RevenueCat early in app/_layout.tsx (apiKey only).
    // - To ensure each Supabase user appears as a separate customer (and upgrades map correctly),
    //   we must call Purchases.logIn(userId) after auth.
    if (!configured) {
      await Purchases.configure({ apiKey });
    }

    const loginResult = await Purchases.logIn(userId);
    isRevenueCatInitialized = true;
  } catch (error) {
    console.error('❌ Failed to initialize RevenueCat:', error);
    isRevenueCatInitialized = false;
  }
}

/**
 * Clean up RevenueCat on logout
 * Safe to call even if RevenueCat is not initialized
 */
export async function logoutRevenueCat(): Promise<void> {
  try {
    // Web doesn't need RevenueCat logout (browser mode)
    if (Platform.OS === 'web') {
      return;
    }
    
    // Logout is safe even if we only configured anonymously earlier.
    // Attempt it if the SDK is configured or if we previously initialized.
    let configured = isRevenueCatInitialized;
    try {
      configured = configured || (await Purchases.isConfigured());
    } catch {
      // ignore
    }

    if (!configured) {
      console.log('⚠️ RevenueCat not configured, skipping logout');
      return;
    }

    await Purchases.logOut();
    isRevenueCatInitialized = false; // Reset initialization flag
    console.log('✅ RevenueCat user logged out');
  } catch (error) {
    console.error('❌ Failed to logout RevenueCat:', error);
    // Reset flag even on error to allow re-initialization
    isRevenueCatInitialized = false;
  }
}
