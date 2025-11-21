import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Bell, Check, Trash2, X, Info, AlertTriangle, Gift, Search } from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useNotificationStore } from '@/store/notificationStore';
import { useAuthStore } from '@/store/authStore';
import { formatDistanceToNow } from 'date-fns';
import { enUS, ro, pl, tr, lt, es, it, de, fr, uk } from 'date-fns/locale';
import i18n from '@/lib/i18n';

const getLocale = () => {
  const lang = i18n.language;
  switch (lang) {
    case 'ro': return ro;
    case 'pl': return pl;
    case 'tr': return tr;
    case 'lt': return lt;
    case 'es': return es;
    case 'it': return it;
    case 'de': return de;
    case 'fr': return fr;
    case 'uk': return uk;
    default: return enUS;
  }
};

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { 
    notifications, 
    isLoading, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotificationStore();

  useEffect(() => {
    if (user?.id) {
      fetchNotifications(user.id);
    }
  }, [user?.id]);

  const handleNotificationPress = async (notification: any) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Handle navigation based on type
    if (notification.type === 'search_completed' && notification.data?.search_id) {
      // Navigate to search results? Or just open leads tab?
      // For now, let's go to leads tab
      router.push('/(tabs)/leads');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'search_completed':
        return <Search size={24} color={theme.colors.primary} />;
      case 'community_alert':
        return <AlertTriangle size={24} color={theme.colors.warning} />;
      case 'promotion':
        return <Gift size={24} color={theme.colors.secondary} />;
      case 'system':
      default:
        return <Info size={24} color={theme.colors.info} />;
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        { backgroundColor: item.is_read ? theme.colors.surface : theme.colors.primary + '08' }
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.background }]}>
        {getIcon(item.type)}
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.colors.text, fontWeight: item.is_read ? '600' : '700' }]}>
            {item.title}
          </Text>
          <Text style={[styles.time, { color: theme.colors.textSecondary }]}>
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: getLocale() })}
          </Text>
        </View>
        
        <Text style={[styles.message, { color: theme.colors.textSecondary }]} numberOfLines={2}>
          {item.message}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteNotification(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Trash2 size={18} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <View style={styles.headerLeft}>
          {notifications.length > 0 && (
            <TouchableOpacity onPress={() => user?.id && markAllAsRead(user.id)}>
              <Text style={[styles.markAllText, { color: theme.colors.primary }]}>
                {t('notifications.mark_all_read', 'Mark all read')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t('notifications.title', 'Notifications')}</Text>
        
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <X size={24} color={theme.colors.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => user?.id && fetchNotifications(user.id)}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Bell size={48} color={theme.colors.textSecondary} style={{ opacity: 0.5 }} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {t('notifications.empty', 'No notifications yet')}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    flex: 2,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    marginRight: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
});
