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

  const getCapacityTone = (capacity: number) => {
    if (capacity > 80) return { label: 'Crowded', bar: 'bg-red-500', badge: 'bg-red-500/20 text-red-400' };
    if (capacity > 50) return { label: 'Filling up', bar: 'bg-amber-400', badge: 'bg-amber-400/20 text-amber-400' };
    return { label: 'Plenty of seats', bar: 'bg-green-500', badge: 'bg-green-500/20 text-green-400' };
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
        {updates.map(bus => {
          const tone = getCapacityTone(bus.capacity);
          return (
            <div key={bus.id} className={`p-3 rounded-xl border transition-all ${bus.capacity > 80 ? 'border-red-500/30 bg-red-500/5' : 'border-transparent bg-white/5'}`}>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium">Bus #{bus.id}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${tone.badge}`}>{tone.label}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 mb-2">
                <div className={`h-1.5 rounded-full transition-all duration-500 ${tone.bar}`} style={{ width: `${bus.capacity}%` }}></div>
              </div>
              <div className="flex justify-between text-xs">
                <p className="text-gray-400">
                  ETA: <span className={`font-bold ${bus.eta <= 2 ? 'text-green-400' : 'text-primary'}`}>{bus.eta} min</span>
                  {bus.eta <= 2 && <span className="ml-1 text-green-400">· boarding</span>}
                </p>
                <span className="text-gray-400">{bus.capacity}% · Platform {bus.platform}</span>
              </div>
              <button
                className="text-xs text-primary mt-2 hover:text-green-300 transition"
                onClick={() => handleSubscribe(bus.id)}
              >
                🔔 Notify when approaching
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default ETAPanel;