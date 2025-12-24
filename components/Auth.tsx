
import React, { useState } from 'react';
import { Logo, User } from '../App';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [stayConnected, setStayConnected] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simular atraso de rede
    setTimeout(() => {
      const users: User[] = JSON.parse(localStorage.getItem('financia_users') || '[]');

      if (isRegistering) {
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
          setError('Este e-mail já está em uso.');
          setIsLoading(false);
          return;
        }

        const newUser: User = {
          id: crypto.randomUUID(),
          name,
          email: email.toLowerCase(),
          password // Em um app real, nunca salve senha pura
        };

        users.push(newUser);
        localStorage.setItem('financia_users', JSON.stringify(users));
        
        // Gerenciar sessão
        if (stayConnected) {
          localStorage.setItem('financia_session', newUser.email);
        } else {
          sessionStorage.setItem('financia_session', newUser.email);
        }

        onLogin(newUser);
      } else {
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (user) {
          // Gerenciar sessão
          if (stayConnected) {
            localStorage.setItem('financia_session', user.email);
          } else {
            sessionStorage.setItem('financia_session', user.email);
          }
          onLogin(user);
        } else {
          setError('E-mail ou senha incorretos.');
        }
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 overflow-hidden relative">
      {/* Círculos de luz decorativos */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-10">
          <Logo className="w-20 h-20 mb-6 scale-110" />
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Financ.ia</h1>
          <p className="text-gray-500 font-medium">Sua contabilidade inteligente</p>
        </div>

        <div className="bg-[#1C1C1E]/60 backdrop-blur-2xl border border-white/10 p-8 rounded-[40px] shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            {isRegistering ? 'Criar nova conta' : 'Acesse sua conta'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegistering && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-semibold text-gray-500 mb-2 ml-1 uppercase tracking-wider">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full bg-white/5 border border-white/5 text-white rounded-2xl px-5 py-4 focus:ring-2 focus:ring-accent outline-none transition-all placeholder-gray-600"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 ml-1 uppercase tracking-wider">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-white/5 border border-white/5 text-white rounded-2xl px-5 py-4 focus:ring-2 focus:ring-accent outline-none transition-all placeholder-gray-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 ml-1 uppercase tracking-wider">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/5 text-white rounded-2xl px-5 py-4 focus:ring-2 focus:ring-accent outline-none transition-all placeholder-gray-600"
              />
            </div>

            <div className="flex items-center space-x-3 px-1">
              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={stayConnected}
                    onChange={(e) => setStayConnected(e.target.checked)}
                  />
                  {/* Cor alterada para verde (#34C759) ao selecionar */}
                  <div className={`w-10 h-6 rounded-full transition-colors ${stayConnected ? 'bg-[#34C759]' : 'bg-white/10'}`}></div>
                  <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${stayConnected ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
                <span className="ml-3 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Manter conectado</span>
              </label>
            </div>

            {error && (
              <p className="text-[#FF453A] text-sm font-semibold bg-red-500/10 p-4 rounded-2xl border border-red-500/20 animate-shake">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent text-white font-bold py-4 rounded-2xl shadow-accent hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 mt-4 flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                isRegistering ? 'Criar Conta' : 'Entrar'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
            >
              {isRegistering 
                ? 'Já possui uma conta? Entre aqui' 
                : 'Não tem uma conta? Registre-se agora'}
            </button>
          </div>
        </div>
        
        <p className="text-center text-gray-600 text-xs mt-8">
          &copy; 2025 Financ.ia • Sua privacidade é nossa prioridade
        </p>
      </div>
    </div>
  );
};

export default Auth;
