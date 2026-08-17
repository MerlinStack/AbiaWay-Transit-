import React, { memo, useCallback, useMemo, useState, useEffect } from 'react';
import { Wallet, Plus, X, CreditCard, PlusCircle, Unlink, Smartphone, Banknote, QrCode, Bus, CheckCircle, History, Inbox, ArrowDownLeft, ArrowUpRight, Download, TrendingUp, BarChart3, TrendingDown, Shield } from 'lucide-react';
import useWalletStore from '../../stores/walletStore';
import { getABSINService } from '../../services/absin';
import useNotificationStore from '../../stores/notificationStore';
import CreditCardDisplay from './CreditCard';
import PaymentMethodModal from '../Payment/PaymentMethodModal';
import { linkCardSchema, validateWithSchema } from '../../schemas/paymentSchemas';

interface WalletTabProps {
  onOpenModal: (modal: string) => void;
}

const WalletTab = memo(({ onOpenModal }: WalletTabProps) => {
  const balance = useWalletStore((s) => s.balance);
  const transactions = useWalletStore((s) => s.transactions);
  const addFunds = useWalletStore((s) => s.addFunds);
  const deductFunds = useWalletStore((s) => s.deductFunds);
  const refreshBalance = useWalletStore((s) => s.refreshBalance);
  const [topupAmount, setTopupAmount] = useState('');
  const [linkedCard, setLinkedCard] = useState(null);
  const [isLinkingCard, setIsLinkingCard] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardPin, setCardPin] = useState('');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [cardPoints, setCardPoints] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const showNotification = useNotificationStore((s) => s.showNotification);

  // Check if this is a first-time user (no transactions)
  const isFirstTimeUser = transactions.length === 0 && balance === 0;

  // Suggested amounts (user can still enter custom)
  const suggestedAmounts = [1000, 2000, 5000, 10000, 20000];
  const fee = 50;

  // Check for saved linked card on mount
  useEffect(() => {
    const savedCard = localStorage.getItem('linkedABSINCard');
    if (savedCard) {
      try {
        const card = JSON.parse(savedCard);
        setLinkedCard(card);
        fetchCardPoints(card.cardId);
      } catch (e) {
        console.error('Failed to load saved card');
      }
    }
  }, []);

  const fetchCardPoints = async (cardId) => {
    try {
      const service = getABSINService();
      await service.initialize();
      const pointsData = await service.getCardPoints(cardId);
      if (pointsData) {
        setCardPoints(pointsData);
      }
    } catch (error) {
      console.error('Failed to fetch card points:', error);
    }
  };

  const handleLinkCard = async () => {
    const cleanedCardNumber = cardNumber.replace(/\s/g, '');
    const validation = validateWithSchema(linkCardSchema, { cardNumber: cleanedCardNumber, pin: cardPin });
    if (validation.error) {
      showNotification('Error', validation.error.message, 'error');
      return;
    }

    setIsLinkingCard(true);

    try {
      const service = getABSINService();
      await service.initialize();

      const validation = await service.paymentProcessor.validateCard({
        cardId: cleanedCardNumber,
        pin: cardPin,
        timestamp: new Date().toISOString()
      });

      if (validation.success) {
        const cardToSave = {
          cardId: `****${cleanedCardNumber.slice(-4)}`,
          fullCardId: cleanedCardNumber,
          cardholder: validation.data.cardholder?.name || 'ABSIN Cardholder',
          tier: validation.data.tier || 'Standard',
          linkedAt: new Date().toISOString(),
          lastFour: cleanedCardNumber.slice(-4),
          points: validation.data.points || 0,
          nextTier: validation.data.nextTier || 600
        };

        setLinkedCard(cardToSave);
        setCardPoints({
          total: cardToSave.points,
          nextTier: cardToSave.nextTier,
          tier: cardToSave.tier
        });
        
        const { fullCardId: _removed, ...cardToPersist } = cardToSave;
        localStorage.setItem('linkedABSINCard', JSON.stringify(cardToPersist));
        showNotification('Success', 'ABSIN card linked successfully!', 'success');
        setShowLinkModal(false);
        setCardNumber('');
        setCardPin('');
      } else {
        showNotification('Error', validation.message || 'Invalid card details', 'error');
      }
    } catch (error) {
      console.error('Card linking error:', error);
      showNotification('Error', 'Failed to link card. Please try again.', 'error');
    } finally {
      setIsLinkingCard(false);
    }
  };

  const handleUnlinkCard = () => {
    if (window.confirm('Are you sure you want to unlink this ABSIN card?')) {
      setLinkedCard(null);
      setCardPoints(null);
      localStorage.removeItem('linkedABSINCard');
      showNotification('Card Unlinked', 'Your ABSIN card has been unlinked', 'info');
    }
  };

  const handlePaymentSuccess = () => {
    // Refresh balance after successful payment
    refreshBalance();
    showNotification('Success', 'Wallet funded successfully!', 'success');
    setShowPaymentModal(false);
  };

  // Calculate bonus if amount >= 10000
  const getBonusMessage = () => {
    const amount = parseInt(topupAmount);
    if (amount >= 10000) {
      const bonus = Math.floor(amount * 0.05);
      return `+ ${bonus.toLocaleString()} bonus points!`;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Wallet Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold flex items-center gap-3">
          <Wallet className="w-6 h-6 text-green-400" />
          Your Wallet
        </h3>
        <button 
          className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2" 
          onClick={() => setShowPaymentModal(true)}
        >
          <Plus className="w-5 h-5" />
          <span>Add Funds</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Credit Card and Top-up */}
        <div className="lg:col-span-2 space-y-6">
          {/* Welcome Banner for First-Time Users */}
          {isFirstTimeUser && showWelcomeBanner && (
            <div className="glass-card p-6 bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-semibold mb-2">👋 Welcome to Abia Way!</h4>
                  <p className="text-sm text-gray-300 mb-3">
                    Your wallet is empty. Choose a payment method to add funds.
                  </p>
                  <button 
                    className="btn-primary px-4 py-2 text-sm"
                    onClick={() => setShowPaymentModal(true)}
                  >
                    Add Funds Now
                  </button>
                </div>
                <button 
                  className="text-gray-400 hover:text-white"
                  onClick={() => setShowWelcomeBanner(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Credit Card Display with Zero Balance State */}
          <CreditCardDisplay balance={balance} />

          {/* ABSIN Card Section */}
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="text-purple-400" />
                Linked ABSIN Card
              </h4>
              {!linkedCard ? (
                <button 
                  className="text-sm text-purple-400 hover:text-purple-300 transition flex items-center gap-1"
                  onClick={() => setShowLinkModal(true)}
                >
                  <PlusCircle className="w-4 h-4" />
                  Link Card
                </button>
              ) : (
                <button 
                  className="text-sm text-red-400 hover:text-red-300 transition flex items-center gap-1"
                  onClick={handleUnlinkCard}
                >
                  <Unlink className="w-4 h-4" />
                  Unlink
                </button>
              )}
            </div>

            {linkedCard ? (
              <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-5 relative overflow-hidden mb-4">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <p className="text-xs text-purple-200 mb-1">ABIA STATE Government Issue</p>
                  <p className="text-xl font-mono tracking-wider mb-3">{linkedCard.cardId}</p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-purple-200">Cardholder</p>
                      <p className="font-semibold">{linkedCard.cardholder}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-purple-200">Tier</p>
                      <p className="font-semibold">{linkedCard.tier}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                className="bg-purple-500/10 border-2 border-dashed border-purple-500/50 rounded-2xl p-6 text-center cursor-pointer hover:bg-purple-500/20 transition-all"
                onClick={() => setShowLinkModal(true)}
              >
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="w-8 h-8 text-purple-400" />
                </div>
                <p className="font-semibold text-purple-400 mb-1">No ABSIN Card Linked</p>
                <p className="text-xs text-gray-400">Link your ABSIN card to earn points and enjoy benefits</p>
                <button className="mt-3 text-sm text-purple-400 hover:text-purple-300 transition">
                  + Link Card
                </button>
              </div>
            )}

            {cardPoints && (
              <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Points Balance</span>
                  <span className="text-xl font-bold text-yellow-400">{cardPoints.total} pts</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(cardPoints.total / cardPoints.nextTier) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400">
                  {cardPoints.nextTier - cardPoints.total} points to {cardPoints.tier} tier
                </p>
              </div>
            )}
          </div>

          {/* Payment Methods Section */}
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Payment Methods</h4>
              <span className="text-xs text-gray-400">Choose how to add funds</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <button
                onClick={() => setShowPaymentModal(true)}
                className="p-4 bg-white/5 border border-white/10 rounded-xl text-center hover:border-blue-500 transition"
              >
                <CreditCard className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <p className="text-sm font-medium">Card</p>
                <p className="text-xs text-gray-500">Visa/Mastercard</p>
              </button>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="p-4 bg-white/5 border border-white/10 rounded-xl text-center hover:border-green-500 transition"
              >
                <Smartphone className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <p className="text-sm font-medium">USSD</p>
                <p className="text-xs text-gray-500">Quick banking</p>
              </button>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="p-4 bg-white/5 border border-white/10 rounded-xl text-center hover:border-purple-500 transition"
              >
                <Banknote className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                <p className="text-sm font-medium">Transfer</p>
                <p className="text-xs text-gray-500">Bank transfer</p>
              </button>
              <button
                onClick={() => setShowLinkModal(true)}
                className="p-4 bg-white/5 border border-white/10 rounded-xl text-center hover:border-orange-500 transition"
              >
                <CreditCard className="w-8 h-8 mx-auto mb-2 text-orange-400" />
                <p className="text-sm font-medium">ABSIN</p>
                <p className="text-xs text-gray-500">State card</p>
              </button>
            </div>

            <div className="p-3 bg-yellow-500/10 rounded-lg text-xs">
              <p className="text-yellow-400">💡 Payment Options:</p>
              <ul className="text-gray-400 mt-1 space-y-1">
                <li>• Card: Visa, Mastercard, Verve (Fee: ₦50)</li>
                <li>• USSD: Quick banking via phone (Fee: ₦30)</li>
                <li>• Transfer: Bank transfer (Fee: ₦0)</li>
                <li>• ABSIN Card: State card (Fee: ₦50)</li>
              </ul>
            </div>
          </div>

          {/* QR Code Payment Section */}
          <div className="glass-card p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <QrCode className="text-primary" />
              QR Code Payment
            </h3>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="qr-code bg-white p-4 rounded-xl">
                <div className="w-32 h-32 bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-xs text-center p-2 rounded-lg">
                  <div>
                    <Bus className="w-8 h-8 mx-auto mb-2" />
                    Scan to Pay
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm mb-2">Scan QR code to pay for your ride</p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  Available at all bus terminals
                </p>
                <button className="btn-secondary text-sm px-4 py-2 mt-3" onClick={() => onOpenModal('qrCode')}>
                  <QrCode className="w-4 h-4 inline mr-2" />
                  Generate QR
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Transactions */}
        <div className="space-y-6">
          <div className="glass-card p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <History className="text-primary" />
              Recent Transactions
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <Inbox className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No transactions yet</p>
                  <p className="text-xs text-gray-500 mt-1">Your first top-up will appear here</p>
                </div>
              ) : (
                transactions.slice(0, 5).map(tx => (
                  <div key={tx.id} className={`transaction-item ${tx.type} p-3 hover:bg-white/5 transition rounded-lg`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        tx.type === 'credit' ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        {tx.type === 'credit' ? <ArrowDownLeft className="w-4 h-4 text-green-400" /> : <ArrowUpRight className="w-4 h-4 text-red-400" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium truncate">{tx.description}</p>
                          <p className={`text-sm font-bold ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                            {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                          </p>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{tx.date}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button className="btn-secondary w-full mt-4 py-2 text-sm" disabled={transactions.length === 0}>
              <Download className="w-4 h-4 inline mr-2" />
              Download Statement
            </button>
          </div>

          {/* Spending Insights - Shows differently for zero balance */}
          <div className="glass-card p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="text-primary" />
              Spending Insights
            </h3>
            {balance === 0 ? (
              <div className="text-center py-6">
                <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Add funds to see insights</p>
                <button 
                  className="mt-3 text-primary text-sm hover:text-primary-light transition"
                  onClick={() => setShowPaymentModal(true)}
                >
                  Add funds now →
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">This week</span>
                      <span className="font-semibold">₦2,450</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Last week</span>
                      <span className="font-semibold">₦3,800</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    15% less than last week
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Link ABSIN Card Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowLinkModal(false)}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4">
            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Link ABSIN Card</h3>
                <button onClick={() => setShowLinkModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => {
                      const formatted = e.target.value.replace(/\s/g, '').slice(0, 16);
                      const groups = formatted.match(/.{1,4}/g);
                      setCardNumber(groups ? groups.join(' ') : formatted);
                    }}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">PIN</label>
                  <input
                    type="password"
                    value={cardPin}
                    onChange={(e) => setCardPin(e.target.value.slice(0, 6))}
                    placeholder="****"
                    maxLength={6}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <p className="text-xs text-purple-400">
                    <Shield className="w-3 h-3 inline mr-1" />
                    Your card details are encrypted and secure
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition"
                    onClick={handleLinkCard}
                    disabled={isLinkingCard}
                  >
                    {isLinkingCard ? 'Linking...' : 'Link Card'}
                  </button>
                  <button
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg transition"
                    onClick={() => setShowLinkModal(false)}
                  >
                    Cancel
                  </button>
                </div>

                <div className="text-center text-xs text-gray-500">

                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Modal */}
      <PaymentMethodModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
});

export default WalletTab;