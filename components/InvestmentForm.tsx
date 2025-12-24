
import React, { useState } from 'react';
import { Investment, INVESTMENT_CATEGORIES } from '../types';

interface InvestmentFormProps {
  initialData?: Investment | null;
  onSave: (data: Omit<Investment, 'id'>, id?: string) => void;
  onClose: () => void;
  currency: string;
}

const InvestmentForm: React.FC<InvestmentFormProps> = ({ initialData, onSave, onClose, currency }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [ticker, setTicker] = useState(initialData?.ticker || '');
  const [amount, setAmount] = useState(initialData?.amount.toString() || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !category) return;
    onSave({
      name,
      ticker: ticker.toUpperCase(),
      amount: parseFloat(amount),
      category,
      date
    }, initialData?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1C1C1E] rounded-[32px] w-full max-w-md shadow-2xl border border-white/10 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-white tracking-tight">
              {initialData ? 'Editar' : 'Novo'} Investimento
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest ml-1">Ativo / Nome</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Petrobras, Bitcoin, Selic..."
                className="w-full bg-[#2C2C2E] text-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-accent outline-none transition-all placeholder-gray-600 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest ml-1">Ticker (Opcional)</label>
                <input
                  type="text"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value)}
                  placeholder="Ex: PETR4"
                  className="w-full bg-[#2C2C2E] text-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-accent outline-none transition-all placeholder-gray-600 font-bold uppercase"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest ml-1">Valor ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full bg-[#2C2C2E] text-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-accent outline-none transition-all placeholder-gray-600 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest ml-1">Classe do Ativo</label>
              <div className="grid grid-cols-2 gap-2">
                {INVESTMENT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-3 rounded-2xl text-left transition-all flex items-center space-x-2 border-2 ${
                      category === cat.id ? 'bg-accent/10 border-accent' : 'border-transparent bg-[#2C2C2E]'
                    }`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-xs font-bold text-white uppercase tracking-tighter">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-accent text-white font-black rounded-2xl py-5 hover:opacity-90 transition-all shadow-accent active:scale-95 uppercase tracking-widest text-sm"
              >
                Confirmar Aporte
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InvestmentForm;
