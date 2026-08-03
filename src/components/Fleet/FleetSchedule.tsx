import { useMemo, useState, useEffect } from 'react';
import { getTransitService } from '../../services/transit';
import { FleetBus, FleetSummary } from '../../types/abssin';
import { Bus } from 'lucide-react';
import { getBatteryColor } from '../../utils/battery';

const FLEET_SCALING_TARGET = 120;
const LOOP_LABELS = ['Loop 1 (06:00–09:00)', 'Loop 2 (09:00–12:00)', 'Loop 3 (12:00–15:00)', 'Loop 4 (15:00–18:00)', 'Loop 5 (18:00–21:00)', 'Night Pool (21:00–06:00)'];

const FleetSchedule = () => {
  const [view, setView] = useState<'cards' | 'list'>('cards');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [fleet, setFleet] = useState<FleetBus[]>([]);
  const [summary, setSummary] = useState<FleetSummary>({
    total: 0, active: 0, charging: 0, maintenance: 0, idle: 0, avgBattery: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const transit = getTransitService();
      const [fleetData, summaryData] = await Promise.all([
        transit.getActiveFleet(),
        transit.getFleetSummary(),
      ]);
      setFleet(fleetData);
      setSummary(summaryData);
      setLoading(false);
    };
    loadData();
  }, []);

  const filteredFleet = useMemo(() =>
    filterStatus === 'all' ? fleet : fleet.filter((b) => b.status === filterStatus),
  [filterStatus, fleet]);

  const activeLoops = useMemo(() => {
    const loops: Record<number, typeof fleet> = {};
    fleet.forEach((b) => {
      if (b.status === 'active') {
        const l = b.currentLoop;
        if (!loops[l]) loops[l] = [];
        loops[l].push(b);
      }
    });
    return Object.entries(loops).sort(([a], [b]) => Number(a) - Number(b));
  }, [fleet]);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Bus className="text-primary" />
            Fleet Management
            <span className="text-sm font-normal text-gray-400 ml-2">({summary.total} / {FLEET_SCALING_TARGET} target)</span>
          </h3>
          <div className="flex gap-2">
            {['all', 'active', 'charging', 'idle', 'maintenance'].map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1 rounded-lg text-xs transition ${filterStatus === s ? 'bg-primary text-white' : 'bg-white/10 hover:bg-white/20'}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)} {s === 'all' ? `(${summary.total})` : `(${summary[s as keyof typeof summary]})`}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-white/10 rounded-lg p-1">
            <button onClick={() => setView('cards')} className={`px-3 py-1 rounded-lg text-xs ${view === 'cards' ? 'bg-primary text-white' : ''}`}>Cards</button>
            <button onClick={() => setView('list')} className={`px-3 py-1 rounded-lg text-xs ${view === 'list' ? 'bg-primary text-white' : ''}`}>List</button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {Object.entries(summary).map(([key, val]) => (
            <div key={key} className="p-4 bg-white/5 rounded-lg text-center">
              <p className="text-2xl font-bold">{val}</p>
              <p className="text-xs text-gray-400 capitalize">{key}</p>
            </div>
          ))}
        </div>

        {view === 'cards' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredFleet.map((bus) => (
              <div key={bus.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold">{bus.id}</p>
                    <p className="text-xs text-gray-400">{bus.plateNumber}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    bus.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    bus.status === 'charging' ? 'bg-blue-500/20 text-blue-400' :
                    bus.status === 'maintenance' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>{bus.status}</span>
                </div>
                <div className="space-y-1 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>Battery</span>
                    <span style={{ color: getBatteryColor(bus.batterySoC) }}>{bus.batterySoC}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full transition-all"
                      style={{ width: `${bus.batterySoC}%`, backgroundColor: getBatteryColor(bus.batterySoC) }}></div>
                  </div>
                  <div className="flex justify-between"><span>Range</span><span>{bus.rangeKm} km</span></div>
                  {bus.routeId && <div className="flex justify-between"><span>Route</span><span className="text-right text-white">{bus.routeId}</span></div>}
                  {bus.lastHealthCheck && <div className="flex justify-between"><span>Last Check</span><span>{new Date(bus.lastHealthCheck).toLocaleDateString()}</span></div>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-white/10">
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">Plate</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Battery</th>
                  <th className="text-left p-2">Range</th>
                  <th className="text-left p-2">Route</th>
                  <th className="text-left p-2">Driver</th>
                  <th className="text-left p-2">Loop</th>
                </tr>
              </thead>
              <tbody>
                {filteredFleet.map((bus) => (
                  <tr key={bus.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-2 font-semibold">{bus.id}</td>
                    <td className="p-2 text-gray-400">{bus.plateNumber}</td>
                    <td className="p-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        bus.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        bus.status === 'charging' ? 'bg-blue-500/20 text-blue-400' :
                        bus.status === 'maintenance' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>{bus.status}</span>
                    </td>
                    <td className="p-2">
                      <span style={{ color: getBatteryColor(bus.batterySoC) }}>{bus.batterySoC}%</span>
                    </td>
                    <td className="p-2 text-gray-400">{bus.rangeKm} km</td>
                    <td className="p-2 text-gray-400">{bus.routeId || '—'}</td>
                    <td className="p-2 text-gray-400">{bus.driverId || '—'}</td>
                    <td className="p-2 text-gray-400">{LOOP_LABELS[bus.currentLoop] || `Loop ${bus.currentLoop}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="glass-card p-6">
        <h4 className="font-semibold mb-4">Active Loops & Schedule</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeLoops.map(([loop, buses]) => (
            <div key={loop} className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="font-semibold text-sm mb-2">{LOOP_LABELS[Number(loop)]}</p>
              <p className="text-2xl font-bold text-primary mb-2">{buses.length} buses</p>
              <div className="space-y-1">
                {buses.slice(0, 4).map((b) => (
                  <div key={b.id} className="flex justify-between text-xs text-gray-400">
                    <span>{b.id} ({b.plateNumber})</span>
                    <span style={{ color: getBatteryColor(b.batterySoC) }}>{b.batterySoC}%</span>
                  </div>
                ))}
                {buses.length > 4 && <p className="text-xs text-gray-500 mt-1">+{buses.length - 4} more</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FleetSchedule;
