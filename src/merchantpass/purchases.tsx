import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ShoppingBag, ArrowLeft, Loader2, Calendar, Clock, User, Package, Tags } from 'lucide-react';
import { Link } from 'wouter';

export default function MerchantPurchases() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const { data: purchases, isLoading } = useQuery({
    queryKey: ['merchantPurchases'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { data, error } = await supabase
        .from('scan_history')
        .select(`
          *,
          student:students(first_name, last_name, avatar_url),
          discount:discounts(product_name, short_description)
        `)
        .eq('merchant_id', user.id)
        .not('item_name', 'is', null) // Faqat mahsulot borlari xarid hisoblanadi
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Teglarni (Mahsulotlarni) guruhlash
  const tagCounts: Record<string, number> = {};
  purchases?.forEach(p => {
    if (p.item_name) {
      tagCounts[p.item_name] = (tagCounts[p.item_name] || 0) + 1;
    }
  });
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

  const filteredPurchases = selectedTag 
    ? purchases?.filter(p => p.item_name === selectedTag) 
    : purchases;

  return (
    <div className="page-enter pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/merchant">
          <button className="p-2 bg-[hsl(var(--card))] rounded-full border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))] transition-colors text-[hsl(var(--foreground))]">
            <ArrowLeft size={20} />
          </button>
        </Link>
        <div>
          <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))]">Xaridlar tarixi</h2>
          <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mt-0.5">Sotilgan mahsulotlar hisoboti</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[hsl(var(--accent))]" size={32} /></div>
      ) : (
        <>
          {/* 🌟 TEGLAR (Kategoriyalar) KARTOCHKALARI */}
          <div className="flex overflow-x-auto gap-3 pb-4 mb-2 -mx-4 px-4 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            <div 
              onClick={() => setSelectedTag(null)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 cursor-pointer transition-all min-w-[90px] shrink-0 ${!selectedTag ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))/10] text-[hsl(var(--primary))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))/40]'}`}
            >
              <ShoppingBag size={20} className="mb-1.5" />
              <span className="text-[12px] font-bold">Barchasi</span>
              <span className="text-[10px] font-bold opacity-70">{purchases?.length || 0} ta</span>
            </div>

            {sortedTags.map(([tag, count]) => (
              <div 
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 cursor-pointer transition-all min-w-[90px] shrink-0 ${selectedTag === tag ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))/10] text-[hsl(var(--primary))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))/40]'}`}
              >
                <Package size={20} className="mb-1.5" />
                <span className="text-[12px] font-bold truncate max-w-[80px]">{tag}</span>
                <span className="text-[10px] font-bold opacity-70">{count} ta</span>
              </div>
            ))}
          </div>

          {/* 🌟 XARIDLAR JADVALI */}
          <div className="space-y-3">
            {filteredPurchases && filteredPurchases.length > 0 ? (
              filteredPurchases.map(p => (
                <div key={p.id} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-4 flex gap-4 items-center shadow-sm hover:border-[hsl(var(--primary))/30] transition-colors">
                  <div className="w-12 h-12 rounded-full bg-[hsl(var(--secondary))] overflow-hidden shrink-0 flex items-center justify-center border border-[hsl(var(--border))]">
                    {p.student?.avatar_url ? <img src={p.student.avatar_url} className="w-full h-full object-cover" /> : <User size={20} className="text-[hsl(var(--muted-foreground))]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[14.5px] text-[hsl(var(--foreground))] truncate">{p.student?.first_name} {p.student?.last_name}</p>
                    
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <span className="text-[11px] font-bold text-[hsl(var(--primary))] bg-[hsl(var(--primary))/10] px-2 py-0.5 rounded-md truncate max-w-full">
                        {p.item_name}
                      </span>
                      {p.discount?.short_description && (
                        <span className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                          <Tags size={10} /> {p.discount.short_description}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[hsl(var(--muted-foreground))] justify-end">
                      <Calendar size={12} /> {new Date(p.created_at).toLocaleDateString('uz-UZ')}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[hsl(var(--muted-foreground))] justify-end mt-1">
                      <Clock size={12} /> {new Date(p.created_at).toLocaleTimeString('uz-UZ', {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-[hsl(var(--card))] rounded-[24px] border border-dashed border-[hsl(var(--border))]">
                <ShoppingBag className="mx-auto mb-3 opacity-30 text-[hsl(var(--muted-foreground))]" size={36} />
                <p className="font-bold text-[hsl(var(--muted-foreground))]">Xaridlar topilmadi</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}