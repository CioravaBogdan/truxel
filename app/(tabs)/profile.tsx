import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { ChatSupportModal } from '@/components/ChatSupportModal';
import DeleteAccountModal from '@/components/DeleteAccountModal';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { getRadiusOptions, type DistanceUnit } from '@/utils/distance';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import {
  Mail,
  CreditCard,
  Truck,
  MapPin,
  Factory,
  Camera,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react-native';
import i18n, { supportedLanguages } from '@/lib/i18n';
import { useTheme, Theme } from '@/lib/theme';
import { LinearGradient } from 'expo-linear-gradient';

const LANGUAGE_DETAILS: Record<
  string,
  {
    name: string;
    flag: string;
  }
> = {
  en: { name: 'English', flag: 'EN' },
  ro: { name: 'Romanian', flag: 'RO' },
  pl: { name: 'Polish', flag: 'PL' },
  tr: { name: 'Turkish', flag: 'TR' },
  lt: { name: 'Lithuanian', flag: 'LT' },
  es: { name: 'Spanish', flag: 'ES' },
  fr: { name: 'French', flag: 'FR' },
  de: { name: 'German', flag: 'DE' },
  it: { name: 'Italian', flag: 'IT' },
  uk: { name: 'Ukrainian', flag: 'UA' },
};

const LANGUAGES = supportedLanguages.map((code) => ({
  code,
  ...(LANGUAGE_DETAILS[code] || {
    name: code.toUpperCase(),
    flag: code.toUpperCase(),
  }),
}));



const SUBSCRIPTION_TIERS: Record<string, any> = {
  trial: { name: 'Trial', searches: 5 },
  standard: { name: 'Standard', searches: 30, price: 29.99 },
  pro: { name: 'Pro', searches: 50, price: 49.99 },
  fleet_manager: { name: 'Fleet Manager', searches: 30, price: 29.99 },
  pro_freighter: { name: 'Pro Freighter', searches: 50, price: 49.99 },
  premium: { name: 'Premium', searches: 999, price: 99.99 },
};

const TRUCK_TYPES = [
  { value: '3.5T', label: '3.5T Van' },
  { value: '7.5T', label: '7.5T Truck' },
  { value: '12T', label: '12T Truck' },
  { value: '20T', label: '20T Truck' },
  { value: 'Trailer', label: 'Trailer (13.6m)' },
  { value: 'MegaTrailer', label: 'Mega Trailer' },
  { value: 'Frigo', label: 'Refrigerated' },
  { value: 'Tanker', label: 'Tanker' },
  { value: 'Flatbed', label: 'Flatbed' },
  { value: 'StepDeck', label: 'Step Deck' },
  { value: 'PowerOnly', label: 'Power Only' },
  { value: 'BoxTruck', label: 'Box Truck' },
  { value: 'DryVan', label: 'Dry Van' },
  { value: 'Other', label: 'Other' },
];

// REMOVED: SEARCH_RADIUS_OPTIONS now dynamic based on user's preferred_distance_unit
// Uses getRadiusOptions() from @/utils/distance

const INDUSTRIES = [
  'Automotive', 'Construction', 'Electronics', 'Food & Beverage', 'Furniture',
  'Metalworking', 'Mining', 'Oil & Gas', 'Paper & Packaging', 'Pharmaceuticals',
  'Plastics', 'Textiles', 'Timber & Wood', 'Retail', 'Agriculture',
  'Chemicals', 'Logistics', 'Manufacturing', 'Waste Management', 'Other',
];

const PHONE_COUNTRIES = [
  { iso: 'US', name: 'United States', dialCode: '1', flag: '🇺🇸' },
  { iso: 'MX', name: 'Mexico', dialCode: '52', flag: '🇲🇽' },
  { iso: 'RO', name: 'Romania', dialCode: '40', flag: '🇷🇴' },
  { iso: 'PL', name: 'Poland', dialCode: '48', flag: '🇵🇱' },
  { iso: 'DE', name: 'Germany', dialCode: '49', flag: '🇩🇪' },
  { iso: 'AT', name: 'Austria', dialCode: '43', flag: '🇦🇹' },
  { iso: 'ES', name: 'Spain', dialCode: '34', flag: '🇪🇸' },
  { iso: 'IT', name: 'Italy', dialCode: '39', flag: '🇮🇹' },
  { iso: 'FR', name: 'France', dialCode: '33', flag: '🇫🇷' },
  { iso: 'NL', name: 'Netherlands', dialCode: '31', flag: '🇳🇱' },
  { iso: 'BE', name: 'Belgium', dialCode: '32', flag: '🇧🇪' },
  { iso: 'HU', name: 'Hungary', dialCode: '36', flag: '🇭🇺' },
  { iso: 'CZ', name: 'Czechia', dialCode: '420', flag: '🇨🇿' },
  { iso: 'SK', name: 'Slovakia', dialCode: '421', flag: '🇸🇰' },
  { iso: 'BG', name: 'Bulgaria', dialCode: '359', flag: '🇧🇬' },
  { iso: 'GR', name: 'Greece', dialCode: '30', flag: '🇬🇷' },
  { iso: 'PT', name: 'Portugal', dialCode: '351', flag: '🇵🇹' },
  { iso: 'SE', name: 'Sweden', dialCode: '46', flag: '🇸🇪' },
  { iso: 'DK', name: 'Denmark', dialCode: '45', flag: '🇩🇰' },
  { iso: 'FI', name: 'Finland', dialCode: '358', flag: '🇫🇮' },
  { iso: 'IE', name: 'Ireland', dialCode: '353', flag: '🇮🇪' },
  { iso: 'HR', name: 'Croatia', dialCode: '385', flag: '🇭🇷' },
  { iso: 'SI', name: 'Slovenia', dialCode: '386', flag: '🇸🇮' },
  { iso: 'LT', name: 'Lithuania', dialCode: '370', flag: '🇱🇹' },
  { iso: 'LV', name: 'Latvia', dialCode: '371', flag: '🇱🇻' },
  { iso: 'EE', name: 'Estonia', dialCode: '372', flag: '🇪🇪' },
  { iso: 'TR', name: 'Turkey', dialCode: '90', flag: '🇹🇷' },
];

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { theme, setThemeMode, themeMode } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { profile, reset, refreshProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPhoneCountry, setSelectedPhoneCountry] = useState<string>(PHONE_COUNTRIES[0].iso);
  const [phoneNumberLocal, setPhoneNumberLocal] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [truckType, setTruckType] = useState<string | null>(null);
  const [searchRadius, setSearchRadius] = useState(10);
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('km');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);

  const sortedDialCodes = useMemo(() => [...PHONE_COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length), []);
  const selectedCountry = useMemo(
    () => PHONE_COUNTRIES.find((country) => country.iso === selectedPhoneCountry) || PHONE_COUNTRIES[0],
    [selectedPhoneCountry]
  );
  
  // Dynamic radius options based on user's preferred distance unit
  const SEARCH_RADIUS_OPTIONS = useMemo(() => {
    const distanceUnit = profile?.preferred_distance_unit || 'km';
    return getRadiusOptions(distanceUnit);
  }, [profile?.preferred_distance_unit]);

  // Upload avatar function
  const handleUploadAvatar = async () => {
    if (!profile) return;

    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('profile.permission_required'),
          t('profile.photo_permission_message')
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8, // Compress to 80% quality
      });

      if (result.canceled) return;

      setIsUploadingAvatar(true);

      const imageUri = result.assets[0].uri;
      const fileExt = imageUri.split('.').pop() || 'jpg';
      const fileName = `${profile.user_id}/avatar.${fileExt}`;

      // React Native: fetch returns blob without arrayBuffer method
      // Solution: Read as base64 using FileReader or XMLHttpRequest
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Convert blob to ArrayBuffer using FileReader (React Native compatible)
      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result instanceof ArrayBuffer) {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to read as ArrayBuffer'));
          }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
      });

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles-avatars')
        .upload(fileName, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true, // Replace if exists
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profiles-avatars')
        .getPublicUrl(fileName);

      // Update profile with avatar URL
      await authService.updateProfile(profile.user_id, {
        avatar_url: publicUrl,
      });

      // Refresh profile
      await refreshProfile();

      Toast.show({
        type: 'success',
        text1: t('profile.avatar_updated'),
      });
    } catch (error: any) {
      console.error('Upload avatar error:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.message || t('profile.avatar_upload_failed'),
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Load profile data into form
  // FIXED: Only depend on profile?.user_id to prevent re-renders on any profile field change
  useEffect(() => {
    // Only load from profile if we don't have unsaved changes
    if (profile && !hasUnsavedChanges) {
      setFullName(profile.full_name || '');
      setCompanyName(profile.company_name || '');
      setTruckType(profile.truck_type || null);
      setSearchRadius(profile.search_radius_km || 10);
      setDistanceUnit(profile.preferred_distance_unit || 'km');
      setSelectedIndustries(profile.preferred_industries || []);

      const currentPhone = profile.phone_number || '';
      const digitsOnly = currentPhone.replace(/[^0-9]/g, '');

      if (digitsOnly) {
        const matchedCountry = sortedDialCodes.find((country) => digitsOnly.startsWith(country.dialCode));
        if (matchedCountry) {
          setSelectedPhoneCountry(matchedCountry.iso);
          setPhoneNumberLocal(digitsOnly.slice(matchedCountry.dialCode.length));
        } else {
          setSelectedPhoneCountry(PHONE_COUNTRIES[0].iso);
          setPhoneNumberLocal(digitsOnly);
        }
      } else {
        setSelectedPhoneCountry(PHONE_COUNTRIES[0].iso);
        setPhoneNumberLocal('');
      }
      setPhoneError(null);
    }
  }, [profile, hasUnsavedChanges, sortedDialCodes]);

  // Toggle industry selection (max 5)
  const toggleIndustry = (industry: string) => {
    setHasUnsavedChanges(true);
    setSelectedIndustries(prev => {
      if (prev.includes(industry)) {
        return prev.filter(i => i !== industry);
      }
      if (prev.length >= 5) {
        Toast.show({
          type: 'error',
          text1: t('profile.max_industries'),
          text2: t('profile.max_industries_desc'),
        });
        return prev;
      }
      return [...prev, industry];
    });
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!profile) return;
    
    if (!fullName.trim()) {
      Toast.show({
        type: 'error',
        text1: t('profile.name_required'),
      });
      return;
    }

    const sanitizedLocal = phoneNumberLocal.replace(/[^0-9]/g, '');
    let formattedPhone: string | null = null;

    if (sanitizedLocal) {
      if (sanitizedLocal.length < 6) {
        setPhoneError(t('profile.phone_number_invalid'));
        return;
      }
      formattedPhone = `+${selectedCountry.dialCode}${sanitizedLocal}`;
    }
    setPhoneError(null);

    const phoneUpdate = sanitizedLocal ? formattedPhone || undefined : undefined;

    try {
      setIsSaving(true);
      await authService.updateProfile(profile.user_id, {
        full_name: fullName,
        company_name: companyName || undefined,
        truck_type: truckType || undefined,
        search_radius_km: searchRadius,
        preferred_distance_unit: distanceUnit,
        preferred_industries: selectedIndustries,
        phone_number: phoneUpdate,
      });
      
      // Clear unsaved changes flag BEFORE refreshing
      setHasUnsavedChanges(false);
      
      // Refresh profile from backend
      await refreshProfile();
      
      Toast.show({
        type: 'success',
        text1: t('profile.profile_updated'),
      });
    } catch (error) {
      console.error('Save profile error:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('profile.save_failed'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    if (profile) {
      authService.updateProfile(profile.user_id, {
        preferred_language: languageCode as any,
      }).catch(console.error);
    }
    Toast.show({
      type: 'success',
      text1: t('profile.profile_updated'),
    });
  };

  const handleLogout = () => {
    // Web-compatible logout confirmation
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`${t('common.logout')}\n\n${t('auth.logout_confirm')}`);
      if (confirmed) {
        setIsLoading(true);
        authService.signOut()
          .then(() => {
            reset();
            // Navigate to landing page on web
            router.replace('/(web)');
          })
          .catch((error: any) => {
            Toast.show({
              type: 'error',
              text1: t('common.error'),
              text2: error.message,
            });
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    } else {
      // Native platforms use Alert.alert
      Alert.alert(
        t('common.logout'),
        t('auth.logout_confirm'),
        [
          {
            text: t('common.cancel'),
            style: 'cancel',
          },
          {
            text: t('common.confirm'),
            onPress: async () => {
              setIsLoading(true);
              try {
                await authService.signOut();
                reset();
              } catch (error: any) {
                Toast.show({
                  type: 'error',
                  text1: t('common.error'),
                  text2: error.message,
                });
              } finally {
                setIsLoading(false);
              }
            },
            style: 'destructive',
          },
        ]
      );
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true);
      await authService.deleteAccount();
      
      // Clear store and navigate away
      reset();
      
      if (Platform.OS === 'web') {
        router.replace('/(web)');
      } else {
        // On native, user will be auto-logged out
        router.replace('/(auth)/login');
      }

      Toast.show({
        type: 'success',
        text1: 'Account Deleted',
        text2: 'Your account and all data have been permanently deleted.',
      });
    } catch (error: any) {
      console.error('Delete account error:', error);
      Toast.show({
        type: 'error',
        text1: 'Deletion Failed',
        text2: error.message || 'Failed to delete account. Please try again.',
      });
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };

  if (!profile) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={[styles.scrollContent, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 16, fontSize: 16, color: theme.colors.textSecondary }}>
            {t('common.loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Fallback to trial if tier not found (prevents undefined crash)
  const tierInfo = SUBSCRIPTION_TIERS[profile.subscription_tier] || SUBSCRIPTION_TIERS['trial'];
  const searchesUsed =
    profile.subscription_tier === 'trial'
      ? profile.trial_searches_used
      : profile.monthly_searches_used;
  const searchesTotal = tierInfo.searches;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={['#0F172A', '#020617']}
          style={styles.heroHeader}
        >
          <View style={styles.webContainer}>
            <Text style={styles.heroTitle}>{t('profile.title')}</Text>
          </View>
        </LinearGradient>

        <View style={styles.webContainer}>
          <View style={styles.mainContent}>
            {/* Avatar Section */}
            <Card style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {profile.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlaceholderText}>
                    {profile.company_name?.charAt(0).toUpperCase() || 
                     profile.full_name?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
              <TouchableOpacity 
                style={styles.cameraButton} 
                onPress={handleUploadAvatar}
                disabled={isUploadingAvatar}
              >
                {isUploadingAvatar ? (
                  <ActivityIndicator size="small" color={theme.colors.white} />
                ) : (
                  <Camera size={20} color={theme.colors.white} />
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.avatarInfo}>
              <Text style={styles.avatarName}>
                {profile.company_name || profile.full_name}
              </Text>
              <Text style={styles.avatarEmail}>{profile.email}</Text>
            </View>
          </Card>

          {/* Profile Form */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.personal_info')}</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('profile.full_name')} *</Text>
              <Input
                placeholder={t('profile.enter_name')}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('profile.company_name')}</Text>
              <Input
                placeholder={t('profile.enter_company')}
                value={companyName}
                onChangeText={setCompanyName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('profile.email')}</Text>
              <View style={styles.infoRow}>
                <Mail size={20} color={theme.colors.textSecondary} />
                <Text style={styles.infoText}>{profile.email}</Text>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('profile.phone_number')}</Text>
              <Text style={styles.helperText}>{t('profile.phone_number_helper')}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.phoneCountryList}
              >
                {PHONE_COUNTRIES.map((country) => {
                  const isActive = selectedPhoneCountry === country.iso;
                  return (
                    <TouchableOpacity
                      key={country.iso}
                      style={[
                        styles.phoneCountryChip,
                        isActive && styles.phoneCountryChipActive,
                      ]}
                      onPress={() => {
                        setHasUnsavedChanges(true);
                        setSelectedPhoneCountry(country.iso);
                      }}
                    >
                      <Text style={[styles.phoneCountryText, isActive && styles.phoneCountryTextActive]}>
                        {country.flag} +{country.dialCode}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <View style={styles.phoneInputRow}>
                <View style={styles.phoneDialCode}>
                  <Text style={styles.phoneDialCodeText}>+{selectedCountry.dialCode}</Text>
                </View>
                <TextInput
                  style={styles.phoneNumberInput}
                  keyboardType="phone-pad"
                  value={phoneNumberLocal}
                  onChangeText={(value) => {
                    setHasUnsavedChanges(true);
                    setPhoneError(null);
                    setPhoneNumberLocal(value.replace(/[^0-9]/g, ''));
                  }}
                  placeholder={t('profile.phone_number_placeholder')}
                  placeholderTextColor={theme.colors.placeholder}
                  maxLength={15}
                />
              </View>
              {phoneError && <Text style={styles.errorText}>{phoneError}</Text>}
            </View>
          </Card>

          {/* Truck Type Selection */}
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Truck size={24} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>{t('profile.truck_type')}</Text>
            </View>
            <Text style={styles.sectionDescription}>
              {t('profile.truck_type_desc')}
            </Text>

            <View style={styles.chipContainer}>
              {TRUCK_TYPES.map((truck) => (
                <TouchableOpacity
                  key={truck.value}
                  style={[
                    styles.chip,
                    truckType === truck.value && styles.chipSelected,
                  ]}
                  onPress={() => {
                    setHasUnsavedChanges(true);
                    setTruckType(truck.value);
                  }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      truckType === truck.value && styles.chipTextSelected,
                    ]}
                  >
                    {truck.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Search Radius Selection */}
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={24} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>{t('profile.search_radius')}</Text>
            </View>
            <Text style={styles.sectionDescription}>
              {t('profile.search_radius_desc')}
            </Text>

            {/* Warning about larger radius */}
            <View style={styles.radiusWarning}>
              <Text style={styles.radiusWarningText}>
                {t('profile.search_radius_warning')}
              </Text>
            </View>

            <View style={styles.radiusContainer}>
              {SEARCH_RADIUS_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.radiusButton,
                    searchRadius === option.value && styles.radiusButtonSelected,
                  ]}
                  onPress={() => {
                    setHasUnsavedChanges(true);
                    setSearchRadius(option.value);
                  }}
                >
                  <Text
                    style={[
                      styles.radiusText,
                      searchRadius === option.value && styles.radiusTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Distance Unit Selection */}
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={24} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>{t('profile.distance_unit')}</Text>
            </View>
            <Text style={styles.sectionDescription}>
              {t('profile.distance_unit_desc')}
            </Text>

            <View style={styles.radiusContainer}>
              <TouchableOpacity
                style={[
                  styles.radiusButton,
                  distanceUnit === 'km' && styles.radiusButtonSelected,
                ]}
                onPress={() => {
                  setHasUnsavedChanges(true);
                  setDistanceUnit('km');
                }}
              >
                <Text
                  style={[
                    styles.radiusText,
                    distanceUnit === 'km' && styles.radiusTextSelected,
                  ]}
                >
                  {t('profile.unit_km')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.radiusButton,
                  distanceUnit === 'mi' && styles.radiusButtonSelected,
                ]}
                onPress={() => {
                  setHasUnsavedChanges(true);
                  setDistanceUnit('mi');
                }}
              >
                <Text
                  style={[
                    styles.radiusText,
                    distanceUnit === 'mi' && styles.radiusTextSelected,
                  ]}
                >
                  {t('profile.unit_mi')}
                </Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Industry Preferences */}
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Factory size={24} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>
                {t('profile.preferred_industries')}
              </Text>
            </View>
            <Text style={styles.sectionDescription}>
              {t('profile.industries_desc', { count: selectedIndustries.length })}
            </Text>

            <View style={styles.chipContainer}>
              {INDUSTRIES.map((industry) => {
                const isSelected = selectedIndustries.includes(industry);
                return (
                  <TouchableOpacity
                    key={industry}
                    style={[
                      styles.chip,
                      isSelected && styles.chipSelected,
                    ]}
                    onPress={() => toggleIndustry(industry)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                      ]}
                    >
                      {industry}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          {/* Save Button */}
          <Button
            title={t('common.save')}
            onPress={handleSaveProfile}
            loading={isSaving}
            style={styles.saveButton}
            variant="secondary"
          />

          <Card style={[
            styles.section,
            profile.subscription_tier !== 'trial' && styles.activeSubscriptionCard
          ]}>
            <Text style={styles.sectionTitle}>{t('subscription.title')}</Text>

            <View style={styles.subscriptionHeader}>
              <View>
                <Text style={styles.subscriptionTier}>
                  {tierInfo.name} {t('subscription.title')}
                </Text>
                {'price' in tierInfo && tierInfo.price && (
                  <Text style={styles.subscriptionPrice}>
                    {t('subscription.price_month', { price: tierInfo.price })}
                  </Text>
                )}
              </View>
              <CreditCard size={32} color={theme.colors.primary} />
            </View>

            <View style={styles.searchesProgress}>
              <Text style={styles.searchesText}>
                {t('subscription.searches_used', {
                  used: searchesUsed,
                  total: searchesTotal,
                })}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(searchesUsed / searchesTotal) * 100}%`, backgroundColor: theme.colors.secondary },
                  ]}
                />
              </View>
            </View>

            {profile.subscription_tier === 'trial' && (
              <Button
                title={t('home.upgrade')}
                onPress={() => {
                  console.log('Navigating to pricing screen');
                  router.push('/(tabs)/pricing');
                }}
                variant="outline"
              />
            )}
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Appearance</Text>
            <View style={styles.radiusContainer}>
              <TouchableOpacity
                style={[
                  styles.radiusButton,
                  themeMode === 'light' && styles.radiusButtonSelected,
                  { borderColor: themeMode === 'light' ? theme.colors.primary : theme.colors.border, backgroundColor: theme.colors.card }
                ]}
                onPress={() => setThemeMode('light')}
              >
                <Sun size={20} color={themeMode === 'light' ? theme.colors.primary : theme.colors.textSecondary} />
                <Text style={[styles.radiusText, themeMode === 'light' && { color: theme.colors.primary }]}>Light</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.radiusButton,
                  themeMode === 'dark' && styles.radiusButtonSelected,
                  { borderColor: themeMode === 'dark' ? theme.colors.primary : theme.colors.border, backgroundColor: theme.colors.card }
                ]}
                onPress={() => setThemeMode('dark')}
              >
                <Moon size={20} color={themeMode === 'dark' ? theme.colors.primary : theme.colors.textSecondary} />
                <Text style={[styles.radiusText, themeMode === 'dark' && { color: theme.colors.primary }]}>Dark</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.radiusButton,
                  themeMode === 'auto' && styles.radiusButtonSelected,
                  { borderColor: themeMode === 'auto' ? theme.colors.primary : theme.colors.border, backgroundColor: theme.colors.card }
                ]}
                onPress={() => setThemeMode('auto')}
              >
                <Monitor size={20} color={themeMode === 'auto' ? theme.colors.primary : theme.colors.textSecondary} />
                <Text style={[styles.radiusText, themeMode === 'auto' && { color: theme.colors.primary }]}>Auto</Text>
              </TouchableOpacity>
            </View>
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.language')}</Text>

            <View style={styles.languageGrid}>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageButton,
                    i18n.language === lang.code && styles.languageButtonActive,
                  ]}
                  onPress={() => handleChangeLanguage(lang.code)}
                >
                  <Text style={styles.languageFlag}>{lang.flag}</Text>
                  <Text
                    style={[
                      styles.languageName,
                      i18n.language === lang.code && styles.languageNameActive,
                    ]}
                  >
                    {lang.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Support Button */}
          <TouchableOpacity
            style={[styles.supportButtonStyle, { shadowColor: theme.colors.info, backgroundColor: theme.colors.card }]}
            onPress={() => setShowSupportModal(true)}
            activeOpacity={0.7}
          >
            <View style={[styles.supportButtonContent, { borderColor: theme.colors.info }]}>
              <Text style={[styles.supportButtonText, { color: theme.colors.info }]}>💬 {t('support.title')}</Text>
            </View>
          </TouchableOpacity>

          <Button
            title={t('common.logout')}
            onPress={handleLogout}
            variant="outline"
            loading={isLoading}
            style={styles.logoutButton}
          />

          {/* Danger Zone - Account Deletion */}
          <Card style={styles.dangerZone}>
            <View style={styles.dangerHeader}>
              <Text style={styles.dangerTitle}>⚠️ Danger Zone</Text>
              <Text style={styles.dangerDescription}>
                Permanently delete your account and all associated data. This action cannot be undone.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.deleteAccountButton}
              onPress={() => setShowDeleteModal(true)}
              disabled={isLoading}
            >
              <Text style={styles.deleteAccountButtonText}>Delete My Account</Text>
            </TouchableOpacity>
          </Card>

          <Text style={styles.version}>
            {t('profile.version')} 1.0.0
          </Text>
          </View>
        </View>
      </ScrollView>

      {/* Chat Support Modal */}
      <ChatSupportModal
        visible={showSupportModal}
        onClose={() => setShowSupportModal(false)}
      />

      {/* Delete Account Modal */}
      <DeleteAccountModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
      />
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  webContainer: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  heroHeader: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    paddingTop: Platform.OS === 'web' ? 64 : 40,
    paddingBottom: 80,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: -50,
    zIndex: 0,
    ...theme.shadows.medium,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.colors.white,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  mainContent: {
    paddingHorizontal: theme.spacing.md,
    zIndex: 1,
  },
  header: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  activeSubscriptionCard: {
    borderColor: theme.colors.secondary,
    borderWidth: 1,
    backgroundColor: theme.mode === 'dark' ? theme.colors.secondary + '10' : theme.colors.card,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 12,
  },
  helperText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subscriptionTier: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  subscriptionPrice: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  searchesProgress: {
    marginBottom: 16,
  },
  searchesText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.secondary,
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    ...theme.shadows.small,
    flexGrow: 1,
    justifyContent: 'center',
  },
  languageButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.mode === 'dark' ? theme.colors.primary + '15' : theme.colors.primary + '10',
    borderWidth: 2,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageName: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  languageNameActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  supportButtonStyle: {
    marginTop: 24,
    marginBottom: 16,
    borderRadius: 16,
    ...theme.shadows.small,
  },
  supportButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    gap: 8,
  },
  supportButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  logoutButton: {
    marginTop: 16,
  },
  version: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginBottom: 20,
    lineHeight: 22,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  chipSelected: {
    borderColor: theme.colors.secondary,
    backgroundColor: theme.mode === 'dark' ? theme.colors.secondary + '20' : theme.colors.secondary + '10',
    borderWidth: 2,
  },
  chipText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: theme.colors.secondary,
    fontWeight: '700',
  },
  radiusWarning: {
    backgroundColor: theme.colors.warning + '15',
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning,
    padding: 16,
    marginBottom: 20,
    borderRadius: 8,
  },
  radiusWarningText: {
    fontSize: 14,
    color: theme.colors.warning,
    lineHeight: 20,
    fontWeight: '500',
  },
  radiusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  radiusButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  radiusButtonSelected: {
    borderColor: theme.colors.secondary,
    backgroundColor: theme.mode === 'dark' ? theme.colors.secondary + '20' : theme.colors.secondary + '10',
    borderWidth: 2,
  },
  radiusText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  radiusTextSelected: {
    color: theme.colors.secondary,
    fontWeight: '700',
  },
  saveButton: {
    marginTop: 12,
    marginBottom: 32,
    height: 56,
    borderRadius: 16,
    ...theme.shadows.medium,
  },
  phoneCountryList: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  phoneCountryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    marginRight: 10,
  },
  phoneCountryChipActive: {
    borderColor: theme.colors.secondary,
    backgroundColor: theme.mode === 'dark' ? theme.colors.secondary + '20' : theme.colors.secondary + '10',
    borderWidth: 2,
  },
  phoneCountryText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  phoneCountryTextActive: {
    color: theme.colors.secondary,
    fontWeight: '700',
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.colors.card,
    height: 56,
  },
  phoneDialCode: {
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
  },
  phoneDialCodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  phoneNumberInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 16,
    color: theme.colors.text,
  },
  errorText: {
    fontSize: 13,
    color: theme.colors.error,
    marginTop: 8,
    fontWeight: '500',
  },
  dangerZone: {
    marginTop: 40,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.error,
    backgroundColor: theme.colors.error + '15',
    borderRadius: 16,
    padding: 16,
  },
  dangerHeader: {
    marginBottom: 20,
  },
  dangerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.error,
    marginBottom: 8,
  },
  dangerDescription: {
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 22,
    opacity: 0.8,
  },
  deleteAccountButton: {
    backgroundColor: theme.colors.error,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  deleteAccountButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  avatarSection: {
    marginBottom: 32,
    alignItems: 'center',
    paddingVertical: 32,
    borderRadius: 24,
    backgroundColor: theme.colors.card,
    ...theme.shadows.medium,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
    ...theme.shadows.large,
  },
  avatarImage: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: theme.colors.border,
    borderWidth: 4,
    borderColor: theme.colors.card,
  },
  avatarPlaceholder: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: theme.colors.card,
  },
  avatarPlaceholderText: {
    fontSize: 48,
    fontWeight: '700',
    color: theme.colors.white,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: theme.colors.card,
    ...theme.shadows.small,
  },
  avatarInfo: {
    alignItems: 'center',
  },
  avatarName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 6,
  },
  avatarEmail: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
});
