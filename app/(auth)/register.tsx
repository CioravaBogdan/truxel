import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking as RNLinking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { FontAwesome } from '@expo/vector-icons';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { authService } from '@/services/authService';
import { signInWithApple, isAppleAuthAvailable, isGoogleAuthAvailable } from '@/services/oauthService';
import { supabase } from '@/lib/supabase';
import Toast from 'react-native-toast-message';
import { useTheme } from '@/lib/theme';

// Required for web OAuth completion
WebBrowser.maybeCompleteAuthSession();

interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber: string;
  companyName: string;
}

export default function RegisterScreen() {
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
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phoneNumber: '',
      companyName: '',
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
    return 'truxel://auth/callback';
  };

  const password = watch('password');

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
          throw error;
        }

        if (data?.url) {
          const result = await WebBrowser.openAuthSessionAsync(
            data.url,
            redirectTo
          );

          if (result.type === 'success') {
            const { url } = result;
            if (!url) throw new Error('missing_redirect_url');

            const { params, errorCode } = QueryParams.getQueryParams(url);
            
            if (errorCode) throw new Error(errorCode);

            const { access_token, refresh_token } = params;

            if (!access_token) throw new Error('No access token received');

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

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const authData = await authService.signUp({
        email: data.email,
        password: data.password,
        full_name: data.fullName,
        phone_number: data.phoneNumber,
        company_name: data.companyName,
      });

      if (authData.session) {
        Toast.show({
          type: 'success',
          text1: t('auth.register_success'),
        });
      } else {
        Toast.show({
          type: 'info',
          text1: t('auth.check_email'),
          text2: t('auth.verify_email_message'),
          visibilityTime: 6000,
        });
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 2500);
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <View style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <Image 
              source={require('@/assets/images/Untitled design (5).svg')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>{t('auth.sign_up')}</Text>
            <Text style={styles.headerSubtitle}>{t('auth.create_account')}</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          <Card style={styles.card}>
            <View style={styles.form}>
              <Controller
                control={control}
                name="fullName"
                rules={{ required: t('auth.full_name_required') }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label={t('common.full_name')}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.fullName?.message}
                    autoComplete="name"
                  />
                )}
              />

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
                name="phoneNumber"
                rules={{ required: t('auth.phone_required') }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label={t('common.phone_number')}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.phoneNumber?.message}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                  />
                )}
              />

              <Controller
                control={control}
                name="companyName"
                rules={{ required: t('auth.company_required') }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label={t('common.company_name')}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.companyName?.message}
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
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                )}
              />

              <Controller
                control={control}
                name="confirmPassword"
                rules={{
                  required: t('auth.password_required'),
                  validate: (value) =>
                    value === password || t('auth.passwords_dont_match'),
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label={t('common.confirm_password')}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.confirmPassword?.message}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                )}
              />

              <Button
                title={t('auth.sign_up')}
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
                title={t('auth.have_account')}
                onPress={() => router.replace('/(auth)/login')}
                variant="ghost"
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
    backgroundColor: '#0F172A', // Navy Brand Color
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
});
