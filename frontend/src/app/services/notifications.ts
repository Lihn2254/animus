import { fetchWithAuth } from '@/app/lib/fetchWithAuth';
import { NotificationItem } from '@/app/types/notification';

export interface NotificationsResponse {
  count: number;
  notifications: NotificationItem[];
}

export const getNotifications = async (): Promise<NotificationsResponse> => {
  const response = await fetchWithAuth('/notifications');
  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }
  return response.json();
};

export const markNotificationAsRead = async (id: number): Promise<void> => {
  const response = await fetchWithAuth(`/notifications/${id}/read`, {
    method: 'PUT',
  });
  if (!response.ok) {
    throw new Error('Failed to mark notification as read');
  }
};
