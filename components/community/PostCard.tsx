import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  Image,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import * as SecureStore from 'expo-secure-store';
import {
  MapPin,
  Truck,
  Clock,
  Eye,
  Phone,
  Mail,
  MessageCircle,
  Bookmark,
  Navigation,
  Package,
  Building2,
} from 'lucide-react-native';
import { CommunityPost } from '../../types/community.types';
import { useAuthStore } from '../../store/authStore';
import { useCommunityStore } from '../../store/communityStore';
import { formatDistanceToNow } from 'date-fns';
import { enUS, ro, pl, tr, lt, es } from 'date-fns/locale';
import { UpgradePromptModal } from './UpgradePromptModal';
import { stripeService } from '../../services/stripeService';

const WHATSAPP_PREF_KEY = 'community_whatsapp_preferred_scheme_v2';

type WhatsAppOptionConfig = {
  id: 'whatsapp' | 'whatsapp-business';
  scheme: string;
  labelKey: string;
};

type WhatsAppPayload = {
  schemePhone: string;
  waPhone: string;
  message: string;
};

const WHATSAPP_SCHEMES: WhatsAppOptionConfig[] = [
  {
    id: 'whatsapp',
    scheme: 'whatsapp://send',
    labelKey: 'community.whatsapp_app_regular',
  },
  {
    id: 'whatsapp-business',
    scheme: 'whatsapp-business://send',
    labelKey: 'community.whatsapp_app_business',
  },
];

const buildWhatsAppUrl = (schemePrefix: string, phone: string, message: string) =>
  `${schemePrefix}?phone=${phone}&text=${encodeURIComponent(message)}`;

const storeWhatsAppPreference = async (value: string | null) => {
  try {
    if (value) {
      await SecureStore.setItemAsync(WHATSAPP_PREF_KEY, value);
    } else {
      await SecureStore.deleteItemAsync(WHATSAPP_PREF_KEY);
    }
  } catch {
    // Ignore persistence errors; preference is optional
  }
};

type WhatsAppOption = {
  id: 'whatsapp' | 'whatsapp-business';
  label: string;
};

interface PostCardProps {
  post: CommunityPost;
  onPress?: () => void;
  onUnsave?: () => void; // Callback after unsaving (for Hot Leads refresh)
}

