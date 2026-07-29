import React, { useState } from 'react';
import useAuthStore from '../../stores/authStore';
import useNotificationStore from '../../stores/notificationStore';

const ProfileModal = ({ isOpen, onClose }) => {
  const user = useAuthStore((s) => s.user);
  const showNotification = useNotificationStore((s) => s.showNotification);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    tier: user?.tier || 'Premium'
  });

  if (!isOpen) return null;

  const handleSave = () => {
    // In production, this would call an API to update user data
    showNotification('Profile Updated', 'Your profile has been updated successfully', 'success');
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] animate-fadeIn">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4 animate-slideUp">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white">My Profile</h3>
              <p className="text-sm text-gray-400 mt-1">View and manage your profile information</p>
            </div>
            <button 
              onClick={onClose} 
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <i data-lucide="x" className="w-4 h-4 text-gray-400"></i>
            </button>
          </div>

          {/* Profile Avatar */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 gradient-bg rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {user?.avatar || user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition">
                  <i data-lucide="camera" className="w-4 h-4 text-white"></i>
                </button>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-green-500"
                />
              ) : (
                <p className="text-white text-lg font-semibold">{user?.name || 'Abuoma David'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-green-500"
                />
              ) : (
                <p className="text-white">{user?.email || 'abuoma@abiaway.gov.ng'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+234 801 234 5678"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-green-500"
                />
              ) : (
                <p className="text-white">{user?.phone || '+234 801 234 5678'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Membership Tier</label>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  user?.tier === 'Premium' ? 'bg-green-500/20 text-green-400' :
                  user?.tier === 'Gold' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-purple-500/20 text-purple-400'
                }`}>
                  {user?.tier || 'Premium'}
                </span>
                <span className="text-xs text-gray-500">Member since {user?.joinDate || 'Jan 2024'}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
              <p className="text-white capitalize">{user?.role || 'Passenger'}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl font-semibold transition"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl font-semibold transition"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl font-semibold transition"
                >
                  Edit Profile
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl font-semibold transition"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;