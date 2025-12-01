import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { supabase } from '@/lib/supabase';
import Toast from 'react-native-toast-message';
import { useTheme } from '@/lib/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface UpdatePasswordForm {
  password: string;
  confirmPassword: string;
}

export default function UpdatePasswordScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UpdatePasswordForm>({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: UpdatePasswordForm) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: t('auth.password_updated'),
        text2: t('auth.password_updated_desc'),
      });

      // Navigate to home after success
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 2000);
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
            <Text style={styles.headerTitle}>{t('auth.update_password')}</Text>
            <Text style={styles.headerSubtitle}>{t('auth.update_password_subtitle')}</Text>
          </View>
        </LinearGradient>

        <View style={styles.formContainer}>
          <Card style={styles.card}>
            <View style={styles.form}>
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
                    label={t('auth.new_password')}
                    placeholder="••••••••"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="password-new"
                  />
                )}
              />

              <Controller
                control={control}
                name="confirmPassword"
                rules={{
                  required: t('auth.confirm_password_required'),
                  validate: (value) =>
                    value === password || t('auth.passwords_dont_match'),
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label={t('auth.confirm_new_password')}
                    placeholder="••••••••"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.confirmPassword?.message}
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="password-new"
                  />
                )}
              />

              <Button
                title={t('auth.update_password_btn')}
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                style={styles.button}
                variant="primary"
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
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#94A3B8', // Slate 400
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
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
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: '#FF5722', // Brand Orange
  },
});
