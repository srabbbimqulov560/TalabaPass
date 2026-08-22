import { useState } from 'react';
import { ArrowLeft, Bookmark, Check, Clock3, Copy, MapPin, ShieldCheck, Star, Ticket, X } from 'lucide-react';
import { Link, useLocation, useParams } from 'wouter';
import { useGetDiscount, getGetDiscountQueryKey, useRedeemDiscount, useToggleFavorite } from '@workspace/api-client-react';
import { BrandMark, OfferVisual } from '@/components/discount-card';
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
  const redeem = useRedeemDiscount();
  const [redeemed, setRedeemed] = useState<{ code: string; businessName: string } | null>(null);
  const [notice, setNotice] = useState('');
  const offer = detail.data;

  const handleFavorite = () => { favorite.mutate({ id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetDiscountQueryKey(id) }); setNotice(offer?.isFavorite ? 'Removed from your pass' : 'Saved to your pass'); setTimeout(() => setNotice(''), 2200); } }); };
  const handleRedeem = () => { redeem.mutate({ id }, { onSuccess: (result) => setRedeemed({ code: result.code, businessName: result.businessName }), onError: () => setNotice('We could not verify your pass. Please try again.') }); };

  if (detail.isLoading) return <DetailSkeleton />;
  if (detail.isError || !offer) return <div className="page-enter py-20 text-center"><div className="mx-auto max-w-sm rounded-[28px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-soft"><div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#f8e4bf] text-[#7c5c24]"><Ticket /></div><h1 className="font-display text-xl font-bold">Offer not found</h1><p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">This deal may have moved on.</p><Link href="/" className="mt-6 inline-flex rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))]">{t('back_to_discover')}</Link></div></div>;
  
  return <div className="page-enter">
    <button type="button" onClick={() => setLocation('/')} className="mb-5 flex items-center gap-2 text-sm font-bold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"><ArrowLeft size={17} />{t('back_to_discover')}</button>
    
    <div className="grid gap-7 lg:grid-cols-[1.08fr_.92fr]">
      <div>
        <div className="relative h-[290px] overflow-hidden rounded-[30px] shadow-soft md:h-[410px]">
          <OfferVisual offer={offer} />
          <div className="absolute inset-x-4 bottom-4 flex items-end justify-between"><span className="rounded-full bg-[hsl(var(--card)/.9)] px-3 py-1.5 text-xs font-bold text-[hsl(var(--foreground))] backdrop-blur">{offer.category}</span><span className="rounded-full bg-[#f1c46b] px-3 py-1.5 font-display text-sm font-bold text-[#573916]">{offer.discount}% {t('off')}</span></div>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-start gap-3">
          <BrandMark value={offer.logo} accent={offer.accent} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-[clamp(2rem,5vw,3.4rem)] font-bold leading-[.98] tracking-[-.065em]">{offer.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[hsl(var(--muted-foreground))]"><span className="flex items-center gap-1"><Star size={14} fill="#f1b95b" strokeWidth={0} />{offer.rating.toFixed(1)} ({offer.reviewCount} reviews)</span><span className="flex items-center gap-1"><MapPin size={14} />{offer.distance}</span></div>
          </div>
          <button type="button" onClick={handleFavorite} className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-colors ${offer.isFavorite ? 'border-[#e7c77b] bg-[#f8df9b] text-[#694718]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))]'}`}><Bookmark size={19} fill={offer.isFavorite ? 'currentColor' : 'none'} /></button>
        </div>
        
        <p className="mt-6 text-[15px] leading-7 text-[hsl(var(--muted-foreground))]">{offer.description}</p>
        
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-[hsl(var(--secondary)/.62)] p-4">
            <div className="mb-2 flex items-center gap-2 text-[hsl(var(--accent))]"><MapPin size={17} /><span className="text-[10px] font-bold uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">{t('find_us')}</span></div>
            <div className="text-sm font-semibold">{offer.address}</div>
            <div className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{offer.location}</div>
          </div>
          <div className="rounded-2xl bg-[hsl(var(--secondary)/.62)] p-4">
            <div className="mb-2 flex items-center gap-2 text-[#c38922]"><Clock3 size={17} /><span className="text-[10px] font-bold uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">{t('open_hours')}</span></div>
            <div className="text-sm font-semibold">{offer.hours}</div>
            <div className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{t('check_before_you_go')}</div>
          </div>
        </div>

        <div className="mt-auto pt-7">
          <div className="mb-3 flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]"><ShieldCheck size={15} className="text-[hsl(var(--accent))]" /> {t('verification_notice')}</div>
          <button type="button" onClick={handleRedeem} disabled={redeem.isPending || Boolean(redeemed)} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[hsl(var(--primary))] px-5 py-4 font-display text-base font-bold text-[hsl(var(--primary-foreground))] shadow-soft transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70">{redeemed ? <><Check size={18} />Pass generated</> : redeem.isPending ? 'Checking...' : <>{t('redeem_offer')} <ArrowLeft className="rotate-180" size={17} /></>}</button>
        </div>
      </div>
    </div>

    <div className="mt-12 grid gap-7 border-t border-[hsl(var(--border))] pt-8 lg:grid-cols-[1.1fr_.9fr]">
      <section>
        <h2 className="font-display text-xl font-bold">{t('students_say')}</h2>
        <div className="mt-4 space-y-3">
          {offer.reviews?.length ? offer.reviews.map((review) => <div key={review.id} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">...</div>) : <p className="rounded-2xl bg-[hsl(var(--secondary)/.6)] p-5 text-sm text-[hsl(var(--muted-foreground))]">{t('no_reviews')}</p>}
        </div>
      </section>
      <aside className="rounded-[24px] bg-[#e8f1e7] p-6 text-[#213c32]">
        <h2 className="font-display text-xl font-bold">{t('good_to_know')}</h2>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-[#557062]">{(offer.terms || []).map((term) => <li key={term} className="flex gap-2"><Check size={16} className="mt-1 shrink-0 text-[#3a9270]" />{term}</li>)}</ul>
      </aside>
    </div>
    
    {notice ? <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-xs font-bold text-[hsl(var(--primary-foreground))] shadow-float">{notice}<button type="button" onClick={() => setNotice('')}><X size={14} /></button></div> : null}
    {redeemed ? <div className="fixed inset-0 z-50 grid place-items-center bg-[#17233c]/55 p-5 backdrop-blur-sm"><div className="relative w-full max-w-sm rounded-[28px] bg-[hsl(var(--card))] p-7 text-center shadow-float"><button type="button" onClick={() => setRedeemed(null)} className="absolute right-4 top-4 text-[hsl(var(--muted-foreground))]"><X size={19} /></button><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#d9e9df] text-[#27785c]"><Check size={27} /></div><div className="mt-4 text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--accent))]">Your student pass</div><h2 className="mt-2 font-display text-2xl font-bold">Show this code</h2><div className="my-5 rounded-2xl border-2 border-dashed border-[hsl(var(--accent)/.45)] bg-[#eff7ed] px-4 py-4 font-mono text-2xl font-bold tracking-[.18em] text-[#245b48]">{redeemed.code}</div><p className="text-xs text-[hsl(var(--muted-foreground))]">Valid at {redeemed.businessName}.</p><button type="button" onClick={() => navigator.clipboard?.writeText(redeemed.code)} className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[hsl(var(--primary))]"><Copy size={14} /> Copy code</button></div></div> : null}
  </div>;
}

function DetailSkeleton() {
  return <div className="page-enter"><div className="skeleton mb-5 h-5 w-32 rounded" /><div className="grid gap-7 lg:grid-cols-2"><div className="skeleton h-[290px] rounded-[30px] md:h-[410px]" /><div className="space-y-5"><div className="skeleton h-16 w-3/4 rounded-2xl" /><div className="skeleton h-24 rounded-2xl" /><div className="skeleton h-28 rounded-2xl" /><div className="skeleton h-14 rounded-2xl" /></div></div></div>;
}