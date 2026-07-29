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
  throughputFactor: number;
}

interface SolarStation {
  id: string;
  name: string;
  chargers: number;
}

const SOLAR_STATIONS: SolarStation[] = [
  { id: 'Umuahia-Terminal', name: 'Umuahia Solar Terminal', chargers: 4 },
  { id: 'Aba-Terminal', name: 'Aba Solar Terminal', chargers: 4 },
];

export function getSolarThroughput(): number {
  const hour = new Date().getHours();
  if (hour >= 11 && hour <= 14) return 1.0;
  if (hour >= 8 && hour <= 16) return 0.85;
  if (hour >= 6 && hour <= 17) return 0.55;
  return 0.2;
}

export function dispatchToCharger(busId: string, currentSoC: number): ChargeSlot | null {
  if (currentSoC > 20) return null;
  const throughputFactor = getSolarThroughput();
  const station = SOLAR_STATIONS.reduce((a, b) => a.chargers < b.chargers ? a : b);
  const effectiveChargers = Math.round(station.chargers * throughputFactor);
  return {
    stationId: station.id,
    stationName: station.name,
    estimatedWaitMinutes: effectiveChargers > 0 ? Math.max(5, Math.round(15 / throughputFactor)) : 60,
    chargersAvailable: Math.max(0, effectiveChargers),
    throughputFactor,
  };
}

export function estimateChargeTime(currentSoC: number, targetSoC: number = 90): number {
  const throughputFactor = getSolarThroughput();
  const deficit = targetSoC - currentSoC;
  const baseMinutesPerPct = 1.2;
  return Math.round((deficit * baseMinutesPerPct) / Math.max(0.2, throughputFactor));
}
