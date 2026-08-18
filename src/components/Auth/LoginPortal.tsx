import { Zap, MapPin, Wallet, WifiOff, Shield, Circle } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import SegmentedControl from '../ui/SegmentedControl';

type PortalTab = 'STAFF' | 'ADMIN';

const portalHighlights = [
  { icon: MapPin, text: 'Live fleet telemetry across all 17 LGAs' },
  { icon: Wallet, text: 'Cashless boarding with the Abia Connect Card' },
  { icon: WifiOff, text: 'Offline-first validation for low-coverage corridors' },
  { icon: Shield, text: 'ABSSIN-backed identity on every transaction' },
];

function LoginPortal() {
  const navigate = useNavigate();
  const staffLogin = useAuthStore((s) => s.staffLogin);
  const adminLogin = useAuthStore((s) => s.adminLogin);

  const [activeTab, setActiveTab] = useState<PortalTab>('STAFF');
  const [staffRole, setStaffRole] = useState<'driver' | 'conductor'>('driver');
  const [badgeId, setBadgeId] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'STAFF') {
        if (!badgeId.trim()) {
          setError('Please enter a valid Operational Badge Number.');
          setLoading(false);
          return;
        }
        const result = await staffLogin(badgeId.trim().toUpperCase(), staffRole);
        if (!result.success) {
          setError(result.error || 'Authentication failed.');
          setLoading(false);
          return;
        }
        navigate(staffRole === 'driver' ? '/checkin' : '/conductor');
      } else {
        if (!adminEmail.trim() || !adminPassword.trim() || !adminKey.trim()) {
          setError('Please enter email, password, and admin access key.');
          setLoading(false);
          return;
        }
        const result = await adminLogin(adminEmail.trim().toLowerCase(), adminPassword, adminKey.trim().toUpperCase());
        if (!result.success) {
          setError(result.error || 'Authentication failed.');
          setLoading(false);
          return;
        }
        navigate('/admin');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07101f] flex items-center justify-center p-4 relative overflow-hidden animate-page-in">
      {/* Ambient background glows (static, cheap) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] bg-green-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-[480px] h-[480px] bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-5xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          {/* Brand / context panel */}
          <div className="hidden lg:flex flex-col justify-between p-10 rounded-3xl surface-2">
            <div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-600/20">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold leading-tight mb-3">
                Abia State
                <br />
                Transit Network
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">
                The operational gateway for fleet staff and administrators. Sign in with your
                assigned credentials to manage routes, vehicles, and ticket validation.
              </p>
              <div className="space-y-3">
                {portalHighlights.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-sm text-gray-300">
                    <span className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-green-400" />
                    </span>
                    {text}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-10">
              <Circle size={10} fill="#22c55e" color="#22c55e" />
              All systems operational &middot; v1.0
            </div>
          </div>

          {/* Auth card */}
          <div className="surface-3 p-6 sm:p-8">
            <div className="lg:hidden text-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold">Abia Transit Portal</h2>
              <p className="text-sm text-gray-400 mt-1">State Transport Network Gateway</p>
            </div>

            <SegmentedControl
              size="md"
              fill
              ariaLabel="Sign in role"
              value={activeTab}
              onChange={(v) => { setActiveTab(v as 'STAFF' | 'ADMIN'); setError(''); }}
              options={[
                { label: 'Fleet Staff', value: 'STAFF' },
                { label: 'Administrator', value: 'ADMIN' },
              ]}
              className="mb-6"
            />

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
                  {error}
                </div>
              )}

              {activeTab === 'STAFF' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Role Type</label>
                    <select
                      value={staffRole}
                      onChange={(e) => setStaffRole(e.target.value as 'driver' | 'conductor')}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                    >
                      <option value="driver">Fleet Pilot (Driver)</option>
                      <option value="conductor">Terminal Ticket Conductor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Operational Badge Number</label>
                    <input
                      type="text"
                      value={badgeId}
                      onChange={(e) => setBadgeId(e.target.value.toUpperCase())}
                      placeholder="e.g. PLT-8837"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Badges are vetted and issued by the administration.</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Admin Gov Email</label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="name@abiaway.gov.ng"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Secure Access Pin</label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Admin Access Key</label>
                    <input
                      type="text"
                      value={adminKey}
                      onChange={(e) => setAdminKey(e.target.value.toUpperCase())}
                      placeholder="e.g. ABW-AK-XXXX-XXXX"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Access keys are vetted and issued by the administration.</p>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 pressable"
              >
                {loading ? 'Authenticating...' : 'Authenticate Credentials'}
              </button>
            </form>

            <p className="text-xs text-gray-600 text-center mt-6">
              Abia Way Transit System &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPortal;