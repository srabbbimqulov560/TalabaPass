import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Users, CheckCircle, Trash2, Loader2, GraduationCap, IdCard, User, Ban } from 'lucide-react';
import AdminLayout from './AdminLayout';

export default function StudentsManager() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending');

  // Barcha talabalarni tortib olamiz
  const { data: students, isLoading } = useQuery({
    queryKey: ['adminStudents'],
    queryFn: async () => {
      const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const pendingStudents = students?.filter(s => s.is_active === false) || [];
  const activeStudents = students?.filter(s => s.is_active === true) || [];
  
  const displayList = activeTab === 'pending' ? pendingStudents : activeStudents;

  // Tasdiqlash
  const handleApprove = async (id: string) => {
    try {
      await supabase.from('students').update({ is_active: true }).eq('id', id);
      queryClient.invalidateQueries({ queryKey: ['adminStudents'] });
    } catch (err) {
      alert("Xatolik yuz berdi");
    }
  };

  // Bloklash (Faol talabani kutish rejimiga qaytarish)
  const handleBlock = async (id: string) => {
    if (!confirm("Rostdan ham bu talabani bloklamoqchimisiz? Uning QR kodi ishlashdan to'xtaydi.")) return;
    try {
      await supabase.from('students').update({ is_active: false }).eq('id', id);
      queryClient.invalidateQueries({ queryKey: ['adminStudents'] });
    } catch (err) {
      alert("Bloklashda xatolik");
    }
  };

  // Butunlay o'chirib yuborish
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Rostdan ham "${name}" ni tizimdan butunlay o'chirmoqchimisiz?`)) return;
    try {
      await supabase.from('students').delete().eq('id', id);
      queryClient.invalidateQueries({ queryKey: ['adminStudents'] });
    } catch (err) {
      alert("O'chirishda xatolik (Talaba tarixga bog'langan bo'lishi mumkin)");
    }
  };

  return (
    <AdminLayout title="Talabalar nazorati">
      
      {/* TABS */}
      <div className="flex items-center gap-2 bg-[hsl(var(--card))] p-1.5 rounded-2xl border border-[hsl(var(--border))] w-fit mb-6">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'pending' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}
        >
          Kutayotganlar
          {pendingStudents.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingStudents.length}</span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('active')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'active' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}
        >
          Tasdiqlanganlar
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[hsl(var(--accent))]" size={32} /></div>
      ) : displayList.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {displayList.map(student => (
            <div key={student.id} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[24px] p-5 flex flex-col shadow-sm">
              <div className="flex items-start gap-4 mb-4">
                
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] flex items-center justify-center overflow-hidden shrink-0">
                  {student.avatar_url ? <img src={student.avatar_url} className="w-full h-full object-cover"/> : <User className="text-[hsl(var(--muted-foreground))]" size={24}/>}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[17px] text-[hsl(var(--foreground))] truncate">
                    {student.first_name} {student.last_name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[12px] font-bold text-[hsl(var(--primary))] uppercase tracking-wider mb-1.5 mt-1 bg-[hsl(var(--primary)/.1)] w-fit px-2 py-0.5 rounded-md">
                    <IdCard size={14} /> ID: {student.student_id}
                  </div>
                  <p className="text-[12px] font-medium text-[hsl(var(--muted-foreground))] flex items-start gap-1.5 mt-1.5">
                    <GraduationCap size={15} className="shrink-0 text-[hsl(var(--accent))]" />
                    <span className="line-clamp-2">{student.university}</span>
                  </p>
                </div>
              </div>

              {/* Harakat tugmalari */}
              <div className="mt-auto pt-4 border-t border-[hsl(var(--border))] flex items-center justify-end gap-2">
                
                {activeTab === 'pending' ? (
                  <>
                    <button onClick={() => handleDelete(student.id, student.first_name)} className="px-4 py-2 rounded-xl text-sm font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors flex items-center gap-1.5">
                      <Trash2 size={16} /> Rad etish
                    </button>
                    <button onClick={() => handleApprove(student.id)} className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-green-500 hover:bg-green-600 transition-colors flex items-center gap-1.5 shadow-md">
                      <CheckCircle size={16} /> Tasdiqlash
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleBlock(student.id)} className="px-4 py-2 rounded-xl text-sm font-bold text-orange-500 bg-orange-500/10 hover:bg-orange-500/20 transition-colors flex items-center gap-1.5">
                      <Ban size={16} /> Bloklash
                    </button>
                  </>
                )}

              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[24px] p-10 text-center">
          <Users className="mx-auto text-[hsl(var(--muted-foreground))] mb-4 opacity-50" size={48} />
          <h3 className="font-display text-xl font-bold text-[hsl(var(--foreground))] mb-1">
            {activeTab === 'pending' ? 'Kutayotgan talabalar yo\'q!' : 'Tasdiqlangan talabalar yo\'q'}
          </h3>
          <p className="text-[hsl(var(--muted-foreground))]">
            {activeTab === 'pending' ? 'Hamma arizalar ko\'rib chiqilgan.' : 'Tizimda hali faol talabalar mavjud emas.'}
          </p>
        </div>
      )}

    </AdminLayout>
  );
}