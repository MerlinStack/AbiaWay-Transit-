import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DriverGpsLayer from './DriverGpsLayer';

if (typeof L !== 'undefined' && L.Icon && L.Icon.Default) {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

function DriverTab() {
  const [location, setLocation] = useState('Umuahia Main Park');
  const [speed, setSpeed] = useState(35);
  const [nextStop, setNextStop] = useState('Aba Road (2.5 km)');

  const handleGpsUpdate = useCallback((data) => {
    setLocation(data.location);
    setSpeed(data.speed);
    setNextStop(data.nextStop);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="glass-card p-6" style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', border: '2px solid #16a34a' }}>
        <h3 className="text-xl font-semibold mb-6">Driver Dashboard</h3>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
              <i data-lucide="user" className="w-8 h-8"></i>
            </div>
            <div>
              <h4 className="font-semibold">Chidi Okonkwo</h4>
              <p className="text-sm text-gray-400">Driver ID: DRV-101 \u2022 Bus #AB-101</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-sm text-gray-400">Today's Trips</p>
              <p className="text-2xl font-bold">8</p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-sm text-gray-400">Next Trip</p>
              <p className="text-2xl font-bold">09:30</p>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold">Trip Management</h4>
            <div className="flex gap-3">
              <button className="btn-primary flex-1" onClick={() => alert('Trip started!')}>
                <i data-lucide="play" className="w-4 h-4 inline mr-2"></i> Start Trip
              </button>
              <button className="btn-secondary flex-1" onClick={() => alert('Trip paused')}>
                <i data-lucide="pause" className="w-4 h-4 inline mr-2"></i> Pause
              </button>
              <button className="btn-secondary flex-1" onClick={() => alert('Trip ended')}>
                <i data-lucide="square" className="w-4 h-4 inline mr-2"></i> End
              </button>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold">Bus Capacity Status</h4>
            <div className="flex gap-3">
              {['empty', 'medium', 'full'].map((status) => (
                <button key={status} className="btn-secondary flex-1 text-center p-3" onClick={() => alert(`Bus status updated: ${status}`)}>
                  <span className="block text-sm capitalize">{status}</span>
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
            <span>Current Location:</span>
            <span className="text-green-400 font-medium">{location}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Speed:</span>
            <span className="font-medium">{speed} km/h</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Next Stop:</span>
            <span className="text-green-400">{nextStop}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>GPS Signal:</span>
            <span className="text-green-400 font-medium">Strong</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DriverTab;
