import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Users, CheckCircle, Trash2, Loader2, GraduationCap, IdCard, User, Ban, FileImage, X } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { logAdminAction } from '@/lib/adminLogger';

export default function StudentsManager() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending');
  
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');

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

  const handleApprove = async (id: string) => {
    if (!expiryDate) {
      alert("Iltimos, avval talabalikning amal qilish muddatini belgilang!");
      return;
    }
    setIsActionLoading(true);
    try {
      await supabase.from('students').update({ is_active: true, expires_at: expiryDate }).eq('id', id);

      await supabase.from('notifications').insert([{
        user_id: id,
        title: "Arizangiz tasdiqlandi! 🎉",
        message: `Tabriklaymiz, sizning Talaba ID kartangiz muvaffaqiyatli tasdiqlandi. Karta amal qilish muddati: ${expiryDate.split('-').reverse().join('.')}. Endi bemalol chegirmalardan foydalanishingiz mumkin!`
      }]);

      // TIZIM TARIXIGA YOZISH
      await logAdminAction('TASDIQLADI', 'TALABA', `${selectedStudent.first_name} ${selectedStudent.last_name} (ID: ${selectedStudent.student_id})`);

      queryClient.invalidateQueries({ queryKey: ['adminStudents'] });
      setSelectedStudent(null); 
      setExpiryDate('');
    } catch (err) {
      alert("Xatolik yuz berdi");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`ROSTDAN HAM O'CHIRASIZMI?\n\n"${name}" tizimdan butunlay o'chiriladi va bu Talaba ID si bo'shaydi.`)) return;
    setIsActionLoading(true);
    try {
      const { error } = await supabase.rpc('delete_user_by_admin', { target_user_id: id });
      if (error) throw error;

      // TIZIM TARIXIGA YOZISH
      await logAdminAction("O'CHIRDI / RAD ETDI", 'TALABA', name);

      queryClient.invalidateQueries({ queryKey: ['adminStudents'] });
      setSelectedStudent(null);
    } catch (err) {
      alert("O'chirishda xatolik yuz berdi");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleBlock = async (id: string, name: string) => {
    if (!confirm(`Rostdan ham "${name}" ni bloklamoqchimisiz?`)) return;
    try {
      await supabase.from('students').update({ is_active: false }).eq('id', id);
      
      // TIZIM TARIXIGA YOZISH
      await logAdminAction('BLOKLADI', 'TALABA', name);

      queryClient.invalidateQueries({ queryKey: ['adminStudents'] });
    } catch (err) {
      alert("Bloklashda xatolik");
    }
  };

  return (
    <AdminLayout title="Talabalar nazorati">
      
      {selectedStudent && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 md:p-8 backdrop-blur-sm">
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] w-full max-w-5xl rounded-[32px] overflow-hidden flex flex-col md:flex-row shadow-2xl relative animate-in zoom-in-95 duration-300 max-h-[90vh]">
            <button onClick={() => !isActionLoading && setSelectedStudent(null)} className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/80 backdrop-blur-md">
              <X size={24} />
            </button>

            <div className="w-full md:w-[60%] bg-black flex items-center justify-center p-4 relative min-h-[300px]">
              {selectedStudent.document_url ? (
                <img src={selectedStudent.document_url} className="w-full h-full max-h-[80vh] object-contain rounded-xl" alt="Guvohnoma" />
              ) : (
                <div className="text-white/50 flex flex-col items-center">
                  <FileImage size={64} className="mb-4 opacity-50" />
                  <p>Hujjat yuklanmagan</p>
                </div>
              )}
            </div>

            <div className="w-full md:w-[40%] p-6 md:p-8 flex flex-col bg-[hsl(var(--background))] overflow-y-auto">
              <h3 className="text-sm font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest mb-6">Solishtirish uchun</h3>
              <div className="space-y-6 flex-1">
                <div>
                  <p className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase mb-1">F.I.SH</p>
                  <p className="text-xl font-bold text-[hsl(var(--foreground))]">{selectedStudent.first_name} {selectedStudent.last_name}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase mb-1">Talaba ID</p>
                  <div className="flex items-center gap-2 text-lg font-bold text-[hsl(var(--primary))] bg-[hsl(var(--primary)/.1)] w-fit px-3 py-1.5 rounded-xl border border-[hsl(var(--primary)/.2)]">
                    <IdCard size={20} /> {selectedStudent.student_id}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase mb-1">Universitet</p>
                  <div className="flex items-start gap-2 text-base font-semibold text-[hsl(var(--foreground))] bg-[hsl(var(--card))] p-3 rounded-xl border border-[hsl(var(--border))]">
                    <GraduationCap size={20} className="shrink-0 text-[hsl(var(--accent))]" /> 
                    <span>{selectedStudent.university}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[hsl(var(--border))]">
                <div className="mb-4">
                  <label className="text-xs font-bold uppercase text-[hsl(var(--muted-foreground))] mb-1.5 block">Amal qilish muddati (Majburiy)</label>
                  <input 
                    type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-3 px-4 rounded-xl font-bold outline-none focus:border-[hsl(var(--primary))] text-[hsl(var(--foreground))]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button disabled={isActionLoading} onClick={() => handleDelete(selectedStudent.id, selectedStudent.first_name)} className="w-full py-4 rounded-xl text-[15px] font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    <Trash2 size={18} /> Rad etish
                  </button>
                  <button disabled={isActionLoading} onClick={() => handleApprove(selectedStudent.id)} className="w-full py-4 rounded-xl text-[15px] font-bold text-white bg-green-500 hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-float active:scale-95 disabled:opacity-50">
                    {isActionLoading ? <Loader2 className="animate-spin" size={18} /> : <><CheckCircle size={18} /> Tasdiqlash</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 bg-[hsl(var(--card))] p-1.5 rounded-2xl border border-[hsl(var(--border))] w-fit mb-6">
        <button onClick={() => setActiveTab('pending')} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'pending' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}>
          Kutayotganlar {pendingStudents.length > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingStudents.length}</span>}
        </button>
        <button onClick={() => setActiveTab('active')} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'active' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}>
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
                <div className="w-16 h-16 rounded-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] flex items-center justify-center overflow-hidden shrink-0">
                  {student.avatar_url ? <img src={student.avatar_url} className="w-full h-full object-cover"/> : <User className="text-[hsl(var(--muted-foreground))]" size={24}/>}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[17px] text-[hsl(var(--foreground))] truncate">{student.first_name} {student.last_name}</h3>
                  <div className="flex items-center gap-1.5 text-[12px] font-bold text-[hsl(var(--primary))] uppercase tracking-wider mb-1.5 mt-1 bg-[hsl(var(--primary)/.1)] w-fit px-2 py-0.5 rounded-md">
                    <IdCard size={14} /> ID: {student.student_id}
                  </div>
                  <p className="text-[12px] font-medium text-[hsl(var(--muted-foreground))] flex items-start gap-1.5 mt-1.5 line-clamp-1">
                    <GraduationCap size={15} className="shrink-0 text-[hsl(var(--accent))]" /> {student.university}
                  </p>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-[hsl(var(--border))] flex items-center justify-between gap-2">
                <button onClick={() => setSelectedStudent(student)} className="px-4 py-2 rounded-xl text-sm font-bold text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 transition-colors flex items-center gap-1.5">
                  <FileImage size={16} /> Tekshirish
                </button>
                <div className="flex gap-2">
                  {activeTab === 'pending' ? (
                    <button onClick={() => handleDelete(student.id, student.first_name)} className="px-4 py-2 rounded-xl text-sm font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors flex items-center gap-1.5">
                      <Trash2 size={16} /> Rad etish
                    </button>
                  ) : (
                    <button onClick={() => handleBlock(student.id, student.first_name)} className="px-4 py-2 rounded-xl text-sm font-bold text-orange-500 bg-orange-500/10 hover:bg-orange-500/20 transition-colors flex items-center gap-1.5">
                      <Ban size={16} /> Bloklash
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[24px] p-10 text-center">
          <Users className="mx-auto text-[hsl(var(--muted-foreground))] mb-4 opacity-50" size={48} />
          <h3 className="font-display text-xl font-bold text-[hsl(var(--foreground))] mb-1">{activeTab === 'pending' ? 'Kutayotgan talabalar yo\'q!' : 'Tasdiqlangan talabalar yo\'q'}</h3>
        </div>
      )}
    </AdminLayout>
  );
}