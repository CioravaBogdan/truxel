import React, { useState, useEffect } from 'react';
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
import { useAuthStore } from '@/store/authStore';
import Toast from 'react-native-toast-message';
import { useTheme } from '@/lib/theme';

interface CompleteProfileForm {
  fullName: string;
  phoneNumber: string;
  companyName: string;
}

export default function CompleteProfileScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile, refreshProfile } = useAuthStore();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CompleteProfileForm>({
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      companyName: '',
    },
  });

  useEffect(() => {
    if (profile) {
      if (profile.full_name) setValue('fullName', profile.full_name);
      if (profile.phone_number) setValue('phoneNumber', profile.phone_number);
      if (profile.company_name) setValue('companyName', profile.company_name);
    }
  }, [profile, setValue]);

  const onSubmit = async (data: CompleteProfileForm) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await authService.updateProfile(user.id, {
        full_name: data.fullName,
        phone_number: data.phoneNumber,
        company_name: data.companyName,
      });

      await refreshProfile();

      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: t('profile.profile_updated'),
      });

      // Navigate to main app
      router.replace('/(tabs)');
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
            <Text style={styles.headerTitle}>{t('auth.complete_profile')}</Text>
            <Text style={styles.headerSubtitle}>
              {t('auth.complete_profile_subtitle')}
            </Text>
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

              <Button
                title={t('common.save_continue')}
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                style={styles.button}
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
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 18,
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
    marginTop: 24,
  },
});
