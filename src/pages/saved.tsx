import { ArrowLeft, Bookmark, Clock, Store } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/i18n';
import { useFavorites } from '@/lib/useFavorites';

export default function SavedPage() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { savedIds, toggleFavorite, isLoading: favLoading } = useFavorites();

  // 🌟 YECHIM 1: String ID'larni Number formatiga o'tkazish (Supabase xatosini oldini olish)
  const validIds = Array.isArray(savedIds) 
    ? savedIds.map(id => Number(id)).filter(id => !isNaN(id))
    : [];

  const { data: savedOffers, isLoading: isOffersLoading } = useQuery({
    // 🌟 YECHIM 2: Keshni avtomatik tozalash uchun queryKey ga validIds qo'shildi
    queryKey: ['savedDiscounts', validIds],
    queryFn: async () => {
      if (validIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('discounts')
        .select(`*, merchant:merchants(name, logo_url, category)`)
        .in('id', validIds)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Saqlanganlarni yuklashda xato:", error);
        throw error;
      }
      return data;
    },
    enabled: validIds.length > 0,
    refetchOnMount: true, // Sahifa har safar ochilganda bazadan yangilanadi
    refetchOnWindowFocus: true
  });

  const isLoading = isOffersLoading || favLoading;

  return (
    <div className="page-enter pb-10 px-4">
      <div className="flex items-center gap-3 mb-6 mt-4">
        <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-[hsl(var(--secondary))] transition-colors text-[hsl(var(--muted-foreground))] cursor-pointer">
          <ArrowLeft size={22} />
        </button>
        <h1 className="font-display text-2xl font-bold text-[hsl(var(--foreground))]">{t('saved_offers')}</h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[20px] overflow-hidden shadow-sm flex flex-col h-full animate-pulse">
              <div className="w-full aspect-video bg-[hsl(var(--muted))] relative">
                <div className="absolute bottom-3 left-3 bg-[hsl(var(--background))/50] w-28 h-8 rounded-full border border-[hsl(var(--border))]"></div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="h-4 bg-[hsl(var(--muted))] rounded-md w-3/4 mb-2"></div>
                <div className="h-4 bg-[hsl(var(--muted))] rounded-md w-1/2"></div>
                <div className="mt-auto pt-3 flex items-center justify-between">
                  <div className="h-3 bg-[hsl(var(--muted))] rounded-md w-24"></div>
                  <div className="w-9 h-9 rounded-full bg-[hsl(var(--muted))]"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : savedOffers && savedOffers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
          {savedOffers.map((discount: any) => {
            const isSaved = true; // Bu sahifada hammasi on-default saqlangan
            return (
              <div 
                key={discount.id} 
                onClick={() => setLocation(`/discount/${discount.id}`)}
                className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[20px] overflow-hidden shadow-sm hover:border-[hsl(var(--accent))] transition-all active:scale-[0.98] cursor-pointer flex flex-col h-full relative group"
              >
                <div className="absolute top-3 right-3 z-10 bg-red-500 text-white text-[14px] font-extrabold px-3 py-1.5 rounded-xl shadow-lg">
                  -{discount.discount_percent}%
                </div>
                
                <div className="w-full aspect-video bg-[hsl(var(--secondary))] overflow-hidden relative">
                  <img src={discount.image_url} alt={discount.product_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-[hsl(var(--card))/90] backdrop-blur-md px-3 py-1.5 rounded-full border border-[hsl(var(--border))] shadow-sm">
                    {discount.merchant?.logo_url ? (
                      <img src={discount.merchant.logo_url} className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <Store size={16} className="text-[hsl(var(--muted-foreground))]" />
                    )}
                    <span className="text-[12px] font-bold text-[hsl(var(--foreground))] line-clamp-1">{discount.merchant?.name}</span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-[15px] text-[hsl(var(--foreground))] leading-tight line-clamp-2">
                    {discount.product_name.replace(/,/g, ' • ')}
                  </h3>
                  
                  <div className="mt-auto pt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[hsl(var(--muted-foreground))]">
                      <Clock size={14} className="text-[hsl(var(--accent))]" /> 
                      {discount.start_time.slice(0, 5)} - {discount.end_time.slice(0, 5)}
                    </div>
                    
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault(); 
                        e.stopPropagation(); 
                        toggleFavorite(String(discount.id));
                      }}
                      className={`p-2 rounded-full transition-all active:scale-90 text-[hsl(var(--accent))] bg-[hsl(var(--accent)/.15)]`}
                    >
                      <Bookmark size={18} fill="currentColor" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 animate-in fade-in zoom-in duration-300 bg-[hsl(var(--card))] rounded-[32px] border border-[hsl(var(--border))] shadow-sm mt-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-[hsl(var(--secondary))] border-2 border-[hsl(var(--border))] flex items-center justify-center text-[hsl(var(--muted-foreground))] mb-5 shadow-sm">
            <Bookmark size={32} />
          </div>
          <h2 className="font-display text-xl font-bold text-[hsl(var(--foreground))] mb-2">Saqlanganlar yo'q</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-[250px] mx-auto">Siz hali hech qanday chegirmani saqlamadingiz.</p>
          <Link href="/" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-8 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-float active:scale-95 transition-all">
            {t('discover')}
          </Link>
        </div>
      )}
    </div>
  );
}