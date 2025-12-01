import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle, AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { WebFooter } from '@/components/web/WebFooter';
import { SeoHead } from '@/components/web/SeoHead';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';

export default function VerifyEmailPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [tokens, setTokens] = useState<{ access_token?: string; refresh_token?: string } | null>(null);
  const [authType, setAuthType] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // 1. Check for explicit errors in URL (hash or query)
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    const searchParams = new URLSearchParams(window.location.search);

    const error = hashParams.get('error') || searchParams.get('error');
    const errorDescription = hashParams.get('error_description') || searchParams.get('error_description');

    if (error) {
      console.error('Verification error:', error, errorDescription);
      setStatus('error');
      return;
    }

    // Capture auth type (e.g. recovery, signup, invite)
    const type = hashParams.get('type') || searchParams.get('type');
    if (type) setAuthType(type);

    // 2. Check for Implicit Flow tokens (access_token in hash)
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');

    if (accessToken) {
      setTokens({ access_token: accessToken, refresh_token: refreshToken || undefined });
      setStatus('success');
      setTimeout(() => openApp(accessToken, refreshToken || undefined, type || undefined), 1000);
      return;
    }

    // 3. Check for PKCE Flow (code in query)
    const code = searchParams.get('code');
    if (code) {
      // If we have a code, Supabase client (initialized with detectSessionInUrl: true)
      // should automatically exchange it. We just wait for the session.
      console.log('PKCE code detected, waiting for session...');
    }

    // 4. Listen for session (handles PKCE exchange success)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event);
      if (event === 'SIGNED_IN' && session) {
        setTokens({ access_token: session.access_token, refresh_token: session.refresh_token });
        setStatus('success');
        // For PKCE, type might not be in URL anymore if Supabase cleaned it up, 
        // but we captured it from initial URL params above if it was there.
        // Also event might be PASSWORD_RECOVERY if Supabase detected it.
        const finalType = (event === 'PASSWORD_RECOVERY') ? 'recovery' : (type || undefined);
        setTimeout(() => openApp(session.access_token, session.refresh_token, finalType), 1000);
      } else if (event === 'PASSWORD_RECOVERY' && session) {
         // Explicit recovery event
         setTokens({ access_token: session.access_token, refresh_token: session.refresh_token });
         setStatus('success');
         setTimeout(() => openApp(session.access_token, session.refresh_token, 'recovery'), 1000);
      }
    });

    // 5. Check if session is already active
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setTokens({ access_token: session.access_token, refresh_token: session.refresh_token });
        setStatus('success');
        setTimeout(() => openApp(session.access_token, session.refresh_token, type || undefined), 1000);
      } else if (!code) {
        // No error, no token, no code, no session -> Unknown state (maybe just visited page)
        // But don't show error immediately if we are waiting for something?
        // If truly nothing, maybe show error or redirect home.
        // For now, if no code and no session, it's likely an error or invalid link.
        setStatus('error');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const openApp = (accessToken?: string, refreshToken?: string, type?: string) => {
    if (!accessToken) return;
    
    // Construct deep link with tokens
    // We use the same hash format that the app expects
    let deepLink = `truxel://auth/callback#access_token=${accessToken}&refresh_token=${refreshToken || ''}`;
    if (type) {
      deepLink += `&type=${type}`;
    }
    
    window.location.href = deepLink;
  };

  return (
    <>
      <SeoHead
        title={t('web.verify_email.seo_title')}
        description={t('web.verify_email.seo_description')}
        path="/verify-email"
      />
      
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.content}>
          <View style={styles.card}>
            {status === 'loading' && (
              <>
                <Text style={[styles.title, { color: theme.colors.text }]}>{t('web.verify_email.title_loading')}</Text>
                <Text style={[styles.text, { color: theme.colors.textSecondary }]}>{t('web.verify_email.message_loading')}</Text>
              </>
            )}

            {status === 'success' && (
              <>
                <View style={styles.iconContainer}>
                  <CheckCircle size={64} color="#22C55E" />
                </View>
                <Text style={[styles.title, { color: theme.colors.text }]}>{t('web.verify_email.title_success')}</Text>
                <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
                  {t('web.verify_email.message_success')}
                </Text>
                
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => openApp(tokens?.access_token, tokens?.refresh_token, authType || undefined)}
                >
                  <Text style={styles.buttonText}>{t('web.verify_email.button_open_app')}</Text>
                </TouchableOpacity>
                
                <Text style={[styles.subtext, { color: theme.colors.textSecondary }]}>
                  {t('web.verify_email.subtext_open_app')}
                </Text>
              </>
            )}

            {status === 'error' && (
              <>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                  <AlertCircle size={64} color="#EF4444" />
                </View>
                <Text style={[styles.title, { color: theme.colors.text }]}>{t('web.verify_email.title_error')}</Text>
                <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
                  {t('web.verify_email.message_error')}
                </Text>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: theme.colors.border }]}
                  onPress={() => window.location.href = '/'}
                >
                  <Text style={[styles.buttonText, { color: theme.colors.text }]}>{t('web.verify_email.button_home')}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
        <WebFooter />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: '100vh',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    maxWidth: 480,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#FF5722',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  subtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});
