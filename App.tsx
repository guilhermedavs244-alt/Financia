
import React, { useState, useEffect } from 'react';
import { Transaction, Investment, Tax, TabType, TransactionType, PaymentMethod, INCOME_CATEGORIES } from './types';
import TransactionForm from './components/TransactionForm';
import InvestmentForm from './components/InvestmentForm';
import TaxForm from './components/TaxForm';
import Dashboard from './components/Dashboard';
import Investments from './components/Investments';
import Taxes from './components/Taxes';
import Settings from './components/Settings';
import Auth from './components/Auth';
import TransactionList from './components/TransactionList';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
}

export const Logo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <div className={`${className} bg-accent rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-accent overflow-hidden relative group`}>
    <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>
    <span className="relative z-10 select-none">F</span>
  </div>
);

const NavIcon: React.FC<{ type: TabType; active: boolean }> = ({ type, active }) => {
  const baseClass = `w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
    active ? 'bg-white dark:bg-white/10 shadow-sm' : 'bg-transparent'
  }`;

  const iconColor = active ? 'text-accent' : 'text-gray-400';

  switch (type) {
    case TabType.DASHBOARD:
      return (
        <div className={baseClass}>
          <svg className={`w-5 h-5 ${iconColor}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="10" width="4" height="10" rx="1.5" fill="currentColor" fillOpacity={active ? "1" : "0.5"} />
            <rect x="10" y="6" width="4" height="14" rx="1.5" fill="currentColor" fillOpacity={active ? "1" : "0.5"} />
            <rect x="16" y="14" width="4" height="6" rx="1.5" fill="currentColor" fillOpacity={active ? "1" : "0.5"} />
          </svg>
        </div>
      );
    case TabType.INVESTMENTS:
      return (
        <div className={baseClass}>
          <svg className={`w-5 h-5 ${iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
      );
    case TabType.TAXES:
      return (
        <div className={baseClass}>
          <svg className={`w-5 h-5 ${iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 14l6-6m-5.5.5h.5m.5 5h.5m5.5.5h.5m-6-11h6a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2h3" />
          </svg>
        </div>
      );
    case TabType.INCOME:
      return (
        <div className={baseClass}><svg className={`w-5 h-5 ${active ? 'text-[#30D158]' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 18L9 13L13 17L20 8M20 8H15M20 8V13" /></svg></div>
      );
    case TabType.EXPENSE:
      return (
        <div className={baseClass}><svg className={`w-5 h-5 ${active ? 'text-[#FF453A]' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 6L9 11L13 7L20 16M20 16H15M20 16V11" /></svg></div>
      );
    case TabType.SETTINGS:
      return (
        <div className={baseClass}><svg className={`w-5 h-5 ${iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg></div>
      );
    default:
      return null;
  }
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>(TabType.DASHBOARD);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('financely_theme') as any) || 'dark');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('financely_accent_color') || '#0A84FF');
  const [currency, setCurrency] = useState(() => localStorage.getItem('financely_currency') || 'BRL');
  
  const [showTransForm, setShowTransForm] = useState<TransactionType | null>(null);
  const [showInvestForm, setShowInvestForm] = useState(false);
  const [showTaxForm, setShowTaxForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    const sessionEmail = localStorage.getItem('financia_session');
    if (sessionEmail) {
      const users: User[] = JSON.parse(localStorage.getItem('financia_users') || '[]');
      const user = users.find(u => u.email === sessionEmail);
      if (user) {
        setCurrentUser(user);
        setTransactions(JSON.parse(localStorage.getItem(`tx_${user.email}`) || '[]'));
        setInvestments(JSON.parse(localStorage.getItem(`inv_${user.email}`) || '[]'));
        setTaxes(JSON.parse(localStorage.getItem(`tax_${user.email}`) || '[]'));
        setMessages(JSON.parse(localStorage.getItem(`chat_${user.email}`) || '[]'));
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`tx_${currentUser.email}`, JSON.stringify(transactions));
      localStorage.setItem(`inv_${currentUser.email}`, JSON.stringify(investments));
      localStorage.setItem(`tax_${currentUser.email}`, JSON.stringify(taxes));
      localStorage.setItem(`chat_${currentUser.email}`, JSON.stringify(messages));
    }
  }, [transactions, investments, taxes, messages, currentUser]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor);
  }, [accentColor]);

  const saveTransaction = (desc: string, val: number, cat: string, date: string, meth: PaymentMethod, id?: string) => {
    if (id) {
      setTransactions(transactions.map(t => t.id === id ? { ...t, description: desc, amount: val, category: cat, date, paymentMethod: meth } : t));
    } else {
      const type = cat.includes('income') || cat.includes('salary') || cat.includes('freelance') ? 'income' : 'expense';
      setTransactions([{ id: crypto.randomUUID(), description: desc, amount: val, category: cat, date, paymentMethod: meth, type }, ...transactions]);
    }
    setEditingItem(null);
    setShowTransForm(null);
  };

  const saveInvestment = (data: Omit<Investment, 'id'>, id?: string) => {
    if (id) setInvestments(investments.map(inv => inv.id === id ? { ...inv, ...data } : inv));
    else setInvestments([{ id: crypto.randomUUID(), ...data }, ...investments]);
    setEditingItem(null);
    setShowInvestForm(false);
  };

  const saveTax = (data: Omit<Tax, 'id'>, id?: string) => {
    if (id) setTaxes(taxes.map(t => t.id === id ? { ...t, ...data } : t));
    else setTaxes([{ id: crypto.randomUUID(), ...data }, ...taxes]);
    setEditingItem(null);
    setShowTaxForm(false);
  };

  const toggleTaxStatus = (id: string) => {
    setTaxes(taxes.map(t => t.id === id ? { ...t, status: t.status === 'paid' ? 'pending' : 'paid' } : t));
  };

  if (!currentUser) return <Auth onLogin={(u) => { setCurrentUser(u); window.location.reload(); }} />;

  return (
    <div className={`min-h-screen pb-32 lg:pb-0 ${theme === 'dark' ? 'bg-black text-white' : 'bg-[#F2F2F7] text-[#1C1C1E]'}`}>
      <style>{`
        :root { --accent-color: ${accentColor}; }
        .bg-accent { background-color: var(--accent-color); }
        .text-accent { color: var(--accent-color); }
        .border-accent { border-color: var(--accent-color); }
        .shadow-accent { box-shadow: 0 10px 15px -3px rgba(10, 132, 255, 0.3); }
      `}</style>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex fixed top-0 bottom-0 left-0 w-72 bg-white/70 dark:bg-[#1C1C1E]/80 backdrop-blur-xl border-r border-black/10 dark:border-white/10 z-40 px-4 py-10 flex-col justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-10 px-4"><Logo /><h1 className="text-2xl font-bold dark:text-white">Financ.ia</h1></div>
          <nav className="space-y-2">
            {[
              { id: TabType.DASHBOARD, label: 'Resumo' },
              { id: TabType.INCOME, label: 'Receitas' },
              { id: TabType.EXPENSE, label: 'Despesas' },
              { id: TabType.INVESTMENTS, label: 'Carteira' },
              { id: TabType.TAXES, label: 'Impostos' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-4 px-4 py-3 rounded-2xl w-full transition-all ${activeTab === tab.id ? 'bg-black/5 dark:bg-white/10' : 'text-gray-500 hover:bg-black/5'}`}>
                <NavIcon type={tab.id} active={activeTab === tab.id} />
                <span className="font-bold text-lg">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <button onClick={() => setActiveTab(TabType.SETTINGS)} className={`flex items-center space-x-4 px-4 py-3 rounded-2xl w-full ${activeTab === TabType.SETTINGS ? 'bg-black/5 dark:bg-white/10' : 'text-gray-500'}`}><NavIcon type={TabType.SETTINGS} active={activeTab === TabType.SETTINGS} /><span className="font-bold text-lg">Ajustes</span></button>
      </div>

      {/* Mobile Floating Menu */}
      <div className="lg:hidden fixed bottom-6 left-4 right-4 bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-2xl z-40 px-4 py-4 rounded-[32px] flex justify-around items-center border border-white/10 shadow-2xl">
        {[TabType.DASHBOARD, TabType.INCOME, TabType.EXPENSE, TabType.INVESTMENTS, TabType.TAXES, TabType.SETTINGS].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className="flex flex-col items-center space-y-1">
            <NavIcon type={tab} active={activeTab === tab} />
            <span className={`text-[8px] font-black ${activeTab === tab ? 'text-accent' : 'text-gray-500 uppercase'}`}>
              {tab === TabType.DASHBOARD ? 'Resumo' : 
               tab === TabType.INCOME ? 'Receitas' : 
               tab === TabType.EXPENSE ? 'Despesas' : 
               tab === TabType.INVESTMENTS ? 'Carteira' : 
               tab === TabType.TAXES ? 'Impostos' : 'Ajustes'}
            </span>
          </button>
        ))}
      </div>

      <main className="lg:ml-72 p-6 lg:p-12 max-w-6xl mx-auto min-h-screen">
        {activeTab === TabType.DASHBOARD && (
          <Dashboard 
            transactions={transactions} investments={investments} taxes={taxes} theme={theme} currency={currency} messages={messages} 
            onAiTransaction={(data) => saveTransaction(data.description, data.amount, data.category, data.date, data.paymentMethod)} 
            onAiInvestment={(data) => saveInvestment(data)}
            onAiTax={(data) => saveTax(data)}
            onAddMessage={(r, t) => setMessages([...messages, {role: r, text: t, timestamp: Date.now()}])} 
          />
        )}
        
        {activeTab === TabType.INVESTMENTS && (
          <Investments 
            investments={investments} currency={currency} theme={theme}
            onAddInvestment={() => { setEditingItem(null); setShowInvestForm(true); }}
            onEditInvestment={(inv) => { setEditingItem(inv); setShowInvestForm(true); }}
            onDeleteInvestment={(id) => setInvestments(investments.filter(i => i.id !== id))}
          />
        )}

        {activeTab === TabType.TAXES && (
          <Taxes 
            taxes={taxes} currency={currency} theme={theme}
            onAddTax={() => { setEditingItem(null); setShowTaxForm(true); }}
            onEditTax={(t) => { setEditingItem(t); setShowTaxForm(true); }}
            onDeleteTax={(id) => setTaxes(taxes.filter(t => t.id !== id))}
            onToggleStatus={toggleTaxStatus}
          />
        )}

        {activeTab === TabType.SETTINGS && <Settings theme={theme} setTheme={setTheme} userName={currentUser.name} setUserName={(n) => setCurrentUser({...currentUser, name: n})} accentColor={accentColor} setAccentColor={setAccentColor} currency={currency} setCurrency={(c) => setCurrency(c)} onLogout={() => {localStorage.clear(); window.location.reload();}} onClearData={() => {setTransactions([]); setInvestments([]); setTaxes([]);}} />}
        
        {(activeTab === TabType.INCOME || activeTab === TabType.EXPENSE) && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Controle de Fluxo</h3>
                <h2 className="text-4xl font-black">{activeTab === TabType.INCOME ? 'Receitas' : 'Despesas'}</h2>
              </div>
              <button 
                onClick={() => { setEditingItem(null); setShowTransForm(activeTab as TransactionType); }} 
                className="bg-accent text-white px-6 py-4 rounded-2xl font-bold shadow-accent hover:scale-[1.02] active:scale-95 transition-all flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Adicionar
              </button>
            </div>
            
            <TransactionList 
              transactions={transactions} 
              type={activeTab as 'income' | 'expense'} 
              currency={currency}
              onEdit={(tx) => { setEditingItem(tx); setShowTransForm(tx.type); }}
              onDelete={(id) => setTransactions(transactions.filter(t => t.id !== id))}
            />
          </div>
        )}
      </main>

      {showTransForm && <TransactionForm type={showTransForm} initialData={editingItem} onSave={saveTransaction} onClose={() => { setShowTransForm(null); setEditingItem(null); }} accentColor={accentColor} currency={currency} />}
      {showInvestForm && <InvestmentForm initialData={editingItem} onSave={saveInvestment} onClose={() => { setShowInvestForm(false); setEditingItem(null); }} currency={currency} />}
      {showTaxForm && <TaxForm initialData={editingItem} onSave={saveTax} onClose={() => { setShowTaxForm(false); setEditingItem(null); }} currency={currency} />}
    </div>
  );
};

export default App;
