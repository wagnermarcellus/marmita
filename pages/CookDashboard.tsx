import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mockService } from '../services/mockService';
import { Order, OrderStatus } from '../types';
import { Clock, CheckCircle, Truck, ChevronRight, Package, TrendingUp } from 'lucide-react';

const CookDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (user) {
        const data = await mockService.getOrders(user.id, user.role);
        setOrders(data);
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleStatusUpdate = async (e: React.MouseEvent, orderId: number, newStatus: OrderStatus) => {
    e.stopPropagation();
    await mockService.updateOrderStatus(orderId, newStatus);
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDENTE || o.status === OrderStatus.CONFIRMADO || o.status === OrderStatus.PREPARANDO);
  const completedOrders = orders.filter(o => o.status === OrderStatus.ENTREGA || o.status === OrderStatus.ENTREGUE || o.status === OrderStatus.CANCELADO);

  const OrderCard: React.FC<{ order: Order }> = ({ order }) => (
    <div 
      onClick={() => window.location.hash = `#/pedidos/${order.id}`}
      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="font-bold text-xl text-slate-800 dark:text-white group-hover:text-emerald-600 transition-colors">Pedido #{order.id}</h4>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{order.clientName}</p>
        </div>
        <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
          {order.status}
        </span>
      </div>
      
      <div className="space-y-3 mb-6">
        {order.items.map(item => (
          <div key={item.id} className="flex justify-between text-sm items-center">
            <span className="text-slate-600 dark:text-slate-400"><span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs mr-2">{item.quantity}x</span> {item.mealTitle}</span>
            <span className="text-slate-400 font-medium">R$ {(item.unitPrice * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      
      <div className="border-t border-slate-50 dark:border-slate-700 pt-4 flex justify-between font-bold text-slate-800 dark:text-white text-lg mb-4">
          <span>Total</span>
          <span>R$ {order.total.toFixed(2)}</span>
      </div>

      <div className="flex gap-2">
        {order.status === OrderStatus.PENDENTE && (
          <button 
            onClick={(e) => handleStatusUpdate(e, order.id, OrderStatus.CONFIRMADO)}
            className="flex-1 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 font-bold shadow-md shadow-green-500/20 transition"
          >
            Aceitar
          </button>
        )}
        {order.status === OrderStatus.CONFIRMADO && (
          <button 
            onClick={(e) => handleStatusUpdate(e, order.id, OrderStatus.PREPARANDO)}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-bold shadow-md shadow-blue-500/20 transition"
          >
            Cozinhar
          </button>
        )}
        {order.status === OrderStatus.PREPARANDO && (
          <button 
            onClick={(e) => handleStatusUpdate(e, order.id, OrderStatus.ENTREGA)}
            className="flex-1 bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 font-bold shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-2"
          >
            <Truck size={18} /> Enviar
          </button>
        )}
        {order.status === OrderStatus.ENTREGA && (
          <div className="w-full text-center text-sm text-purple-600 bg-purple-50 dark:bg-purple-900/20 py-3 rounded-xl font-medium">
             Aguardando cliente
          </div>
        )}
      </div>
    </div>
  );

  if (loading) return <div className="p-10 text-center text-slate-400">Carregando painel...</div>;

  return (
    <div className="grid lg:grid-cols-3 gap-8 pb-20">
      <div className="lg:col-span-2 space-y-8">
        <div>
            <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-800 dark:text-white mb-4">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg text-amber-600"><Clock size={24} /></div>
            Pedidos em Andamento
            </h2>
            <div className="grid md:grid-cols-2 gap-5">
            {pendingOrders.length === 0 ? (
                <div className="col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-10 text-center border border-slate-100 dark:border-slate-700">
                    <p className="text-slate-400">Sem pedidos ativos no momento.</p>
                </div>
            ) : pendingOrders.map(order => <OrderCard key={order.id} order={order} />)}
            </div>
        </div>

        <div>
            <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-800 dark:text-white mb-4 mt-10">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg text-emerald-600"><CheckCircle size={24} /></div>
            Histórico Recente
            </h2>
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            {completedOrders.map(order => (
                <div 
                key={order.id} 
                onClick={() => window.location.hash = `#/pedidos/${order.id}`}
                className="p-5 border-b border-slate-50 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex justify-between items-center transition"
                >
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.status === OrderStatus.ENTREGUE ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                        <Package size={20} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 dark:text-white">#{order.id}</span>
                            <span className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-wide ${order.status === OrderStatus.ENTREGUE ? 'text-green-600' : 'text-slate-500'}`}>
                            {order.status}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-700 dark:text-slate-300">R$ {order.total.toFixed(2)}</span>
                    <ChevronRight size={16} className="text-slate-300" />
                </div>
                </div>
            ))}
            </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <h3 className="text-emerald-100 font-medium mb-2 flex items-center gap-2"><TrendingUp size={18} /> Faturamento Hoje</h3>
          <p className="text-5xl font-bold tracking-tight">R$ {orders.filter(o => o.status !== OrderStatus.CANCELADO).reduce((acc, o) => acc + o.total, 0).toFixed(2)}</p>
          <div className="mt-8 pt-6 border-t border-white/20 grid grid-cols-2 gap-4">
            <div>
              <span className="block text-sm text-emerald-100 mb-1">Total Pedidos</span>
              <span className="text-2xl font-bold">{orders.length}</span>
            </div>
            <div>
              <span className="block text-sm text-emerald-100 mb-1">Ticket Médio</span>
              <span className="text-2xl font-bold">R$ {orders.length > 0 ? (orders.reduce((acc,o) => acc + o.total,0) / orders.length).toFixed(0) : '0'}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Avisos</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Mantenha seu cardápio atualizado e fotos atrativas para vender mais. Lembre-se de confirmar o status "Entrega" assim que o motoboy sair.</p>
        </div>
      </div>
    </div>
  );
};

export default CookDashboard;