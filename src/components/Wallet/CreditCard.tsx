// src/components/Wallet/CreditCard.jsx
import React from 'react';

const CreditCard = ({ balance }) => {
  const isZero = balance === 0;

  return (
    <div className="credit-card p-6 mb-6 floating">
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="text-sm text-green-200 mb-1">ABIA STATE Government Issue</p>
          <p className="text-xs text-green-300 mono">ABIA-2026-4729</p>
        </div>
        <div className="chip">
          <i data-lucide="cpu" className="w-6 h-6 text-amber-800"></i>
        </div>
      </div>
      
      <div className="mb-8">
        <p className="text-sm text-green-200 mb-1">Cardholder</p>
        <p className="text-xl font-bold tracking-wider">ABUOMA DAVID</p>
      </div>
      
      <div className="flex justify-between items-end">
        <div>
          <p className="text-sm text-green-200 mb-1">Valid Thru</p>
          <p className="font-mono">12/28</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-green-200 mb-1">Balance</p>
          {isZero ? (
            <div>
              <p className="text-2xl font-bold text-yellow-400">₦0.00</p>
              <p className="text-xs text-yellow-400/80">Add funds to get started</p>
            </div>
          ) : (
            <p className="text-2xl font-bold">₦{balance.toLocaleString()}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreditCard;