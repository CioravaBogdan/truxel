import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Briefcase, Truck } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useCommunityStore } from '../../store/communityStore';
import { cityService } from '../../services/cityService';
import { convertDistance } from '../../utils/distance';
import {
  AVAILABILITY_TEMPLATES,
  ROUTE_TEMPLATES,
  PostTemplate,
  CreatePostData,
} from '../../types/community.types';
import TemplateSelector from './TemplateSelector';
import CitySearchModal from './CitySearchModal';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../lib/theme';

function QuickPostBar() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user, profile } = useAuthStore();
  const { 
    createPost, 
    isCreatingPost, 
    checkPostLimits, 
    postLimits,
    showTemplateModal,
    showCityModal,
    selectedPostType,
    selectedTemplate,
    setShowTemplateModal,
    setShowCityModal,
    setSelectedPostType,
    setSelectedTemplate,
  } = useCommunityStore();

  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSelectingOrigin, setIsSelectingOrigin] = useState(false); // For Template 2 & 3
  const [originCity, setOriginCity] = useState<any>(null); // Store selected FROM city for Template 2 & 3
  const [showTimingWarning, setShowTimingWarning] = useState(false); // Web confirmation modal

  // Check if user can post
  const handlePostTypeSelect = async (type: 'availability' | 'route') => {
    console.log('🔵 QuickPostBar: Button pressed -', type);
    
    if (!user) {
      console.log('❌ No user found');
      Toast.show({
        type: 'error',
        text1: 'Autentificare necesară',
        text2: 'Trebuie să fii autentificat pentru a posta',
      });
      return;
    }

    console.log('✅ User found:', user.id);

    try {
      // Check limits and wait for response
      console.log('🔄 Checking post limits...');
      await checkPostLimits(user.id);

      // Get updated limits from store
      const currentLimits = useCommunityStore.getState().postLimits;
      console.log('📊 Post limits:', currentLimits);

      if (currentLimits && !currentLimits.can_post) {
        console.log('⛔ Cannot post - limits reached');
        
        // WEB: Use Toast instead of Alert
        Toast.show({
          type: 'error',
          text1: t('community.post_limit_reached'),
          text2: currentLimits.reason || t('community.post_limit_message'),
          visibilityTime: 5000,
          position: 'top',
        });
        
        // Optional: Show upgrade hint after 2 seconds
        setTimeout(() => {
          Toast.show({
            type: 'info',
            text1: t('common.upgrade'),
            text2: t('community.upgrade_for_more'),
            visibilityTime: 4000,
            position: 'top',
          });
        }, 2000);
        
        return;
      }

      // TIMING WARNING for I HAVE LOAD - Only for active shipments
      if (type === 'route') {
        // WEB: Show custom modal instead of Alert
        setSelectedPostType(type);
        setShowTimingWarning(true);
        return;
      }

      console.log('✅ Can post - opening template modal');
      setSelectedPostType(type);
      setShowTemplateModal(true);
      
      // Verify state was set
      console.log('🎭 Modal state set:', { 
        selectedPostType: type, 
        showTemplateModal: true 
      });
    } catch (error) {
      console.error('❌ Error checking post limits:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('community.post_limit_check_error'),
      });
    }
  };

  // Handle timing warning confirmation (web only)
  const handleTimingWarningConfirm = () => {
    console.log('✅ User confirmed - opening template modal');
    setShowTimingWarning(false);
    setShowTemplateModal(true);
  };

  const handleTimingWarningCancel = () => {
    console.log('❌ User cancelled - not posting load');
    setShowTimingWarning(false);
    setSelectedPostType(null);
  };

  // Handle template selection
  const handleTemplateSelect = (template: PostTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateModal(false);

    // Template flow logic:
    // 1. Template "loaded" (cargo ready today): GPS → TO city (shipper has cargo at their location)
    // 2. Template "empty" (need pickup from): FROM city → GPS (shipper needs pickup from another city)
    // 3. Template "return" (custom route): FROM city → TO city (full flexibility, no GPS)
    // 4. Template "custom" (driver custom route): FROM city → TO city (same as return but for DRIVER_AVAILABLE)

    if (template.key === 'loaded') {
      // Template 1: GPS → Select TO city (current flow works)
      setShowCityModal(true);
    } else if (template.key === 'empty') {
      // Template 2: Select FROM city first → then GPS becomes TO
      setIsSelectingOrigin(true);
      setShowCityModal(true);
    } else if (template.key === 'return' || template.key === 'custom') {
      // Template 3 & 4: Select FROM city → then TO city (2-step)
      setIsSelectingOrigin(true);
      setShowCityModal(true);
    } else {
      // Fallback for DRIVER_AVAILABLE - post directly with GPS
      createPostWithLocation(template);
    }
  };

  // Create post with current location
  const createPostWithLocation = async (template: PostTemplate, destCity?: any) => {
    setIsGettingLocation(true);

    try {
      // Get current location
      const location = await cityService.getCurrentLocationCity();

      if (!location) {
        // WEB: Use Toast instead of Alert
        Toast.show({
          type: 'error',
          text1: t('community.location_required'),
          text2: t('community.location_required_message'),
          visibilityTime: 5000,
        });
        
        setTimeout(() => {
          setShowCityModal(true);
        }, 1000);
        
        setIsGettingLocation(false);
        return;
      }

      const majorCityName = location.nearestMajorCityName || location.nearestMajorCity?.name || location.city;
      const baseCity = location.locality || location.city || majorCityName || 'Unknown';

      // Convert distance to user's preferred unit (km or mi)
      const distanceUnit = profile?.preferred_distance_unit || 'km';
      
      let distanceDescriptor = '';
      if (location.distanceToMajor && location.distanceToMajor >= 5 && majorCityName) {
        const distanceInKm = location.distanceToMajor;
        const convertedDistance = Math.round(convertDistance(distanceInKm, distanceUnit));
        
        if (location.directionFromMajor && distanceInKm >= 30) {
          const directionText = t(location.directionFromMajor);
          distanceDescriptor = `${convertedDistance}${distanceUnit} ${directionText} ${t('directions.of')} ${majorCityName}`;
        } else {
          distanceDescriptor = `${convertedDistance}${distanceUnit} ${t('directions.of')} ${majorCityName}`;
        }
      }

      const formattedCity = distanceDescriptor ? `${baseCity} - ${distanceDescriptor}` : baseCity;

      // Send location to N8N for analytics (fire-and-forget - instant return)
      cityService.sendLocationToWebhook({
        latitude: location.latitude,
        longitude: location.longitude,
        nearestCityId: location.nearestMajorCityId || location.nearestMajorCity?.id,
        nearestCityName: majorCityName,
        distance: location.distanceToMajor,
        userId: user?.id,
        timestamp: new Date().toISOString(),
        resolvedCity: baseCity,
        resolvedCountry: location.country,
        region: location.region,
        formattedLocation: formattedCity,
      });

      // Prepare post data
      const postData: CreatePostData = {
        post_type: template.type,
        template_key: template.key,
        origin_lat: location.latitude,
        origin_lng: location.longitude,
        origin_city: formattedCity, // Keep full formatted display text
        origin_country: location.country || location.nearestMajorCity?.country_name || 'RO',
        contact_phone: profile?.phone_number,
        contact_whatsapp: true,
        metadata: {},
      };

      // Add metadata based on template
      if (template.type === 'DRIVER_AVAILABLE') {
        postData.metadata = {
          truck_type: profile?.truck_type || 'Standard',
          direction: template.key as any,
          available_hours: 24,
        };
      } else if (template.type === 'LOAD_AVAILABLE') {
        postData.metadata = {
          departure: template.key as any,
          truck_type_required: profile?.truck_type,
        };

        // Add destination for routes
        if (destCity) {
          postData.dest_city = destCity.name;
          postData.dest_country = destCity.country_name;
          postData.dest_lat = destCity.lat;
          postData.dest_lng = destCity.lng;
        }
      }

      // Create the post
      await createPost(user!.id, postData);

      Toast.show({
        type: 'success',
        text1: t('community.post_created_success'),
        text2: t('community.post_visible_in_feed'),
      });

      // Reset state
      setSelectedPostType(null);
      setSelectedTemplate(null);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: t('community.post_error'),
        text2: error.message || t('community.post_error_message'),
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Template 2 "empty": Create post with origin city → GPS destination
  const createPostWithOriginCity = async (template: PostTemplate, fromCity: any) => {
    setIsGettingLocation(true);

    try {
      // Get current GPS location for destination
      const location = await cityService.getCurrentLocationCity();

      if (!location) {
        // WEB: Use Toast instead of Alert
        Toast.show({
          type: 'error',
          text1: t('community.location_required'),
          text2: t('community.location_required_message'),
          visibilityTime: 5000,
        });
        setIsGettingLocation(false);
        return;
      }

      const majorCityName = location.nearestMajorCityName || location.nearestMajorCity?.name || location.city;
      const baseCity = location.locality || location.city || majorCityName || 'Unknown';

      // Convert distance to user's preferred unit (km or mi)
      const distanceUnit = profile?.preferred_distance_unit || 'km';
      
      let distanceDescriptor = '';
      if (location.distanceToMajor && location.distanceToMajor >= 5 && majorCityName) {
        const distanceInKm = location.distanceToMajor;
        const convertedDistance = Math.round(convertDistance(distanceInKm, distanceUnit));
        
        if (location.directionFromMajor && distanceInKm >= 30) {
          const directionText = t(location.directionFromMajor);
          distanceDescriptor = `${convertedDistance}${distanceUnit} ${directionText} ${t('directions.of')} ${majorCityName}`;
        } else {
          distanceDescriptor = `${convertedDistance}${distanceUnit} ${t('directions.of')} ${majorCityName}`;
        }
      }

      const formattedCity = distanceDescriptor ? `${baseCity} - ${distanceDescriptor}` : baseCity;

      // Send location to N8N
      cityService.sendLocationToWebhook({
        latitude: location.latitude,
        longitude: location.longitude,
        nearestCityId: location.nearestMajorCityId || location.nearestMajorCity?.id,
        nearestCityName: majorCityName,
        distance: location.distanceToMajor,
        userId: user?.id,
        timestamp: new Date().toISOString(),
        resolvedCity: baseCity,
        resolvedCountry: location.country,
        region: location.region,
        formattedLocation: formattedCity,
      });

      // Prepare post data: origin = selected city, destination = GPS
      const postData: CreatePostData = {
        post_type: template.type,
        template_key: template.key,
        origin_lat: fromCity.lat,
        origin_lng: fromCity.lng,
        origin_city: fromCity.name,
        origin_country: fromCity.country_name,
        dest_lat: location.latitude,
        dest_lng: location.longitude,
        dest_city: formattedCity,
        dest_country: location.country || location.nearestMajorCity?.country_name || 'RO',
        contact_phone: profile?.phone_number,
        contact_whatsapp: true,
        metadata: {
          departure: template.key as any,
          truck_type_required: profile?.truck_type,
        },
      };

      // Create the post
      await createPost(user!.id, postData);

      Toast.show({
        type: 'success',
        text1: t('community.post_created_success'),
        text2: t('community.post_visible_in_feed'),
      });

      // Reset state
      setSelectedPostType(null);
      setSelectedTemplate(null);
      setOriginCity(null);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: t('community.post_error'),
        text2: error.message || t('community.post_error_message'),
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Template 3 "return": Create post with FROM city → TO city (no GPS)
  const createPostWithBothCities = async (template: PostTemplate, fromCity: any, toCity: any) => {
    setIsGettingLocation(true);

    try {
      // Prepare post data: origin + destination both user-selected
      const postData: CreatePostData = {
        post_type: template.type,
        template_key: template.key,
        origin_lat: fromCity.lat,
        origin_lng: fromCity.lng,
        origin_city: fromCity.name,
        origin_country: fromCity.country_name,
        dest_lat: toCity.lat,
        dest_lng: toCity.lng,
        dest_city: toCity.name,
        dest_country: toCity.country_name,
        contact_phone: profile?.phone_number,
        contact_whatsapp: true,
        metadata: {
          departure: template.key as any,
          truck_type_required: profile?.truck_type,
        },
      };

      // Create the post
      await createPost(user!.id, postData);

      Toast.show({
        type: 'success',
        text1: t('community.post_created_success'),
        text2: t('community.post_visible_in_feed'),
      });

      // Reset state
      setSelectedPostType(null);
      setSelectedTemplate(null);
      setOriginCity(null);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: t('community.post_error'),
        text2: error.message || t('community.post_error_message'),
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Handle city selection for destinations
  const handleCitySelect = async (city: any) => {
    setShowCityModal(false);

    if (!selectedTemplate) return;

    // Template 1 "loaded": GPS → TO city (current location is origin, selected city is destination)
    if (selectedTemplate.key === 'loaded') {
      await createPostWithLocation(selectedTemplate, city);
      return;
    }

    // Template 2 "empty": FROM city → GPS (selected city is origin, current location is destination)
    if (selectedTemplate.key === 'empty') {
      if (isSelectingOrigin) {
        // Store origin and create post with GPS as destination
        setOriginCity(city);
        setIsSelectingOrigin(false);
        await createPostWithOriginCity(selectedTemplate, city);
      }
      return;
    }

    // Template 3 "return" & Template 4 "custom": FROM city → TO city (2-step selection)
    if (selectedTemplate.key === 'return' || selectedTemplate.key === 'custom') {
      if (isSelectingOrigin) {
        // Store origin and ask for destination
        setOriginCity(city);
        setIsSelectingOrigin(false);
        setShowCityModal(true); // Open modal again for TO city
      } else {
        // Already have origin, now we have destination - create post
        await createPostWithBothCities(selectedTemplate, originCity, city);
      }
      return;
    }

    // Fallback for DRIVER_AVAILABLE
    await createPostWithLocation(selectedTemplate, city);
  };

  if (isCreatingPost || isGettingLocation) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.card, shadowColor: theme.shadows.small.shadowColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            {isGettingLocation ? t('community.getting_location') : t('community.posting')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, shadowColor: theme.shadows.small.shadowColor }]}>
      <Text style={[styles.title, { color: theme.colors.textSecondary }]}>{t('community.quick_post')}</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.postButton, { backgroundColor: theme.colors.secondary }]}
          onPress={() => handlePostTypeSelect('availability')}
        >
          <Briefcase color="white" size={32} />
          <Text style={styles.buttonTitle}>{t('community.i_am').toUpperCase()}</Text>
          <Text style={styles.buttonTitle}>{t('community.available').toUpperCase()}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.postButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => handlePostTypeSelect('route')}
        >
          <Truck color="white" size={32} />
          <Text style={styles.buttonTitle}>{t('community.i_have').toUpperCase()}</Text>
          <Text style={styles.buttonTitle}>{t('community.load').toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      {postLimits && (
        <View style={[styles.limitsContainer, { borderTopColor: theme.colors.border }]}>
          <Text style={[styles.limitsText, { color: theme.colors.textSecondary }]}>
            {postLimits.posts_remaining_today} {t('community.posts_remaining_today')} •
            {postLimits.posts_remaining_month} {t('community.posts_remaining_month')}
          </Text>
          {postLimits.tier === 'trial' && (
            <TouchableOpacity>
              <Text style={[styles.upgradeText, { color: theme.colors.primary }]}>{t('community.upgrade_for_more')} →</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Timing Warning Modal (Web replacement for Alert) */}
      <Modal
        visible={showTimingWarning}
        animationType="fade"
        transparent={true}
        onRequestClose={handleTimingWarningCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.warningModal, { backgroundColor: theme.colors.card, shadowColor: theme.shadows.small.shadowColor }]}>
            <Text style={[styles.warningTitle, { color: theme.colors.text }]}>
              {t('community.load_timing_warning_title')}
            </Text>
            <Text style={[styles.warningMessage, { color: theme.colors.textSecondary }]}>
              {t('community.load_timing_warning_message')}
            </Text>
            <View style={styles.warningButtons}>
              <TouchableOpacity
                style={[styles.warningButton, { backgroundColor: theme.colors.background }]}
                onPress={handleTimingWarningCancel}
              >
                <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.warningButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleTimingWarningConfirm}
              >
                <Text style={styles.confirmButtonText}>{t('community.continue_posting')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Template Selector Modal */}
      <Modal
        visible={showTemplateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTemplateModal(false)}
      >
        <TemplateSelector
          templates={selectedPostType === 'availability' ? AVAILABILITY_TEMPLATES : ROUTE_TEMPLATES}
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplateModal(false)}
        />
      </Modal>

      {/* City Search Modal */}
      <Modal
        visible={showCityModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowCityModal(false)}
      >
        <CitySearchModal
          onSelect={handleCitySelect}
          onClose={() => setShowCityModal(false)}
          selectionContext={isSelectingOrigin ? 'origin' : 'destination'}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  postButton: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  availabilityButton: {
    // Removed hardcoded color
  },
  routeButton: {
    // Removed hardcoded color
  },
  buttonTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  limitsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  limitsText: {
    fontSize: 12,
  },
  upgradeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  // Web-specific modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  warningModal: {
    borderRadius: 12,
    padding: 24,
    maxWidth: 400,
    width: '100%',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  warningMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  warningButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  warningButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    // Removed hardcoded color
  },
  confirmButton: {
    // Removed hardcoded color
  },
  cancelButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default React.memo(QuickPostBar);
