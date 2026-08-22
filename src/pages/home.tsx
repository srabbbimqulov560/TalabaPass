import { useMemo, useState } from 'react';
import { ArrowRight, LocateFixed, Search, SlidersHorizontal, Sparkles, Tag, X } from 'lucide-react';
import { Link } from 'wouter';
import { useGetDiscountSummary, useListDiscounts, useToggleFavorite, getListDiscountsQueryKey } from '@workspace/api-client-react';
import type { Discount } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { DiscountCard, OfferCardSkeleton } from '@/components/discount-card';
import { useLanguage } from '@/lib/i18n';
import { ScrollReveal } from '@/components/scroll-reveal';

function Section({ title, eyebrow, offers, loading, onFavorite, href }: { title: string; eyebrow: string; offers?: Discount[]; loading?: boolean; onFavorite: (offer: Discount) => void; href?: string }) {
  const { t } = useLanguage();
  return <section className="mt-11">
    <ScrollReveal>
      <div className="mb-4 flex items-end justify-between">
        <div><div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--accent))]"><Sparkles size={12} />{eyebrow}</div><h2 className="font-display text-2xl font-bold tracking-[-.045em] text-[hsl(var(--foreground))]">{title}</h2></div>
        {href ? <Link href={href} className="flex items-center gap-1 text-xs font-bold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--accent))]">{t('see_all')} <ArrowRight size={14} /></Link> : null}
      </div>
    </ScrollReveal>
    {loading ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((i) => <OfferCardSkeleton key={i} />)}</div> : offers?.length ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {offers.slice(0, 3).map((offer, index) => (
        <ScrollReveal key={offer.id} delay={index * 100}>
          <DiscountCard offer={offer} onFavorite={onFavorite} />
        </ScrollReveal>
      ))}
    </div> : <div className="rounded-[22px] border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card)/.5)] p-8 text-center text-sm text-[hsl(var(--muted-foreground))]">No offers found.</div>}
  </section>;
}

