
import React from 'react';
import { Transaction, INCOME_CATEGORIES, EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  type: 'income' | 'expense';
  currency: string;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions, type, currency, onEdit, onDelete 
}) => {
  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: currency,
      minimumFractionDigits: 2 
    });
  };

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  
  const getCategoryDetails = (id: string) => {
    return categories.find(c => c.id === id) || { name: 'Outros', icon: '📦', color: '#888' };
  };

  const getPaymentDetails = (id: string) => {
    return PAYMENT_METHODS.find(m => m.id === id) || { name: id, icon: '💰' };
  };

  const filteredTransactions = transactions.filter(t => t.type === type);

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] border border-black/5 dark:border-white/5 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-black/5 dark:border-white/5">
              <th className="px-8 py-4">Descrição</th>
              <th className="px-8 py-4">Categoria</th>
              <th className="px-8 py-4">Pagamento</th>
              <th className="px-8 py-4">Data</th>
              <th className="px-8 py-4 text-right">Valor</th>
              <th className="px-8 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map(tx => {
                const cat = getCategoryDetails(tx.category);
                const pay = getPaymentDetails(tx.paymentMethod);
                return (
                  <tr key={tx.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-5">
                      <p className="font-bold text-black dark:text-white leading-none">{tx.description}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{cat.icon}</span>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs">{pay.icon}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{pay.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-bold text-gray-500">
                        {new Date(tx.date + 'T12:00:00Z').toLocaleDateString('pt-BR')}
                      </span>
                    </td>
                    <td className={`px-8 py-5 text-right font-black ${type === 'income' ? 'text-[#30D158]' : 'text-[#FF453A]'}`}>
                      {type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button 
                          onClick={() => onEdit(tx)}
                          className="p-2 text-gray-400 hover:text-accent transition-all hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => onDelete(tx.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-all hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-8 py-16 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2 opacity-30">
                    <span className="text-4xl">📄</span>
                    <p className="text-sm font-medium italic">Nenhum registro encontrado</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionList;
