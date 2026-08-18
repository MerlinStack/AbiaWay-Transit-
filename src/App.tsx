import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import LoadingSpinner from './components/Layout/LoadingSpinner';
import MobileNav from './components/Layout/MobileNav';
import AdminGuard from './components/Auth/AdminGuard';
import NotificationToast from './components/Layout/NotificationToast';
import QuickTopupModal from './components/Modals/QuickTopupModal';
import QRCodeModal from './components/Modals/QRCodeModal';
import NotificationsModal from './components/Modals/NotificationsModal';
import LoginModal from './components/Auth/LoginModal';
import ProfileModal from './components/Modals/ProfileModal';
import SettingsModal from './components/Modals/SettingsModal';
import MapErrorBoundary from './components/error-boundaries/MapErrorBoundary';
import BookingErrorBoundary from './components/error-boundaries/BookingErrorBoundary';
import WalletErrorBoundary from './components/error-boundaries/WalletErrorBoundary';
import DriverErrorBoundary from './components/error-boundaries/DriverErrorBoundary';
import useAuthStore from './stores/authStore';
import useABSINStore from './stores/absinStore';
import SEO from './components/SEO';
import { getRole, HOME_ROUTE, isRouteAllowed } from './config/navConfig';

const LazyMapTab = lazy(() => import('./components/Map/MapTab'));
const LazyWalletTab = lazy(() => import('./components/Wallet/WalletTab'));
const LazyBookingTab = lazy(() => import('./components/Booking/BookingTab'));
const LazyDriverTab = lazy(() => import('./components/Driver/DriverTab'));
const LazyLandingPage = lazy(() => import('./components/Landing/LandingPage'));
const LazyFleetSchedule = lazy(() => import('./components/Fleet/FleetSchedule'));
const LazyDriverCheckin = lazy(() => import('./components/Driver/DriverCheckin'));
const LazyConductorTab = lazy(() => import('./components/Driver/ConductorTab'));
const LazyABSSINRegister = lazy(() => import('./components/Auth/ABSSINRegister'));
const LazySystemDiagnostics = lazy(() => import('./components/SystemDiagnostics'));
const LazyAdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'));
const LazyAdminDriverPanel = lazy(() => import('./components/Admin/AdminDriverPanel'));
const LazyLoginPortal = lazy(() => import('./components/Auth/LoginPortal'));

