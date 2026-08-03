import { Wallet, CreditCard, Banknote, QrCode, Check, Shield } from 'lucide-react';
import React from 'react';
import useWalletStore from '../../stores/walletStore';
import { getPaymentColorClasses } from '../../utils/colorMap';

const PaymentMethod = ({ selected, onSelect }) => {
  const balance = useWalletStore((s) => s.balance);

  const paymentMethods = [
    { id: 'wallet', name: 'Wallet Balance', icon: 'wallet', description: `Available balance: N${balance.toLocaleString()}`, badge: '5% cashback', color: 'green' },
    { id: 'card', name: 'Credit/Debit Card', icon: 'credit-card', description: 'Visa, Mastercard, Verve', badge: 'Secure', color: 'blue' },
    { id: 'transfer', name: 'Bank Transfer', icon: 'banknote', description: 'Direct bank transfer', badge: 'No fees', color: 'purple' },
    { id: 'qr', name: 'QR Code', icon: 'qr-code', description: 'Scan at terminal', badge: 'Instant', color: 'yellow' }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Payment Method</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentMethods.map(method => {
          const pc = getPaymentColorClasses(method.color);
          return (
          <div
            key={method.id}
            className={`payment-method p-4 border-2 rounded-xl cursor-pointer transition-all hover:scale-[1.02] ${
              selected === method.id ? `${pc.border} ${pc.bg}` : 'border-white/10 hover:border-white/20'
            }`}
            onClick={() => onSelect(method.id)}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full ${pc.bg} flex items-center justify-center`}>
                {(() => { const icons: Record<string, React.JSX.Element> = { wallet: <Wallet className={`w-5 h-5 ${pc.text}`} />, 'credit-card': <CreditCard className={`w-5 h-5 ${pc.text}`} />, banknote: <Banknote className={`w-5 h-5 ${pc.text}`} />, 'qr-code': <QrCode className={`w-5 h-5 ${pc.text}`} /> }; return icons[method.icon] || null; })()}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{method.name}</h4>
                    <p className="text-xs text-gray-400 mt-1">{method.description}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 ${pc.bg} ${pc.text} rounded-full`}>
                    {method.badge}
                  </span>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 ${
                selected === method.id ? `${pc.border} ${pc.solid}` : 'border-white/20'
              }`}>
                {selected === method.id && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </div>
            </div>
          </div>
          );
        })}
      </div>
      <div className="mt-6 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg flex items-center gap-3">
        <Shield className="w-8 h-8 text-green-400" />
        <div>
          <p className="font-semibold">Secure Payment</p>
          <p className="text-xs text-gray-400">Your payment information is encrypted and secure</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;
