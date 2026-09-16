import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Users, Store, Ticket, QrCode, Loader2, Clock } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { Link } from 'wouter';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: async () => {
      const [
        { count: activeStudents },
        { count: pendingStudents },
        { count: activeMerchants },
        { count: pendingMerchants },
        { count: discountsCount },
        { count: scansCount }
      ] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('students').select('*', { count: 'exact', head: true }).eq('is_active', false),
        supabase.from('merchants').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('merchants').select('*', { count: 'exact', head: true }).eq('is_active', false),
        supabase.from('discounts').select('*', { count: 'exact', head: true }),
        supabase.from('scan_history').select('*', { count: 'exact', head: true })
      ]);

      return {
        activeStudents: activeStudents || 0,
        pendingStudents: pendingStudents || 0,
        activeMerchants: activeMerchants || 0,
        pendingMerchants: pendingMerchants || 0,
        discounts: discountsCount || 0,
        scans: scansCount || 0
      };
    },
    refetchInterval: 1000 * 30
  });

  return (
    <AdminLayout title="Umumiy Statistika">
      
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[hsl(var(--accent))]" size={40} /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* TALABALAR KARTOCHKASI */}
            <Link href="/admin/students-report">
              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:border-blue-500 hover:shadow-md cursor-pointer transition-all p-6 rounded-[24px] shadow-sm flex flex-col h-full relative group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                  <Users size={24} />
                </div>
                <h3 className="text-3xl font-display font-bold text-[hsl(var(--foreground))] mb-1">{stats?.activeStudents}</h3>
                <p className="text-[12px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Tasdiqlangan Talabalar</p>
                {stats?.pendingStudents ? (
                  <div className="absolute top-6 right-6 flex items-center gap-1 text-[11px] font-bold bg-orange-500/10 text-orange-500 px-2 py-1 rounded-lg">
                    <Clock size={12} /> {stats?.pendingStudents} ta kutmoqda
                  </div>
                ) : null}
              </div>
            </Link>

            {/* DO'KONLAR KARTOCHKASI */}
            <Link href="/admin/merchants-report">
              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:border-green-500 hover:shadow-md cursor-pointer transition-all p-6 rounded-[24px] shadow-sm flex flex-col h-full relative group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-green-500/10 text-green-500 group-hover:scale-110 transition-transform">
                  <Store size={24} />
                </div>
                <h3 className="text-3xl font-display font-bold text-[hsl(var(--foreground))] mb-1">{stats?.activeMerchants}</h3>
                <p className="text-[12px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Faol Do'konlar</p>
                {stats?.pendingMerchants ? (
                  <div className="absolute top-6 right-6 flex items-center gap-1 text-[11px] font-bold bg-orange-500/10 text-orange-500 px-2 py-1 rounded-lg">
                    <Clock size={12} /> {stats?.pendingMerchants} ta kutmoqda
                  </div>
                ) : null}
              </div>
            </Link>

            {/* BARCHA CHEGIRMALAR */}
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-6 rounded-[24px] shadow-sm flex flex-col h-full">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-orange-500/10 text-orange-500">
                <Ticket size={24} />
              </div>
              <h3 className="text-3xl font-display font-bold text-[hsl(var(--foreground))] mb-1">{stats?.discounts}</h3>
              <p className="text-[12px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Barcha Chegirmalar</p>
            </div>

            {/* SKANERLASHLAR KARTOCHKASI */}
            <Link href="/admin/scans-report">
              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:border-purple-500 hover:shadow-md cursor-pointer transition-all p-6 rounded-[24px] shadow-sm flex flex-col h-full group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
                  <QrCode size={24} />
                </div>
                <h3 className="text-3xl font-display font-bold text-[hsl(var(--foreground))] mb-1">{stats?.scans}</h3>
                <p className="text-[12px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Jami Skanerlashlar</p>
              </div>
            </Link>

          </div>
        </>
      )}

    </AdminLayout>
  );
}