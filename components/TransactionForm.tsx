
import React, { useState } from 'react';
import { Transaction, TransactionType, PaymentMethod, INCOME_CATEGORIES, EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../types';

interface TransactionFormProps {
  type: TransactionType;
  initialData?: Transaction | null;
  onSave: (description: string, amount: number, category: string, date: string, paymentMethod: PaymentMethod, id?: string) => void;
  onClose: () => void;
  accentColor: string;
  currency: string;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ type, initialData, onSave, onClose, accentColor, currency }) => {
  const [description, setDescription] = useState(initialData?.description || '');
  const [amount, setAmount] = useState(initialData?.amount.toString() || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialData?.paymentMethod || 'pix');

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category || !date) return;
    onSave(description, parseFloat(amount), category, date, paymentMethod, initialData?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1C1C1E] rounded-3xl w-full max-w-md shadow-2xl border border-white/10 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">
              {initialData ? 'Editar' : 'Adicionar'} {type === 'income' ? 'Receita' : 'Despesa'}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1 ml-1">Descrição</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Supermercado, Salário..."
                className="w-full bg-[#2C2C2E] text-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-accent outline-none transition-all placeholder-gray-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1 ml-1">Valor ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full bg-[#2C2C2E] text-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-accent outline-none transition-all placeholder-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1 ml-1">Data</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#2C2C2E] text-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-accent outline-none transition-all [color-scheme:dark]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1 ml-1">Meio de Pagamento</label>
              <div className="grid grid-cols-4 gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all ${
                      paymentMethod === method.id ? 'bg-accent/10 border-accent' : 'border-transparent bg-[#2C2C2E]'
                    }`}
                  >
                    <span className="text-lg mb-1">{method.icon}</span>
                    <span className="text-[10px] font-bold text-white uppercase">{method.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1 ml-1">Categoria</label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-3 rounded-2xl text-left transition-all flex items-center space-x-2 border-2 ${
                      category === cat.id ? 'bg-accent/10 border-accent' : 'border-transparent bg-[#2C2C2E]'
                    }`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-sm font-medium text-white">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-accent text-white font-semibold rounded-2xl py-4 mt-4 hover:opacity-90 transition-colors shadow-accent"
            >
              {initialData ? 'Atualizar' : 'Salvar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;
