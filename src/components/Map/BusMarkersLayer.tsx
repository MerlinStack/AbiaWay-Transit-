import { memo, useEffect, useState } from 'react';
import { Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getTransitService } from '../../services/transit';
import { FleetBus, BusStop } from '../../types/abssin';
import { getBatteryColor } from '../../utils/battery';

const ROUTE_U_A: [number, number][] = [
  [5.5244, 7.4946], [5.4900, 7.4700], [5.4400, 7.4400],
  [5.3800, 7.4000], [5.2900, 7.3700], [5.2000, 7.3580],
  [5.1400, 7.3540], [5.1066, 7.3667],
];

const ROUTE_U_O: [number, number][] = [
  [5.5244, 7.4946], [5.4900, 7.5100], [5.4700, 7.5300],
  [5.4400, 7.5400], [5.4000, 7.5600], [5.3500, 7.5900],
  [5.3300, 7.6000],
];

const ROUTE_A_U: [number, number][] = [...ROUTE_U_A].reverse();
const ROUTE_O_U: [number, number][] = [...ROUTE_U_O].reverse();

const ROUTE_POINTS: Record<string, [number, number][]> = {
  'Umuahia-Aba': ROUTE_U_A,
  'Aba-Umuahia': ROUTE_A_U,
  'Umuahia-Ohafia': ROUTE_U_O,
  'Ohafia-Umuahia': ROUTE_O_U,
};

const busIcon = (soC: number) => L.divIcon({
  className: '',
  html: `<div style="display:flex;align-items:center;gap:2px;background:rgba(7,16,31,0.85);border:1px solid rgba(255,255,255,0.15);border-radius:8px;padding:2px 6px 2px 2px">
    <svg viewBox="0 0 24 24" fill="${getBatteryColor(soC)}" stroke="white" stroke-width="1.5" width="18" height="18">
      <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
      <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
    <span style="font-size:9px;color:#e2e8f0;font-weight:600;line-height:1">${soC}%</span>
  </div>`,
  iconSize: [60, 22],
  iconAnchor: [30, 11],
});

