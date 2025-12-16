import React, { useEffect, useState, useRef } from 'react';
import { mockService } from '../services/mockService';
import { useAuth } from '../contexts/AuthContext';
import { Order, OrderStatus, Message, UserRole } from '../types';
import { Send, Clock, ChevronLeft, CheckCircle, Truck, Info } from 'lucide-react';

interface Props {
  orderId: string;
}

const OrderDetails: React.FC<Props> = ({ orderId }) => {
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const id = Number(orderId);

  useEffect(() => {
    const loadData = async () => {
      const orderData = await mockService.getOrderById(id);
      if (orderData) {
        setOrder(orderData);
        const msgs = await mockService.getMessages(id);
        setMessages(msgs);
      }
    };
    loadData();

    // Simulate polling
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const sent = await mockService.sendMessage(id, user.id, newMessage);
    setMessages([...messages, sent]);
    setNewMessage('');
  };

  const confirmDelivery = async () => {
    if (!order) return;
    if (confirm('Você confirma que recebeu o pedido?')) {
        await mockService.updateOrderStatus(order.id, OrderStatus.ENTREGUE);
        setOrder({...order, status: OrderStatus.ENTREGUE});
    }
  };

  const goBack = () => {
    window.location.hash = '#/';
  };

  if (!order || !user) return <div className="p-10 text-center text-slate-400">Carregando detalhes...</div>;

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-[calc(100vh-140px)] md:flex-row gap-6 pb-20 md:pb-0">
      
      {/* Back Button Mobile */}
      <button onClick={goBack} className="md:hidden flex items-center text-slate-500 hover:text-emerald-600 mb-2">
         <ChevronLeft size={20} /> Voltar
      </button>

      {/* Left Column: Order Info (Top on Mobile) */}
      <div className="flex-none md:flex-1 flex flex-col gap-4">
        <button onClick={goBack} className="hidden md:flex items-center text-slate-500 hover:text-emerald-600 w-fit transition">
          <ChevronLeft size={20} /> Voltar para pedidos
        </button>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Pedido #{order.id}</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        {user.role === UserRole.CLIENTE ? `Cozinheiro: ${order.cookName}` : `Cliente: ${order.clientName}`}
                    </p>
                </div>
                <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                        ${order.status === OrderStatus.ENTREGUE ? 'bg-green-100 text-green-800' : 'bg-emerald-100 text-emerald-800'}
                    `}>
                        {order.status}
                    </span>
                    <p className="font-bold text-lg text-slate-800 dark:text-white mt-1">R$ {order.total.toFixed(2)}</p>
                </div>
            </div>

            {/* Action for Delivery */}
            {user.role === UserRole.CLIENTE && order.status === OrderStatus.ENTREGA && (
                <button 
                onClick={confirmDelivery}
                className="w-full mb-4 animate-pulse bg-green-600 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-green-500/30 hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                <CheckCircle size={20} /> Confirmar Recebimento
                </button>
            )}

            {/* Simple Status Bar */}
            <div className="flex items-center justify-between text-xs text-slate-400 mb-4 bg-slate-50 dark:bg-slate-900 rounded-xl p-3">
                <div className={`flex items-center gap-1 ${[OrderStatus.PENDENTE, OrderStatus.CONFIRMADO, OrderStatus.PREPARANDO, OrderStatus.ENTREGA, OrderStatus.ENTREGUE].includes(order.status) ? 'text-emerald-600 font-bold' : ''}`}>
                    1. Confirmado
                </div>
                <div className={`flex items-center gap-1 ${[OrderStatus.PREPARANDO, OrderStatus.ENTREGA, OrderStatus.ENTREGUE].includes(order.status) ? 'text-emerald-600 font-bold' : ''}`}>
                    2. Preparo
                </div>
                <div className={`flex items-center gap-1 ${[OrderStatus.ENTREGA, OrderStatus.ENTREGUE].includes(order.status) ? 'text-emerald-600 font-bold' : ''}`}>
                    3. Entrega
                </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                 <details>
                     <summary className="cursor-pointer text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">Ver Itens do Pedido <Info size={14}/></summary>
                     <div className="mt-2 space-y-2 pl-4">
                        {order.items.map(item => (
                            <div key={item.id} className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                                <span>{item.quantity}x {item.mealTitle}</span>
                                <span>R$ {(item.quantity * item.unitPrice).toFixed(2)}</span>
                            </div>
                        ))}
                     </div>
                 </details>
            </div>
        </div>
      </div>

      {/* Right Column: Chat (Flex Grow to fill remaining space) */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden min-h-[400px]">
        <div className="p-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 z-10">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm">
            Chat com {user.role === UserRole.CLIENTE ? 'Cozinheiro' : 'Cliente'}
          </h3>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-900/50 custom-scrollbar">
          {messages.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
                <p>Inicie a conversa</p>
             </div>
          )}
          {messages.map(msg => {
            const isMe = msg.senderId === user.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${isMe ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-700 dark:text-white text-slate-700 rounded-bl-none border border-slate-100 dark:border-slate-600'}`}>
                  {!isMe && <p className="text-[10px] font-bold opacity-60 mb-1 uppercase tracking-wide">{msg.senderName}</p>}
                  <p className="leading-relaxed">{msg.text}</p>
                  <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex gap-2">
          <input
            type="text"
            className="flex-grow bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition text-slate-800 dark:text-white placeholder-slate-400"
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button 
            type="submit"
            className="bg-emerald-600 text-white w-10 h-10 rounded-full hover:bg-emerald-700 transition flex-shrink-0 flex items-center justify-center shadow-lg shadow-emerald-500/20"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrderDetails;