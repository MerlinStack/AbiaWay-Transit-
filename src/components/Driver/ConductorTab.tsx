import { useState } from 'react';
import useNotificationStore from '../../stores/notificationStore';

interface TapRecord {
  id: string;
  abssin: string;
  passengerName: string;
  route: string;
  fare: number;
  timestamp: string;
  synced: boolean;
}

const ROUTES = ['Umuahia → Aba', 'Aba → Umuahia', 'Umuahia → Ohafia', 'Ohafia → Umuahia'];
const LOCAL_FARE = 150;

const ConductorTab = () => {
  const [abssinInput, setAbssinInput] = useState('');
  const [selectedRoute, setSelectedRoute] = useState(ROUTES[0]);
  const [records, setRecords] = useState<TapRecord[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const showNotification = useNotificationStore((s) => s.showNotification);

  const handleTapAbssin = async () => {
    const digits = abssinInput.replace(/\D/g, '');
    if (digits.length !== 12) {
      showNotification('Error', 'Scan or enter a valid 12-digit ABSSIN', 'error');
      return;
    }
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 800));
    const newRecord: TapRecord = {
      id: `TAP-${Date.now()}`,
      abssin: digits,
      passengerName: `Passenger ${digits.slice(-4)}`,
      route: selectedRoute,
      fare: LOCAL_FARE,
      timestamp: new Date().toISOString(),
      synced: false,
    };
    setRecords((prev) => [newRecord, ...prev]);
    setAbssinInput('');
    setIsProcessing(false);
    showNotification('Tap Recorded', `₦${LOCAL_FARE} — ${selectedRoute}`, 'success');
  };

  const handleSync = async () => {
    const unsynced = records.filter((r) => !r.synced);
    if (unsynced.length === 0) { showNotification('All Synced', 'No pending records', 'success'); return; }
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setRecords((prev) => prev.map((r) => r.synced ? r : { ...r, synced: true }));
    setIsProcessing(false);
    showNotification('Synced', `${unsynced.length} records uploaded`, 'success');
  };

  const totalFare = records.reduce((s, r) => s + r.fare, 0);
  const syncedCount = records.filter((r) => r.synced).length;

  return (
    <div className="glass-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <i data-lucide="scan-line" className="text-primary"></i>
          Conductor Tap Validation
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-400">Today: <span className="text-white font-semibold">₦{totalFare.toLocaleString()}</span></span>
          <span className="text-gray-400">Riders: <span className="text-white font-semibold">{records.length}</span></span>
          <span className={`text-xs px-2 py-1 rounded-full ${syncedCount === records.length && records.length > 0 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
            {syncedCount}/{records.length} synced
          </span>
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
            <h4 className="text-sm font-semibold mb-3">Route Summary</h4>
            <div className="space-y-2 text-sm">
              {ROUTES.map((r) => {
                const count = records.filter((rec) => rec.route === r).length;
                return (
                  <div key={r} className="flex justify-between">
                    <span className="text-gray-400">{r}</span>
                    <span className="font-semibold">{count} riders</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <h4 className="text-sm font-semibold mb-3">Revenue</h4>
            <p className="text-3xl font-bold text-primary">₦{totalFare.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">₦{LOCAL_FARE} flat fare per tap</p>
          </div>

          <button className="w-full btn-primary py-3 rounded-lg disabled:opacity-50"
            onClick={handleSync} disabled={isProcessing || records.every((r) => r.synced)}>
            {isProcessing ? 'Syncing...' : 'Sync All Offline Records'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConductorTab;
