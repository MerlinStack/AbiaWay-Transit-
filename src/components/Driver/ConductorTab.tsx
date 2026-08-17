import { ScanLine } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { generateSecuredTicket } from '../../utils/cryptoSync';
import { LeakyBucketSync, atomicIndexedDbWrite } from '../../utils/syncEngine';
import { verifyRollingTicketQr } from '../../utils/secureTicketQr';
import useNotificationStore from '../../stores/notificationStore';

interface TapRecord {
  id: string;
  abssin: string;
  passengerName: string;
  route: string;
  fare: number;
  sectorTag: string;
  timestamp: string;
  verificationHash: string;
  synced: boolean;
  retryCount: number;
  lastAttempt: number | null;
  payload: unknown;
}

const ROUTES = ['Umuahia → Aba', 'Aba → Umuahia', 'Umuahia → Ohafia', 'Ohafia → Umuahia'];
const LOCAL_FARE = 150;
const DEVICE_SECRET = 'abia-green-shuttle-2026-v1';

const SECTOR_TAGS: Record<string, string> = {
  'Umuahia → Aba': 'UmuahiaNorth-AbaNorth',
  'Aba → Umuahia': 'AbaNorth-UmuahiaNorth',
  'Umuahia → Ohafia': 'UmuahiaNorth-Ohafia',
  'Ohafia → Umuahia': 'Ohafia-UmuahiaNorth',
};

const TAP_DB = 'ConductorOfflineDB';
const TAP_STORE = 'tapRecords';

