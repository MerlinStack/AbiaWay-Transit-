import { memo, useMemo, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import useNotificationStore from '../../stores/notificationStore';
import { abiaCenter } from '../../data/constants';
import { BusMarkersLayer, StopMarkersLayer, SolarStationLayer } from './BusMarkersLayer';
import { getFleetSummary } from '../../data/fleet';
import { MapZoomControl } from './MapControls';
import { TelemetrySyncEngine, type TransportMode, type TelemetryPacket } from '../../utils/telemetrySync';

if (typeof L !== 'undefined' && L.Icon && L.Icon.Default) {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

const TILE_LAYERS = [
  { name: 'Street', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' },
  { name: 'Satellite', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' },
  { name: 'Dark', url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png' },
];

const MODE_COLORS: Record<TransportMode, string> = {
  WEBSOCKET: 'bg-green-500',
  SSE: 'bg-blue-500',
  LONG_POLL: 'bg-yellow-500',
  DISCONNECTED: 'bg-red-500',
};

const MODE_LABELS: Record<TransportMode, string> = {
  WEBSOCKET: 'WebSocket',
  SSE: 'SSE',
  LONG_POLL: 'Long Poll',
  DISCONNECTED: 'Disconnected',
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
    <button className="btn-secondary px-3 py-1 rounded-lg text-sm tooltip" data-tooltip="Center on my location" onClick={handleClick}>
      <i data-lucide="locate" className="w-4 h-4"></i>
    </button>
  );
});

interface LiveMapProps {
  renderBusMarkers?: () => ReactNode;
}

const LiveMap = memo(({ renderBusMarkers }: LiveMapProps) => {
  const [activeLayerIndex, setActiveLayerIndex] = useState(0);
  const [map, setMap] = useState<L.Map | null>(null);
  const [transportMode, setTransportMode] = useState<TransportMode>('DISCONNECTED');
  const [incomingPackets, setIncomingPackets] = useState(0);
  const showNotification = useNotificationStore((s) => s.showNotification);
  const engineRef = useRef<TelemetrySyncEngine | null>(null);

  useEffect(() => {
    const engine = new TelemetrySyncEngine(
      {
        wsUrl: 'wss://telemetry.abiaway.gov.ng/ws',
        sseUrl: 'https://telemetry.abiaway.gov.ng/sse',
        pollUrl: 'https://telemetry.abiaway.gov.ng/poll',
        pollIntervalMs: 5000,
        maxRetries: 2,
      },
      (packet: TelemetryPacket) => {
        setIncomingPackets((p) => p + 1);
      },
      (mode: TransportMode) => {
        setTransportMode(mode);
        if (mode === 'LONG_POLL') {
          showNotification('Degraded', 'Telemetry on long-poll — network unstable', 'warning');
        } else if (mode === 'DISCONNECTED') {
          showNotification('Disconnected', 'Telemetry feed lost', 'error');
        } else if (mode === 'WEBSOCKET') {
          showNotification('Connected', 'Real-time telemetry active', 'success');
        }
      },
    );
    engineRef.current = engine;
    engine.connect();
    return () => engine.cleanup();
  }, [showNotification]);

  const toggleFullscreen = useCallback(() => {
    const el = document.querySelector('.map-container');
    if (!document.fullscreenElement) {
      el?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  const fleetStats = useMemo(getFleetSummary, []);
  const stats = useMemo(() => [
    { label: 'Active Buses', value: String(fleetStats.active), color: 'blue', icon: 'bus' },
    { label: 'Charging', value: String(fleetStats.charging), color: 'green', icon: 'battery-charging' },
    { label: 'Avg Battery', value: `${fleetStats.avgBattery}%`, color: 'purple', icon: 'battery-full' },
    { label: 'Packets', value: String(incomingPackets), color: 'orange', icon: 'activity' },
  ], [fleetStats, incomingPackets]);

  const gradientMap: Record<string, string> = {
    blue: 'from-blue-600/20 to-blue-800/20 text-blue-400',
    green: 'from-green-600/20 to-green-800/20 text-green-400',
    purple: 'from-purple-600/20 to-purple-800/20 text-purple-400',
    orange: 'from-orange-600/20 to-orange-800/20 text-orange-400',
  };

  return (
    <div className="glass-card p-4">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <i data-lucide="map-pin" className="text-green-400"></i>
            Live Bus Tracking
          </h3>
          <div className="flex gap-1 bg-white/10 rounded-lg p-1">
            {TILE_LAYERS.map((layer, i) => (
              <button
                key={layer.name}
                className={`px-3 py-1 rounded-lg text-xs transition ${i === activeLayerIndex ? 'bg-primary text-white' : 'hover:bg-white/10'}`}
                onClick={() => setActiveLayerIndex(i)}
              >
                {layer.name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs flex items-center gap-1.5 px-3 py-1 rounded-full ${MODE_COLORS[transportMode]}/20 text-${transportMode === 'DISCONNECTED' ? 'red' : transportMode === 'LONG_POLL' ? 'yellow' : transportMode === 'SSE' ? 'blue' : 'green'}-400`}>
            <span className={`w-2 h-2 rounded-full ${MODE_COLORS[transportMode]} ${transportMode !== 'DISCONNECTED' ? 'animate-pulse' : ''}`}></span>
            {MODE_LABELS[transportMode]}
          </span>
          {map && <CenterButton map={map} />}
          <button className="btn-secondary px-3 py-1 rounded-lg text-sm tooltip" data-tooltip="Toggle fullscreen" onClick={toggleFullscreen}>
            <i data-lucide="maximize" className="w-4 h-4"></i>
          </button>
        </div>
      </div>

      <MapContainer
        center={abiaCenter as [number, number]}
        zoom={11}
        zoomControl={false}
        style={{ height: '450px', width: '100%', borderRadius: '12px', zIndex: 1 }}
        ref={setMap}
      >
        <TileLayer url={TILE_LAYERS[activeLayerIndex].url} attribution="\u00a9 OpenStreetMap contributors" maxZoom={19} />
        <MapZoomControl />
        <StopMarkersLayer />
        <SolarStationLayer />
        {renderBusMarkers ? renderBusMarkers() : <BusMarkersLayer />}
      </MapContainer>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {stats.map((s) => (
          <div key={s.label} className={`text-center p-3 rounded-lg bg-gradient-to-br ${gradientMap[s.color]}`}>
            <p className={`text-2xl font-bold ${gradientMap[s.color].split(' ').pop()}`}>{s.value}</p>
            <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
              <i data-lucide={s.icon} className="w-3 h-3"></i> {s.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
});

export default LiveMap;
export type { LiveMapProps };
