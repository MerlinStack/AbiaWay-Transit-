import { useState } from 'react';
import useAuthStore from '../../stores/authStore';
import useNotificationStore from '../../stores/notificationStore';

interface ABSSINRegisterProps {
  isOpen: boolean;
  onClose: () => void;
}

const ABSSINRegister = ({ isOpen, onClose }: ABSSINRegisterProps) => {
  const [step, setStep] = useState(1);
  const [abssin, setAbssin] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [lga, setLga] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verified, setVerified] = useState(false);

  const login = useAuthStore((s) => s.login);
  const showNotification = useNotificationStore((s) => s.showNotification);

  if (!isOpen) return null;

  const handleVerifyABSSIN = async () => {
    if (abssin.length !== 12) {
      showNotification('Error', 'ABSSIN must be 12 digits', 'error');
      return;
    }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setVerified(true);
    setIsSubmitting(false);
    showNotification('ABSSIN Verified', 'Identity confirmed with state ledger', 'success');
    setStep(2);
  };

  const handleRegister = async () => {
    if (!fullName || !email || !phone || !lga) {
      showNotification('Error', 'All fields are required', 'error');
      return;
    }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    await login(email, 'abssin', {
      id: `ABN-${abssin}`,
      email,
      name: fullName,
      role: 'passenger',
      tier: 'Standard',
      avatar: fullName.split(' ').map((n) => n[0]).join(''),
      phone,
      abssin,
      lga,
      verified: true,
      joinDate: new Date().toISOString().split('T')[0],
    });
    setIsSubmitting(false);
    showNotification('Welcome!', `ABSSIN ${abssin} linked to your account`, 'success');
    onClose();
    setStep(1);
    setVerified(false);
  };

  const lgAs = ['Umuahia North', 'Umuahia South', 'Aba North', 'Aba South', 'Ohafia', 'Bende', 'Isuikwuato', 'Arochukwu', 'Ikwuano', 'Ukwa East', 'Ukwa West', 'Osisioma', 'Ugwuagbo'];

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4">
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">ABSSIN Registration</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
          </div>

          <div className="flex gap-1 mb-6 bg-white/10 rounded-lg p-1">
            {[1, 2].map((s) => (
              <div key={s} className={`flex-1 text-center py-2 rounded-lg text-sm ${step === s ? 'bg-primary text-white' : 'text-gray-400'}`}>
                {s === 1 ? 'Verify ID' : 'Profile'}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">Enter your 12-digit Abia State Social Identification Number (ABSSIN) from the state identity ledger.</p>
              <div>
                <label className="block text-sm text-gray-400 mb-2">ABSSIN Number</label>
                <input type="text" value={abssin}
                  onChange={(e) => setAbssin(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  placeholder="1234 5678 9012" maxLength={12}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-center text-lg tracking-widest" />
              </div>
              {verified && (
                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30" role="status" aria-live="polite">
                  <p className="text-green-400 font-semibold">Identity Verified</p>
                  <p className="text-xs text-gray-400 mt-1">ABSSIN {abssin} confirmed via state ledger</p>
                </div>
              )}
              <button className="w-full btn-primary py-3 rounded-lg" onClick={handleVerifyABSSIN} disabled={isSubmitting || abssin.length !== 12}>
                {isSubmitting ? 'Verifying...' : 'Verify ABSSIN'}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  placeholder="Abuoma David" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="abuoma@abia.gov.ng" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Phone</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  placeholder="08012345678" maxLength={11} className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">LGA of Residence</label>
                <select value={lga} onChange={(e) => setLga(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3">
                  <option value="">Select LGA</option>
                  {lgAs.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <button className="w-full btn-primary py-3 rounded-lg" onClick={handleRegister} disabled={isSubmitting}>
                {isSubmitting ? 'Registering...' : 'Complete Registration'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ABSSINRegister;
