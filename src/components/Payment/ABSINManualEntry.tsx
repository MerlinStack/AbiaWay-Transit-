import { memo } from 'react';

interface ABSINManualEntryProps {
  cardNumber: string;
  pin: string;
  amount: number;
  isProcessing: boolean;
  onCardNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPinChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPay: () => void;
  onCancel: () => void;
}

const ABSINManualEntry = memo(({
  cardNumber, pin, amount, isProcessing,
  onCardNumberChange, onPinChange, onPay, onCancel,
}: ABSINManualEntryProps) => (
  <div className="glass-card p-6">
    <h3 className="text-xl font-semibold mb-5">Enter ABSIN Card Details</h3>
    <div className="mb-4">
      <label className="block text-sm text-gray-400 mb-2">Card Number</label>
      <input type="text" value={cardNumber} onChange={onCardNumberChange}
        placeholder="1234 5678 9012 3456" maxLength={19}
        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" />
    </div>
    <div className="mb-6">
      <label className="block text-sm text-gray-400 mb-2">PIN</label>
      <input type="password" value={pin} onChange={onPinChange}
        placeholder="****" maxLength={6}
        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" />
    </div>
    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl mb-3 transition"
      onClick={onPay} disabled={isProcessing}>
      {isProcessing ? 'Processing...' : `Pay ₦${amount}`}
    </button>
    <button className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl transition" onClick={onCancel}>
      Cancel
    </button>
  </div>
));

export default ABSINManualEntry;
