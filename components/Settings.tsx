
import React, { useState } from 'react';

interface SettingsProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  userName: string;
  setUserName: (name: string) => void;
  onClearData: () => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  theme, 
  setTheme, 
  userName, 
  setUserName, 
  onClearData, 
  accentColor, 
  setAccentColor,
  currency,
  setCurrency,
  onLogout
}) => {
  const [tempUserName, setTempUserName] = useState(userName);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSaveAccount = () => {
    setSaveStatus('saving');
    setUserName(tempUserName);
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 600);
  };

  const accents = [
    { id: 'blue', color: '#0A84FF', name: 'Azul' },
    { id: 'purple', color: '#AF52DE', name: 'Roxo' },
    { id: 'orange', color: '#FF9500', name: 'Laranja' },
    { id: 'green', color: '#30D158', name: 'Verde' },
    { id: 'pink', color: '#FF2D55', name: 'Rosa' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 pb-10">
      {/* Profile Section */}
      <section className="bg-white dark:bg-[#1C1C1E] p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider ml-1">Perfil da Conta</h3>
          <button 
            onClick={onLogout}
            className="text-xs font-bold text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            Sair da Conta
          </button>
        </div>
        <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-4">
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-2xl text-white font-bold shadow-lg">
            {tempUserName ? tempUserName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-medium text-gray-500 mb-1">Seu Nome</label>
            <input
              type="text"
              value={tempUserName}
              onChange={(e) => setTempUserName(e.target.value)}
              placeholder="Digite seu nome..."
              className="w-full bg-black/5 dark:bg-[#2C2C2E] text-black dark:text-white border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-accent outline-none transition-all"
            />
          </div>
          <button
            onClick={handleSaveAccount}
            disabled={saveStatus !== 'idle'}
            className={`w-full md:w-32 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 ${
              saveStatus === 'saved' 
              ? 'bg-[#30D158] text-white' 
              : 'bg-accent hover:opacity-90 text-white shadow-accent'
            }`}
          >
            {saveStatus === 'idle' ? 'Salvar' : saveStatus === 'saving' ? 'Salvando...' : 'Salvo!'}
          </button>
        </div>
      </section>

      {/* Appearance Section */}
      <section className="bg-white dark:bg-[#1C1C1E] p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 ml-1">Aparência</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setTheme('light')}
            className={`flex flex-col items-center p-5 rounded-2xl border-2 transition-all ${
              theme === 'light' 
              ? 'border-accent bg-accent/5' 
              : 'border-transparent bg-black/5 dark:bg-[#2C2C2E] hover:bg-black/10 dark:hover:bg-[#3C3C3E]'
            }`}
          >
            <span className="text-3xl mb-2">☀️</span>
            <span className={`text-sm font-semibold ${theme === 'light' ? 'text-accent' : 'dark:text-white'}`}>Claro</span>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`flex flex-col items-center p-5 rounded-2xl border-2 transition-all ${
              theme === 'dark' 
              ? 'border-accent bg-accent/5' 
              : 'border-transparent bg-black/5 dark:bg-[#2C2C2E] hover:bg-black/10 dark:hover:bg-[#3C3C3E]'
            }`}
          >
            <span className="text-3xl mb-2">🌙</span>
            <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-accent' : 'dark:text-white'}`}>Escuro</span>
          </button>
        </div>
      </section>

      {/* Customization Section */}
      <section className="bg-white dark:bg-[#1C1C1E] p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 ml-1">Personalização</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Cor de Destaque</label>
            <div className="flex flex-wrap gap-3">
              {accents.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => setAccentColor(acc.color)}
                  className={`w-10 h-10 rounded-full transition-all flex items-center justify-center relative ${
                    accentColor === acc.color ? 'ring-4 ring-offset-2 ring-accent scale-110 shadow-lg' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: acc.color }}
                  title={acc.name}
                >
                  {accentColor === acc.color && (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-medium text-gray-500 mb-2">Moeda Principal</label>
            <div className="flex flex-wrap gap-2">
              {['BRL', 'USD', 'EUR', 'GBP'].map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                    currency === curr 
                    ? 'bg-accent text-white border-transparent shadow-accent' 
                    : 'bg-black/5 dark:bg-[#2C2C2E] text-gray-500 border-transparent hover:bg-black/10 dark:hover:bg-[#3C3C3E]'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Account Management Section */}
      <section className="bg-white dark:bg-[#1C1C1E] p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 ml-1">Gerenciamento de Dados</h3>
        <div className="space-y-4">
          <div className="p-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-2xl">
            <h4 className="text-red-500 font-bold text-sm mb-1">Zona de Perigo</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
              Apagar todos os dados removerá permanentemente todas as suas receitas e despesas salvas neste dispositivo. Recomenda-se exportar seus dados antes.
            </p>
            <button
              onClick={onClearData}
              className="w-full bg-[#FF453A] hover:bg-[#FF3B30] text-white font-bold py-4 rounded-xl transition-colors active:scale-95 shadow-lg shadow-red-900/10"
            >
              Apagar Todas as Transações
            </button>
          </div>
        </div>
      </section>

      <div className="text-center text-xs text-gray-400 pt-4">
        Financ.ia v1.5.0 • Inteligência Pessoal
      </div>
    </div>
  );
};

export default Settings;
