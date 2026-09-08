import { useState, useMemo, useCallback } from 'react';
import { Search, X, Flame, MapPin, LayoutGrid, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { useListDiscounts } from '@workspace/api-client-react';
import type { Discount } from '@workspace/api-client-react';
import { DiscountCard, OfferCardSkeleton } from '@/components/discount-card';
import { useFavorites } from '@/lib/useFavorites';
import { ScrollReveal } from '@/components/scroll-reveal';

export default function ServicesPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'popular' | 'nearby'>('all');

  // Backend API ga yuboriladigan qidiruv va filtr parametrlari
  const params = useMemo(() => {
    const p: any = {};
    if (search) p.search = search;
    if (filter !== 'all') p.section = filter;
    return p;
  }, [search, filter]);

  // Barcha ma'lumotlarni tortib olish
  const { data, isLoading } = useListDiscounts(params);
  
  // Saqlanganlar mexanizmi
  const { savedIds, toggleFavorite } = useFavorites();
  const handleFavorite = useCallback((offer: Discount) => {
    toggleFavorite(String(offer.id));
  }, [toggleFavorite]);

  const mappedData = useMemo(() => 
    data?.map(o => ({ ...o, isFavorite: savedIds.includes(String(o.id)) })),
  [data, savedIds]);

  // Filtr tugmalari
  const FILTERS = [
    { id: 'all', label: 'Barchasi', icon: LayoutGrid },
    { id: 'popular', label: 'Eng mashhur', icon: Flame },
    { id: 'nearby', label: 'Eng yaqin', icon: MapPin },
  ] as const;

  return (
    // BU YERDA O'ZGARISH: pt-2 olib tashlandi, o'rniga tepaga tortish uchun -mt-2 qo'shildi
    <div className="page-enter pb-10 -mt-2">
      
      {/* Sarlavha o'rniga Orqaga qaytish (mb-5 dan mb-3 ga qisqardi) */}
      <div className="mb-3 -ml-2">
        <Link href="/" className="inline-flex items-center gap-2 py-1.5 px-2 text-[15px] font-bold text-[hsl(var(--foreground))] transition-all hover:text-[hsl(var(--accent))] active:scale-95">
          <ArrowLeft size={20} /> Asosiy
        </Link>
      </div>

      {/* Qidiruv tizimi */}
      <ScrollReveal>
        <div className="relative flex items-center bg-[hsl(var(--card))] rounded-2xl p-1.5 shadow-sm border border-[hsl(var(--border))] mb-4">
          <Search size={20} className="ml-3 shrink-0 text-[hsl(var(--muted-foreground))]" />
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            type="search" 
            placeholder="Qahva, kurs yoki kerakli narsa qidiring..." 
            className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm font-medium text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground))]" 
          />
          {search && (
            <button onClick={() => setSearch('')} className="p-2 text-[hsl(var(--muted-foreground))] hover:text-red-500 mr-1 transition-colors">
              <X size={18}/>
            </button>
          )}
        </div>
      </ScrollReveal>

      {/* Saralash (Filtr) tugmalari */}
      <ScrollReveal delay={100}>
        <div className="flex gap-2.5 mb-5 overflow-x-auto pb-2 -mx-5 px-5 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-2 whitespace-nowrap px-5 py-2.5 rounded-full text-[13px] font-bold transition-all border shrink-0 ${
                filter === f.id
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))] shadow-sm'
                  : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border-[hsl(var(--border))] hover:border-[hsl(var(--accent))]'
              }`}
            >
              <f.icon size={16} className={filter === f.id ? '' : 'text-[hsl(var(--muted-foreground))]'} />
              {f.label}
            </button>
          ))}
        </div>
      </ScrollReveal>

      {/* Natijalar ro'yxati (Grid) */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <OfferCardSkeleton key={i} />)}
        </div>
      ) : mappedData?.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mappedData.map((offer, index) => (
            <ScrollReveal key={offer.id} delay={index * 50}>
              <DiscountCard offer={offer} onFavorite={handleFavorite} />
            </ScrollReveal>
          ))}
        </div>
      ) : (
        <div className="rounded-[22px] border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card)/.5)] p-10 text-center flex flex-col items-center justify-center gap-3 mt-4">
          <Search size={40} className="text-[hsl(var(--muted-foreground))/50]" />
          <div>
            <p className="text-base font-bold text-[hsl(var(--foreground))]">Hech narsa topilmadi</p>
            <p className="text-[13px] text-[hsl(var(--muted-foreground))] mt-1">Boshqa so'z bilan qidirib ko'ring yoki filterni tozalang</p>
          </div>
        </div>
      )}
      
    </div>
  );
}