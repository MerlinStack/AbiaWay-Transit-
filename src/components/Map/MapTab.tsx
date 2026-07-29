import React from 'react';
import LiveMap from './LiveMap';
import ETAPanel from './ETAPanel';
import AIAssistant from '../AI/AIAssistant';

interface MapTabProps {
  renderBusMarkers?: () => React.ReactNode;
}

const MapTab = ({ renderBusMarkers }: MapTabProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <LiveMap renderBusMarkers={renderBusMarkers} />
      </div>
      <div className="space-y-6">
        <ETAPanel />
        <AIAssistant />
      </div>
    </div>
  );
};

export default MapTab;
