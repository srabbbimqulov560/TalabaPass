import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Users, CheckCircle, Clock, Loader2, ArrowLeft, Search, Calendar } from 'lucide-react';
import { Link } from 'wouter';
import AdminLayout from './AdminLayout';

export default function StudentsReport() {
  const [search, setSearch] = useState('');

  const { data: students, isLoading } = useQuery({
    queryKey: ['adminStudentsReport'],
    queryFn: async () => {
      const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const activeStudents = students?.filter(s => s.is_active === true) || [];
  const pendingStudents = students?.filter(s => s.is_active === false) || [];

  // Qidiruv tizimi
  const filteredStudents = students?.filter(s => 
    s.first_name?.toLowerCase().includes(search.toLowerCase()) || 
    s.last_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.student_id?.toLowerCase().includes(search.toLowerCase()) ||
    s.university?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <AdminLayout title="Talabalar Hisoboti">
      
      {/* Tepa navigatsiya */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <button className="w-10 h-10 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-full flex items-center justify-center text-[hsl(var(--foreground))] hover:border-blue-500 transition-all">
              <ArrowLeft size={20}/>
            </button>
          </Link>
          <div>
            <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))]">To'liq Ro'yxat</h2>
            <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Barcha talabalarning jadval shaklidagi hisoboti</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[hsl(var(--accent))]" size={40} /></div>
      ) : (
        <>
          {/* STATISTIKA KARTALARI */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-5 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center"><Users size={24}/></div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Jami Ariza</p>
                <h3 className="text-2xl font-bold text-[hsl(var(--foreground))]">{students?.length || 0}</h3>
              </div>
            </div>
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-5 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center"><CheckCircle size={24}/></div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Tasdiqlanganlar</p>
                <h3 className="text-2xl font-bold text-[hsl(var(--foreground))]">{activeStudents.length}</h3>
              </div>
            </div>
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-5 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center"><Clock size={24}/></div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Kutayotganlar</p>
                <h3 className="text-2xl font-bold text-[hsl(var(--foreground))]">{pendingStudents.length}</h3>
              </div>
            </div>
          </div>

          {/* QIDIRUV */}
          <div className="relative flex items-center bg-[hsl(var(--card))] rounded-xl p-1.5 shadow-sm border border-[hsl(var(--border))] mb-6 w-full max-w-md">
            <Search size={20} className="ml-3 shrink-0 text-[hsl(var(--muted-foreground))]" />
            <input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              type="text" 
              placeholder="Ism, ID yoki Univer orqali qidirish..." 
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm font-medium text-[hsl(var(--foreground))] outline-none" 
            />
          </div>

          {/* JADVAL (TABLE) */}
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[hsl(var(--secondary))] border-b border-[hsl(var(--border))] text-[12px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                    <th className="px-6 py-4 font-bold">Talaba F.I.SH</th>
                    <th className="px-6 py-4 font-bold">Talaba ID</th>
                    <th className="px-6 py-4 font-bold">Universitet</th>
                    <th className="px-6 py-4 font-bold">Holati</th>
                    <th className="px-6 py-4 font-bold">Ro'yxatdan o'tgan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--border))]">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-[hsl(var(--secondary)/.5)] transition-colors">
                        <td className="px-6 py-4 font-bold text-[14px] text-[hsl(var(--foreground))]">
                          {student.first_name} {student.last_name}
                        </td>
                        <td className="px-6 py-4 text-[13px] font-mono font-semibold text-[hsl(var(--foreground))]">
                          {student.student_id}
                        </td>
                        <td className="px-6 py-4 text-[13px] font-medium text-[hsl(var(--muted-foreground))] max-w-[200px] truncate">
                          {student.university}
                        </td>
                        <td className="px-6 py-4">
                          {student.is_active ? (
                            <span className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-500 border border-green-500/20 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase">
                              <CheckCircle size={12} /> Faol
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-orange-500/10 text-orange-500 border border-orange-500/20 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase">
                              <Clock size={12} /> Kutmoqda
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-[12px] font-medium text-[hsl(var(--muted-foreground))] flex items-center gap-1.5">
                          <Calendar size={14} />
                          {new Date(student.created_at).toLocaleDateString('uz-UZ')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-[hsl(var(--muted-foreground))] font-medium">
                        Ma'lumot topilmadi...
                      </td>
                    </tr>
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