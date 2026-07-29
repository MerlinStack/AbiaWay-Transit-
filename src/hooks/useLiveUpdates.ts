import { useState, useEffect } from 'react';

export const useLiveUpdates = (initialBuses = [
  { id: 'AB-101', capacity: 65, eta: 2, platform: 3 },
  { id: 'AB-102', capacity: 90, eta: 8, platform: 1 },
  { id: 'AB-103', capacity: 30, eta: 15, platform: 4 }
]) => {
  const [updates, setUpdates] = useState(initialBuses);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setUpdates(prev => prev.map(bus => ({
        ...bus,
        capacity: Math.min(100, Math.max(20, bus.capacity + (Math.random() > 0.5 ? 5 : -5))),
        eta: Math.max(1, bus.eta + (Math.random() > 0.7 ? 1 : -1))
      })));
      
      // Simulate connection status (always true in this demo)
      setIsConnected(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getCapacityClass = (capacity) => {
    if (capacity > 80) return 'high';
    if (capacity > 50) return 'medium';
    return '';
  };

  return { updates, isConnected, getCapacityClass };
};