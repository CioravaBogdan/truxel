import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// RevenueCat API Keys from Expo config
const REVENUECAT_API_KEY = {
  ios: Constants.expoConfig?.extra?.revenueCatIosKey || '',
  android: Constants.expoConfig?.extra?.revenueCatAndroidKey || '',
};

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
    if (Platform.OS === 'ios') {
      if (!REVENUECAT_API_KEY.ios) {
        console.warn('RevenueCat iOS API key not found in app.config.js');
        return;
      }
      await Purchases.configure({ 
        apiKey: REVENUECAT_API_KEY.ios, 
        appUserID: userId 
      });
      console.log('✅ RevenueCat initialized (iOS)');
    } else if (Platform.OS === 'android') {
      if (!REVENUECAT_API_KEY.android) {
        console.warn('RevenueCat Android API key not found in app.config.js');
        return;
      }
      await Purchases.configure({ 
        apiKey: REVENUECAT_API_KEY.android, 
        appUserID: userId 
      });
      console.log('✅ RevenueCat initialized (Android)');
    } else {
      console.warn('RevenueCat: Unsupported platform');
    }
  } catch (error) {
    console.error('❌ Failed to initialize RevenueCat:', error);
  }
}

/**
 * Clean up RevenueCat on logout
 */
export async function logoutRevenueCat(): Promise<void> {
  try {
    // Web doesn't need RevenueCat logout (browser mode)
    if (Platform.OS === 'web') {
      console.log('🌐 Web: Skipping RevenueCat logout (browser mode)');
      return;
    }
    
    // Check if running in Expo Go (RevenueCat not initialized)
    const appOwnership = Constants.appOwnership;
    if (appOwnership === 'expo') {
      console.log('🟡 Expo Go: Skipping RevenueCat logout (not initialized)');
      return;
    }
    
    await Purchases.logOut();
    console.log('✅ RevenueCat user logged out');
  } catch (error) {
    console.error('❌ Failed to logout RevenueCat:', error);
  }
}
