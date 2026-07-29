import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Drawer } from '@mui/material';
import BoltIcon from '@mui/icons-material/esm/Bolt';
import MapIcon from '@mui/icons-material/esm/Map';
import AccountBalanceWalletIcon from '@mui/icons-material/esm/AccountBalanceWallet';
import ConfirmationNumberIcon from '@mui/icons-material/esm/ConfirmationNumber';
import DriveEtaIcon from '@mui/icons-material/esm/DriveEta';
import DirectionsBusIcon from '@mui/icons-material/esm/DirectionsBus';
import AssignmentTurnedInIcon from '@mui/icons-material/esm/AssignmentTurnedIn';
import QrCodeScannerIcon from '@mui/icons-material/esm/QrCodeScanner';
import BadgeIcon from '@mui/icons-material/esm/Badge';
import CircleIcon from '@mui/icons-material/esm/Circle';

const tabs = [
  { path: '/map', icon: <MapIcon />, label: 'Live Tracking' },
  { path: '/wallet', icon: <AccountBalanceWalletIcon />, label: 'My Wallet' },
  { path: '/booking', icon: <ConfirmationNumberIcon />, label: 'Book & Pay' },
  { path: '/fleet', icon: <DirectionsBusIcon />, label: 'Fleet Mgmt' },
  { path: '/checkin', icon: <AssignmentTurnedInIcon />, label: 'Driver Check-in' },
  { path: '/conductor', icon: <QrCodeScannerIcon />, label: 'Conductor Tap' },
  { path: '/driver', icon: <DriveEtaIcon />, label: 'Driver Dashboard' },
  { path: '/register', icon: <BadgeIcon />, label: 'ABSSIN Register' },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

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
            <div className="w-12 h-12 rounded-2xl bg-primary grid place-items-center shadow-[0_20px_30px_rgba(0,0,0,0.24)]">
              <BoltIcon className="text-white" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">AbiaWay</p>
              <p className="text-xs text-gray-400">AW Transit v1.0</p>
            </div>
          </div>

          <nav>
            {tabs.map((tab) => (
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
                {tab.path === '/map' && <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">LIVE</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-4 bg-[rgba(255,255,255,0.05)] p-3 rounded-2xl border border-[rgba(148,163,184,0.12)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-full bg-primary font-bold flex items-center justify-center text-white">AD</div>
            <div>
              <p className="text-sm font-semibold text-white">Abuoma David</p>
              <p className="text-xs text-gray-400">Premium Member</p>
            </div>
          </div>
          <div className="h-2 rounded-full bg-[rgba(255,255,255,0.08)] overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: '75%' }}></div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-400">450/600 pts</p>
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full">EN</span>
          </div>
          <hr className="my-2 border-[rgba(148,163,184,0.12)]" />
          <div className="flex items-center gap-2">
            <CircleIcon style={{ width: 10, height: 10, color: '#22c55e' }} />
            <p className="text-xs text-green-400">Connected</p>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

export default Sidebar;
