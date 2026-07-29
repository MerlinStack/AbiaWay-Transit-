import { useState, useEffect, useRef } from 'react';
import { Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

interface DriverGpsLayerProps {
  onUpdate: (data: { location: string; speed: number; nextStop: string }) => void;
}

const ROUTE_POINTS: [number, number][] = [
  [5.5244, 7.5244],
  [5.4244, 7.4744],
  [5.3244, 7.4244],
  [5.2244, 7.3744],
  [5.1167, 7.3667],
];

const STOP_NAMES = [
  'Ubakala Junction',
  'Osisioma',
  'Aba Road',
  'Aba City Terminal',
  'Umuahia Main Park',
];

const driverIcon = L.divIcon({
  className: 'custom-driver-icon',
  html: '<div style="background-color: #16a34a; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(22,163,74,0.5);"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function PanToPosition({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.panTo(position);
  }, [map, position]);
  return null;
}

function DriverGpsLayer({ onUpdate }: DriverGpsLayerProps) {
  const [step, setStep] = useState(0);
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => {
        const next = (prev + 1) % ROUTE_POINTS.length;
        const locationLabels = ['Umuahia Main Park', 'Ubakala Junction', 'Osisioma', 'Approaching Aba Road', 'Aba City Terminal'];
        const nextStopIdx = (next + 1) % ROUTE_POINTS.length;
        onUpdateRef.current?.({
          location: locationLabels[next],
          speed: Math.floor(Math.random() * 20) + 30,
          nextStop: `${STOP_NAMES[nextStopIdx]} (${(Math.random() * 2 + 1).toFixed(1)} km)`,
        });
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const currentPosition = ROUTE_POINTS[step];

  return (
    <>
      <Marker position={currentPosition} icon={driverIcon}>
        <Popup>
          <b>Your Bus #AB-101</b><br />
          Current Position
        </Popup>
      </Marker>
      <PanToPosition position={currentPosition} />
      <Polyline positions={ROUTE_POINTS} pathOptions={{ color: '#16a34a', weight: 4, opacity: 0.7, dashArray: '10 10' }} />
      {ROUTE_POINTS.map((point, i) => (
        <Marker key={i} position={point}>
          <Popup><b>{STOP_NAMES[i]}</b></Popup>
        </Marker>
      ))}
    </>
  );
}

export default DriverGpsLayer;
