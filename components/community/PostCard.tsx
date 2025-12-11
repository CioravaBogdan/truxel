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
  MoreVertical,
} from 'lucide-react-native';
import { CommunityPost } from '../../types/community.types';
import { useAuthStore } from '../../store/authStore';
import { useCommunityStore } from '../../store/communityStore';
import { formatDistanceToNow } from 'date-fns';
import { enUS, ro, pl, tr, lt, es } from 'date-fns/locale';
import { UpgradePromptModal } from './UpgradePromptModal';
import { stripeService } from '../../services/stripeService';
import {
  safeOpenEmail,
  safeOpenPhone,
  showNativeModuleError
} from '@/utils/safeNativeModules';
import { useTheme } from '@/lib/theme';

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
  onAddToMyBook?: () => void; // Callback for converting to My Book lead
}

export default function PostCard({ post, onPress, onUnsave, onAddToMyBook }: PostCardProps) {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const router = useRouter();
  const { user, profile, session, refreshProfile } = useAuthStore();
  
  // ⚠️ DO NOT destructure Zustand functions - use getState() for imperative calls
  // Destructuring creates stale references that break after any set() call
  const postLimits = useCommunityStore((state) => state.postLimits);
  
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
      await useCommunityStore.getState().recordContact(post.id, user.id);
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
      await useCommunityStore.getState().recordContact(post.id, user.id);
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

    // Use safe wrapper to prevent iOS crashes
    const result = await safeOpenEmail(
      targetEmail,
      subject,
      body,
      t('community.cannot_open_email')
    );

    if (!result.success) {
      showNativeModuleError(
        t('community.error'),
        result.userMessage
      );
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
      await useCommunityStore.getState().recordContact(post.id, user.id);
    }

    // Use safe wrapper to prevent iOS crashes
    const result = await safeOpenPhone(
      targetPhone,
      t('community.cannot_make_call')
    );

    if (!result.success) {
      showNativeModuleError(
        t('community.error'),
        result.userMessage
      );
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
              await useCommunityStore.getState().deletePost(post.id, user.id);
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
      await useCommunityStore.getState().unsavePost(post.id, user.id);
      onUnsave?.(); // Trigger callback for Hot Leads refresh
    } else {
      await useCommunityStore.getState().savePost(post.id, user.id);
    }
  };

  const submitReport = async (reason: string) => {
    if (!user) return;
    try {
      await useCommunityStore.getState().reportPost(post.id, user.id, reason);
      Alert.alert(t('community.report_submitted_title'), t('community.report_submitted_message'));
    } catch (error) {
      Alert.alert(t('common.error'), t('community.report_failed'));
    }
  };

  const handleReport = () => {
    if (!user) {
      Alert.alert(t('community.authentication_required'), t('community.must_be_logged_in'));
      return;
    }

    Alert.alert(
      t('community.report_post_title'),
      t('community.report_post_message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('community.report_spam'), onPress: () => submitReport('spam') },
        { text: t('community.report_inappropriate'), onPress: () => submitReport('inappropriate') },
        { text: t('community.report_scam'), onPress: () => submitReport('scam') }
      ]
    );
  };

  const handleBlock = () => {
    if (!user) {
      Alert.alert(t('community.authentication_required'), t('community.must_be_logged_in'));
      return;
    }

    Alert.alert(
      t('community.block_user_title'),
      t('community.block_user_message', { name: contactName }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('community.block_confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await useCommunityStore.getState().blockUser(user.id, post.user_id);
              Toast.show({
                type: 'success',
                text1: t('community.user_blocked_success'),
              });
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: t('community.block_failed'),
              });
            }
          }
        }
      ]
    );
  };

  const showMenu = () => {
    Alert.alert(
      t('community.post_options'),
      undefined,
      [
        { text: t('community.report_post'), onPress: handleReport },
        { text: t('community.block_user'), onPress: handleBlock, style: 'destructive' },
        { text: t('common.cancel'), style: 'cancel' }
      ]
    );
  };

  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: theme.colors.card, borderColor: isDriverAvailable ? theme.colors.secondary : theme.colors.info }]} onPress={onPress} activeOpacity={0.7}>
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
            <View style={[styles.avatar, { backgroundColor: theme.colors.border }]}>
              <Text style={[styles.avatarText, { color: theme.colors.textSecondary }]}>
                {post.profile?.company_name?.charAt(0).toUpperCase() || 
                 post.profile?.full_name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          <View style={styles.userDetails}>
            {/* Company name with icon */}
            {post.profile?.company_name && (
              <View style={styles.companyRow}>
                <Building2 size={14} color={theme.colors.text} />
                <Text style={[styles.companyName, { color: theme.colors.text }]}>{post.profile.company_name}</Text>
              </View>
            )}
            
            {/* Driver name (smaller if company exists) */}
            <Text style={post.profile?.company_name ? [styles.driverName, { color: theme.colors.textSecondary }] : [styles.userName, { color: theme.colors.text }]}>
              {post.profile?.full_name || t('community.user')}
            </Text>
            
            {/* Truck type only (location moved to content section) */}
            {post.profile?.truck_type && (
              <View style={styles.truckRow}>
                <Truck size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.truckType, { color: theme.colors.textSecondary }]}>{post.profile.truck_type}</Text>
              </View>
            )}
          </View>
        </View>
        {isOwnPost ? (
          <View style={styles.ownPostActions}>
            <View style={[styles.ownBadge, { backgroundColor: theme.colors.background }]}>
              <Text style={[styles.ownBadgeText, { color: theme.colors.textSecondary }]}>{t('community.your_post')}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.deleteButton, { backgroundColor: theme.colors.error + '20', borderColor: theme.colors.error + '40' }]} 
              onPress={handleDelete}
              accessibilityLabel={t('common.delete')}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.actionsRow}>
            {/* Add to My Book Button */}
            {onAddToMyBook && (
              <TouchableOpacity 
                style={[styles.addToMyBookButton, { backgroundColor: theme.colors.warning, shadowColor: theme.colors.warning }]} 
                onPress={onAddToMyBook}
                accessibilityLabel={t('leads.add_to_mybook')}
              >
                <Package size={16} color="#FFF" />
                <Text style={styles.addToMyBookText}>{t('leads.add_to_mybook')}</Text>
              </TouchableOpacity>
            )}
            
            {/* Bookmark Icon */}
            <TouchableOpacity 
              style={[styles.saveIconButton, { backgroundColor: theme.colors.background }]} 
              onPress={handleSave} 
              accessibilityLabel={isSaved ? t('community.unsave') : t('common.save')}
            >
              <Bookmark 
                size={18} 
                color={isSaved ? theme.colors.warning : theme.colors.textSecondary} 
                fill={isSaved ? theme.colors.warning : 'none'} 
              />
            </TouchableOpacity>

            {/* Menu Button */}
            <TouchableOpacity 
              style={[styles.saveIconButton, { backgroundColor: theme.colors.background, marginLeft: 4 }]} 
              onPress={showMenu} 
              accessibilityLabel={t('common.options')}
            >
              <MoreVertical 
                size={18} 
                color={theme.colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.typeIndicator}>
          {isDriverAvailable ? (
            <>
              <Navigation size={16} color={theme.colors.secondary} />
              <Text style={[styles.typeText, { color: theme.colors.secondary }]}>{t('community.driver_available')}</Text>
            </>
          ) : (
            <>
              <Package size={16} color={theme.colors.info} />
              <Text style={[styles.typeText, { color: theme.colors.info }]}>{t('community.route_available')}</Text>
            </>
          )}
        </View>

        {/* LARGE Route Display - Origin → Destination OR Origin + Direction */}
        <View style={[styles.routeDisplay, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
          {/* Origin city - always visible */}
          <View style={[styles.originBadge, { backgroundColor: theme.colors.secondary + '20', borderColor: theme.colors.secondary + '40' }]}>
            <MapPin size={16} color={theme.colors.secondary} fill={theme.colors.secondary} />
            <Text style={[styles.cityText, { color: theme.colors.text }]}>{post.origin_city}</Text>
          </View>
          
          {/* Two-city route: Origin → Destination (horizontal) */}
          {post.dest_city && (
            <>
              <Text style={[styles.routeArrow, { color: theme.colors.textSecondary }]}>→</Text>
              <View style={[styles.destBadge, { backgroundColor: theme.colors.error + '20', borderColor: theme.colors.error + '40' }]}>
                <MapPin size={16} color={theme.colors.error} fill={theme.colors.error} />
                <Text style={[styles.cityText, { color: theme.colors.text }]}>{post.dest_city}</Text>
              </View>
            </>
          )}
          
          {/* Directional route: Show direction badge BELOW origin (vertical) */}
          {!post.dest_city && post.template_key && ['north', 'south', 'east', 'west'].includes(post.template_key) && (
            <View style={styles.directionContainer}>
              <Text style={[styles.directionLabel, { color: theme.colors.textSecondary }]}>{t('community.desired_direction')}</Text>
              <View style={[styles.directionBadge, { backgroundColor: theme.colors.secondary + '20', borderColor: theme.colors.secondary + '40' }]}>
                <Navigation size={14} color={theme.colors.secondary} />
                <Text style={[styles.directionText, { color: theme.colors.secondary }]}>
                  {post.template_key === 'north' ? '⬆️ ' + t('directions.north') :
                   post.template_key === 'south' ? '⬇️ ' + t('directions.south') :
                   post.template_key === 'east' ? '➡️ ' + t('directions.east') :
                   '⬅️ ' + t('directions.west')}
                </Text>
              </View>
            </View>
          )}
        </View>

        <Text style={[styles.description, { color: theme.colors.text }]}>{getPostDescription(post)}</Text>

        {/* Metadata tags */}
        <View style={styles.tags}>
          {post.post_type === 'LOAD_AVAILABLE' && 'departure' in post.metadata && post.metadata.departure && (
            <View style={[styles.tag, { backgroundColor: theme.colors.background }]}>
              <Clock size={12} color={theme.colors.textSecondary} />
              <Text style={[styles.tagText, { color: theme.colors.textSecondary }]}>
                {post.metadata.departure === 'now' ? t('community.now') :
                 post.metadata.departure === 'today' ? t('community.today') : 
                 t('community.tomorrow')}
              </Text>
            </View>
          )}
          {post.post_type === 'LOAD_AVAILABLE' && 'cargo_tons' in post.metadata && post.metadata.cargo_tons && (
            <View style={[styles.tag, { backgroundColor: theme.colors.background }]}>
              <Package size={12} color={theme.colors.textSecondary} />
              <Text style={[styles.tagText, { color: theme.colors.textSecondary }]}>{post.metadata.cargo_tons}T</Text>
            </View>
          )}
          {post.post_type === 'LOAD_AVAILABLE' && 'price_per_km' in post.metadata && post.metadata.price_per_km && (
            <View style={[styles.tag, { backgroundColor: theme.colors.background }]}>
              <Text style={[styles.tagText, { color: theme.colors.textSecondary }]}>{post.metadata.price_per_km} €/km</Text>
            </View>
          )}
        </View>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
        <View style={styles.stats}>
          <Clock size={14} color={theme.colors.textSecondary} />
          <Text style={[styles.statsText, { color: theme.colors.textSecondary }]}>{timeAgo}</Text>
          <Text style={[styles.separator, { color: theme.colors.border }]}>•</Text>
          <Eye size={14} color={theme.colors.textSecondary} />
          <Text style={[styles.statsText, { color: theme.colors.textSecondary }]}>{post.view_count || 0}</Text>
          {post.contact_count > 0 && (
            <>
              <Text style={[styles.separator, { color: theme.colors.border }]}>•</Text>
              <MessageCircle size={14} color={theme.colors.textSecondary} />
              <Text style={[styles.statsText, { color: theme.colors.textSecondary }]}>{post.contact_count}</Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.contactRow}>
        <TouchableOpacity
          style={[styles.contactButton, { backgroundColor: theme.colors.secondary }, whatsappDisabled && styles.contactButtonDisabled]}
          onPress={handleWhatsApp}
          disabled={whatsappDisabled}
        >
          <MessageCircle size={18} color="#FFFFFF" />
          <Text style={styles.contactButtonText}>{t('community.contact_whatsapp')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.contactButton, { backgroundColor: theme.colors.primary }, callDisabled && styles.contactButtonDisabled]}
          onPress={handlePhone}
          disabled={callDisabled}
        >
          <Phone size={18} color="#FFFFFF" />
          <Text style={styles.contactButtonText}>{t('community.contact_call')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.contactButton, { backgroundColor: '#6366F1' }, emailDisabled && styles.contactButtonDisabled]}
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
              <View style={[styles.whatsAppModalContent, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.whatsAppModalTitle, { color: theme.colors.text }]}>{t('community.whatsapp_choose_title')}</Text>
                <Text style={[styles.whatsAppModalDescription, { color: theme.colors.textSecondary }]}>
                  {t('community.whatsapp_choose_message')}
                </Text>
                {availableWhatsAppOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[styles.whatsAppModalOption, { backgroundColor: theme.colors.background }]}
                    onPress={() => handleWhatsAppOptionSelect(option.id)}
                  >
                    <Text style={[styles.whatsAppModalOptionText, { color: theme.colors.text }]}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.whatsAppModalCancel}
                  onPress={handleWhatsAppModalClose}
                >
                  <Text style={[styles.whatsAppModalCancelText, { color: theme.colors.primary }]}>{t('common.cancel')}</Text>
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
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
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
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  driverName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  location: {
    fontSize: 13,
    marginLeft: 4,
  },
  separator: {
    marginHorizontal: 6,
  },
  truckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  truckType: {
    fontSize: 13,
    marginLeft: 4,
  },
  ownPostActions: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 6,
  },
  ownBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ownBadgeText: {
    fontSize: 12,
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
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
    // color: '#10B981', // Handled inline
  },
  routeText: {
    // color: '#3B82F6', // Handled inline
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
    borderRadius: 10,
    borderWidth: 1,
  },
  originBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  destBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  directionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
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
    marginBottom: 6,
  },
  directionText: {
    fontSize: 15,
    fontWeight: '700',
  },
  cityText: {
    fontSize: 16,
    fontWeight: '700',
  },
  routeArrow: {
    fontSize: 20,
    fontWeight: '700',
  },
  description: {
    fontSize: 15,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  tagText: {
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
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
  },
  saveIconButton: {
    padding: 8,
    borderRadius: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addToMyBookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addToMyBookText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
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
    // backgroundColor: '#3B82F6', // Handled inline
  },
  emailButton: {
    // backgroundColor: '#6366F1', // Handled inline
  },
  whatsAppModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(17, 24, 39, 0.5)',
  },
  whatsAppModalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    gap: 12,
  },
  whatsAppModalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  whatsAppModalDescription: {
    fontSize: 14,
  },
  whatsAppModalOption: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  whatsAppModalOptionText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  whatsAppModalCancel: {
    paddingVertical: 12,
  },
  whatsAppModalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});