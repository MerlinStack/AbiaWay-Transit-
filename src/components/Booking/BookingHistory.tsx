import React, { memo, useState } from 'react';
import useBookingStore from '../../stores/bookingStore';

const getRouteLabel = (booking) => {
  if (typeof booking.route === 'string') return booking.route;
  if (booking.route?.name) return booking.route.name;
  if (booking.from && booking.to) return `${booking.from} → ${booking.to}`;
  return 'Unknown route';
};

const BookingHistory = memo(() => {
  const bookingHistory = useBookingStore((s) => s.bookingHistory);
  const cancelBooking = useBookingStore((s) => s.cancelBooking);
  const [filter, setFilter] = useState('all');

  const filteredBookings = bookingHistory.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'text-green-400 bg-green-500/20';
      case 'completed': return 'text-blue-400 bg-blue-500/20';
      case 'cancelled': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-white/10';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'confirmed': return 'clock';
      case 'completed': return 'check-circle';
      case 'cancelled': return 'x-circle';
      default: return 'circle';
    }
  };

  return (
    <div className="glass-card p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <i data-lucide="history" className="text-primary"></i>
          Your Bookings
        </h3>
        <div className="flex gap-1 bg-white/10 rounded-lg p-1">
          {['all', 'confirmed', 'completed', 'cancelled'].map(status => (
            <button
              key={status}
              className={`px-3 py-1 rounded-lg text-xs capitalize transition ${
                filter === status ? 'bg-primary text-white' : 'hover:bg-white/10'
              }`}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-2">
        {filteredBookings.length > 0 ? (
          filteredBookings.map(booking => (
            <div
              key={booking.id}
              className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition group"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold">{getRouteLabel(booking)}</p>
                  <p className="text-xs text-gray-400">{booking.date} at {booking.time}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                  <i data-lucide={getStatusIcon(booking.status)} className="w-3 h-3"></i>
                  {booking.status}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex gap-3">
                  <span className="text-gray-400">
                    <i data-lucide="bus" className="w-3 h-3 inline mr-1"></i>
                    {booking.bus || 'N/A'}
                  </span>
                  <span className="text-gray-400">
                    <i data-lucide="armchair" className="w-3 h-3 inline mr-1"></i>
                    {Array.isArray(booking.seats) ? booking.seats.join(', ') : 'Auto'}
                  </span>
                </div>
                <span className="font-bold text-primary">₦{booking.fare}</span>
              </div>
              {booking.status === 'confirmed' && (
                <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button className="text-xs px-3 py-1 bg-primary/20 text-primary rounded-lg hover:bg-primary/30">
                    View Ticket
                  </button>
                  <button 
                    className="text-xs px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                    onClick={() => {
                      if (window.confirm('Cancel this booking?')) {
                        cancelBooking(booking.id);
                      }
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <i data-lucide="calendar" className="w-12 h-12 text-gray-600 mx-auto mb-3"></i>
            <p className="text-gray-400">No bookings found</p>
          </div>
        )}
      </div>
    </div>
  );
});

export default BookingHistory;