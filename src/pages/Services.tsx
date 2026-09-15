import { Search, Loader2, Store, MapPin, ChevronRight } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { ScrollReveal } from '@/components/scroll-reveal';

export default function ServicesPage() {
  const [search, setSearch] = useState('');

  // BAZADAN FAQAT TASDIQLANGAN DO'KONLARNI (MERCHANTS) TORTIB OLISH
  const { data: merchants, isLoading } = useQuery({
    queryKey: ['allMerchants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('is_active', true) // E'TIBOR BERING: Faqat admin tasdiqlagan do'konlar chiqadi!
        .order('name', { ascending: true });
        
      if (error) throw error;
      return data;
    }
  });

  // Qidiruv tizimi
  const filteredMerchants = useMemo(() => {
    if (!merchants) return [];
    return merchants.filter((m: any) => 
      m.name?.toLowerCase().includes(search.toLowerCase()) || 
      m.category?.toLowerCase().includes(search.toLowerCase())
    );
  }, [merchants, search]);

  return (
    <div className="page-enter pb-10">
      <ScrollReveal>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
              Barcha <span className="text-[hsl(var(--accent))]">Do'konlar</span>
            </h1>
            <p className="mt-1 text-sm font-medium text-[hsl(var(--muted-foreground))]">
              O'zingizga kerakli xizmat ko'rsatish shoxobchasini tanlang
            </p>
          </div>
        </div>

        <div className="relative flex items-center bg-[hsl(var(--card))] rounded-2xl p-1.5 shadow-sm border border-[hsl(var(--border))] mb-8">
          <Search size={20} className="ml-3 shrink-0 text-[hsl(var(--muted-foreground))]" />
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            type="search" 
            placeholder="Do'kon yoki toifa qidirish..." 
            className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm font-medium text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground))]" 
          />
        </div>
      </ScrollReveal>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[hsl(var(--accent))]" size={32}/></div>
      ) : filteredMerchants && filteredMerchants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-8">
          {filteredMerchants.map((merchant: any, idx: number) => (
            <ScrollReveal key={merchant.id} delay={idx * 50}>
              <Link href={`/store/${merchant.id}`}>
                <div className="flex bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[24px] p-4 shadow-sm hover:border-[hsl(var(--accent))] transition-all active:scale-[0.98] cursor-pointer items-center gap-4 group overflow-hidden">
                  
                  {/* Do'kon Logosi */}
                  <div className="w-16 h-16 rounded-full bg-[hsl(var(--secondary))] shrink-0 overflow-hidden border border-[hsl(var(--border))]">
                    {merchant.logo_url ? (
                      <img src={merchant.logo_url} alt={merchant.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[hsl(var(--muted-foreground))]">
                        <Store size={28}/>
                      </div>
                    )}
                  </div>
                  
                  {/* Do'kon Ma'lumotlari */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[16px] text-[hsl(var(--foreground))] leading-tight truncate mb-1">
                      {merchant.name}
                    </h3>
                    <div className="text-[11px] font-bold text-[hsl(var(--accent))] uppercase tracking-wider mb-1.5 truncate">
                      {merchant.category}
                    </div>
                    <div className="flex items-center gap-1 text-[12px] font-medium text-[hsl(var(--muted-foreground))]">
                      <MapPin size={13} className="shrink-0" /> 
                      <span className="truncate">{merchant.description?.split('\n')[0]?.replace('📍 Manzil: ', '') || "Manzil ko'rsatilmagan"}</span>
                    </div>
                  </div>

                  {/* O'ng tomondagi kursor qotirildi */}
                  <div className="w-8 h-8 rounded-full bg-[hsl(var(--secondary))] flex items-center justify-center text-[hsl(var(--muted-foreground))] group-hover:bg-[hsl(var(--accent))] group-hover:text-white transition-colors shrink-0 ml-auto">
                    <ChevronRight size={18} />
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