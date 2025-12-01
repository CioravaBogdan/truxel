import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { sessionService } from '@/services/sessionService';
import { notificationService } from '@/services/notificationService';
import { nativeModulesService } from '@/services/nativeModulesService';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import Constants from 'expo-constants';
import i18n from '@/lib/i18n';
import Toast from 'react-native-toast-message';
import { initRevenueCat, logoutRevenueCat } from '@/lib/revenueCat';
import { ThemeProvider } from '@/lib/theme';
import { useNotificationStore } from '@/store/notificationStore';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';

// Configure global notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false, // We play custom sound manually
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  useFrameworkReady();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [nativeModulesReady, setNativeModulesReady] = useState(false);
  const [revenueCatReady, setRevenueCatReady] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  const router = useRouter();
  const segments = useSegments();
  const { setSession, setUser, setProfile, setIsLoading, isAuthenticated, isLoading, profile } = useAuthStore();
  const { subscribeToNotifications, fetchNotifications } = useNotificationStore();

  // Handle deep links (Password Reset, Email Verification)
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const { url } = event;
      console.log('RootLayout: Deep link received:', url);
      
      if (url.includes('access_token') && url.includes('refresh_token')) {
         const hashIndex = url.indexOf('#');
         if (hashIndex !== -1) {
             const hash = url.substring(hashIndex + 1);
             const params = new URLSearchParams(hash);
             const access_token = params.get('access_token');
             const refresh_token = params.get('refresh_token');
             const type = params.get('type');
             
             if (type === 'recovery') {
                 console.log('RootLayout: Recovery type detected in deep link');
                 setIsPasswordRecovery(true);
             }

             if (access_token && refresh_token) {
                 console.log('RootLayout: Setting session from deep link tokens');
                 const { error } = await supabase.auth.setSession({
                     access_token,
                     refresh_token,
                 });
                 if (error) console.error('RootLayout: Failed to set session from deep link:', error);
             }
         }
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    Linking.getInitialURL().then((url) => {
        if (url) handleDeepLink({ url });
    });

    return () => {
        subscription.remove();
    };
  }, []);

  // Initialize native modules first (prevents iOS crashes)
  useEffect(() => {
    console.log('RootLayout: Initializing native modules safely...');
    nativeModulesService
      .initialize()
      .then((success) => {
        console.log('RootLayout: Native modules initialization completed:', success);
        setNativeModulesReady(true);
      })
      .catch((error) => {
        console.error('RootLayout: Native modules error (continuing anyway):', error);
        setNativeModulesReady(true); // Continue even if initialization fails
      });
  }, []);

  // Initialize RevenueCat SDK (after native modules)
  useEffect(() => {
    if (!nativeModulesReady) {
      console.log('RootLayout: Waiting for native modules before RevenueCat init...');
      return;
    }

    // Log environment info for debugging
    console.log('🔍 RevenueCat Init Check:', {
      platform: Platform.OS,
      appOwnership: Constants.appOwnership,
      executionEnvironment: Constants.executionEnvironment,
      isDevice: Constants.isDevice
    });

    // Check if running in Expo Go (where RevenueCat won't work on mobile)
    const isExpoGo = Constants.appOwnership === 'expo' ||
                     Constants.executionEnvironment === 'storeClient';

    // Web platform ALWAYS supports RevenueCat (via purchases-js)
    if (Platform.OS === 'web') {
      console.log('🌐 Web platform detected - RevenueCat will initialize on-demand');
      console.log('   Web SDK uses:', Constants.expoConfig?.extra?.revenueCatWebKey?.substring(0, 12) + '...');
      setRevenueCatReady(true); // Web SDK initializes lazily in revenueCatService
      return;
    }

    // Mobile (iOS/Android) requires native builds (not Expo Go)
    if (isExpoGo) {
      console.log('🟡 Expo Go detected - RevenueCat disabled for mobile');
      console.log('   appOwnership:', Constants.appOwnership);
      console.log('   executionEnvironment:', Constants.executionEnvironment);
      console.log('   For RevenueCat to work, build with EAS or npx expo run:ios');
      setRevenueCatReady(false);
      return;
    }

    console.log('RootLayout: Initializing RevenueCat SDK for mobile...');

    const apiKey = Platform.select({
      ios: Constants.expoConfig?.extra?.revenueCatIosKey,
      android: Constants.expoConfig?.extra?.revenueCatAndroidKey,
    });

    if (!apiKey || apiKey === '' || apiKey.includes('xxx')) {
      console.warn('⚠️ RevenueCat API key not configured for', Platform.OS);
      console.warn('   Set TRUXEL_REVENUECAT_IOS_KEY or TRUXEL_REVENUECAT_ANDROID_KEY in .env');
      setRevenueCatReady(false);
      return;
    }

    try {
      // Set log level (DEBUG for development, INFO for production)
      Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO);

      // Configure SDK with API key
      Purchases.configure({ apiKey });

      console.log('✅ RevenueCat mobile SDK initialized successfully');
      console.log('   API Key:', apiKey.substring(0, 12) + '...');
      console.log('   Platform:', Platform.OS);

      setRevenueCatReady(true);
    } catch (error) {
      console.error('❌ RevenueCat SDK initialization failed:', error);
      console.error('   Mobile payments will not work');
      setRevenueCatReady(false);
    }
  }, [nativeModulesReady]);

  useEffect(() => {
    if (!nativeModulesReady) {
      console.log('RootLayout: Waiting for native modules to be ready...');
      return;
    }

    console.log('RootLayout: Setting up auth listener (no manual getSession call)...');

    const { data: authListener } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('RootLayout: Auth state changed:', { event, hasSession: !!session });
        
        if (event === 'PASSWORD_RECOVERY') {
          console.log('RootLayout: Password recovery event detected');
          setIsPasswordRecovery(true);
        }

        setSession(session);
        setUser(session?.user || null);

        if (session?.user) {
          console.log('RootLayout: Auth changed - fetching profile for user:', session.user.id);
          
          // Initialize RevenueCat with user ID
          if (Platform.OS !== 'web') {
             console.log('RootLayout: Identifying user in RevenueCat:', session.user.id);
             initRevenueCat(session.user.id).catch(err => 
               console.error('RootLayout: Failed to identify user in RevenueCat:', err)
             );
          }

          try {
            const profile = await authService.getProfile(
              session.user.id,
              session.access_token,
              session.user
            );
            console.log('RootLayout: Auth changed - profile received:', profile);
            setProfile(profile);
            
            // Set language from user profile (default to 'en' if not set)
            const userLanguage = profile?.preferred_language || 'en';
            if (i18n.language !== userLanguage) {
              console.log('RootLayout: Changing language to:', userLanguage);
              i18n.changeLanguage(userLanguage);
            }
            
            // Start session auto-refresh service (wrapped in try-catch)
            try {
              console.log('RootLayout: Starting session service');
              sessionService.start();
            } catch (sessionError) {
              console.error('RootLayout: Session service error (non-critical):', sessionError);
            }
            
            // Initialize push notification service (wrapped in try-catch)
            try {
              console.log('RootLayout: Initializing notification service');
              notificationService.initialize(session.user.id).then(success => {
                if (success) {
                  console.log('RootLayout: Starting notification polling');
                  notificationService.startLocationPolling();
                }
              }).catch(notifError => {
                console.error('RootLayout: Notification service error (non-critical):', notifError);
              });

              // Initialize persistent notifications store
              console.log('RootLayout: Initializing persistent notifications');
              fetchNotifications(session.user.id);
              const unsubscribe = subscribeToNotifications(session.user.id);
              
              // Store unsubscribe function in a ref or effect cleanup if possible, 
              // but here we are inside a callback. 
              // Ideally this should be in a separate useEffect dependent on user.id
            } catch (notifError) {
              console.error('RootLayout: Notification initialization error (non-critical):', notifError);
            }
            
            setIsLoading(false);
          } catch (error) {
            console.error('RootLayout: Error fetching profile:', error);
            setProfile(null);
            setIsLoading(false);
          }
        } else {
          console.log('RootLayout: Auth changed - no session, clearing profile');
          setProfile(null);
          
          // Stop services on logout
          console.log('RootLayout: Stopping session and notification services');
          sessionService.stop();
          notificationService.stopLocationPolling();
          
          // Logout from RevenueCat
          if (Platform.OS !== 'web') {
             logoutRevenueCat().catch(err => 
               console.error('RootLayout: Failed to logout from RevenueCat:', err)
             );
          }

          // Reset to English when logged out
          if (i18n.language !== 'en') {
            i18n.changeLanguage('en');
          }
          setIsLoading(false);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [nativeModulesReady, setSession, setUser, setProfile, setIsLoading]);

  useEffect(() => {
    // Wait for Stack to be mounted before attempting navigation
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Notification listeners
  useEffect(() => {
    // Listener for when user taps notification
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      // Navigate to notifications screen
      // We use a small timeout to ensure navigation is ready
      setTimeout(() => {
        router.push('/notifications');
      }, 500);
    });

    // Listener for when notification is received while app is foreground
    const receivedListener = Notifications.addNotificationReceivedListener(async notification => {
      console.log('Notification received in foreground:', notification);
      
      // Play custom sound
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/sounds/notification.mp3')
        );
        await sound.playAsync();
      } catch (error) {
        console.log('Failed to play notification sound:', error);
      }
    });

    return () => {
      responseListener.remove();
      receivedListener.remove();
    };
  }, [router]);

  useEffect(() => {
    if (!isNavigationReady || isLoading) {
      console.log('RootLayout: Navigation not ready or loading...');
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inWebGroup = segments[0] === '(web)';
    const isRootScreen = !segments[0];
    const inCompleteProfile = segments[1] === 'complete-profile';
    const inUpdatePassword = segments[1] === 'update-password';
    
    // Check profile completeness
    const isProfileComplete = !!(profile?.phone_number && profile?.company_name);

    console.log('RootLayout: Navigation check:', {
      isAuthenticated,
      inAuthGroup,
      inWebGroup,
      isRootScreen,
      isProfileComplete,
      inCompleteProfile,
      inUpdatePassword,
      isPasswordRecovery,
      segments,
      currentPath: segments.join('/'),
    });

    // Web: redirect to landing page on logout
    if (Platform.OS === 'web' && !isAuthenticated && !inAuthGroup && !inWebGroup) {
      console.log('RootLayout: Web not authenticated, redirecting to landing');
      router.replace('/(web)');
    }
    // Mobile: redirect to login on logout
    else if (Platform.OS !== 'web' && !isAuthenticated && !inAuthGroup) {
      console.log('RootLayout: Not authenticated, redirecting to login');
      router.replace('/(auth)/login');
    } 
    // Authenticated logic
    else if (isAuthenticated) {
      if (isPasswordRecovery) {
        if (!inUpdatePassword) {
          console.log('RootLayout: Password recovery mode, redirecting to update-password');
          router.replace('/(auth)/update-password');
        }
      } else if (!isProfileComplete && !inCompleteProfile) {
        console.log('RootLayout: Profile incomplete, redirecting to complete-profile');
        router.replace('/(auth)/complete-profile');
      } else if (isProfileComplete && (inAuthGroup || (isRootScreen && Platform.OS !== 'web'))) {
        // If profile is complete, and we are in auth pages (login/register/complete-profile), go to tabs
        console.log('RootLayout: Authenticated and complete, redirecting to tabs');
        router.replace('/(tabs)');
      }
    } else {
      console.log('RootLayout: No navigation needed, staying on current screen');
    }
  }, [isAuthenticated, segments, isNavigationReady, router, isLoading, profile, isPasswordRecovery]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
        <Toast />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
