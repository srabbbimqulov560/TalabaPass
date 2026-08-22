import { ArrowUpRight, Bookmark, MapPin, Star } from 'lucide-react';
import { Link } from 'wouter';
import type { Discount } from '@workspace/api-client-react';
import { useLanguage } from '@/lib/i18n';

function isImage(value?: string | null) {
  return Boolean(value && (value.startsWith('http') || value.startsWith('/')));
}

export function BrandMark({ value, accent, size = 'md' }: { value?: string; accent: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'h-16 w-16 text-xl rounded-2xl' : size === 'sm' ? 'h-10 w-10 text-xs rounded-xl' : 'h-12 w-12 text-sm rounded-2xl';
  return isImage(value) ? <img src={value} alt="" className={`${sizeClass} object-cover`} /> : <span className={`${sizeClass} grid place-items-center font-display font-bold`} style={{ backgroundColor: `${accent}22`, color: accent }}>{value?.slice(0, 3).toUpperCase() || 'SP'}</span>;
}

export function OfferVisual({ offer, compact = false }: { offer: Discount; compact?: boolean }) {
  if (isImage(offer.image)) return <img src={offer.image!} alt="" className={`h-full w-full object-cover ${compact ? 'rounded-[18px]' : ''}`} />;
  return (
    <div className={`relative h-full w-full overflow-hidden ${compact ? 'rounded-[18px]' : ''}`} style={{ background: `linear-gradient(135deg, ${offer.accent} 0%, ${offer.accent}cc 52%, #17233c 52%, #17233c 100%)` }}>
      <span className="absolute -right-5 -top-8 h-28 w-28 rounded-full border-[14px] border-white/15" />
      <span className="absolute bottom-[-45px] left-[-24px] h-36 w-36 rounded-full border-[18px] border-white/10" />
      <span className="absolute bottom-4 left-4 max-w-[80%] font-display text-lg font-bold leading-tight text-white/90">{offer.name}</span>
    </div>
  );
}

export function DiscountCard({ offer, onFavorite }: { offer: Discount; onFavorite?: (offer: Discount) => void }) {
  const { t } = useLanguage();
  return (
    <article className="group relative overflow-hidden rounded-[24px] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-float">
      <Link href={`/discount/${offer.id}`} className="block">
        <div className="relative h-40 overflow-hidden">
          <OfferVisual offer={offer} />
          <div className="absolute left-3 top-3 flex gap-2">
            {offer.isNew ? <span className="rounded-full bg-[#f6cb6e] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#573916]">New</span> : null}
            <span className="rounded-full bg-white/88 px-2.5 py-1 text-[10px] font-bold text-[#26304a] backdrop-blur">{offer.category}</span>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <BrandMark value={offer.logo} accent={offer.accent} size="sm" />
            <div className="min-w-0 flex-1">
              <span className="block truncate font-display text-[16px] font-bold tracking-[-.025em] text-[hsl(var(--foreground))]">{offer.name}</span>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]"><MapPin size={12} />{offer.location}<span className="text-[hsl(var(--border))]">•</span>{offer.distance}</div>
            </div>
            <div className="shrink-0 text-right"><div className="font-display text-xl font-bold text-[hsl(var(--accent))]">{offer.discount}%</div><div className="text-[9px] font-bold uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">{t('off')}</div></div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-[hsl(var(--border)/.7)] pt-3">
            <span className="flex items-center gap-1 text-xs font-semibold text-[hsl(var(--foreground))]"><Star size={13} fill="#f1b95b" strokeWidth={0} /> {offer.rating.toFixed(1)} <span className="font-normal text-[hsl(var(--muted-foreground))]">({offer.reviewCount})</span></span>
            <span className="flex items-center gap-1 text-xs font-bold text-[hsl(var(--primary))] transition-colors group-hover:text-[hsl(var(--accent))]">{t('view_offer')} <ArrowUpRight size={14} /></span>
          </div>
        </div>
      </Link>
      <button type="button" onClick={(e) => { e.preventDefault(); onFavorite?.(offer); }} aria-label="Save offer" className={`absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full backdrop-blur transition-transform hover:scale-110 ${offer.isFavorite ? 'bg-[#f6cb6e] text-[#573916]' : 'bg-[#17233c]/55 text-white'}`}>
        <Bookmark size={16} fill={offer.isFavorite ? 'currentColor' : 'none'} />
      </button>
    </article>
  );
}

export function OfferCardSkeleton() {
  return <div className="overflow-hidden rounded-[24px] border border-[hsl(var(--border))] bg-[hsl(var(--card))]"><div className="skeleton h-40" /><div className="space-y-3 p-4"><div className="skeleton h-5 w-3/4 rounded" /><div className="skeleton h-3 w-1/2 rounded" /><div className="skeleton h-8 w-full rounded" /></div></div>;
}