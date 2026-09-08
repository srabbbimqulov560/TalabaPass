import { Bookmark, Map, LocateFixed } from 'lucide-react';
import { Link } from 'wouter';
import type { Discount } from '@workspace/api-client-react';
import { useLanguage } from '@/lib/i18n';

export function DiscountCard({ offer, onFavorite }: { offer: Discount; onFavorite?: (offer: Discount) => void }) {
  const { t } = useLanguage();
  const imgSrc = offer.image || offer.logo;
  const fallbackBg = `linear-gradient(135deg, ${offer.accent || '#1caa88'} 0%, #17233c 100%)`;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); // Event ko'payib ketishini to'xtatadi
    onFavorite?.(offer);
  };

  return (
    <article className="relative flex items-center gap-4 bg-[hsl(var(--card))] p-3 rounded-[20px] shadow-sm border border-[hsl(var(--card-border))] transition-all hover:bg-[hsl(var(--secondary)/.4)] active:scale-[0.98]">
      
      <Link href={`/discount/${offer.id}`} className="shrink-0 relative w-[90px] h-[90px] rounded-2xl overflow-hidden shadow-sm" style={!imgSrc ? { background: fallbackBg } : undefined}>
        {imgSrc ? (
          // OPTIMIZATSIYA: loading="lazy" qotishlarni yo'q qiladi
          <img src={imgSrc} alt={offer.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-display font-bold text-white text-xl">
            {offer.name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </Link>

      <Link href={`/discount/${offer.id}`} className="flex flex-col flex-1 py-0.5 min-w-0 pr-6">
        <h3 className="font-display font-bold text-[16px] leading-tight text-[hsl(var(--foreground))] truncate">
          {offer.name}
        </h3>
        
        <div className="flex items-center gap-1 mt-1.5">
          <span className="inline-flex items-center gap-1 text-[12px] font-bold text-[hsl(var(--accent))]">
            {t('discount_amount')} {offer.discount}%
          </span>
        </div>
        
        <div className="flex items-center gap-1.5 mt-2 text-[11px] font-medium text-[hsl(var(--muted-foreground))] truncate">
           <Map size={13} className="shrink-0" />
           <span>{offer.distance}</span>
           <span className="text-[hsl(var(--border))]">|</span>
           <span className="flex items-center gap-1 text-emerald-500">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span> Faol
           </span>
        </div>

        <div className="flex items-start gap-1.5 mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">
           <LocateFixed size={13} className="shrink-0 mt-0.5" />
           <span className="line-clamp-1 leading-snug">{offer.address || offer.location || "Toshkent shahri"}</span>
        </div>
      </Link>

      <button 
        type="button" 
        onClick={handleFavoriteClick} 
        aria-label="Save offer" 
        className="absolute right-3 top-3 p-1.5 rounded-full text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--accent))] transition-colors"
      >
        <Bookmark size={20} fill={offer.isFavorite ? 'currentColor' : 'none'} className={offer.isFavorite ? 'text-[hsl(var(--accent))]' : ''} />
      </button>
    </article>
  );
}

export function OfferCardSkeleton() {
  return (
    <div className="flex items-center gap-4 bg-[hsl(var(--card))] p-3 rounded-[20px] border border-[hsl(var(--card-border))]">
      <div className="skeleton w-[90px] h-[90px] shrink-0 rounded-2xl" />
      <div className="flex flex-col flex-1 space-y-2 py-1">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-5 w-2/3 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-3 w-full rounded" />
      </div>
    </div>
  );
}