import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import '@/lib/i18n';
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
            const profile = await authService.getProfile(session.user.id, session.access_token);
            console.log('RootLayout: Auth changed - profile received:', profile);
            setProfile(profile);
            setIsLoading(false);
          } catch (error) {
            console.error('RootLayout: Error fetching profile:', error);
            setProfile(null);
            setIsLoading(false);
          }
        } else {
          console.log('RootLayout: Auth changed - no session, clearing profile');
          setProfile(null);
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
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
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
