import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { sessionService } from '@/services/sessionService';
import { notificationService } from '@/services/notificationService';
import { nativeModulesService } from '@/services/nativeModulesService';
import i18n from '@/lib/i18n';
import Toast from 'react-native-toast-message';

export default function RootLayout() {
  useFrameworkReady();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [nativeModulesReady, setNativeModulesReady] = useState(false);

  const router = useRouter();
  const segments = useSegments();
  const { setSession, setUser, setProfile, setIsLoading, isAuthenticated } = useAuthStore();

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

  useEffect(() => {
    if (!nativeModulesReady) {
      console.log('RootLayout: Waiting for native modules to be ready...');
      return;
    }

    console.log('RootLayout: Setting up auth listener (no manual getSession call)...');

    const { data: authListener } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('RootLayout: Auth state changed:', { event, hasSession: !!session });
        setSession(session);
        setUser(session?.user || null);

        if (session?.user) {
          console.log('RootLayout: Auth changed - fetching profile for user:', session.user.id);
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

  useEffect(() => {
    if (!isNavigationReady) {
      console.log('RootLayout: Navigation not ready yet, skipping...');
      return;
    }

  const inAuthGroup = segments[0] === '(auth)';
  const isRootScreen = !segments[0];
    console.log('RootLayout: Navigation check:', {
      isAuthenticated,
      inAuthGroup,
      isRootScreen,
      segments,
      currentPath: segments.join('/'),
    });

    if (!isAuthenticated && !inAuthGroup) {
      console.log('RootLayout: Not authenticated, redirecting to login');
      router.replace('/(auth)/login');
    } else if (isAuthenticated && (inAuthGroup || isRootScreen)) {
      // Navigate to tabs if authenticated and either in auth group OR on root screen
      console.log('RootLayout: Authenticated, redirecting to tabs');
      router.replace('/(tabs)');
    } else {
      console.log('RootLayout: No navigation needed, staying on current screen');
    }
  }, [isAuthenticated, segments, isNavigationReady, router]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
      <Toast />
    </>
  );
}
