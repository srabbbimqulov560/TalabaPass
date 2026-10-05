import { useState, useEffect } from 'react';
import { ArrowLeft, Clock3, MapPin, Store, Ticket, CalendarDays, Package, Copy, CheckCircle2, Map, Tag, Heart, Loader2, AlertCircle } from 'lucide-react';
import { useLocation, useParams } from 'wouter';
import { useLanguage } from '@/lib/i18n';
import { useFavorites } from '@/lib/useFavorites';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

export default function DiscountDetailPage() {
  const { t } = useLanguage();
  const params = useParams<{ id: string }>();
  const id = params.id; 
  const [, setLocation] = useLocation();
  
  const { savedIds, toggleFavorite } = useFavorites();
  const isSaved = id ? savedIds.includes(id) : false;
  
  const [copied, setCopied] = useState(false);
  const [showMapOptions, setShowMapOptions] = useState(false);
  
  // 🌟 YANGI: TALABA TOMONIDAN TANLANGAN MAHSULOT
  const [selectedItemName, setSelectedItemName] = useState<string | null>(null);

  const { data: offer, isLoading, isError } = useQuery({
    queryKey: ['discountDetail', id],
    queryFn: async () => {
      if (!id) throw new Error("ID topilmadi");
      const { data, error } = await supabase.from('discounts').select(`*, merchant:merchants(name, logo_url, category, description)`).eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5 
  });

  useEffect(() => {
    async function trackView() {
      if (!id || !offer?.merchant_id) return;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { count } = await supabase
            .from('discount_views')
            .select('*', { count: 'exact', head: true })
            .eq('discount_id', id)
            .eq('student_id', user.id);
            
          if (count === 0) {
            await supabase.from('discount_views').insert({
              discount_id: id, merchant_id: offer.merchant_id, student_id: user.id
            });
          }
        }
      } catch (err) {}
    }
    trackView();
  }, [id, offer?.merchant_id]);
  
  const handleFavorite = async () => { 
    if (!id) return;
    await toggleFavorite(id);
  };

  const handleCopyAddress = () => {
    if (offer?.merchant?.description) {
      navigator.clipboard.writeText(offer.merchant.description);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openMap = (type: 'yandex' | 'google' | '2gis') => {
    if (!offer?.merchant?.description) return;
    const address = encodeURIComponent(offer.merchant.description);
    let url = '';
    if (type === 'yandex') url = `https://yandex.com/maps/?text=${address}`;
    if (type === 'google') url = `https://www.google.com/maps/search/?api=1&query=${address}`;
    if (type === '2gis') url = `https://2gis.uz/search/${address}`;
    window.open(url, '_blank');
    setShowMapOptions(false);
  };

  if (isLoading) return <DetailSkeleton />;
  if (isError || !offer) return <div className="page-enter py-20 text-center"><h1 className="font-bold">Chegirma topilmadi</h1></div>;

  const now = new Date();
  const startDT = new Date(`${offer.start_date}T${offer.start_time || '00:00'}`);
  const endDT = new Date(`${offer.end_date}T${offer.end_time || '23:59'}`);
  const isSoldOut = offer.items?.length > 0 && offer.items.every((i: any) => !i.isUnlimited && i.quantity <= 0);
  const isUnavailable = isSoldOut || now > endDT || now < startDT;

  if (isUnavailable) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-[hsl(var(--background))] text-center animate-in fade-in duration-300">
        <div className="w-24 h-24 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-6 shadow-inner border-4 border-red-500/20"><AlertCircle size={48} /></div>
        <h2 className="font-display text-2xl font-bold mb-3 text-[hsl(var(--foreground))]">Chegirma faol emas</h2>
        <p className="text-[14px] font-medium text-[hsl(var(--muted-foreground))] mb-8 max-w-xs leading-relaxed">Ushbu chegirma muddati o'tgan yoki sotib tugatilgan.</p>
        <button onClick={() => setLocation('/')} className="w-full py-4 bg-[hsl(var(--primary))] text-white rounded-2xl font-bold">Asosiy sahifaga qaytish</button>
      </div>
    );
  }
  
  const productTags = offer.product_name.split(',').map((tag: string) => tag.trim()).filter(Boolean);
  const hasItems = offer.items && offer.items.length > 0;
  
  // 🌟 TUGMANI FAOLLASHTIRISH SHARTI (Mahsulot tanlangan bo'lishi kerak)
  const canProceed = !hasItems || selectedItemName;

  const fullDescription = offer.merchant?.description || "";
  const addressMatch = fullDescription.match(/📍 Manzil: (.*?)(?:\n|$)/);
  const timeMatch = fullDescription.match(/⏰ Ish vaqti: (.*?)(?:\n|$)/);
  const addressText = addressMatch ? addressMatch[1] : fullDescription.replace(/Kordinata:\s*[\d.-]+[\s,]+[\d.-]+/i, '').trim();
  const workTimeText = timeMatch ? timeMatch[1] : null;

  return (
    <div className="page-enter flex flex-col h-[calc(100dvh-200px)] max-w-3xl mx-auto overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
      
      <div className="flex items-center justify-between mb-4 shrink-0 mt-2">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-[15px] font-bold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors p-2 -ml-2 rounded-full hover:bg-[hsl(var(--secondary))]">
          <ArrowLeft size={20} /> Orqaga
        </button>
        <button onClick={handleFavorite} className={`shrink-0 p-2.5 rounded-full border transition-all active:scale-90 ${isSaved ? 'border-red-500/20 bg-red-500/10 text-red-500 shadow-sm' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]'}`}>
          <Heart size={22} fill={isSaved ? 'currentColor' : 'none'} strokeWidth={isSaved ? 0 : 2} />
        </button>
      </div>
      
      <div className="w-full flex-1 min-h-[200px] max-h-[35vh] rounded-[32px] overflow-hidden shadow-md mb-5 flex items-center justify-center bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] shrink-0 relative group">
        <img src={offer.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Discount Cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-[14px] p-1 shadow-lg border border-white/20 overflow-hidden backdrop-blur-md">
              {offer.merchant?.logo_url ? <img src={offer.merchant.logo_url} className="w-full h-full object-cover" /> : <Store size={20} className="text-white" />}
            </div>
            <span className="text-[18px] font-display font-bold text-white tracking-wide drop-shadow-md line-clamp-1">{offer.merchant?.name}</span>
          </div>
        </div>
      </div>
      
      <div className="shrink-0 mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 bg-red-500/10 text-red-500 border border-red-500/20 px-3.5 py-1.5 rounded-full shadow-sm">
           <Tag size={16} />
           <span className="text-[14px] font-bold">-{offer.discount_percent}% {t('off')}</span>
        </div>
      </div>

      {/* 🌟 MAHSULOTNI TANLASH QISMI */}
      <div className="shrink-0 mb-6">
        <h3 className="text-[13px] font-bold uppercase tracking-widest text-[hsl(var(--foreground))] mb-3 ml-2 flex items-center gap-2">
          1. Mahsulotni tanlang <span className="text-red-500">*</span>
        </h3>
        <div className="flex flex-col gap-2.5">
          {hasItems ? (
            offer.items.map((item: any, idx: number) => {
              const isAvailable = item.quantity > 0 || item.isUnlimited;
              const isSelected = selectedItemName === item.name;

              return (
                <div 
                  key={idx} 
                  onClick={() => isAvailable && setSelectedItemName(item.name)}
                  className={`flex items-center justify-between p-4 rounded-[20px] border-2 transition-all cursor-pointer ${
                    !isAvailable ? 'bg-[hsl(var(--secondary))/40] border-transparent opacity-60 cursor-not-allowed' :
                    isSelected ? 'bg-[hsl(var(--primary))/10] border-[hsl(var(--primary))] shadow-sm' :
                    'bg-[hsl(var(--card))] border-[hsl(var(--border))] hover:border-[hsl(var(--accent))/50] shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-[hsl(var(--primary))] text-white' : isAvailable ? 'bg-[hsl(var(--primary))/10] text-[hsl(var(--primary))]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}`}>
                      {isSelected ? <CheckCircle2 size={18} /> : <Package size={18} />}
                    </div>
                    <span className={`font-bold text-[15px] ${isSelected ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--foreground))]'}`}>{item.name}</span>
                  </div>
                  <div className={`text-[12px] font-extrabold px-3 py-1.5 rounded-lg ${isAvailable ? 'bg-[hsl(var(--accent))/10] text-[hsl(var(--accent))]' : 'bg-red-500/10 text-red-500'}`}>
                    {item.isUnlimited ? 'Cheklanmagan' : isAvailable ? `${item.quantity} ta qoldi` : 'Tugagan'}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-[13px] font-semibold text-[hsl(var(--muted-foreground))] bg-[hsl(var(--secondary))] p-4 rounded-2xl">
              Ushbu chegirma barcha mahsulotlarga amal qiladi. Tugmani bosib QR kodni do'konga ko'rsating.
            </div>
          )}
        </div>
      </div>
      
      {/* Qolgan ma'lumotlar... */}
      <div className="grid gap-3 grid-cols-1 shrink-0 mb-4">
        <div className="rounded-[24px] bg-[hsl(var(--card))] border-2 border-[hsl(var(--card-border))] p-5 shadow-sm overflow-hidden relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[hsl(var(--accent))]">
              <MapPin size={20} />
              <span className="text-[12px] font-bold uppercase tracking-widest text-[hsl(var(--foreground))]">{t('find_us')}</span>
            </div>
          </div>
          <div onClick={handleCopyAddress} className="group relative bg-[hsl(var(--secondary))/50] p-4 rounded-[18px] cursor-pointer hover:bg-[hsl(var(--secondary))] active:scale-[0.98] transition-all border border-[hsl(var(--border))]">
            <div className="pr-8 text-[14px] font-semibold text-[hsl(var(--foreground))] leading-relaxed line-clamp-3">{addressText || "Manzil kiritilmagan"}</div>
            {workTimeText && <div className="mt-2.5 pt-2.5 border-t border-[hsl(var(--border))] flex items-center gap-1.5 text-[13px] font-bold text-[hsl(var(--foreground))]"><Clock3 size={14} className="text-[hsl(var(--muted-foreground))]" />{workTimeText}</div>}
            <div className="absolute right-4 top-4 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))] transition-colors">{copied ? <CheckCircle2 size={20} className="text-green-500" /> : <Copy size={20} />}</div>
          </div>
          <button onClick={() => setShowMapOptions(true)} className="w-full mt-3 flex items-center justify-center gap-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] py-3.5 rounded-[16px] text-[14px] font-bold text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-all active:scale-[0.98]">

<Map size={18} />
Xaritadan ko'rish
          </button>
        </div>
      </div>

      {/* 🌟 2. QR KOD OCHISH TUGMASI (Endi URL param bilan o'tadi) */}
      <div className="mt-auto shrink-0 pb-6 pt-2 sticky bottom-0 bg-gradient-to-t from-[hsl(var(--background))] via-[hsl(var(--background))] to-transparent">
        <button 
          disabled={!canProceed}
          onClick={() => {
            const itemParam = selectedItemName ? `&i=${encodeURIComponent(selectedItemName)}` : '';
            setLocation(`/qr?d=${offer.id}${itemParam}`);
          }} 
          className={`flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-4 font-display text-[16px] font-bold text-[hsl(var(--primary-foreground))] shadow-float transition-all ${!canProceed ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:-translate-y-1 active:scale-[0.98]'}`}
        >
          {!canProceed ? 'Avval mahsulotni tanlang' : "2. QR Kodni ko'rsatish"} 
        </button>
      </div>

      {/* Map modal qismi oldingidek qoladi... */}
      {showMapOptions && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMapOptions(false)}></div>
          <div className="relative bg-[hsl(var(--card))] rounded-t-[32px] p-6 pb-10 animate-in slide-in-from-bottom-full duration-300 z-10 border-t border-[hsl(var(--border))] shadow-2xl">
            <h3 className="font-display font-bold text-xl text-center mb-6">Xaritani tanlang</h3>
            <div className="flex flex-col gap-3">
              <button onClick={() => openMap('yandex')} className="py-4 font-bold bg-[hsl(var(--secondary))] rounded-[20px]">Yandex Maps</button>
              <button onClick={() => openMap('google')} className="py-4 font-bold bg-[hsl(var(--secondary))] rounded-[20px]">Google Maps</button>
              <button onClick={() => setShowMapOptions(false)} className="mt-4 py-4 font-bold">Bekor qilish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="page-enter flex flex-col h-[calc(100dvh-200px)] max-w-3xl mx-auto">
      <div className="skeleton w-full flex-1 max-h-[35vh] min-h-[200px] rounded-[32px] mb-6 shrink-0 mt-14" />
      <div className="skeleton h-8 w-32 rounded-full mb-6" />
      <div className="space-y-3 mb-6 shrink-0"><div className="skeleton h-16 rounded-[20px] w-full" /></div>
      <div className="skeleton h-32 rounded-[24px]" />
    </div>
  );
}