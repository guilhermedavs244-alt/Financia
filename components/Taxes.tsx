
import React, { useMemo } from 'react';
import { TAX_CATEGORIES, Tax } from '../types';

interface TaxesProps {
  taxes: Tax[];
  currency: string;
  theme: 'light' | 'dark';
  onAddTax: () => void;
  onEditTax: (tax: Tax) => void;
  onDeleteTax: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

const Taxes: React.FC<TaxesProps> = ({ 
  taxes, currency, theme, onAddTax, onEditTax, onDeleteTax, onToggleStatus 
}) => {
  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: currency,
      minimumFractionDigits: 2 
    });
  };

  const stats = useMemo(() => {
    const totalPaid = taxes.filter(t => t.status === 'paid').reduce((acc, t) => acc + t.amount, 0);
    const totalPending = taxes.filter(t => t.status === 'pending').reduce((acc, t) => acc + t.amount, 0);
    
    // Encontrar próximo vencimento pendente
    const pendingTaxes = taxes.filter(t => t.status === 'pending').sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const nextDue = pendingTaxes.length > 0 ? pendingTaxes[0] : null;

    return { totalPaid, totalPending, nextDue };
  }, [taxes]);

  const getCategoryDetails = (id: string) => {
    return TAX_CATEGORIES.find(c => c.id === id) || { name: 'Outros', icon: '📜', color: '#888' };
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Controle Tributário</h3>
          <p className="text-4xl font-black text-black dark:text-white mt-1">Impostos</p>
        </div>
        <button 
          onClick={onAddTax}
          className="bg-accent text-white px-6 py-4 rounded-2xl font-bold shadow-accent hover:scale-[1.02] active:scale-95 transition-all flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Novo Imposto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1C1C1E] p-6 rounded-3xl border border-black/5 dark:border-white/5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Pago (Ano)</p>
          <p className="text-2xl font-black text-[#30D158]">{formatCurrency(stats.totalPaid)}</p>
        </div>
        <div className="bg-white dark:bg-[#1C1C1E] p-6 rounded-3xl border border-black/5 dark:border-white/5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Pendente</p>
          <p className="text-2xl font-black text-[#FF453A]">{formatCurrency(stats.totalPending)}</p>
        </div>
        <div className="bg-gradient-to-br from-[#5856D6] to-[#AF52DE] p-6 rounded-3xl text-white shadow-lg">
          <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-80">Próximo Vencimento</p>
          <p className="text-2xl font-black truncate">
            {stats.nextDue ? new Date(stats.nextDue.dueDate + 'T12:00:00Z').toLocaleDateString('pt-BR') : 'Sem pendências'}
          </p>
          {stats.nextDue && <p className="text-[10px] font-bold mt-1 opacity-90 uppercase tracking-tighter">{stats.nextDue.name}</p>}
        </div>
      </div>

      <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] border border-black/5 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-black/5 dark:border-white/5">
          <h3 className="text-lg font-bold text-black dark:text-white">Agenda de Tributos</h3>
        </div>
        
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-black/5 dark:border-white/5">
                <th className="px-8 py-4">Imposto</th>
                <th className="px-8 py-4">Vencimento</th>
                <th className="px-8 py-4 text-right">Valor</th>
                <th className="px-8 py-4 text-center">Status</th>
                <th className="px-8 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {taxes.length > 0 ? (
                taxes.sort((a,b) => a.dueDate.localeCompare(b.dueDate)).map(tax => {
                  const cat = getCategoryDetails(tax.category);
                  const isLate = tax.status === 'pending' && new Date(tax.dueDate) < new Date();
                  
                  return (
                    <tr key={tax.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-black/5 dark:bg-white/5">
                            {cat.icon}
                          </div>
                          <div>
                            <p className="font-bold text-black dark:text-white leading-none">{tax.name}</p>
                            <p className="text-xs text-gray-500 mt-1 uppercase tracking-tighter font-bold">{cat.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className={`text-sm font-bold ${isLate ? 'text-red-500' : 'text-gray-500'}`}>
                            {new Date(tax.dueDate + 'T12:00:00Z').toLocaleDateString('pt-BR')}
                          </span>
                          {isLate && <span className="text-[8px] font-black uppercase text-red-500 tracking-widest">Atrasado</span>}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-black dark:text-white">
                        {formatCurrency(tax.amount)}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <button 
                          onClick={() => onToggleStatus(tax.id)}
                          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                            tax.status === 'paid' 
                            ? 'bg-[#30D158]/10 text-[#30D158] border border-[#30D158]/20' 
                            : 'bg-black/5 dark:bg-white/5 text-gray-500 border border-transparent'
                          }`}
                        >
                          {tax.status === 'paid' ? 'Pago' : 'Pendente'}
                        </button>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => onEditTax(tax)}
                            className="p-2 text-gray-400 hover:text-accent transition-all hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => onDeleteTax(tax.id)}
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
                  <td colSpan={5} className="px-8 py-10 text-center text-gray-500 italic">
                    Nenhum imposto registrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Taxes;
