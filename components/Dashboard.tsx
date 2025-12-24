
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { Transaction, Investment, Tax, INCOME_CATEGORIES, EXPENSE_CATEGORIES, TransactionType, PaymentMethod } from '../types';
import { createFinancialChat } from '../services/geminiService';
import { Chat } from '@google/genai';
import { ChatMessage } from '../App';

interface DashboardProps {
  transactions: Transaction[];
  investments: Investment[];
  taxes: Tax[];
  theme: 'light' | 'dark';
  currency: string;
  messages: ChatMessage[];
  onAiTransaction: (data: { description: string, amount: number, category: string, date: string, paymentMethod: PaymentMethod, type: TransactionType }) => void;
  onAiInvestment: (data: Omit<Investment, 'id'>) => void;
  onAiTax: (data: Omit<Tax, 'id'>) => void;
  onAddMessage: (role: 'user' | 'model', text: string) => void;
}

const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={i} className="leading-relaxed">
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={j} className="font-bold text-[#1C1C1E] dark:text-white">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return <span key={j}>{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ 
  transactions, investments, taxes, theme, currency, messages, 
  onAiTransaction, onAiInvestment, onAiTax, onAddMessage 
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(date.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    return sixMonthsAgo.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const suggestions = [
    "Qual meu próximo imposto a pagar?",
    "Quanto gastei esse mês?",
    "Resuma meus investimentos",
    "Analise minha saúde financeira",
    "Paguei o IPTU de 300 reais"
  ];

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: currency,
      minimumFractionDigits: 2 
    });
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => t.date >= startDate && t.date <= endDate);
  }, [transactions, startDate, endDate]);

  const totalIncome = useMemo(() => 
    filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0),
    [filteredTransactions]
  );

  const totalExpense = useMemo(() => 
    filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0),
    [filteredTransactions]
  );

  const balance = totalIncome - totalExpense;

  const advancedMetrics = useMemo(() => {
    const daysDiff = Math.max(1, (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24));
    const expenseTx = filteredTransactions.filter(t => t.type === 'expense');
    
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;
    const dailyBurn = totalExpense / daysDiff;
    const avgTicket = expenseTx.length > 0 ? totalExpense / expenseTx.length : 0;
    
    const creditTotal = expenseTx.filter(t => t.paymentMethod === 'credit').reduce((acc, t) => acc + t.amount, 0);
    const creditDependency = totalExpense > 0 ? (creditTotal / totalExpense) * 100 : 0;
    
    const survivalDays = dailyBurn > 0 ? balance / dailyBurn : 0;
    const efficiencyRatio = totalExpense > 0 ? totalIncome / totalExpense : totalIncome > 0 ? 100 : 0;
    
    const catTotals: Record<string, number> = {};
    expenseTx.forEach(t => catTotals[t.category] = (catTotals[t.category] || 0) + t.amount);
    const maxCatValue = Math.max(0, ...Object.values(catTotals));
    const concentration = totalExpense > 0 ? (maxCatValue / totalExpense) * 100 : 0;
    
    const txCount = filteredTransactions.length;
    const healthScore = savingsRate > 20 ? 'Excelente' : savingsRate > 0 ? 'Estável' : 'Crítico';

    let insightText = "Mantenha o registro constante para análises mais profundas.";
    if (savingsRate < 0) insightText = "Seu gasto superou a receita. Revise suas despesas.";
    else if (creditDependency > 60) insightText = "Cuidado com a dependência de crédito.";
    else if (savingsRate > 25) insightText = "Excelente taxa de poupança!";

    return {
      savingsRate, dailyBurn, avgTicket, creditDependency, 
      survivalDays, efficiencyRatio, concentration,
      txCount, healthScore, insightText
    };
  }, [filteredTransactions, totalIncome, totalExpense, balance, startDate, endDate]);

  useEffect(() => {
    const target = isMobileChatOpen ? mobileScrollRef.current : scrollRef.current;
    if (target) target.scrollTo({ top: target.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading, isMobileChatOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    onAddMessage('user', text);
    setIsLoading(true);

    if (!chatRef.current) chatRef.current = createFinancialChat(transactions, investments, taxes);

    try {
      const response = await chatRef.current.sendMessage({ message: text });
      
      if (response.functionCalls && response.functionCalls.length > 0) {
        for (const fc of response.functionCalls) {
          const args = fc.args as any;
          if (fc.name === 'save_transaction') {
            onAiTransaction({ ...args, date: args.date || new Date().toISOString().split('T')[0] });
            const feedback = await chatRef.current.sendMessage({ message: `Confirmei o registro de ${formatCurrency(args.amount)}.` });
            onAddMessage('model', feedback.text || 'Gasto registrado!');
          } else if (fc.name === 'save_investment') {
            onAiInvestment({ ...args, date: args.date || new Date().toISOString().split('T')[0] });
            const feedback = await chatRef.current.sendMessage({ message: `Investimento em ${args.name} salvo.` });
            onAddMessage('model', feedback.text || 'Aporte registrado!');
          } else if (fc.name === 'save_tax') {
            onAiTax({ ...args, dueDate: args.dueDate || new Date().toISOString().split('T')[0] });
            const feedback = await chatRef.current.sendMessage({ message: `Imposto ${args.name} registrado para controle.` });
            onAddMessage('model', feedback.text || 'Tributo registrado!');
          }
        }
      } else {
        onAddMessage('model', response.text || '');
      }
    } catch (e) {
      onAddMessage('model', 'Tive um problema ao processar seu pedido.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input;
    setInput('');
    await sendMessage(text);
  };

  const handleThisMonth = () => {
    const now = new Date();
    setStartDate(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]);
    setEndDate(new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]);
    chatRef.current = null;
  };

  const handleAllTime = () => {
    if (transactions.length === 0) return;
    const dates = transactions.map(t => new Date(t.date).getTime());
    setStartDate(new Date(Math.min(...dates)).toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
    chatRef.current = null;
  };

  const pieData = useMemo(() => {
    const data: Record<string, number> = {};
    filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
      data[t.category] = (data[t.category] || 0) + t.amount;
    });
    return Object.entries(data).map(([catId, amount]) => ({
      name: EXPENSE_CATEGORIES.find(c => c.id === catId)?.name || catId,
      value: amount,
      color: EXPENSE_CATEGORIES.find(c => c.id === catId)?.color || '#888'
    }));
  }, [filteredTransactions]);

  const timelineData = useMemo(() => {
    const days: Record<string, { income: number; expense: number }> = {};
    filteredTransactions.forEach(t => {
      if (!days[t.date]) days[t.date] = { income: 0, expense: 0 };
      if (t.type === 'income') days[t.date].income += t.amount;
      else days[t.date].expense += t.amount;
    });
    return Object.entries(days).sort((a, b) => a[0].localeCompare(b[0])).map(([date, values]) => ({
      date: new Date(date + 'T12:00:00Z').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      ...values
    }));
  }, [filteredTransactions]);

  const monthlyData = useMemo(() => {
    const months: Record<string, { income: number; expense: number }> = {};
    filteredTransactions.forEach(t => {
      const date = new Date(t.date + 'T12:00:00Z');
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!months[monthKey]) months[monthKey] = { income: 0, expense: 0 };
      if (t.type === 'income') months[monthKey].income += t.amount;
      else months[monthKey].expense += t.amount;
    });
    return Object.entries(months).sort((a, b) => a[0].localeCompare(b[0])).map(([month, values]) => ({
      monthName: new Date(month + '-02T12:00:00Z').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
      ...values
    }));
  }, [filteredTransactions]);

  const chartTextColor = theme === 'dark' ? '#636366' : '#8E8E93';
  const chartGridColor = theme === 'dark' ? '#2c2c2e' : '#e5e5ea';
  const tooltipBg = theme === 'dark' ? '#2c2c2e' : '#ffffff';
  const tooltipBorder = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const textColor = theme === 'dark' ? '#ffffff' : '#1c1c1e';

  const renderChatInterface = (targetScrollRef: React.RefObject<HTMLDivElement | null>) => (
    <>
      <div ref={targetScrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/5 dark:bg-[#000]/10">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-10">
            <div className="w-20 h-20 bg-black/5 dark:bg-white/5 rounded-3xl flex items-center justify-center text-4xl border border-black/5 dark:border-white/5">💬</div>
            <h4 className="text-black dark:text-white font-semibold text-lg">Financ.ia Chat</h4>
            <p className="text-gray-500 dark:text-gray-400 font-medium max-w-sm">Tente: "Paguei o IPTU de 200 reais"</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] p-5 rounded-3xl text-[15px] shadow-xl ${msg.role === 'user' ? 'bg-accent text-white shadow-accent' : 'bg-white dark:bg-[#2C2C2E] text-black dark:text-gray-200 border border-black/5 dark:border-white/10'}`}>
                <FormattedText text={msg.text} />
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-[#2C2C2E] p-4 rounded-3xl flex space-x-1.5 items-center border border-black/5 dark:border-white/5 shadow-md">
              <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>
      <div className="p-4 bg-white dark:bg-[#1C1C1E] border-t border-black/5 dark:border-white/5 space-y-4">
        <div className="flex overflow-x-auto pb-2 gap-2 custom-scrollbar-hide no-scrollbar">
          {suggestions.map((s, idx) => (
            <button key={idx} onClick={() => sendMessage(s)} disabled={isLoading} className="flex-shrink-0 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 px-4 py-2 rounded-2xl text-xs font-semibold text-gray-500 hover:text-accent hover:border-accent transition-all whitespace-nowrap active:scale-95 disabled:opacity-50">
              {s}
            </button>
          ))}
        </div>

        <form onSubmit={handleSend}>
          <div className="relative flex items-center group">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Fale com a IA..." className="w-full bg-black/5 dark:bg-[#2C2C2E] text-black dark:text-white border-none rounded-2xl py-4 pl-6 pr-14 focus:ring-2 focus:ring-accent outline-none placeholder-gray-500 transition-all text-sm shadow-inner" />
            <button type="submit" disabled={isLoading || !input.trim()} className="absolute right-2 p-2.5 bg-accent text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-30 shadow-accent active:scale-95">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
        </form>
      </div>
    </>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* AI Assistant - Desktop View */}
      <div className="hidden lg:flex flex-col bg-white dark:bg-[#1C1C1E] rounded-3xl border border-black/5 dark:border-white/5 overflow-hidden min-h-[450px] max-h-[550px] shadow-2xl">
        <div className="p-6 border-b border-black/5 dark:border-white/5 bg-gradient-to-r from-blue-600/10 to-transparent flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center text-xl shadow-inner">✨</div>
            <div>
              <h3 className="text-lg font-semibold text-black dark:text-white">Financ.ia Assistant</h3>
              <p className="text-[10px] text-accent font-bold uppercase tracking-widest">IA nativa integrada</p>
            </div>
          </div>
        </div>
        {renderChatInterface(scrollRef)}
      </div>

      {/* Mobile Floating Action Button */}
      <div className="lg:hidden fixed bottom-36 right-6 z-50">
        <button onClick={() => setIsMobileChatOpen(true)} className="w-16 h-16 bg-accent text-white rounded-full shadow-2xl flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-all shadow-accent">
          <span className="relative">✨</span>
        </button>
      </div>

      {/* Mobile Chat Overlay */}
      {isMobileChatOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="flex flex-col h-full animate-in slide-in-from-bottom-full duration-300">
            <div className="p-6 border-b border-white/10 flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center text-xl">✨</div>
                <div><h3 className="text-lg font-semibold">Financ.ia</h3></div>
              </div>
              <button onClick={() => setIsMobileChatOpen(false)} className="p-2 bg-white/10 rounded-full text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            {renderChatInterface(mobileScrollRef)}
          </div>
        </div>
      )}

      {/* FILTROS COMPACTOS */}
      <div className="bg-white dark:bg-[#1C1C1E] p-2.5 px-4 rounded-3xl border border-black/5 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm overflow-hidden">
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-black/5 dark:bg-[#2C2C2E] rounded-2xl px-3 py-1.5 border border-black/5 dark:border-white/5 focus-within:ring-1 focus-within:ring-accent transition-all">
            <span className="text-[9px] font-black text-gray-500 mr-2 uppercase tracking-tighter">DE</span>
            <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); chatRef.current = null; }} className="bg-transparent text-xs font-bold text-black dark:text-white border-none focus:ring-0 p-0 outline-none [color-scheme:dark] w-24" />
          </div>
          <div className="flex items-center bg-black/5 dark:bg-[#2C2C2E] rounded-2xl px-3 py-1.5 border border-black/5 dark:border-white/5 focus-within:ring-1 focus-within:ring-accent transition-all">
            <span className="text-[9px] font-black text-gray-500 mr-2 uppercase tracking-tighter">ATÉ</span>
            <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); chatRef.current = null; }} className="bg-transparent text-xs font-bold text-black dark:text-white border-none focus:ring-0 p-0 outline-none [color-scheme:dark] w-24" />
          </div>
        </div>
        
        <div className="flex items-center justify-between md:justify-end flex-1 gap-2">
          <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-[18px] border border-black/5 dark:border-white/5">
            <button onClick={handleThisMonth} className="px-4 py-1.5 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-all">Mês Atual</button>
            <button onClick={handleAllTime} className="px-4 py-1.5 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-all">Todo Tempo</button>
          </div>
          <div className="flex items-center pl-3 border-l border-black/10 dark:border-white/10">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{filteredTransactions.length} TXS</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1C1C1E] p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Saldo no Período</p>
          <p className={`text-3xl font-bold ${balance >= 0 ? 'text-black dark:text-white' : 'text-[#FF453A]'}`}>{formatCurrency(balance)}</p>
        </div>
        <div className="bg-white dark:bg-[#1C1C1E] p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Receitas</p>
          <p className="text-3xl font-bold text-[#30D158]">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-white dark:bg-[#1C1C1E] p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Despesas</p>
          <p className="text-3xl font-bold text-[#FF453A]">{formatCurrency(totalExpense)}</p>
        </div>
      </div>

      {/* BLOCO: INTELIGÊNCIA ANALÍTICA (OTIMIZADO CONFORME PRINT) */}
      <div className="bg-white dark:bg-[#1C1C1E] p-5 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl">📊</span>
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest">Inteligência Analítica</h3>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: 'Taxa Poupança', value: `${advancedMetrics.savingsRate.toFixed(1)}%`, icon: '🌱' },
                { label: 'Burn Rate Diário', value: formatCurrency(advancedMetrics.dailyBurn), icon: '🔥' },
                { label: 'Sobrevivência', value: `${Math.floor(advancedMetrics.survivalDays)} dias`, icon: '⏳' },
                { label: 'Eficiência', value: `${advancedMetrics.efficiencyRatio.toFixed(1)}x`, icon: '⚡' },
                { label: 'Concentração', value: `${advancedMetrics.concentration.toFixed(1)}%`, icon: '🎯' },
                { label: 'Status Saúde', value: advancedMetrics.healthScore, icon: '🛡️' },
              ].map((metric, idx) => (
                <div key={idx} className="bg-black/5 dark:bg-[#121214] p-3 rounded-2xl border border-black/5 dark:border-white/5 transition-all hover:border-accent/20">
                  <div className="text-lg mb-0.5">{metric.icon}</div>
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-tighter leading-tight">{metric.label}</p>
                  <p className="text-[15px] font-black text-black dark:text-white leading-tight mt-0.5">{metric.value}</p>
                </div>
              ))}
          </div>

          <div className="p-3 bg-accent/5 rounded-2xl border border-accent/10 flex items-start space-x-3">
             <span className="text-accent text-lg">💡</span>
             <p className="text-[11px] font-medium text-gray-500 leading-tight">
               {advancedMetrics.insightText}
             </p>
          </div>
      </div>

      <div className="bg-white dark:bg-[#1C1C1E] p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
        <h3 className="text-lg font-semibold mb-6 text-black dark:text-white">Análise Mensal</h3>
        <div className="h-[350px]">
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                <XAxis dataKey="monthName" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: chartTextColor}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: chartTextColor}} />
                <Tooltip cursor={{fill: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}} contentStyle={{ backgroundColor: tooltipBg, borderRadius: '16px', border: `1px solid ${tooltipBorder}` }} labelStyle={{ color: textColor, fontWeight: 'bold' }} formatter={(value: number) => formatCurrency(value)} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar name="Receitas" dataKey="income" fill="#30D158" radius={[6, 6, 0, 0]} />
                <Bar name="Despesas" dataKey="expense" fill="#FF453A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-full flex items-center justify-center text-gray-500 italic">Sem dados mensais</div>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
