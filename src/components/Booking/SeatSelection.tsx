import React, { memo, useState } from 'react';
import { Armchair, Gauge } from 'lucide-react';

interface SeatSelectionProps {
  onSelect: (seats: string[]) => void;
  selectedSeats?: string[];
  passengers?: number;
}

const SeatSelection = memo(({ onSelect, selectedSeats = [], passengers = 1 }: SeatSelectionProps) => {
  const [selected, setSelected] = useState(selectedSeats);
  const [busLayout] = useState({
    rows: 10,
    columns: 4,
    available: ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4'],
    booked: ['A5', 'B5', 'C5', 'D1', 'D2', 'E1', 'E2'],
    ladies: ['F1', 'F2', 'G1', 'G2'],
    handicapped: ['H1', 'H2']
  });

  const getSeatStatus = (seat) => {
    if (selected.includes(seat)) return 'selected';
    if (busLayout.booked.includes(seat)) return 'booked';
    if (busLayout.ladies.includes(seat)) return 'ladies';
    if (busLayout.handicapped.includes(seat)) return 'handicapped';
    return 'available';
  };

  const getSeatColor = (status) => {
    switch(status) {
      case 'selected': return 'bg-primary text-white border-primary';
      case 'booked': return 'bg-red-500/20 text-red-400 border-red-500/30 cursor-not-allowed';
      case 'ladies': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'handicapped': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-white/5 hover:bg-primary/20 border-white/10';
    }
  };

  const handleSeatClick = (seat) => {
    const status = getSeatStatus(seat);
    if (status === 'booked') return;

    if (status === 'selected') {
      const newSelected = selected.filter(s => s !== seat);
      setSelected(newSelected);
      onSelect(newSelected);
    } else if (selected.length < passengers) {
      const newSelected = [...selected, seat];
      setSelected(newSelected);
      onSelect(newSelected);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Select Your Seats</h3>
        <div className="text-sm">
          <span className="text-primary font-bold">{selected.length}</span>
          <span className="text-gray-400">/{passengers} seats selected</span>
        </div>
      </div>

      {/* Bus Layout */}
      <div className="relative p-8 bg-white/5 rounded-2xl">
        {/* Driver Cabin */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <div className="w-16 h-8 bg-primary/30 rounded-t-lg flex items-center justify-center text-xs">
            <Gauge className="w-4 h-4 mr-1" />
            Driver
          </div>
        </div>

        {/* Exit Doors */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-2 h-8 bg-yellow-500/50 rounded"></div>
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-2 h-8 bg-yellow-500/50 rounded"></div>

        {/* Seats Grid */}
        <div className="grid grid-cols-4 gap-3 mt-12">
          {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map(row => (
            <React.Fragment key={row}>
              {[1, 2, 3, 4].map(col => {
                const seat = `${row}${col}`;
                const status = getSeatStatus(seat);
                return (
                  <button
                    key={seat}
                    className={`seat p-3 border-2 rounded-lg transition-all ${getSeatColor(status)} ${
                      status !== 'booked' ? 'cursor-pointer hover:scale-105' : ''
                    }`}
                    onClick={() => handleSeatClick(seat)}
                    disabled={status === 'booked'}
                  >
                    <div className="text-center">
                      <Armchair className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-xs">{seat}</span>
                    </div>
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* Aisle */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20 transform -translate-x-1/2"></div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 p-4 bg-white/5 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-primary rounded"></div>
          <span className="text-xs">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-red-500/20 border border-red-500/30 rounded"></div>
          <span className="text-xs">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-pink-500/20 border border-pink-500/30 rounded"></div>
          <span className="text-xs">Ladies</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-blue-500/20 border border-blue-500/30 rounded"></div>
          <span className="text-xs">Handicapped</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-white/5 border border-white/10 rounded"></div>
          <span className="text-xs">Available</span>
        </div>
      </div>

      {/* Selected Seats Summary */}
      {selected.length > 0 && (
        <div className="p-4 bg-primary/10 rounded-lg flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-400">Selected Seats</p>
            <p className="text-lg font-bold">{selected.join(', ')}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Total Fare</p>
            <p className="text-lg font-bold text-primary">
              ₦{(350 * selected.length).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Continue Button */}
      <button
        className={`w-full btn-primary py-4 text-lg ${
          selected.length !== passengers ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={() => selected.length === passengers && onSelect(selected)}
        disabled={selected.length !== passengers}
      >
        {selected.length === passengers 
          ? 'Continue to Payment' 
          : `Select ${passengers - selected.length} more seat${passengers - selected.length > 1 ? 's' : ''}`}
      </button>
    </div>
  );
});

export default SeatSelection;