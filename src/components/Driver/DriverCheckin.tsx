import { ClipboardCheck } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import useAuthStore from '../../stores/authStore';
import useNotificationStore from '../../stores/notificationStore';
import { recordCheckEvent, isMaintenanceRequired, type CheckItemKey } from '../../utils/maintenanceTracker';
import { getTransitService } from '../../services/transit';
import { FleetBus } from '../../types/abssin';
import { generateRollingTicketQr } from '../../utils/secureTicketQr';
import { getSolarThroughput, estimateChargeTime } from '../../utils/telemetry';

interface VehicleChecklist {
  batterySoC: boolean;
  cctv: boolean;
  emergencyExits: boolean;
  tires: boolean;
  headlights: boolean;
  horn: boolean;
  fireExtinguisher: boolean;
  firstAid: boolean;
}

const INITIAL_CHECKLIST: VehicleChecklist = {
  batterySoC: false, cctv: false, emergencyExits: false,
  tires: false, headlights: false, horn: false,
  fireExtinguisher: false, firstAid: false,
};

const CHECKLIST_ITEMS: { key: CheckItemKey; label: string }[] = [
  { key: 'batterySoC', label: 'Battery charge ≥ 80%' },
  { key: 'cctv', label: 'CCTV functional' },
  { key: 'emergencyExits', label: 'Emergency exits clear' },
  { key: 'tires', label: 'Tire pressure OK' },
  { key: 'headlights', label: 'Headlights / indicators working' },
  { key: 'horn', label: 'Horn functional' },
  { key: 'fireExtinguisher', label: 'Fire extinguisher present' },
  { key: 'firstAid', label: 'First aid kit stocked' },
];

