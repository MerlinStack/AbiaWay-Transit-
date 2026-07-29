import { calculateRealWorldRange, getSolarThroughput, dispatchToCharger, estimateChargeTime } from './telemetry';
import { verifyRollingTicketQrWithSkew, generateRollingTicketQr } from './secureTicketQr';
import { recordCheckEvent, isMaintenanceRequired, getConsecutiveFailures } from './maintenanceTracker';
import { LeakyBucketSync } from './syncEngine';
import { TelemetrySyncEngine } from './telemetrySync';
import type { TransportMode } from './telemetrySync';
import { FLEET, getFleetSummary, getBatteryColor, setBusStatus } from '../data/fleet';

export function runSystemSmokeTest(): string {
  console.log('--- Abia Transit OS End-to-End Test ---');

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, label: string) => {
    if (condition) { passed++; console.log(`  PASS: ${label}`); }
    else { failed++; console.error(`  FAIL: ${label}`); }
  };

  assert(calculateRealWorldRange({ busId: 'BUS-001', currentSoC: 45, currentPassengers: 40, isAcOn: true }).adjustedRangeKm <
    calculateRealWorldRange({ busId: 'BUS-001', currentSoC: 45, currentPassengers: 40, isAcOn: true }).nominalRangeKm,
    'Passenger + AC load reduces adjusted range below nominal');

  assert(calculateRealWorldRange({ busId: 'BUS-001', currentSoC: 10, currentPassengers: 0, isAcOn: false }).chargeUrgency === 'CRITICAL',
    'SoC ≤ 15 triggers CRITICAL urgency');

  assert(calculateRealWorldRange({ busId: 'BUS-001', currentSoC: 25, currentPassengers: 0, isAcOn: false }).chargeUrgency === 'WARNING',
    'SoC ≤ 35 triggers WARNING urgency');

  assert(getSolarThroughput() >= 0.2 && getSolarThroughput() <= 1.0,
    'Solar throughput factor within [0.2, 1.0] range');

  assert(dispatchToCharger('BUS-001', 18) !== null,
    'dispatchToCharger returns slot for SoC ≤ 20');

  assert(dispatchToCharger('BUS-001', 25) === null,
    'dispatchToCharger returns null for SoC > 20');

  assert(estimateChargeTime(20, 90) > 0,
    'estimateChargeTime returns positive duration');

  const activeSolar = getSolarThroughput();
  const noonEstimate = estimateChargeTime(20, 90);
  assert(noonEstimate > 0, 'Charge time computed at current solar throughput');

  assert(verifyRollingTicketQrWithSkew(btoa(JSON.stringify({
    abssin: '123456789012', walletBalance: 1500,
    timestamp: Date.now() - 45000, nonce: 'test',
  })), 30, 2).isValid, '45s clock skew absorbed with 2 drift windows');

  assert(verifyRollingTicketQrWithSkew(btoa(JSON.stringify({
    abssin: '123456789012', walletBalance: 1500,
    timestamp: Date.now() - 180000, nonce: 'test',
  })), 30, 2).isValid === false, '180s clock skew properly rejected');

  const qr = generateRollingTicketQr('123456789012', 2000);
  const decoded = JSON.parse(atob(qr));
  assert(decoded.abssin === '123456789012' && decoded.walletBalance === 2000,
    'generateRollingTicketQr encodes ABSSIN + balance correctly');

  recordCheckEvent('TEST-001', ['batterySoC', 'cctv'], ['tires']);
  assert(getConsecutiveFailures('TEST-001', 'tires') >= 1,
    'recordCheckEvent writes failure and getConsecutiveFailures reads it');

  const flagged = isMaintenanceRequired('TEST-001', 1);
  assert(flagged.includes('tires'), 'isMaintenanceRequired flags tires after 1 failure at threshold=1');

  assert(FLEET.length === 40, 'FLEET has 40 buses');

  const summary = getFleetSummary();
  assert(summary.total === 40, 'getFleetSummary total is 40');
  assert(summary.active + summary.charging + summary.idle + summary.maintenance === 40,
    'Status categories sum to 40');

  assert(getBatteryColor(85) === '#22c55e', 'getBatteryColor 85% returns green');
  assert(getBatteryColor(70) === '#eab308', 'getBatteryColor 70% returns yellow');
  assert(getBatteryColor(50) === '#f97316', 'getBatteryColor 50% returns orange');
  assert(getBatteryColor(20) === '#ef4444', 'getBatteryColor 20% returns red');

  assert(setBusStatus('ABN-101X', 'maintenance') === true, 'setBusStatus finds and updates plate');
  assert(setBusStatus('NONEXISTENT', 'maintenance') === false, 'setBusStatus returns false for unknown plate');

  const syncEngine = new LeakyBucketSync<{ id: string; payload: string; retryCount: number; lastAttempt: number | null }>();
  syncEngine.enqueue({ id: 'T1', payload: 'test', retryCount: 0, lastAttempt: null });
  syncEngine.enqueue({ id: 'T2', payload: 'test2', retryCount: 0, lastAttempt: null });
  assert(syncEngine.pending === 2, 'LeakyBucketSync queues records');

  console.log(`\n--- Results: ${passed} passed, ${failed} failed ---`);
  return failed === 0 ? 'PASS' : 'FAIL';
}

export function runTelemetryFallbackAssertions(): Promise<string> {
  return new Promise((resolve) => {
    console.log('\n--- Telemetry Fallback Assertions ---');
    const observedModes: TransportMode[] = [];

    const engine = new TelemetrySyncEngine(
      {
        wsUrl: 'ws://invalid-unreachable:9999/ws',
        sseUrl: 'http://invalid-unreachable:9999/sse',
        pollUrl: 'http://invalid-unreachable:9999/poll',
        pollIntervalMs: 5000,
        maxRetries: 0,
      },
      () => {},
      (mode) => { observedModes.push(mode); },
    );

    engine.connect();

    setTimeout(() => {
      engine.cleanup();
      const reachedPoll = observedModes.includes('LONG_POLL');
      if (reachedPoll) {
        console.log('  PASS: Telemetry fallback degraded DISCONNECTED → SSE → LONG_POLL');
        resolve('PASS');
      } else {
        console.error('  FAIL: Fallback chain did not reach LONG_POLL. Modes seen:', observedModes);
        resolve('FAIL');
      }
    }, 800);
  });
}
