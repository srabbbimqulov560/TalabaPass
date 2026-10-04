import { useMemo, useState, useRef, useEffect } from 'react';
import { Search, X, Coffee, ShoppingBag, BookOpen, Monitor, LayoutGrid, Store, Sparkles, Heart } from 'lucide-react';
import { useLocation } from 'wouter';
import { ScrollReveal } from '@/components/scroll-reveal';
import { supabase } from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query'; 
import { useFavorites } from '@/lib/useFavorites';

const BANNERS = [
  { id: 1, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80", title: "Maxsus Takliflar" },
  { id: 2, image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80", title: "Kiyim Kechaklar" },
  { id: 3, image: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=800&q=80", title: "O'quv Markazlari" },
  { id: 4, image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80", title: "Texnologiyalar" }
];

export default function HomePage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient(); 
  
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const carouselRef = useRef<HTMLDivElement>(null);
  
  const { savedIds, toggleFavorite } = useFavorites();

  const { data: allDiscounts, isLoading } = useQuery({
    queryKey: ['allDiscounts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('discounts').select(`*, merchant:merchants(id, name, logo_url, category)`).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const filteredDiscounts = useMemo(() => {
    if (!allDiscounts) return [];
    return allDiscounts.filter((discount: any) => {
      const matchesSearch = discount.product_name.toLowerCase().includes(search.toLowerCase()) || discount.merchant?.name?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All' || discount.merchant?.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [allDiscounts, search, category]);

  const infiniteBanners = Array(50).fill(BANNERS).flat();

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
    { id: 'All', label: 'Barchasi', icon: LayoutGrid, color: 'bg-blue-500', shadow: 'shadow-blue-500/30' },
    { id: 'Kafe / Restoran', label: 'Kafelar', icon: Coffee, color: 'bg-red-500', shadow: 'shadow-red-500/30' },
    { id: 'Kiyim-kechak', label: "Do'konlar", icon: ShoppingBag, color: 'bg-orange-500', shadow: 'shadow-orange-500/30' },
    { id: "O'quv markazi", label: "Ta'lim", icon: BookOpen, color: 'bg-green-500', shadow: 'shadow-green-500/30' },
    { id: 'Texnika do窶鰐oni', label: 'Texnika', icon: Monitor, color: 'bg-purple-500', shadow: 'shadow-purple-500/30' },
  ], []);

  const hasFilters = Boolean(search || category !== 'All');

  return (
    <div className="page-enter pb-10">
      
      {/* QIDIRUV QISMI */}
      <ScrollReveal>
        <div className="relative flex items-center bg-[hsl(var(--card))] rounded-2xl p-1.5 shadow-sm border border-[hsl(var(--border))] mb-6 mt-1">
          <Search size={20} className="ml-3 shrink-0 text-[hsl(var(--muted-foreground))]" />
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            type="text" 
            enterKeyHint="search"
            placeholder="Qidirish (masalan: Burger, Najot Ta'lim...)" 
            className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm font-medium text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground))]" 
          />
          {search && (
            <button onClick={() => setSearch('')} className="p-2 text-[hsl(var(--muted-foreground))] hover:text-red-500 mr-1 cursor-pointer">
              <X size={18}/>
            </button>
          )}
        </div>
      </ScrollReveal>

      {/* BANNERLAR */}
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

      {/* KATEGORIYALAR */}
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

      {/* CHEGIRMALAR */}
      <ScrollReveal delay={300}>
        <div className="mt-4 mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-[19px] font-bold text-[hsl(var(--foreground))]">
            <Sparkles size={20} className="text-amber-500" />
            {hasFilters ? "Topilgan chegirmalar" : "Yangi chegirmalar"}
          </h2>
          {hasFilters && (
            <button type="button" onClick={() => { setSearch(''); setCategory('All'); }} className="flex items-center gap-1 rounded-full bg-[hsl(var(--secondary))] px-3 py-1.5 text-xs font-bold text-[hsl(var(--foreground))]">
              Tozalash <X size={12} />
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[20px] overflow-hidden shadow-sm flex flex-col h-full animate-pulse">
                <div className="w-full aspect-[16/10] bg-[hsl(var(--muted))] relative"></div>
                <div className="p-4 flex-1 flex flex-col relative pt-6">
                   <div className="absolute -top-6 left-4 w-12 h-12 rounded-xl bg-[hsl(var(--muted))] border-2 border-[hsl(var(--card))]"></div>
                   <div className="h-3 bg-[hsl(var(--muted))] rounded-md w-1/3 mb-2"></div>
                   <div className="h-4 bg-[hsl(var(--muted))] rounded-md w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredDiscounts && filteredDiscounts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pb-8">
            {filteredDiscounts.map((discount: any) => {
              const isSaved = savedIds.includes(String(discount.id));
              return (
                <div 
                  key={discount.id} 
                  onClick={() => setLocation(`/discount/${discount.id}`)}
                  className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[16px] overflow-visible shadow-sm hover:border-[hsl(var(--accent))] transition-all active:scale-[0.98] cursor-pointer flex flex-col h-full relative group"
                >
                  {/* Yurakcha (Like) */}
                  <button 
                    type="button" 
                    onClick={async (e) => {
                      e.preventDefault(); 
                      e.stopPropagation(); 
                      await toggleFavorite(String(discount.id));
                      setTimeout(() => queryClient.invalidateQueries({ queryKey: ['savedDiscounts'] }), 100);
                    }}
                    className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all active:scale-90 ${
                      isSaved 
                        ? 'text-red-500 bg-white/90 shadow-sm' 
                        : 'text-white bg-black/30 hover:bg-black/50'
                    }`}
                  >
                    <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} strokeWidth={isSaved ? 0 : 2} />
                  </button>
                  
                  {/* Asosiy Rasm */}
                  <div className="w-full aspect-[16/10] bg-[hsl(var(--secondary))] overflow-hidden rounded-t-[16px] relative">
                    <img src={discount.image_url} alt={discount.product_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>

                  {/* Pastki qism */}
                  <div className="p-4 flex-1 flex flex-col relative pt-8 bg-[hsl(var(--card))] rounded-b-[16px]">
                    
                    {/* Do'kon logotipi oq qutichada */}
                    <div 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setLocation(`/store/${discount.merchant?.id}`);
                      }}
                      className="absolute -top-7 left-4 w-[52px] h-[52px] bg-white rounded-xl p-1 shadow-md border border-[hsl(var(--border))] flex items-center justify-center overflow-hidden z-10 cursor-pointer hover:scale-105 transition-transform"
                    >
                      {discount.merchant?.logo_url ? (
                        <img src={discount.merchant.logo_url} className="w-full h-full rounded-lg object-cover" />
                      ) : (
                        <Store size={24} className="text-[hsl(var(--muted-foreground))]" />
                      )}
                    </div>
                    
                    {/* Matnlar */}
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
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-[hsl(var(--card))] rounded-[24px] border border-dashed border-[hsl(var(--border))]">
            <p className="font-bold text-[hsl(var(--muted-foreground))]">Hech narsa topilmadi</p>
          </div>
        )}
      </ScrollReveal>
    </div>
  );
}