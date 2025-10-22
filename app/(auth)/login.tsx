import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { authService } from '@/services/authService';
import { signInWithApple, isAppleAuthAvailable } from '@/services/oauthService';
import Toast from 'react-native-toast-message';
import { Truck } from 'lucide-react-native';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  useEffect(() => {
    checkAppleAuth();
  }, []);

  const checkAppleAuth = async () => {
    const available = await isAppleAuthAvailable();
    setIsAppleAvailable(available);
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Truck size={48} color="#2563EB" />
          <Text style={styles.title}>{t('auth.welcome')}</Text>
          <Text style={styles.subtitle}>Truxel</Text>
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
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('auth.or_continue_with')}</Text>
            <View style={styles.dividerLine} />
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
    backgroundColor: '#F8FAFC',
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
    color: '#1E293B',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748B',
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
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#64748B',
  },
  appleButton: {
    width: '100%',
    height: 50,
    marginBottom: 16,
  },
  registerButton: {
    marginTop: 8,
  },
});
