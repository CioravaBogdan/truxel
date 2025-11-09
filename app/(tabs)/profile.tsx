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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { ChatSupportModal } from '@/components/ChatSupportModal';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
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
} from 'lucide-react-native';
import i18n from '@/lib/i18n';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'lt', name: 'Lietuvių', flag: '🇱🇹' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

const SUBSCRIPTION_TIERS: Record<string, any> = {
  trial: { name: 'Trial', searches: 5 },
  standard: { name: 'Standard', searches: 30, price: 29.99 },
  pro: { name: 'Pro', searches: 50, price: 49.99 },
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
  { value: 'Other', label: 'Other' },
];

const SEARCH_RADIUS_OPTIONS = [
  { value: 1, label: '1 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
];

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
  const { profile, reset, refreshProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [selectedPhoneCountry, setSelectedPhoneCountry] = useState<string>(PHONE_COUNTRIES[0].iso);
  const [phoneNumberLocal, setPhoneNumberLocal] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  
  console.log('ProfileScreen MOUNTED');
  console.log('Profile from store:', profile);
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [truckType, setTruckType] = useState<string | null>(null);
  const [searchRadius, setSearchRadius] = useState(10);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);

  const sortedDialCodes = useMemo(() => [...PHONE_COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length), []);
  const selectedCountry = useMemo(
    () => PHONE_COUNTRIES.find((country) => country.iso === selectedPhoneCountry) || PHONE_COUNTRIES[0],
    [selectedPhoneCountry]
  );

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
    console.log('useEffect triggered, profile:', profile);
    // Only load from profile if we don't have unsaved changes
    if (profile && !hasUnsavedChanges) {
      console.log('Loading profile data into form:', {
        full_name: profile.full_name,
        company_name: profile.company_name,
        truck_type: profile.truck_type,
        search_radius_km: profile.search_radius_km,
        preferred_industries: profile.preferred_industries,
      });
      setFullName(profile.full_name || '');
      setCompanyName(profile.company_name || '');
      setTruckType(profile.truck_type || null);
      setSearchRadius(profile.search_radius_km || 10);
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
    } else {
      console.log('Skipping profile load - has unsaved changes or no profile');
    }
  }, [profile?.user_id, hasUnsavedChanges, sortedDialCodes]);

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
      console.log('Saving profile with industries:', selectedIndustries);
      await authService.updateProfile(profile.user_id, {
        full_name: fullName,
        company_name: companyName || undefined,
        truck_type: truckType || undefined,
        search_radius_km: searchRadius,
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
  };

  if (!profile) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={[styles.scrollContent, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#64748B' }}>
            {t('common.loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const tierInfo = SUBSCRIPTION_TIERS[profile.subscription_tier];
  const searchesUsed =
    profile.subscription_tier === 'trial'
      ? profile.trial_searches_used
      : profile.monthly_searches_used;
  const searchesTotal = tierInfo.searches;

  console.log('Profile Screen - Profile data:', {
    hasProfile: !!profile,
    fullName: profile?.full_name,
    email: profile?.email,
    truckType: profile?.truck_type,
    searchRadius: profile?.search_radius_km,
    industries: profile?.preferred_industries,
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('profile.title')}</Text>
        </View>

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
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Camera size={20} color="#FFFFFF" />
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
              <Mail size={20} color="#64748B" />
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
                maxLength={15}
              />
            </View>
            {phoneError && <Text style={styles.errorText}>{phoneError}</Text>}
          </View>
        </Card>

        {/* Truck Type Selection */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Truck size={24} color="#2563EB" />
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
            <MapPin size={24} color="#2563EB" />
            <Text style={styles.sectionTitle}>{t('profile.search_radius')}</Text>
          </View>
          <Text style={styles.sectionDescription}>
            {t('profile.search_radius_desc')}
          </Text>

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

        {/* Industry Preferences */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Factory size={24} color="#2563EB" />
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
        />

        <Card style={styles.section}>
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
            <CreditCard size={32} color="#2563EB" />
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
                  { width: `${(searchesUsed / searchesTotal) * 100}%` },
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
          style={styles.supportButton}
          onPress={() => setShowSupportModal(true)}
        >
          <Text style={styles.supportButtonText}>💬 {t('support.title')}</Text>
        </TouchableOpacity>

        <Button
          title={t('common.logout')}
          onPress={handleLogout}
          variant="outline"
          loading={isLoading}
          style={styles.logoutButton}
        />

        <Text style={styles.version}>
          {t('profile.version')} 1.0.0
        </Text>
      </ScrollView>

      {/* Chat Support Modal */}
      <ChatSupportModal
        visible={showSupportModal}
        onClose={() => setShowSupportModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoText: {
    fontSize: 16,
    color: '#1E293B',
    marginLeft: 12,
  },
  helperText: {
    fontSize: 13,
    color: '#64748B',
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
    color: '#1E293B',
  },
  subscriptionPrice: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  searchesProgress: {
    marginBottom: 16,
  },
  searchesText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563EB',
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  languageButtonActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  languageFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  languageName: {
    fontSize: 14,
    color: '#64748B',
  },
  languageNameActive: {
    color: '#2563EB',
    fontWeight: '600',
  },
  supportButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  supportButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 8,
  },
  version: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 24,
  },
  // New form styles
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  chipSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  chipText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#2563EB',
    fontWeight: '600',
  },
  radiusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  radiusButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  radiusButtonSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  radiusText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  radiusTextSelected: {
    color: '#2563EB',
    fontWeight: '600',
  },
  saveButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  phoneCountryList: {
    paddingVertical: 4,
    paddingRight: 16,
  },
  phoneCountryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  phoneCountryChipActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  phoneCountryText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  phoneCountryTextActive: {
    color: '#1D4ED8',
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  phoneDialCode: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  phoneDialCodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  phoneNumberInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1E293B',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 8,
  },
  // Avatar styles
  avatarSection: {
    marginBottom: 24,
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E5E7EB',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#6B7280',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarInfo: {
    alignItems: 'center',
  },
  avatarName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  avatarEmail: {
    fontSize: 14,
    color: '#64748B',
  },
});
