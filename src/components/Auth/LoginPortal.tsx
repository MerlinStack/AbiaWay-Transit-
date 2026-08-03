import { Zap } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

type PortalTab = 'STAFF' | 'ADMIN';

function LoginPortal() {
  const navigate = useNavigate();
  const staffLogin = useAuthStore((s) => s.staffLogin);
  const adminLogin = useAuthStore((s) => s.adminLogin);

  const [activeTab, setActiveTab] = useState<PortalTab>('STAFF');
  const [staffRole, setStaffRole] = useState<'driver' | 'conductor'>('driver');
  const [badgeId, setBadgeId] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
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
        if (!adminEmail.trim() || !adminPassword.trim()) {
          setError('Please enter both email and password.');
          setLoading(false);
          return;
        }
        const result = await adminLogin(adminEmail.trim().toLowerCase(), adminPassword);
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
    <div className="min-h-screen bg-[#07101f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Abia Transit Portal</h2>
          <p className="text-sm text-gray-400 mt-1">State Transport Network Gateway</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex bg-white/5 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => { setActiveTab('STAFF'); setError(''); }}
              className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-all ${
                activeTab === 'STAFF' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              Fleet Staff
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('ADMIN'); setError(''); }}
              className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-all ${
                activeTab === 'ADMIN' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              Administrator
            </button>
          </div>

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
                  <p className="text-xs text-gray-500 mt-1">Drivers: PLT-8837, PLT-8841, PLT-8852 &middot; Conductors: CON-7712, CON-7725</p>
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
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Authenticate Credentials'}
            </button>
          </form>
        </div>

        <p className="text-xs text-gray-600 text-center mt-6">
          Abia Way Transit System &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

export default LoginPortal;
