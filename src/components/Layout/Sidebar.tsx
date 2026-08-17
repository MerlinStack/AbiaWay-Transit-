import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Drawer } from '@mui/material';
import Logo from './Logo';
import { Map, Wallet, Ticket, CarFront, Bus, ClipboardCheck, QrCode, IdCard, Bug, Shield, Users, Circle, Leaf } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import useTripStore from '../../stores/tripStore';

const mainTabs = [
  { path: '/map', icon: <Map size={20} />, label: 'Live Tracking', badge: 'LIVE' as const },
  { path: '/wallet', icon: <Wallet size={20} />, label: 'My Wallet' },
  { path: '/booking', icon: <Ticket size={20} />, label: 'Book & Pay' },
  { path: '/fleet', icon: <Bus size={20} />, label: 'Fleet Mgmt' },
  { path: '/driver', icon: <CarFront size={20} />, label: 'Driver Dashboard' },
  { path: '/checkin', icon: <ClipboardCheck size={20} />, label: 'Driver Check-in' },
  { path: '/conductor', icon: <QrCode size={20} />, label: 'Conductor Tap' },
  { path: '/register', icon: <IdCard size={20} />, label: 'ABSSIN Register' },
  { path: '/diagnostics', icon: <Bug size={20} />, label: 'Diagnostics' },
];

const adminTabs = [
  { path: '/admin', icon: <Shield size={20} />, label: 'Admin Dashboard' },
  { path: '/admin/drivers', icon: <Users size={20} />, label: 'Driver Management' },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';
  const lastSummary = useTripStore((s) => s.lastSummary);
  const tripDistance = lastSummary?.distanceKm || 0;
  const tripPassengers = lastSummary?.passengers || 0;
  const co2Saved = Math.max(0, Math.round(tripDistance * 0.05 * 100) / 100);

  return (
    <Drawer
      variant="permanent"
      open
      className="hidden lg:block"
      style={{ width: 280, flexShrink: 0 }}
      PaperProps={{
        style: {
          width: 280,
          boxSizing: 'border-box',
          border: 'none',
          backgroundColor: 'rgba(15, 23, 42, 0.96)',
          padding: '32px 24px',
          backdropFilter: 'blur(20px)',
          position: 'fixed',
          height: '100%',
        },
      }}
    >
      <div className="flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 grid place-items-center">
              <Logo size={48} />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">AbiaWay</p>
              <p className="text-xs text-gray-400">AW Transit v1.0</p>
            </div>
          </div>

          <nav>
            {mainTabs.map((tab) => (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl mb-1 transition-all text-left ${
                  currentPath === tab.path
                    ? 'bg-green-600/30 text-green-400 font-bold'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white font-medium'
                }`}
              >
                <span className={currentPath === tab.path ? 'text-green-400' : 'text-gray-400'}>
                  {tab.icon}
                </span>
                <span className="flex-1">{tab.label}</span>
                {'badge' in tab && tab.badge && <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{tab.badge}</span>}
              </button>
            ))}
          </nav>

          {isAdmin && (
            <>
              <div className="mt-6 mb-2 px-4 py-1">
                <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Administration</p>
              </div>
              <nav>
                {adminTabs.map((tab) => (
                  <button
                    key={tab.path}
                    onClick={() => navigate(tab.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl mb-1 transition-all text-left ${
                      currentPath === tab.path
                        ? 'bg-green-600/30 text-green-400 font-bold'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white font-medium'
                    }`}
                  >
                    <span className={currentPath === tab.path ? 'text-green-400' : 'text-gray-400'}>
                      {tab.icon}
                    </span>
                    <span className="flex-1">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </>
          )}
        </div>

        <div className="mt-6 bg-gradient-to-br from-green-600/20 to-emerald-900/20 border border-green-500/25 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-4 h-4 text-green-400" />
            <p className="text-xs font-semibold text-green-300">Eco Impact</p>
          </div>
          <p className="text-lg font-bold text-white">
            {co2Saved > 0 ? `${co2Saved.toFixed(2)} kg` : '0 kg'} <span className="text-xs font-normal text-gray-400">CO₂ saved</span>
          </p>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>{tripDistance.toFixed(1)} km green travel</span>
            <span>{tripPassengers} riders</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400" style={{ width: `${Math.min(100, co2Saved * 10)}%` }}></div>
          </div>
        </div>

        <div className="mt-4 bg-[rgba(255,255,255,0.05)] p-3 rounded-2xl border border-[rgba(148,163,184,0.12)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-full bg-primary font-bold flex items-center justify-center text-white">
              {user?.avatar || user?.name?.charAt(0) || '?'}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{user?.name || 'Guest'}</p>
              <p className="text-xs text-gray-400">{user?.role ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)}${user.tier ? ` · ${user.tier}` : ''}` : 'Not signed in'}</p>
            </div>
          </div>
          {user && (
            <>
              <div className="h-2 rounded-full bg-[rgba(255,255,255,0.08)] overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: '75%' }}></div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-400">450/600 pts</p>
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full">EN</span>
              </div>
            </>
          )}
          <hr className="my-2 border-[rgba(148,163,184,0.12)]" />
          <div className="flex items-center gap-2">
            <Circle size={10} fill="#22c55e" color="#22c55e" />
            <p className="text-xs text-green-400">Connected</p>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

export default Sidebar;
