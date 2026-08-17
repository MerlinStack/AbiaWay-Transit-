import { CreditCard, Smartphone, Banknote, ChevronRight, Landmark } from 'lucide-react';
import { useState } from 'react';
import useWalletStore from '../../stores/walletStore';
import useAuthStore from '../../stores/authStore';
import useNotificationStore from '../../stores/notificationStore';
import { CardPaymentService, USSDPaymentService, TransferPaymentService, ABSINPaymentService, PaystackPaymentService } from '../../services/paymentServices';
import { cardPaymentSchema, ussdPaymentSchema, transferPaymentSchema, absinPaymentSchema, validateWithSchema } from '../../schemas/paymentSchemas';
import PaymentCardForm from './PaymentCardForm';
import PaymentUSSDForm from './PaymentUSSDForm';
import PaymentTransferForm from './PaymentTransferForm';
import PaymentABSINForm from './PaymentABSINForm';
import PaymentPaystackForm from './PaymentPaystackForm';

const paymentMethods = [
  { id: 'card', name: 'Card Payment', icon: 'credit-card', description: 'Visa, Mastercard, Verve', color: 'blue', fee: 50, minAmount: 100, maxAmount: 500000 },
  { id: 'ussd', name: 'USSD Payment', icon: 'smartphone', description: 'Quick banking via USSD', color: 'green', fee: 30, minAmount: 100, maxAmount: 200000 },
  { id: 'transfer', name: 'Bank Transfer', icon: 'banknote', description: 'Direct bank transfer', color: 'purple', fee: 0, minAmount: 500, maxAmount: 1000000 },
  { id: 'paystack', name: 'Paystack', icon: 'landmark', description: 'Card, bank & transfer via Paystack', color: 'blue', fee: '1.5% + ₦100', minAmount: 100, maxAmount: 1000000 },
  { id: 'absin', name: 'ABSIN Card', icon: 'credit-card', description: 'Abia State Integrated Network', color: 'orange', fee: 50, minAmount: 50, maxAmount: 1000000 },
];

const banks = [
  { code: 'GTB', name: 'Guaranty Trust Bank', ussdCode: '*737#' },
  { code: 'UBA', name: 'United Bank for Africa', ussdCode: '*919#' },
  { code: 'FBN', name: 'First Bank of Nigeria', ussdCode: '*894#' },
  { code: 'ACCESS', name: 'Access Bank', ussdCode: '*901#' },
  { code: 'ZENITH', name: 'Zenith Bank', ussdCode: '*966#' },
];

const resetAll = () => ({
  amount: '',
  isProcessing: false,
  processingMessage: '',
  cardDetails: { number: '', expiry: '', cvv: '', holder: '' },
  cardBalance: null,
  checkingBalance: false,
  ussdDetails: { bank: '', phone: '' },
  ussdResponse: null,
  transferDetails: null,
  absinCard: { number: '', pin: '' },
});

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PaymentMethodModal = ({ isOpen, onClose, onSuccess }: PaymentMethodModalProps) => {
  const [currentView, setCurrentView] = useState('select');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', holder: '' });
  const [cardBalance, setCardBalance] = useState(null);
  const [checkingBalance, setCheckingBalance] = useState(false);
  const [ussdDetails, setUssdDetails] = useState({ bank: '', phone: '' });
  const [ussdResponse, setUssdResponse] = useState(null);
  const [transferDetails, setTransferDetails] = useState(null);
  const [absinCard, setAbsinCard] = useState({ number: '', pin: '' });

  const balance = useWalletStore((s) => s.balance);
  const addFunds = useWalletStore((s) => s.addFunds);
  const refreshBalance = useWalletStore((s) => s.refreshBalance);
  const showNotification = useNotificationStore((s) => s.showNotification);
  const user = useAuthStore((s) => s.user);

  if (!isOpen) return null;

  const selectPaymentMethod = (methodId) => {
    const r = resetAll();
    setAmount(r.amount);
    setIsProcessing(r.isProcessing);
    setProcessingMessage(r.processingMessage);
    setCardDetails(r.cardDetails);
    setCardBalance(r.cardBalance);
    setCheckingBalance(r.checkingBalance);
    setUssdDetails(r.ussdDetails);
    setUssdResponse(r.ussdResponse);
    setTransferDetails(r.transferDetails);
    setAbsinCard(r.absinCard);
    setCurrentView(methodId);
  };

  const handleCheckCardBalance = async () => {
    const cardNum = cardDetails.number.replace(/\s/g, '');
    if (!cardNum || cardNum.length !== 16) {
      showNotification('Error', 'Please enter a valid 16-digit card number', 'error');
      return;
    }
    setCheckingBalance(true);
    const balanceResult = await CardPaymentService.checkBalance(cardNum);
    if (balanceResult.success) {
      setCardBalance(balanceResult);
      showNotification('Balance Check', `Available: ₦${balanceResult.balance.toLocaleString()}`, 'success');
    } else {
      showNotification('Error', 'Balance check failed', 'error');
    }
    setCheckingBalance(false);
  };

  const handleCardPayment = async () => {
    const amountNum = parseInt(amount);
    const cardNum = cardDetails.number.replace(/\s/g, '');
    const schemaValidation = validateWithSchema(cardPaymentSchema, {
      amount: amountNum, cardNumber: cardNum, expiry: cardDetails.expiry, cvv: cardDetails.cvv, holder: cardDetails.holder,
    });
    if (schemaValidation.error) { showNotification('Error', schemaValidation.error.message, 'error'); return; }

    setIsProcessing(true);
    setProcessingMessage('Validating card...');
    const svcValidation = await CardPaymentService.validateCard(cardDetails);
    if (!svcValidation.success) { showNotification('Error', svcValidation.message || 'Card validation failed', 'error'); setIsProcessing(false); return; }

    setProcessingMessage('Processing payment...');
    const paymentResult = await CardPaymentService.processPayment(cardDetails, amountNum);
    if (paymentResult.success) {
      addFunds(amountNum);
      await refreshBalance();
      showNotification('Payment Successful', `₦${amountNum.toLocaleString()} added to wallet!`, 'success');
      onSuccess?.();
      setTimeout(() => onClose(), 2000);
    } else {
      showNotification('Payment Failed', paymentResult.message || 'Payment failed', 'error');
    }
    setIsProcessing(false);
  };

  const handleUSSDPayment = async () => {
    const amountNum = parseInt(amount);
    const schemaValidation = validateWithSchema(ussdPaymentSchema, { amount: amountNum, bank: ussdDetails.bank, phone: ussdDetails.phone });
    if (schemaValidation.error) { showNotification('Error', schemaValidation.error.message, 'error'); return; }

    setIsProcessing(true);
    setProcessingMessage('Generating USSD code...');
    const ussdResult = await USSDPaymentService.initiatePayment(ussdDetails.bank, ussdDetails.phone, amountNum);
    if (ussdResult.success) {
      setUssdResponse(ussdResult);
      showNotification('USSD Instructions', `Dial ${ussdResult.ussdCode} from ${ussdDetails.phone}`, 'info');
      setProcessingMessage('Waiting for USSD confirmation...');
      setTimeout(async () => {
        const confirmed = await USSDPaymentService.confirmPayment(ussdResult.reference);
        if (confirmed.success) {
          addFunds(amountNum);
          await refreshBalance();
          showNotification('Payment Successful', `₦${amountNum.toLocaleString()} added to wallet!`, 'success');
          onSuccess?.();
          onClose();
        }
      }, 5000);
    } else {
      showNotification('Error', ussdResult.message || 'USSD payment failed', 'error');
      setIsProcessing(false);
    }
  };

  const handleBankTransfer = async () => {
    const amountNum = parseInt(amount);
    const schemaValidation = validateWithSchema(transferPaymentSchema, { amount: amountNum });
    if (schemaValidation.error) { showNotification('Error', schemaValidation.error.message, 'error'); return; }

    setIsProcessing(true);
    setProcessingMessage('Generating transfer details...');
    const transferResult = await TransferPaymentService.generateReference(amountNum);
    if (transferResult.success) {
      setTransferDetails(transferResult);
      showNotification('Transfer Instructions', `Transfer ₦${amountNum.toLocaleString()} to ${transferResult.accountDetails.accountName} (${transferResult.accountDetails.accountNumber})`, 'info');
      setProcessingMessage('Waiting for transfer confirmation...');
      setTimeout(async () => {
        const confirmed = await TransferPaymentService.confirmTransfer(transferResult.reference);
        if (confirmed.success) {
          addFunds(amountNum);
          await refreshBalance();
          showNotification('Payment Successful', `₦${amountNum.toLocaleString()} added to wallet!`, 'success');
          onSuccess?.();
          onClose();
        }
      }, 10000);
    } else {
      showNotification('Error', 'Bank transfer failed', 'error');
      setIsProcessing(false);
    }
  };

  const handleABSINPayment = async () => {
    const amountNum = parseInt(amount);
    const cardNum = absinCard.number.replace(/\s/g, '');
    const schemaValidation = validateWithSchema(absinPaymentSchema, { amount: amountNum, cardNumber: cardNum, pin: absinCard.pin });
    if (schemaValidation.error) { showNotification('Error', schemaValidation.error.message, 'error'); return; }

    setIsProcessing(true);
    setProcessingMessage('Validating ABSIN card...');
    const svcResult = await ABSINPaymentService.validateCard(absinCard.number, absinCard.pin);
    if (!svcResult.success) { showNotification('Error', svcResult.message || 'Card validation failed', 'error'); setIsProcessing(false); return; }

    setProcessingMessage('Processing payment...');
    const paymentResult = await ABSINPaymentService.processPayment(absinCard.number, amountNum);
    if (paymentResult.success) {
      addFunds(amountNum);
      await refreshBalance();
      showNotification('Payment Successful', `₦${amountNum.toLocaleString()} added to wallet!`, 'success');
      showNotification('Points Earned', `You earned ${paymentResult.pointsEarned} loyalty points!`, 'success');
      onSuccess?.();
      setTimeout(() => onClose(), 2000);
    } else {
      showNotification('Payment Failed', paymentResult.message || 'Payment failed', 'error');
    }
    setIsProcessing(false);
  };

  const handlePaystackPayment = async () => {
    const amountNum = parseInt(amount);
    if (!amountNum || amountNum < 100) {
      showNotification('Error', 'Minimum top-up is ₦100', 'error');
      return;
    }

    setIsProcessing(true);
    setProcessingMessage('Opening Paystack...');
    const result = await PaystackPaymentService.charge({
      amount: amountNum,
      email: user?.email,
      onSuccess: async (reference) => {
        addFunds(amountNum);
        await refreshBalance();
        showNotification('Payment Successful', `₦${amountNum.toLocaleString()} added to wallet! (${reference})`, 'success');
        onSuccess?.();
        setIsProcessing(false);
        onClose();
      },
      onClose: () => {
        setIsProcessing(false);
        showNotification('Payment Cancelled', 'Paystack popup was closed', 'info');
      },
    });
    if (result && !result.success) {
      showNotification('Payment Failed', result.message || 'Payment failed', 'error');
      setIsProcessing(false);
    }
  };

  const handleCardDetailChange = (field, value) => {
    setCardDetails((prev) => ({ ...prev, [field]: value }));
  };

  const renderSelectMethod = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold mb-4">Add Funds to Wallet</h3>
      <p className="text-sm text-gray-400 mb-4">
        Current Balance: <span className="text-green-400 font-bold">₦{balance?.toLocaleString() || 0}</span>
      </p>
      <div className="grid gap-3">
        {paymentMethods.map((pm) => (
          <button key={pm.id}
            className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-primary transition-all group"
            onClick={() => selectPaymentMethod(pm.id)}>
            <div className={`w-12 h-12 rounded-full ${pm.color === 'blue' ? 'bg-blue-500/20' : pm.color === 'green' ? 'bg-green-500/20' : pm.color === 'purple' ? 'bg-purple-500/20' : 'bg-yellow-500/20'} flex items-center justify-center`}>
              {(() => { const icons: Record<string, React.JSX.Element> = { 'credit-card': <CreditCard className={`w-6 h-6 ${pm.color === 'blue' ? 'text-blue-400' : pm.color === 'green' ? 'text-green-400' : pm.color === 'purple' ? 'text-purple-400' : 'text-yellow-400'}`} />, smartphone: <Smartphone className={`w-6 h-6 ${pm.color === 'blue' ? 'text-blue-400' : pm.color === 'green' ? 'text-green-400' : pm.color === 'purple' ? 'text-purple-400' : 'text-yellow-400'}`} />, banknote: <Banknote className={`w-6 h-6 ${pm.color === 'blue' ? 'text-blue-400' : pm.color === 'green' ? 'text-green-400' : pm.color === 'purple' ? 'text-purple-400' : 'text-yellow-400'}`} />, landmark: <Landmark className="w-6 h-6 text-blue-400" /> }; return icons[pm.icon] || null; })()}
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold">{pm.name}</p>
              <p className="text-xs text-gray-400">{pm.description}</p>
              <div className="flex gap-3 mt-1 text-xs">
                <span className="text-gray-500">Fee: ₦{pm.fee}</span>
                <span className="text-gray-500">Min: ₦{pm.minAmount}</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        ))}
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-400">{processingMessage || 'Processing your payment...'}</p>
      <p className="text-xs text-gray-500 mt-2">Please don't close this window</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="glass-card p-6">
          {currentView === 'select' && renderSelectMethod()}
          {currentView === 'card' && (
            <PaymentCardForm
              amount={amount} onAmountChange={setAmount}
              cardDetails={cardDetails} onCardDetailChange={handleCardDetailChange}
              cardBalance={cardBalance} checkingBalance={checkingBalance}
              isProcessing={isProcessing} onCheckBalance={handleCheckCardBalance}
              onPay={handleCardPayment} onBack={() => setCurrentView('select')}
            />
          )}
          {currentView === 'ussd' && (
            <PaymentUSSDForm
              amount={amount} onAmountChange={setAmount}
              bank={ussdDetails.bank} phone={ussdDetails.phone}
              onBankChange={(val) => setUssdDetails((p) => ({ ...p, bank: val }))}
              onPhoneChange={(val) => setUssdDetails((p) => ({ ...p, phone: val }))}
              ussdResponse={ussdResponse} isProcessing={isProcessing}
              banks={banks} onPay={handleUSSDPayment}
              onBack={() => setCurrentView('select')}
            />
          )}
          {currentView === 'transfer' && (
            <PaymentTransferForm
              amount={amount} onAmountChange={setAmount}
              transferDetails={transferDetails} isProcessing={isProcessing}
              onPay={handleBankTransfer} onBack={() => setCurrentView('select')}
            />
          )}
          {currentView === 'absin' && (
            <PaymentABSINForm
              amount={amount} onAmountChange={setAmount}
              cardNumber={absinCard.number} pin={absinCard.pin}
              onCardNumberChange={(val) => setAbsinCard((p) => ({ ...p, number: val }))}
              onPinChange={(val) => setAbsinCard((p) => ({ ...p, pin: val }))}
              isProcessing={isProcessing} onPay={handleABSINPayment}
              onBack={() => setCurrentView('select')}
            />
          )}
          {currentView === 'paystack' && (
            <PaymentPaystackForm
              amount={amount} onAmountChange={setAmount}
              isProcessing={isProcessing} onPay={handlePaystackPayment}
              onBack={() => setCurrentView('select')}
            />
          )}
          {currentView === 'processing' && renderProcessing()}
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodModal;
