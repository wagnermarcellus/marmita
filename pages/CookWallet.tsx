import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mockService } from '../services/mockService';
import { WalletTransaction } from '../types';
import { Wallet, TrendingUp, ArrowDownCircle, History, ChevronLeft } from 'lucide-react';

const CookWallet = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [balance, setBalance] = useState(user?.balance || 0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (user) {
        setBalance(user.balance || 0); // In real app, fetch fresh balance
        const txs = await mockService.getWalletTransactions(user.id);
        setTransactions(txs);
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleWithdraw = async () => {
    if (balance <= 0) return alert('Sem saldo disponível.');
    const amount = Number(prompt('Valor para saque:', balance.toString()));
    if (!amount || amount <= 0 || amount > balance) return alert('Valor inválido');

    try {
        await mockService.requestWithdrawal(user!.id, amount);
        setBalance(prev => prev - amount);
        alert('Saque solicitado com sucesso!');
        // Refresh transactions
        const txs = await mockService.getWalletTransactions(user!.id);
        setTransactions(txs);
    } catch (e) {
        alert('Erro ao sacar');
    }
  };

  const goBack = () => {
      window.location.hash = '#/';
  };

  if (loading) return <div className="text-center p-8 text-slate-400">Carregando carteira...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={goBack} className="md:hidden text-slate-500 hover:text-emerald-600">
            <ChevronLeft />
        </button>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Wallet className="text-emerald-600" /> Minha Carteira
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-8 text-white shadow-xl">
           <p className="text-emerald-100 mb-1">Saldo Disponível</p>
           <h3 className="text-4xl font-bold mb-6">R$ {balance.toFixed(2)}</h3>
           <button 
             onClick={handleWithdraw}
             className="bg-white text-emerald-800 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-50 transition w-full md:w-auto"
           >
             Solicitar Saque
           </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
           <div>
              <p className="text-slate-500 dark:text-slate-400 mb-1">Total Recebido</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">R$ {transactions.filter(t => t.type === 'deposit').reduce((a, b) => a + b.amount, 0).toFixed(2)}</h3>
           </div>
           <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-full text-emerald-600 dark:text-emerald-400">
               <TrendingUp size={32} />
           </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <History size={20} /> Histórico
        </h3>
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            {transactions.length === 0 ? (
                <p className="p-6 text-center text-slate-400">Nenhuma transação.</p>
            ) : (
                transactions.map(tx => (
                    <div key={tx.id} className="p-5 border-b border-slate-50 dark:border-slate-700 last:border-0 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${tx.type === 'deposit' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600'}`}>
                                {tx.type === 'deposit' ? <TrendingUp size={20} /> : <ArrowDownCircle size={20} />}
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 dark:text-white">{tx.description}</p>
                                <p className="text-xs text-slate-400">{new Date(tx.date).toLocaleDateString()} - <span className="capitalize">{tx.status}</span></p>
                            </div>
                        </div>
                        <span className={`font-bold ${tx.type === 'deposit' ? 'text-green-600' : 'text-slate-800 dark:text-slate-300'}`}>
                            {tx.type === 'deposit' ? '+' : '-'} R$ {tx.amount.toFixed(2)}
                        </span>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};

export default CookWallet;