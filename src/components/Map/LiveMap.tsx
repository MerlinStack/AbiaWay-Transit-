import { memo, useMemo, useState, useCallback, type ReactNode } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import useNotificationStore from '../../stores/notificationStore';
import { abiaCenter } from '../../data/constants';
import { BusMarkersLayer, StopMarkersLayer } from './BusMarkersLayer';
import { MapZoomControl } from './MapControls';

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
  const showNotification = useNotificationStore((s) => s.showNotification);

  const toggleFullscreen = useCallback(() => {
    const el = document.querySelector('.map-container');
    if (!document.fullscreenElement) {
      el?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  const stats = useMemo(() => [
    { label: 'Active Buses', value: '24', color: 'blue', icon: 'bus' },
    { label: 'Available Seats', value: '156', color: 'green', icon: 'users' },
    { label: 'On-Time Rate', value: '94%', color: 'purple', icon: 'clock' },
    { label: 'Total Routes', value: '12', color: 'orange', icon: 'route' },
  ], []);

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
          <span className="text-sm flex items-center gap-1 bg-green-500/20 px-3 py-1 rounded-full">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            Live
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
