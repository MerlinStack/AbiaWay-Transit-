import React, { memo, useRef } from 'react';
import { Printer, CheckCircle2 } from 'lucide-react';

interface PaymentReceiptProps {
  receipt: {
    transactionId?: string;
    date?: string;
    cardNumber?: string;
    cardholder?: string;
    route?: string;
    busId?: string;
    seats?: string[];
    passengers?: number;
    amount?: number;
    balanceAfter?: number;
    pointsEarned?: number;
  } | null;
  onClose: () => void;
  onPrint?: () => void;
}

const PaymentReceipt = memo(({ receipt, onClose, onPrint }: PaymentReceiptProps) => {
  const receiptRef = useRef(null);

  const handlePrint = () => {
    const printContent = receiptRef.current.innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt - Abia Way</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background: #0f172a;
              color: white;
              padding: 40px 20px;
              min-height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .receipt-container {
              max-width: 500px;
              width: 100%;
              margin: 0 auto;
            }
            .glass-card {
              background: rgba(255, 255, 255, 0.05);
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 24px;
              padding: 24px;
            }
            .receipt {
              background: rgba(255, 255, 255, 0.05);
              border-radius: 16px;
              padding: 20px;
              margin: 20px 0;
            }
            .receipt-line {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
            }
            .receipt-total {
              font-size: 20px;
              font-weight: bold;
              color: #16a34a;
              padding-top: 12px;
              margin-top: 8px;
              border-top: 2px solid #16a34a;
            }
            .text-center { text-align: center; }
            .text-green { color: #22c55e; }
            .text-gray { color: #9ca3af; }
            .font-bold { font-weight: bold; }
            .mt-4 { margin-top: 16px; }
            .mb-4 { margin-bottom: 16px; }
            .mb-2 { margin-bottom: 8px; }
            .btn-print {
              background: rgba(255, 255, 255, 0.1);
              border: 1px solid rgba(255, 255, 255, 0.2);
              color: white;
              padding: 12px 24px;
              border-radius: 12px;
              font-weight: 500;
              cursor: pointer;
              width: 100%;
              margin-top: 16px;
            }
            .btn-print:hover {
              background: rgba(255, 255, 255, 0.2);
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            ${receiptRef.current ? receiptRef.current.outerHTML : ''}
            <button class="btn-print" onclick="window.print(); window.close();">Print Receipt</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  if (!receipt) return null;

  return (
    <div className="space-y-4">
      <div ref={receiptRef}>
        <div className="text-center mb-6">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-3 text-green-500" />
          <h3 className="text-2xl font-bold text-green-400">Payment Successful!</h3>
          <p className="text-gray-400 text-sm">Transaction ID: {receipt.transactionId}</p>
        </div>
        
        <div className="receipt bg-white/5 rounded-xl p-5 mb-6">
          <div className="receipt-line">
            <span className="text-gray-400">Date</span>
            <span>{receipt.date || new Date().toLocaleString()}</span>
          </div>
          <div className="receipt-line">
            <span className="text-gray-400">Card</span>
            <span>****{receipt.cardNumber?.slice(-4) || '3456'}</span>
          </div>
          <div className="receipt-line">
            <span className="text-gray-400">Cardholder</span>
            <span>{receipt.cardholder || 'Abuoma David'}</span>
          </div>
          <div className="receipt-line">
            <span className="text-gray-400">Route</span>
            <span>{receipt.route}</span>
          </div>
          <div className="receipt-line">
            <span className="text-gray-400">Bus</span>
            <span>{receipt.busId}</span>
          </div>
          {receipt.seats && receipt.seats.length > 0 && (
            <div className="receipt-line">
              <span className="text-gray-400">Seats</span>
              <span>{receipt.seats.join(', ')}</span>
            </div>
          )}
          <div className="receipt-line">
            <span className="text-gray-400">Passengers</span>
            <span>{receipt.passengers}</span>
          </div>
          <div className="receipt-line">
            <span className="text-gray-400">Amount</span>
            <span className="text-green-400 font-bold text-xl">₦{receipt.amount?.toLocaleString()}</span>
          </div>
          <div className="receipt-line">
            <span className="text-gray-400">Balance After</span>
            <span>₦{receipt.balanceAfter?.toLocaleString()}</span>
          </div>
          <div className="receipt-line">
            <span className="text-gray-400">Points Earned</span>
            <span className="text-yellow-400">{receipt.pointsEarned || Math.floor(receipt.amount / 10)} pts</span>
          </div>
          <div className="receipt-total mt-4 pt-3 border-t-2 border-green-600">
            <div className="flex justify-between">
              <span className="font-bold">Total Charged</span>
              <span className="font-bold text-green-400">₦{receipt.amount?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex gap-3">
        <button 
          className="btn-secondary flex-1 py-3 rounded-xl flex items-center justify-center gap-2"
          onClick={handlePrint}
        >
          <Printer className="w-4 h-4" />
          Print Receipt
        </button>
        <button 
          className="btn-primary flex-1 py-3 rounded-xl"
          onClick={onClose}
        >
          Done
        </button>
      </div>

      {/* Footer Note */}
      <p className="text-center text-xs text-gray-500 mt-4">
        Thank you for riding with Abia Way Transit System
      </p>
    </div>
  );
});

export default PaymentReceipt;