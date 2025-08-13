import { ref } from 'vue';
import type { Notification } from '@/types/api';

const notifications = ref<Notification[]>([]);

export function useNotifications() {
  const addNotification = (notification: Omit<Notification, 'id'>): string => {
    const id = Date.now().toString();
    const newNotification: Notification = {
      id,
      duration: 5000,
      ...notification,
    };
    
    notifications.value.push(newNotification);
    
    setTimeout(() => {
      removeNotification(id);
    }, newNotification.duration);
    
    return id;
  };

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index > -1) {
      notifications.value.splice(index, 1);
    }
  };

  const showSuccess = (title: string, message: string) => {
    return addNotification({ type: 'success', title, message });
  };

  const showError = (title: string, message: string) => {
    return addNotification({ type: 'error', title, message });
  };

  const showInfo = (title: string, message: string) => {
    return addNotification({ type: 'info', title, message });
  };

  return {
    notifications: notifications.value,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showInfo,
  };
}