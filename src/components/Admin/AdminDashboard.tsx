import React, { memo, useMemo, useState, useEffect } from 'react';
import { Bus, Activity, BatteryCharging, Wrench, BatteryFull, Route, Truck } from 'lucide-react';
import { getTransitService } from '../../services/transit';
import { FleetBus } from '../../types/abssin';
import { getBatteryColor } from '../../utils/battery';

const summaryCards = [
  { label: 'Total Buses', icon: 'bus', key: 'total' as const, color: 'blue' },
  { label: 'Active on Route', icon: 'activity', key: 'active' as const, color: 'green' },
  { label: 'Charging', icon: 'battery-charging', key: 'charging' as const, color: 'yellow' },
  { label: 'Maintenance', icon: 'wrench', key: 'maintenance' as const, color: 'red' },
];

const batteryLevels = [
  { label: '≥ 80%', min: 80, color: 'bg-green-500' },
  { label: '60–79%', min: 60, color: 'bg-yellow-500' },
  { label: '40–59%', min: 40, color: 'bg-orange-500' },
  { label: '< 40%', min: 0, color: 'bg-red-500' },
];

const ROUTES = ['Umuahia-Aba', 'Aba-Umuahia', 'Umuahia-Ohafia', 'Ohafia-Umuahia', 'Umuahia-Ugwogo', 'Aba-Owerri'];

function AdminDashboard() {
  const [summary, setSummary] = useState({
    total: 0,
    active: 0,
    charging: 0,
    maintenance: 0,
    idle: 0,
    avgBattery: 0,
  });
  const [activeBuses, setActiveBuses] = useState<FleetBus[]>([]);
  const [fleet, setFleet] = useState<FleetBus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const transit = getTransitService();
      const [fleetData, summaryData] = await Promise.all([
        transit.getActiveFleet(),
        transit.getFleetSummary(),
      ]);
      setFleet(fleetData);
      setActiveBuses(fleetData);
      setSummary(summaryData);
      setLoading(false);
    };
    loadData();
  }, []);

  const routeDistribution = useMemo(() =>
    ROUTES.map((route) => ({
      route,
      count: activeBuses.filter((b) => b.routeId === route).length,
    })), [activeBuses]);

  const batteryBins = useMemo(() =>
    batteryLevels.map((bin) => ({
      ...bin,
      count: fleet.filter((b) => b.batterySoC >= bin.min && (bin.min === 0 || b.batterySoC < (bin.min + 20))).length,
    })), [fleet]);

  const colorMap: Record<string, string> = {
    blue: 'from-blue-600/20 to-blue-800/20 text-blue-400 border-blue-500/30',
    green: 'from-green-600/20 to-green-800/20 text-green-400 border-green-500/30',
    yellow: 'from-yellow-600/20 to-yellow-800/20 text-yellow-400 border-yellow-500/30',
    red: 'from-red-600/20 to-red-800/20 text-red-400 border-red-500/30',
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          <p className="text-sm text-gray-400">System-wide fleet and operations overview</p>
        </div>
        <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full border border-green-500/30">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div key={card.key} className={`p-4 rounded-xl bg-gradient-to-br ${colorMap[card.color]} border`}>
            <div className="flex items-center gap-3 mb-2">
              {(() => { const icons: Record<string, React.JSX.Element> = { bus: <Bus className="w-5 h-5" />, activity: <Activity className="w-5 h-5" />, 'battery-charging': <BatteryCharging className="w-5 h-5" />, wrench: <Wrench className="w-5 h-5" /> }; return icons[card.icon] || null; })()}
              <span className="text-sm text-gray-400">{card.label}</span>
            </div>
            <p className="text-3xl font-bold">{summary[card.key]}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BatteryFull className="w-5 h-5 text-green-400" />
            Battery Distribution
          </h3>
          <div className="space-y-3">
            {batteryBins.map((bin) => (
              <div key={bin.label} className="flex items-center gap-3">
                <span className="text-sm text-gray-400 w-16">{bin.label}</span>
                <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${bin.color} rounded-full transition-all`}
                    style={{ width: `${(bin.count / FLEET.length) * 100}%` }} />
                </div>
                <span className="text-sm font-mono w-8 text-right">{bin.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 flex justify-between text-sm text-gray-500">
            <span>Average: <span className="font-bold text-white">{summary.avgBattery}%</span></span>
            <span>Charging: <span className="font-bold text-yellow-400">{summary.charging}</span></span>
            <span>Idle: <span className="font-bold text-gray-400">{summary.idle}</span></span>
          </div>
        </div>

        <div className="glass-card p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Route className="w-5 h-5 text-blue-400" />
            Route Distribution
          </h3>
          <div className="space-y-3">
            {routeDistribution.map((rd) => (
              <div key={rd.route} className="flex items-center gap-3">
                <span className="text-sm text-gray-400 flex-1 truncate">{rd.route}</span>
                <div className="w-32 h-4 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${activeBuses.length > 0 ? (rd.count / activeBuses.length) * 100 : 0}%` }} />
                </div>
                <span className="text-sm font-mono w-6 text-right">{rd.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 flex justify-between text-sm text-gray-500">
            <span>Active on routes: <span className="font-bold text-white">{activeBuses.length}</span></span>
            <span>Total fleet: <span className="font-bold text-white">{summary.total}</span></span>
          </div>
        </div>
      </div>

      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5 text-green-400" />
          Fleet Status Overview
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-white/10">
                <th className="text-left py-2 px-3">Plate</th>
                <th className="text-left py-2 px-3">Route</th>
                <th className="text-left py-2 px-3">Status</th>
                <th className="text-left py-2 px-3">Battery</th>
                <th className="text-left py-2 px-3">Driver</th>
                <th className="text-left py-2 px-3">Co-Pilot</th>
                <th className="text-left py-2 px-3">CCTV</th>
                <th className="text-left py-2 px-3">Exit</th>
              </tr>
            </thead>
            <tbody>
              {fleet.slice(0, 15).map((bus) => (
                <tr key={bus.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="py-2 px-3 font-mono text-xs">{bus.plateNumber}</td>
                  <td className="py-2 px-3 text-xs text-gray-400">{bus.routeId || '—'}</td>
                  <td className="py-2 px-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      bus.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      bus.status === 'charging' ? 'bg-yellow-500/20 text-yellow-400' :
                      bus.status === 'idle' ? 'bg-gray-500/20 text-gray-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>{bus.status}</span>
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${bus.batterySoC}%`, backgroundColor: getBatteryColor(bus.batterySoC) }} />
                      </div>
                      <span className="text-xs font-mono">{bus.batterySoC}%</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-400">{bus.driverId || '—'}</td>
                  <td className="py-2 px-3 text-xs text-gray-400">{bus.coPilotId || '—'}</td>
                  <td className="py-2 px-3">
                    <span className={bus.cctvFunctional ? 'text-green-400' : 'text-red-400'}>
                      {bus.cctvFunctional ? 'OK' : 'FAIL'}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className={bus.emergencyExitFunctional ? 'text-green-400' : 'text-red-400'}>
                      {bus.emergencyExitFunctional ? 'OK' : 'FAIL'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-500 text-center mt-3">Showing 15 of {fleet.length} buses</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
