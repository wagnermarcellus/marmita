import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, Notification } from '../types';
import { LogOut, Utensils, ClipboardList, ChefHat, Bell, Settings, Moon, Sun, DollarSign } from 'lucide-react';
import { mockService } from '../services/mockService';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifs = async () => {
      if (user) {
        const data = await mockService.getNotifications(user.id);
        setNotifications(data);
      }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigateTo = (path: string) => {
    window.location.hash = path;
  };

  const handleNotifClick = async (n: Notification) => {
    await mockService.markNotificationRead(n.id);
    setNotifications(notifications.map(item => item.id === n.id ? {...item, read: true} : item));
    if (n.link) navigateTo(n.link);
    setNotifOpen(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
      {/* Top Header - Logo, Theme, Profile */}
      <header className="glass sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div 
            className="flex items-center space-x-2 cursor-pointer group"
            onClick={() => navigateTo('/')}
          >
            <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-500 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
              <ChefHat size={22} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-white">Marmita<span className="text-emerald-600 dark:text-emerald-500">Connect</span></span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 transition">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-fade-in z-50">
                  <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
                    <span className="font-bold text-sm">Notificações</span>
                    {unreadCount > 0 && <span className="text-xs bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">{unreadCount} novas</span>}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-sm text-slate-400">Nenhuma notificação.</p>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => handleNotifClick(n)}
                          className={`p-3 border-b border-slate-50 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition ${!n.read ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''}`}
                        >
                          <p className={`text-sm ${!n.read ? 'font-semibold text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}>{n.text}</p>
                          <span className="text-xs text-slate-400 mt-1 block">{new Date(n.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="flex items-center space-x-2 border-l border-slate-200 dark:border-slate-700 pl-3">
               <img 
                src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}&background=10b981&color=fff`} 
                alt="Profile" 
                className="w-9 h-9 rounded-full border border-white dark:border-slate-600 shadow-sm cursor-pointer object-cover"
                onClick={() => navigateTo('/configuracoes')}
              />
              <button 
                onClick={logout} 
                className="hidden md:block p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Sair"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6 pb-24 animate-fade-in">
        {children}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 w-full bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 pb-safe z-30 flex justify-around items-center py-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {user?.role === UserRole.CLIENTE ? (
          <>
            <button onClick={() => navigateTo('/refeicoes')} className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 active:scale-95 transition">
              <Utensils size={24} />
              <span className="text-[10px] font-medium">Pedir</span>
            </button>
            <button onClick={() => navigateTo('/')} className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 active:scale-95 transition">
              <ClipboardList size={24} />
              <span className="text-[10px] font-medium">Pedidos</span>
            </button>
          </>
        ) : (
           <>
            <button onClick={() => navigateTo('/')} className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 active:scale-95 transition">
              <ClipboardList size={24} />
              <span className="text-[10px] font-medium">Pedidos</span>
            </button>
            <button onClick={() => navigateTo('/minhas-refeicoes')} className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 active:scale-95 transition">
              <Utensils size={24} />
              <span className="text-[10px] font-medium">Cardápio</span>
            </button>
             <button onClick={() => navigateTo('/carteira')} className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 active:scale-95 transition">
              <DollarSign size={24} />
              <span className="text-[10px] font-medium">Carteira</span>
            </button>
          </>
        )}
         <button onClick={() => navigateTo('/configuracoes')} className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 active:scale-95 transition">
            <Settings size={24} />
            <span className="text-[10px] font-medium">Ajustes</span>
          </button>
      </nav>
    </div>
  );
};

export default Layout;