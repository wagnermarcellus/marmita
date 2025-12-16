import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { ChefHat, User, ArrowRight, Lock, Mail, Github, Twitter, Linkedin, Facebook, Chrome } from 'lucide-react';

const Login = () => {
  const { login, register, loginWithSocial, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CLIENTE);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      if (isRegistering) {
          await register('', email, password, role);
      } else {
          await login(email, password);
      }
    }
  };

  const SocialButton = ({ icon: Icon, label, provider }: { icon: any, label: string, provider: string }) => (
    <button
      type="button"
      onClick={() => loginWithSocial(provider)}
      className="flex items-center justify-center gap-2 w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition text-sm font-medium text-slate-600 dark:text-slate-300"
    >
      <Icon size={18} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Blobs (Emerald Theme) */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-200 dark:bg-emerald-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-200 dark:bg-teal-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700"></div>

      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/50 dark:border-slate-700 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 animate-slide-up">
        <div className="p-8 text-center pb-4">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400 shadow-inner">
            <ChefHat size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Marmita<span className="text-emerald-600">Connect</span></h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">O sabor caseiro que conecta.</p>
        </div>

        <div className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 dark:bg-slate-700/50 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setRole(UserRole.CLIENTE)}
                className={`flex items-center justify-center p-2.5 rounded-lg transition-all duration-300 ${
                  role === UserRole.CLIENTE 
                    ? 'bg-white dark:bg-slate-600 shadow-sm text-emerald-600 dark:text-emerald-400 font-bold' 
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
                }`}
              >
                <User size={18} className="mr-2" />
                <span className="text-sm">Cliente</span>
              </button>

              <button
                type="button"
                onClick={() => setRole(UserRole.COZINHEIRO)}
                className={`flex items-center justify-center p-2.5 rounded-lg transition-all duration-300 ${
                  role === UserRole.COZINHEIRO
                    ? 'bg-white dark:bg-slate-600 shadow-sm text-emerald-600 dark:text-emerald-400 font-bold' 
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
                }`}
              >
                <ChefHat size={18} className="mr-2" />
                <span className="text-sm">Cozinheiro</span>
              </button>
            </div>

            <div className="space-y-4">
                <div className="relative">
                    <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input
                        type="email"
                        required
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-slate-700 dark:text-slate-200"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input
                        type="password"
                        required
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-slate-700 dark:text-slate-200"
                        placeholder="Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 flex items-center justify-center"
            >
              {loading ? (
                <span className="animate-pulse">Acessando...</span>
              ) : (
                <>
                  {isRegistering ? 'Criar Conta' : 'Entrar'} <ArrowRight size={20} className="ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-slate-800 text-slate-500">Ou continue com</span></div>
            </div>

            <div className="grid grid-cols-4 gap-2 mt-4">
                <SocialButton icon={Chrome} label="Google" provider="Google" />
                <SocialButton icon={Facebook} label="Facebook" provider="Facebook" />
                <SocialButton icon={Linkedin} label="LinkedIn" provider="LinkedIn" />
                <SocialButton icon={Twitter} label="X" provider="X" />
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-400 text-sm font-semibold hover:underline"
            >
              {isRegistering ? 'Já possui conta? Fazer Login' : 'Novo por aqui? Criar Conta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;