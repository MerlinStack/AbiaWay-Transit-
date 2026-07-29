import { memo } from 'react';
import { Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { busStops } from '../../data/constants';

export interface BusLocation {
  id: string;
  lat: number;
  lng: number;
  route: string;
  capacity: number;
  speed: number;
}

export const BUS_LOCATIONS: BusLocation[] = [
  { id: 'AB-101', lat: 5.1066, lng: 7.3667, route: 'Osisioma', capacity: 65, speed: 35 },
  { id: 'AB-102', lat: 5.1156, lng: 7.3756, route: 'Park', capacity: 90, speed: 28 },
  { id: 'AB-103', lat: 5.1246, lng: 7.3845, route: 'Flyover', capacity: 30, speed: 42 },
  { id: 'AB-104', lat: 5.0976, lng: 7.3578, route: 'Zonal', capacity: 45, speed: 31 },
];

const ROUTE_POINTS: [number, number][] = [
  busStops.umuahia,
  [5.4244, 7.4744],
  [5.3244, 7.4244],
  [5.2244, 7.3744],
  busStops.aba,
];

const busIcon = L.divIcon({
  className: 'custom-bus-icon',
  html: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const stopIcon = L.divIcon({
  className: 'custom-stop-icon',
  html: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const terminalIcon = L.divIcon({
  className: 'custom-stop-icon terminal',
  html: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const STOP_NAMES: Record<string, { name: string; type: string }> = {
  umuahia: { name: 'Umuahia Main Park', type: 'terminal' },
  aba: { name: 'Aba City Terminal', type: 'terminal' },
  ohafia: { name: 'Ohafia Junction', type: 'junction' },
  bende: { name: 'Bende Road', type: 'stop' },
  arochukwu: { name: 'Arochukwu', type: 'stop' },
};

interface BusMarkersLayerProps {
  locations?: BusLocation[];
}

const BusMarkersLayer = memo(({ locations = BUS_LOCATIONS }: BusMarkersLayerProps) => (
  <>
    {locations.map((bus) => (
      <Marker key={bus.id} position={[bus.lat, bus.lng]} icon={busIcon}>
        <Popup>
          <div>
            <b>Bus #{bus.id}</b><br />
            Route: {bus.route}<br />
            Capacity: {bus.capacity}%<br />
            Speed: {bus.speed} km/h
          </div>
        </Popup>
      </Marker>
    ))}
    <Polyline positions={ROUTE_POINTS} pathOptions={{ color: '#16a34a', weight: 4, opacity: 0.8, dashArray: '5 10' }} />
  </>
));

const StopMarkersLayer = memo(() => (
  <>
    {Object.entries(busStops).map(([key, coords]) => {
      const stop = STOP_NAMES[key];
      if (!stop) return null;
      return (
        <Marker key={key} position={coords as [number, number]} icon={stop.type === 'terminal' ? terminalIcon : stopIcon}>
          <Popup>
            <div>
              <b>{stop.name}</b><br />
              <span>{stop.type.charAt(0).toUpperCase() + stop.type.slice(1)}</span>
            </div>
          </Popup>
        </Marker>
      );
    })}
  </>
));

export { BusMarkersLayer, StopMarkersLayer };
export type { BusMarkersLayerProps };
