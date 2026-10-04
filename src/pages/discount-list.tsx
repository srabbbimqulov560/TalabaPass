import { useState, useMemo } from 'react';
import { useParams, useLocation } from 'wouter';
import { ArrowLeft, Heart, Store, Zap, Flame, Trophy } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useFavorites } from '@/lib/useFavorites';

export default function DiscountListPage() {
  const params = useParams<{ type: string }>();
  const type = params.type || 'new';
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { savedIds, toggleFavorite } = useFavorites();

  // 🌟 400 XATOLIK VA QOTISHLAR TO'LIQ BARTARAF ETILDI
  const { data: allDiscounts, isLoading } = useQuery({
    queryKey: ['allDiscountsList'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discounts')
        // Supabase tushunmaydigan relation'lar olib tashlandi
        .select(`*, merchant:merchants(id, name, logo_url, category)`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5 // 5 daqiqa xotirada saqlaydi, qotish umuman bo'lmaydi
  });

  const sortedDiscounts = useMemo(() => {
    if (!allDiscounts) return [];
    const list = [...allDiscounts];
    
    // Front-end tartiblash
    if (type === 'popular') {
      return list.sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0));
    } else if (type === 'top') {
      return list.sort((a, b) => String(a.product_name).localeCompare(String(b.product_name)));
    }
    
    return list; // 'new' uchun default tartib
  }, [allDiscounts, type]);

  const getHeaderInfo = () => {
    if (type === 'popular') return { title: 'Eng mashhur', icon: Flame, color: 'text-red-500' };
    if (type === 'top') return { title: "Eng ko'p xarid qilingan", icon: Trophy, color: 'text-blue-500' };
    return { title: 'Yangi chegirmalar', icon: Zap, color: 'text-amber-500' };
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="page-enter pb-10 px-4">
      <div className="flex items-center gap-3 mb-6 mt-4">
        <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-[hsl(var(--secondary))] transition-colors text-[hsl(var(--muted-foreground))] cursor-pointer">
          <ArrowLeft size={22} />
        </button>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-[hsl(var(--foreground))]">
          <headerInfo.icon size={26} className={headerInfo.color} />
          {headerInfo.title}
        </h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pb-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[20px] overflow-hidden shadow-sm flex flex-col h-full animate-pulse">
              <div className="w-full aspect-[16/10] bg-[hsl(var(--muted))] relative"></div>
              <div className="p-4 flex-1 flex flex-col relative pt-6">
                 <div className="h-3 bg-[hsl(var(--muted))] rounded-md w-1/3 mb-2"></div>
                 <div className="h-4 bg-[hsl(var(--muted))] rounded-md w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : sortedDiscounts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pb-8">
          {sortedDiscounts.map((discount: any) => {
            const isSaved = savedIds.includes(String(discount.id));
            return (
              <div 
                key={discount.id} 
                onClick={() => setLocation(`/discount/${discount.id}`)}
                className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[16px] overflow-visible shadow-sm hover:border-[hsl(var(--accent))] transition-all active:scale-[0.98] cursor-pointer flex flex-col h-full relative group"
              >
                <button 
                  type="button" 
                  onClick={async (e) => {
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    await toggleFavorite(String(discount.id));
                    setTimeout(() => queryClient.invalidateQueries({ queryKey: ['savedDiscounts'] }), 100);
                  }}
                  className={`absolute top-3 right-3 z-20 p-2 rounded-full backdrop-blur-md transition-all active:scale-90 ${
                    isSaved 
                      ? 'text-red-500 bg-white/90 shadow-sm' 
                      : 'text-white bg-black/30 hover:bg-black/50'
                  }`}
                >
                  <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} strokeWidth={isSaved ? 0 : 2} />
                </button>
                
                <div className="w-full aspect-[16/10] bg-[hsl(var(--secondary))] overflow-hidden rounded-t-[16px] relative">
                  <img src={discount.image_url} alt={discount.product_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  
                  {/* Do'kon logotipi rasm ichida (Chap pastki burchak) */}
                  <div 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setLocation(`/store/${discount.merchant?.id}`);
                    }}
                    className="absolute bottom-3 left-3 w-[46px] h-[46px] bg-white rounded-[14px] p-[2px] shadow-lg border border-black/5 flex items-center justify-center overflow-hidden z-10 cursor-pointer hover:scale-105 transition-transform"
                  >
                    {discount.merchant?.logo_url ? (
                      <img src={discount.merchant.logo_url} className="w-full h-full rounded-[10px] object-cover" />
                    ) : (
                      <Store size={22} className="text-[hsl(var(--muted-foreground))]" />
                    )}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col relative bg-[hsl(var(--card))] rounded-b-[16px]">
                  <div 
                    onClick={(e) => {
                       e.preventDefault();
                       e.stopPropagation();
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
        <div className="text-center py-12 bg-[hsl(var(--card))] rounded-[24px] border border-dashed border-[hsl(var(--border))]">
          <p className="font-bold text-[hsl(var(--muted-foreground))]">Hozircha chegirmalar yo'q</p>
        </div>
      )}
    </div>
  );
}