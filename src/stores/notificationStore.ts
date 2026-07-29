import { create } from 'zustand';

interface NotificationState {
  notification: { show: boolean; title: string; message: string; type?: string };
  showNotification: (title: string, message: string, type?: string) => void;
  hideNotification: () => void;
}

const useNotificationStore = create<NotificationState>((set) => {
  let timeoutId = null;

  return {
    notification: { show: false, title: '', message: '', type: 'info' },

    showNotification: (title, message, type = 'info') => {
      if (timeoutId) clearTimeout(timeoutId);
      set({ notification: { show: true, title, message, type } });
      timeoutId = setTimeout(() => {
        set({ notification: { show: false, title: '', message: '', type: 'info' } });
        timeoutId = null;
      }, 3000);
    },

    hideNotification: () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = null;
      set({ notification: { show: false, title: '', message: '' } });
    },
  };
});

export default useNotificationStore;
