import { create } from 'zustand';
import L from 'leaflet';

interface MapState {
  map: L.Map | null;
  vehicle: L.Marker | null;
  isTracking: boolean;
  busMarkers: L.Marker[];
  setMap: (map: L.Map | null) => void;
  setVehicle: (vehicle: L.Marker | null) => void;
  setIsTracking: (isTracking: boolean) => void;
  centerMap: (coords: L.LatLngExpression) => void;
  addBusMarker: (marker: L.Marker) => void;
  clearBusMarkers: () => void;
}

const useMapStore = create<MapState>((set, get) => ({
  map: null,
  vehicle: null,
  isTracking: false,
  busMarkers: [],

  setMap: (map) => set({ map }),
  setVehicle: (vehicle) => set({ vehicle }),
  setIsTracking: (isTracking) => set({ isTracking }),

  centerMap: (coords) => {
    const map = get().map;
    if (map) {
      map.setView(coords, 13);
    }
  },

  addBusMarker: (marker) => {
    set((state) => ({ busMarkers: [...state.busMarkers, marker] }));
  },

  clearBusMarkers: () => {
    const { map, busMarkers } = get();
    busMarkers.forEach((marker) => {
      if (map) map.removeLayer(marker);
    });
    set({ busMarkers: [] });
  },
}));

export default useMapStore;
