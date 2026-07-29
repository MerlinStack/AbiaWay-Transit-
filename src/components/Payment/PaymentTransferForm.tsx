import { memo } from 'react';

interface TransferFormProps {
  amount: string;
  onAmountChange: (val: string) => void;
  transferDetails: { reference: string; expiresAt: string; accountDetails: { bankName: string; accountNumber: string; accountName: string } } | null;
  isProcessing: boolean;
  onPay: () => void;
  onBack: () => void;
}

const PaymentTransferForm = memo(({
  amount, onAmountChange, transferDetails, isProcessing, onPay, onBack,
}: TransferFormProps) => {
  const amountNum = parseInt(amount) || 0;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={onBack} className="text-gray-400 hover:text-white">
          <i data-lucide="arrow-left" className="w-5 h-5"></i>
        </button>
        <h3 className="text-xl font-bold">Bank Transfer</h3>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Amount</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₦</span>
          <input type="number" value={amount} onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0.00" className="w-full bg-white/10 border border-white/20 rounded-lg pl-8 pr-4 py-3" />
        </div>
        <p className="text-xs text-gray-500 mt-1">No Fee • Min: ₦500 • Max: ₦1,000,000</p>
      </div>

      <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
        <p className="text-sm font-semibold mb-3">Account Details:</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Bank:</span><span className="font-mono">Guaranty Trust Bank (GTBank)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Account Name:</span><span>Abia Way Transit System</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Account Number:</span>
            <span className="font-mono text-lg">0123456789</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Sort Code:</span><span>058-123-456</span>
          </div>
        </div>
      </div>

      {transferDetails && (
        <div className="p-3 bg-blue-500/10 rounded-lg">
          <p className="text-sm font-semibold mb-2">Transfer Reference:</p>
          <p className="text-sm font-mono text-center bg-black/30 p-2 rounded">{transferDetails.reference}</p>
          <p className="text-xs text-gray-400 mt-2">Expires: {new Date(transferDetails.expiresAt).toLocaleTimeString()}</p>
        </div>
      )}

      <div className="p-3 bg-yellow-500/10 rounded-lg">
        <div className="flex justify-between">
          <span>Amount to Transfer:</span>
          <span className="font-bold text-primary">₦{amountNum}</span>
        </div>
      </div>

      <button className="w-full btn-primary py-3 rounded-lg" onClick={onPay} disabled={isProcessing}>
        {isProcessing ? 'Generating Reference...' : 'Generate Transfer Reference'}
      </button>
    </div>
  );
});

export default PaymentTransferForm;
