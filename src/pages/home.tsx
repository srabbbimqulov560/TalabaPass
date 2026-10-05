import { useMemo, useState, useRef, useEffect } from 'react';
import { Search, X, Coffee, ShoppingBag, BookOpen, Monitor, LayoutGrid, Store, Heart, Zap, Flame, Trophy, ChevronRight } from 'lucide-react';
import { useLocation, Link } from 'wouter';
import { ScrollReveal } from '@/components/scroll-reveal';
import { supabase } from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query'; 
import { useFavorites } from '@/lib/useFavorites';
import { useLanguage } from '@/lib/i18n';

// 🌟 KIRILL-LOTIN AVTO NORMALIZATSIYASI
const normalizeForSearch = (text: string) => {
  if (!text) return '';
  const map: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'j', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'x', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sh', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya', 'қ': 'q', 'ў': 'o', 'ғ': 'g', 'ҳ': 'h'
  };
  return text.toLowerCase().split('').map(char => map[char] || char).join('');
};

export default function HomePage() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient(); 
  
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const carouselRef = useRef<HTMLDivElement>(null);
  
  const { savedIds, toggleFavorite } = useFavorites();

  const { data: allDiscounts, isLoading } = useQuery({
    queryKey: ['allDiscounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discounts')
        .select(`*, merchant:merchants(id, name, logo_url, category)`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5 
  });

  const filteredDiscounts = useMemo(() => {
    if (!allDiscounts) return [];
    const normalizedSearchTerm = normalizeForSearch(search);

    return allDiscounts.filter((discount: any) => {
      const pName = normalizeForSearch(discount.product_name);
      const mName = normalizeForSearch(discount.merchant?.name);
      
      const matchesSearch = pName.includes(normalizedSearchTerm) || mName.includes(normalizedSearchTerm);
      const matchesCategory = category === 'All' || discount.merchant?.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [allDiscounts, search, category]);

  const newDiscounts = allDiscounts ? [...allDiscounts].slice(0, 3) : [];
  const popularDiscounts = allDiscounts ? [...allDiscounts].sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0)).slice(0, 3) : [];
  const topPurchasedDiscounts = allDiscounts ? [...allDiscounts].sort((a, b) => String(a.product_name).localeCompare(String(b.product_name))).slice(0, 3) : [];

  // 🌟 REAL KARUSEL: Bazadagi eng so'nggi 5 ta chegirmani banner qilib olamiz
  const carouselItems = useMemo(() => {
    if (!allDiscounts || allDiscounts.length === 0) return [];
    return allDiscounts.slice(0, 5).map((d: any) => ({
      id: d.id,
      image: d.image_url,
      title: d.short_description || d.product_name,
      merchantName: d.merchant?.name
    }));
  }, [allDiscounts]);

  const infiniteBanners = carouselItems.length > 0 ? Array(10).fill(carouselItems).flat() : [];

  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current) {
        const carousel = carouselRef.current;
        const firstChild = carousel.firstElementChild as HTMLElement;
        if (firstChild) {
          const itemWidth = firstChild.offsetWidth + 16;
          if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - itemWidth) carousel.scrollTo({ left: 0 }); 
          else carousel.scrollBy({ left: itemWidth, behavior: 'smooth' });
        }
      }
    }, 3500); 
    return () => clearInterval(interval);
  }, []);

  const categories = useMemo(() => [
    { id: 'All', label: t('all_categories'), icon: LayoutGrid, color: 'bg-blue-500', shadow: 'shadow-blue-500/30' },
    { id: 'Kafe / Restoran', label: t('category_cafes'), icon: Coffee, color: 'bg-red-500', shadow: 'shadow-red-500/30' },
    { id: 'Kiyim-kechak', label: t('category_shops'), icon: ShoppingBag, color: 'bg-orange-500', shadow: 'shadow-orange-500/30' },
    { id: "O'quv markazi", label: t('category_learning'), icon: BookOpen, color: 'bg-green-500', shadow: 'shadow-green-500/30' },
    { id: 'Texnika do‘koni', label: t('category_it'), icon: Monitor, color: 'bg-purple-500', shadow: 'shadow-purple-500/30' },
  ], [t]);

  const hasFilters = Boolean(search || category !== 'All');

  const SectionHeader = ({ title, icon: Icon, color, linkType }: any) => (
    <div className="mt-8 mb-4 flex items-center justify-between">
      <h2 className="flex items-center gap-2 font-display text-[19px] font-bold text-[hsl(var(--foreground))]">
        <Icon size={20} className={color} />
        {title}
      </h2>
      <Link href={`/list/${linkType}`} className="text-[13px] font-bold text-[hsl(var(--accent))] hover:underline flex items-center gap-1">
        {t('see_all')} <ChevronRight size={14}/>
      </Link>
    </div>
  );

  const renderCard = (discount: any) => {
    const isSaved = savedIds.includes(String(discount.id));
    return (
      <div 
        key={discount.id} 
        onClick={() => setLocation(`/discount/${discount.id}`)}
        className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[16px] overflow-visible shadow-sm hover:border-[hsl(var(--accent))] transition-all active:scale-[0.98] cursor-pointer flex flex-col h-full relative group"
      >
        <button 
          type="button" 
          onClick={async (e) => {
            e.preventDefault(); 
            e.stopPropagation(); 
            await toggleFavorite(String(discount.id));
            setTimeout(() => queryClient.invalidateQueries({ queryKey: ['savedDiscounts'] }), 100);
          }}
          className={`absolute top-3 right-3 z-20 p-2 rounded-full backdrop-blur-md transition-all active:scale-90 ${
            isSaved 
              ? 'text-red-500 bg-white/90 shadow-sm' 
              : 'text-white bg-black/30 hover:bg-black/50'
          }`}
        >
          <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} strokeWidth={isSaved ? 0 : 2} />
        </button>
        
        <div className="w-full aspect-[16/10] bg-[hsl(var(--secondary))] overflow-hidden rounded-t-[16px] relative">
          <img src={discount.image_url} alt={discount.product_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          
          <div 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setLocation(`/store/${discount.merchant?.id}`);
            }}
            className="absolute bottom-3 left-3 w-[46px] h-[46px] bg-white rounded-[14px] p-[2px] shadow-lg border border-black/5 flex items-center justify-center overflow-hidden z-10 cursor-pointer hover:scale-105 transition-transform"
          >
            {discount.merchant?.logo_url ? (
              <img src={discount.merchant.logo_url} className="w-full h-full rounded-[10px] object-cover" />
            ) : (
              <Store size={22} className="text-[hsl(var(--muted-foreground))]" />
            )}
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col relative bg-[hsl(var(--card))] rounded-b-[16px]">
          <div 
            onClick={(e) => {
               e.preventDefault();
               e.stopPropagation();
               setLocation(`/store/${discount.merchant?.id}`);
            }}
            className="text-[13px] font-medium text-[hsl(var(--muted-foreground))] mb-1 hover:text-[hsl(var(--foreground))] transition-colors w-fit"
          >
            {discount.merchant?.name}
          </div>
          <h3 className="font-bold text-[15px] text-[hsl(var(--foreground))] leading-snug line-clamp-2">
            {discount.short_description || discount.product_name.replace(/,/g, ' • ')}
          </h3>
        </div>
      </div>
    );
  };

  return (
    <div className="page-enter pb-10">
      
      <ScrollReveal>
        <div className="relative flex items-center bg-[hsl(var(--card))] rounded-2xl p-1.5 shadow-sm border border-[hsl(var(--border))] mb-6 mt-1">
          <Search size={20} className="ml-3 shrink-0 text-[hsl(var(--muted-foreground))]" />
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            type="text" 
            enterKeyHint="search"
            placeholder={t('search_placeholder')} 
            className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm font-medium text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground))]" 
          />
          {search && (
            <button onClick={() => setSearch('')} className="p-2 text-[hsl(var(--muted-foreground))] hover:text-red-500 mr-1 cursor-pointer">
              <X size={18}/>
            </button>
          )}
        </div>
      </ScrollReveal>

      {/* REAL BANNERLAR */}
      {infiniteBanners.length > 0 && (
        <ScrollReveal delay={100}>
          <div ref={carouselRef} className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-5 px-5 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            {infiniteBanners.map((banner, idx) => (
              <div 
                key={`${banner.id}-${idx}`} 
                onClick={() => setLocation(`/discount/${banner.id}`)}
                className="min-w-[85%] md:min-w-[400px] snap-center relative rounded-3xl overflow-hidden shadow-md aspect-[21/9] cursor-pointer group"
              >
                <img src={banner.image} alt={banner.title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-5">
                  <span className="text-[11px] font-bold text-[hsl(var(--accent))] uppercase tracking-wider mb-1 drop-shadow-md">{banner.merchantName}</span>
                  <h3 className="text-white font-display font-bold text-[18px] leading-tight line-clamp-2 drop-shadow-md">{banner.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      )}

      <ScrollReveal delay={200}>
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

      <ScrollReveal delay={300}>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[20px] overflow-hidden shadow-sm flex flex-col h-full animate-pulse">
                <div className="w-full aspect-[16/10] bg-[hsl(var(--muted))] relative"></div>
                <div className="p-4 flex-1 flex flex-col relative pt-6">
                   <div className="h-3 bg-[hsl(var(--muted))] rounded-md w-1/3 mb-2"></div>
                   <div className="h-4 bg-[hsl(var(--muted))] rounded-md w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : hasFilters ? (
          <>
            <div className="mt-4 mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-[19px] font-bold text-[hsl(var(--foreground))]">
                <Search size={20} className="text-[hsl(var(--accent))]" />
                {t('matching_offers')}
              </h2>
              <button type="button" onClick={() => { setSearch(''); setCategory('All'); }} className="flex items-center gap-1 rounded-full bg-[hsl(var(--secondary))] px-3 py-1.5 text-xs font-bold text-[hsl(var(--foreground))]">
                {t('clear')} <X size={12} />
              </button>
            </div>
            
            {filteredDiscounts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pb-8">
                {filteredDiscounts.map((discount: any) => renderCard(discount))}
              </div>
            ) : (
              <div className="text-center py-12 bg-[hsl(var(--card))] rounded-[24px] border border-dashed border-[hsl(var(--border))]">
                <p className="font-bold text-[hsl(var(--muted-foreground))]">{t('no_offers_found')}</p>
              </div>
            )}
          </>
        ) : (
          <div className="pb-8">
            <SectionHeader title={t('just_arrived')} icon={Zap} color="text-amber-500" linkType="new" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {newDiscounts.map(discount => renderCard(discount))}
            </div>

            <SectionHeader title={t('popular_now')} icon={Flame} color="text-red-500" linkType="popular" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {popularDiscounts.map(discount => renderCard(discount))}
            </div>

            <SectionHeader title={t('popular_with_students')} icon={Trophy} color="text-blue-500" linkType="top" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {topPurchasedDiscounts.map(discount => renderCard(discount))}
            </div>
          </div>
        )}
      </ScrollReveal>
    </div>
  );
}