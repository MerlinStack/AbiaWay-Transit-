import { useState, useEffect, useRef } from 'react';
import { Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

interface DriverGpsLayerProps {
  onUpdate: (data: { location: string; speed: number; nextStop: string }) => void;
}

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
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
  const onUpdateRef = useRef(onUpdate);
  const watchIdRef = useRef<number | null>(null);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by this browser');
      return;
    }

    const onSuccess = (pos: GeolocationPosition) => {
      const { latitude, speed } = pos.coords;
      const coords: [number, number] = [latitude, pos.coords.longitude];
      setPosition(coords);
      setError(null);

      setRoutePoints((prev) => {
        const next = [...prev, coords];
        return next.length > 100 ? next.slice(-100) : next;
      });

      const speedKmh = speed !== null && speed !== undefined ? Math.round(speed * 3.6) : 0;
      onUpdateRef.current({
        location: `${latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
        speed: speedKmh,
        nextStop: '—',
      });
    };

    const onError = (err: GeolocationPositionError) => {
      setError(err.message);
    };

    watchIdRef.current = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000,
    });

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  if (error) {
    return (
      <div className="absolute bottom-2 left-2 bg-red-500/80 text-white text-xs px-2 py-1 rounded z-[1000]">
        GPS: {error}
      </div>
    );
  }

  if (!position) return null;

  return (
    <>
      <Marker position={position} icon={driverIcon}>
        <Popup>
          <b>{`${position[0].toFixed(4)}, ${position[1].toFixed(4)}`}</b><br />
          Current Position
        </Popup>
      </Marker>
      <PanToPosition position={position} />
      {routePoints.length > 1 && (
        <Polyline positions={routePoints} pathOptions={{ color: '#16a34a', weight: 4, opacity: 0.7, dashArray: '10 10' }} />
      )}
    </>
  );
}

export default DriverGpsLayer;
