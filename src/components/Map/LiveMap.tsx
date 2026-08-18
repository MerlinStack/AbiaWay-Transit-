import React, { memo, useMemo, useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import useNotificationStore from '../../stores/notificationStore';
import { Locate, MapPin, Maximize, Bus, BatteryFull, BatteryCharging, Route, Circle } from 'lucide-react';
import { abiaCenter } from '../../data/constants';
import { BusMarkersLayer, StopMarkersLayer, SolarStationLayer } from './BusMarkersLayer';
import { getTransitService } from '../../services/transit';
import type { FleetSummary } from '../../services/transit/TransitDataSource';
import { MapZoomControl } from './MapControls';
import { TelemetrySyncEngine } from '../../utils/telemetrySync';
import type { TransportMode } from '../../utils/telemetrySync';
import SegmentedControl from '../ui/SegmentedControl';
import PillButton from '../ui/PillButton';

const TILE_LAYERS = [
  { name: 'Street', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attr: '&copy; OpenStreetMap' },
  { name: 'Dark', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', attr: '&copy; CARTO &copy; OpenStreetMap' },
  { name: 'Satellite', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', attr: '&copy; OpenTopoMap' },
];

const MODE_LABELS: Record<TransportMode, string> = {
  WEBSOCKET: 'Live', SSE: 'Degraded', LONG_POLL: 'Polling', DISCONNECTED: 'Offline',
};

interface CenterButtonProps {
  map: L.Map;
}

const CenterButton = memo(({ map }: CenterButtonProps) => {
  const showNotification = useNotificationStore((s) => s.showNotification);
  const handleClick = useCallback(() => {
    map.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true });
    showNotification('Location', 'Centering map on your position');
  }, [map, showNotification]);
  return (
    <PillButton onClick={handleClick} title="Center on my location" aria-label="Center on my location">
      <Locate className="w-4 h-4" />
    </PillButton>
  );
});

interface LiveMapProps {
  renderBusMarkers?: () => React.ReactNode;
}

const LiveMap = memo(({ renderBusMarkers }: LiveMapProps) => {
  const [activeLayerIndex, setActiveLayerIndex] = useState(0);
  const [map, setMap] = useState<L.Map | null>(null);
  const [transportMode, setTransportMode] = useState<TransportMode>('DISCONNECTED');
  const [fleetStats, setFleetStats] = useState<FleetSummary>({
    total: 0, active: 0, charging: 0, maintenance: 0, idle: 0, avgBattery: 0
  });
  const [loading, setLoading] = useState(true);
  const showNotification = useNotificationStore((s) => s.showNotification);

  useEffect(() => {
    const loadFleetStats = async () => {
      const transit = getTransitService();
      const stats = await transit.getFleetSummary();
      setFleetStats(stats);
      setLoading(false);
    };
    loadFleetStats();
  }, []);

  useEffect(() => {
    const engine = new TelemetrySyncEngine(
      {
        wsUrl: 'wss://telemetry.abiaway.gov.ng/ws',
        sseUrl: 'https://telemetry.abiaway.gov.ng/sse',
        pollUrl: 'https://telemetry.abiaway.gov.ng/poll',
        pollIntervalMs: 5000,
        maxRetries: 2,
      },
      () => {},
      (mode: TransportMode) => {
        setTransportMode(mode);
        if (mode === 'WEBSOCKET') showNotification('Connected', 'Real-time telemetry active', 'success');
        else if (mode === 'LONG_POLL') showNotification('Degraded', 'Telemetry falling back to long-poll', 'warning');
        else if (mode === 'DISCONNECTED') showNotification('Disconnected', 'Telemetry feed lost', 'error');
      },
    );
    engine.connect();
    return () => engine.cleanup();
  }, [showNotification]);

  const toggleFullscreen = useCallback(() => {
    const el = document.querySelector('.leaflet-container');
    if (!document.fullscreenElement) el?.requestFullscreen();
    else document.exitFullscreen();
  }, []);

  const stats = useMemo(() => [
    { label: 'Active Buses', value: String(fleetStats.active), color: 'blue', icon: 'bus' },
    { label: 'Avg Battery', value: `${fleetStats.avgBattery}%`, color: 'purple', icon: 'battery-full' },
    { label: 'Charging', value: String(fleetStats.charging), color: 'green', icon: 'battery-charging' },
    { label: 'Routes', value: '6', color: 'orange', icon: 'route' },
  ], [fleetStats]);

  const gradientMap: Record<string, string> = {
    blue: 'from-blue-600/20 to-blue-800/20 text-blue-400',
    purple: 'from-purple-600/20 to-purple-800/20 text-purple-400',
    green: 'from-green-600/20 to-green-800/20 text-green-400',
    orange: 'from-orange-600/20 to-orange-800/20 text-orange-400',
  };

  if (loading) {
    return <div className="flex items-center justify-center h-[500px]">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="glass-card overflow-hidden">
        <div className="p-4 pb-0">
          <div className="flex justify-between items-center mb-4 gap-3 overflow-x-auto custom-scrollbar whitespace-nowrap pb-1">
            <div className="flex items-center gap-3 shrink-0">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="text-green-400" />
                Live Bus Tracking
              </h3>
              <SegmentedControl
                ariaLabel="Map style"
                value={TILE_LAYERS[activeLayerIndex].name}
                onChange={(name) => setActiveLayerIndex(TILE_LAYERS.findIndex((l) => l.name === name))}
                options={TILE_LAYERS.map((l) => ({ label: l.name, value: l.name }))}
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-sm flex items-center gap-1 px-3 py-1 rounded-full ${
                transportMode === 'WEBSOCKET' ? 'bg-green-500/20 text-green-400' :
                transportMode === 'DISCONNECTED' ? 'bg-red-500/20 text-red-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  transportMode === 'WEBSOCKET' ? 'bg-green-500' :
                  transportMode === 'DISCONNECTED' ? 'bg-red-500' : 'bg-yellow-500'
                } ${transportMode !== 'DISCONNECTED' ? 'animate-pulse' : ''}`}></span>
                {MODE_LABELS[transportMode]}
              </span>
              {map && <CenterButton map={map} />}
              <PillButton title="Toggle fullscreen" onClick={toggleFullscreen} aria-label="Toggle fullscreen">
                <Maximize className="w-4 h-4" />
              </PillButton>
            </div>
          </div>
        </div>

        <MapContainer
          center={abiaCenter as [number, number]}
          zoom={11}
          zoomControl={false}
          style={{ height: '450px', width: '100%' }}
          ref={setMap}
        >
          <TileLayer url={TILE_LAYERS[activeLayerIndex].url} attribution={TILE_LAYERS[activeLayerIndex].attr} maxZoom={19} />
          <MapZoomControl />
          <StopMarkersLayer />
          <SolarStationLayer />
          {renderBusMarkers ? renderBusMarkers() : <BusMarkersLayer />}
        </MapContainer>
      </div>

      <div className="glass-card p-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className={`text-center p-3 rounded-lg bg-gradient-to-br ${gradientMap[s.color]}`}>
              <p className={`text-2xl font-bold ${gradientMap[s.color].split(' ').pop()}`}>{s.value}</p>
              <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                {{
                  'bus': <Bus className="w-3 h-3" />,
                  'battery-full': <BatteryFull className="w-3 h-3" />,
                  'battery-charging': <BatteryCharging className="w-3 h-3" />,
                  'route': <Route className="w-3 h-3" />,
                }[s.icon] || <Circle className="w-3 h-3" />} {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default LiveMap;
export type { LiveMapProps };
