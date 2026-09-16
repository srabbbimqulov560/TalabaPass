import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { QrCode, Loader2, ArrowLeft, Search, Calendar, Clock, Store, User } from 'lucide-react';
import { Link } from 'wouter';
import AdminLayout from './AdminLayout';

export default function ScansReport() {
  const [search, setSearch] = useState('');

  const { data: scans, isLoading } = useQuery({
    queryKey: ['adminScansReport'],
    queryFn: async () => {
      // Skaner tarixi, Do'kon nomi va Talaba ismini birgalikda tortib olamiz (Join)
      const { data, error } = await supabase
        .from('scan_history')
        .select(`
          *,
          merchant:merchants(name),
          student:students(first_name, last_name, student_id)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    }
  });

  const filteredScans = scans?.filter(scan => 
    scan.merchant?.name?.toLowerCase().includes(search.toLowerCase()) || 
    scan.student?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    scan.student?.last_name?.toLowerCase().includes(search.toLowerCase()) ||
    scan.student?.student_id?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <AdminLayout title="Skanerlash Tarixi">
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <button className="w-10 h-10 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-full flex items-center justify-center text-[hsl(var(--foreground))] hover:border-purple-500 transition-all">
              <ArrowLeft size={20}/>
            </button>
          </Link>
          <div>
            <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))]">Skanerlash Tarixi</h2>
            <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Do'konlar va Talabalar o'rtasidagi harakatlar logi</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[hsl(var(--accent))]" size={40} /></div>
      ) : (
        <>
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-5 rounded-2xl flex items-center gap-4 mb-6 w-full max-w-sm">
            <div className="w-14 h-14 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center"><QrCode size={28}/></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Jami Muvaffaqiyatli Skanerlar</p>
              <h3 className="text-3xl font-bold text-[hsl(var(--foreground))]">{scans?.length || 0}</h3>
            </div>
          </div>

          <div className="relative flex items-center bg-[hsl(var(--card))] rounded-xl p-1.5 shadow-sm border border-[hsl(var(--border))] mb-6 w-full max-w-md">
            <Search size={20} className="ml-3 shrink-0 text-[hsl(var(--muted-foreground))]" />
            <input 
              value={search} onChange={(e) => setSearch(e.target.value)} 
              type="text" placeholder="Do'kon nomi, Talaba ID yoki Ismini qidirish..." 
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm font-medium text-[hsl(var(--foreground))] outline-none" 
            />
          </div>

          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-[hsl(var(--secondary))] border-b border-[hsl(var(--border))] text-[12px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                    <th className="px-6 py-4 font-bold">Vaqt & Sana</th>
                    <th className="px-6 py-4 font-bold">Do'kon (Skaner qildi)</th>
                    <th className="px-6 py-4 font-bold">Talaba (Skaner qilindi)</th>
                    <th className="px-6 py-4 font-bold">Talaba ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--border))]">
                  {filteredScans.length > 0 ? (
                    filteredScans.map((scan) => (
                      <tr key={scan.id} className="hover:bg-[hsl(var(--secondary)/.5)] transition-colors">
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-[13px] font-bold text-[hsl(var(--foreground))]">
                            <Calendar size={14} className="text-[hsl(var(--accent))]" /> {new Date(scan.created_at).toLocaleDateString('uz-UZ')}
                          </div>
                          <div className="flex items-center gap-2 text-[12px] font-medium text-[hsl(var(--muted-foreground))] mt-1">
                            <Clock size={13} /> {new Date(scan.created_at).toLocaleTimeString('uz-UZ', {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-[14px] font-bold text-[hsl(var(--foreground))]">
                            <div className="w-7 h-7 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center"><Store size={14}/></div>
                            {scan.merchant?.name || <span className="text-red-500">O'chirilgan do'kon</span>}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-[14px] font-bold text-[hsl(var(--foreground))]">
                            <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center"><User size={14}/></div>
                            {scan.student ? `${scan.student.first_name} ${scan.student.last_name}` : <span className="text-red-500">O'chirilgan talaba</span>}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {scan.student?.student_id ? (
                            <span className="font-mono text-[13px] font-bold bg-[hsl(var(--secondary))] px-2 py-1 rounded-md border border-[hsl(var(--border))]">
                              {scan.student.student_id}
                            </span>
                          ) : '-'}
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={4} className="px-6 py-10 text-center text-[hsl(var(--muted-foreground))]">Tarix topilmadi...</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </AdminLayout>
  );
}