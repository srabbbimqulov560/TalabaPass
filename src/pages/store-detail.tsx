import { ArrowLeft, MapPin, Store, Clock, Sparkles, Loader2 } from 'lucide-react';
import { Link, useLocation, useParams } from 'wouter';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

export default function StoreDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [, setLocation] = useLocation();

  // 1. DO'KON MA'LUMOTINI TORTIB OLISH
  const { data: merchant, isLoading: isMerchantLoading } = useQuery({
    queryKey: ['storeDetail', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('merchants').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // 2. SHU DO'KONGA TEGISHLI CHEGIRMALARNI TORTIB OLISH
  const { data: discounts, isLoading: isDiscountsLoading } = useQuery({
    queryKey: ['storeDiscounts', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('discounts').select('*').eq('merchant_id', id).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  if (isMerchantLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[hsl(var(--accent))]" size={32}/></div>;
  }

  if (!merchant) {
    return (
      <div className="page-enter py-20 text-center">
        <h1 className="font-bold text-xl mb-4 text-[hsl(var(--foreground))]">Do'kon topilmadi</h1>
        <button onClick={() => setLocation('/services')} className="bg-[hsl(var(--primary))] text-white px-5 py-2 rounded-full">Orqaga</button>
      </div>
    );
  }

  return (
    <div className="page-enter pb-10 flex flex-col min-h-[calc(100dvh-100px)]">
      
      <button onClick={() => setLocation('/services')} className="mb-4 flex items-center gap-2 text-sm font-bold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] shrink-0 w-fit">
        <ArrowLeft size={17} /> Xizmatlarga qaytish
      </button>

      {/* DO'KON PROFILI KARTASI */}
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[32px] p-6 shadow-sm mb-8 flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-[hsl(var(--secondary))] mb-4 overflow-hidden border-4 border-[hsl(var(--background))] shadow-md flex items-center justify-center">
          {merchant.logo_url ? (
            <img src={merchant.logo_url} alt={merchant.name} className="w-full h-full object-cover" />
          ) : (
            <Store size={40} className="text-[hsl(var(--muted-foreground))]" />
          )}
        </div>
        <h1 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] leading-tight mb-1">
          {merchant.name}
        </h1>
        <div className="text-[12px] font-bold text-[hsl(var(--accent))] uppercase tracking-wider mb-3">
          {merchant.category}
        </div>
        <div className="w-full bg-[hsl(var(--secondary))/50] rounded-2xl p-4 text-left">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-[hsl(var(--foreground))] whitespace-pre-line leading-relaxed">
            {merchant.description || "Qo'shimcha ma'lumot kiritilmagan"}
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-[19px] font-bold text-[hsl(var(--foreground))]">
          <Sparkles size={20} className="text-amber-500" />
          Faol chegirmalar
        </h2>
      </div>

      {/* CHEGIRMALAR RO'YXATI */}
      {isDiscountsLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[hsl(var(--accent))]" size={32}/></div>
      ) : discounts && discounts.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 pb-8">
          {discounts.map((discount: any) => (
            <Link key={discount.id} href={`/discount/${discount.id}`}>
              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[20px] overflow-hidden shadow-sm hover:border-[hsl(var(--accent))] transition-all active:scale-[0.98] cursor-pointer flex flex-col h-full relative group">
                
                <div className="absolute top-2 right-2 z-10 bg-red-500 text-white text-[12px] font-extrabold px-2 py-1 rounded-xl shadow-md">
                  -{discount.discount_percent}%
                </div>
                
                <div className="w-full aspect-[4/5] bg-[hsl(var(--secondary))] overflow-hidden relative">
                  <img src={discount.image_url} alt={discount.product_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>

                <div className="p-3 flex-1 flex flex-col">
                  <h3 className="font-bold text-[13px] text-[hsl(var(--foreground))] leading-tight line-clamp-2">
                    {discount.product_name.replace(/,/g, ' • ')}
                  </h3>
                  <div className="mt-auto pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">
                    <Clock size={12} className="text-[hsl(var(--accent))]" /> 
                    {discount.start_time.slice(0, 5)} - {discount.end_time.slice(0, 5)}
                  </div>
                </div>

              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-[hsl(var(--card))] rounded-[24px] border border-dashed border-[hsl(var(--border))]">
          <p className="font-bold text-[hsl(var(--muted-foreground))]">Bu do'konda hozircha faol chegirmalar yo'q</p>
        </div>
      )}

    </div>
  );
}