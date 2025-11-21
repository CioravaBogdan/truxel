import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Notification } from '@/types/database.types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  
  fetchNotifications: (userId: string) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  subscribeToNotifications: (userId: string) => () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async (userId: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const notifications = data as Notification[];
      const unreadCount = notifications.filter(n => !n.is_read).length;

      set({ notifications, unreadCount, isLoading: false });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      set({ isLoading: false });
    }
  },

  markAsRead: async (notificationId: string) => {
    // Optimistic update
    const { notifications } = get();
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, is_read: true } : n
    );
    const unreadCount = updatedNotifications.filter(n => !n.is_read).length;
    
    set({ notifications: updatedNotifications, unreadCount });

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert on error would go here, but for read status it's low risk
    }
  },

  markAllAsRead: async (userId: string) => {
    // Optimistic update
    const { notifications } = get();
    const updatedNotifications = notifications.map(n => ({ ...n, is_read: true }));
    
    set({ notifications: updatedNotifications, unreadCount: 0 });

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  },

  deleteNotification: async (notificationId: string) => {
    // Optimistic update
    const { notifications } = get();
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    const unreadCount = updatedNotifications.filter(n => !n.is_read).length;
    
    set({ notifications: updatedNotifications, unreadCount });

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  },

  subscribeToNotifications: (userId: string) => {
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const { notifications } = get();
          
          if (payload.eventType === 'INSERT') {
            const newNotification = payload.new as Notification;
            set({ 
              notifications: [newNotification, ...notifications],
              unreadCount: get().unreadCount + 1 
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedNotification = payload.new as Notification;
            const updatedList = notifications.map(n => 
              n.id === updatedNotification.id ? updatedNotification : n
            );
            const unreadCount = updatedList.filter(n => !n.is_read).length;
            set({ notifications: updatedList, unreadCount });
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id;
            const updatedList = notifications.filter(n => n.id !== deletedId);
            const unreadCount = updatedList.filter(n => !n.is_read).length;
            set({ notifications: updatedList, unreadCount });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));
