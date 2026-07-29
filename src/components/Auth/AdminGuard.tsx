import React from 'react';
import useAuthStore from '../../stores/authStore';

const AdminGuard = ({ children, requiredRole = 'admin' }) => {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="glass-card p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i data-lucide="log-in" className="w-10 h-10 text-yellow-500"></i>
          </div>
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-400 mb-4">
            Please sign in to access this page.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="btn-primary"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Check for required role
  const hasRequiredRole = () => {
    if (requiredRole === 'admin') {
      return user?.role === 'admin';
    }
    if (requiredRole === 'driver') {
      return user?.role === 'driver' || user?.role === 'admin'; // Admin can also access driver pages
    }
    return true; // No specific role required
  };

  if (!hasRequiredRole()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="glass-card p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i data-lucide="shield-alert" className="w-10 h-10 text-red-500"></i>
          </div>
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-4">
            {requiredRole === 'admin' 
              ? 'This area is restricted to administrators only.'
              : 'This area is restricted to drivers and administrators only.'}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Your current role: <span className="text-primary font-semibold">{user?.role || 'unknown'}</span>
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="btn-primary"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminGuard;