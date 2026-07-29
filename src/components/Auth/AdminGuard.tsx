import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

const AdminGuard = ({ children, requiredRole = 'admin' }) => {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasRequiredRole = () => {
    if (requiredRole === 'admin') return user?.role === 'admin';
    if (requiredRole === 'driver') return user?.role === 'driver' || user?.role === 'admin';
    return true;
  };

  if (!hasRequiredRole()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminGuard;
