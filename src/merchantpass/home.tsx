import { Users, Tag, Eye, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

export default function MerchantHome() {
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['merchantStats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      // 1. HAQIQIY MIJOZLAR (Faqat skaner qilingan talabalar)
      const { data: scans } = await supabase.from('scan_history').select('student_id').eq('merchant_id', user.id);
      
      // Set orqali bir xil talaba 10 marta kelsa ham, uni 1 ta yagona mijoz deb hisoblaymiz
      const uniqueCustomers = new Set(scans?.map(s => s.student_id)).size;

      // 2. Ko'rishlar (Sahifada chegirmangizni ko'rganlar)
      const { data: views } = await supabase.from('discount_views').select('student_id').eq('merchant_id', user.id);
      const totalViews = views?.length || 0;

      // 3. Faol chegirmalar
      const today = new Date().toISOString().split('T')[0];
      const { count: activeCount } = await supabase
        .from('discounts')
        .select('*', { count: 'exact', head: true })
        .eq('merchant_id', user.id)
        .gte('end_date', today);

      return {
        customers: uniqueCustomers, // <--- Endi aynan skaner qilinganlar soni chiqadi!
        activeDiscounts: activeCount || 0,
        views: totalViews
      };
    },
    refetchInterval: 1000 * 60 
  });

  return (
    <div className="page-enter">
      <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] mb-6">Xush kelibsiz!</h2>
      
      {isLoading ? (
        <div className="flex justify-center pt-20"><Loader2 className="animate-spin text-[hsl(var(--accent))]" size={32}/></div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[hsl(var(--card))] p-5 rounded-3xl border border-[hsl(var(--border))] shadow-sm">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-3"><Users size={20}/></div>
            <p className="text-2xl font-bold">{stats?.customers || 0}</p>
            <p className="text-[11px] font-semibold uppercase text-[hsl(var(--muted-foreground))] mt-1">Jami mijozlar</p>
          </div>
          
          <div className="bg-[hsl(var(--card))] p-5 rounded-3xl border border-[hsl(var(--border))] shadow-sm">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-3"><Tag size={20}/></div>
            <p className="text-2xl font-bold">{stats?.activeDiscounts || 0}</p>
            <p className="text-[11px] font-semibold uppercase text-[hsl(var(--muted-foreground))] mt-1">Faol chegirmalar</p>
          </div>
          
          <div className="col-span-2 bg-[hsl(var(--card))] p-5 rounded-3xl border border-[hsl(var(--border))] shadow-sm flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{stats?.views || 0}</p>
              <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mt-1">Chegirmalaringiz ko'rildi</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
              <Eye size={28}/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}