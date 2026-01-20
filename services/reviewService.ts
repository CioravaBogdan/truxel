import * as StoreReview from 'expo-store-review';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const ANDROID_PACKAGE_NAME = 'io.truxel.app';
// TODO: Replace with your actual App Store ID from App Store Connect
// You can find this in App Store Connect > App Information > Apple ID
const IOS_APP_ID = '6739097940'; // Placeholder - replace with actual ID if available

/**
 * Check if running in Expo Go (development)
 */
const isExpoGo = () => {
  return Constants.appOwnership === 'expo';
};

export const reviewService = {
  /**
   * Tries to show the native in-app review popup.
   * If not available/supported, returns false.
   */
  async requestInAppReview() {
    try {
      // Disable in Expo Go to prevent opening Expo Go's store page
      if (isExpoGo()) {
        console.log('[ReviewService] Skipping review in Expo Go');
        return false;
      }

      const isAvailable = await StoreReview.isAvailableAsync();
      
      if (isAvailable) {
        // HasAction is primarily for Android to check if the UI flow is available
        if (Platform.OS === 'android') {
           const hasAction = await StoreReview.hasAction();
           if (!hasAction) return false;
        }
        
        await StoreReview.requestReview();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error requesting in-app review:', error);
      return false;
    }
  },

  /**
   * Opens the App Store / Play Store page directly.
   * Use this for "Rate Us" buttons or deep links.
   */
  openStorePage() {
    // Prevent opening Expo Go's store page in development
    if (isExpoGo()) {
      console.log('[ReviewService] Store page disabled in Expo Go. Build standalone app to test.');
      return;
    }

    if (Platform.OS === 'ios') {
      // Opens the review page on App Store
      const url = `https://apps.apple.com/app/id${IOS_APP_ID}?action=write-review`;
      Linking.openURL(url);
    } else {
      // Opens the Play Store details page
      // market:// details is more reliable for opening the app directly
      Linking.openURL(`market://details?id=${ANDROID_PACKAGE_NAME}`).catch(() => {
        // Fallback to web URL if market:// fails
        Linking.openURL(`https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_NAME}`);
      });
    }
  },

  /**
   * Send direct feedback via email
   */
  sendFeedbackEmail(feedbackText: string = '') {
    const subject = encodeURIComponent("Feedback for Truxel App");
    const body = encodeURIComponent(
      `User Feedback:\n\n${feedbackText}\n\n` + 
      `---\n` +
      `Platform: ${Platform.OS}\n` +
      `Version: ${Platform.Version}`
    );
    Linking.openURL(`mailto:support@truxel.app?subject=${subject}&body=${body}`);
  }
};
