import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import React from 'react';
import useNotificationStore from '../../stores/notificationStore';

const NotificationsModal = ({ isOpen, onClose }) => {
  const showNotification = useNotificationStore((s) => s.showNotification);

  if (!isOpen) return null;

  const notifications = [
    {
      id: 1,
      title: 'Route Delay Alert',
      message: 'Osisioma to Park route experiencing 10 min delay',
      time: '5 min ago',
      type: 'warning'
    },
    {
      id: 2,
      title: 'Weather Alert',
      message: 'Heavy rain expected at 6 PM. Please carry an umbrella.',
      time: '1 hour ago',
      type: 'info'
    },
    {
      id: 3,
      title: 'Maintenance Notice',
      message: 'Bus #AB-105 undergoing routine maintenance',
      time: '3 hours ago',
      type: 'info'
    },
    {
      id: 4,
      title: 'Promotion',
      message: 'Weekend special: 25% off on all express rides',
      time: 'Yesterday',
      type: 'success'
    }
  ];

  const getTypeStyles = (type) => {
    switch(type) {
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 'success':
        return 'bg-green-500/10 border-green-500/30';
      case 'info':
      default:
        return 'bg-blue-500/10 border-blue-500/30';
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-primary" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-primary" />;
      default:
        return <Info className="w-4 h-4 text-primary" />;
    }
  };

  const handleMarkAllRead = () => {
    showNotification('Notifications', 'All notifications marked as read');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="modal-overlay absolute inset-0" onClick={onClose}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Notifications</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-3 mb-6">
            {notifications.map(notif => (
              <div 
                key={notif.id} 
                className={`p-4 rounded-lg border ${getTypeStyles(notif.type)} hover:bg-white/5 transition cursor-pointer`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(notif.type)}
                    <p className="font-medium">{notif.title}</p>
                  </div>
                  <span className="text-xs text-gray-400">{notif.time}</span>
                </div>
                <p className="text-sm text-gray-400">{notif.message}</p>
              </div>
            ))}
          </div>
          
          <button 
            className="w-full btn-secondary py-3 rounded-lg"
            onClick={handleMarkAllRead}
          >
            Mark All as Read
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;