export default function HomePage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [location, setLocation] = useState('Everywhere');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const params = useMemo(() => ({ search: search || undefined, category: category === 'All' ? undefined : category, location: location === 'Everywhere' ? undefined : location }), [search, category, location]);
  const all = useListDiscounts(params);
  const popular = useListDiscounts({ section: 'popular' });
  const newest = useListDiscounts({ section: 'new' });
  const nearby = useListDiscounts({ section: 'nearby' });
  const summary = useGetDiscountSummary();
  const favorite = useToggleFavorite();
  
  const toggleFavorite = (offer: Discount) => {
    favorite.mutate({ id: offer.id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListDiscountsQueryKey(params) }); queryClient.invalidateQueries({ queryKey: getListDiscountsQueryKey({ section: 'popular' }) }); } });
  };
  const hasFilters = Boolean(search || category !== 'All' || location !== 'Everywhere');

  const categories = [t('all_categories'), 'Cafes', 'Shops', 'Learning', 'IT services'];
  const locations = [t('everywhere'), 'Chilanzar', 'Yunusabad', 'Mirzo Ulugbek', 'City centre'];

  return <div className="page-enter">
    <ScrollReveal>
      <section className="relative overflow-hidden rounded-[30px] bg-[hsl(var(--primary))] px-6 py-9 text-[hsl(var(--primary-foreground))] shadow-float md:px-10 md:py-12">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[36px] border-[hsl(var(--accent)/.2)]" /><div className="absolute -bottom-24 right-28 h-48 w-48 rounded-full border-[22px] border-[#f1c46b]/15" />
        <div className="relative max-w-2xl"><div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-[#f5d88e]"><LocateFixed size={13} /> Tashkent, Uzbekistan</div>
        <h1 className="font-display text-[clamp(2.3rem,7vw,4.7rem)] font-bold leading-[.98] tracking-[-.065em]">{t('hero_title_1')}<br /><span className="text-[#f1c46b]">{t('hero_title_2')}</span></h1>
        <p className="mt-5 max-w-lg text-sm leading-6 text-white/70 md:text-base">{t('hero_subtitle')}</p></div>
        <div className="relative mt-8 flex max-w-2xl items-center gap-2 rounded-2xl bg-[hsl(var(--card))] p-2 shadow-float"><Search size={19} className="ml-3 shrink-0 text-[hsl(var(--muted-foreground))]" /><input value={search} onChange={(e) => setSearch(e.target.value)} type="search" placeholder={t('search_placeholder')} className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground))]" /><button type="button" onClick={() => setFiltersOpen((value) => !value)} className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors ${filtersOpen || hasFilters ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]' : 'bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]'}`}><SlidersHorizontal size={18} /></button></div>
        {filtersOpen ? <div className="relative mt-3 grid gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur md:grid-cols-2"><label className="text-xs font-semibold text-white/70">{t('category')}<select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full rounded-xl border-0 bg-white/10 px-3 py-2.5 text-sm text-white outline-none">{categories.map((item) => <option key={item} className="text-[#19233b]" value={item}>{item}</option>)}</select></label><label className="text-xs font-semibold text-white/70">{t('area')}<select value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 block w-full rounded-xl border-0 bg-white/10 px-3 py-2.5 text-sm text-white outline-none">{locations.map((item) => <option key={item} className="text-[#19233b]" value={item}>{item}</option>)}</select></label></div> : null}
      </section>
    </ScrollReveal>
    
    <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
      {[
        ['totalDiscounts', t('offers_nearby'), ''], 
        ['popularCount', t('popular_now'), ''], 
        ['newCount', t('just_arrived'), ''], 
        ['nearbyCount', t('close_to_you'), '']
      ].map(([key, label, note], index) => (
        <ScrollReveal key={key} delay={index * 100}>
          <div className="rounded-[20px] border border-[hsl(var(--border))] bg-[hsl(var(--card)/.72)] p-4 shadow-soft"><div className={`mb-3 h-1 w-9 rounded-full ${index === 1 ? 'bg-[#f1c46b]' : 'bg-[hsl(var(--accent))]'}`} /><div className="font-display text-2xl font-bold tracking-[-.05em]">{summary.data?.[key as keyof typeof summary.data] ?? '—'}</div><div className="mt-1 text-[11px] font-semibold text-[hsl(var(--foreground))]">{label}</div></div>
        </ScrollReveal>
      ))}
    </section>
    
    {hasFilters ? <div className="mt-8 flex items-center gap-2"><span className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Filtered</span><button type="button" onClick={() => { setSearch(''); setCategory('All'); setLocation('Everywhere'); }} className="flex items-center gap-1 rounded-full bg-[hsl(var(--secondary))] px-3 py-1.5 text-xs font-bold">{t('clear')} <X size={12} /></button></div> : null}
    
    {hasFilters ? <Section title={t('matching_offers')} eyebrow={t('your_search')} offers={all.data} loading={all.isLoading} onFavorite={toggleFavorite} /> : <><Section title={t('popular_with_students')} eyebrow={t('popular_now')} offers={popular.data} loading={popular.isLoading} onFavorite={toggleFavorite} href="/?section=popular" /><Section title={t('fresh_this_week')} eyebrow={t('just_arrived')} offers={newest.data} loading={newest.isLoading} onFavorite={toggleFavorite} href="/?section=new" /><Section title={t('short_walk_away')} eyebrow={t('close_to_you')} offers={nearby.data} loading={nearby.isLoading} onFavorite={toggleFavorite} href="/?section=nearby" /></>}
    
    <ScrollReveal>
      <div className="mt-12 flex items-center justify-between rounded-[24px] bg-[#e8f1e7] px-5 py-5 text-[#213c32] md:px-7"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-[#c6dfc5]"><Tag size={18} /></div><div><div className="font-display text-sm font-bold">{t('verified_students_only')}</div><div className="mt-0.5 text-xs text-[#557062]">{t('every_redemption')}</div></div></div><Link href="/profile" className="hidden text-xs font-bold md:block">{t('view_your_pass')}</Link></div>
    </ScrollReveal>
  </div>;
}