import { memo } from 'react';
import { ArrowLeft, Landmark } from 'lucide-react';
import { PaystackPaymentService } from '../../services/paymentServices';

interface PaystackFormProps {
  amount: string;
  onAmountChange: (val: string) => void;
  isProcessing: boolean;
  onPay: () => void;
  onBack: () => void;
}

const PaymentPaystackForm = memo(({ amount, onAmountChange, isProcessing, onPay, onBack }: PaystackFormProps) => {
  const amountNum = parseInt(amount) || 0;
  const mockMode = !PaystackPaymentService.isConfigured();
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={onBack} className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Landmark className="w-5 h-5 text-blue-400" />
          Paystack
        </h3>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Amount</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₦</span>
          <input type="number" value={amount} onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0.00" className="w-full bg-white/10 border border-white/20 rounded-lg pl-8 pr-4 py-3" />
        </div>
        <p className="text-xs text-gray-500 mt-1">Fee: 1.5% + ₦100 • Min: ₦100 • Max: ₦1,000,000</p>
      </div>

      <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
        <div className="flex justify-between">
          <span>Amount to Pay:</span>
          <span className="font-bold text-blue-400">₦{amountNum.toLocaleString()}</span>
        </div>
      </div>

      {mockMode && (
        <div className="p-3 bg-yellow-500/10 rounded-lg">
          <p className="text-xs text-yellow-400">
            Demo mode: no Paystack public key configured (set VITE_PAYSTACK_PUBLIC_KEY to go live). Payment will be simulated.
          </p>
        </div>
      )}

      <button className="w-full btn-primary py-3 rounded-lg" onClick={onPay} disabled={isProcessing || !amountNum}>
        {isProcessing ? 'Opening Paystack...' : `Pay ₦${amountNum.toLocaleString()} with Paystack`}
      </button>
    </div>
  );
});

export default PaymentPaystackForm;