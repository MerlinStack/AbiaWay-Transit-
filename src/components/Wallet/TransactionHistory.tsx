import React, { memo, useState, useMemo, useCallback } from 'react';
import { History, Inbox, ArrowDownLeft, ArrowUpRight, Download } from 'lucide-react';

interface TransactionHistoryProps {
  transactions: Array<{
    id: number;
    type: 'credit' | 'debit';
    description: string;
    amount: number;
    date: string;
  }>;
}

const TransactionHistory = memo(({ transactions }: TransactionHistoryProps) => {
  const [filter, setFilter] = useState('all');

  const filteredTransactions = useMemo(() => {
    if (filter === 'all') return transactions;
    return transactions.filter((tx) => tx.type === filter);
  }, [transactions, filter]);

  const itemCount = filteredTransactions.length;

  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter);
  }, []);

  return (
    <div className="glass-card p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <History className="text-primary" />
          Transactions
        </h3>
        <div className="flex gap-1 bg-white/10 rounded-lg p-1">
          {(['all', 'credit', 'debit'] as const).map((f) => (
            <button
              key={f}
              className={`px-3 py-1 rounded-lg text-xs transition ${
                filter === f
                  ? f === 'all' ? 'bg-primary text-white' : f === 'credit' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                  : 'hover:bg-white/10'
              }`}
              onClick={() => handleFilterChange(f)}
            >
              {f === 'all' ? 'All' : f === 'credit' ? 'Credits' : 'Debits'}
            </button>
          ))}
        </div>
      </div>

      <div className="custom-scrollbar space-y-2 max-h-[380px] overflow-y-auto">
        {itemCount > 0 ? (
          filteredTransactions.map((tx) => (
            <div key={tx.id} className={`transaction-item ${tx.type} p-3 hover:bg-white/5 transition rounded-lg mx-1`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  {tx.type === 'credit' ? <ArrowDownLeft className="w-4 h-4 text-green-400" /> : <ArrowUpRight className="w-4 h-4 text-red-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium truncate">{tx.description}</p>
                    <p className={`text-sm font-bold ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'} shrink-0 ml-2`}>
                      {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-400">{tx.date}</p>
                    <span className="text-[10px] px-2 py-0.5 bg-white/10 rounded-full">{tx.type}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Inbox className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No transactions found</p>
          </div>
        )}
      </div>

      <button className="w-full btn-secondary mt-4 py-2 text-sm">
        <Download className="w-4 h-4 inline mr-2" />
        Download Statement
      </button>
    </div>
  );
});

export default TransactionHistory;
