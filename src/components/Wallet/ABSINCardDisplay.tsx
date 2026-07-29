import React, { useState, useEffect } from 'react';
import { getABSINService } from '../../services/absin';

const ABSINCardDisplay = () => {
  const [cardInfo, setCardInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCardInfo();
  }, []);

  const loadCardInfo = async () => {
    setIsLoading(true);
    try {
      const service = getABSINService();
      await service.initialize();
      
      // For demo, simulate a linked card
      setCardInfo({
        cardId: '**** **** **** 3456',
        cardholder: 'Abuoma David',
        tier: 'Premium',
        status: 'Active',
        balance: 12450,
        points: 450,
        nextTier: 600
      });
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/10 rounded w-1/2"></div>
          <div className="h-24 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 text-center">
        <i data-lucide="alert-circle" className="w-12 h-12 text-red-400 mx-auto mb-3"></i>
        <p className="text-red-400">{error}</p>
        <button onClick={loadCardInfo} className="btn-secondary mt-4">Retry</button>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <i data-lucide="credit-card" className="text-purple-400"></i>
          Linked ABSIN Card
        </h3>
        <span className="badge-success">Active</span>
      </div>

      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-6 relative overflow-hidden mb-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="relative z-10">
          <p className="text-xs text-purple-200 mb-1">ABIA STATE Government Issue</p>
          <p className="text-xl font-mono tracking-wider mb-4">{cardInfo?.cardId}</p>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-purple-200">Cardholder</p>
              <p className="font-semibold">{cardInfo?.cardholder}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-purple-200">Tier</p>
              <p className="font-semibold">{cardInfo?.tier}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Points Balance</span>
          <span className="text-xl font-bold text-yellow-400">{cardInfo?.points} pts</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(cardInfo?.points / cardInfo?.nextTier) * 100}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-400">
          {cardInfo?.nextTier - cardInfo?.points} points to next tier
        </p>
      </div>
    </div>
  );
};

export default ABSINCardDisplay;