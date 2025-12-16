import React, { useEffect, useState } from 'react';
import { mockService } from '../services/mockService';
import { User, Meal, Review } from '../types';
import { ChevronLeft, Star, Utensils, Award, ChefHat } from 'lucide-react';

interface Props {
  cookId: string;
}

const CookProfile: React.FC<Props> = ({ cookId }) => {
  const [cook, setCook] = useState<User | undefined>(undefined);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const id = Number(cookId);

  useEffect(() => {
    const loadData = async () => {
      const [cookData, mealsData, reviewsData] = await Promise.all([
        mockService.getCookById(id),
        mockService.getCookMeals(id),
        mockService.getCookReviews(id)
      ]);
      setCook(cookData);
      setMeals(mealsData.filter(m => m.available));
      setReviews(reviewsData);
      setLoading(false);
    };
    loadData();
  }, [id]);

  const goBack = () => {
     window.location.hash = '#/refeicoes';
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Carregando perfil...</div>;
  if (!cook) return <div className="p-8 text-center text-slate-400">Cozinheiro não encontrado.</div>;

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : 'Novo';

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
      <button 
        onClick={goBack} 
        className="flex items-center text-slate-400 hover:text-emerald-600 mb-4 transition"
      >
        <ChevronLeft size={20} /> Voltar
      </button>

      {/* Header Profile */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 p-8 flex flex-col md:flex-row items-center gap-8 text-center md:text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 dark:bg-emerald-900 rounded-full -mr-16 -mt-16 opacity-50 blur-3xl"></div>
        
        <div className="relative">
             <div className="w-32 h-32 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-500 border-4 border-white dark:border-slate-700 shadow-lg overflow-hidden">
                 {cook.avatarUrl ? <img src={cook.avatarUrl} className="w-full h-full object-cover" /> : <ChefHat size={48} />}
            </div>
            <div className="absolute bottom-0 right-0 bg-white dark:bg-slate-700 p-2 rounded-full shadow-md text-emerald-600 dark:text-emerald-400">
                <Award size={20} />
            </div>
        </div>
        
        <div className="flex-grow z-10">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white tracking-tight">{cook.name}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-lg">Cozinhando com paixão e ingredientes frescos para levar saúde até você.</p>
          
          <div className="flex items-center justify-center md:justify-start gap-6 mt-6">
            <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 rounded-xl border border-yellow-100 dark:border-yellow-900">
              <Star className="text-yellow-400 fill-yellow-400" size={20} />
              <span className="font-bold text-lg text-slate-800 dark:text-white">{averageRating}</span>
              <span className="text-sm text-slate-400">({reviews.length} avaliações)</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 font-medium">
              <Utensils size={18} />
              <span className="text-sm">{meals.length} Pratos</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Menu Section */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Cardápio do Chef</h2>
          {meals.length === 0 ? (
            <p className="text-slate-400 italic">Nenhum prato disponível no momento.</p>
          ) : (
            <div className="grid gap-4">
              {meals.map(meal => (
                <div key={meal.id} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 flex gap-5 hover:shadow-lg transition-all duration-300 group">
                  <img src={meal.imageUrl} alt={meal.title} className="w-24 h-24 rounded-xl object-cover bg-slate-100 dark:bg-slate-900 shadow-sm group-hover:scale-105 transition-transform" />
                  <div className="flex-grow flex flex-col justify-center">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-emerald-600 transition-colors">{meal.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{meal.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 px-3 py-1 rounded-lg">R$ {meal.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">O que dizem</h2>
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar shadow-sm">
            {reviews.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">Nenhuma avaliação ainda.</p>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="border-b border-slate-50 dark:border-slate-700 last:border-0 pb-4 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{review.authorName}</span>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm italic leading-relaxed">"{review.comment}"</p>
                  <span className="text-xs text-slate-300 dark:text-slate-500 mt-2 block">
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookProfile;