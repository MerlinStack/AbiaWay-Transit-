export interface ABSSINProfile {
  abssin: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  lga: string;
  verified: boolean;
  registeredAt: string;
}

export interface TransitWallet {
  abssin: string;
  balance: number;
  nfcCardId: string;
  qrCode: string;
  status: 'active' | 'suspended' | 'blocked';
  lastTopUp: string;
}

export interface BusStop {
  id: string;
  name: string;
  type: 'terminal' | 'stop';
  lat: number;
  lng: number;
  solarCharger: boolean;
  routes: string[];
}

export interface FleetBus {
  id: string;
  plateNumber: string;
  capacity: number;
  batterySoC: number;
  rangeKm: number;
  status: 'active' | 'charging' | 'maintenance' | 'idle';
  driverId: string | null;
  coPilotId: string | null;
  routeId: string | null;
  lastHealthCheck: string | null;
  cctvFunctional: boolean;
  emergencyExitFunctional: boolean;
  currentLoop: number;
  maxLoopsPerCharge: number;
}

export interface HealthCheckRecord {
  busId: string;
  driverId: string;
  timestamp: string;
  batteryOk: boolean;
  cctvOk: boolean;
  emergencyExitOk: boolean;
  tiresOk: boolean;
  lightsOk: boolean;
  signature: string;
}

export interface ConductorTransaction {
  id: string;
  abssin: string;
  busId: string;
  routeId: string;
  fare: number;
  type: 'tap_in' | 'tap_out';
  timestamp: string;
  validated: boolean;
  offlineSync: boolean;
}
