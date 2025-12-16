import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mockService } from '../services/mockService';
import { Order, OrderStatus } from '../types';
import { Clock, CheckCircle, XCircle, Truck, Utensils, ChevronRight, Package } from 'lucide-react';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        const data = await mockService.getOrders(user.id, user.role);
        setOrders(data);
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDENTE: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case OrderStatus.PREPARANDO: return 'bg-blue-100 text-blue-700 border-blue-200';
      case OrderStatus.ENTREGA: return 'bg-purple-100 text-purple-700 border-purple-200';
      case OrderStatus.ENTREGUE: return 'bg-green-100 text-green-700 border-green-200';
      case OrderStatus.CANCELADO: return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.ENTREGA: return <Truck size={16} />;
      case OrderStatus.ENTREGUE: return <CheckCircle size={16} />;
      case OrderStatus.CANCELADO: return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Sincronizando pedidos...</div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Olá, {user?.name.split(' ')[0]} 👋</h2>
          <p className="text-slate-500 dark:text-slate-400">Acompanhe suas refeições.</p>
        </div>
        <button 
          onClick={() => window.location.hash = '#/refeicoes'}
          className="bg-emerald-600 text-white px-6 py-3 rounded-2xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20 font-medium flex items-center gap-2"
        >
          <Utensils size={20} /> Nova Marmita
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white/80 dark:bg-slate-800 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-3xl p-12 text-center">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <Package size={40} />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Sem pedidos recentes</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Explore o cardápio e peça algo delicioso.</p>
          <button onClick={() => window.location.hash = '#/refeicoes'} className="text-emerald-600 font-medium hover:underline">Ver Cardápio</button>
        </div>
      ) : (
        <div className="grid gap-5">
          {orders.map((order, idx) => (
            <div 
              key={order.id} 
              onClick={() => window.location.hash = `#/pedidos/${order.id}`}
              className="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 cursor-pointer animate-slide-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 shrink-0">
                  <Package size={32} />
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-emerald-600 transition-colors">Pedido #{order.id}</span>
                    <span className="text-sm text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                    Cozinheiro: <span className="font-medium text-slate-700 dark:text-slate-300">{order.cookName}</span>
                  </p>
                  <div className="text-slate-600 dark:text-slate-400 text-sm bg-slate-50 dark:bg-slate-900 inline-block px-3 py-1 rounded-lg">
                    {order.items.length} itens &bull; R$ {order.total.toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-700">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="capitalize">{order.status}</span>
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:text-emerald-500 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;