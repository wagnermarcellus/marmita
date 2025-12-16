import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Camera, Save, ChevronLeft, MapPin, CreditCard, Plus, Trash2 } from 'lucide-react';
import { mockService } from '../services/mockService';
import { PaymentMethod, UserRole } from '../types';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [address, setAddress] = useState(user?.address || '');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '');
  const [loading, setLoading] = useState(false);
  
  // Payment Method State
  const [newCard, setNewCard] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await updateProfile({
        name,
        address,
        avatarUrl: avatarPreview
      });
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      alert('Erro ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  const addPaymentMethod = async () => {
      if (!newCard || newCard.length < 4) return;
      const method: PaymentMethod = {
          id: 0,
          type: 'credit_card',
          label: `Cartão final ${newCard.slice(-4)}`,
          last4: newCard.slice(-4),
          brand: 'generic'
      };
      await mockService.addPaymentMethod(user!.id, method);
      setNewCard('');
      await updateProfile({}); 
  };

  const goBack = () => {
      window.location.hash = '#/';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
       <button onClick={goBack} className="flex items-center text-slate-400 hover:text-emerald-600 mb-6 transition">
          <ChevronLeft size={20} /> Voltar
        </button>
        
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 p-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Configurações de Perfil</h2>
        
        <form onSubmit={handleSave} className="space-y-8">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-700 shadow-inner bg-slate-50">
                <img 
                  src={avatarPreview || `https://ui-avatars.com/api/?name=${name}`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={32} />
              </div>
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            <p className="text-sm text-slate-400">Clique para alterar sua foto</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nome Completo</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none transition dark:text-white"
              />
            </div>
             <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2"><MapPin size={16}/> Endereço (Obrigatório)</label>
              <input 
                type="text" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua, Número, Bairro"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none transition dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email</label>
              <input 
                type="email" 
                value={user?.email}
                disabled
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-70"
            >
              <Save size={20} /> {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>

      {user?.role === UserRole.CLIENTE && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 p-8">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <CreditCard /> Métodos de Pagamento
            </h2>
            
            <div className="space-y-4 mb-6">
                {user.paymentMethods?.map(pm => (
                    <div key={pm.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{pm.label}</span>
                        <Trash2 className="text-slate-400 hover:text-red-500 cursor-pointer" size={18} />
                    </div>
                ))}
            </div>

            <div className="flex gap-2">
                <input 
                    type="text" 
                    placeholder="Número do Cartão (Simulação)" 
                    className="flex-grow px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                    value={newCard}
                    onChange={e => setNewCard(e.target.value)}
                />
                <button onClick={addPaymentMethod} className="bg-slate-800 text-white p-3 rounded-xl hover:bg-slate-700">
                    <Plus />
                </button>
            </div>
          </div>
      )}
    </div>
  );
};

export default Settings;