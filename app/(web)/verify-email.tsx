import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle, AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { WebFooter } from '@/components/web/WebFooter';
import { SeoHead } from '@/components/web/SeoHead';

export default function VerifyEmailPage() {
  const { theme } = useTheme();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [tokens, setTokens] = useState<{ access_token?: string; refresh_token?: string } | null>(null);

  useEffect(() => {
    // Parse hash parameters from URL
    if (Platform.OS === 'web') {
      const hash = window.location.hash.substring(1); // Remove #
      const params = new URLSearchParams(hash);
      
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const error = params.get('error');
      const errorDescription = params.get('error_description');

      if (error) {
        console.error('Verification error:', error, errorDescription);
        setStatus('error');
      } else if (accessToken) {
        setTokens({ access_token: accessToken, refresh_token: refreshToken || undefined });
        setStatus('success');
        
        // Attempt to open app automatically after a short delay
        setTimeout(() => {
          openApp(accessToken, refreshToken || undefined);
        }, 1000);
      } else {
        // If no hash, check query params (sometimes Supabase sends them there)
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code'); // PKCE flow
        
        if (code) {
           // If we have a code, we might need to exchange it, but usually for implicit flow we get tokens in hash
           // For now, assume if we reached here without tokens in hash, it might be just a landing
           setStatus('error'); 
        } else {
           // Just landed here without params?
           setStatus('error');
        }
      }
    }
  }, []);

  const openApp = (accessToken?: string, refreshToken?: string) => {
    if (!accessToken) return;
    
    // Construct deep link with tokens
    // We use the same hash format that the app expects
    const deepLink = `truxel://auth/callback#access_token=${accessToken}&refresh_token=${refreshToken || ''}`;
    
    window.location.href = deepLink;
  };

  return (
    <>
      <SeoHead
        title="Email Verified | Truxel"
        description="Your email has been successfully verified."
        path="/verify-email"
      />
      
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.content}>
          <View style={styles.card}>
            {status === 'loading' && (
              <>
                <Text style={[styles.title, { color: theme.colors.text }]}>Verifying...</Text>
                <Text style={[styles.text, { color: theme.colors.textSecondary }]}>Please wait while we verify your email.</Text>
              </>
            )}

            {status === 'success' && (
              <>
                <View style={styles.iconContainer}>
                  <CheckCircle size={64} color="#22C55E" />
                </View>
                <Text style={[styles.title, { color: theme.colors.text }]}>Email Verified!</Text>
                <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
                  Your account has been successfully verified. You can now use the Truxel app.
                </Text>
                
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => openApp(tokens?.access_token, tokens?.refresh_token)}
                >
                  <Text style={styles.buttonText}>Open Truxel App</Text>
                </TouchableOpacity>
                
                <Text style={[styles.subtext, { color: theme.colors.textSecondary }]}>
                  If the app doesn't open automatically, click the button above.
                </Text>
              </>
            )}

            {status === 'error' && (
              <>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                  <AlertCircle size={64} color="#EF4444" />
                </View>
                <Text style={[styles.title, { color: theme.colors.text }]}>Verification Failed</Text>
                <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
                  We couldn't verify your email. The link may be invalid or expired.
                </Text>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: theme.colors.border }]}
                  onPress={() => window.location.href = '/'}
                >
                  <Text style={[styles.buttonText, { color: theme.colors.text }]}>Go to Home</Text>
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
