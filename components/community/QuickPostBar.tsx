import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Briefcase, Truck } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useCommunityStore } from '../../store/communityStore';
import { cityService } from '../../services/cityService';
import {
  AVAILABILITY_TEMPLATES,
  ROUTE_TEMPLATES,
  PostTemplate,
  CreatePostData,
} from '../../types/community.types';
import TemplateSelector from './TemplateSelector';
import CitySearchModal from './CitySearchModal';
import Toast from 'react-native-toast-message';

function QuickPostBar() {
  const { t } = useTranslation();
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
        Alert.alert(
          t('community.post_limit_reached'),
          currentLimits.reason || t('community.post_limit_message'),
          [
            { text: 'OK', style: 'cancel' },
            { text: t('common.upgrade'), onPress: () => {/* Navigate to pricing */} }
          ]
        );
        return;
      }

      // TIMING WARNING for I HAVE LOAD - Only for active shipments
      if (type === 'route') {
        Alert.alert(
          t('community.load_timing_warning_title'),
          t('community.load_timing_warning_message'),
          [
            { 
              text: t('common.cancel'), 
              style: 'cancel',
              onPress: () => console.log('❌ User cancelled - not posting load')
            },
            { 
              text: t('community.continue_posting'), 
              onPress: () => {
                console.log('✅ User confirmed - opening template modal');
                setSelectedPostType(type);
                setShowTemplateModal(true);
              }
            }
          ]
        );
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
        Alert.alert(
          t('community.location_required'),
          t('community.location_required_message'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('community.select_city_manually'), onPress: () => setShowCityModal(true) }
          ]
        );
        setIsGettingLocation(false);
        return;
      }

      const majorCityName = location.nearestMajorCityName || location.nearestMajorCity?.name || location.city;
      const baseCity = location.locality || location.city || majorCityName || 'Unknown';

      let distanceDescriptor = '';
      if (location.distanceToMajor && location.distanceToMajor >= 5 && majorCityName) {
        const distance = Math.round(location.distanceToMajor);
        if (location.directionFromMajor && distance >= 30) {
          const directionText = t(location.directionFromMajor);
          distanceDescriptor = `${distance}km ${directionText} ${t('directions.of')} ${majorCityName}`;
        } else {
          distanceDescriptor = `${distance}km ${t('directions.of')} ${majorCityName}`;
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
  origin_city: baseCity, // Use clean city name, not formatted display text
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
        Alert.alert(
          t('community.location_required'),
          t('community.location_required_message'),
          [
            { text: t('common.cancel'), style: 'cancel' }
          ]
        );
        setIsGettingLocation(false);
        return;
      }

      const majorCityName = location.nearestMajorCityName || location.nearestMajorCity?.name || location.city;
      const baseCity = location.locality || location.city || majorCityName || 'Unknown';

      let distanceDescriptor = '';
      if (location.distanceToMajor && location.distanceToMajor >= 5 && majorCityName) {
        const distance = Math.round(location.distanceToMajor);
        if (location.directionFromMajor && distance >= 30) {
          const directionText = t(location.directionFromMajor);
          distanceDescriptor = `${distance}km ${directionText} ${t('directions.of')} ${majorCityName}`;
        } else {
          distanceDescriptor = `${distance}km ${t('directions.of')} ${majorCityName}`;
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
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>
            {isGettingLocation ? t('community.getting_location') : t('community.posting')}
          </Text>
        </View>
      </View>
    );
  }

  // Debug logging (can be removed in production)
  // console.log('🎬 QuickPostBar render:', { 
  //   showTemplateModal, 
  //   showCityModal, 
  //   selectedPostType,
  //   hasTemplates: selectedPostType === 'availability' ? AVAILABILITY_TEMPLATES.length : ROUTE_TEMPLATES.length
  // });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('community.quick_post')}</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.postButton, styles.availabilityButton]}
          onPress={() => handlePostTypeSelect('availability')}
        >
          <Briefcase color="white" size={32} />
          <Text style={styles.buttonTitle}>{t('community.i_am').toUpperCase()}</Text>
          <Text style={styles.buttonTitle}>{t('community.available').toUpperCase()}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.postButton, styles.routeButton]}
          onPress={() => handlePostTypeSelect('route')}
        >
          <Truck color="white" size={32} />
          <Text style={styles.buttonTitle}>{t('community.i_have').toUpperCase()}</Text>
          <Text style={styles.buttonTitle}>{t('community.load').toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      {postLimits && (
        <View style={styles.limitsContainer}>
          <Text style={styles.limitsText}>
            {postLimits.posts_remaining_today} {t('community.posts_remaining_today')} •
            {postLimits.posts_remaining_month} {t('community.posts_remaining_month')}
          </Text>
          {postLimits.tier === 'trial' && (
            <TouchableOpacity>
              <Text style={styles.upgradeText}>{t('community.upgrade_for_more')} →</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

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
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
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
    backgroundColor: '#10B981',
  },
  routeButton: {
    backgroundColor: '#3B82F6',
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
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  limitsText: {
    fontSize: 12,
    color: '#6B7280',
  },
  upgradeText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
  },
});

export default React.memo(QuickPostBar);