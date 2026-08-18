import React, { useState } from 'react';
import useWalletStore from '../../stores/walletStore';
import useNotificationStore from '../../stores/notificationStore';
import { topupSchema, validateWithSchema } from '../../schemas/paymentSchemas';
import { X, Gift, CreditCard } from 'lucide-react';

interface QuickTopupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickTopupModal = ({ isOpen, onClose }: QuickTopupModalProps) => {
  const [selectedAmount, setSelectedAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const balance = useWalletStore((s) => s.balance);
  const addFunds = useWalletStore((s) => s.addFunds);
  const showNotification = useNotificationStore((s) => s.showNotification);

  if (!isOpen) return null;

  const suggestedAmounts = [1000, 2000, 5000, 10000, 20000];
  const fee = 50;

  const getTotalAmount = () => {
    const amount = customAmount ? parseInt(customAmount) : selectedAmount;
    return amount + fee;
  };

  const getBonusMessage = () => {
    const amount = customAmount ? parseInt(customAmount) : selectedAmount;
    if (amount >= 10000) {
      const bonus = Math.floor(amount * 0.05);
      return `+${bonus.toLocaleString()} bonus points!`;
    }
    return null;
  };

  const handleTopup = () => {
    const amount = customAmount ? parseInt(customAmount) : selectedAmount;
    
    const validation = validateWithSchema(topupSchema, { amount });
    if (validation.error) {
      showNotification('Error', validation.error.message, 'error');
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      addFunds(amount);
      showNotification(
        'Top-up Successful!', 
        `₦${amount.toLocaleString()} added to your wallet! ${getBonusMessage() || ''}`,
        'success'
      );
      setIsProcessing(false);
      onClose();
      setCustomAmount('');
    }, 1500);
  };

  const handleSelectAmount = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  return (
    <div className="fixed inset-0 z-[9999] animate-fadeIn">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4 animate-slideUp">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white">Quick Top-up</h3>
              <p className="text-sm text-gray-400 mt-1">Add funds to your wallet</p>
            </div>
            <button 
              onClick={onClose} 
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          
          {/* Current Balance */}
          <div className="mb-6 p-4 bg-green-500/10 rounded-xl border border-green-500/30">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Current Balance</span>
              <span className="text-2xl font-bold text-green-400">₦{balance.toLocaleString()}</span>
            </div>
          </div>
          
          {/* Suggested Amounts */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Quick Select
            </label>
            <div className="grid grid-cols-5 gap-2">
              {suggestedAmounts.map(amount => (
                <button
                  key={amount}
                  onClick={() => handleSelectAmount(amount)}
                  className={`p-2 rounded-xl text-center transition-all duration-200 ${
                    selectedAmount === amount && !customAmount
                      ? 'bg-green-600 text-white scale-105 shadow-lg' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <span className="block font-semibold">₦{amount.toLocaleString()}</span>
                  <span className="text-xs opacity-80">+₦{fee}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Custom Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">₦</span>
              <input 
                type="number" 
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                placeholder="Enter amount"
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition"
              />
            </div>
          </div>
          
          {/* Bonus Message */}
          {getBonusMessage() && (
            <div className="mb-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30 animate-pulse">
              <p className="text-yellow-400 text-sm flex items-center gap-2">
                <Gift className="w-4 h-4" />
                {getBonusMessage()}
              </p>
            </div>
          )}
          
          {/* Summary */}
          <div className="mb-6 p-4 bg-white/5 rounded-xl">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Amount to add:</span>
              <span className="font-semibold text-white">
                ₦{(customAmount ? parseInt(customAmount) : selectedAmount).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Processing fee:</span>
              <span className="text-yellow-400">₦{fee}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10 mt-2">
              <span>Total to pay:</span>
              <span className="text-green-400">₦{getTotalAmount().toLocaleString()}</span>
            </div>
          </div>
          
          {/* Submit Button */}
          <button 
            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            onClick={handleTopup}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Add Funds
              </>
            )}
          </button>
          
          {/* Info */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Minimum top-up: ₦50 | Fee: ₦{fee} per transaction
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickTopupModal;