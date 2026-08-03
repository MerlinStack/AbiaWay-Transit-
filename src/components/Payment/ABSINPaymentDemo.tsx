import { useState, useEffect, useRef } from 'react';
import { getABSINService } from '../../services/absin';
import useWalletStore from '../../stores/walletStore';
import useNotificationStore from '../../stores/notificationStore';
import { absinPaymentSchema, validateWithSchema } from '../../schemas/paymentSchemas';
import ABSINPaymentSelector from './ABSINPaymentSelector';
import ABSINNFCReader from './ABSINNFCReader';
import ABSINQRScanner from './ABSINQRScanner';
import ABSINManualEntry from './ABSINManualEntry';
import ABSINProcessing from './ABSINProcessing';
import ABSINReceipt from './ABSINReceipt';

interface ABSINPaymentDemoProps {
  onClose: () => void;
  rideDetails?: { from?: string; to?: string; busId?: string; seats?: string[]; passengers?: number; distance?: string; duration?: string };
  amount: number;
  onSuccess?: (result: unknown) => void;
}

const ABSINPaymentDemo = ({ onClose, rideDetails, amount, onSuccess }: ABSINPaymentDemoProps) => {
  const [currentView, setCurrentView] = useState('payment-selection');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [paymentProgress, setPaymentProgress] = useState(0);
  const [paymentStep, setPaymentStep] = useState(1);
  const [paymentResult, setPaymentResult] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [pin, setPin] = useState('');
  const [notification, setNotification] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [absinService, setAbsinService] = useState(null);
  const [activeCard, setActiveCard] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [balanceCheck, setBalanceCheck] = useState(null);

  const balance = useWalletStore((s) => s.balance);
  const deductFunds = useWalletStore((s) => s.deductFunds);
  const addFunds = useWalletStore((s) => s.addFunds);
  const refreshBalance = useWalletStore((s) => s.refreshBalance);
  const showWalletNotification = useNotificationStore((s) => s.showNotification);

  useEffect(() => {
    const initABSIN = async () => {
      try {
        const service = getABSINService();
        const result = await service.initialize();
        if (result.success) {
          setAbsinService(service);
          setIsInitialized(true);
        } else {
          showNotificationMessage('Initialization Error', 'Failed to initialize payment system', 'error');
        }
      } catch (error) {
        showNotificationMessage('Error', 'Payment system unavailable', 'error');
      }
    };
    initABSIN();
  }, []);

  useEffect(() => {
    const checkRealTimeBalance = async () => {
      if (activeCard && absinService) {
        try {
          const b = await absinService.paymentProcessor.checkBalance(activeCard.cardId);
          setBalanceCheck(b);
        } catch (error) {
          console.error('Balance check error:', error);
        }
      }
    };
    const interval = setInterval(checkRealTimeBalance, 5000);
    return () => clearInterval(interval);
  }, [activeCard, absinService]);

  const showNotificationMessage = (title, message, type = 'success') => {
    setNotification({ title, message, type });
    showWalletNotification(title, message);
    setTimeout(() => setNotification(null), 3000);
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value.replace(/\s/g, '').slice(0, 16));
    setCardNumber(formatted);
  };

  const startNFC = async () => {
    if (!absinService) {
      showNotificationMessage('Error', 'Payment service not available', 'error');
      return;
    }
    setCurrentView('nfc-reading');
    setPaymentProgress(0);

    try {
      if ('NDEFReader' in window) {
        const nfc = new (window as any).NDEFReader();
        await nfc.scan();
        nfc.addEventListener('reading', (event) => {
          const decoder = new TextDecoder();
          let cardData = '';
          for (const record of event.message.records) {
            if (record.recordType === 'text') {
              cardData += decoder.decode(record.data);
            }
          }
          const parts = cardData.split('|');
          if (parts[0]?.startsWith('ABN')) {
            processCardPayment({ cardId: parts[1], cardholder: parts[2], timestamp: parts[3] });
          }
        });
        nfc.addEventListener('readingerror', () => {
          showNotificationMessage('NFC Error', 'Failed to read card. Please try again.', 'error');
          cancelPayment();
        });
      } else {
        showNotificationMessage('NFC Unavailable', 'NFC reader not detected. Please use manual card entry.', 'error');
        cancelPayment();
      }
    } catch (error) {
      showNotificationMessage('NFC Error', 'Please ensure NFC is enabled', 'error');
      cancelPayment();
    }
  };

  const startQR = async () => {
    if (!absinService) {
      showNotificationMessage('Error', 'Payment service not available', 'error');
      return;
    }
    setCurrentView('qr-scanning');
    setPaymentProgress(0);

    try {
      if (navigator.mediaDevices && 'getUserMedia' in navigator.mediaDevices) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        let progress = 0;
        const interval = setInterval(() => {
          progress += 20;
          setPaymentProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            stream.getTracks().forEach((track) => track.stop());
            processCardPayment({ cardId: '1234567890123456', cardholder: 'Abuoma David', method: 'qr' });
          }
        }, 400);
      } else {
        showNotificationMessage('Camera Unavailable', 'Camera not detected. Please use manual card entry.', 'error');
        cancelPayment();
      }
    } catch (error) {
      showNotificationMessage('Camera Unavailable', 'Unable to access camera. Please use manual card entry.', 'error');
      cancelPayment();
    }
  };

  const processCardPayment = async (cardData) => {
    if (!absinService) {
      showNotificationMessage('Error', 'Payment service unavailable', 'error');
      return;
    }

    setIsProcessing(true);
    setCurrentView('processing');
    setPaymentStep(1);
    setPaymentProgress(0);

    try {
      setPaymentStep(1);
      setPaymentProgress(33);
      const validation = await absinService.paymentProcessor.validateCard({
        cardId: cardData.cardId,
        timestamp: new Date().toISOString(),
      });
      if (!validation.success) throw new Error(validation.message || 'Invalid card');
      setActiveCard(validation.data);

      setPaymentStep(2);
      setPaymentProgress(66);
      const balanceData = await absinService.paymentProcessor.checkBalance(cardData.cardId);
      if (balanceData.balance < amount) throw new Error(`Insufficient balance. Available: ₦${balanceData.balance}`);

      setPaymentStep(3);
      setPaymentProgress(80);
      const payment = await absinService.paymentProcessor.initiatePayment(cardData.cardId, amount, rideDetails);

      setPaymentProgress(90);
      const confirmed = await absinService.paymentProcessor.confirmPayment(payment.transactionId);
      if (!confirmed.success) throw new Error(confirmed.message || 'Payment confirmation failed');

      setPaymentProgress(100);
      if (selectedMethod === 'wallet') {
        deductFunds(amount, `ABSIN: ${rideDetails.from} → ${rideDetails.to}`);
      } else {
        await refreshBalance?.();
      }

      setPaymentResult({
        success: true,
        transactionId: payment.transactionId,
        cardNumber: cardData.cardId,
        cardholder: validation.data.cardholder?.name || 'ABSIN Cardholder',
        balanceAfter: balanceData.balance - amount,
        pointsEarned: Math.floor(amount / 10),
        receipt: payment.receipt,
        authorizationCode: payment.authorizationCode,
        timestamp: new Date().toISOString(),
      });

      setTimeout(() => {
        setCurrentView('receipt');
        showNotificationMessage('Success!', `Payment of ₦${amount} completed successfully`, 'success');
        onSuccess?.(payment);
      }, 500);
    } catch (error) {
      showNotificationMessage('Payment Failed', error.message, 'error');
      setTimeout(() => cancelPayment(), 1500);
    } finally {
      setIsProcessing(false);
    }
  };

  const processManualPayment = async () => {
    const cleanedCardNumber = cardNumber.replace(/\s/g, '');
    const validation = validateWithSchema(absinPaymentSchema, { amount, cardNumber: cleanedCardNumber, pin });
    if (validation.error) {
      showNotificationMessage('Error', validation.error.message, 'error');
      return;
    }
    await processCardPayment({ cardId: cleanedCardNumber, pin });
  };

  const processWalletPayment = async () => {
    if (balance < amount) {
      showNotificationMessage('Insufficient Balance', `Need ₦${amount}, Available ₦${balance}`, 'error');
      return;
    }

    setIsProcessing(true);
    setCurrentView('processing');
    setPaymentProgress(0);
    setPaymentStep(1);

    try {
      setPaymentStep(1);
      setPaymentProgress(33);

      setTimeout(() => {
        setPaymentStep(2);
        setPaymentProgress(66);

        setTimeout(() => {
          setPaymentStep(3);
          setPaymentProgress(90);

          setTimeout(() => {
            deductFunds(amount, `Bus Booking: ${rideDetails.from} → ${rideDetails.to}`);
            setPaymentProgress(100);
            setPaymentResult({
              success: true,
              transactionId: 'WLT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 8),
              cardNumber: 'WALLET',
              cardholder: 'Wallet Balance',
              balanceAfter: balance - amount,
              pointsEarned: Math.floor(amount / 10),
            });

            setTimeout(() => {
              setCurrentView('receipt');
              showNotificationMessage('Success!', 'Payment completed with Wallet balance', 'success');
              onSuccess?.({ transactionId: 'WLT-' + Date.now(), method: 'wallet', amount });
            }, 500);
          }, 600);
        }, 600);
      }, 600);
    } catch (error) {
      showNotificationMessage('Payment Failed', error.message, 'error');
      setTimeout(() => cancelPayment(), 1500);
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelPayment = () => {
    setCurrentView('payment-selection');
    setSelectedMethod(null);
    setPaymentStep(1);
    setPaymentProgress(0);
    setPaymentResult(null);
    setCardNumber('');
    setPin('');
    setActiveCard(null);
    setIsProcessing(false);
  };

  const handlePrintReceipt = () => {
    const receiptContent = document.getElementById('receipt-content');
    if (receiptContent) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head><title>Abia Way - Payment Receipt</title>
            <style>
              body { font-family: 'Inter', sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 30px; }
              .receipt { border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
              .line { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #eee; }
              .total { font-size: 20px; font-weight: bold; color: #16a34a; margin-top: 16px; padding-top: 16px; border-top: 2px solid #16a34a; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="header"><h2>Abia Way Transit System</h2><p>Official Payment Receipt</p></div>
            <div class="receipt">${receiptContent.innerHTML}</div>
            <div class="footer"><p>Thank you for riding with Abia Way!</p><p>This is a computer-generated receipt. No signature required.</p></div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {notification && (
          <div className="fixed bottom-5 left-5 right-5 max-w-md mx-auto z-50">
            <div className={`p-4 rounded-xl text-white ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}>
              <strong>{notification.title}</strong><br/>{notification.message}
            </div>
          </div>
        )}

        {currentView === 'payment-selection' && (
          <ABSINPaymentSelector
            amount={amount} walletBalance={balance} balanceCheck={balanceCheck}
            selectedMethod={selectedMethod}
            onSelectMethod={setSelectedMethod}
            onStartNFC={startNFC} onStartQR={startQR}
            onManualEntry={() => setCurrentView('manual-entry')}
            onPayWithWallet={processWalletPayment}
          />
        )}
        {currentView === 'nfc-reading' && (
          <ABSINNFCReader progress={paymentProgress} onCancel={cancelPayment} />
        )}
        {currentView === 'qr-scanning' && (
          <ABSINQRScanner progress={paymentProgress} onCancel={cancelPayment} />
        )}
        {currentView === 'manual-entry' && (
          <ABSINManualEntry
            cardNumber={cardNumber} pin={pin} amount={amount}
            isProcessing={isProcessing} onCardNumberChange={handleCardNumberChange}
            onPinChange={(e) => setPin(e.target.value.slice(0, 6))}
            onPay={processManualPayment} onCancel={cancelPayment}
          />
        )}
        {currentView === 'processing' && (
          <ABSINProcessing progress={paymentProgress} step={paymentStep} />
        )}
        {currentView === 'receipt' && paymentResult && (
          <ABSINReceipt
            receipt={paymentResult} amount={amount} rideDetails={rideDetails}
            onPrint={handlePrintReceipt} onDone={onClose}
          />
        )}
      </div>
    </div>
  );
};

export default ABSINPaymentDemo;
