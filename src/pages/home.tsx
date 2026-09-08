import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { ArrowRight, Search, Sparkles, X, Coffee, ShoppingBag, BookOpen, Monitor, LayoutGrid } from 'lucide-react';
import { Link } from 'wouter';
import { useGetDiscountSummary, useListDiscounts } from '@workspace/api-client-react';
import type { Discount } from '@workspace/api-client-react';
import { DiscountCard, OfferCardSkeleton } from '@/components/discount-card';
import { useLanguage } from '@/lib/i18n';
import { ScrollReveal } from '@/components/scroll-reveal';
import { useFavorites } from '@/lib/useFavorites';

const BANNERS = [
  { id: 1, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80", title: "Maxsus Takliflar" },
  { id: 2, image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80", title: "Kiyim Kechaklar" },
  { id: 3, image: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=800&q=80", title: "O'quv Markazlari" },
  { id: 4, image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80", title: "Texnologiyalar" }
];

function Section({ title, eyebrow, offers, loading, onFavorite, href }: { title: string; eyebrow: string; offers?: Discount[]; loading?: boolean; onFavorite: (offer: Discount) => void; href?: string }) {
  const { t } = useLanguage();
  return (
    <section className="mt-8">
      <ScrollReveal>
        <div className="mb-4 flex items-end justify-between px-1">
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--accent))]">
              <Sparkles size={12} />{eyebrow}
            </div>
            <h2 className="font-display text-xl font-bold tracking-[-.02em] text-[hsl(var(--foreground))]">{title}</h2>
          </div>
          {href && (
            <Link href={href} className="flex items-center gap-1 text-xs font-bold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--accent))]">
              {t('see_all')} <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </ScrollReveal>
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <OfferCardSkeleton key={i} />)}
        </div>
      ) : offers?.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offers.slice(0, 3).map((offer, index) => (
            <ScrollReveal key={offer.id} delay={index * 100}>
              <DiscountCard offer={offer} onFavorite={onFavorite} />
            </ScrollReveal>
          ))}
        </div>
      ) : (
        <div className="rounded-[22px] border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card)/.5)] p-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
          {t('no_offers_found')}
        </div>
      )}
    </section>
  );
}

