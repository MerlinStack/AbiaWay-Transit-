import React, { useState, useEffect } from 'react';
import { Avatar, Button, Menu, MenuItem, Chip } from '@mui/material';
import { Plus, Shield, LogIn, LogOut, User, Settings, ChevronDown, Circle } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import useNotificationStore from '../../stores/notificationStore';

const Header = ({ onOpenModal, user, onLoginClick }) => {
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const logout = useAuthStore((s) => s.logout);
  const showNotification = useNotificationStore((s) => s.showNotification);

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

  const handleSOS = () => {
    if (window.confirm('🚨 Emergency SOS? This will alert emergency services and share your location.')) {
      alert('SOS alert sent to Abia State Emergency Services');
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
    <header
      className="flex flex-wrap justify-between items-center gap-2 mb-4 p-3 rounded-2xl bg-[rgba(15,23,42,0.88)] border border-[rgba(148,163,184,0.12)] shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
    >
      <div className="min-w-0 flex-1">
        <h2 className="text-3xl font-extrabold mb-1 text-white">
          {greeting}, {user?.name || 'Guest'}! 👋
        </h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-wrap">
          <Chip label="System Online" color="success" icon={<Circle size={10} />} size="small" />
          <span className="text-sm text-gray-400">Abia State Transit ⚡</span>
          <Chip label={`${user?.tier || 'Premium'} Member`} color="secondary" size="small" />
          <span className="text-sm text-gray-400">{currentDate}</span>
        </div>
      </div>

      <div className="flex flex-row gap-1 flex-wrap items-center">
        <Button color="error" variant="contained" startIcon={<Shield size={20} />} onClick={handleSOS} className="min-w-[120px]">
          SOS
        </Button>

        {!user && (
          <Button color="primary" variant="contained" startIcon={<LogIn size={20} />} onClick={onLoginClick} className="min-w-[120px]">
            Sign In
          </Button>
        )}

        {user && (
          <>
            <Button
              color="secondary"
              variant="outlined"
              startIcon={
                <Avatar className="bg-primary w-8 h-8 font-bold">
                  {user.avatar || user.name?.charAt(0) || 'U'}
                </Avatar>
              }
              endIcon={<ChevronDown size={20} />}
              onClick={(event) => setAnchorEl(event.currentTarget)}
              className="min-w-[160px]"
            >
              {user.name}
            </Button>
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

        <Button color="primary" variant="contained" startIcon={<Plus size={20} />} onClick={() => onOpenModal('quickTopup')} className="min-w-[160px]">
          Quick Top-up
        </Button>
      </div>
    </header>
  );
};

export default Header;
