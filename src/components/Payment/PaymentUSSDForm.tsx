import { memo } from 'react';
import { ArrowLeft } from 'lucide-react';

interface USSDFormProps {
  amount: string;
  onAmountChange: (val: string) => void;
  bank: string;
  phone: string;
  onBankChange: (val: string) => void;
  onPhoneChange: (val: string) => void;
  ussdResponse: { ussdCode: string; reference: string } | null;
  isProcessing: boolean;
  banks: { code: string; name: string }[];
  onPay: () => void;
  onBack: () => void;
}

const PaymentUSSDForm = memo(({
  amount, onAmountChange, bank, phone, onBankChange, onPhoneChange,
  ussdResponse, isProcessing, banks, onPay, onBack,
}: USSDFormProps) => {
  const amountNum = parseInt(amount) || 0;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={onBack} className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-bold">USSD Payment</h3>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Amount</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₦</span>
          <input type="number" value={amount} onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0.00" className="w-full bg-white/10 border border-white/20 rounded-lg pl-8 pr-4 py-3" />
        </div>
        <p className="text-xs text-gray-500 mt-1">Fee: ₦30 • Min: ₦100 • Max: ₦200,000</p>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Select Bank</label>
        <select value={bank} onChange={(e) => onBankChange(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3">
          <option value="">Select Bank</option>
          {banks.map((b) => (<option key={b.code} value={b.code}>{b.name}</option>))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Phone Number</label>
        <input type="tel" value={phone} onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="08012345678" maxLength={11}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3" />
      </div>

      <div className="p-3 bg-yellow-500/10 rounded-lg">
        <div className="flex justify-between"><span>Amount:</span><span className="font-bold">₦{amountNum}</span></div>
        <div className="flex justify-between"><span>Fee:</span><span className="text-yellow-400">₦30</span></div>
        <div className="flex justify-between pt-2 border-t border-white/10 mt-2">
          <span className="font-bold">Total:</span><span className="font-bold text-primary">₦{amountNum + 30}</span>
        </div>
      </div>

      {ussdResponse && (
        <div className="p-3 bg-blue-500/10 rounded-lg">
          <p className="text-sm font-semibold mb-2">USSD Code:</p>
          <p className="text-lg font-mono text-center bg-black/30 p-2 rounded">{ussdResponse.ussdCode}</p>
          <p className="text-xs text-gray-400 mt-2">Ref: {ussdResponse.reference}</p>
        </div>
      )}

      <button className="w-full btn-primary py-3 rounded-lg" onClick={onPay} disabled={isProcessing}>
        {isProcessing ? 'Generating USSD...' : 'Generate USSD Code'}
      </button>
    </div>
  );
});

export default PaymentUSSDForm;
