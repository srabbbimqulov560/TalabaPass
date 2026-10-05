import { Users, Tag, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/lib/i18n';

export default function MerchantHome() {
  const { t } = useLanguage();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['merchantStats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      const { data: scans } = await supabase.from('scan_history').select('student_id').eq('merchant_id', user.id);
      const uniqueCustomers = new Set(scans?.map(s => s.student_id)).size;

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
        views: totalViews
      };
    },
    refetchInterval: 1000 * 60 
  });

  return (
    <div className="page-enter">
      <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] mb-6">{t('welcome_biz')}</h2>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[hsl(var(--card))] p-5 rounded-3xl border border-[hsl(var(--border))] shadow-sm animate-pulse">
            <div className="w-10 h-10 rounded-full bg-[hsl(var(--muted))] mb-3"></div>
            <div className="h-8 bg-[hsl(var(--muted))] rounded-md w-12 mb-2.5"></div>
            <div className="h-3 bg-[hsl(var(--muted))] rounded-md w-20"></div>
          </div>
          <div className="bg-[hsl(var(--card))] p-5 rounded-3xl border border-[hsl(var(--border))] shadow-sm animate-pulse">
            <div className="w-10 h-10 rounded-full bg-[hsl(var(--muted))] mb-3"></div>
            <div className="h-8 bg-[hsl(var(--muted))] rounded-md w-12 mb-2.5"></div>
            <div className="h-3 bg-[hsl(var(--muted))] rounded-md w-20"></div>
          </div>
          <div className="col-span-2 bg-[hsl(var(--card))] p-5 rounded-3xl border border-[hsl(var(--border))] shadow-sm flex items-center justify-between animate-pulse">
            <div className="flex flex-col gap-2">
              <div className="h-9 bg-[hsl(var(--muted))] rounded-md w-16 mb-1"></div>
              <div className="h-3 bg-[hsl(var(--muted))] rounded-md w-32"></div>
            </div>
            <div className="w-14 h-14 rounded-full bg-[hsl(var(--muted))] shrink-0"></div>
          </div>
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
          
          <div className="col-span-2 bg-[hsl(var(--card))] p-5 rounded-3xl border border-[hsl(var(--border))] shadow-sm flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{stats?.views || 0}</p>
              <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mt-1">{t('total_views')}</p>
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