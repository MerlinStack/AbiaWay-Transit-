import React, { type ReactNode } from 'react';
import LiveMap from './LiveMap';
import ETAPanel from './ETAPanel';
import AIAssistant from '../AI/AIAssistant';

interface MapTabProps {
  renderBusMarkers?: () => ReactNode;
}

const MapTab = ({ renderBusMarkers }: MapTabProps) => {
  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 mb-8 max-w-2xl">
        <div className="stat-card p-4 lg:p-6">
          <div className="flex items-center justify-between mb-3">
            <i data-lucide="bus" className="w-6 h-6 text-green-400"></i>
            <span className="text-xs text-green-400 flex items-center">
              <i data-lucide="trending-up" className="w-3 h-3 mr-1"></i>12%
            </span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold mono">0</p>
          <p className="text-sm text-gray-400">Today's Rides</p>
        </div>
        <div className="stat-card p-4 lg:p-6">
          <div className="flex items-center justify-between mb-3">
            <i data-lucide="map-pin" className="w-6 h-6 text-green-400"></i>
            <span className="text-xs text-green-400">Live</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold mono">24</p>
          <p className="text-sm text-gray-400">Active Buses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LiveMap renderBusMarkers={renderBusMarkers} />
        </div>
        <div className="space-y-6">
          <ETAPanel />
          <AIAssistant />
        </div>
      </div>
    </div>
  );
};

export default MapTab;
