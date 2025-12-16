import React, { useEffect, useState } from 'react';
import { mockService } from '../services/mockService';
import { Meal } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingBag, Plus, Minus, X, Search, Filter, CreditCard, Banknote, QrCode } from 'lucide-react';

const BrowseMeals = () => {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [cart, setCart] = useState<{meal: Meal, qty: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      const data = await mockService.getMeals();
      setMeals(data.filter(m => m.available));
      setLoading(false);
    };
    load();
  }, []);

  const addToCart = (meal: Meal) => {
    setCart(prev => {
      const existing = prev.find(item => item.meal.id === meal.id);
      if (existing) {
        return prev.map(item => item.meal.id === meal.id ? {...item, qty: item.qty + 1} : item);
      }
      if (prev.length > 0 && prev[0].meal.cookId !== meal.cookId) {
        if(!confirm('Você só pode pedir de um cozinheiro por vez. Deseja limpar o carrinho atual?')) {
          return prev;
        }
        return [{meal, qty: 1}];
      }
      return [...prev, {meal, qty: 1}];
    });
    setCartOpen(true);
  };

  const updateQty = (mealId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.meal.id === mealId) {
        return { ...item, qty: Math.max(0, item.qty + delta) };
      }
      return item;
    }).filter(item => item.qty > 0));
  };

  const handleCheckout = async () => {
    if (!user || cart.length === 0) return;
    if (!selectedPayment) return alert('Selecione uma forma de pagamento');

    try {
      const cookId = cart[0].meal.cookId;
      await mockService.createOrder(user.id, cookId, cart, selectedPayment);
      alert('Pedido realizado com sucesso!');
      setCart([]);
      setCartOpen(false);
      window.location.hash = '/';
    } catch (e) {
      alert('Erro ao processar pedido');
    }
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.meal.price * item.qty), 0);

  if (loading) return <div className="p-8 text-center text-slate-400">Preparando o cardápio...</div>;

  return (
    <div className="relative pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
        <div>
           <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Explorar Sabores</h2>
           <p className="text-slate-500 dark:text-slate-400 mt-1">Comida de verdade, feita por vizinhos.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
             <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                <input type="text" placeholder="Buscar pratos..." className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm dark:text-white" />
             </div>
             <button className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-emerald-500 hover:text-emerald-600 transition">
                <Filter size={20} />
             </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meals.map((meal, idx) => (
          <div key={meal.id} className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden group animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
            <div className="h-52 overflow-hidden relative bg-slate-100 dark:bg-slate-900">
              <img src={meal.imageUrl} alt={meal.title} className="w-full h-full object-contain p-4 transform group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute top-4 left-4">
                 <button 
                  onClick={() => window.location.hash = `#/cozinheiros/${meal.cookId}`}
                  className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider hover:bg-emerald-600 hover:text-white transition shadow-sm"
                >
                  {meal.cookName}
                </button>
              </div>
            </div>
            <div className="p-5 flex-grow flex flex-col">
              <div className="flex justify-between items-start mb-2">
                 <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">{meal.title}</h3>
                 <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">R$ {meal.price.toFixed(0)}</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 flex-grow line-clamp-2 leading-relaxed">{meal.description}</p>
              <div className="flex items-center justify-between mt-auto">
                 <span className="text-sm text-slate-400 font-medium">{meal.price.toFixed(2)}</span>
                <button 
                  onClick={() => addToCart(meal)}
                  className="bg-emerald-600 text-white p-3 rounded-2xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/30 active:scale-95"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Sidebar / Modal - Higher Z-Index to cover bottom nav */}
      {cart.length > 0 && cartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCartOpen(false)}></div>
          <div className="bg-white dark:bg-slate-800 w-full max-w-md h-full shadow-2xl relative flex flex-col animate-slide-up">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800">
              <h3 className="font-bold text-xl flex items-center gap-2 text-slate-800 dark:text-white">
                <ShoppingBag className="text-emerald-600" /> Seu Pedido
              </h3>
              <button onClick={() => setCartOpen(false)} className="text-slate-400 hover:text-slate-800 dark:hover:text-white transition">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {cart.map(item => (
                <div key={item.meal.id} className="flex items-center justify-between">
                  <div className="flex gap-4">
                     <img src={item.meal.imageUrl} className="w-16 h-16 rounded-xl object-contain bg-slate-100 dark:bg-slate-900" />
                     <div>
                        <h4 className="font-bold text-slate-800 dark:text-white">{item.meal.title}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">R$ {item.meal.price.toFixed(2)}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 rounded-xl p-1">
                    <button onClick={() => updateQty(item.meal.id, -1)} className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition shadow-sm">
                      <Minus size={16} />
                    </button>
                    <span className="font-bold w-4 text-center text-sm dark:text-white">{item.qty}</span>
                    <button onClick={() => updateQty(item.meal.id, 1)} className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition shadow-sm">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 space-y-6">
              {/* Payment Selector */}
              <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Forma de Pagamento</label>
                  <div className="space-y-2">
                     <label className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-emerald-500 transition">
                         <input type="radio" name="payment" value="Pix" onChange={e => setSelectedPayment(e.target.value)} />
                         <QrCode size={20} className="text-slate-500" />
                         <span className="dark:text-white">PIX</span>
                     </label>
                     <label className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-emerald-500 transition">
                         <input type="radio" name="payment" value="Cartão de Crédito" onChange={e => setSelectedPayment(e.target.value)} />
                         <CreditCard size={20} className="text-slate-500" />
                         <span className="dark:text-white">Cartão de Crédito</span>
                     </label>
                     <label className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-emerald-500 transition">
                         <input type="radio" name="payment" value="Cartão de Débito" onChange={e => setSelectedPayment(e.target.value)} />
                         <CreditCard size={20} className="text-slate-500" />
                         <span className="dark:text-white">Cartão de Débito</span>
                     </label>
                      <label className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-emerald-500 transition">
                         <input type="radio" name="payment" value="Dinheiro" onChange={e => setSelectedPayment(e.target.value)} />
                         <Banknote size={20} className="text-slate-500" />
                         <span className="dark:text-white">Dinheiro</span>
                     </label>
                  </div>
              </div>

              <div className="flex justify-between text-2xl font-bold text-slate-800 dark:text-white">
                <span>Total</span>
                <span>R$ {cartTotal.toFixed(2)}</span>
              </div>
              <button 
                onClick={handleCheckout}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/30 transform active:scale-[0.98]"
              >
                Confirmar Pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Cart Button */}
      {!cartOpen && cart.length > 0 && (
        <button 
          onClick={() => setCartOpen(true)}
          className="fixed bottom-24 right-6 bg-slate-900 dark:bg-white dark:text-slate-900 text-white p-4 pr-6 rounded-full shadow-2xl hover:scale-105 transition z-[90] flex items-center gap-3 group"
        >
          <div className="bg-emerald-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
            {cart.reduce((a,b)=>a+b.qty,0)}
          </div>
          <span className="font-bold group-hover:text-emerald-400 transition-colors">Ver Sacola</span>
        </button>
      )}
    </div>
  );
};

export default BrowseMeals;