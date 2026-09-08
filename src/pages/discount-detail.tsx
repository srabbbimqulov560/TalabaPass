import { useState } from 'react';
import { ArrowLeft, Bookmark, Clock3, MapPin, Star, Ticket, X } from 'lucide-react';
import { Link, useLocation, useParams } from 'wouter';
import { useGetDiscount, getGetDiscountQueryKey, useToggleFavorite } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/lib/i18n';

export default function DiscountDetailPage() {
  const { t } = useLanguage();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const detail = useGetDiscount(id, { query: { queryKey: getGetDiscountQueryKey(id) } });
  const favorite = useToggleFavorite();
  const [notice, setNotice] = useState('');
  const offer = detail.data;

  const handleFavorite = () => { 
    favorite.mutate({ id }, { 
      onSuccess: () => { 
        queryClient.invalidateQueries({ queryKey: getGetDiscountQueryKey(id) }); 
        setNotice(offer?.isFavorite ? t('removed_from_saved') : t('added_to_saved')); 
        setTimeout(() => setNotice(''), 2200); 
      } 
    }); 
  };
  
  // Tugma bosilganda /qr sahifasiga yo'naltirish
  const handleRedeemClick = () => { 
    setLocation('/qr');
  };

  if (detail.isLoading) return <DetailSkeleton />;
  if (detail.isError || !offer) return (
    <div className="page-enter py-20 text-center pb-28">
      <div className="mx-auto max-w-sm rounded-[28px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-soft">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]">
          <Ticket />
        </div>
        <h1 className="font-display text-xl font-bold text-[hsl(var(--foreground))]">{t('offer_not_found')}</h1>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))]">
          {t('back_to_discover')}
        </Link>
      </div>
    </div>
  );
  
  return (
    <div className="page-enter flex flex-col h-[calc(100dvh-200px)] max-w-3xl mx-auto overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
      
      <button 
        type="button" 
        onClick={() => setLocation('/')} 
        className="mb-3 flex items-center gap-2 text-sm font-bold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] shrink-0"
      >
        <ArrowLeft size={17} /> {t('back_to_discover')}
      </button>
      
      <div 
        className="w-full flex-1 min-h-[120px] max-h-[22vh] rounded-[28px] overflow-hidden shadow-sm mb-5 flex items-center justify-center text-4xl md:text-6xl font-display font-bold border border-[hsl(var(--card-border))] shrink-0" 
        style={{ backgroundColor: `${offer.accent}15`, color: offer.accent || '#1caa88' }}
      >
        {offer.image || offer.logo ? (
          <img src={offer.image || offer.logo} className="w-full h-full object-cover" alt={offer.name} />
        ) : (
          offer.name.slice(0, 2).toUpperCase()
        )}
      </div>
      
      <div className="flex items-start justify-between gap-3 shrink-0 mb-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold leading-tight text-[hsl(var(--foreground))] line-clamp-2">
            {offer.name}
          </h1>
          <p className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))] mt-1 uppercase tracking-wide">
            {offer.category} {t('service_type')}
          </p>
          
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-[hsl(var(--muted-foreground))]">
            <span className="flex items-center gap-1 text-[12px] font-bold text-[hsl(var(--accent))]">
              {t('discount_amount')} {offer.discount}%
            </span>
            <span className="flex items-center gap-1 font-medium text-[hsl(var(--foreground))]">
              <Star size={15} className="text-[#f1b95b]" fill="#f1b95b" strokeWidth={0} />
              {offer.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1 font-medium bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] px-2.5 py-1 rounded-full">
              <MapPin size={13} />
              {offer.distance}
            </span>
          </div>
        </div>

        <button 
          type="button" 
          onClick={handleFavorite} 
          className={`shrink-0 p-3.5 rounded-full border shadow-sm transition-transform active:scale-90 ${offer.isFavorite ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/.1)] text-[hsl(var(--accent))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))]'}`}
        >
          <Bookmark size={20} fill={offer.isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      
      <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 shrink-0 mb-4">
        <div className="rounded-[20px] bg-[hsl(var(--card))] border border-[hsl(var(--card-border))] p-3.5 shadow-sm flex flex-col justify-center">
          <div className="mb-1 flex items-center gap-1.5 text-[hsl(var(--accent))]">
            <MapPin size={14} />
            <span className="text-[9px] font-bold uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">{t('find_us')}</span>
          </div>
          <div className="text-[13px] font-semibold text-[hsl(var(--foreground))] line-clamp-1">{offer.address}</div>
          <div className="text-[11px] text-[hsl(var(--muted-foreground))] line-clamp-1 mt-0.5">{offer.location}</div>
        </div>
        
        <div className="rounded-[20px] bg-[hsl(var(--card))] border border-[hsl(var(--card-border))] p-3.5 shadow-sm flex flex-col justify-center">
          <div className="mb-1 flex items-center gap-1.5 text-[#c38922]">
            <Clock3 size={14} />
            <span className="text-[9px] font-bold uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">{t('open_hours')}</span>
          </div>
          <div className="text-[13px] font-semibold text-[hsl(var(--foreground))] line-clamp-1">{offer.hours}</div>
          <div className="text-[11px] text-[hsl(var(--muted-foreground))] line-clamp-1 mt-0.5">{t('check_before_you_go')}</div>
        </div>
      </div>

      <div className="mt-auto shrink-0 pb-2">
        <button 
          type="button" 
          onClick={handleRedeemClick} 
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-4 font-display text-base font-bold text-[hsl(var(--primary-foreground))] shadow-float transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
        >
          {t('redeem_offer')} <ArrowLeft className="rotate-180" size={17} />
        </button>
      </div>
      
      {notice ? (
        <div className="fixed bottom-[100px] md:bottom-5 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-xs font-bold text-[hsl(var(--primary-foreground))] shadow-float">
          {notice}
          <button type="button" onClick={() => setNotice('')}><X size={14} /></button>
        </div>
      ) : null}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="page-enter flex flex-col h-[calc(100dvh-200px)] max-w-3xl mx-auto">
      <div className="skeleton mb-3 h-5 w-32 rounded shrink-0" />
      <div className="skeleton w-full flex-1 max-h-[22vh] min-h-[120px] rounded-[28px] mb-5 shrink-0" />
      
      <div className="flex justify-between items-start mb-4 shrink-0">
        <div className="w-full">
          <div className="skeleton h-8 w-2/3 rounded-xl mb-2" />
          <div className="skeleton h-4 w-1/3 rounded mb-3" />
          <div className="flex gap-2">
            <div className="skeleton h-6 w-20 rounded-full" />
            <div className="skeleton h-6 w-16 rounded-full" />
          </div>
        </div>
        <div className="skeleton h-12 w-12 rounded-full shrink-0" />
      </div>

      <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 shrink-0 mb-4">
        <div className="skeleton h-20 rounded-[20px]" />
        <div className="skeleton h-20 rounded-[20px]" />
      </div>
      
      <div className="mt-auto shrink-0 pb-2">
        <div className="skeleton h-14 rounded-full w-full" />
      </div>
    </div>
  );
}