const DriverCheckin = () => {
  const [step, setStep] = useState<'login' | 'checklist' | 'done' | 'blocked'>('login');
  const [driverId, setDriverId] = useState('');
  const [coPilotId, setCoPilotId] = useState('');
  const [plate, setPlate] = useState('');
  const [odometer, setOdometer] = useState('');
  const [checklist, setChecklist] = useState<VehicleChecklist>(INITIAL_CHECKLIST);
  const [maintenanceItems, setMaintenanceItems] = useState<CheckItemKey[]>([]);
  const [qrToken, setQrToken] = useState('');
  const [plates, setPlates] = useState<string[]>([]);
  const [loadingPlates, setLoadingPlates] = useState(true);
  const user = useAuthStore((s) => s.user);
  const showNotification = useNotificationStore((s) => s.showNotification);

  useEffect(() => {
    const loadPlates = async () => {
      const transit = getTransitService();
      const fleet = await transit.getActiveFleet();
      setPlates(fleet.map(b => b.plateNumber).slice(0, 10));
      setLoadingPlates(false);
    };
    loadPlates();
  }, []);

  const bus = useMemo(() => {
    if (!plate) return null;
    // We'll need to fetch the bus data or store it
    // For now, return a minimal mock - in real app we'd fetch from transit service
    return null;
  }, [plate]);

  useEffect(() => {
    if (qrToken) {
      const timer = setInterval(async () => {
        setQrToken(await generateRollingTicketQr(driverId, odometer ? parseInt(odometer) : 0));
      }, 15000);
      return () => clearInterval(timer);
    }
  }, [qrToken, driverId, odometer]);

  const handleLogin = () => {
    if (!driverId) { showNotification('Error', 'Enter driver ID', 'error'); return; }
    const flagged = isMaintenanceRequired(plate);
    if (flagged.length >= 3) {
      setMaintenanceItems(flagged);
      setStep('blocked');
      showNotification('Vehicle Blocked', `${plate}: ${flagged.length} items failed 3 consecutive checks`, 'error');
      return;
    }
    showNotification('Driver Logged In', `Driver ${driverId} assigned to ${plate}`, 'success');
    generateRollingTicketQr(driverId, 0).then(setQrToken);
    setStep('checklist');
  };

  const toggleCheck = (key: CheckItemKey) =>
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));

  const allChecked = Object.values(checklist).every(Boolean);
  const checkedCount = Object.values(checklist).filter(Boolean).length;

  const handleSubmitChecklist = () => {
    if (!allChecked) { showNotification('Incomplete', 'Complete all checks before signing off', 'error'); return; }
    const failed = CHECKLIST_ITEMS.filter(({ key }) => !checklist[key]).map(({ key }) => key);
    const passed = CHECKLIST_ITEMS.filter(({ key }) => checklist[key]).map(({ key }) => key);
    recordCheckEvent(plate, passed, failed);
    const flagged = isMaintenanceRequired(plate);
    if (flagged.length >= 3) {
      // TODO: Update bus status via TransitService when real API is available
      // await transit.updateBusStatus(plate, 'maintenance');
      setMaintenanceItems(flagged);
      setStep('blocked');
      showNotification('Auto-Locked', `${plate} flagged maintenance (${flagged.length} items)`, 'error');
      return;
    }
    showNotification('Check-in Complete', `Vehicle ${plate} cleared for service`, 'success');
    const solarFactor = getSolarThroughput();
    const chargeEstimate = bus ? estimateChargeTime(bus.batterySoC) : 0;
    sessionStorage.setItem(`checkin-${plate}-odometer`, odometer);
    setStep('done');
  };

  if (step === 'blocked') {
    return (
      <div className="glass-card p-6 text-center border-2 border-red-500/50">
        <div className="text-6xl mb-4">🚫</div>
        <h3 className="text-xl font-bold text-red-400 mb-2">Vehicle Blocked — Maintenance Required</h3>
        <p className="text-gray-400 mb-4">{plate} locked from route assignment</p>
        <div className="max-w-sm mx-auto space-y-2 mb-6">
          <p className="text-sm text-gray-500">3-strike threshold exceeded for:</p>
          {maintenanceItems.map((item) => (
            <div key={item} className="p-2 bg-red-500/10 rounded-lg text-sm text-red-400">{item}</div>
          ))}
        </div>
        <button className="btn-primary px-6 py-2 rounded-lg"
          onClick={() => { setStep('login'); setChecklist(INITIAL_CHECKLIST); }}>Back to Login</button>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="glass-card p-6 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-xl font-bold mb-2">Check-in Complete</h3>
        <p className="text-gray-400 mb-2">Vehicle {plate} is ready for service</p>
        <p className="text-sm text-gray-500">{bus ? `Battery: ${bus.batterySoC}% · Est. charge time: ${estimateChargeTime(bus.batterySoC)} min` : ''}</p>
        <p className="text-sm text-gray-500">Solar throughput: {Math.round(getSolarThroughput() * 100)}%</p>
        {odometer && <p className="text-sm text-gray-500">Odometer: {parseInt(odometer).toLocaleString()} km</p>}
        <button className="btn-primary mt-6 px-6 py-2 rounded-lg"
          onClick={() => { setStep('login'); setChecklist(INITIAL_CHECKLIST); setOdometer(''); }}>New Check-in</button>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <ClipboardCheck className="text-primary" />
        Driver Check-in
      </h3>

      {step === 'login' && (
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Driver ID</label>
            <input type="text" value={driverId}
              onChange={(e) => setDriverId(e.target.value.toUpperCase())}
              placeholder="e.g. DRV-001" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Co-Pilot ID (optional)</label>
            <input type="text" value={coPilotId}
              onChange={(e) => setCoPilotId(e.target.value.toUpperCase())}
              placeholder="e.g. COP-001" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Vehicle Plate</label>
            <select value={plate} onChange={(e) => setPlate(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3">
              {loadingPlates ? (
              <option value="">Loading...</option>
            ) : (
              plates.map((p) => <option key={p} value={p}>{p}</option>)
            )}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Odometer Reading (km)</label>
            <input type="text" value={odometer}
              onChange={(e) => setOdometer(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 45230" maxLength={7}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3" />
          </div>
          <button className="w-full btn-primary py-3 rounded-lg" onClick={handleLogin}>
            Start Check-in
          </button>
        </div>
      )}

      {step === 'checklist' && (
        <div className="space-y-4 max-w-lg">
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="text-sm text-gray-400">Vehicle: <span className="text-white font-semibold">{plate}</span></p>
              {bus && <p className="text-xs text-gray-500">Battery: {bus.batterySoC}% · Range: {bus.rangeKm} km</p>}
            </div>
            <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full">{checkedCount}/8</span>
          </div>
          <div className="space-y-2">
            {CHECKLIST_ITEMS.map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition">
                <input type="checkbox" checked={checklist[key]}
                  onChange={() => toggleCheck(key)} className="w-5 h-5 accent-primary" />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
          <button className="w-full btn-primary py-3 rounded-lg mt-4 disabled:opacity-50"
            onClick={handleSubmitChecklist} disabled={!allChecked}>
            {allChecked ? 'Sign Off & Start Shift' : `Complete ${8 - checkedCount} remaining checks`}
          </button>
        </div>
      )}
    </div>
  );
};

export default DriverCheckin;
