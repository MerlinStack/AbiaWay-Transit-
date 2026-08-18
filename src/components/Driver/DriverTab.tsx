import { User, Play, Pause, Square, Users, Wallet, Clock, Timer, Route as RouteIcon, Navigation, Gauge, Bus, RotateCcw } from 'lucide-react';
import React, { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DriverGpsLayer from './DriverGpsLayer';
import useAuthStore from '../../stores/authStore';
import useTripStore, { BusCapacity } from '../../stores/tripStore';
import useNotificationStore from '../../stores/notificationStore';

if (typeof L !== 'undefined' && L.Icon && L.Icon.Default) {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

function DriverTab() {
  const [location, setLocation] = useState('Awaiting GPS fix…');
  const [speed, setSpeed] = useState(0);
  const [nextStop, setNextStop] = useState('—');
  const user = useAuthStore((s) => s.user);
  const showNotification = useNotificationStore((s) => s.showNotification);

  const status = useTripStore((s) => s.status);
  const tripId = useTripStore((s) => s.tripId);
  const elapsedSeconds = useTripStore((s) => s.elapsedSeconds);
  const distanceKm = useTripStore((s) => s.distanceKm);
  const passengers = useTripStore((s) => s.passengers);
  const fareCollected = useTripStore((s) => s.fareCollected);
  const busStatus = useTripStore((s) => s.busStatus);
  const lastSummary = useTripStore((s) => s.lastSummary);
  const startTrip = useTripStore((s) => s.startTrip);
  const pauseTrip = useTripStore((s) => s.pauseTrip);
  const resumeTrip = useTripStore((s) => s.resumeTrip);
  const endTrip = useTripStore((s) => s.endTrip);
  const resetTrip = useTripStore((s) => s.resetTrip);
  const tick = useTripStore((s) => s.tick);
  const setBusStatus = useTripStore((s) => s.setBusStatus);
  const addPassenger = useTripStore((s) => s.addPassenger);
  const removePassenger = useTripStore((s) => s.removePassenger);

  const tripActive = status === 'active';
  const tripPaused = status === 'paused';
  const tripRunning = tripActive || tripPaused;

  useEffect(() => {
    if (!tripActive) return;
    const interval = setInterval(() => tick(1, speed), 1000);
    return () => clearInterval(interval);
  }, [tripActive, speed, tick]);

  const handleGpsUpdate = useCallback((data) => {
    setLocation(data.location);
    setSpeed(data.speed);
    setNextStop(data.nextStop);
  }, []);

  const handleStartTrip = () => {
    startTrip();
    showNotification('Trip Started', 'Trip timer is now running. All controls activated.', 'success');
  };

  const handleEndTrip = () => {
    const summary = endTrip();
    showNotification(
      'Trip Completed',
      `${summary.tripId} • ${formatTime(summary.durationSeconds)} • ${summary.passengers} passengers • ₦${summary.fareCollected.toLocaleString()}`,
      'success'
    );
  };

  const capacityButtons: { key: BusCapacity; label: string }[] = [
    { key: 'empty', label: 'Empty' },
    { key: 'medium', label: 'Medium' },
    { key: 'full', label: 'Full' },
  ];

  return (
    <div className="max-w-7xl mx-auto animate-page-in">
      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <span className="w-11 h-11 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <Navigation className="w-5 h-5 text-green-400" />
          </span>
          Driver Dashboard
        </h2>
        <p className="text-sm text-gray-400 mt-2 ml-14">GPS simulation, trip timer, and live passenger controls.</p>
      </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="glass-card p-6" style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', border: '2px solid #16a34a' }}>
        <h3 className="text-xl font-semibold mb-6">Trip Console</h3>
        <div className="space-y-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">{user?.name || 'Driver'}</h4>
              <p className="text-sm text-gray-400">{user?.id ? `ID: ${user.id}` : ''}</p>
              <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                status === 'active' ? 'bg-green-500/20 text-green-400' :
                status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                status === 'ended' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
              }`}>
                {status === 'idle' ? 'No active trip' : status === 'active' ? '● Trip in progress' : status === 'paused' ? 'Trip paused' : 'Trip ended'}
              </span>
            </div>
            {tripRunning && (
              <div className="text-right">
                <p className="text-4xl font-mono font-bold text-green-400 tabular-nums">{formatTime(elapsedSeconds)}</p>
                <p className="text-xs text-gray-400">{tripId}</p>
              </div>
            )}
          </div>

          {status === 'ended' && lastSummary && (
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30 space-y-2 text-sm">
              <p className="font-semibold text-blue-400">Trip Summary</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <span className="text-gray-400">Duration:</span><span className="font-mono">{formatTime(lastSummary.durationSeconds)}</span>
                <span className="text-gray-400">Distance:</span><span>{lastSummary.distanceKm.toFixed(2)} km</span>
                <span className="text-gray-400">Passengers:</span><span>{lastSummary.passengers}</span>
                <span className="text-gray-400">Fare Collected:</span><span className="text-green-400">₦{lastSummary.fareCollected.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h4 className="font-semibold">Trip Management</h4>
            <div className="flex gap-3 flex-wrap">
              {!tripRunning && status !== 'ended' && (
                <button className="btn-primary flex-1 min-w-[140px]" onClick={handleStartTrip}>
                  <Play className="w-4 h-4 inline mr-2" /> Start Trip
                </button>
              )}
              {tripActive && (
                <button className="btn-secondary flex-1 min-w-[140px]" onClick={pauseTrip}>
                  <Pause className="w-4 h-4 inline mr-2" /> Pause
                </button>
              )}
              {tripPaused && (
                <button className="btn-primary flex-1 min-w-[140px]" onClick={resumeTrip}>
                  <Play className="w-4 h-4 inline mr-2" /> Resume
                </button>
              )}
              {tripRunning && (
                <button className="btn-secondary flex-1 min-w-[140px] border-red-500/40 text-red-400" onClick={handleEndTrip}>
                  <Square className="w-4 h-4 inline mr-2" /> End Trip
                </button>
              )}
              {status === 'ended' && (
                <button className="btn-primary flex-1 min-w-[140px]" onClick={resetTrip}>
                  <RotateCcw className="w-4 h-4 inline mr-2" /> Start New Trip
                </button>
              )}
            </div>
            {!tripRunning && status === 'idle' && (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Timer className="w-3 h-3" /> Start a trip to activate the timer and all trip functions.
              </p>
            )}
          </div>

          <div className={`space-y-3 transition-opacity ${tripRunning ? '' : 'opacity-40 pointer-events-none'}`}>
            <h4 className="font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Passengers &amp; Fares
            </h4>
            <div className="flex items-center gap-3 flex-wrap">
              <button className="btn-secondary px-4 py-2" onClick={removePassenger}>−</button>
              <div className="text-center flex-1">
                <p className="text-3xl font-bold tabular-nums">{passengers}</p>
                <p className="text-xs text-gray-400">on board</p>
              </div>
              <button className="btn-secondary px-4 py-2" onClick={addPassenger}>+</button>
            </div>
            <div className="flex justify-between items-center bg-white/5 rounded-lg p-3 text-sm">
              <span className="text-gray-400 flex items-center gap-1"><Wallet className="w-4 h-4" /> Fare collected</span>
              <span className="font-bold text-green-400">₦{fareCollected.toLocaleString()}</span>
            </div>
          </div>

          <div className={`space-y-3 transition-opacity ${tripRunning ? '' : 'opacity-40 pointer-events-none'}`}>
            <h4 className="font-semibold">Bus Capacity Status</h4>
            <div className="flex gap-3">
              {capacityButtons.map((b) => (
                <button
                  key={b.key}
                  className={`flex-1 text-center p-3 rounded-lg border transition ${
                    busStatus === b.key
                      ? 'bg-primary text-white border-primary'
                      : 'btn-secondary'
                  }`}
                  onClick={() => { setBusStatus(b.key); showNotification('Bus Status', `Capacity set to: ${b.label}`, 'info'); }}
                >
                  <span className="block text-sm capitalize">{b.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-xl font-semibold mb-4">Live GPS Tracking Feed</h3>
        <MapContainer
          center={[5.5244, 7.5244]}
          zoom={13}
          style={{ height: '250px', width: '100%', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem', zIndex: 1 }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="\u00a9 OpenStreetMap contributors"
            maxZoom={19}
          />
          <DriverGpsLayer onUpdate={handleGpsUpdate} />
        </MapContainer>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1"><Navigation className="w-4 h-4 text-gray-500" /> Current Location:</span>
            <span className="text-green-400 font-medium text-right">{location}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1"><Gauge className="w-4 h-4 text-gray-500" /> Speed:</span>
            <span className="font-medium">{speed} km/h</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1"><RouteIcon className="w-4 h-4 text-gray-500" /> Next Stop:</span>
            <span className="text-green-400">{nextStop}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-gray-500" /> Trip Distance:</span>
            <span className="font-medium">{distanceKm.toFixed(2)} km</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1"><Bus className="w-4 h-4 text-gray-500" /> GPS Signal:</span>
            <span className="text-green-400 font-medium">Strong</span>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default DriverTab;