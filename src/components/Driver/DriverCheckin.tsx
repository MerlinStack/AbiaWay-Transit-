import { useState } from 'react';
import useAuthStore from '../../stores/authStore';
import useNotificationStore from '../../stores/notificationStore';

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

const CHECKLIST_ITEMS: { key: keyof VehicleChecklist; label: string }[] = [
  { key: 'batterySoC', label: 'Battery charge ≥ 80%' },
  { key: 'cctv', label: 'CCTV functional' },
  { key: 'emergencyExits', label: 'Emergency exits clear' },
  { key: 'tires', label: 'Tire pressure OK' },
  { key: 'headlights', label: 'Headlights / indicators working' },
  { key: 'horn', label: 'Horn functional' },
  { key: 'fireExtinguisher', label: 'Fire extinguisher present' },
  { key: 'firstAid', label: 'First aid kit stocked' },
];

const PLATE_NUMBERS = ['ABN-101X', 'ABN-102Y', 'ABN-103Z', 'ABN-104W', 'ABN-105V'];

const DriverCheckin = () => {
  const [step, setStep] = useState<'login' | 'checklist' | 'done'>('login');
  const [driverId, setDriverId] = useState('');
  const [coPilotId, setCoPilotId] = useState('');
  const [plate, setPlate] = useState(PLATE_NUMBERS[0]);
  const [checklist, setChecklist] = useState<VehicleChecklist>(INITIAL_CHECKLIST);
  const user = useAuthStore((s) => s.user);
  const showNotification = useNotificationStore((s) => s.showNotification);

  const handleLogin = () => {
    if (!driverId) { showNotification('Error', 'Enter driver ID', 'error'); return; }
    showNotification('Driver Logged In', `Driver ${driverId} assigned to ${plate}`, 'success');
    setStep('checklist');
  };

  const toggleCheck = (key: keyof VehicleChecklist) =>
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));

  const allChecked = Object.values(checklist).every(Boolean);
  const checkedCount = Object.values(checklist).filter(Boolean).length;

  const handleSubmitChecklist = () => {
    if (!allChecked) { showNotification('Incomplete', 'Complete all checks before signing off', 'error'); return; }
    showNotification('Check-in Complete', `Vehicle ${plate} cleared for service`, 'success');
    setStep('done');
  };

  if (step === 'done') {
    return (
      <div className="glass-card p-6 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-xl font-bold mb-2">Check-in Complete</h3>
        <p className="text-gray-400 mb-4">Vehicle {plate} is ready for service</p>
        <p className="text-sm text-gray-500">Battery: {Math.floor(Math.random() * 20) + 80}% · CCTV OK · All systems go</p>
        <button className="btn-primary mt-6 px-6 py-2 rounded-lg"
          onClick={() => { setStep('login'); setChecklist(INITIAL_CHECKLIST); }}>New Check-in</button>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <i data-lucide="clipboard-check" className="text-primary"></i>
        Driver Check-in
      </h3>

      {step === 'login' && (
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Driver ID</label>
            <input type="text" value={driverId}
              onChange={(e) => setDriverId(e.target.value.toUpperCase())}
              placeholder="DRV-001" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Co-Pilot ID (optional)</label>
            <input type="text" value={coPilotId}
              onChange={(e) => setCoPilotId(e.target.value.toUpperCase())}
              placeholder="COP-001" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Vehicle Plate</label>
            <select value={plate} onChange={(e) => setPlate(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3">
              {PLATE_NUMBERS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <button className="w-full btn-primary py-3 rounded-lg" onClick={handleLogin}>
            Start Check-in
          </button>
        </div>
      )}

      {step === 'checklist' && (
        <div className="space-y-4 max-w-lg">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-gray-400">Vehicle: <span className="text-white font-semibold">{plate}</span></p>
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
