import { create } from 'zustand';

export type TripStatus = 'idle' | 'active' | 'paused' | 'ended';
export type BusCapacity = 'empty' | 'medium' | 'full';

interface TripSummary {
  tripId: string;
  durationSeconds: number;
  distanceKm: number;
  passengers: number;
  fareCollected: number;
  busStatus: BusCapacity | null;
}

interface TripState {
  status: TripStatus;
  tripId: string | null;
  startedAt: number | null;
  pausedAt: number | null;
  elapsedSeconds: number;
  distanceKm: number;
  passengers: number;
  fareCollected: number;
  busStatus: BusCapacity | null;
  lastSummary: TripSummary | null;
  startTrip: () => void;
  pauseTrip: () => void;
  resumeTrip: () => void;
  endTrip: () => TripSummary;
  resetTrip: () => void;
  tick: (deltaSeconds: number, speedKmh: number) => void;
  setBusStatus: (status: BusCapacity) => void;
  addPassenger: () => void;
  removePassenger: () => void;
}

const FARE_PER_PASSENGER = 300;

const useTripStore = create<TripState>((set, get) => ({
  status: 'idle',
  tripId: null,
  startedAt: null,
  pausedAt: null,
  elapsedSeconds: 0,
  distanceKm: 0,
  passengers: 0,
  fareCollected: 0,
  busStatus: null,
  lastSummary: null,

  startTrip: () => {
    set({
      status: 'active',
      tripId: `TRIP-${Date.now()}`,
      startedAt: Date.now(),
      pausedAt: null,
      elapsedSeconds: 0,
      distanceKm: 0,
      passengers: 0,
      fareCollected: 0,
      busStatus: null,
      lastSummary: null,
    });
  },

  pauseTrip: () => {
    if (get().status !== 'active') return;
    set({ status: 'paused', pausedAt: Date.now() });
  },

  resumeTrip: () => {
    if (get().status !== 'paused') return;
    set({ status: 'active', pausedAt: null });
  },

  endTrip: () => {
    const state = get();
    const summary: TripSummary = {
      tripId: state.tripId || `TRIP-${Date.now()}`,
      durationSeconds: state.elapsedSeconds,
      distanceKm: state.distanceKm,
      passengers: state.passengers,
      fareCollected: state.fareCollected,
      busStatus: state.busStatus,
    };
    set({ status: 'ended', lastSummary: summary });
    return summary;
  },

  resetTrip: () => {
    set({
      status: 'idle',
      tripId: null,
      startedAt: null,
      pausedAt: null,
      elapsedSeconds: 0,
      distanceKm: 0,
      passengers: 0,
      fareCollected: 0,
      busStatus: null,
      lastSummary: null,
    });
  },

  tick: (deltaSeconds, speedKmh) => {
    if (get().status !== 'active') return;
    set((state) => ({
      elapsedSeconds: state.elapsedSeconds + deltaSeconds,
      distanceKm: state.distanceKm + (speedKmh / 3600) * deltaSeconds,
    }));
  },

  setBusStatus: (status) => {
    if (get().status !== 'active') return;
    set({ busStatus: status });
  },

  addPassenger: () => {
    if (get().status !== 'active') return;
    set((state) => ({
      passengers: state.passengers + 1,
      fareCollected: state.fareCollected + FARE_PER_PASSENGER,
    }));
  },

  removePassenger: () => {
    if (get().status !== 'active') return;
    set((state) => ({
      passengers: Math.max(0, state.passengers - 1),
      fareCollected: Math.max(0, state.fareCollected - FARE_PER_PASSENGER),
    }));
  },
}));

export default useTripStore;