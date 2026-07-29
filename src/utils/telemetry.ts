export interface FleetTelemetryUpdate {
  busId: string;
  currentSoC: number;
  currentPassengers: number;
  isAcOn: boolean;
}

export interface CalculatedRangeMetrics {
  nominalRangeKm: number;
  adjustedRangeKm: number;
  chargeUrgency: 'CRITICAL' | 'WARNING' | 'OPTIMAL';
}

const MAX_NOMINAL_RANGE = 300;
const MAX_CAPACITY = 40;
const WEIGHT_PENALTY_FACTOR = 0.15;
const AC_PENALTY_FACTOR = 0.10;

export function calculateRealWorldRange(telemetry: FleetTelemetryUpdate): CalculatedRangeMetrics {
  const nominalRangeKm = (telemetry.currentSoC / 100) * MAX_NOMINAL_RANGE;
  const loadPenalty = (telemetry.currentPassengers / MAX_CAPACITY) * WEIGHT_PENALTY_FACTOR;
  const acPenalty = telemetry.isAcOn ? AC_PENALTY_FACTOR : 0;
  const efficiencyModifier = 1.0 - (loadPenalty + acPenalty);
  const adjustedRangeKm = Math.max(0, Math.round(nominalRangeKm * efficiencyModifier * 100) / 100);

  let chargeUrgency: 'CRITICAL' | 'WARNING' | 'OPTIMAL' = 'OPTIMAL';
  if (telemetry.currentSoC <= 15) chargeUrgency = 'CRITICAL';
  else if (telemetry.currentSoC <= 35) chargeUrgency = 'WARNING';

  return { nominalRangeKm, adjustedRangeKm, chargeUrgency };
}

export type EfficiencyTrend = 'declining' | 'stable' | 'improving';

export interface ChargeSlot {
  stationId: string;
  stationName: string;
  estimatedWaitMinutes: number;
  chargersAvailable: number;
}

const SOLAR_STATIONS = [
  { id: 'Umuahia-Terminal', name: 'Umuahia Solar Terminal', chargers: 4 },
  { id: 'Aba-Terminal', name: 'Aba Solar Terminal', chargers: 4 },
];

export function dispatchToCharger(busId: string, currentSoC: number): ChargeSlot | null {
  if (currentSoC > 20) return null;
  const station = SOLAR_STATIONS.reduce((a, b) => a.chargers < b.chargers ? a : b);
  return {
    stationId: station.id,
    stationName: station.name,
    estimatedWaitMinutes: Math.max(0, 15 - station.chargers * 5),
    chargersAvailable: station.chargers,
  };
}