export default function PostCard({ post, onPress, onUnsave }: PostCardProps) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user, profile, session, refreshProfile } = useAuthStore();
  const { savePost, unsavePost, recordContact, deletePost, postLimits } = useCommunityStore();
  
  // Use selector - Zustand will re-render when THIS SPECIFIC result changes
  const isSaved = useCommunityStore((state) => 
    state.savedPosts.some(p => p.id === post.id)
  );
  
  // Debug: Log when isSaved changes
  useEffect(() => {
    console.log(`[PostCard ${post.id.substring(0, 8)}] isSaved changed to:`, isSaved);
  }, [isSaved, post.id]);
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isProcessingUpgrade, setIsProcessingUpgrade] = useState(false);
  const [whatsAppPreference, setWhatsAppPreference] = useState<string | null>(null);
  const [isWhatsAppModalVisible, setIsWhatsAppModalVisible] = useState(false);
  const [availableWhatsAppOptions, setAvailableWhatsAppOptions] = useState<WhatsAppOption[]>([]);
  const pendingWhatsAppPayload = useRef<WhatsAppPayload | null>(null);
  
  // Cache buster for avatar images - generated once per component mount
  const [imageCacheBuster] = useState(() => Date.now());

  // Cache-busting for avatar URLs - use component mount timestamp
  // This ensures profile picture updates are visible when feed refreshes
  const getAvatarUrlWithCacheBusting = (avatarUrl: string | null | undefined): string | null => {
    if (!avatarUrl) return null;
    
    // Add cache buster query parameter to bypass React Native image cache
    const separator = avatarUrl.includes('?') ? '&' : '?';
    return `${avatarUrl}${separator}t=${imageCacheBuster}`;
  };

  const isOwnPost = user?.id === post.user_id;
  const isDriverAvailable = post.post_type === 'DRIVER_AVAILABLE';
  const viewerFullName = profile?.full_name || profile?.company_name || t('community.a_driver');
  const viewerCompany = profile?.company_name || profile?.full_name || viewerFullName;
  const contactCompany = post.profile?.company_name || post.profile?.full_name || t('community.user');
  const contactName = post.profile?.full_name || contactCompany;
  const routeLabel = post.dest_city ? `${post.origin_city} → ${post.dest_city}` : post.origin_city;
  const targetPhone = post.contact_phone || post.profile?.phone_number || '';
  const targetEmail = post.profile?.email || '';
  const viewerPhone = profile?.phone_number || '';
  const whatsappDisabled = isOwnPost || !targetPhone;
  const callDisabled = isOwnPost || !targetPhone;
  const emailDisabled = isOwnPost || !targetEmail;

  useEffect(() => {
    SecureStore.getItemAsync(WHATSAPP_PREF_KEY)
      .then((stored) => {
        if (stored) {
          setWhatsAppPreference(stored);
        }
      })
      .catch(() => {
        // Ignore storage read errors; we'll prompt for selection if needed
      });
  }, []);

  const recordWhatsAppContact = async () => {
    if (user) {
      await recordContact(post.id, user.id);
    }
    pendingWhatsAppPayload.current = null;
  };

  const openWhatsAppWithScheme = async (optionId: string, payload: WhatsAppPayload): Promise<boolean> => {
    const config = WHATSAPP_SCHEMES.find((item) => item.id === optionId);
    if (!config) {
      return false;
    }

    const url = buildWhatsAppUrl(config.scheme, payload.schemePhone, payload.message);

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        return false;
      }

      await Linking.openURL(url);
      return true;
    } catch (error) {
      console.error('WhatsApp scheme open error:', error);
      return false;
    }
  };

  const openWhatsAppFallback = async (payload: WhatsAppPayload): Promise<boolean> => {
    if (!payload.waPhone) {
      return false;
    }

    const fallbackUrl = `https://wa.me/${payload.waPhone}?text=${encodeURIComponent(payload.message)}`;

    try {
      const canOpenFallback = await Linking.canOpenURL(fallbackUrl);
      if (!canOpenFallback) {
        return false;
      }

      await Linking.openURL(fallbackUrl);
      return true;
    } catch {
      return false;
    }
  };

  const showWhatsAppChoice = () => {
    setAvailableWhatsAppOptions(
      WHATSAPP_SCHEMES.map((option) => ({
        id: option.id,
        label: t(option.labelKey),
      }))
    );
    setIsWhatsAppModalVisible(true);
  };

  const resetPreferenceAndOptionallyPrompt = (payload?: WhatsAppPayload) => {
    setWhatsAppPreference(null);
    storeWhatsAppPreference(null).catch(() => {
      // Preference reset failures are non-blocking
    });

    if (payload) {
      pendingWhatsAppPayload.current = payload;
      showWhatsAppChoice();
    }
  };

  const showWhatsAppUnavailableAlert = (payload: WhatsAppPayload) => {
    Alert.alert(
      t('community.whatsapp_unavailable_title'),
      t('community.whatsapp_unavailable_message'),
      [
        {
          text: t('community.whatsapp_change_preference'),
          onPress: () => resetPreferenceAndOptionallyPrompt(payload),
        },
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
      ]
    );
  };

  const handleWhatsAppModalClose = () => {
    setIsWhatsAppModalVisible(false);
    if (!whatsAppPreference) {
      pendingWhatsAppPayload.current = null;
    }
  };

  const handleWhatsAppOptionSelect = async (optionId: string) => {
    setIsWhatsAppModalVisible(false);
    const payload = pendingWhatsAppPayload.current;

    if (!payload) {
      return;
    }

    await storeWhatsAppPreference(optionId);
    setWhatsAppPreference(optionId);

    if (optionId === 'whatsapp-business') {
      Alert.alert(
        t('community.whatsapp_business_ios_title'),
        t('community.whatsapp_business_ios_message')
      );
    }

    const success = await openWhatsAppWithScheme(optionId, payload);

    if (success) {
      await recordWhatsAppContact();
      return;
    }

    const fallbackSuccess = await openWhatsAppFallback(payload);

    if (fallbackSuccess) {
      await recordWhatsAppContact();
      return;
    }

    showWhatsAppUnavailableAlert(payload);
  };

  // Get locale based on current language
  const getDateFnsLocale = () => {
    switch (i18n.language) {
      case 'ro': return ro;
      case 'pl': return pl;
      case 'tr': return tr;
      case 'lt': return lt;
      case 'es': return es;
      default: return enUS;
    }
  };

  // Format time ago
  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: getDateFnsLocale(),
  });

  // Helper function - post description
  const getPostDescription = (post: CommunityPost): string => {
    const templateKey = `community.post_descriptions.${post.template_key}`;
    return t(templateKey, { 
      origin: post.origin_city,
      dest: post.dest_city || '',
      defaultValue: t('community.post_available')
    });
  };

  const ensureCanContact = (): boolean => {
    if (!user) {
      Alert.alert(t('community.authentication_required'), t('community.must_be_logged_in'));
      return false;
    }

    if (profile?.subscription_tier === 'trial') {
      setShowUpgradeModal(true);
      return false;
    }

    return true;
  };

  // Handle contact actions
  const handleWhatsApp = async () => {
    if (!targetPhone) {
      Alert.alert(t('community.contact_unavailable'), t('community.phone_not_available'));
      return;
    }

    if (!ensureCanContact()) {
      return;
    }

    const templateKey = isDriverAvailable
      ? 'community.whatsapp_driver_available'
      : 'community.whatsapp_load_available';

    const message = t(templateKey, {
      myName: viewerFullName,
      myCompany: viewerCompany,
      theirName: contactName,
      origin: post.origin_city,
      dest: post.dest_city || t('community.destination'),
      route: routeLabel,
      defaultValue:
        post.post_type === 'DRIVER_AVAILABLE'
          ? `Salut ${contactName}! Sunt ${viewerFullName} de la ${viewerCompany}. Te contactez pentru disponibilitatea ta în zona ${post.origin_city}.`
          : `Salut ${contactName}! Sunt ${viewerFullName} de la ${viewerCompany}. Te contactez pentru cursa ${routeLabel}.`
    });

    const rawPhone = targetPhone.replace(/\s+/g, '');
    const hasCountryCode = rawPhone.startsWith('+');
    const numericPhone = rawPhone.replace(/[^0-9]/g, '');

    if (!hasCountryCode || numericPhone.length < 8) {
      Alert.alert(
        t('community.whatsapp_invalid_number_title'),
        t('community.whatsapp_invalid_number_message')
      );
      return;
    }

    const phoneForScheme = `+${numericPhone}`;
    const phoneForWa = numericPhone;

    if (!phoneForScheme || !phoneForWa) {
      Alert.alert(t('community.contact_unavailable'), t('community.phone_not_available'));
      return;
    }

    const payload: WhatsAppPayload = {
      schemePhone: phoneForScheme,
      waPhone: phoneForWa,
      message,
    };

    pendingWhatsAppPayload.current = payload;

    if (!whatsAppPreference) {
      showWhatsAppChoice();
      return;
    }

    const success = await openWhatsAppWithScheme(whatsAppPreference, payload);

    if (success) {
      await recordWhatsAppContact();
      return;
    }

    const fallbackSuccess = await openWhatsAppFallback(payload);

    if (fallbackSuccess) {
      await recordWhatsAppContact();
      return;
    }

    showWhatsAppUnavailableAlert(payload);
  };

  const handleEmail = async () => {
    if (!targetEmail) {
      Alert.alert(t('community.contact_unavailable'), t('community.email_not_available'));
      return;
    }

    if (!ensureCanContact()) {
      return;
    }

    // Record interaction
    if (user) {
      await recordContact(post.id, user.id);
    }

    const subjectKey = isDriverAvailable ? 'community.email_subject_driver' : 'community.email_subject_load';
    const bodyKey = isDriverAvailable ? 'community.email_body_driver' : 'community.email_body_load';

    const subject = t(subjectKey, {
      origin: post.origin_city,
      dest: post.dest_city || t('community.destination'),
      route: routeLabel,
      defaultValue:
        post.post_type === 'DRIVER_AVAILABLE'
          ? `Disponibilitate în ${post.origin_city}`
          : `Cursă ${routeLabel}`
    });

    const contactLine = viewerPhone
      ? t('community.email_contact_line', {
          phone: viewerPhone,
          defaultValue: `You can reach me at ${viewerPhone}.`
        })
      : '';

    const defaultBody =
      post.post_type === 'DRIVER_AVAILABLE'
        ? `Hello ${contactName},\n\nI'm ${viewerFullName} from ${viewerCompany}. I'm reaching out about your availability around ${post.origin_city}.\n\n${contactLine ? `${contactLine}\n\n` : ''}Best regards,\n${viewerFullName}`
        : `Hello ${contactName},\n\nI'm ${viewerFullName} from ${viewerCompany}. I'm interested in your route ${routeLabel}.\n\n${contactLine ? `${contactLine}\n\n` : ''}Best regards,\n${viewerFullName}`;

    const body = t(bodyKey, {
      myName: viewerFullName,
      myCompany: viewerCompany,
      theirName: contactName,
      origin: post.origin_city,
      dest: post.dest_city || t('community.destination'),
      route: routeLabel,
      contactLine,
      defaultValue: defaultBody,
    });

  const emailUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    try {
      const supported = await Linking.canOpenURL(emailUrl);
      if (!supported) {
        Alert.alert(t('community.error'), t('community.cannot_open_email'));
        return;
      }

      await Linking.openURL(emailUrl);
    } catch {
      Alert.alert(t('community.error'), t('community.cannot_open_email'));
    }
  };

  const handlePhone = async () => {
    if (!targetPhone) {
      Alert.alert(t('community.contact_unavailable'), t('community.phone_not_available'));
      return;
    }

    if (!ensureCanContact()) {
      return;
    }

    // Record interaction
    if (user) {
      await recordContact(post.id, user.id);
    }

  const phoneNumber = targetPhone.replace(/[^0-9+]/g, '');
    const phoneUrl = `tel:${phoneNumber}`;

    try {
      const supported = await Linking.canOpenURL(phoneUrl);
      if (!supported) {
        Alert.alert(t('community.error'), t('community.cannot_make_call'));
        return;
      }

      await Linking.openURL(phoneUrl);
    } catch {
      Alert.alert(t('community.error'), t('community.cannot_make_call'));
    }
  };

  const handleDelete = async () => {
    if (!user) return;

    Alert.alert(
      t('community.delete_post_title'),
      t('community.delete_post_message'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel'
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePost(post.id, user.id);
              Toast.show({
                type: 'success',
                text1: t('community.post_deleted_success'),
              });
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: t('community.delete_error'),
                text2: error.message,
              });
            }
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert(t('community.authentication_required'), t('community.must_be_logged_in'));
      return;
    }

    // Toggle: if already saved, unsave it; otherwise save it
    if (isSaved) {
      await unsavePost(post.id, user.id);
      onUnsave?.(); // Trigger callback for Hot Leads refresh
    } else {
      await savePost(post.id, user.id);
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {/* Avatar - Real image or initials */}
          {post.profile?.avatar_url ? (
            <Image 
              source={{ uri: getAvatarUrlWithCacheBusting(post.profile.avatar_url) || undefined }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {post.profile?.company_name?.charAt(0).toUpperCase() || 
                 post.profile?.full_name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          <View style={styles.userDetails}>
            {/* Company name with icon */}
            {post.profile?.company_name && (
              <View style={styles.companyRow}>
                <Building2 size={14} color="#111827" />
                <Text style={styles.companyName}>{post.profile.company_name}</Text>
              </View>
            )}
            
            {/* Driver name (smaller if company exists) */}
            <Text style={post.profile?.company_name ? styles.driverName : styles.userName}>
              {post.profile?.full_name || t('community.user')}
            </Text>
            
            {/* Truck type only (location moved to content section) */}
            {post.profile?.truck_type && (
              <View style={styles.truckRow}>
                <Truck size={14} color="#6B7280" />
                <Text style={styles.truckType}>{post.profile.truck_type}</Text>
              </View>
            )}
          </View>
        </View>
        {isOwnPost ? (
          <View style={styles.ownPostActions}>
            <View style={styles.ownBadge}>
              <Text style={styles.ownBadgeText}>{t('community.your_post')}</Text>
            </View>
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={handleDelete}
              accessibilityLabel={t('common.delete')}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.saveIconButton} 
            onPress={handleSave} 
            accessibilityLabel={isSaved ? t('community.unsave') : t('common.save')}
          >
            <Bookmark 
              size={18} 
              color={isSaved ? '#F59E0B' : '#6B7280'} 
              fill={isSaved ? '#F59E0B' : 'none'} 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.typeIndicator}>
          {isDriverAvailable ? (
            <>
              <Navigation size={16} color="#10B981" />
              <Text style={[styles.typeText, styles.availableText]}>{t('community.driver_available')}</Text>
            </>
          ) : (
            <>
              <Package size={16} color="#3B82F6" />
              <Text style={[styles.typeText, styles.routeText]}>{t('community.route_available')}</Text>
            </>
          )}
        </View>

        {/* LARGE Route Display - Origin → Destination OR Origin + Direction */}
        <View style={styles.routeDisplay}>
          {/* Origin city - always visible */}
          <View style={styles.originBadge}>
            <MapPin size={16} color="#10B981" fill="#10B981" />
            <Text style={styles.cityText}>{post.origin_city}</Text>
          </View>
          
          {/* Two-city route: Origin → Destination (horizontal) */}
          {post.dest_city && (
            <>
              <Text style={styles.routeArrow}>→</Text>
              <View style={styles.destBadge}>
                <MapPin size={16} color="#EF4444" fill="#EF4444" />
                <Text style={styles.cityText}>{post.dest_city}</Text>
              </View>
            </>
          )}
          
          {/* Directional route: Show direction badge BELOW origin (vertical) */}
          {!post.dest_city && post.template_key && ['north', 'south', 'east', 'west'].includes(post.template_key) && (
            <View style={styles.directionContainer}>
              <Text style={styles.directionLabel}>{t('community.desired_direction')}</Text>
              <View style={styles.directionBadge}>
                <Navigation size={14} color="#3B82F6" />
                <Text style={styles.directionText}>
                  {post.template_key === 'north' ? '⬆️ ' + t('directions.north') :
                   post.template_key === 'south' ? '⬇️ ' + t('directions.south') :
                   post.template_key === 'east' ? '➡️ ' + t('directions.east') :
                   '⬅️ ' + t('directions.west')}
                </Text>
              </View>
            </View>
          )}
        </View>

        <Text style={styles.description}>{getPostDescription(post)}</Text>

        {/* Metadata tags */}
        <View style={styles.tags}>
          {post.post_type === 'LOAD_AVAILABLE' && 'departure' in post.metadata && post.metadata.departure && (
            <View style={styles.tag}>
              <Clock size={12} color="#6B7280" />
              <Text style={styles.tagText}>
                {post.metadata.departure === 'now' ? t('community.now') :
                 post.metadata.departure === 'today' ? t('community.today') : 
                 t('community.tomorrow')}
              </Text>
            </View>
          )}
          {post.post_type === 'LOAD_AVAILABLE' && 'cargo_tons' in post.metadata && post.metadata.cargo_tons && (
            <View style={styles.tag}>
              <Package size={12} color="#6B7280" />
              <Text style={styles.tagText}>{post.metadata.cargo_tons}T</Text>
            </View>
          )}
          {post.post_type === 'LOAD_AVAILABLE' && 'price_per_km' in post.metadata && post.metadata.price_per_km && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{post.metadata.price_per_km} €/km</Text>
            </View>
          )}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.stats}>
          <Clock size={14} color="#9CA3AF" />
          <Text style={styles.statsText}>{timeAgo}</Text>
          <Text style={styles.separator}>•</Text>
          <Eye size={14} color="#9CA3AF" />
          <Text style={styles.statsText}>{post.view_count || 0}</Text>
          {post.contact_count > 0 && (
            <>
              <Text style={styles.separator}>•</Text>
              <MessageCircle size={14} color="#9CA3AF" />
              <Text style={styles.statsText}>{post.contact_count}</Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.contactRow}>
        <TouchableOpacity
          style={[styles.contactButton, styles.whatsappButton, whatsappDisabled && styles.contactButtonDisabled]}
          onPress={handleWhatsApp}
          disabled={whatsappDisabled}
        >
          <MessageCircle size={18} color="#FFFFFF" />
          <Text style={styles.contactButtonText}>{t('community.contact_whatsapp')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.contactButton, styles.callButton, callDisabled && styles.contactButtonDisabled]}
          onPress={handlePhone}
          disabled={callDisabled}
        >
          <Phone size={18} color="#FFFFFF" />
          <Text style={styles.contactButtonText}>{t('community.contact_call')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.contactButton, styles.emailButton, emailDisabled && styles.contactButtonDisabled]}
          onPress={handleEmail}
          disabled={emailDisabled}
        >
          <Mail size={18} color="#FFFFFF" />
          <Text style={styles.contactButtonText}>{t('community.contact_email')}</Text>
        </TouchableOpacity>
      </View>

      <UpgradePromptModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onViewPlans={() => {
          setShowUpgradeModal(false);
          router.push('/(tabs)/pricing');
        }}
        onUpgradeNow={async () => {
          if (!session?.access_token) {
            setShowUpgradeModal(false);
            Alert.alert(t('common.error'), t('community.upgrade_modal.auth_error'));
            return;
          }

          setIsProcessingUpgrade(true);

          try {
            const tiers = await stripeService.getAvailableSubscriptionTiers();
            const lowestTier = tiers.sort((a, b) => a.price - b.price)[0];

            if (!lowestTier?.stripe_price_id) {
              throw new Error(t('community.upgrade_modal.no_price'));
            }

            const { url } = await stripeService.createCheckoutSession(
              lowestTier.stripe_price_id,
              'subscription',
              'truxel://subscription-success',
              'truxel://subscription-cancelled',
              session.access_token
            );

            setShowUpgradeModal(false);
            await WebBrowser.openBrowserAsync(url);
            await refreshProfile();
          } catch (error: any) {
            console.error('Upgrade flow error:', error);
            Toast.show({
              type: 'error',
              text1: t('common.error'),
              text2: error?.message || t('community.upgrade_modal.generic_error'),
            });
          } finally {
            setIsProcessingUpgrade(false);
          }
        }}
        isProcessing={isProcessingUpgrade}
        trialPostsRemaining={postLimits?.posts_remaining_today}
      />

      <Modal
        visible={isWhatsAppModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleWhatsAppModalClose}
      >
        <TouchableWithoutFeedback onPress={handleWhatsAppModalClose}>
          <View style={styles.whatsAppModalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.whatsAppModalContent}>
                <Text style={styles.whatsAppModalTitle}>{t('community.whatsapp_choose_title')}</Text>
                <Text style={styles.whatsAppModalDescription}>
                  {t('community.whatsapp_choose_message')}
                </Text>
                {availableWhatsAppOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={styles.whatsAppModalOption}
                    onPress={() => handleWhatsAppOptionSelect(option.id)}
                  >
                    <Text style={styles.whatsAppModalOptionText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.whatsAppModalCancel}
                  onPress={handleWhatsAppModalClose}
                >
                  <Text style={styles.whatsAppModalCancelText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6B7280',
  },
  userDetails: {
    flex: 1,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  driverName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  location: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
  },
  separator: {
    marginHorizontal: 6,
    color: '#D1D5DB',
  },
  truckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  truckType: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
  },
  ownPostActions: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 6,
  },
  ownBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ownBadgeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  deleteButtonText: {
    fontSize: 16,
  },
  content: {
    marginBottom: 12,
  },
  typeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  availableText: {
    color: '#10B981',
  },
  routeText: {
    color: '#3B82F6',
  },
  routeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  originBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  destBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  directionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginTop: 4,
    alignSelf: 'stretch',
  },
  directionContainer: {
    width: '100%',
    marginTop: 4,
  },
  directionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  directionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E40AF',
  },
  cityText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  routeArrow: {
    fontSize: 20,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  description: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#6B7280',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
    gap: 12,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  statsText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  saveIconButton: {
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  contactButtonDisabled: {
    opacity: 0.5,
  },
  contactButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  callButton: {
    backgroundColor: '#3B82F6',
  },
  emailButton: {
    backgroundColor: '#6366F1',
  },
  whatsAppModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(17, 24, 39, 0.5)',
  },
  whatsAppModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    gap: 12,
  },
  whatsAppModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  whatsAppModalDescription: {
    fontSize: 14,
    color: '#4B5563',
  },
  whatsAppModalOption: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  whatsAppModalOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  whatsAppModalCancel: {
    paddingVertical: 12,
  },
  whatsAppModalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563EB',
    textAlign: 'center',
  },
});