export default function HomePage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const carouselRef = useRef<HTMLDivElement>(null);
  
  const params = useMemo(() => ({ search: search || undefined, category: category === 'All' ? undefined : category }), [search, category]);
  
  const all = useListDiscounts(params);
  const popular = useListDiscounts({ section: 'popular' });
  const newest = useListDiscounts({ section: 'new' });
  const nearby = useListDiscounts({ section: 'nearby' });
  
  const { savedIds, toggleFavorite } = useFavorites();
  
  const handleFavorite = useCallback((offer: Discount) => {
    toggleFavorite(String(offer.id));
  }, [toggleFavorite]);

  const mapOffers = useCallback((offers?: Discount[]) => 
    offers?.map(o => ({ ...o, isFavorite: savedIds.includes(String(o.id)) })),
  [savedIds]);

  useGetDiscountSummary(); 
  const hasFilters = Boolean(search || category !== 'All');

  // HAQIQIY CHEKSIZ KARUSEL YECHIMI
  // 4 ta bannerni 50 marta ko'paytirib, jami 200 ta qilamiz. Bu ularni aslo tugamasligini ta'minlaydi.
  // loading="lazy" bo'lgani uchun xotiraga hech qanday og'irligi tushmaydi.
  const infiniteBanners = Array(50).fill(BANNERS).flat();

  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current) {
        const carousel = carouselRef.current;
        const firstChild = carousel.firstElementChild as HTMLElement;
        
        if (firstChild) {
          // Bitta bannerning aniq kengligi va o'rtadagi joy (16px gap) ni hisoblash
          const itemWidth = firstChild.offsetWidth + 16;
          
          // Agar haqiqatan ham 200 ta bannerning oxiriga yetsak (juda kam ehtimol), orqaga sakratmasdan sezdirmay 0 ga qaytaradi
          if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - itemWidth) {
            carousel.scrollTo({ left: 0 }); 
          } else {
            // Faqat bitta banner kengligida ohista o'ngga surish
            carousel.scrollBy({ left: itemWidth, behavior: 'smooth' });
          }
        }
      }
    }, 3500); // Har 3.5 soniyada navbatdagisiga o'tadi
    
    return () => clearInterval(interval);
  }, []);

  const categories = useMemo(() => [
    { id: 'All', label: t('all_categories'), icon: LayoutGrid, color: 'bg-blue-500', shadow: 'shadow-blue-500/30' },
    { id: 'Cafes', label: t('category_cafes') || 'Kafelar', icon: Coffee, color: 'bg-red-500', shadow: 'shadow-red-500/30' },
    { id: 'Shops', label: t('category_shops') || "Do'konlar", icon: ShoppingBag, color: 'bg-orange-500', shadow: 'shadow-orange-500/30' },
    { id: 'Learning', label: t('category_learning') || "Ta'lim", icon: BookOpen, color: 'bg-green-500', shadow: 'shadow-green-500/30' },
    { id: 'IT services', label: t('category_it') || 'IT Xizmatlar', icon: Monitor, color: 'bg-purple-500', shadow: 'shadow-purple-500/30' },
  ], [t]);

  return (
    <div className="page-enter pb-10">
      
      <ScrollReveal>
        <div className="relative flex items-center bg-[hsl(var(--card))] rounded-2xl p-1.5 shadow-sm border border-[hsl(var(--border))] mb-6">
          <Search size={20} className="ml-3 shrink-0 text-[hsl(var(--muted-foreground))]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} type="search" placeholder={t('search_placeholder')} className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm font-medium text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground))]" />
          {search && (
            <button onClick={() => setSearch('')} className="p-2 text-[hsl(var(--muted-foreground))] hover:text-red-500 mr-1">
              <X size={18}/>
            </button>
          )}
        </div>
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <div ref={carouselRef} className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-5 px-5 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
          {infiniteBanners.map((banner, idx) => (
            <div key={`${banner.id}-${idx}`} className="min-w-[85%] md:min-w-[400px] snap-center relative rounded-3xl overflow-hidden shadow-md aspect-[21/9]">
              <img src={banner.image} alt={banner.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-5">
                <h3 className="text-white font-display font-bold text-xl">{banner.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>

      <ScrollReveal delay={200}>
        {/* KATEGORIYALAR KOMPYUTERDA (O'RTADAN YOYILADI VA ORASI OCHIQ) */}
        <div className="flex overflow-x-auto gap-5 md:gap-10 pb-6 pt-6 mt-2 -mx-5 px-5 md:-mx-4 md:px-4 md:justify-center [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
          {categories.map((cat) => (
            <div key={cat.id} onClick={() => setCategory(cat.id)} className="flex flex-col items-center gap-2 cursor-pointer flex-shrink-0">
              <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-white transition-all duration-300 ${cat.color} ${category === cat.id ? `shadow-lg scale-110 ${cat.shadow} ring-4 ring-offset-2 ring-offset-[hsl(var(--background))] ring-[hsl(var(--border))]` : ''}`}>
                <cat.icon size={26} className="md:w-8 md:h-8" strokeWidth={2.5} />
              </div>
              <span className={`text-[11px] md:text-[13px] font-bold ${category === cat.id ? 'text-[hsl(var(--foreground))]' : 'text-[hsl(var(--muted-foreground))]'}`}>{cat.label}</span>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {hasFilters ? (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">{t('showing_results')}</span>
            <button type="button" onClick={() => { setSearch(''); setCategory('All'); }} className="flex items-center gap-1 rounded-full bg-[hsl(var(--secondary))] px-3 py-1.5 text-xs font-bold text-[hsl(var(--foreground))]">
              {t('clear')} <X size={12} />
            </button>
          </div>
          <Section title={t('matching_offers')} eyebrow={t('your_search')} offers={mapOffers(all.data)} loading={all.isLoading} onFavorite={handleFavorite} />
        </div>
      ) : (
        <>
          <Section title={t('popular_with_students')} eyebrow={t('popular_now')} offers={mapOffers(popular.data)} loading={popular.isLoading} onFavorite={handleFavorite} href="/?section=popular" />
          <Section title={t('fresh_this_week')} eyebrow={t('just_arrived')} offers={mapOffers(newest.data)} loading={newest.isLoading} onFavorite={handleFavorite} href="/?section=new" />
          <Section title={t('short_walk_away')} eyebrow={t('close_to_you')} offers={mapOffers(nearby.data)} loading={nearby.isLoading} onFavorite={handleFavorite} href="/?section=nearby" />
        </>
      )}
    </div>
  );
}