import { MapPin, ArrowLeftRight, Flag, Calendar, Clock, Users, ArrowRight, Search } from 'lucide-react';
import React, { memo, useState, useEffect } from 'react';

interface RouteSearchProps {
  onSearch: (data: { from: string; to: string; date: string; time: string; passengers: number }) => void;
  initialData: { from?: string; to?: string; date?: string; time?: string; passengers?: number };
}

const RouteSearch = memo(({ onSearch, initialData }: RouteSearchProps) => {
  const [searchData, setSearchData] = useState({
    from: initialData.from || '',
    to: initialData.to || '',
    date: initialData.date || new Date().toISOString().split('T')[0],
    time: initialData.time || '08:00',
    passengers: initialData.passengers || 1
  });

  const [swapAnimation, setSwapAnimation] = useState(false);
  const [popularRoutes] = useState([
    { from: 'Umuahia', to: 'Aba' },
    { from: 'Aba', to: 'Umuahia' },
    { from: 'Umuahia', to: 'Ohafia' },
    { from: 'Aba', to: 'Port Harcourt' },
  ]);

  const locations = [
    'Umuahia',
    'Aba',
    'Ohafia',
    'Bende',
    'Arochukwu',
    'Port Harcourt',
    'Ikot Ekpene'
  ];

  const handleSwap = () => {
    setSwapAnimation(true);
    setSearchData(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }));
    setTimeout(() => setSwapAnimation(false), 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchData.from && searchData.to) {
      onSearch(searchData);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Where would you like to go?</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2 relative">
            <label className="block text-sm text-gray-400 mb-2">From</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select
                value={searchData.from}
                onChange={(e) => setSearchData(prev => ({ ...prev, from: e.target.value }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 appearance-none cursor-pointer focus:border-primary focus:outline-none"
                required
              >
                <option value="" className="bg-gray-800">Select departure</option>
                {locations.map(loc => (
                  <option key={loc} value={loc} className="bg-gray-800">{loc}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="md:col-span-1 flex items-end justify-center pb-3">
            <button
              type="button"
              onClick={handleSwap}
              className={`w-10 h-10 rounded-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center transition-all ${swapAnimation ? 'rotate-180' : ''}`}
            >
              <ArrowLeftRight className="w-5 h-5 text-primary" />
            </button>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-2">To</label>
            <div className="relative">
              <Flag className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select
                value={searchData.to}
                onChange={(e) => setSearchData(prev => ({ ...prev, to: e.target.value }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 appearance-none cursor-pointer focus:border-primary focus:outline-none"
                required
              >
                <option value="" className="bg-gray-800">Select destination</option>
                {locations.map(loc => (
                  <option key={loc} value={loc} className="bg-gray-800">{loc}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={searchData.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSearchData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Time</label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select
                value={searchData.time}
                onChange={(e) => setSearchData(prev => ({ ...prev, time: e.target.value }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 appearance-none cursor-pointer focus:border-primary focus:outline-none"
              >
                {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map(time => (
                  <option key={time} value={time} className="bg-gray-800">{time}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Passengers</label>
            <div className="relative">
              <Users className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select
                value={searchData.passengers}
                onChange={(e) => setSearchData(prev => ({ ...prev, passengers: parseInt(e.target.value) }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 appearance-none cursor-pointer focus:border-primary focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num} className="bg-gray-800">{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Popular Routes */}
        <div className="mt-6">
          <p className="text-sm text-gray-400 mb-3">Popular Routes</p>
          <div className="flex flex-wrap gap-2">
            {popularRoutes.map((route, index) => (
              <button
                key={index}
                type="button"
                className="px-4 py-2 bg-white/5 hover:bg-primary/20 rounded-lg text-sm transition flex items-center gap-2"
                onClick={() => setSearchData({
                  ...searchData,
                  from: route.from,
                  to: route.to
                })}
              >
                <ArrowRight className="w-3 h-3" />
                {route.from} → {route.to}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full btn-primary py-4 text-lg mt-6"
          disabled={!searchData.from || !searchData.to}
        >
          <Search className="w-5 h-5 inline mr-2" />
          Search Available Buses
        </button>
      </form>
    </div>
  );
});

export default RouteSearch;