import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { notificationsService } from '@/services/notificationsService';
import '@/lib/i18n';
import Toast from 'react-native-toast-message';

export default function RootLayout() {
  useFrameworkReady();

  const router = useRouter();
  const segments = useSegments();
  const { setSession, setUser, setProfile, setIsLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    authService.getSession().then((session) => {
      setSession(session);
      setUser(session?.user || null);

      if (session?.user) {
        authService.getProfile(session.user.id).then(async (profile) => {
          setProfile(profile);
          setIsLoading(false);

          const token = await notificationsService.registerForPushNotifications();
          if (token) {
            await notificationsService.savePushToken(session.user.id, token);
          }
        });
      } else {
        setIsLoading(false);
      }
    });

    const { data: authListener } = authService.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);

        if (session?.user) {
          const profile = await authService.getProfile(session.user.id);
          setProfile(profile);

          const token = await notificationsService.registerForPushNotifications();
          if (token) {
            await notificationsService.savePushToken(session.user.id, token);
          }
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments]);

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
