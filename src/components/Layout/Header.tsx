import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Menu, MenuItem } from '@mui/material';
import { Plus, Shield, LogIn, LogOut, User, Settings, ChevronDown, UserPlus, Zap, Calendar, Crown } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import useNotificationStore from '../../stores/notificationStore';
import StatusPill from '../ui/StatusPill';

const IconButton = ({ onClick, ariaLabel, title, className, children }) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    title={title}
    className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-full transition pressable ${className}`}
  >
    {children}
  </button>
);

const LabeledButton = ({ onClick, className, children }) => (
  <button
    onClick={onClick}
    className={`h-10 shrink-0 inline-flex items-center gap-1.5 px-3.5 rounded-full text-sm font-semibold whitespace-nowrap transition pressable ${className}`}
  >
    {children}
  </button>
);

const Header = ({ onOpenModal, user, onLoginClick, onSignUpClick }) => {
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const logout = useAuthStore((s) => s.logout);
  const showNotification = useNotificationStore((s) => s.showNotification);
  const navigate = useNavigate();

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening');
    setCurrentDate(
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    );
  }, []);

const SOS_NUMBER = '08035415405';
const SOS_HOTLINES = ['08035415405', '08079210004', '08079210005', '08079210006'];

const handleSOS = () => {
  if (window.confirm(`Emergency SOS? This will call the Abia State Police Command emergency hotline (${SOS_NUMBER}). All command hotlines: ${SOS_HOTLINES.join(', ')}.`)) {
    window.location.href = `tel:${SOS_NUMBER}`;
    showNotification('SOS', `Calling ${SOS_NUMBER}…`, 'error');
  }
};

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      showNotification('Logged Out', 'You have been successfully logged out', 'success');
      setAnchorEl(null);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      showNotification('Error', 'Failed to log out', 'error');
    }
  };

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 p-3 rounded-2xl bg-[rgba(15,23,42,0.88)] border border-[rgba(148,163,184,0.12)] shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
      <div className="min-w-0 flex-1 w-full">
        <h2 className="text-2xl lg:text-3xl font-extrabold mb-2 text-white truncate">
          {greeting}, {user?.name?.split(' ')[0] || 'Guest'}!
        </h2>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <StatusPill dot>
            <span className="text-green-400 font-semibold">System Online</span>
          </StatusPill>
          <StatusPill icon={<Zap className="w-3 h-3 text-green-400" />}>Abia State Transit</StatusPill>
          <StatusPill icon={<Crown className="w-3 h-3 text-yellow-400" />}>{user?.tier || 'Premium'} Member</StatusPill>
          <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-gray-500 pl-3 ml-1 border-l border-white/10">
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            {currentDate}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 w-full sm:w-auto sm:justify-end justify-between">
        <IconButton
          onClick={handleSOS}
          ariaLabel="Emergency SOS"
          title="Emergency SOS"
          className="bg-red-600 hover:bg-red-500"
        >
          <Shield className="w-5 h-5 text-white" />
        </IconButton>

        {!user && (
          <>
            <button
              onClick={() => navigate('/login')}
              className="h-10 shrink-0 inline-flex items-center gap-1.5 px-3 rounded-full text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition pressable hidden xl:inline-flex"
              title="Fleet staff and admin sign-in portal"
            >
              <Shield className="w-4 h-4" /> Staff Portal
            </button>
            <IconButton
              onClick={onLoginClick}
              ariaLabel="Sign In"
              title="Sign In"
              className="bg-blue-600 hover:bg-blue-500 sm:hidden"
            >
              <LogIn className="w-5 h-5 text-white" />
            </IconButton>
            <LabeledButton onClick={onLoginClick} className="bg-blue-600 hover:bg-blue-500 text-white hidden sm:inline-flex">
              <LogIn className="w-4 h-4" /> Sign In
            </LabeledButton>
            <LabeledButton onClick={onSignUpClick} className="bg-white/10 hover:bg-white/20 border border-white/10 text-white hidden lg:inline-flex">
              <UserPlus className="w-4 h-4" /> Create Account
            </LabeledButton>
          </>
        )}

        {user && (
          <>
            <button
              onClick={(event) => setAnchorEl(event.currentTarget)}
              aria-label="Account menu"
              title={user.name}
              className="h-10 shrink-0 inline-flex items-center gap-2 pl-1 pr-2 sm:pl-1.5 sm:pr-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition pressable"
            >
              <Avatar className="bg-primary w-8 h-8 font-bold text-sm">{user.avatar || user.name?.charAt(0) || 'U'}</Avatar>
              <span className="hidden md:inline text-sm font-semibold max-w-[120px] truncate">{user.name}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  onOpenModal('profile');
                }}
              >
                <User size={18} className="mr-1" />
                My Profile
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  onOpenModal('settings');
                }}
              >
                <Settings size={18} className="mr-1" />
                Settings
              </MenuItem>
              <hr className="my-1 border-[rgba(148,163,184,0.12)]" />
              <MenuItem onClick={handleLogout} className="text-red-500">
                <LogOut size={18} className="mr-1" />
                Sign Out
              </MenuItem>
            </Menu>
          </>
        )}

        {user && (
          <LabeledButton onClick={() => onOpenModal('quickTopup')} className="bg-primary hover:bg-primary-dark text-white">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Quick Top-up</span>
            <span className="sm:hidden">Top-up</span>
          </LabeledButton>
        )}
      </div>
    </header>
  );
};

export default Header;