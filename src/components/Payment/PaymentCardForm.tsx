import { memo } from 'react';
import { ArrowLeft, Eye } from 'lucide-react';

interface CardFormProps {
  amount: string;
  onAmountChange: (val: string) => void;
  cardDetails: { number: string; expiry: string; cvv: string; holder: string };
  onCardDetailChange: (field: string, value: string) => void;
  cardBalance: { balance: number; cardType?: string; lastFour?: string } | null;
  checkingBalance: boolean;
  isProcessing: boolean;
  onCheckBalance: () => void;
  onPay: () => void;
  onBack: () => void;
}

const formatCardNumber = (value: string) => {
  const cleaned = value.replace(/\s/g, '');
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : cleaned;
};

const PaymentCardForm = memo(({
  amount, onAmountChange, cardDetails, onCardDetailChange,
  cardBalance, checkingBalance, isProcessing, onCheckBalance, onPay, onBack,
}: CardFormProps) => {
  const amountNum = parseInt(amount) || 0;
  return (
    <div className="space-y-4" role="form" aria-label="Card payment form">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={onBack} aria-label="Go back to payment method selection" className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-bold">Card Payment</h3>
      </div>

      <div>
        <label htmlFor="card-amount" className="block text-sm text-gray-400 mb-2">Amount</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">₦</span>
          <input id="card-amount" type="number" value={amount} onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0.00" aria-required="true" aria-describedby="card-fee-hint"
            className="w-full bg-white/10 border border-white/20 rounded-lg pl-8 pr-4 py-3" />
        </div>
        <p id="card-fee-hint" className="text-xs text-gray-500 mt-1">Fee: ₦50 • Min: ₦100 • Max: ₦500,000</p>
      </div>

      <div>
        <label htmlFor="card-number" className="block text-sm text-gray-400 mb-2">Card Number</label>
        <div className="flex gap-2">
          <input id="card-number" type="text" value={cardDetails.number}
            onChange={(e) => onCardDetailChange('number', formatCardNumber(e.target.value.replace(/\s/g, '').slice(0, 16)))}
            placeholder="1234 5678 9012 3456" maxLength={19} aria-required="true"
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3" />
          <button onClick={onCheckBalance} disabled={checkingBalance} aria-label="Check card balance"
            className="px-4 bg-white/10 rounded-lg hover:bg-white/20 transition">
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>

      {cardBalance && (
        <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30" role="status" aria-live="polite">
          <div className="flex justify-between">
            <span>Available Balance:</span>
            <span className="font-bold text-green-400">₦{cardBalance.balance.toLocaleString()}</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {cardBalance.cardType?.toUpperCase()} • Last 4: {cardBalance.lastFour}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="card-expiry" className="block text-sm text-gray-400 mb-2">Expiry (MM/YY)</label>
          <input id="card-expiry" type="text" value={cardDetails.expiry}
            onChange={(e) => onCardDetailChange('expiry', e.target.value)}
            placeholder="12/28" maxLength={5} aria-required="true"
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3" />
        </div>
        <div>
          <label htmlFor="card-cvv" className="block text-sm text-gray-400 mb-2">CVV</label>
          <input id="card-cvv" type="password" value={cardDetails.cvv}
            onChange={(e) => onCardDetailChange('cvv', e.target.value)}
            placeholder="123" maxLength={4} aria-required="true"
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3" />
        </div>
      </div>

      <div>
        <label htmlFor="card-holder" className="block text-sm text-gray-400 mb-2">Cardholder Name</label>
        <input id="card-holder" type="text" value={cardDetails.holder}
          onChange={(e) => onCardDetailChange('holder', e.target.value.toUpperCase())}
          placeholder="ABUOMA DAVID" aria-required="true"
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3" />
      </div>

      <div className="p-3 bg-yellow-500/10 rounded-lg" aria-live="polite">
        <div className="flex justify-between"><span>Amount:</span><span className="font-bold">₦{amountNum}</span></div>
        <div className="flex justify-between"><span>Fee:</span><span className="text-yellow-400">₦50</span></div>
        <div className="flex justify-between pt-2 border-t border-white/10 mt-2">
          <span className="font-bold">Total:</span><span className="font-bold text-primary">₦{amountNum + 50}</span>
        </div>
      </div>

      <button className="w-full btn-primary py-3 rounded-lg" onClick={onPay} disabled={isProcessing} aria-busy={isProcessing}>
        {isProcessing ? 'Processing...' : `Pay ₦${amountNum}`}
      </button>
    </div>
  );
});

export default PaymentCardForm;
