import React from 'react';
import { RefreshCw } from 'lucide-react';

const ExchangeRate = ({ rate }) => {
  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 / 1500 },
    { code: 'EUR', name: 'Euro', symbol: '€', rate: 1 / 1650 },
    { code: 'GBP', name: 'British Pound', symbol: '£', rate: 1 / 1900 },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 1 / 210 },
  ];

  return (
    <div className="glass-card p-4 animate-fadeIn">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-primary" />
          Live Exchange Rates
        </h4>
        <span className="text-xs text-green-400 animate-pulse">Live • Updates every 10s</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {currencies.map(currency => (
          <div key={currency.code} className="bg-white/5 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm font-bold text-primary">{currency.symbol}</span>
              <span className="font-medium">{currency.code}</span>
            </div>
            <p className="text-sm">
              <span className="text-gray-400">1 NGN = </span>
              <span className="font-bold text-primary">
                {(currency.rate * rate).toFixed(4)}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">{currency.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExchangeRate;