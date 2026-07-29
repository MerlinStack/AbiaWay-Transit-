import { memo, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const MapZoomControl = memo(() => {
  const map = useMap();
  useEffect(() => {
    L.control.zoom({ position: 'topright' }).addTo(map);
    L.control.scale({ imperial: false, metric: true, position: 'bottomleft' }).addTo(map);
  }, [map]);
  return null;
});

export { MapZoomControl };
