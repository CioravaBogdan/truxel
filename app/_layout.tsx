import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import i18n from '@/lib/i18n';
import Toast from 'react-native-toast-message';

export default function RootLayout() {
  useFrameworkReady();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  const router = useRouter();
  const segments = useSegments();
  const { setSession, setUser, setProfile, setIsLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
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
            
            setIsLoading(false);
          } catch (error) {
            console.error('RootLayout: Error fetching profile:', error);
            setProfile(null);
            setIsLoading(false);
          }
        } else {
          console.log('RootLayout: Auth changed - no session, clearing profile');
          setProfile(null);
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
  }, []);

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
  }, [isAuthenticated, segments, isNavigationReady]);

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
