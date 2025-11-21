import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useTheme } from '@/lib/theme';
import { useNotificationStore } from '@/store/notificationStore';

interface NotificationBadgeProps {
  onPress: () => void;
  color?: string;
  size?: number;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  onPress, 
  color, 
  size = 24 
}) => {
  const { theme } = useTheme();
  const { unreadCount } = useNotificationStore();
  const iconColor = color || theme.colors.text;

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Bell size={size} color={iconColor} />
      {unreadCount > 0 && (
        <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
