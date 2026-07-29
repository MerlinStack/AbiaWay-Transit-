import { memo } from 'react';

interface ABSINPaymentSelectorProps {
  amount: number;
  walletBalance: number;
  balanceCheck: { balance: number } | null;
  selectedMethod: string | null;
  onSelectMethod: (method: string) => void;
  onStartNFC: () => void;
  onStartQR: () => void;
  onManualEntry: () => void;
  onPayWithWallet: () => void;
}

const ABSINPaymentSelector = memo(({
  amount, walletBalance, balanceCheck, selectedMethod,
  onSelectMethod, onStartNFC, onStartQR, onManualEntry, onPayWithWallet,
}: ABSINPaymentSelectorProps) => (
  <div className="glass-card p-6">
    <div className="flex justify-between items-center mb-5">
      <h2 className="text-xl font-bold">Payment Method</h2>
      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
        Amount: ₦{amount?.toLocaleString()}
      </span>
    </div>

    {balanceCheck && (
      <div className="mb-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Active Card Balance:</span>
          <span className="text-blue-400 font-mono">₦{balanceCheck.balance?.toLocaleString()}</span>
        </div>
      </div>
    )}

    <div
      className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all mb-3 ${
        selectedMethod === 'absin' ? 'bg-purple-500/20 border border-purple-500' : 'bg-white/5 border border-white/10 hover:border-purple-500'
      }`}
      onClick={() => onSelectMethod('absin')}
    >
      <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-2xl">💳</div>
      <div className="flex-1">
        <div className="font-semibold">ABSIN Card</div>
        <div className="text-xs text-gray-400">Tap or enter your ABSIN card details</div>
      </div>
      <div className="text-gray-400">→</div>
    </div>

    <div
      className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all mb-3 ${
        selectedMethod === 'wallet' ? 'bg-green-500/20 border border-green-500' : 'bg-white/5 border border-white/10 hover:border-green-500'
      }`}
      onClick={() => onSelectMethod('wallet')}
    >
      <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-2xl">💰</div>
      <div className="flex-1">
        <div className="font-semibold">Wallet Balance</div>
        <div className="text-xs text-gray-400">₦{walletBalance?.toLocaleString()} available • 5% cashback</div>
      </div>
      <div className="text-gray-400">→</div>
    </div>

    {selectedMethod === 'absin' && (
      <div className="mt-6">
        <div className="mb-3 text-sm text-gray-400">Choose how to pay:</div>
        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl mb-3 transition" onClick={onStartNFC}>
          Tap ABSIN Card (NFC)
        </button>
        <button className="w-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 py-3 rounded-xl mb-3 transition" onClick={onStartQR}>
          Scan QR Code
        </button>
        <button className="w-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 py-3 rounded-xl transition" onClick={onManualEntry}>
          Enter Card Details
        </button>
      </div>
    )}

    {selectedMethod === 'wallet' && (
      <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl mt-6 transition" onClick={onPayWithWallet}>
        Pay ₦{amount} with Wallet
      </button>
    )}

    <div className="mt-4 p-3 bg-white/5 rounded-lg">
      <div className="font-semibold mb-2 text-xs text-green-400">Real-Time System</div>
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Real-time balance verification</p>
        <p>• Secure card validation</p>
        <p>• Live transaction processing</p>
        <p>• Instant wallet updates</p>
      </div>
    </div>
  </div>
));

export default ABSINPaymentSelector;