const stopIcon = L.divIcon({
  className: '',
  html: '<div style="width:10px;height:10px;background:#16a34a;border:2px solid rgba(255,255,255,0.6);border-radius:50%;box-shadow:0 0 4px rgba(0,0,0,0.5)"></div>',
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

const terminalIcon = L.divIcon({
  className: '',
  html: '<div style="width:16px;height:16px;background:#2563eb;border:2px solid rgba(255,255,255,0.8);border-radius:4px;box-shadow:0 0 6px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;font-size:9px;color:white;font-weight:bold">T</div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const solarIcon = L.divIcon({
  className: '',
  html: '<div style="width:14px;height:14px;background:#eab308;border:2px solid rgba(255,255,255,0.6);border-radius:50%;box-shadow:0 0 6px rgba(234,179,8,0.4);display:flex;align-items:center;justify-content:center;font-size:8px">☀</div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

interface FleetLocation {
  id: string;
  lat: number;
  lng: number;
  route: string;
  capacity: number;
  speed: number;
  batterySoC: number;
  rangeKm: number;
}

interface BusMarkersLayerProps {
  locations?: FleetLocation[];
}

const ZoomWatcher = ({ onZoom }: { onZoom: (z: number) => void }) => {
  const map = useMap();
  useEffect(() => {
    const handler = () => onZoom(map.getZoom());
    map.on('zoom', handler);
    handler();
    return () => { map.off('zoom', handler); };
  }, [map, onZoom]);
  return null;
};

const BusMarkersLayer = memo(({ locations }: BusMarkersLayerProps) => {
  const [fleetLocations, setFleetLocations] = useState<FleetLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (locations) {
      setFleetLocations(locations);
      setLoading(false);
      return;
    }

    const loadFleet = async () => {
      const transit = getTransitService();
      const fleet = await transit.getActiveFleet();
      const fleetLocations = fleet.map((bus, i) => {
        const routePoints = ROUTE_POINTS[bus.routeId || 'Umuahia-Aba'] || ROUTE_U_A;
        const idx = i % routePoints.length;
        const [lat, lng] = routePoints[idx];
        const offset = (Math.random() - 0.5) * 0.004;
        return {
          id: bus.id,
          lat: lat + offset,
          lng: lng + offset,
          route: bus.routeId || 'Unknown',
          capacity: bus.capacity,
          speed: 18 + Math.floor(Math.random() * 14),
          batterySoC: bus.batterySoC,
          rangeKm: bus.rangeKm,
        };
      });
      setFleetLocations(fleetLocations);
      setLoading(false);
    };
    loadFleet();
  }, [locations]);

  if (loading) return null;

  return (
    <>
      {fleetLocations.map((bus) => (
        <Marker key={bus.id} position={[bus.lat, bus.lng]} icon={busIcon(bus.batterySoC)}>
          <Popup>
            <div className="text-sm min-w-[160px]">
              <b className="text-lg" style={{ color: getBatteryColor(bus.batterySoC) }}>{bus.id}</b>
              <div className="mt-1 space-y-0.5 text-gray-700">
                <div>Route: {bus.route}</div>
                <div>Battery: <span style={{ color: getBatteryColor(bus.batterySoC), fontWeight: 600 }}>{bus.batterySoC}%</span></div>
                <div>Range: {bus.rangeKm} km</div>
                <div>Speed: {bus.speed} km/h</div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
      {Object.entries(ROUTE_POINTS).map(([name, points]) => (
        <Polyline key={name} positions={points} pathOptions={{ color: '#16a34a', weight: 2, opacity: 0.5, dashArray: '6 8' }} />
      ))}
    </>
  );
});

const StopMarkersLayer = memo(() => {
  const [zoom, setZoom] = useState(11);
  const [terminals, setTerminals] = useState<BusStop[]>([]);
  const [stops, setStops] = useState<BusStop[]>([]);
  const [solarStops, setSolarStops] = useState<BusStop[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded) return;
    const loadStops = async () => {
      const transit = getTransitService();
      const [termData, stopData, solarData] = await Promise.all([
        transit.getTerminals(),
        transit.getAllStops(),
        transit.getSolarStops(),
      ]);
      setTerminals(termData);
      setStops(stopData);
      setSolarStops(solarData);
      setLoaded(true);
    };
    loadStops();
  }, [loaded]);

  return (
    <>
      <ZoomWatcher onZoom={setZoom} />
      {zoom >= 12 && terminals.map((t) => (
        <Marker key={t.id} position={[t.lat, t.lng]} icon={terminalIcon}>
          <Popup><b>{t.name}</b><br />Terminal{t.solarCharger ? ' · Solar Charging' : ''}</Popup>
        </Marker>
      ))}
      {zoom >= 14 && stops.filter((s) => s.type === 'stop').map((stop) => (
        <Marker key={stop.id} position={[stop.lat, stop.lng]} icon={stopIcon}>
          <Popup><b>{stop.name}</b><br />Bus Stop</Popup>
        </Marker>
      ))}
    </>
  );
});

const SolarStationLayer = memo(() => {
  const [solarStops, setSolarStops] = useState<BusStop[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded) return;
    const loadSolarStops = async () => {
      const transit = getTransitService();
      const data = await transit.getSolarStops();
      setSolarStops(data);
      setLoaded(true);
    };
    loadSolarStops();
  }, [loaded]);

  return (
    <>
      {solarStops.map((s) => (
        <Marker key={`sol-${s.id}`} position={[s.lat, s.lng]} icon={solarIcon}>
          <Popup><b>{s.name}</b><br />Solar Charging Available</Popup>
        </Marker>
      ))}
    </>
  );
});

export { BusMarkersLayer, StopMarkersLayer, SolarStationLayer };
export type { BusMarkersLayerProps, FleetLocation };