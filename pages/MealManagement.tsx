import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mockService } from '../services/mockService';
import { Meal } from '../types';
import { Plus, Trash2, Edit2, Eye, EyeOff, Image as ImageIcon, X } from 'lucide-react';

const MealManagement = () => {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMealId, setEditingMealId] = useState<number | null>(null);
  const [formMeal, setFormMeal] = useState<Partial<Meal>>({ title: '', description: '', price: 0 });
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (user) {
      mockService.getCookMeals(user.id).then(setMeals);
    }
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const get3DIconUrl = (title: string) => {
    // Determine a basic category fallback
    const t = title.toLowerCase();
    if (t.includes('burger')) return 'https://cdn3d.iconscout.com/3d/premium/thumb/burger-5583256-4666385.png';
    if (t.includes('pizza')) return 'https://cdn3d.iconscout.com/3d/premium/thumb/pizza-5583255-4666384.png';
    if (t.includes('salada') || t.includes('bowl')) return 'https://cdn3d.iconscout.com/3d/premium/thumb/salad-5583257-4666386.png';
    if (t.includes('doce') || t.includes('bolo')) return 'https://cdn3d.iconscout.com/3d/premium/thumb/cake-5583260-4666389.png';
    return 'https://cdn3d.iconscout.com/3d/premium/thumb/chef-hat-5583264-4666393.png'; // Fallback
  };

  const openEdit = (meal: Meal) => {
    setEditingMealId(meal.id);
    setFormMeal({ title: meal.title, description: meal.description, price: meal.price });
    setImagePreview(meal.imageUrl);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formMeal.title || !formMeal.price) return;

    // Use existing image, uploaded preview, or 3D icon
    const finalImage = imagePreview || get3DIconUrl(formMeal.title);

    if (editingMealId) {
       await mockService.updateMeal(editingMealId, {
           ...formMeal,
           imageUrl: finalImage
       });
       setMeals(meals.map(m => m.id === editingMealId ? { ...m, ...formMeal, imageUrl: finalImage } as Meal : m));
    } else {
        const created = await mockService.createMeal({
        cookId: user.id,
        title: formMeal.title!,
        description: formMeal.description || '',
        price: Number(formMeal.price),
        imageUrl: finalImage,
        available: true
        });
        setMeals([...meals, created]);
    }

    setIsFormOpen(false);
    setEditingMealId(null);
    setFormMeal({ title: '', description: '', price: 0 });
    setImagePreview('');
  };

  const toggleAvailability = async (id: number) => {
    await mockService.toggleMealAvailability(id);
    setMeals(meals.map(m => m.id === id ? { ...m, available: !m.available } : m));
  };

  const deleteMeal = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta refeição?')) {
      await mockService.deleteMeal(id);
      setMeals(meals.filter(m => m.id !== id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Meu Cardápio</h2>
          <p className="text-slate-500 dark:text-slate-400">Gerencie seus pratos.</p>
        </div>
        <button 
          onClick={() => {
              setEditingMealId(null);
              setFormMeal({ title: '', description: '', price: 0 });
              setImagePreview('');
              setIsFormOpen(true);
          }}
          className="bg-emerald-600 text-white px-5 py-3 rounded-xl hover:bg-emerald-700 flex items-center gap-2 transition shadow-lg shadow-emerald-500/20 font-medium"
        >
          <Plus size={20} /> Adicionar Prato
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 mb-10 animate-fade-in relative">
          <button onClick={() => setIsFormOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X /></button>
          <h3 className="font-bold text-xl mb-6 text-slate-800 dark:text-white">{editingMealId ? 'Editar Prato' : 'Novo Prato'}</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Image Upload */}
            <div className="flex justify-center">
              <div className="relative group cursor-pointer w-full md:w-1/2 aspect-video bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl flex flex-col items-center justify-center overflow-hidden hover:border-emerald-500 transition">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-4" />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="mx-auto text-slate-400 mb-2" size={32} />
                    <p className="text-sm text-slate-500">Clique para foto personalizada</p>
                    <p className="text-xs text-slate-400 mt-1">(Ícone 3D automático se vazio)</p>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nome do Prato</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none transition dark:text-white"
                  value={formMeal.title}
                  onChange={e => setFormMeal({...formMeal, title: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Preço (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none transition dark:text-white"
                  value={formMeal.price}
                  onChange={e => setFormMeal({...formMeal, price: Number(e.target.value)})}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Descrição</label>
              <textarea 
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none transition dark:text-white"
                rows={3}
                value={formMeal.description}
                onChange={e => setFormMeal({...formMeal, description: e.target.value})}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
              <button 
                type="button" 
                onClick={() => setIsFormOpen(false)}
                className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white px-6 py-2 font-medium"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="bg-emerald-600 text-white px-8 py-2 rounded-xl hover:bg-emerald-700 font-bold shadow-md"
              >
                Salvar Prato
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {meals.map(meal => (
          <div key={meal.id} className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 flex flex-col md:flex-row gap-6 items-center shadow-sm hover:shadow-md transition duration-300 ${!meal.available ? 'opacity-60 grayscale' : ''}`}>
            <img src={meal.imageUrl} alt={meal.title} className="w-full md:w-32 h-32 rounded-xl object-contain bg-slate-50 dark:bg-slate-900" />
            <div className="flex-grow text-center md:text-left">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">{meal.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">{meal.description}</p>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">R$ {meal.price.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => openEdit(meal)}
                className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
                title="Editar"
              >
                <Edit2 size={20} />
              </button>
              <button 
                onClick={() => toggleAvailability(meal.id)}
                className={`p-3 rounded-xl transition ${meal.available ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-300'}`}
                title={meal.available ? 'Disponível' : 'Indisponível'}
              >
                {meal.available ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
              <button 
                onClick={() => deleteMeal(meal.id)}
                className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition"
                title="Excluir"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MealManagement;