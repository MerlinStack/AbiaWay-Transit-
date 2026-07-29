import { FleetBus } from '../types/abssin';

const PLATES = [
  'ABN-101X', 'ABN-102Y', 'ABN-103Z', 'ABN-104W', 'ABN-105V',
  'ABN-106U', 'ABN-107T', 'ABN-108S', 'ABN-109R', 'ABN-110Q',
  'ABN-111P', 'ABN-112O', 'ABN-113N', 'ABN-114M', 'ABN-115L',
  'ABN-116K', 'ABN-117J', 'ABN-118H', 'ABN-119G', 'ABN-120F',
  'ABN-121E', 'ABN-122D', 'ABN-123C', 'ABN-124B', 'ABN-125A',
  'ABN-126Z', 'ABN-127Y', 'ABN-128X', 'ABN-129W', 'ABN-130V',
  'ABN-131U', 'ABN-132T', 'ABN-133S', 'ABN-134R', 'ABN-135Q',
  'ABN-136P', 'ABN-137O', 'ABN-138N', 'ABN-139M', 'ABN-140L',
];

const ROUTE_IDS = [
  'Umuahia-Aba', 'Aba-Umuahia', 'Umuahia-Ohafia',
  'Ohafia-Umuahia', 'Umuahia-Ugwogo', 'Aba-Owerri',
];

const STATUSES: FleetBus['status'][] = ['active', 'charging', 'idle', 'maintenance'];

const generateFleet = (count: number): FleetBus[] =>
  Array.from({ length: count }, (_, i) => {
    const batterySoC = Math.floor(Math.random() * 40) + 60;
    return {
      id: `BUS-${String(i + 1).padStart(3, '0')}`,
      plateNumber: PLATES[i % PLATES.length],
      capacity: 40,
      batterySoC,
      rangeKm: Math.floor((batterySoC / 100) * 300),
      status: i < 32 ? 'active' : (i < 36 ? 'charging' : (i < 38 ? 'idle' : 'maintenance')),
      driverId: i < 32 ? `DRV-${String(i + 1).padStart(3, '0')}` : null,
      coPilotId: i < 32 ? `COP-${String(i + 1).padStart(3, '0')}` : null,
      routeId: i < 32 ? ROUTE_IDS[i % ROUTE_IDS.length] : null,
      lastHealthCheck: i < 32 ? new Date().toISOString() : null,
      cctvFunctional: i >= 36 ? false : true,
      emergencyExitFunctional: i >= 38 ? false : true,
      currentLoop: Math.floor(Math.random() * 6),
      maxLoopsPerCharge: Math.floor(batterySoC / 16),
    };
  });

export const FLEET: FleetBus[] = generateFleet(40);
export const ACTIVE_FLEET = FLEET.filter((b) => b.status === 'active');
export const FLEET_SCALING_TARGET = 120;

export const getBatteryColor = (soc: number): string => {
  if (soc >= 80) return '#22c55e';
  if (soc >= 60) return '#eab308';
  if (soc >= 40) return '#f97316';
  return '#ef4444';
};

export const setBusStatus = (plate: string, status: FleetBus['status']): boolean => {
  const bus = FLEET.find((b) => b.plateNumber === plate);
  if (!bus) return false;
  bus.status = status;
  if (status === 'maintenance') {
    bus.driverId = null;
    bus.coPilotId = null;
    bus.routeId = null;
  }
  return true;
};

export const getFleetSummary = () => ({
  total: FLEET.length,
  active: FLEET.filter((b) => b.status === 'active').length,
  charging: FLEET.filter((b) => b.status === 'charging').length,
  maintenance: FLEET.filter((b) => b.status === 'maintenance').length,
  idle: FLEET.filter((b) => b.status === 'idle').length,
  avgBattery: Math.round(FLEET.reduce((s, b) => s + b.batterySoC, 0) / FLEET.length),
});
