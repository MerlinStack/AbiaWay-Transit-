import { memo } from 'react';
import { ArrowLeft } from 'lucide-react';

interface ABSINFormProps {
  amount: string;
  onAmountChange: (val: string) => void;
  cardNumber: string;
  pin: string;
  onCardNumberChange: (val: string) => void;
  onPinChange: (val: string) => void;
  isProcessing: boolean;
  onPay: () => void;
  onBack: () => void;
}

const PaymentABSINForm = memo(({
  amount, onAmountChange, cardNumber, pin,
  onCardNumberChange, onPinChange, isProcessing, onPay, onBack,
}: ABSINFormProps) => {
  const amountNum = parseInt(amount) || 0;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={onBack} className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-bold">ABSIN Card</h3>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Amount</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₦</span>
          <input type="number" value={amount} onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0.00" className="w-full bg-white/10 border border-white/20 rounded-lg pl-8 pr-4 py-3" />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Card Number</label>
        <input type="text" value={cardNumber}
          onChange={(e) => onCardNumberChange(e.target.value.replace(/\s/g, '').slice(0, 16))}
          placeholder="1111 2222 3333 4444" maxLength={16}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3" />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">PIN</label>
        <input type="password" value={pin}
          onChange={(e) => onPinChange(e.target.value.slice(0, 4))}
          placeholder="****" maxLength={4}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3" />
      </div>

      <div className="p-3 bg-yellow-500/10 rounded-lg">
        <div className="flex justify-between"><span>Amount:</span><span className="font-bold">₦{amountNum}</span></div>
        <div className="flex justify-between"><span>Fee:</span><span className="text-yellow-400">₦20</span></div>
        <div className="flex justify-between pt-2 border-t border-white/10 mt-2">
          <span className="font-bold">Total:</span><span className="font-bold text-primary">₦{amountNum + 20}</span>
        </div>
      </div>

      <button className="w-full btn-primary py-3 rounded-lg" onClick={onPay} disabled={isProcessing}>
        {isProcessing ? 'Processing...' : `Pay ₦${amountNum}`}
      </button>
    </div>
  );
});

export default PaymentABSINForm;
