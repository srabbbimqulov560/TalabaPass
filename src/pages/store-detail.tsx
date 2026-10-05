import { useState } from 'react';
import { ArrowLeft, MapPin, Store, Clock3, Zap, Copy, CheckCircle2, Map } from 'lucide-react';
import { Link, useLocation, useParams } from 'wouter';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

export default function StoreDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [, setLocation] = useLocation();

  const [copied, setCopied] = useState(false);
  const [showMapOptions, setShowMapOptions] = useState(false);

  const { data: merchant, isLoading: isMerchantLoading } = useQuery({
    queryKey: ['storeDetail', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('merchants').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const { data: discounts, isLoading: isDiscountsLoading } = useQuery({
    queryKey: ['storeDiscounts', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('discounts').select('*').eq('merchant_id', id).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const handleCopyAddress = () => {
    if (merchant?.description) {
      navigator.clipboard.writeText(merchant.description);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 🌟 NATIVE XARITA OCHISH MANTIG'I (Mukammallashtirildi)
  const openMap = (type: 'yandex' | 'google' | '2gis') => {
    if (!merchant?.description) return;
    
    // Kordinatalar bor-yo'qligini ishonchli regex bilan tekshirish
    const match = merchant.description.match(/Kordinata:\s*([\d.-]+)[\s,]+([\d.-]+)/i);
    let url = '';

    if (match && match[1] && match[2]) {
      const lat = match[1];
      const lon = match[2];
      
      // Native ilovalarni ochishga urinish (Telefonda)
      if (type === 'yandex') url = `yandexmaps://maps.yandex.ru/?pt=${lon},${lat}&z=16&l=map`;
      if (type === 'google') url = `google.navigation:q=${lat},${lon}`;
      if (type === '2gis') url = `dgis://2gis.ru/routeSearch/rsType/car/to/${lon},${lat}`;
      
      // Agar ilova ishlamasa (brauzerda yoki kompyuterda bo'lsa), web manzilga fallback
      setTimeout(() => {
        if (type === 'yandex') window.open(`https://yandex.com/maps/?ll=${lon},${lat}&z=16`, '_blank');
        if (type === 'google') window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`, '_blank');
        if (type === '2gis') window.open(`https://2gis.uz/search/${lat},${lon}`, '_blank');
      }, 500);

      window.location.href = url; // Native ilovaga otish
    } else {
      // Agar faqat text bo'lsa eski usulda matnni o'zini izlaydi
      const address = encodeURIComponent(merchant.description);
      if (type === 'yandex') url = `https://yandex.com/maps/?text=${address}`;
      if (type === 'google') url = `https://www.google.com/maps/search/?api=1&query=${address}`;
      if (type === '2gis') url = `https://2gis.uz/search/${address}`;
      window.open(url, '_blank');
    }
    
    setShowMapOptions(false);
  };

  if (isMerchantLoading) {
    return (
      <div className="page-enter pb-10 flex flex-col min-h-[calc(100dvh-100px)]">
        <div className="mb-4 w-32 h-5 bg-[hsl(var(--muted))] rounded-md animate-pulse mt-4"></div>
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[32px] p-6 shadow-sm mb-8 flex flex-col items-center text-center animate-pulse">
          <div className="w-24 h-24 rounded-full bg-[hsl(var(--muted))] mb-4"></div>
          <div className="h-7 w-48 bg-[hsl(var(--muted))] rounded-md mb-2"></div>
        </div>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="page-enter py-20 text-center">
        <h1 className="font-bold text-xl mb-4 text-[hsl(var(--foreground))]">Do'kon topilmadi</h1>
        <button onClick={() => setLocation('/services')} className="bg-[hsl(var(--primary))] text-white px-5 py-2 rounded-full">Orqaga</button>
      </div>
    );
  }

  // Matnni tozalash va ajratish
  const fullDescription = merchant.description || "";
  const addressMatch = fullDescription.match(/📍 Manzil: (.*?)(?:\n|$)/);
  const timeMatch = fullDescription.match(/⏰ Ish vaqti: (.*?)(?:\n|$)/);
  
  // "Kordinata: xx.xx, yy.yy" yozuvini ekrandan olib tashlab toza manzil ko'rsatish
  const cleanAddress = fullDescription.replace(/Kordinata:\s*[\d.-]+[\s,]+[\d.-]+/i, '').trim();
  const addressText = addressMatch ? addressMatch[1] : cleanAddress;
  const workTimeText = timeMatch ? timeMatch[1] : null;

  return (
    <div className="page-enter pb-10 flex flex-col min-h-[calc(100dvh-100px)]">
      
      <button onClick={() => setLocation('/services')} className="mb-5 mt-2 flex items-center gap-2 text-[15px] font-bold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors p-2 -ml-2 rounded-full hover:bg-[hsl(var(--secondary))] w-fit">
        <ArrowLeft size={20} /> Xizmatlarga qaytish
      </button>

      {/* DO'KON PROFILI KARTASI */}
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[32px] p-6 shadow-sm mb-6 flex flex-col items-center text-center relative overflow-hidden">
        
        {/* Orqa fon blur */}
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[hsl(var(--primary))/10] to-transparent"></div>

        <div className="relative w-[88px] h-[88px] rounded-[24px] bg-[hsl(var(--secondary))] mb-4 overflow-hidden border border-[hsl(var(--border))] shadow-md flex items-center justify-center p-1 z-10">
          {merchant.logo_url ? (
            <img src={merchant.logo_url} alt={merchant.name} className="w-full h-full object-cover rounded-[20px]" />
          ) : (
            <Store size={40} className="text-[hsl(var(--muted-foreground))]" />
          )}
        </div>
        <h1 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] leading-tight mb-2 relative z-10">
          {merchant.name}
        </h1>
        <div className="text-[11px] font-extrabold text-[hsl(var(--accent))] uppercase tracking-widest bg-[hsl(var(--accent)/.1)] px-3 py-1 rounded-md mb-6 relative z-10">
          {merchant.category}
        </div>

        {/* Yagona "Manzil va Ish vaqti" qutisi */}
        <div className="w-full bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-2xl p-4 text-left shadow-inner relative z-10">
          
          <div 
            onClick={handleCopyAddress}
            className="flex items-start justify-between gap-4 cursor-pointer group"
          >
            <div className="flex-1">
              <div className="flex items-start gap-2 text-[13px] font-semibold text-[hsl(var(--foreground))] leading-relaxed line-clamp-2">
                <MapPin size={16} className="shrink-0 mt-0.5 text-rose-500" />
                {addressText || "Manzil ko'rsatilmagan"}
              </div>
              
              {workTimeText && (
                <div className="mt-3 flex items-center gap-2 text-[13px] font-semibold text-[hsl(var(--foreground))]">
                  <Clock3 size={16} className="shrink-0 text-amber-500" />
                  {workTimeText}
                </div>
              )}
            </div>
            
            <div className="text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))] transition-colors shrink-0 p-2 bg-[hsl(var(--secondary))] rounded-xl">
              {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
            </div>
          </div>

          <button 
            onClick={() => setShowMapOptions(true)}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] py-3 rounded-[12px] text-[13px] font-bold text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))/50] hover:text-[hsl(var(--primary))] transition-all active:scale-[0.98]"
          >

<Map size={16} />
Xaritadan ko'rish
          </button>
        </div>
      </div>

      <div className="mb-5 mt-2 flex items-center justify-between px-1">
        <h2 className="flex items-center gap-2 font-display text-[19px] font-bold text-[hsl(var(--foreground))]">
          <Zap size={20} className="text-amber-500" fill="currentColor" />
          Faol chegirmalar
        </h2>
      </div>

      {isDiscountsLoading ? (
        <div className="grid grid-cols-2 gap-4 pb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[20px] overflow-hidden shadow-sm flex flex-col h-full animate-pulse">
              <div className="w-full aspect-[4/5] bg-[hsl(var(--muted))] relative">
                <div className="absolute top-2 right-2 w-10 h-6 bg-[hsl(var(--background))/50] rounded-xl"></div>
              </div>
              <div className="p-3 flex-1 flex flex-col gap-2">
                <div className="h-3 w-full bg-[hsl(var(--muted))] rounded-md"></div>
                <div className="h-3 w-2/3 bg-[hsl(var(--muted))] rounded-md mt-auto"></div>
              </div>
            </div>
          ))}
        </div>
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
                    {discount.short_description || discount.product_name.replace(/,/g, ' • ')}
                  </h3>
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

      {/* XARITA MODALI */}
      {showMapOptions && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMapOptions(false)}></div>
          <div className="relative bg-[hsl(var(--card))] rounded-t-[32px] p-6 pb-10 animate-in slide-in-from-bottom-full duration-300 z-10 border-t border-[hsl(var(--border))] shadow-2xl">
            <div className="w-12 h-1.5 bg-[hsl(var(--muted))] rounded-full mx-auto mb-6"></div>
            <h3 className="font-display font-bold text-xl text-[hsl(var(--foreground))] text-center mb-6">Xaritani tanlang</h3>
            
            <div className="flex flex-col gap-3">
              <button onClick={() => openMap('yandex')} className="flex items-center justify-between w-full bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))/70] p-4 rounded-[20px] transition-colors border border-[hsl(var(--border))]">
                <span className="font-bold text-[16px] text-[hsl(var(--foreground))]">Yandex Maps</span>
                <Map size={20} className="text-red-500" />
              </button>
              
              <button onClick={() => openMap('google')} className="flex items-center justify-between w-full bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))/70] p-4 rounded-[20px] transition-colors border border-[hsl(var(--border))]">
                <span className="font-bold text-[16px] text-[hsl(var(--foreground))]">Google Maps</span>
                <Map size={20} className="text-green-500" />
              </button>
              
              <button onClick={() => openMap('2gis')} className="flex items-center justify-between w-full bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))/70] p-4 rounded-[20px] transition-colors border border-[hsl(var(--border))]">
                <span className="font-bold text-[16px] text-[hsl(var(--foreground))]">2GIS</span>
                <Map size={20} className="text-blue-500" />
              </button>
              
              <button onClick={() => setShowMapOptions(false)} className="w-full mt-4 py-4 font-bold text-[16px] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))] rounded-[20px] transition-colors border-2 border-transparent hover:border-[hsl(var(--border))]">
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}