import { useState, useCallback } from 'react';
import useABSINStore from '../stores/absinStore';
import useNotificationStore from '../stores/notificationStore';

export const useABSINPayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const service = useABSINStore((s) => s.service);
  const readCard = useABSINStore((s) => s.readCard);
  const processPayment = useABSINStore((s) => s.processPayment);
  const clearCard = useABSINStore((s) => s.clearCard);
  const activeCard = useABSINStore((s) => s.activeCard);
  const balance = useABSINStore((s) => s.balance);
  const showNotification = useNotificationStore((s) => s.showNotification);

  const initiatePayment = useCallback(async (amount, rideDetails, onSuccess) => {
    setIsProcessing(true);
    
    try {
      let card: any = activeCard;
      
      if (!card) {
        // Read card if not already active
        card = await readCard('manual'); // Show manual entry modal
      }
      
      if (!card || card.success === false) {
        throw new Error('Failed to read card');
      }
      
      if (balance < amount) {
        throw new Error('Insufficient balance');
      }
      
      const result = await processPayment(amount, rideDetails);
      
      if (result.success) {
        setPaymentResult(result);
        showNotification('Payment Successful', `₦${amount} paid successfully`);
        onSuccess?.(result);
        return result;
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error) {
      showNotification('Payment Failed', error.message);
      return { success: false, error: error.message };
    } finally {
      setIsProcessing(false);
    }
  }, [activeCard, balance, readCard, processPayment, showNotification]);

  const resetPayment = useCallback(() => {
    setPaymentResult(null);
    clearCard();
  }, [clearCard]);

  return {
    isProcessing,
    paymentResult,
    initiatePayment,
    resetPayment,
    activeCard,
    balance
  };
};