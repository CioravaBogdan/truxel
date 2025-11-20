import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { authService } from '@/services/authService';
import Toast from 'react-native-toast-message';
import { Truck } from 'lucide-react-native';
import { useTheme } from '@/lib/theme';

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

  const password = watch('password');

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
          text1: 'Check your email',
          text2: 'Please verify your email to complete registration.',
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Truck size={48} color={theme.colors.secondary} />
          <Text style={[styles.title, { color: theme.colors.text }]}>{t('auth.sign_up')}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Truxel</Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="fullName"
            rules={{ required: t('auth.email_required') }}
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
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t('common.phone_number')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="phone-pad"
                autoComplete="tel"
              />
            )}
          />

          <Controller
            control={control}
            name="companyName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t('common.company_name')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
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

          <Button
            title={t('auth.have_account')}
            onPress={() => router.back()}
            variant="ghost"
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
    marginBottom: 32,
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
});
