import React, { useState } from 'react';
import useNotificationStore from '../../stores/notificationStore';
import { X, Bell, Palette, Volume2, Repeat, Shield, Lock, Fingerprint, Info } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose }) => {
  const showNotification = useNotificationStore((s) => s.showNotification);
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    darkMode: true,
    language: 'en',
    soundEffects: true,
    autoTopup: false,
    autoTopupAmount: 5000
  });

  if (!isOpen) return null;

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    showNotification('Setting Updated', `${key} changed to ${value}`, 'success');
  };

  const handleSaveAll = () => {
    // In production, save to backend/localStorage
    localStorage.setItem('userSettings', JSON.stringify(settings));
    showNotification('Settings Saved', 'Your preferences have been saved', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] animate-fadeIn">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto max-h-[85vh] overflow-y-auto custom-scrollbar animate-slideUp">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-white/10 shadow-2xl max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white">Settings</h3>
              <p className="text-sm text-gray-400 mt-1">Customize your app experience</p>
            </div>
            <button 
              onClick={onClose} 
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Notification Settings */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Bell className="w-5 h-5 text-green-400" />
              Notifications
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white">Push Notifications</p>
                  <p className="text-xs text-gray-500">Receive alerts about your rides</p>
                </div>
                <button
                  onClick={() => handleSettingChange('notifications', !settings.notifications)}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.notifications ? 'bg-green-600' : 'bg-gray-600'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${settings.notifications ? 'translate-x-6' : 'translate-x-1'}`}></div>
                </button>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white">Email Updates</p>
                  <p className="text-xs text-gray-500">Get promotional offers and news</p>
                </div>
                <button
                  onClick={() => handleSettingChange('emailUpdates', !settings.emailUpdates)}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.emailUpdates ? 'bg-green-600' : 'bg-gray-600'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${settings.emailUpdates ? 'translate-x-6' : 'translate-x-1'}`}></div>
                </button>
              </div>
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Palette className="w-5 h-5 text-green-400" />
              Appearance
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white">Dark Mode</p>
                  <p className="text-xs text-gray-500">Dark theme for night riding</p>
                </div>
                <button
                  onClick={() => handleSettingChange('darkMode', !settings.darkMode)}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.darkMode ? 'bg-green-600' : 'bg-gray-600'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${settings.darkMode ? 'translate-x-6' : 'translate-x-1'}`}></div>
                </button>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white">Language</p>
                  <p className="text-xs text-gray-500">Choose your preferred language</p>
                </div>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm"
                >
                  <option value="en">English</option>
                  <option value="ig">Igbo</option>
                  <option value="yo">Yoruba</option>
                  <option value="ha">Hausa</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sound & Vibration */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-green-400" />
              Sound & Vibration
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white">Sound Effects</p>
                  <p className="text-xs text-gray-500">Play sounds for taps and notifications</p>
                </div>
                <button
                  onClick={() => handleSettingChange('soundEffects', !settings.soundEffects)}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.soundEffects ? 'bg-green-600' : 'bg-gray-600'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${settings.soundEffects ? 'translate-x-6' : 'translate-x-1'}`}></div>
                </button>
              </div>
            </div>
          </div>

          {/* Auto Top-up */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Repeat className="w-5 h-5 text-green-400" />
              Auto Top-up
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white">Enable Auto Top-up</p>
                  <p className="text-xs text-gray-500">Automatically add funds when balance is low</p>
                </div>
                <button
                  onClick={() => handleSettingChange('autoTopup', !settings.autoTopup)}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.autoTopup ? 'bg-green-600' : 'bg-gray-600'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${settings.autoTopup ? 'translate-x-6' : 'translate-x-1'}`}></div>
                </button>
              </div>
              {settings.autoTopup && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Top-up Amount</label>
                  <select
                    value={settings.autoTopupAmount}
                    onChange={(e) => handleSettingChange('autoTopupAmount', parseInt(e.target.value))}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white"
                  >
                    <option value={1000}>₦1,000</option>
                    <option value={2000}>₦2,000</option>
                    <option value={5000}>₦5,000</option>
                    <option value={10000}>₦10,000</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Security Section */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              Security
            </h4>
            <button className="w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl transition text-left px-4 flex items-center gap-3">
              <Lock className="w-4 h-4" />
              <span>Change Password</span>
            </button>
            <button className="w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl transition text-left px-4 flex items-center gap-3 mt-2">
              <Fingerprint className="w-4 h-4" />
              <span>Enable Biometric Login</span>
            </button>
          </div>

          {/* About Section */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-green-400" />
              About
            </h4>
            <div className="space-y-2 text-sm text-gray-400">
              <p>Version: 1.0.0</p>
              <p>App: Abia Way Transit System</p>
              <p>© 2024 Abia State Government</p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              onClick={handleSaveAll}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition"
            >
              Save All Settings
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;