import { memo } from 'react';

interface ReceiptData {
  transactionId: string;
  cardholder: string;
  cardNumber: string;
  balanceAfter: number;
  pointsEarned: number;
  authorizationCode?: string;
}

interface ABSINReceiptProps {
  receipt: ReceiptData;
  amount: number;
  rideDetails: { from?: string; to?: string; busId?: string; seats?: string[]; passengers?: number };
  onPrint: () => void;
  onDone: () => void;
}

const ABSINReceipt = memo(({ receipt, amount, rideDetails, onPrint, onDone }: ABSINReceiptProps) => (
  <div className="glass-card p-6">
    <div className="text-center mb-6">
      <div className="text-6xl mb-3">✅</div>
      <h3 className="text-2xl font-bold text-green-400">Payment Successful!</h3>
      <p className="text-gray-400 text-sm">Transaction ID: {receipt.transactionId}</p>
    </div>

    <div id="receipt-content" className="bg-white/5 rounded-xl p-5 mb-6">
      <div className="flex justify-between py-2 border-b border-white/10">
        <span className="text-gray-400">Date</span>
        <span>{new Date().toLocaleString()}</span>
      </div>
      <div className="flex justify-between py-2 border-b border-white/10">
        <span className="text-gray-400">Transaction ID</span>
        <span className="font-mono text-xs">{receipt.transactionId}</span>
      </div>
      <div className="flex justify-between py-2 border-b border-white/10">
        <span className="text-gray-400">Payment Method</span>
        <span>{receipt.cardNumber === 'WALLET' ? 'Wallet Balance' : 'ABSIN Card'}</span>
      </div>
      <div className="flex justify-between py-2 border-b border-white/10">
        <span className="text-gray-400">Card/Cardholder</span>
        <span>{receipt.cardholder}</span>
      </div>
      <div className="flex justify-between py-2 border-b border-white/10">
        <span className="text-gray-400">Route</span>
        <span>{rideDetails?.from} → {rideDetails?.to}</span>
      </div>
      <div className="flex justify-between py-2 border-b border-white/10">
        <span className="text-gray-400">Bus & Seats</span>
        <span>{rideDetails?.busId} | {rideDetails?.seats?.join(', ') || 'Auto-assigned'}</span>
      </div>
      <div className="flex justify-between py-2 border-b border-white/10">
        <span className="text-gray-400">Passengers</span>
        <span>{rideDetails?.passengers}</span>
      </div>
      <div className="flex justify-between py-3 border-t-2 border-green-600 mt-2">
        <span className="font-bold">Total Amount</span>
        <span className="font-bold text-green-400 text-xl">₦{amount?.toLocaleString()}</span>
      </div>
      <div className="flex justify-between py-2">
        <span className="text-gray-400">Balance After</span>
        <span>₦{receipt.balanceAfter?.toLocaleString()}</span>
      </div>
      <div className="flex justify-between py-2">
        <span className="text-gray-400">Points Earned</span>
        <span className="text-yellow-400">{receipt.pointsEarned} pts</span>
      </div>
      {receipt.authorizationCode && (
        <div className="flex justify-between py-2">
          <span className="text-gray-400">Auth Code</span>
          <span className="font-mono text-xs">{receipt.authorizationCode}</span>
        </div>
      )}
    </div>

    <div className="flex gap-3">
      <button className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl transition" onClick={onPrint}>
        Print Receipt
      </button>
      <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl transition" onClick={onDone}>
        Done
      </button>
    </div>
  </div>
));

export default ABSINReceipt;
