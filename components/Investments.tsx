
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Investment, INVESTMENT_CATEGORIES } from '../types';

interface InvestmentsProps {
  investments: Investment[];
  currency: string;
  theme: 'light' | 'dark';
  onAddInvestment: () => void;
  onEditInvestment: (inv: Investment) => void;
  onDeleteInvestment: (id: string) => void;
}

const Investments: React.FC<InvestmentsProps> = ({ 
  investments, currency, theme, onAddInvestment, onEditInvestment, onDeleteInvestment 
}) => {
  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: currency,
      minimumFractionDigits: 2 
    });
  };

  const totalInvested = useMemo(() => 
    investments.reduce((acc, inv) => acc + inv.amount, 0), 
    [investments]
  );

  const allocationData = useMemo(() => {
    const data: Record<string, number> = {};
    investments.forEach(inv => {
      data[inv.category] = (data[inv.category] || 0) + inv.amount;
    });
    return Object.entries(data).map(([catId, amount]) => ({
      name: INVESTMENT_CATEGORIES.find(c => c.id === catId)?.name || catId,
      value: amount,
      color: INVESTMENT_CATEGORIES.find(c => c.id === catId)?.color || '#888'
    })).sort((a, b) => b.value - a.value);
  }, [investments]);

  const getCategoryDetails = (id: string) => {
    return INVESTMENT_CATEGORIES.find(c => c.id === id) || { name: 'Outros', icon: '🪙', color: '#888' };
  };

  const tooltipBg = theme === 'dark' ? '#2c2c2e' : '#ffffff';
  const textColor = theme === 'dark' ? '#ffffff' : '#1c1c1e';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header com Adição */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Patrimônio Investido</h3>
          <p className="text-4xl font-black text-black dark:text-white mt-1">{formatCurrency(totalInvested)}</p>
        </div>
        <button 
          onClick={onAddInvestment}
          className="bg-accent text-white px-6 py-4 rounded-2xl font-bold shadow-accent hover:scale-[1.02] active:scale-95 transition-all flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Novo Ativo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alocação Gráfico */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1C1C1E] p-8 rounded-[32px] border border-black/5 dark:border-white/5 shadow-sm">
          <h3 className="text-lg font-bold mb-6 text-black dark:text-white">Distribuição de Carteira</h3>
          <div className="h-[300px] flex items-center justify-center">
            {allocationData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: tooltipBg, borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: textColor, fontWeight: 'bold' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend verticalAlign="middle" align="right" layout="vertical" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 italic">Sem ativos para exibir no gráfico</p>
            )}
          </div>
        </div>

        {/* Resumo Rápido */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#1C1C1E] p-6 rounded-[28px] border border-black/5 dark:border-white/5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Diversificação</p>
            <p className="text-2xl font-bold">{allocationData.length} Classes</p>
          </div>
          <div className="bg-white dark:bg-[#1C1C1E] p-6 rounded-[28px] border border-black/5 dark:border-white/5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total de Ativos</p>
            <p className="text-2xl font-bold">{investments.length} Títulos</p>
          </div>
          <div className="bg-gradient-to-br from-accent to-blue-700 p-6 rounded-[28px] text-white shadow-lg">
            <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-80">Maior Exposição</p>
            <p className="text-2xl font-bold truncate">
              {allocationData[0]?.name || '---'}
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Ativos */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] border border-black/5 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-black/5 dark:border-white/5 flex justify-between items-center">
          <h3 className="text-lg font-bold text-black dark:text-white">Meus Ativos</h3>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{investments.length} Itens</span>
        </div>
        
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-black/5 dark:border-white/5">
                <th className="px-8 py-4">Ativo</th>
                <th className="px-8 py-4">Categoria</th>
                <th className="px-8 py-4 text-right">Valor</th>
                <th className="px-8 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {investments.length > 0 ? (
                investments.map(inv => {
                  const cat = getCategoryDetails(inv.category);
                  return (
                    <tr key={inv.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-black/5 dark:bg-white/5">
                            {cat.icon}
                          </div>
                          <div>
                            <p className="font-bold text-black dark:text-white leading-none">{inv.ticker || inv.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{inv.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[10px] font-bold px-3 py-1 rounded-full border border-black/10 dark:border-white/10 text-gray-500 uppercase tracking-tighter">
                          {cat.name}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-black dark:text-white">
                        {formatCurrency(inv.amount)}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => onEditInvestment(inv)}
                            className="p-2 text-gray-400 hover:text-accent transition-all hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => onDeleteInvestment(inv.id)}
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
                  <td colSpan={4} className="px-8 py-10 text-center text-gray-500 italic">
                    Nenhum investimento cadastrado.
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

export default Investments;
