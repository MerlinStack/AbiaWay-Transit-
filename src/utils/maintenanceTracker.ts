export type CheckItemKey =
  | 'batterySoC' | 'cctv' | 'emergencyExits' | 'tires'
  | 'headlights' | 'horn' | 'fireExtinguisher' | 'firstAid';

interface CheckEvent {
  plate: string;
  timestamp: number;
  passed: CheckItemKey[];
  failed: CheckItemKey[];
}

interface BusCheckHistory {
  plate: string;
  events: CheckEvent[];
}

const HISTORY_KEY = 'abiaway_check_history';
const MAX_EVENTS_PER_PLATE = 30;
const MAX_RETENTION_DAYS = 14;

function loadHistory(): Record<string, BusCheckHistory> {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
  } catch { return {}; }
}

function saveHistory(h: Record<string, BusCheckHistory>): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
  } catch (e) {
    console.error('Storage quota exceeded — clearing oldest plate data');
    const plates = Object.keys(h);
    if (plates.length > 0) {
      delete h[plates[0]];
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); }
      catch { localStorage.removeItem(HISTORY_KEY); }
    }
  }
}

export function recordCheckEvent(plate: string, passed: CheckItemKey[], failed: CheckItemKey[]): void {
  const history = loadHistory();
  const cutoff = Date.now() - MAX_RETENTION_DAYS * 86400000;

  if (!history[plate]) history[plate] = { plate, events: [] };

  history[plate].events.push({ plate, timestamp: Date.now(), passed, failed });

  history[plate].events = history[plate].events
    .filter((e) => e.timestamp > cutoff)
    .slice(-MAX_EVENTS_PER_PLATE);

  Object.keys(history).forEach((p) => {
    history[p].events = history[p].events
      .filter((e) => e.timestamp > cutoff)
      .slice(-MAX_EVENTS_PER_PLATE);
    if (history[p].events.length === 0) delete history[p];
  });

  saveHistory(history);
}

export function getConsecutiveFailures(plate: string, item: CheckItemKey): number {
  const bus = loadHistory()[plate];
  if (!bus) return 0;
  const recent = bus.events.slice(-3);
  return recent.filter((e) => e.failed.includes(item)).length;
}

export function isMaintenanceRequired(plate: string, threshold: number = 3): CheckItemKey[] {
  const bus = loadHistory()[plate];
  if (!bus) return [];
  return (['batterySoC', 'cctv', 'emergencyExits', 'tires', 'headlights', 'horn', 'fireExtinguisher', 'firstAid'] as CheckItemKey[])
    .filter((item) => getConsecutiveFailures(plate, item) >= threshold);
}
