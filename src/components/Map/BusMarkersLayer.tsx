import { memo } from 'react';
import { Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { ACTIVE_FLEET, FLEET, getBatteryColor, getFleetSummary } from '../../data/fleet';
import { ALL_STOPS, SOLAR_STOPS, TERMINALS } from '../../data/stops';
import { getFareType } from '../../data/fares';
import { FleetBus } from '../../types/abssin';

export interface BusLocation {
  id: string;
  lat: number;
  lng: number;
  route: string;
  capacity: number;
  speed: number;
  batterySoC: number;
  rangeKm: number;
}

const FLEET_LOCATIONS: BusLocation[] = ACTIVE_FLEET.map((bus, i) => ({
  id: bus.id,
  lat: 5.4244 + (i * 0.008),
  lng: 7.4744 - (i * 0.005),
  route: bus.routeId || 'Unknown',
  capacity: bus.capacity,
  speed: 20 + Math.floor(Math.random() * 30),
  batterySoC: bus.batterySoC,
  rangeKm: bus.rangeKm,
}));

const ROUTE_POINTS: Record<string, [number, number][]> = {
  'Umuahia-Aba': [
    [5.5244, 7.4946], [5.4700, 7.4600], [5.3800, 7.4000],
    [5.2900, 7.3700], [5.1700, 7.3560], [5.1066, 7.3667],
  ],
  'Umuahia-Ohafia': [
    [5.5244, 7.4946], [5.4800, 7.5400], [5.4500, 7.5200],
    [5.3900, 7.5600], [5.3300, 7.6000],
  ],
};

const busIcon = (soC: number) => L.divIcon({
  className: 'custom-bus-icon',
  html: `<div style="display:flex;align-items:center;gap:2px">
    <svg viewBox="0 0 24 24" fill="${getBatteryColor(soC)}" stroke="white" stroke-width="1.5" width="20" height="20">
      <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
      <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
    <span style="font-size:8px;color:white;background:rgba(0,0,0,0.6);padding:1px 3px;border-radius:4px">${soC}%</span>
  </div>`,
  iconSize: [50, 28],
  iconAnchor: [25, 14],
});

const stopIcon = L.divIcon({
  className: 'custom-stop-icon',
  html: '<svg viewBox="0 0 24 24" fill="#16a34a" stroke="white" stroke-width="1.5" width="14" height="14"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const terminalIcon = L.divIcon({
  className: 'custom-stop-icon terminal',
  html: '<svg viewBox="0 0 24 24" fill="#2563eb" stroke="white" stroke-width="1.5" width="18" height="18"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const solarIcon = L.divIcon({
  className: 'custom-solar-icon',
  html: '<svg viewBox="0 0 24 24" fill="#eab308" stroke="black" stroke-width="1" width="20" height="20"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

interface BusMarkersLayerProps {
  locations?: BusLocation[];
}

const BusMarkersLayer = memo(({ locations = FLEET_LOCATIONS }: BusMarkersLayerProps) => {
  const summary = getFleetSummary();
  return (
    <>
      {locations.map((bus) => (
        <Marker key={bus.id} position={[bus.lat, bus.lng]} icon={busIcon(bus.batterySoC)}>
          <Popup>
            <div className="text-sm min-w-[180px]">
              <b className="text-lg">{bus.id}</b>
              <div className="mt-1 space-y-1">
                <div>Route: {bus.route}</div>
                <div>Battery: <span style={{ color: getBatteryColor(bus.batterySoC) }}>{bus.batterySoC}%</span></div>
                <div>Range: {bus.rangeKm} km / 300 km</div>
                <div>Speed: {bus.speed} km/h</div>
                <div>Seats: {bus.capacity}</div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
      {Object.entries(ROUTE_POINTS).map(([name, points]) => (
        <Polyline key={name} positions={points} pathOptions={{ color: '#16a34a', weight: 3, opacity: 0.7, dashArray: '5 8' }} />
      ))}
    </>
  );
});

const StopMarkersLayer = memo(() => (
  <>
    {TERMINALS.map((t) => (
      <Marker key={t.id} position={[t.lat, t.lng]} icon={terminalIcon}>
        <Popup><b>{t.name}</b><br />Terminal{t.solarCharger ? ' ☀️ Solar Charging' : ''}</Popup>
      </Marker>
    ))}
    {ALL_STOPS.filter((s) => s.type === 'stop').map((stop) => (
      <Marker key={stop.id} position={[stop.lat, stop.lng]} icon={stopIcon}>
        <Popup><b>{stop.name}</b><br />Bus Stop</Popup>
      </Marker>
    ))}
  </>
));

const SolarStationLayer = memo(() => (
  <>
    {SOLAR_STOPS.map((s) => (
      <Marker key={`sol-${s.id}`} position={[s.lat, s.lng]} icon={solarIcon}>
        <Popup><b>{s.name}</b><br />☀️ Solar Charging Available</Popup>
      </Marker>
    ))}
  </>
));

export { BusMarkersLayer, StopMarkersLayer, SolarStationLayer, FLEET_LOCATIONS };
export type { BusMarkersLayerProps };