function AppContent() {
  const [modalOpen, setModalOpen] = useState(null);
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const navigate = useNavigate();
  const location = useLocation();
  const isLanding = location.pathname === '/';

  useEffect(() => {
    const unsubscribe = useAuthStore.getState().initialize();
    useABSINStore.getState().initialize();
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (isLanding) {
    return (
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        <LazyLandingPage onGetStarted={() => navigate('/map')} />
      </Suspense>
    );
  }

  if (location.pathname === '/login') {
    return (
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        <LazyLoginPortal />
      </Suspense>
    );
  }

  const role = getRole(user);

  if (!isRouteAllowed(location.pathname, role)) {
    return <Navigate to={HOME_ROUTE[role]} replace />;
  }

  return (
    <Box className="flex min-h-screen bg-[#07101f] text-[#f8fafc]">
      <Sidebar />
      <Box key={location.pathname} component="main" className="flex-1 min-w-0 p-2 md:p-4 overflow-y-auto min-h-screen pb-24 lg:pb-4 animate-page-in">
        <Routes>
          <Route path="/map" element={
            <Suspense fallback={<LoadingSpinner fullScreen />}>
              <MapErrorBoundary>
                <SEO title="Live Map" description="Real-time bus tracking and route planning for Abia State" />
                <Header onOpenModal={setModalOpen} user={user} onLoginClick={() => setModalOpen('login')} onSignUpClick={() => setModalOpen('register')} />
                <LazyMapTab />
              </MapErrorBoundary>
            </Suspense>
          } />
          <Route path="/wallet" element={
            <Suspense fallback={<LoadingSpinner fullScreen />}>
              <WalletErrorBoundary>
                <SEO title="Wallet" description="Manage your AbiaWay wallet balance and transactions" />
                <LazyWalletTab onOpenModal={setModalOpen} />
              </WalletErrorBoundary>
            </Suspense>
          } />
          <Route path="/booking" element={
            <Suspense fallback={<LoadingSpinner fullScreen />}>
              <BookingErrorBoundary>
                <SEO title="Book a Ride" description="Search routes, select seats, and book your AbiaWay transit" />
                <LazyBookingTab />
              </BookingErrorBoundary>
            </Suspense>
          } />
          <Route path="/driver" element={
            <Suspense fallback={<LoadingSpinner fullScreen />}>
              <DriverErrorBoundary>
                <SEO title="Driver Panel" description="AbiaWay driver operations and route management" />
                <AdminGuard requiredRole="driver">
                  <LazyDriverTab />
                </AdminGuard>
              </DriverErrorBoundary>
            </Suspense>
          } />
          <Route path="/fleet" element={
            <Suspense fallback={<LoadingSpinner fullScreen />}>
              <SEO title="Fleet" description="AbiaWay fleet management and battery telemetry" />
              <LazyFleetSchedule />
            </Suspense>
          } />
          <Route path="/checkin" element={
            <Suspense fallback={<LoadingSpinner fullScreen />}>
              <SEO title="Driver Check-in" description="Pre-trip vehicle safety checklist" />
              <LazyDriverCheckin />
            </Suspense>
          } />
          <Route path="/conductor" element={
            <Suspense fallback={<LoadingSpinner fullScreen />}>
              <SEO title="Conductor" description="Offline ABSSIN tap validation" />
              <LazyConductorTab />
            </Suspense>
          } />
          <Route path="/register" element={
            <Suspense fallback={<LoadingSpinner fullScreen />}>
              <SEO title="ABSSIN Registration" description="Register with Abia State Identification Number" />
              <Header onOpenModal={setModalOpen} user={user} onLoginClick={() => setModalOpen('login')} onSignUpClick={() => setModalOpen('register')} />
              <LazyABSSINRegister isOpen={true} onClose={() => navigate('/map')} />
            </Suspense>
          } />
          <Route path="/diagnostics" element={
            <Suspense fallback={<LoadingSpinner fullScreen />}>
              <SEO title="System Diagnostics" description="AbiaWay system diagnostic and verification suite" />
              <LazySystemDiagnostics />
            </Suspense>
          } />
          <Route path="/admin" element={
            <Suspense fallback={<LoadingSpinner fullScreen />}>
              <AdminGuard requiredRole="admin">
                <SEO title="Admin Dashboard" description="System-wide fleet and operations overview" />
                <Header onOpenModal={setModalOpen} user={user} onLoginClick={() => setModalOpen('login')} onSignUpClick={() => setModalOpen('register')} />
                <LazyAdminDashboard />
              </AdminGuard>
            </Suspense>
          } />
          <Route path="/admin/drivers" element={
            <Suspense fallback={<LoadingSpinner fullScreen />}>
              <AdminGuard requiredRole="admin">
                <SEO title="Driver Management" description="View and manage all drivers" />
                <Header onOpenModal={setModalOpen} user={user} onLoginClick={() => setModalOpen('login')} onSignUpClick={() => setModalOpen('register')} />
                <LazyAdminDriverPanel />
              </AdminGuard>
            </Suspense>
          } />
          <Route path="*" element={<Navigate to={HOME_ROUTE[role]} replace />} />
        </Routes>
      </Box>

      <NotificationToast />
      <MobileNav />
      <QuickTopupModal isOpen={modalOpen === 'quickTopup'} onClose={() => setModalOpen(null)} />
      <QRCodeModal isOpen={modalOpen === 'qrCode'} onClose={() => setModalOpen(null)} />
      <NotificationsModal isOpen={modalOpen === 'notifications'} onClose={() => setModalOpen(null)} />
      <LoginModal isOpen={modalOpen === 'login' || modalOpen === 'register'} onClose={() => setModalOpen(null)} initialTab={modalOpen === 'register' ? 'register' : 'signin'} />
      <ProfileModal isOpen={modalOpen === 'profile'} onClose={() => setModalOpen(null)} />
      <SettingsModal isOpen={modalOpen === 'settings'} onClose={() => setModalOpen(null)} />
    </Box>
  );
}

function App() {
  return (
    <>
      <AppContent />
    </>
  );
}

export default App;
