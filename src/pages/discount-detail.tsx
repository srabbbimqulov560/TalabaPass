import { useState, useEffect } from 'react';
import { ArrowLeft, Bookmark, Clock3, MapPin, Store, Ticket, X, CalendarDays, Package, Copy, CheckCircle2, Map } from 'lucide-react';
import { Link, useLocation, useParams } from 'wouter';
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
  
  const [notice, setNotice] = useState('');
  const [copied, setCopied] = useState(false);
  const [showMapOptions, setShowMapOptions] = useState(false);

  // BAZADAN CHEGIRMA HAQIDA TO'LIQ MA'LUMOT
  const { data: offer, isLoading, isError } = useQuery({
    queryKey: ['discountDetail', id],
    queryFn: async () => {
      if (!id) throw new Error("ID topilmadi");
      const { data, error } = await supabase.from('discounts').select(`*, merchant:merchants(name, logo_url, category, description)`).eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id 
  });

  // KO'RISHLARNI (+1) YOZISH
  useEffect(() => {
    async function trackView() {
      if (!id || !offer?.merchant_id) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('discount_views').insert({
          discount_id: id, merchant_id: offer.merchant_id, student_id: user.id
        });
      }
    }
    trackView();
  }, [id, offer?.merchant_id]);
  
  const handleFavorite = async () => { 
    if (!id) return;
    const added = await toggleFavorite(id);
    setNotice(added ? t('added_to_saved') : t('removed_from_saved')); 
    setTimeout(() => setNotice(''), 2200); 
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
  if (isError || !offer) return (
    <div className="page-enter py-20 text-center pb-28">
      <div className="mx-auto max-w-sm rounded-[28px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-soft">
        <Ticket className="mx-auto text-[hsl(var(--muted-foreground))] mb-4" size={40}/>
        <h1 className="font-display text-xl font-bold text-[hsl(var(--foreground))]">{t('offer_not_found')}</h1>
        <button onClick={() => setLocation('/')} className="mt-6 inline-flex rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))]">
          {t('back_to_discover')}
        </button>
      </div>
    </div>
  );
  
  // Mahsulotlar yo'q bo'lsa (Eski bazadagi ma'lumotlar uchun ehtiyot sharti)
  const productTags = offer.product_name.split(',').map((tag: string) => tag.trim()).filter(Boolean);
  const hasItems = offer.items && offer.items.length > 0;

  return (
    <div className="page-enter flex flex-col h-[calc(100dvh-200px)] max-w-3xl mx-auto overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
      
      {/* 🌟 Sarlavha qismi */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <button onClick={() => setLocation('/')} className="flex items-center gap-2 text-[15px] font-bold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors p-2 -ml-2 rounded-full hover:bg-[hsl(var(--secondary))]">
          <ArrowLeft size={20} /> Orqaga
        </button>
        <button onClick={handleFavorite} className={`shrink-0 p-3 rounded-full border shadow-sm transition-all active:scale-90 ${isSaved ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/.1)] text-[hsl(var(--accent))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]'}`}>
          <Bookmark size={20} fill={isSaved ? 'currentColor' : 'none'} />
        </button>
      </div>
      
      {/* 🌟 RASM QISMI (Silliq va Katta) */}
      <div className="w-full flex-1 min-h-[200px] max-h-[35vh] rounded-[32px] overflow-hidden shadow-md mb-6 flex items-center justify-center bg-[hsl(var(--secondary))] border-2 border-[hsl(var(--card-border))] shrink-0 relative group">
        <img src={offer.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Discount Cover" />
        
        {/* Yorqin Gradient qoplama (Pastdan tepaga) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

        {/* Do'kon logotipi va nomi (Rasm ichida pastda) */}
        <div className="absolute bottom-5 left-5 flex items-center gap-3">
          <div className="w-12 h-12 bg-[hsl(var(--card))] rounded-full p-1 shadow-xl border-2 border-white/20 overflow-hidden backdrop-blur-md">
            {offer.merchant?.logo_url ? (
              <img src={offer.merchant.logo_url} className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-[hsl(var(--secondary))] flex items-center justify-center"><Store size={20} className="text-[hsl(var(--muted-foreground))]" /></div>
            )}
          </div>
          <span className="text-[18px] font-display font-bold text-white tracking-wide drop-shadow-md line-clamp-1">{offer.merchant?.name}</span>
        </div>
      </div>
      
      {/* 🌟 KREATIV CHEGIRMA BELGISI (BADGE) */}
      <div className="shrink-0 mb-6 flex items-center">
        <div className="relative inline-block transform -rotate-2 hover:rotate-0 transition-transform duration-300">
           <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-red-600 blur-md opacity-60 rounded-2xl"></div>
           <div className="relative flex items-center gap-2 bg-gradient-to-br from-rose-500 to-red-600 border border-white/20 px-6 py-2.5 rounded-[18px] shadow-xl">
              <span className="text-[22px] font-black text-white tracking-tighter drop-shadow-sm">-{offer.discount_percent}%</span>
              <div className="w-[1px] h-6 bg-white/30 mx-1"></div>
              <span className="text-[15px] font-extrabold text-white uppercase tracking-widest drop-shadow-sm">Chegirma</span>
           </div>
        </div>
      </div>

      {/* 🌟 MAHSULOTLAR VA ULARNING SONI */}
      <div className="shrink-0 mb-6">
        <h3 className="text-[12px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-3 ml-2">Mavjud Mahsulotlar</h3>
        <div className="flex flex-col gap-2.5">
          {hasItems ? (
            offer.items.map((item: any, idx: number) => {
              const isAvailable = item.quantity > 0;
              return (
                <div key={idx} className={`flex items-center justify-between p-4 rounded-[20px] border-2 transition-all ${isAvailable ? 'bg-[hsl(var(--card))] border-[hsl(var(--border))] hover:border-[hsl(var(--accent))/50] shadow-sm' : 'bg-[hsl(var(--secondary))/40] border-transparent opacity-60'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isAvailable ? 'bg-[hsl(var(--primary))/10] text-[hsl(var(--primary))]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}`}>
                      <Package size={18} />
                    </div>
                    <span className="font-bold text-[15px] text-[hsl(var(--foreground))]">{item.name}</span>
                  </div>
                  <div className={`text-[12px] font-extrabold px-3 py-1.5 rounded-lg ${isAvailable ? 'bg-[hsl(var(--accent))/10] text-[hsl(var(--accent))]' : 'bg-red-500/10 text-red-500'}`}>
                    {isAvailable ? `${item.quantity} ta qoldi` : 'Tugagan'}
                  </div>
                </div>
              )
            })
          ) : (
            // Eski ma'lumotlar uchun fallback
            <div className="flex flex-wrap gap-2">
              {productTags.map((tag: string, idx: number) => (
                <span key={idx} className="flex items-center gap-1.5 text-[14px] font-bold text-[hsl(var(--foreground))] bg-[hsl(var(--card))] px-4 py-2.5 rounded-[16px] border-2 border-[hsl(var(--border))] shadow-sm">
                  <Package size={14} className="text-[hsl(var(--accent))]" /> {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* 🌟 MANZIL VA XARITA */}
      <div className="grid gap-3 grid-cols-1 shrink-0 mb-4">
        
        <div className="rounded-[24px] bg-[hsl(var(--card))] border-2 border-[hsl(var(--card-border))] p-5 shadow-sm overflow-hidden relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[hsl(var(--accent))]">
              <MapPin size={20} />
              <span className="text-[12px] font-bold uppercase tracking-widest text-[hsl(var(--foreground))]">Manzil va Ma'lumot</span>
            </div>
          </div>
          
          {/* Nusxa olish imkoniyati */}
          <div 
            onClick={handleCopyAddress}
            className="group relative bg-[hsl(var(--secondary))/50] p-4 rounded-[18px] cursor-pointer hover:bg-[hsl(var(--secondary))] active:scale-[0.98] transition-all border border-[hsl(var(--border))]"
          >
            <div className="pr-8 text-[14px] font-semibold text-[hsl(var(--foreground))] leading-relaxed line-clamp-3">
              {offer.merchant?.description || "Manzil kiritilmagan"}
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))] transition-colors">
              {copied ? <CheckCircle2 size={20} className="text-green-500" /> : <Copy size={20} />}
            </div>
          </div>

          {/* Xaritani ochish tugmasi */}
          <button 
            onClick={() => setShowMapOptions(true)}
            className="w-full mt-3 flex items-center justify-center gap-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] py-3.5 rounded-[16px] text-[14px] font-bold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--primary))/5] hover:text-[hsl(var(--primary))] hover:border-[hsl(var(--primary))/30] transition-all active:scale-[0.98]"
          >

<Map size={18} />
Xaritadan ko'rish
          </button>
        </div>
        
        {/* 🌟 AMAL QILISH VAQTI KARTASI */}
        <div className="rounded-[24px] bg-[hsl(var(--card))] border-2 border-[hsl(var(--card-border))] p-5 shadow-sm flex flex-col justify-center">
          <div className="mb-4 flex items-center gap-2 text-[#c38922]">
            <Clock3 size={20} />
            <span className="text-[12px] font-bold uppercase tracking-widest text-[hsl(var(--foreground))]">Amal qilish vaqti</span>
          </div>
          
          <div className="flex items-center gap-3 bg-[hsl(var(--secondary))/50] p-3.5 rounded-[18px] border border-[hsl(var(--border))] mb-3">
            <div className="bg-[hsl(var(--background))] p-2 rounded-xl shadow-sm"><Clock3 size={18} className="text-[hsl(var(--muted-foreground))]" /></div>
            <div className="text-[16px] font-extrabold text-[hsl(var(--foreground))] tracking-wide">
              {offer.start_time.slice(0, 5)} <span className="text-[hsl(var(--muted-foreground))] text-[14px] mx-1">dan</span> {offer.end_time.slice(0, 5)} <span className="text-[hsl(var(--muted-foreground))] text-[14px] ml-1">gacha</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[hsl(var(--secondary))/50] p-3.5 rounded-[18px] border border-[hsl(var(--border))]">
            <div className="bg-[hsl(var(--background))] p-2 rounded-xl shadow-sm"><CalendarDays size={18} className="text-[hsl(var(--muted-foreground))]" /></div>
            <div className="text-[14px] font-bold text-[hsl(var(--muted-foreground))]">
              {offer.start_date.slice(5).replace('-', '.')} <span className="font-medium mx-1">dan</span> {offer.end_date.slice(5).replace('-', '.')} <span className="font-medium ml-1">gacha</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto shrink-0 pb-4 pt-4 sticky bottom-0 bg-gradient-to-t from-[hsl(var(--background))] via-[hsl(var(--background))] to-transparent">
        <button onClick={() => setLocation('/qr')} className="flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-4.5 font-display text-[18px] font-bold text-[hsl(var(--primary-foreground))] shadow-[0_8px_30px_hsl(var(--primary)/0.3)] transition-all hover:-translate-y-1 active:scale-[0.98]">
          Chegirmani olish (QR Kodi) <ArrowLeft className="rotate-180" size={20} />
        </button>
      </div>
      
      {/* XABARNOMA */}
      {notice && (
        <div className="fixed top-10 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full bg-[hsl(var(--foreground))] px-6 py-3 text-[13px] font-bold text-[hsl(var(--background))] shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300">
          <CheckCircle2 size={16} className="text-green-400"/> {notice}
        </div>
      )}

      {/* 🌟 YANGI: XARITANI TANLASH MODALI (BOTTOM SHEET) */}
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

function DetailSkeleton() {
  return (
    <div className="page-enter flex flex-col h-[calc(100dvh-200px)] max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div className="skeleton h-8 w-24 rounded-full" />
        <div className="skeleton h-10 w-10 rounded-full" />
      </div>
      <div className="skeleton w-full flex-1 max-h-[35vh] min-h-[200px] rounded-[32px] mb-6 shrink-0" />
      <div className="skeleton h-12 w-48 rounded-2xl mb-6" />
      <div className="space-y-3 mb-6 shrink-0">
        <div className="skeleton h-16 rounded-[20px] w-full" />
        <div className="skeleton h-16 rounded-[20px] w-full" />
      </div>
      <div className="grid gap-3 grid-cols-1 shrink-0 mb-4">
        <div className="skeleton h-32 rounded-[24px]" />
        <div className="skeleton h-32 rounded-[24px]" />
      </div>
    </div>
  );
}