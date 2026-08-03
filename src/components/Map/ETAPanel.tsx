import React, { memo, useState, useEffect } from 'react';
import useNotificationStore from '../../stores/notificationStore';
import { Clock } from 'lucide-react';

const ETAPanel = memo(() => {
  const [updates, setUpdates] = useState([
    { id: 'AB-101', capacity: 65, eta: 2, platform: 3 },
    { id: 'AB-102', capacity: 90, eta: 8, platform: 1 },
    { id: 'AB-103', capacity: 30, eta: 15, platform: 4 }
  ]);
  const showNotification = useNotificationStore((s) => s.showNotification);

  useEffect(() => {
    const interval = setInterval(() => {
      setUpdates(prev => prev.map(bus => ({
        ...bus,
        capacity: Math.min(100, Math.max(20, bus.capacity + (Math.random() > 0.5 ? 5 : -5))),
        eta: Math.max(1, bus.eta + (Math.random() > 0.7 ? 1 : -1))
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getCapacityClass = (capacity) => {
    if (capacity > 80) return 'high';
    if (capacity > 50) return 'medium';
    return '';
  };

  const handleSubscribe = (busId) => {
    showNotification('🔔', `Notifications enabled for Bus ${busId}`);
  };

  return (
    <div className="glass-card p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Clock className="text-primary" />
        Real-time ETA & Capacity
      </h3>
      <div className="space-y-4">
        {updates.map(bus => (
          <div key={bus.id} className="p-3 bg-white/5 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium">Bus #{bus.id}</p>
              <span className="capacity-indicator">
                <span className="capacity-bar">
                  <div className={`capacity-fill ${getCapacityClass(bus.capacity)}`} style={{ width: `${bus.capacity}%` }}></div>
                </span>
                <span className="text-xs">{bus.capacity}%</span>
              </span>
            </div>
            <p className="text-xs text-gray-400">
              ETA: <span className="text-primary font-bold">{bus.eta} minutes</span> • Platform {bus.platform}
            </p>
            <button 
              className="text-xs text-primary mt-2"
              onClick={() => handleSubscribe(bus.id)}
            >
              🔔 Notify when approaching
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});

export default ETAPanel;