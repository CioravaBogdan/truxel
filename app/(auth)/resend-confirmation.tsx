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
import { authService } from '@/services/authService';
import Toast from 'react-native-toast-message';
import { useTheme } from '@/lib/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface ResendConfirmationForm {
  email: string;
}

export default function ResendConfirmationScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResendConfirmationForm>({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ResendConfirmationForm) => {
    setIsLoading(true);
    try {
      await authService.resendConfirmation(data.email);
      Toast.show({
        type: 'success',
        text1: t('auth.confirmation_sent'),
        text2: t('auth.check_email_confirmation'),
      });
      // Optional: Navigate back to login after a delay
      setTimeout(() => {
        router.back();
      }, 3000);
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
            <Text style={styles.headerTitle}>{t('auth.resend_confirmation')}</Text>
            <Text style={styles.headerSubtitle}>{t('auth.resend_confirmation_subtitle')}</Text>
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

              <Button
                title={t('auth.send_confirmation_link')}
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                style={styles.button}
                variant="primary"
              />

              <Button
                title={t('auth.back_to_login')}
                onPress={() => router.back()}
                variant="ghost"
                style={styles.backButton}
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
  backButton: {
    marginTop: 8,
  },
});
