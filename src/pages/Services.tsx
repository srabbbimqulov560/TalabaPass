import { Search, Store, MapPin, ChevronRight } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { Link } from 'wouter';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { ScrollReveal } from '@/components/scroll-reveal';
import { useLanguage } from '@/lib/i18n';

// GAVERSINUS FORYMLASI: Ikki nuqta o'rtasidagi masofani topish
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Yer radiusi (km)
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; 
  return d;
}

const normalizeForSearch = (text: string) => {
  if (!text) return '';
  const map: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'j', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'x', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sh', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya', 'қ': 'q', 'ў': 'o', 'ғ': 'g', 'ҳ': 'h'
  };
  return text.toLowerCase().split('').map(char => map[char] || char).join('');
};

export default function ServicesPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // 🌟 Talabaning hozirgi joylashuvi
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => console.log("Joylashuv aniqlanmadi:", error),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 } // 🌟 GPS parametrlar qo'shildi
      );
    }
  }, []);

  const { data: merchants, isLoading } = useQuery({
    queryKey: ['allMerchants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('is_active', true) 
        .order('name', { ascending: true });
        
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5 
  });

  const filteredMerchants = useMemo(() => {
    if (!merchants) return [];
    const normalizedSearchTerm = normalizeForSearch(search);

    let list = merchants.filter((m: any) => {
      const name = normalizeForSearch(m.name);
      const cat = normalizeForSearch(m.category);
      const matchesSearch = name.includes(normalizedSearchTerm) || cat.includes(normalizedSearchTerm);
      const matchesCategory = activeCategory === 'All' || m.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });

    // 🌟 MASOFA BO'YICHA MA'LUMOT QO'SHISH (Mukammallashtirildi)
    list = list.map((m: any) => {
      let distanceText = "Masofa noma'lum";
      
      if (userLocation && m.description) {
        // Matn ichidan lat, lon kordinatalarini qidirish (Bir nechta ehtimoliy yozilish usullari)
        const match = m.description.match(/Kordinata:\s*([\d.-]+)[\s,]+([\d.-]+)/i);
        
        if (match && match[1] && match[2]) {
          const mLat = parseFloat(match[1]);
          const mLon = parseFloat(match[2]);
          
          if (!isNaN(mLat) && !isNaN(mLon)) {
            const distKm = getDistanceFromLatLonInKm(userLocation.lat, userLocation.lon, mLat, mLon);
            
            if (distKm < 1) {
              distanceText = `${Math.round(distKm * 1000)} metr`;
            } else {
              distanceText = `${distKm.toFixed(1)} km`;
            }
          }
        }
      }
      return { ...m, distanceText };
    });

    return list;
  }, [merchants, search, activeCategory, userLocation]);

  const categories = useMemo(() => [
    { id: 'All', label: t('all_categories') },
    { id: 'Kafe / Restoran', label: t('category_cafes') },
    { id: 'Kiyim-kechak', label: t('category_shops') },
    { id: "O'quv markazi", label: t('category_learning') },
    { id: 'Texnika do‘koni', label: t('category_it') },
    { id: 'Boshqa', label: 'Boshqa' }
  ], [t]);

  return (
    <div className="page-enter pb-10">
      <ScrollReveal>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
              Barcha <span className="text-[hsl(var(--accent))]">Do'konlar</span>
            </h1>
          </div>
        </div>

        <div className="relative flex items-center bg-[hsl(var(--card))] rounded-2xl p-1.5 shadow-sm border border-[hsl(var(--border))] mb-4">
          <Search size={20} className="ml-3 shrink-0 text-[hsl(var(--muted-foreground))]" />
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            type="text" 
            placeholder={t('search_placeholder')} 
            className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm font-medium text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground))]" 
          />
        </div>
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <div className="flex overflow-x-auto gap-2 pb-6 -mx-5 px-5 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-[13px] font-bold transition-all active:scale-95 ${
                activeCategory === cat.id 
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md' 
                  : 'bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </ScrollReveal>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[24px] p-4 items-center gap-4 animate-pulse shadow-sm">
              <div className="w-16 h-16 rounded-[18px] bg-[hsl(var(--muted))] shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[hsl(var(--muted))] rounded-md w-3/4"></div>
                <div className="h-3 bg-[hsl(var(--muted))] rounded-md w-1/3"></div>
                <div className="h-3 bg-[hsl(var(--muted))] rounded-md w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredMerchants && filteredMerchants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-8">
          {filteredMerchants.map((merchant: any, idx: number) => (
            <ScrollReveal key={merchant.id} delay={idx * 50}>
              <Link href={`/store/${merchant.id}`}>
                <div className="flex bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[24px] p-4 shadow-sm hover:border-[hsl(var(--accent))] transition-all active:scale-[0.98] cursor-pointer items-center gap-4 group overflow-hidden relative">
                  
                  <div className="w-16 h-16 rounded-[18px] bg-[hsl(var(--secondary))] shrink-0 overflow-hidden border border-[hsl(var(--border))] flex items-center justify-center p-0.5">
                    {merchant.logo_url ? (
                      <img src={merchant.logo_url} alt={merchant.name} className="w-full h-full object-cover rounded-[14px]" />
                    ) : (
                      <Store size={28} className="text-[hsl(var(--muted-foreground))]"/>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-6">
                    <h3 className="font-bold text-[16px] text-[hsl(var(--foreground))] leading-tight truncate mb-1">
                      {merchant.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-[10px] font-extrabold text-[hsl(var(--accent))] uppercase tracking-wider bg-[hsl(var(--accent)/.1)] px-2 py-0.5 rounded-md truncate">
                        {merchant.category}
                      </span>
                    </div>
                    {/* 🌟 1-RASMDAGI TALAB: Masofa kordinatalar bilan qo'shildi */}
                    <div className="flex items-center gap-1 text-[12px] font-medium text-[hsl(var(--muted-foreground))]">
                      <MapPin size={13} className="shrink-0" /> 
                      <span className="truncate text-emerald-500 font-bold">{merchant.distanceText}</span>
                    </div>
                  </div>

                  <div className="absolute right-4 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--accent))] transition-colors group-hover:translate-x-1">
                    <ChevronRight size={20} />
                  </div>

                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-[hsl(var(--card))] rounded-[24px] border border-dashed border-[hsl(var(--border))]">
          <p className="font-bold text-[hsl(var(--muted-foreground))]">Do'konlar topilmadi</p>
        </div>
      )}
    </div>
  );
}