import { History as HistoryIcon, Clock, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

export default function MerchantHistory() {
  
  const { data: historyList, isLoading } = useQuery({
    queryKey: ['merchantHistory'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Akkaunt topilmadi");

      // Tarixni o'ziga tegishli talaba ma'lumotlari bilan qoshib tortib olamiz
      const { data, error } = await supabase
        .from('scan_history')
        .select(`
          *,
          student:students(first_name, last_name, university, avatar_url)
        `)
        .eq('merchant_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    }
  });

  // Sana formatlash funksiyasi
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleString('uz-UZ', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="page-enter pb-10">
      <div className="flex items-center gap-2 mb-6">
        <HistoryIcon className="text-[hsl(var(--accent))]" size={24} />
        <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))]">Tarix</h2>
      </div>

      {/* 🌟 YANGILANDI: YUKLANISH VAQTIDA CHIQADIGAN SKELETON SHABLONLARI */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-[hsl(var(--card))] p-4 rounded-[20px] border border-[hsl(var(--border))] shadow-sm flex items-center gap-4 animate-pulse">
              
              {/* Talaba Rasmi Skeletoni */}
              <div className="w-12 h-12 rounded-full bg-[hsl(var(--muted))] shrink-0"></div>

              {/* Ma'lumotlar Skeletoni */}
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[hsl(var(--muted))] rounded-md w-1/2"></div>
                <div className="h-3 bg-[hsl(var(--muted))] rounded-md w-3/4"></div>
              </div>

              {/* Vaqt va Tasdiq Badge Skeletoni */}
              <div className="shrink-0 flex flex-col items-end gap-2">
                <div className="w-16 h-5 bg-[hsl(var(--muted))] rounded-md"></div>
                <div className="w-20 h-3 bg-[hsl(var(--muted))] rounded-md"></div>
              </div>
              
            </div>
          ))}
        </div>
      ) : historyList && historyList.length > 0 ? (
        <div className="flex flex-col gap-3">
          {historyList.map((item: any) => (
            <div key={item.id} className="bg-[hsl(var(--card))] p-4 rounded-[20px] border border-[hsl(var(--border))] shadow-sm flex items-center gap-4">
              
              {/* Talaba Rasmi */}
              <div className="w-12 h-12 rounded-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] shrink-0 overflow-hidden flex items-center justify-center text-[hsl(var(--muted-foreground))]">
                {item.student?.avatar_url ? (
                  <img src={item.student.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <User size={20} />
                )}
              </div>

              {/* Ma'lumot */}
              <div className="flex-1">
                <p className="font-bold text-[15px] text-[hsl(var(--foreground))] line-clamp-1">
                  {item.student?.first_name} {item.student?.last_name}
                </p>
                <p className="text-[12px] font-semibold text-[hsl(var(--muted-foreground))] line-clamp-1">
                  {item.student?.university}
                </p>
              </div>

              {/* Vaqt */}
              <div className="shrink-0 text-right">
                <div className="text-[10px] font-bold text-[hsl(var(--accent))] uppercase tracking-wider mb-1 bg-[hsl(var(--accent)/.1)] px-2 py-0.5 rounded-md inline-block">
                  Tasdiqlandi
                </div>
                <div className="flex items-center justify-end gap-1 text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">
                  <Clock size={12} /> {formatDate(item.created_at)}
                </div>
              </div>
              
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-8 rounded-[24px] text-center flex flex-col items-center mt-6">
          <div className="w-16 h-16 bg-[hsl(var(--secondary))] rounded-full flex items-center justify-center text-[hsl(var(--muted-foreground))] mb-3">
            <HistoryIcon size={24} />
          </div>
          <p className="font-bold text-[hsl(var(--foreground))]">Hozircha tarix yo'q</p>
          <p className="text-[12px] font-medium text-[hsl(var(--muted-foreground))] mt-1">
            Mijozlarni skaner qilganingizda shu yerda paydo bo'ladi
          </p>
        </div>
      )}
    </div>
  );
}