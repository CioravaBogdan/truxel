import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import Toast from 'react-native-toast-message';
import { useTheme } from '@/lib/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getRadiusOptions, type DistanceUnit } from '@/utils/distance';
import {
  PHONE_COUNTRIES,
  TRUCK_TYPES,
  INDUSTRIES,
  LANGUAGES,
} from '@/utils/constants';
import i18n from '@/lib/i18n';

// Reusable Selection Modal
const SelectionModal = ({
  visible,
  onClose,
  title,
  data,
  onSelect,
  renderItem,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  data: any[];
  onSelect: (item: any) => void;
  renderItem: (item: any) => React.ReactNode;
}) => {
  const { theme } = useTheme();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={data}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.modalItem, { borderBottomColor: theme.colors.border }]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                {renderItem(item)}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

export default function CompleteProfileScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile, refreshProfile } = useAuthStore();

  const isAppleAuthUser = useMemo(() => {
    const provider = (user as any)?.app_metadata?.provider;
    if (provider === 'apple') return true;
    const identities = (user as any)?.identities;
    if (Array.isArray(identities)) {
      return identities.some((i: any) => i?.provider === 'apple');
    }
    return false;
  }, [user]);

  // State
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [selectedPhoneCountry, setSelectedPhoneCountry] = useState(PHONE_COUNTRIES[0].iso);
  const [phoneNumberLocal, setPhoneNumberLocal] = useState('');
  const [truckType, setTruckType] = useState<string | null>(null);
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('km');
  const [searchRadius, setSearchRadius] = useState(10);
  const [notificationRadius, setNotificationRadius] = useState(25);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);

  // Modals
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);

  const selectedCountry = useMemo(
    () => PHONE_COUNTRIES.find((c) => c.iso === selectedPhoneCountry) || PHONE_COUNTRIES[0],
    [selectedPhoneCountry]
  );

  const currentLanguage = useMemo(
    () => LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0],
    [i18n.language] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const SEARCH_RADIUS_OPTIONS = useMemo(() => getRadiusOptions(distanceUnit), [distanceUnit]);

  useEffect(() => {
    if (profile) {
      if (profile.full_name) setFullName(profile.full_name);
      if (profile.company_name) setCompanyName(profile.company_name);
      // Parse phone number if exists
      if (profile.phone_number) {
        const digitsOnly = profile.phone_number.replace(/[^0-9]/g, '');
        const matchedCountry = PHONE_COUNTRIES.find((c) => digitsOnly.startsWith(c.dialCode));
        if (matchedCountry) {
          setSelectedPhoneCountry(matchedCountry.iso);
          setPhoneNumberLocal(digitsOnly.slice(matchedCountry.dialCode.length));
        } else {
          setPhoneNumberLocal(digitsOnly);
        }
      }
    }
  }, [profile]);

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries((prev) => {
      if (prev.includes(industry)) return prev.filter((i) => i !== industry);
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

  const handleSave = async () => {
    if (!user) return;

    // Apple guideline: after Sign in with Apple, do not require the user to re-enter
    // name/email. We therefore treat full name as optional at onboarding.
    if (!companyName.trim()) {
      Toast.show({ type: 'error', text1: t('auth.company_required') });
      return;
    }
    if (!phoneNumberLocal.trim()) {
      Toast.show({ type: 'error', text1: t('auth.phone_required') });
      return;
    }
    if (!truckType) {
      Toast.show({ type: 'error', text1: t('auth.select_truck_type') });
      return;
    }
    if (selectedIndustries.length === 0) {
      Toast.show({ type: 'error', text1: t('auth.select_industry') });
      return;
    }

    const formattedPhone = `+${selectedCountry.dialCode}${phoneNumberLocal.replace(/[^0-9]/g, '')}`;

    setIsLoading(true);
    try {
      const updates: any = {
        company_name: companyName,
        phone_number: formattedPhone,
        truck_type: truckType,
        preferred_distance_unit: distanceUnit,
        search_radius_km: searchRadius,
        notification_radius_km: notificationRadius,
        preferred_industries: selectedIndustries,
      };

      // Avoid overwriting a previously stored full name with an empty string.
      if (fullName.trim()) {
        updates.full_name = fullName;
      }

      await authService.updateProfile(user.id, updates);

      await refreshProfile();
      Toast.show({ type: 'success', text1: t('profile.profile_updated') });
      router.replace('/(tabs)');
    } catch (error: any) {
      Toast.show({ type: 'error', text1: t('common.error'), text2: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.header}>
            <Text style={styles.headerTitle}>{t('auth.complete_profile')}</Text>
            <Text style={styles.headerSubtitle}>{t('auth.help_us_help_you')}</Text>
          </LinearGradient>

          <View style={styles.content}>
            {/* Language Section */}
            <Card style={[styles.card, { borderColor: theme.colors.secondary, borderWidth: 1 }]}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={[styles.label, { color: theme.colors.text }]}>{t('profile.language')}</Text>
                  <Text style={[styles.value, { color: theme.colors.text, fontWeight: '700', fontSize: 18 }]}>
                    {currentLanguage.flag} {currentLanguage.name}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowLanguageModal(true)}
                  style={{
                    backgroundColor: theme.colors.secondary,
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: '#FFF', fontWeight: '700' }}>{t('common.edit')}</Text>
                </TouchableOpacity>
              </View>
            </Card>

            {/* Personal Info */}
            <Card style={styles.card}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('profile.personal_info')}</Text>

              {!isAppleAuthUser && (
                <Input
                  label={t('common.full_name')}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder={t('profile.enter_name')}
                />
              )}
              
              <Input
                label={t('common.company_name')}
                value={companyName}
                onChangeText={setCompanyName}
                placeholder={t('profile.enter_company')}
              />

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>{t('common.phone_number')}</Text>
                <View style={[styles.explanationContainer, { backgroundColor: theme.colors.secondary + '15' }]}>
                  <Text style={[styles.explanation, { color: theme.colors.text }]}>
                    {t('auth.phone_explanation')}
                  </Text>
                </View>
                <View style={[styles.phoneRow, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
                  <TouchableOpacity
                    style={[styles.countryCode, { borderRightColor: theme.colors.border }]}
                    onPress={() => setShowCountryModal(true)}
                  >
                    <Text style={[styles.countryCodeText, { color: theme.colors.text }]}>
                      {selectedCountry.flag} +{selectedCountry.dialCode}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.phoneInput, { color: theme.colors.text }]}
                    value={phoneNumberLocal}
                    onChangeText={setPhoneNumberLocal}
                    keyboardType="phone-pad"
                    placeholder="712345678"
                    placeholderTextColor={theme.colors.placeholder}
                  />
                </View>
              </View>
            </Card>

            {/* Truck Type */}
            <Card style={styles.card}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('profile.truck_type')}</Text>
              <View style={[styles.explanationContainer, { backgroundColor: theme.colors.secondary + '15' }]}>
                <Text style={[styles.explanation, { color: theme.colors.text }]}>
                  {t('auth.truck_explanation')}
                </Text>
              </View>
              <View style={styles.chipContainer}>
                {TRUCK_TYPES.map((truck) => (
                  <TouchableOpacity
                    key={truck.value}
                    style={[
                      styles.chip,
                      truckType === truck.value && {
                        backgroundColor: theme.colors.secondary,
                        borderColor: theme.colors.secondary,
                      },
                      { borderColor: theme.colors.border },
                    ]}
                    onPress={() => setTruckType(truck.value)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        truckType === truck.value && { color: '#FFF', fontWeight: '700' },
                        { color: theme.colors.text },
                      ]}
                    >
                      {truck.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            {/* Distance Unit */}
            <Card style={styles.card}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('profile.distance_unit')}</Text>
              <View style={[styles.explanationContainer, { backgroundColor: theme.colors.secondary + '15' }]}>
                <Text style={[styles.explanation, { color: theme.colors.text }]}>
                  Distance unit above search and notification radius.
                </Text>
              </View>
              <View style={styles.row}>
                {(['km', 'mi'] as const).map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    style={[
                      styles.optionButton,
                      distanceUnit === unit && {
                        backgroundColor: theme.colors.secondary,
                        borderColor: theme.colors.secondary,
                      },
                      { borderColor: theme.colors.border },
                    ]}
                    onPress={() => setDistanceUnit(unit)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        distanceUnit === unit && { color: '#FFF', fontWeight: '700' },
                        { color: theme.colors.text },
                      ]}
                    >
                      {unit === 'km' ? t('profile.unit_km') : t('profile.unit_mi')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            {/* Search Radius */}
            <Card style={styles.card}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('profile.search_radius')}</Text>
              <View style={[styles.explanationContainer, { backgroundColor: theme.colors.secondary + '15' }]}>
                <Text style={[styles.explanation, { color: theme.colors.text }]}>
                  So you can find leads and use quick search function in 1 tap.
                </Text>
              </View>
              <View style={styles.row}>
                {SEARCH_RADIUS_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      searchRadius === option.value && {
                        backgroundColor: theme.colors.secondary,
                        borderColor: theme.colors.secondary,
                      },
                      { borderColor: theme.colors.border },
                    ]}
                    onPress={() => setSearchRadius(option.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        searchRadius === option.value && { color: '#FFF', fontWeight: '700' },
                        { color: theme.colors.text },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            {/* Notification Radius */}
            <Card style={styles.card}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('profile.notification_radius')}</Text>
              <View style={[styles.explanationContainer, { backgroundColor: theme.colors.secondary + '15' }]}>
                <Text style={[styles.explanation, { color: theme.colors.text }]}>
                  So we don&apos;t spam you with notification with loads, just those around you.
                </Text>
              </View>
              <View style={styles.row}>
                {SEARCH_RADIUS_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={`notif-${option.value}`}
                    style={[
                      styles.optionButton,
                      notificationRadius === option.value && {
                        backgroundColor: theme.colors.secondary,
                        borderColor: theme.colors.secondary,
                      },
                      { borderColor: theme.colors.border },
                    ]}
                    onPress={() => setNotificationRadius(option.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        notificationRadius === option.value && { color: '#FFF', fontWeight: '700' },
                        { color: theme.colors.text },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            {/* Industries */}
            <Card style={styles.card}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('profile.preferred_industries')}</Text>
              <View style={[styles.explanationContainer, { backgroundColor: theme.colors.secondary + '15' }]}>
                <Text style={[styles.explanation, { color: theme.colors.text }]}>
                  So we can search for those if you don&apos;t manually write keywords industries.
                </Text>
              </View>
              <View style={styles.chipContainer}>
                {INDUSTRIES.map((industry) => {
                  const isSelected = selectedIndustries.includes(industry);
                  return (
                    <TouchableOpacity
                      key={industry}
                      style={[
                        styles.chip,
                        isSelected && {
                          backgroundColor: theme.colors.secondary,
                          borderColor: theme.colors.secondary,
                        },
                        { borderColor: theme.colors.border },
                      ]}
                      onPress={() => toggleIndustry(industry)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && { color: '#FFF', fontWeight: '700' },
                          { color: theme.colors.text },
                        ]}
                      >
                        {industry}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>

            <Button
              title={t('common.save_continue')}
              onPress={handleSave}
              loading={isLoading}
              variant="primary"
              style={styles.saveButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modals */}
      <SelectionModal
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        title={t('profile.language')}
        data={LANGUAGES}
        onSelect={(lang) => i18n.changeLanguage(lang.code)}
        renderItem={(lang) => (
          <Text style={[styles.modalItemText, { color: theme.colors.text }]}>
            {lang.flag} {lang.name}
          </Text>
        )}
      />

      <SelectionModal
        visible={showCountryModal}
        onClose={() => setShowCountryModal(false)}
        title="Select Country"
        data={PHONE_COUNTRIES}
        onSelect={(country) => setSelectedPhoneCountry(country.iso)}
        renderItem={(country) => (
          <Text style={[styles.modalItemText, { color: theme.colors.text }]}>
            {country.flag} {country.name} (+{country.dialCode})
          </Text>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  header: {
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: -20,
    zIndex: 0,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  content: { paddingHorizontal: 16, gap: 16 },
  card: { padding: 20, borderRadius: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  explanationContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF5722', // theme.colors.secondary
  },
  explanation: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  value: { fontSize: 16 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  inputGroup: { marginTop: 16 },
  phoneRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    height: 50,
    overflow: 'hidden',
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRightWidth: 1,
    gap: 4,
  },
  countryCodeText: { fontSize: 15, fontWeight: '500' },
  phoneInput: { flex: 1, paddingHorizontal: 12, fontSize: 16 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 14, fontWeight: '500' },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  optionButton: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  optionText: { fontSize: 14, fontWeight: '600' },
  saveButton: { marginTop: 24, marginBottom: 40 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  modalItem: { padding: 16, borderBottomWidth: 1 },
  modalItemText: { fontSize: 16 },
});

