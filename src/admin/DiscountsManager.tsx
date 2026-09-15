import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Ticket, Trash2, Loader2, Store, Clock, CalendarDays } from 'lucide-react';
import AdminLayout from './AdminLayout';

export default function DiscountsManager() {
  const queryClient = useQueryClient();

  // Barcha chegirmalarni (do'kon ma'lumotlari bilan qo'shib) tortib olamiz
  const { data: discounts, isLoading } = useQuery({
    queryKey: ['adminDiscounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discounts')
        .select(`*, merchant:merchants(name, logo_url)`)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    }
  });

  // Admin tomonidan chegirmani majburiy o'chirish
  const handleDelete = async (id: string, productName: string, imageUrl: string) => {
    if (!confirm(`ROSTDAN HAM O'CHIRASIZMI?\n\n"${productName}" nomli chegirma butun tizimdan va foydalanuvchilar ilovasidan o'chib ketadi!`)) return;
    
    try {
      // 1. Bazadan o'chirish
      await supabase.from('discounts').delete().eq('id', id);
      
      // 2. Storage'dan rasmni o'chirish (joy egallamasligi uchun)
      const fileName = imageUrl.split('/').pop();
      if (fileName) {
        await supabase.storage.from('discounts').remove([fileName]);
      }

      // 3. Ekranni yangilash
      queryClient.invalidateQueries({ queryKey: ['adminDiscounts'] });
      
    } catch (err) {
      alert("O'chirishda xatolik yuz berdi");
    }
  };

  return (
    <AdminLayout title="Chegirmalar Nazorati">
      
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))]">Barcha Chegirmalar</h2>
          <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] mt-1">Tizimga joylangan barcha e'lonlarni nazorat qiling</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
          <Ticket size={24} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[hsl(var(--accent))]" size={32} /></div>
      ) : discounts && discounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {discounts.map((discount: any) => (
            <div key={discount.id} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[20px] overflow-hidden shadow-sm flex flex-col group relative">
              
              {/* O'CHIRISH TUGMASI (Admin qizil tugmasi) */}
              <button 
                onClick={() => handleDelete(discount.id, discount.product_name, discount.image_url)} 
                className="absolute top-3 right-3 z-10 bg-red-500 text-white p-2.5 rounded-full shadow-lg hover:bg-red-600 hover:scale-105 active:scale-95 transition-all"
                title="Chegirmani olib tashlash"
              >
                <Trash2 size={18} />
              </button>
              
              {/* Foiz */}
              <div className="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur-md text-white text-[13px] font-extrabold px-3 py-1.5 rounded-xl border border-white/10">
                -{discount.discount_percent}%
              </div>
              
              {/* Rasm */}
              <div className="w-full aspect-video bg-[hsl(var(--secondary))] overflow-hidden relative">
                <img src={discount.image_url} alt="offer" className="w-full h-full object-cover" />
              </div>

              {/* Ma'lumotlar */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3 bg-[hsl(var(--secondary))] w-fit px-3 py-1.5 rounded-xl border border-[hsl(var(--border))]">
                  {discount.merchant?.logo_url ? (
                    <img src={discount.merchant.logo_url} className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <Store size={16} className="text-[hsl(var(--muted-foreground))]" />
                  )}
                  <span className="text-[12px] font-bold text-[hsl(var(--foreground))] line-clamp-1">{discount.merchant?.name || "Noma'lum do'kon"}</span>
                </div>

                <h3 className="font-bold text-[15px] text-[hsl(var(--foreground))] leading-tight line-clamp-2 mb-4">
                  {discount.product_name.replace(/,/g, ' • ')}
                </h3>
                
                <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-[hsl(var(--border))]">
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-[hsl(var(--muted-foreground))]">
                    <CalendarDays size={14} className="text-[hsl(var(--accent))]" /> 
                    {discount.start_date.slice(5).replace('-', '.')} dan {discount.end_date.slice(5).replace('-', '.')} gacha
                  </div>
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-[hsl(var(--muted-foreground))]">
                    <Clock size={14} className="text-[hsl(var(--accent))]" /> 
                    {discount.start_time.slice(0, 5)} - {discount.end_time.slice(0, 5)}
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[24px] p-10 text-center">
          <Ticket className="mx-auto text-[hsl(var(--muted-foreground))] mb-4 opacity-50" size={48} />
          <h3 className="font-display text-xl font-bold text-[hsl(var(--foreground))] mb-1">
            Hali chegirmalar e'lon qilinmagan
          </h3>
          <p className="text-[hsl(var(--muted-foreground))]">
            Do'konlar o'z takliflarini qo'shganda, ularni shu yerda nazorat qilishingiz mumkin.
          </p>
        </div>
      )}

    </AdminLayout>
  );
}