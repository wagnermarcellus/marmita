import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import ClientDashboard from './pages/ClientDashboard';
import CookDashboard from './pages/CookDashboard';
import BrowseMeals from './pages/BrowseMeals';
import MealManagement from './pages/MealManagement';
import OrderDetails from './pages/OrderDetails';
import CookProfile from './pages/CookProfile';
import Settings from './pages/Settings';
import CookWallet from './pages/CookWallet';
import { UserRole } from './types';
import { MapPin } from 'lucide-react';

const AddressModal = ({ onSave }: { onSave: (addr: string) => void }) => {
    const [addr, setAddr] = useState('');
    return (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-slide-up">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                    <MapPin size={32} />
                </div>
                <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-2">Onde você está?</h2>
                <p className="text-center text-slate-500 mb-6">Para continuar, precisamos do seu endereço para entregas ou retiradas.</p>
                <input 
                    type="text" 
                    placeholder="Rua, Número, Bairro, Cidade" 
                    className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 mb-4 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                    value={addr}
                    onChange={e => setAddr(e.target.value)}
                />
                <button 
                    onClick={() => { if(addr) onSave(addr); }}
                    className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition"
                    disabled={!addr}
                >
                    Confirmar Endereço
                </button>
            </div>
        </div>
    );
}

const AppContent = () => {
  const { user, updateProfile } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setCurrentPath(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleAddressSave = async (address: string) => {
      await updateProfile({ address });
  };

  if (!user) {
    return <Login />;
  }

  // Mandatory Address Check
  if (!user.address) {
      return <AddressModal onSave={handleAddressSave} />;
  }

  const renderPage = () => {
    // Shared Routes
    if (currentPath === '#/configuracoes') return <Settings />;

    const orderMatch = currentPath.match(/#\/pedidos\/(\d+)/);
    if (orderMatch) return <OrderDetails orderId={orderMatch[1]} />;

    const cookMatch = currentPath.match(/#\/cozinheiros\/(\d+)/);
    if (cookMatch) return <CookProfile cookId={cookMatch[1]} />;

    // Role-based Routing
    if (user.role === UserRole.CLIENTE) {
      switch (currentPath) {
        case '#/refeicoes': return <BrowseMeals />;
        case '#/':
        case '': return <ClientDashboard />;
        default: return <ClientDashboard />;
      }
    } else {
      // Cozinheiro
      switch (currentPath) {
        case '#/minhas-refeicoes': return <MealManagement />;
        case '#/carteira': return <CookWallet />;
        case '#/':
        case '': return <CookDashboard />;
        default: return <CookDashboard />;
      }
    }
  };

  return (
    <Layout>
      {renderPage()}
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}