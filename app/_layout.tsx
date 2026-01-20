import { useEffect, useMemo, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, NativeModules, View, ActivityIndicator, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

// Ignore specific development warnings
LogBox.ignoreLogs([
  'Network request failed',
  'Unable to resolve host',
  'PurchasesError',
  'Error fetching offerings',
  'TypeError: Network request failed'
]);

import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { sessionService } from '@/services/sessionService';
import { notificationService } from '@/services/notificationService';
import { nativeModulesService } from '@/services/nativeModulesService';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import Constants from 'expo-constants';
import i18n from '@/lib/i18n';
import Toast, { BaseToast } from 'react-native-toast-message';
import { initRevenueCat, logoutRevenueCat } from '@/lib/revenueCat';
import { ThemeProvider, useTheme } from '@/lib/theme';
import { useNotificationStore } from '@/store/notificationStore';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';
// Note: expo-tracking-transparency and react-native-fbsdk-next are imported dynamically
// because they don't work on web (native-only modules)

function ThemedToast() {
  const { theme } = useTheme();

  const toastConfig = useMemo(() => {
    const makeBaseStyle = (accentColor: string) => ({
      borderLeftColor: accentColor,
      borderLeftWidth: 6,
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.small,
    });

    const text1Style = {
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: '800' as const,
    };

    const text2Style = {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: '500' as const,
    };

    const contentContainerStyle = {
      paddingHorizontal: theme.spacing.md,
    };

    return {
      success: (props: any) => (
        <BaseToast
          {...props}
          style={makeBaseStyle(theme.colors.success)}
          contentContainerStyle={contentContainerStyle}
          text1Style={text1Style}
          text2Style={text2Style}
        />
      ),
      error: (props: any) => (
        <BaseToast
          {...props}
          style={makeBaseStyle(theme.colors.error)}
          contentContainerStyle={contentContainerStyle}
          text1Style={text1Style}
          text2Style={text2Style}
        />
      ),
      info: (props: any) => (
        <BaseToast
          {...props}
          style={makeBaseStyle(theme.colors.info)}
          contentContainerStyle={contentContainerStyle}
          text1Style={text1Style}
          text2Style={text2Style}
        />
      ),
    };
  }, [theme]);

  return (
    <Toast
      config={toastConfig}
      topOffset={theme.spacing.lg}
      bottomOffset={theme.spacing.lg}
    />
  );
}

// Configure global notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
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

  // Initialize Facebook SDK & Request Tracking Permission (Native only)
  useEffect(() => {
    // Skip on web - Facebook SDK requires native components
    if (Platform.OS === 'web') {
      return;
    }

    const askPermission = async () => {
      try {
        // 1. Dynamically import tracking transparency (native only)
        const { requestTrackingPermissionsAsync } = await import('expo-tracking-transparency');
        
        // 2. Ask for iOS tracking permission (Required for iOS 14+)
        const { status } = await requestTrackingPermissionsAsync();

        if (status === 'granted') {
          // CRITICAL: Check if native module exists BEFORE importing to prevent crash
          // This handles Expo Go or old builds where FBSDK is missing
          if (!NativeModules.FBAccessToken && !NativeModules.Settings) {
             console.warn('Facebook SDK native module not found - skipping init. Please rebuild native app.');
             return;
          }

          // 3. Dynamically import and enable Facebook tracking if granted
          const { Settings } = await import('react-native-fbsdk-next');
          Settings.setAdvertiserTrackingEnabled(true);
          Settings.initializeSDK();
        }
      } catch (error) {
        console.warn('Facebook SDK not available:', error);
      }
    };

    askPermission();
  }, []);

  // Handle deep links (Password Reset, Email Verification)
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const { url } = event;
      
      if (url.includes('access_token') && url.includes('refresh_token')) {
         const hashIndex = url.indexOf('#');
         if (hashIndex !== -1) {
             const hash = url.substring(hashIndex + 1);
             const params = new URLSearchParams(hash);
             const access_token = params.get('access_token');
             const refresh_token = params.get('refresh_token');
             const type = params.get('type');
             
             if (type === 'recovery') {
                 setIsPasswordRecovery(true);
             }

             if (access_token && refresh_token) {
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
    nativeModulesService
      .initialize()
      .then((success) => {
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
      return;
    }

    // Check if running in Expo Go (where RevenueCat won't work on mobile)
    const isExpoGo = Constants.appOwnership === 'expo' ||
                     Constants.executionEnvironment === 'storeClient';

    // Web platform ALWAYS supports RevenueCat (via purchases-js)
    if (Platform.OS === 'web') {
      setRevenueCatReady(true); // Web SDK initializes lazily in revenueCatService
      return;
    }

    // Mobile (iOS/Android) requires native builds (not Expo Go)
    if (isExpoGo) {
      console.warn('Expo Go detected - RevenueCat inactive. Use Development Build or TestFlight for payments.');
      setRevenueCatReady(false);
      return;
    }

    const apiKey = Platform.select({
      ios: Constants.expoConfig?.extra?.revenueCatIosKey,
      android: Constants.expoConfig?.extra?.revenueCatAndroidKey,
    });

    if (!apiKey || apiKey === '' || apiKey.includes('xxx')) {
      console.warn('RevenueCat API key not configured for', Platform.OS);
      setRevenueCatReady(false);
      return;
    }

    try {
      // Set log level (DEBUG for development, INFO for production)
      Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO);

      // Configure SDK with API key
      Purchases.configure({ apiKey });

      setRevenueCatReady(true);
    } catch (error) {
      console.error('RevenueCat SDK initialization failed:', error);
      setRevenueCatReady(false);
    }
  }, [nativeModulesReady]);

  useEffect(() => {
    if (!nativeModulesReady) {
      return;
    }

    const { data: authListener } = authService.onAuthStateChange(
      async (event, session) => {
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

  // Show loading screen while checking auth state to prevent "flashing" protected content
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
        <ThemedToast />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
