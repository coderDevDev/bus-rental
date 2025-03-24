import { supabase } from '@/lib/supabase/client';
import type { Ticket } from '@/types';

export const notificationService = {
  async subscribeToNotifications(userId: string) {
    // Request permission for push notifications
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Store subscription in database
        const { error } = await supabase
          .from('notification_subscriptions')
          .upsert([
            {
              user_id: userId,
              enabled: true,
              platform: 'web',
              created_at: new Date().toISOString()
            }
          ]);

        if (error) throw error;
      }
    }
  },

  async sendBoardingNotification(userId: string, ticket: Ticket) {
    // Check if user has notifications enabled
    const { data: subscription, error } = await supabase
      .from('notification_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('enabled', true)
      .single();

    if (error || !subscription) return;

    // Create notification
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: userId,
          type: 'boarding',
          title: 'Boarding Time',
          message: `Your bus for ${ticket.route?.from_location?.city} → ${ticket.route?.to_location?.city} is ready for boarding.`,
          data: { ticket_id: ticket.id },
          read: false
        }
      ]);

    if (notificationError) throw notificationError;

    // Show push notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Boarding Time', {
        body: `Your bus for ${ticket.route?.from_location?.city} → ${ticket.route?.to_location?.city} is ready for boarding.`,
        icon: '/icon.png'
      });
    }
  },

  async getUnreadNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
  }
};
