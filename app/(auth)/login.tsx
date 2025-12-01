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
import { Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { authService } from '@/services/authService';
import { signInWithApple, isAppleAuthAvailable, isGoogleAuthAvailable } from '@/services/oauthService';
import { supabase } from '@/lib/supabase';
import Toast from 'react-native-toast-message';
import { useTheme } from '@/lib/theme';
import { LinearGradient } from 'expo-linear-gradient';

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
              text2: t('auth.sign_in_cancelled'),
            });
          }
        }
      }
    } catch (error: any) {
      console.error(`❌ ${provider} Sign In error:`, error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.message || t('auth.auth_failed'),
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
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <LinearGradient
          colors={['#0F172A', '#1E293B']}
          style={styles.headerContainer}
        >
          <View style={styles.headerContent}>
            <Image 
              source={require('@/assets/images/360x120.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>{t('auth.welcome')}</Text>
            <Text style={styles.headerSubtitle}>{t('auth.sign_in_subtitle')}</Text>
          </View>
        </LinearGradient>

        <View style={styles.formContainer}>
          <Card style={styles.card}>
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
                    placeholder={t('auth.email_placeholder')}
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

              <View style={styles.forgotPasswordContainer}>
                <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                  <Text style={[styles.forgotPasswordText, { color: theme.colors.primary }]}>
                    {t('auth.forgot_password_question')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/(auth)/resend-confirmation')} style={{ marginTop: 8 }}>
                  <Text style={[styles.forgotPasswordText, { color: theme.colors.textSecondary, fontSize: 12 }]}>
                    {t('auth.resend_confirmation')}
                  </Text>
                </TouchableOpacity>
              </View>

              <Button
                title={t('auth.sign_in')}
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                style={styles.button}
                variant="primary"
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
                  buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
                  buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                  cornerRadius={12}
                  style={styles.appleButton}
                  onPress={handleAppleSignIn}
                />
              )}

              {/* Google Sign In Button */}
              {isGoogleAvailable && (
                <TouchableOpacity
                  style={styles.googleButton}
                  onPress={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <View style={styles.googleButtonContent}>
                    <FontAwesome name="google" size={20} color="#DB4437" />
                    <Text style={styles.googleButtonText}>
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
                    <FontAwesome name="facebook" size={20} color="#FFFFFF" />
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
          </Card>
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
  },
  headerContainer: {
    paddingTop: 80,
    paddingBottom: 60,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 60,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#94A3B8', // Slate 400
    marginTop: 4,
  },
  formContainer: {
    paddingHorizontal: 24,
    marginTop: -40, // Overlap the header
  },
  card: {
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  form: {
    width: '100%',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
    marginTop: -8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: '#FF5722', // Brand Orange
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
    fontSize: 16,
    fontWeight: '600',
  },
  appleButton: {
    width: '100%',
    height: 56,
    marginBottom: 16,
  },
  googleButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  googleButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#757575', // Google Grey
  },
  facebookButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#1877F2', // Facebook Blue
    borderRadius: 12,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  facebookButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  facebookButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  registerButton: {
    marginTop: 8,
  },
});