const ConductorTab = () => {
  const [abssinInput, setAbssinInput] = useState('');
  const [qrInput, setQrInput] = useState('');
  const [selectedRoute, setSelectedRoute] = useState(ROUTES[0]);
  const [records, setRecords] = useState<TapRecord[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'done'>('idle');
  const syncEngineRef = useRef(new LeakyBucketSync<TapRecord>());
  const showNotification = useNotificationStore((s) => s.showNotification);

  useEffect(() => {
    const load = async () => {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const req = indexedDB.open(TAP_DB, 1);
        req.onupgradeneeded = () => {
          const d = req.result;
          if (!d.objectStoreNames.contains(TAP_STORE)) {
            d.createObjectStore(TAP_STORE, { keyPath: 'id' });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      const tx = db.transaction(TAP_STORE, 'readonly');
      const store = tx.objectStore(TAP_STORE);
      const all = store.getAll();
      all.onsuccess = () => {
        setRecords((all.result as TapRecord[]) || []);
        db.close();
      };
    };
    load();
  }, []);

  const handleTapAbssin = useCallback(async () => {
    const digits = abssinInput.replace(/\D/g, '');
    if (digits.length !== 12) {
      showNotification('Error', 'Scan or enter a valid 12-digit ABSSIN', 'error');
      return;
    }
    setIsProcessing(true);
    const unhashed = {
      ticketId: `TAP-${Date.now()}`,
      abssin: digits,
      fareCharged: LOCAL_FARE,
      timestamp: Date.now(),
      conductorId: 'COND-001',
      routeId: selectedRoute,
    };
    const secured = await generateSecuredTicket(unhashed, DEVICE_SECRET);
    await new Promise((r) => setTimeout(r, 400));
    const newRecord: TapRecord = {
      id: secured.ticketId,
      abssin: secured.abssin,
      passengerName: `Passenger ${secured.abssin.slice(-4)}`,
      route: selectedRoute,
      fare: secured.fareCharged,
      sectorTag: SECTOR_TAGS[selectedRoute] || 'Unmapped',
      timestamp: new Date(secured.timestamp).toISOString(),
      verificationHash: secured.verificationHash,
      payload: null,
      synced: false,
      retryCount: 0,
      lastAttempt: null,
    };
    setRecords((prev) => [newRecord, ...prev]);
    syncEngineRef.current.enqueue(newRecord);
    const written = await atomicIndexedDbWrite(TAP_DB, TAP_STORE, [newRecord]);
    if (!written) {
      setRecords((prev) => prev.filter((r) => r.id !== newRecord.id));
      showNotification('Atomic Write Failed', 'Tap rolled back — try again', 'error');
    } else {
      showNotification('Tap Recorded', `₦${LOCAL_FARE} — ${selectedRoute} [${newRecord.sectorTag}]`, 'success');
    }
    setAbssinInput('');
    setIsProcessing(false);
  }, [abssinInput, selectedRoute, showNotification]);

  const handleQrScan = useCallback(async () => {
    const result = await verifyRollingTicketQr(qrInput);
    if (!result.isValid) {
      showNotification('Invalid QR', result.error === 'EXPIRED' ? 'QR code expired (30s window)' : result.error === 'FORGED' ? 'QR signature invalid' : 'Malformed QR data', 'error');
      return;
    }
    setAbssinInput(result.payload!.abssin);
    showNotification('QR Scanned', `ABSSIN ${result.payload!.abssin.slice(0, 6)}••••••`, 'success');
    setQrInput('');
  }, [qrInput, showNotification]);

  const handleSync = useCallback(async () => {
    setSyncStatus('syncing');
    const syncedIds: string[] = [];
    const { synced, failed } = await syncEngineRef.current.flush(async (batch) => {
      await new Promise((r) => setTimeout(r, 600));
      batch.forEach((b) => syncedIds.push(b.id));
      return true;
    });
    if (synced > 0) {
      setRecords((prev) => prev.map((r) => syncedIds.includes(r.id) ? { ...r, synced: true } : r));
    }
    setSyncStatus('done');
    showNotification('Sync Complete', `${synced} uploaded, ${failed} failed`, failed > 0 ? 'error' : 'success');
    setTimeout(() => setSyncStatus('idle'), 2000);
  }, [showNotification]);

  const syncEngine = syncEngineRef.current;
  useEffect(() => {
    const interval = setInterval(() => {
      if (syncEngine.pending > 0) handleSync();
    }, 30000);
    return () => clearInterval(interval);
  }, [syncEngine, handleSync]);

  const totalFare = records.reduce((s, r) => s + r.fare, 0);
  const syncedCount = records.filter((r) => r.synced).length;
  const sectorBreakdown = records.reduce<Record<string, number>>((acc, r) => {
    acc[r.sectorTag] = (acc[r.sectorTag] || 0) + r.fare;
    return acc;
  }, {});

  return (
    <div className="glass-card p-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <ScanLine className="text-primary" />
          Conductor Tap Validation
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-400">Today: <span className="text-white font-semibold">₦{totalFare.toLocaleString()}</span></span>
          <span className="text-gray-400">Riders: <span className="text-white font-semibold">{records.length}</span></span>
          <span className={`text-xs px-2 py-1 rounded-full ${syncedCount === records.length && records.length > 0 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
            {syncedCount}/{records.length} synced
          </span>
          {syncEngineRef.current.pending > 0 && (
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">{syncEngineRef.current.pending} queued</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <input type="text" value={abssinInput}
                onChange={(e) => setAbssinInput(e.target.value.replace(/\D/g, '').slice(0, 12))}
                placeholder="Scan NFC card or type 12-digit ABSSIN" maxLength={12}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-center tracking-widest" />
            </div>
            <button className="btn-primary px-6 py-3 rounded-lg whitespace-nowrap"
              onClick={handleTapAbssin} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Tap'}
            </button>
          </div>

          <div className="flex gap-2 flex-wrap">
            <select value={selectedRoute} onChange={(e) => setSelectedRoute(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm">
              {ROUTES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <button className={`px-4 py-2 rounded-lg text-sm transition ${isScanning ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-white/10 hover:bg-white/20'}`}
              onClick={() => setIsScanning(!isScanning)}>
              {isScanning ? 'Scanning...' : 'Scan NFC'}
            </button>
          </div>

          <div className="flex gap-3">
            <input type="text" value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              placeholder="Paste QR code data from passenger ticket" maxLength={300}
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm" />
            <button className="btn-secondary px-4 py-2 rounded-lg text-sm" onClick={handleQrScan}>
              Verify QR
            </button>
          </div>

          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {records.length === 0 && (
              <p className="text-center text-gray-500 py-12">No taps yet today. Tap a passenger ABSSIN to begin.</p>
            )}
            {records.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${r.synced ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <div>
                    <p className="text-sm font-semibold">{r.passengerName}</p>
                    <p className="text-xs text-gray-400">ABSSIN: {r.abssin.slice(0, 6)}••••••</p>
                    <p className="text-xs text-gray-500">{r.sectorTag}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">₦{r.fare}</p>
                  <p className="text-xs text-gray-500">{r.route}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-white/5 rounded-lg">
            <h4 className="text-sm font-semibold mb-3">LGA Sector Revenue</h4>
            <div className="space-y-2 text-sm">
              {Object.entries(sectorBreakdown).map(([sector, amount]) => (
                <div key={sector} className="flex justify-between">
                  <span className="text-gray-400 text-xs">{sector}</span>
                  <span className="font-semibold">₦{amount.toLocaleString()}</span>
                </div>
              ))}
              {Object.keys(sectorBreakdown).length === 0 && (
                <p className="text-xs text-gray-500">No revenue data yet</p>
              )}
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <h4 className="text-sm font-semibold mb-3">Revenue</h4>
            <p className="text-3xl font-bold text-primary">₦{totalFare.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">₦{LOCAL_FARE} flat fare per tap</p>
          </div>

          <button className="w-full btn-primary py-3 rounded-lg disabled:opacity-50"
            onClick={handleSync} disabled={syncStatus === 'syncing' || records.every((r) => r.synced)}>
            {syncStatus === 'syncing' ? `Syncing (${syncEngineRef.current.pending} queued)...` : 'Sync Offline Records'}
          </button>
          {syncEngineRef.current.pending > 0 && (
            <p className="text-xs text-gray-500 text-center">{syncEngineRef.current.pending} records in leaky-bucket queue (15/batch)</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConductorTab;
