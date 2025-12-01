import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function AuthCallback() {
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    const handleUrl = async (url: string | null) => {
      if (!url) return;

      console.log('AuthCallback received URL:', url);

      try {
        // Extract hash parameters manually
        let accessToken = null;
        let refreshToken = null;
        let errorDesc = null;

        // Helper to parse params string
        const parseParams = (str: string) => {
          const params: Record<string, string> = {};
          str.split('&').forEach(pair => {
            const [key, value] = pair.split('=');
            if (key && value) {
              params[key] = decodeURIComponent(value);
            }
          });
          return params;
        };

        // Check for hash params
        if (url.includes('#')) {
            const hash = url.split('#')[1];
            const params = parseParams(hash);
            accessToken = params.access_token;
            refreshToken = params.refresh_token;
            errorDesc = params.error_description;
        }
        
        // Fallback to query params
        if (!accessToken && url.includes('?')) {
             const query = url.split('?')[1].split('#')[0]; // Ensure we don't include hash
             const params = parseParams(query);
             accessToken = params.access_token;
             refreshToken = params.refresh_token;
             if (!errorDesc) errorDesc = params.error_description;
        }

        if (accessToken && refreshToken) {
          console.log('AuthCallback: Found tokens, setting session...');
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
              console.error('AuthCallback: Error setting session:', error);
              throw error;
          }
          
          console.log('AuthCallback: Session set successfully');
          // RootLayout will handle navigation based on auth state change
        } else {
            console.log('AuthCallback: No tokens found in URL');
            if (errorDesc) {
                console.error("AuthCallback error:", errorDesc);
            }
             // If no token, redirect to login
             router.replace('/(auth)/login');
        }
      } catch (e) {
        console.error('Error handling auth callback:', e);
        router.replace('/(auth)/login');
      }
    };

    // Check initial URL
    Linking.getInitialURL().then(handleUrl);
    
    // Listen for new URLs
    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    
    return () => sub.remove();
  }, []);

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B']}
      style={styles.container}
    >
      <ActivityIndicator size="large" color="#FF5722" />
      <Text style={styles.text}>Verifying email...</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
