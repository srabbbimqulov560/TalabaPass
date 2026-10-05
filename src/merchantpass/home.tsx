import { Users, Tag, Eye, ShoppingBag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/lib/i18n';
import { Link } from 'wouter';

export default function MerchantHome() {
  const { t } = useLanguage();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['merchantStats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      const { data: scans } = await supabase.from('scan_history').select('student_id, item_name').eq('merchant_id', user.id);
      
      const uniqueCustomers = new Set(scans?.map(s => s.student_id)).size;
      const totalSales = scans?.filter(s => s.item_name).length || 0;

      // TOP 3 Mahsulotlarni hisoblash
      const itemCounts: Record<string, number> = {};
      scans?.forEach(s => {
          if (s.item_name) {
              itemCounts[s.item_name] = (itemCounts[s.item_name] || 0) + 1;
          }
      });
      const topItems = Object.entries(itemCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([name, count]) => ({ name, count }));

      const { data: views } = await supabase.from('discount_views').select('student_id').eq('merchant_id', user.id);
      const totalViews = views?.length || 0;

      const today = new Date().toISOString().split('T')[0];
      const { count: activeCount } = await supabase
        .from('discounts')
        .select('*', { count: 'exact', head: true })
        .eq('merchant_id', user.id)
        .gte('end_date', today);

      return {
        customers: uniqueCustomers,
        activeDiscounts: activeCount || 0,
        views: totalViews,
        totalSales,
        topItems
      };
    },
    refetchInterval: 1000 * 60 
  });

  return (
    <div className="page-enter pb-10">
      <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] mb-6">{t('welcome_biz')}</h2>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[hsl(var(--card))] p-5 rounded-3xl border border-[hsl(var(--border))] shadow-sm animate-pulse"><div className="w-10 h-10 rounded-full bg-[hsl(var(--muted))] mb-3"></div><div className="h-8 bg-[hsl(var(--muted))] rounded-md w-12 mb-2.5"></div><div className="h-3 bg-[hsl(var(--muted))] rounded-md w-20"></div></div>
          <div className="bg-[hsl(var(--card))] p-5 rounded-3xl border border-[hsl(var(--border))] shadow-sm animate-pulse"><div className="w-10 h-10 rounded-full bg-[hsl(var(--muted))] mb-3"></div><div className="h-8 bg-[hsl(var(--muted))] rounded-md w-12 mb-2.5"></div><div className="h-3 bg-[hsl(var(--muted))] rounded-md w-20"></div></div>
          <div className="col-span-2 bg-[hsl(var(--card))] p-5 rounded-3xl border border-[hsl(var(--border))] shadow-sm flex items-center justify-between animate-pulse"><div className="flex flex-col gap-2"><div className="h-9 bg-[hsl(var(--muted))] rounded-md w-16 mb-1"></div><div className="h-3 bg-[hsl(var(--muted))] rounded-md w-32"></div></div><div className="w-14 h-14 rounded-full bg-[hsl(var(--muted))] shrink-0"></div></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          
          <div className="bg-[hsl(var(--card))] p-5 rounded-3xl border border-[hsl(var(--border))] shadow-sm">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-3"><Users size={20}/></div>
            <p className="text-2xl font-bold">{stats?.customers || 0}</p>
            <p className="text-[11px] font-semibold uppercase text-[hsl(var(--muted-foreground))] mt-1">{t('total_customers')}</p>
          </div>
          
          <div className="bg-[hsl(var(--card))] p-5 rounded-3xl border border-[hsl(var(--border))] shadow-sm">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-3"><Tag size={20}/></div>
            <p className="text-2xl font-bold">{stats?.activeDiscounts || 0}</p>
            <p className="text-[11px] font-semibold uppercase text-[hsl(var(--muted-foreground))] mt-1">{t('active_discounts')}</p>
          </div>

          <Link href="/merchant/purchases" className="col-span-2 block">
            <div className="bg-[hsl(var(--primary))] p-5 rounded-3xl border border-[hsl(var(--border))] shadow-md flex items-center justify-between cursor-pointer hover:brightness-110 transition-all active:scale-95">
              <div>
                <p className="text-3xl font-bold text-[hsl(var(--primary-foreground))]">{stats?.totalSales || 0}</p>
                <p className="text-xs font-bold text-[hsl(var(--primary-foreground))]/80 mt-1 uppercase tracking-wider">Jami sotilgan mahsulotlar</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-md">
                <ShoppingBag size={28}/>
              </div>
            </div>
          </Link>
          
          <div className="col-span-2 bg-[hsl(var(--card))] p-5 rounded-3xl border border-[hsl(var(--border))] shadow-sm flex items-center justify-between mt-1">
            <div>
              <p className="text-2xl font-bold">{stats?.views || 0}</p>
              <p className="text-[11px] font-semibold uppercase text-[hsl(var(--muted-foreground))] mt-1">{t('total_views')}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
              <Eye size={24}/>
            </div>
          </div>

        </div>
      )}

      {/* 🌟 TOP 3 SOTILGAN MAHSULOTLAR */}
      <h3 className="font-display text-[18px] font-bold text-[hsl(var(--foreground))] mb-4 mt-8">Top 3 Sotilgan Mahsulotlar</h3>
      <div className="space-y-3">
        {stats?.topItems && stats.topItems.length > 0 ? (
          stats.topItems.map((item, idx) => (
            <div key={idx} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-4 rounded-2xl flex items-center justify-between shadow-sm hover:border-[hsl(var(--primary))/30] transition-colors">
               <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[13px] ${idx === 0 ? 'bg-amber-500/20 text-amber-500' : idx === 1 ? 'bg-gray-400/20 text-gray-400' : 'bg-orange-700/20 text-orange-700'}`}>
                    #{idx + 1}
                  </div>
                  <span className="font-bold text-[14px] text-[hsl(var(--foreground))] truncate max-w-[150px] sm:max-w-[200px]">{item.name}</span>
               </div>
               <span className="text-[12px] font-bold text-[hsl(var(--muted-foreground))]">{item.count} ta sotildi</span>
            </div>
          ))
        ) : (
          <div className="bg-[hsl(var(--card))] border border-dashed border-[hsl(var(--border))] p-6 rounded-2xl text-center">
            <p className="text-[13px] font-semibold text-[hsl(var(--muted-foreground))]">Hali yetarli ma'lumot yo'q</p>
          </div>
        )}
      </div>
    </div>
  );
}