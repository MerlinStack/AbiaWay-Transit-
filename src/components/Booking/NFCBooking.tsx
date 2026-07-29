import React, { useState } from 'react';
import useWalletStore from '../../stores/walletStore';
import useNotificationStore from '../../stores/notificationStore';

const NFCPayment = ({ selectedRoute, onSuccess }) => {
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const balance = useWalletStore((s) => s.balance);
  const deductFunds = useWalletStore((s) => s.deductFunds);
  const showNotification = useNotificationStore((s) => s.showNotification);

  const handleTap = () => {
    if (!selectedRoute) {
      showNotification('Error', 'Please select a route first');
      return;
    }

    if (balance < selectedRoute.fare) {
      showNotification('Insufficient Balance', 'Please top up your card to continue');
      return;
    }

    setIsActive(true);
    setIsProcessing(true);

    // Simulate NFC haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }

    setTimeout(() => {
      const success = deductFunds(selectedRoute.fare, `Green Shuttle - ${selectedRoute.name}`);
      
      if (success) {
        showNotification('Tap Successful', `Welcome aboard! ₦${selectedRoute.fare} paid`);
        onSuccess?.();
        
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
      }

      setIsActive(false);
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="mb-6">
      <h4 className="text-lg font-semibold mb-4 flex items-center">
        <i data-lucide="smartphone" className="w-5 h-5 mr-2"></i>
        NFC Tap to Pay
        <span className="ml-auto text-xs text-green-400 flex items-center">
          <i data-lucide="check-circle" className="w-3 h-3 mr-1"></i>Haptic Ready
        </span>
      </h4>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className={`nfc-reader p-8 text-center ${isActive ? 'active' : ''}`}>
          <div className="w-20 h-20 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
            {isProcessing ? (
              <i data-lucide="check" className="w-10 h-10"></i>
            ) : (
              <i data-lucide="smartphone" className="w-10 h-10"></i>
            )}
          </div>
          <p className="text-lg font-medium mb-2">
            {isProcessing ? 'Processing...' : 'Ready to Tap'}
          </p>
          <p className="text-sm text-gray-400">
            Tap card on reader to pay for selected route
          </p>
          <button
            className="btn-primary mt-4 px-6 py-2 rounded-lg"
            onClick={handleTap}
            disabled={!selectedRoute || isProcessing}
          >
            {!selectedRoute ? 'Select Route First' : 'Tap Card on Reader'}
          </button>
        </div>
        
        <div>
          <h5 className="font-semibold mb-4">Payment Details</h5>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-700">
              <span className="text-gray-400">Route Fare</span>
              <span className="font-medium">
                ₦{selectedRoute?.fare?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-700">
              <span className="text-gray-400">Top-up Fee</span>
              <span className="font-medium">₦50</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-400">Current Balance</span>
              <span className="font-bold text-green-400">
                ₦{balance.toLocaleString()}
              </span>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-green-500/10 rounded-lg">
            <p className="text-sm text-green-300">
              <i data-lucide="info" className="w-4 h-4 inline mr-2"></i>
              First card is FREE. Minimum top-up: ₦50. Card never expires.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFCPayment;