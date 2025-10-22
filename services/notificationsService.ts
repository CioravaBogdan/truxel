import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationsService = {
  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('Push notifications only work on physical devices');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permission not granted for push notifications');
      return null;
    }

    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'ec6e92c9-663d-4a34-a69a-88ce0ddaafab',
      });

      return tokenData.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  },

  async savePushToken(userId: string, token: string): Promise<void> {
    try {
      await supabase
        .from('profiles')
        .update({ expo_push_token: token })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  },

  async sendSearchStartedNotification(searchKeywords: string): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Search Started',
        body: `Your search for "${searchKeywords}" has been initiated.`,
        data: { type: 'search_started' },
      },
      trigger: null,
    });
  },

  async sendSearchProcessingNotification(): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Search Processing',
        body: 'Your search is being processed. This may take a few moments.',
        data: { type: 'search_processing' },
      },
      trigger: null,
    });
  },

  async sendSearchCompletedNotification(resultsCount: number): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Search Completed',
        body: `Your search is complete! Found ${resultsCount} leads.`,
        data: { type: 'search_completed', resultsCount },
      },
      trigger: null,
    });
  },

  async sendSearchFailedNotification(): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Search Failed',
        body: 'Your search could not be completed. Please try again.',
        data: { type: 'search_failed' },
      },
      trigger: null,
    });
  },

  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  },

  addNotificationResponseReceivedListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  },
};
