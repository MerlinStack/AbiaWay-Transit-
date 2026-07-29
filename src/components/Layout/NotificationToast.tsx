import React from 'react';
import useNotificationStore from '../../stores/notificationStore';

const NotificationToast = () => {
  const notification = useNotificationStore((s) => s.notification);
  const hideNotification = useNotificationStore((s) => s.hideNotification);
  
  if (!notification.show) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="glass-card p-4 rounded-xl shadow-lg notification flex items-center space-x-3 min-w-80">
        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
          <i data-lucide="check" className="w-6 h-6 text-green-400"></i>
        </div>
        <div className="flex-1">
          <p className="font-semibold">{notification.title}</p>
          <p className="text-sm text-gray-400">{notification.message}</p>
        </div>
        <button onClick={hideNotification} className="text-gray-400 hover:text-white">
          <i data-lucide="x" className="w-5 h-5"></i>
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;