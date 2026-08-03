import { useMemo, useState, useEffect } from 'react';
import { getTransitService } from '../../services/transit';
import { FleetBus } from '../../types/abssin';
import { getConsecutiveFailures } from '../../utils/maintenanceTracker';

interface Driver {
  id: string;
  name: string;
  phone: string;
  assignedBus: string | null;
  routeId: string | null;
  status: 'online' | 'on-trip' | 'offline';
  lastCheckin: string | null;
  shiftStart: string | null;
  checkinsToday: number;
}

type SortKey = 'id' | 'name' | 'status' | 'assignedBus';

function AdminDriverPanel() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDrivers = async () => {
      const transit = getTransitService();
      const fleet = await transit.getActiveFleet();
      const generatedDrivers = Array.from({ length: 40 }, (_, i) => {
        const bus = fleet[i];
        const isActive = i < 32;
        return {
          id: `DRV-${String(i + 1).padStart(3, '0')}`,
          name: `Driver ${i + 1}`,
          phone: `+234-80${String(Math.floor(Math.random() * 90000000) + 10000000)}`,
          assignedBus: isActive ? bus?.plateNumber || null : null,
          routeId: isActive ? bus?.routeId || null : null,
          status: isActive ? (i < 20 ? 'on-trip' : 'online') : 'offline',
          lastCheckin: isActive ? new Date(Date.now() - Math.floor(Math.random() * 8) * 3600000).toISOString() : null,
          shiftStart: isActive ? new Date(Date.now() - Math.floor(Math.random() * 4 + 1) * 3600000).toISOString() : null,
          checkinsToday: Math.floor(Math.random() * 3) + 1,
        };
      });
      setDrivers(generatedDrivers);
      setLoading(false);
    };
    loadDrivers();
  }, []);

  const filtered = useMemo(() => {
    let list = [...drivers];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((d) => d.id.toLowerCase().includes(q) || d.name.toLowerCase().includes(q) || (d.assignedBus || '').toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') {
      list = list.filter((d) => d.status === statusFilter);
    }
    list.sort((a, b) => {
      const va = a[sortKey] || '';
      const vb = b[sortKey] || '';
      return typeof va === 'string' ? va.localeCompare(vb as string) : 0;
    });
    return list;
  }, [search, statusFilter, sortKey, drivers]);

  const statusCounts = useMemo(() => ({
    online: drivers.filter((d) => d.status === 'online').length,
    'on-trip': drivers.filter((d) => d.status === 'on-trip').length,
    offline: drivers.filter((d) => d.status === 'offline').length,
  }), [drivers]);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Driver Management</h2>
          <p className="text-sm text-gray-400">View and manage all drivers across the fleet</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-gray-400">Online: <strong className="text-white">{statusCounts.online}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-gray-400">On Trip: <strong className="text-white">{statusCounts['on-trip']}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-500"></span>
            <span className="text-gray-400">Offline: <strong className="text-white">{statusCounts.offline}</strong></span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ID, name, or plate..."
          className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm w-64 placeholder-gray-500 focus:outline-none focus:border-green-500" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-green-500">
          <option value="all">All Statuses</option>
          <option value="online">Online</option>
          <option value="on-trip">On Trip</option>
          <option value="offline">Offline</option>
        </select>
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-green-500">
          <option value="id">Sort by ID</option>
          <option value="name">Sort by Name</option>
          <option value="status">Sort by Status</option>
          <option value="assignedBus">Sort by Bus</option>
        </select>
        <span className="text-xs text-gray-500 ml-auto">{filtered.length} of {drivers.length} drivers</span>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {['ID', 'Name', 'Phone', 'Assigned Bus', 'Route', 'Status', 'Last Check-in', 'Shift Start', 'Check-ins'].map((h) => (
                  <th key={h} className="text-left py-3 px-3 text-gray-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((driver) => (
                <tr key={driver.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="py-3 px-3 font-mono text-xs">{driver.id}</td>
                  <td className="py-3 px-3">{driver.name}</td>
                  <td className="py-3 px-3 text-xs text-gray-400">{driver.phone}</td>
                  <td className="py-3 px-3 text-xs text-gray-400">{driver.assignedBus || '—'}</td>
                  <td className="py-3 px-3 text-xs text-gray-400">{driver.routeId || '—'}</td>
                  <td className="py-3 px-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      driver.status === 'online' ? 'bg-green-500/20 text-green-400' :
                      driver.status === 'on-trip' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>{driver.status}</span>
                  </td>
                  <td className="py-3 px-3 text-xs text-gray-400">
                    {driver.lastCheckin
                      ? new Date(driver.lastCheckin).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </td>
                  <td className="py-3 px-3 text-xs text-gray-400">
                    {driver.shiftStart
                      ? new Date(driver.shiftStart).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </td>
                  <td className="py-3 px-3 text-xs text-gray-400">{driver.checkinsToday}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDriverPanel;