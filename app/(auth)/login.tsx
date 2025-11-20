import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Linking as RNLinking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { authService } from '@/services/authService';
import { signInWithApple, isAppleAuthAvailable, isGoogleAuthAvailable } from '@/services/oauthService';
import { supabase } from '@/lib/supabase';
import Toast from 'react-native-toast-message';
import { Truck } from 'lucide-react-native';
import { useTheme } from '@/lib/theme';

// Required for web OAuth completion
WebBrowser.maybeCompleteAuthSession();

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);
  const [isGoogleAvailable, setIsGoogleAvailable] = useState(false);
  const [isFacebookAvailable, setIsFacebookAvailable] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    checkOAuthProviders();
    
    // Listen for deep links (OAuth redirect)
  const subscription = RNLinking.addEventListener('url', handleDeepLink);
    
    return () => {
      subscription.remove();
    };
  }, []);

  const checkOAuthProviders = async () => {
    const appleAvailable = await isAppleAuthAvailable();
    const googleAvailable = isGoogleAuthAvailable();
    setIsAppleAvailable(appleAvailable);
    setIsGoogleAvailable(googleAvailable);
    setIsFacebookAvailable(true);
  };

  const handleDeepLink = ({ url }: { url: string }) => {
    console.log('Deep link received:', url);
    // Supabase will handle the OAuth callback automatically
  };

  const buildMobileRedirectUri = (provider: 'google' | 'facebook') => {
    // Production & Development Build (EAS/Android Studio)
    // This uses the custom scheme 'truxel://' which is whitelisted in Supabase.
    // This will work perfectly in Production builds and Development builds.
    // Note: It may fail in Expo Go on Android (stuck on loading), but that is expected
    // as Expo Go does not support custom schemes reliably on Android.
    return 'truxel://auth/callback';
  };

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await authService.signIn(data.email, data.password);
      Toast.show({
        type: 'success',
        text1: t('auth.login_success'),
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithApple();
      
      if (result) {
        Toast.show({
          type: 'success',
          text1: t('auth.login_success'),
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthProviderSignIn = async (provider: 'google' | 'facebook') => {
    try {
      setIsLoading(true);

      if (Platform.OS === 'web') {
        // Web: Use direct redirect flow
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: window.location.origin,
          },
        });

        if (error) throw error;
        if (data?.url) {
          window.location.href = data.url;
        }
      } else {
        // Mobile: Use recommended Expo auth flow with makeRedirectUri
        const redirectTo = buildMobileRedirectUri(provider);

        if (!redirectTo) {
          throw new Error('Unable to compute redirect URI');
        }

        console.log('🚀 Sending redirectTo to Supabase:', redirectTo);

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo,
            skipBrowserRedirect: true,
          },
        });

        if (error) {
          console.error('❌ Supabase OAuth error:', error);
          try {
            console.error('❌ Supabase OAuth error (json):', JSON.stringify(error, null, 2));
          } catch (stringifyError) {
            console.warn('Failed to stringify Supabase OAuth error:', stringifyError);
          }
          throw error;
        }

        console.log(`🔀 Supabase returned ${provider} OAuth URL:`, data?.url);

        if (data?.url) {
          console.log('🔗 Opening OAuth URL...');
          const result = await WebBrowser.openAuthSessionAsync(
            data.url,
            redirectTo
          );

          console.log('📬 WebBrowser result:', result);

          if (result.type === 'success') {
            console.log('✅ OAuth redirect successful');
            const { url } = result;

            if (!url) {
              throw new Error('missing_redirect_url');
            }

            // Extract tokens using QueryParams (recommended by Supabase)
            const { params, errorCode } = QueryParams.getQueryParams(url);

            console.log('📦 Supabase redirect params:', params);
            
            if (errorCode) {
              throw new Error(errorCode);
            }

            const { access_token, refresh_token } = params;

            if (!access_token) {
              throw new Error('No access token received');
            }

            // Set session with tokens
            const { error: sessionError } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (sessionError) throw sessionError;

            Toast.show({
              type: 'success',
              text1: t('auth.login_success'),
            });
          } else if (result.type === 'cancel' || result.type === 'dismiss') {
            Toast.show({
              type: 'info',
              text1: t('common.cancel'),
              text2: 'Sign in cancelled',
            });
          }
        }
      }
    } catch (error: any) {
      console.error(`❌ ${provider} Sign In error:`, error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.message || 'Authentication failed',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => handleOAuthProviderSignIn('google');

  const handleFacebookSignIn = () => handleOAuthProviderSignIn('facebook');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Truck size={48} color={theme.colors.secondary} />
          <Text style={[styles.title, { color: theme.colors.text }]}>{t('auth.welcome')}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Truxel</Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            rules={{
              required: t('auth.email_required'),
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: t('auth.invalid_email'),
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t('common.email')}
                placeholder="your@email.com"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{
              required: t('auth.password_required'),
              minLength: {
                value: 6,
                message: t('auth.password_too_short'),
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t('common.password')}
                placeholder="••••••••"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
              />
            )}
          />

          <Button
            title={t('auth.sign_in')}
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            style={styles.button}
          />

          {/* Social Sign In Divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
            <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>{t('auth.or_continue_with')}</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
          </View>

          {/* Apple Sign In Button */}
          {isAppleAvailable && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={8}
              style={styles.appleButton}
              onPress={handleAppleSignIn}
            />
          )}

          {/* Google Sign In Button */}
          {isGoogleAvailable && (
            <TouchableOpacity
              style={[styles.googleButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              <View style={styles.googleButtonContent}>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={[styles.googleButtonText, { color: theme.colors.text }]}>
                  {t('auth.sign_in_with_google')}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Facebook Sign In Button */}
          {isFacebookAvailable && (
            <TouchableOpacity
              style={styles.facebookButton}
              onPress={handleFacebookSignIn}
              disabled={isLoading}
            >
              <View style={styles.facebookButtonContent}>
                <Text style={styles.facebookIcon}>f</Text>
                <Text style={styles.facebookButtonText}>
                  {t('auth.sign_in_with_facebook')}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          <Button
            title={t('auth.no_account')}
            onPress={() => router.push('/(auth)/register')}
            variant="ghost"
            style={styles.registerButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 18,
    marginTop: 8,
  },
  form: {
    width: '100%',
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  appleButton: {
    width: '100%',
    height: 50,
    marginBottom: 16,
  },
  googleButton: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    borderWidth: 1.5,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  facebookButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#1877F2',
    borderRadius: 8,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  facebookButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  facebookIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  facebookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  registerButton: {
    marginTop: 8,
  },
});
