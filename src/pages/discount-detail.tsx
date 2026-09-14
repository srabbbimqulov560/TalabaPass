import { useState, useEffect } from 'react';
import { ArrowLeft, Bookmark, Clock3, MapPin, Store, Ticket, X, CalendarDays, Tag } from 'lucide-react';
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

  // KO'RISHLARNI (+1) YOZISH (Unique qoidasi orqali qayta yozilmaydi)
  useEffect(() => {
    async function trackView() {
      if (!id || !offer?.merchant_id) return;
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // .catch() olib tashlandi. Supabase takroriy yozish xatosini o'zi e'tiborsiz qoldiradi.
        await supabase.from('discount_views').insert({
          discount_id: id, 
          merchant_id: offer.merchant_id, 
          student_id: user.id
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
  
  // Biznes qo'shgan "Burger, Lavash" kabi teglarni massivga aylantiramiz
  const productTags = offer.product_name.split(',').map((tag: string) => tag.trim()).filter(Boolean);

  return (
    <div className="page-enter flex flex-col h-[calc(100dvh-200px)] max-w-3xl mx-auto overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
      
      <button onClick={() => setLocation('/')} className="mb-3 flex items-center gap-2 text-sm font-bold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] shrink-0">
        <ArrowLeft size={17} /> Bosh sahifaga qaytish
      </button>
      
      {/* RASM QISMI (Gorizontal) */}
      <div className="w-full flex-1 min-h-[180px] max-h-[30vh] rounded-[28px] overflow-hidden shadow-sm mb-5 flex items-center justify-center bg-[hsl(var(--secondary))] border border-[hsl(var(--card-border))] shrink-0 relative group">
        <img src={offer.image_url} className="w-full h-full object-cover" alt="Discount Cover" />
        
        {/* Do'kon logotipi rasm ustida */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-[hsl(var(--card))/95] backdrop-blur-md px-4 py-2 rounded-full border border-[hsl(var(--border))] shadow-sm">
          {offer.merchant?.logo_url ? (
            <img src={offer.merchant.logo_url} className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <Store size={18} className="text-[hsl(var(--muted-foreground))]" />
          )}
          <span className="text-[13px] font-bold text-[hsl(var(--foreground))] line-clamp-1">{offer.merchant?.name}</span>
        </div>
      </div>
      
      <div className="flex items-start justify-between gap-3 shrink-0 mb-5">
        <div>
          {/* TEGLAR */}
          <div className="flex flex-wrap gap-2 mb-3">
            {productTags.map((tag: string, idx: number) => (
              <span key={idx} className="flex items-center gap-1.5 text-[12px] font-bold text-[hsl(var(--foreground))] bg-[hsl(var(--secondary))] px-3 py-1.5 rounded-xl border border-[hsl(var(--border))]">
                <Tag size={12} className="text-[hsl(var(--accent))]" /> {tag}
              </span>
            ))}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-[hsl(var(--muted-foreground))]">
            <span className="flex items-center gap-1 text-[16px] font-extrabold text-[hsl(var(--primary-foreground))] bg-red-500 px-4 py-1.5 rounded-full shadow-sm">
              -{offer.discount_percent}% CHEGIRMA
            </span>
          </div>
        </div>

        <button onClick={handleFavorite} className={`shrink-0 p-3.5 rounded-full border shadow-sm transition-transform active:scale-90 ${isSaved ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/.1)] text-[hsl(var(--accent))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))]'}`}>
          <Bookmark size={22} fill={isSaved ? 'currentColor' : 'none'} />
        </button>
      </div>
      
      <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 shrink-0 mb-4">
        {/* MANZIL KARTASI */}
        <div className="rounded-[24px] bg-[hsl(var(--card))] border border-[hsl(var(--card-border))] p-5 shadow-sm flex flex-col justify-center">
          <div className="mb-2 flex items-center gap-1.5 text-[hsl(var(--accent))]">
            <MapPin size={18} />
            <span className="text-[11px] font-bold uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">Manzil va Ma'lumot</span>
          </div>
          <div className="text-[14px] font-semibold text-[hsl(var(--foreground))] whitespace-pre-line leading-relaxed">
            {offer.merchant?.description || "Manzil kiritilmagan"}
          </div>
        </div>
        
        {/* AMAL QILISH VAQTI KARTASI */}
        <div className="rounded-[24px] bg-[hsl(var(--card))] border border-[hsl(var(--card-border))] p-5 shadow-sm flex flex-col justify-center">
          <div className="mb-2 flex items-center gap-1.5 text-[#c38922]">
            <Clock3 size={18} />
            <span className="text-[11px] font-bold uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">Amal qilish vaqti</span>
          </div>
          <div className="flex items-center gap-2 text-[15px] font-bold text-[hsl(var(--foreground))] mb-2">
            <Clock3 size={16} className="text-[hsl(var(--muted-foreground))]" />
            {offer.start_time.slice(0, 5)} - {offer.end_time.slice(0, 5)}
          </div>
          <div className="flex items-center gap-2 text-[13px] font-semibold text-[hsl(var(--muted-foreground))] bg-[hsl(var(--secondary))] p-2 rounded-xl">
            <CalendarDays size={16} className="text-[hsl(var(--foreground))]" />
            {offer.start_date.slice(5).replace('-', '.')} dan {offer.end_date.slice(5).replace('-', '.')} gacha
          </div>
        </div>
      </div>

      <div className="mt-auto shrink-0 pb-2 pt-2">
        <button onClick={() => setLocation('/qr')} className="flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-4 font-display text-[17px] font-bold text-[hsl(var(--primary-foreground))] shadow-float transition-transform hover:-translate-y-0.5 active:scale-[0.98]">
          Chegirmani olish (QR Kodi) <ArrowLeft className="rotate-180" size={18} />
        </button>
      </div>
      
      {notice && (
        <div className="fixed bottom-[100px] md:bottom-5 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-xs font-bold text-[hsl(var(--primary-foreground))] shadow-float">
          {notice} <button onClick={() => setNotice('')}><X size={14} /></button>
        </div>
      )}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="page-enter flex flex-col h-[calc(100dvh-200px)] max-w-3xl mx-auto">
      <div className="skeleton mb-3 h-5 w-32 rounded shrink-0" />
      <div className="skeleton w-full flex-1 max-h-[30vh] min-h-[160px] rounded-[28px] mb-5 shrink-0" />
      <div className="flex justify-between items-start mb-4 shrink-0">
        <div className="w-full">
          <div className="skeleton h-8 w-2/3 rounded-xl mb-2" />
          <div className="skeleton h-4 w-1/3 rounded mb-3" />
        </div>
        <div className="skeleton h-12 w-12 rounded-full shrink-0" />
      </div>
      <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 shrink-0 mb-4">
        <div className="skeleton h-24 rounded-[24px]" />
        <div className="skeleton h-24 rounded-[24px]" />
      </div>
    </div>
  );
}