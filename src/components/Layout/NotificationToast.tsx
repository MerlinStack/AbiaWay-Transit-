import React from 'react';
import useNotificationStore from '../../stores/notificationStore';
import { Check, X } from 'lucide-react';

const NotificationToast = () => {
  const notification = useNotificationStore((s) => s.notification);
  const hideNotification = useNotificationStore((s) => s.hideNotification);
  
  if (!notification.show) return null;
  
  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 flex justify-end pointer-events-none">
      <div className="glass-card p-4 rounded-xl shadow-lg notification flex items-center space-x-3 w-full sm:w-auto sm:min-w-80 min-w-0 pointer-events-auto">
        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center shrink-0">
          <Check className="w-6 h-6 text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{notification.title}</p>
          <p className="text-sm text-gray-400 truncate">{notification.message}</p>
        </div>
        <button onClick={hideNotification} className="text-gray-400 hover:text-white shrink-0">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;