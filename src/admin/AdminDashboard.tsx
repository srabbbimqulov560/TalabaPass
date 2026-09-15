import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Users, Store, Ticket, QrCode, Loader2 } from 'lucide-react';
import AdminLayout from './AdminLayout';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: async () => {
      // Bir vaqtning o'zida barcha jadvallardagi sonlarni (count) tortib olamiz
      const [
        { count: studentsCount },
        { count: merchantsCount },
        { count: discountsCount },
        { count: scansCount }
      ] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('merchants').select('*', { count: 'exact', head: true }),
        supabase.from('discounts').select('*', { count: 'exact', head: true }),
        supabase.from('scan_history').select('*', { count: 'exact', head: true })
      ]);

      return {
        students: studentsCount || 0,
        merchants: merchantsCount || 0,
        discounts: discountsCount || 0,
        scans: scansCount || 0
      };
    },
    refetchInterval: 1000 * 30 // Har 30 soniyada yangilanib turadi
  });

  const statCards = [
    { title: "Jami Talabalar", value: stats?.students, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Faol Do'konlar", value: stats?.merchants, icon: Store, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Barcha Chegirmalar", value: stats?.discounts, icon: Ticket, color: "text-orange-500", bg: "bg-orange-500/10" },
    { title: "Jami Skanerlashlar", value: stats?.scans, icon: QrCode, color: "text-purple-500", bg: "bg-purple-500/10" }
  ];

  return (
    <AdminLayout title="Umumiy Statistika">
      
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[hsl(var(--accent))]" size={40} /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, idx) => (
              <div key={idx} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-6 rounded-[24px] shadow-sm flex flex-col">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.bg} ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <h3 className="text-3xl font-display font-bold text-[hsl(var(--foreground))] mb-1">{stat.value}</h3>
                <p className="text-[12px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">{stat.title}</p>
              </div>
            ))}
          </div>

          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[24px] p-8 flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))] flex items-center justify-center shrink-0">
              <span className="text-2xl">👋</span>
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[hsl(var(--foreground))] mb-1">Tizim barqaror ishlamoqda!</h2>
              <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                Chap tarafdagi menyu orqali do'konlarni tasdiqlashingiz yoki talabalar ro'yxatini nazorat qilishingiz mumkin.
              </p>
            </div>
          </div>
        </>
      )}

    </AdminLayout>
  );
}