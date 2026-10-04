import { ArrowLeft, Heart, Store } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/i18n';
import { useFavorites } from '@/lib/useFavorites';
import { useMemo } from 'react';

export default function SavedPage() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { savedIds, toggleFavorite, isLoading: favLoading } = useFavorites();

  const validIds = useMemo(() => {
    return Array.isArray(savedIds) 
      ? savedIds.filter(id => id !== null && id !== undefined && String(id).trim() !== '')
      : [];
  }, [savedIds]);

  const { data: savedOffers, isLoading: isOffersLoading } = useQuery({
    queryKey: ['savedDiscounts', validIds],
    queryFn: async () => {
      if (validIds.length === 0) return [];
      const { data, error } = await supabase
        .from('discounts')
        .select(`*, merchant:merchants(id, name, logo_url, category)`)
        .in('id', validIds)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Saqlanganlarni yuklashda xato:", error);
        throw error;
      }
      return data;
    },
    enabled: validIds.length > 0,
    refetchOnMount: true, 
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pb-8">
          {[1, 2, 3, 4].map((i) => (
             <div key={i} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[20px] overflow-hidden shadow-sm flex flex-col h-full animate-pulse">
                <div className="w-full aspect-[16/10] bg-[hsl(var(--muted))] relative"></div>
                <div className="p-4 flex-1 flex flex-col relative pt-6">
                   <div className="absolute -top-6 left-4 w-12 h-12 rounded-xl bg-[hsl(var(--muted))] border-2 border-[hsl(var(--card))]"></div>
                   <div className="h-3 bg-[hsl(var(--muted))] rounded-md w-1/3 mb-2"></div>
                   <div className="h-4 bg-[hsl(var(--muted))] rounded-md w-3/4"></div>
                </div>
              </div>
          ))}
        </div>
      ) : savedOffers && savedOffers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pb-8">
          {savedOffers.map((discount: any) => {
            return (
              <div 
                  key={discount.id} 
                  onClick={() => setLocation(`/discount/${discount.id}`)}
                  className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[16px] overflow-visible shadow-sm hover:border-[hsl(var(--accent))] transition-all active:scale-[0.98] cursor-pointer flex flex-col h-full relative group"
                >
                  <button 
                    type="button" 
                    onClick={(e) => {
                      e.preventDefault(); 
                      e.stopPropagation(); 
                      toggleFavorite(String(discount.id));
                    }}
                    className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all active:scale-90 text-red-500 bg-white/90 shadow-sm`}
                  >
                    <Heart size={18} fill="currentColor" strokeWidth={0} />
                  </button>
                  
                  <div className="w-full aspect-[16/10] bg-[hsl(var(--secondary))] overflow-hidden rounded-t-[16px] relative">
                    <img src={discount.image_url} alt={discount.product_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>

                  <div className="p-4 flex-1 flex flex-col relative pt-8 bg-[hsl(var(--card))] rounded-b-[16px]">
                    <div 
                      onClick={(e) => {
                        e.preventDefault(); e.stopPropagation();
                        setLocation(`/store/${discount.merchant?.id}`);
                      }}
                      className="absolute -top-7 left-4 w-[52px] h-[52px] bg-white rounded-xl p-1 shadow-md border border-[hsl(var(--border))] flex items-center justify-center overflow-hidden z-10 cursor-pointer hover:scale-105 transition-transform"
                    >
                      {discount.merchant?.logo_url ? (
                        <img src={discount.merchant.logo_url} className="w-full h-full rounded-lg object-cover" />
                      ) : (
                        <Store size={24} className="text-[hsl(var(--muted-foreground))]" />
                      )}
                    </div>
                    
                    <div 
                      onClick={(e) => {
                        e.preventDefault(); e.stopPropagation();
                        setLocation(`/store/${discount.merchant?.id}`);
                      }}
                      className="text-[13px] font-medium text-[hsl(var(--muted-foreground))] mb-1 hover:text-[hsl(var(--foreground))] transition-colors w-fit"
                    >
                      {discount.merchant?.name}
                    </div>
                    <h3 className="font-bold text-[15px] text-[hsl(var(--foreground))] leading-snug line-clamp-2">
                      {discount.short_description || discount.product_name.replace(/,/g, ' • ')}
                    </h3>
                  </div>
                </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 animate-in fade-in zoom-in duration-300 bg-[hsl(var(--card))] rounded-[32px] border border-[hsl(var(--border))] shadow-sm mt-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-[hsl(var(--secondary))] border-2 border-[hsl(var(--border))] flex items-center justify-center text-[hsl(var(--muted-foreground))] mb-5 shadow-sm">
            <Heart size={32} />
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