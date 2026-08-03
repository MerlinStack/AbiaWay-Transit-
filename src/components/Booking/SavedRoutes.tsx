import { Star, Clock, ArrowRight, Plus } from 'lucide-react';
import React from 'react';
import useBookingStore from '../../stores/bookingStore';

interface SavedRoutesProps {
  onSelect: (data: { from: string; to: string; date: string; time: string; passengers: number }) => void;
}

const SavedRoutes = ({ onSelect }: SavedRoutesProps) => {
  const savedRoutes = useBookingStore((s) => s.savedRoutes);
  const saveRoute = useBookingStore((s) => s.saveRoute);

  const popularSavedRoutes = [
    { id: 1, from: 'Umuahia', to: 'Aba', frequency: 'Daily', lastUsed: '2 days ago' },
    { id: 2, from: 'Aba', to: 'Umuahia', frequency: 'Daily', lastUsed: '5 days ago' },
    { id: 3, from: 'Umuahia', to: 'Ohafia', frequency: 'Weekdays', lastUsed: '1 week ago' },
  ];

  return (
    <div className="glass-card p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Star className="text-yellow-400 fill-yellow-400" />
        Saved Routes
      </h3>

      <div className="space-y-2">
        {popularSavedRoutes.map(route => (
          <div
            key={route.id}
            className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition cursor-pointer group"
            onClick={() => onSelect({
              from: route.from,
              to: route.to,
              date: new Date().toISOString().split('T')[0],
              time: '08:00',
              passengers: 1
            })}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{route.from} → {route.to}</p>
                <p className="text-xs text-gray-400 mt-1">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {route.frequency} • Last used {route.lastUsed}
                </p>
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition">
                <ArrowRight className="w-4 h-4 text-primary" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full btn-secondary mt-4 py-2 text-sm">
        <Plus className="w-4 h-4 inline mr-2" />
        Save Current Route
      </button>
    </div>
  );
};

export default SavedRoutes;