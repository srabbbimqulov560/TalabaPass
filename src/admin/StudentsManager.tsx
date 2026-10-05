import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Users, CheckCircle, Trash2, Loader2, GraduationCap, IdCard, User, Ban, FileImage, X, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { logAdminAction } from '@/lib/adminLogger';

export default function StudentsManager() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending');
  
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');

  // 🌟 CHIROYLI MODALLAR STATE
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' }>({ isOpen: false, title: '', message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; action: 'delete' | 'block' | null; targetId: string; targetName: string }>({ isOpen: false, title: '', action: null, targetId: '', targetName: '' });

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
      setAlertModal({ isOpen: true, type: 'error', title: "E'tibor bering", message: "Iltimos, avval talabalikning amal qilish muddatini belgilang!" });
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

      await logAdminAction('TASDIQLADI', 'TALABA', `${selectedStudent.first_name} ${selectedStudent.last_name} (ID: ${selectedStudent.student_id})`);

      queryClient.invalidateQueries({ queryKey: ['adminStudents'] });
      setSelectedStudent(null); 
      setExpiryDate('');
      
      setAlertModal({ isOpen: true, type: 'success', title: "Muvaffaqiyatli", message: "Talaba muvaffaqiyatli tasdiqlandi!" });
    } catch (err: any) {
      setAlertModal({ isOpen: true, type: 'error', title: "Xatolik", message: err.message || "Tasdiqlashda xatolik yuz berdi" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: "O'chirishni tasdiqlang",
      action: 'delete',
      targetId: id,
      targetName: name
    });
  };

  const handleBlock = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Bloklashni tasdiqlang",
      action: 'block',
      targetId: id,
      targetName: name
    });
  };

  // 🌟 O'CHIRISH VA BLOKLASHNI IJRO ETUVCHI FUNKSIYA
  const executeAction = async () => {
    if (!confirmModal.action || !confirmModal.targetId) return;
    
    setIsActionLoading(true);
    try {
      if (confirmModal.action === 'delete') {
        const { error } = await supabase.rpc('delete_user_by_admin', { target_user_id: confirmModal.targetId });
        if (error) throw error;
        await logAdminAction("O'CHIRDI / RAD ETDI", 'TALABA', confirmModal.targetName);
        
        setAlertModal({ isOpen: true, type: 'success', title: "O'chirildi", message: `"${confirmModal.targetName}" tizimdan butunlay o'chirildi.` });
      } else if (confirmModal.action === 'block') {
        await supabase.from('students').update({ is_active: false }).eq('id', confirmModal.targetId);
        await logAdminAction('BLOKLADI', 'TALABA', confirmModal.targetName);
        
        setAlertModal({ isOpen: true, type: 'success', title: "Bloklandi", message: `"${confirmModal.targetName}" muvaffaqiyatli bloklandi.` });
      }

      queryClient.invalidateQueries({ queryKey: ['adminStudents'] });
      setSelectedStudent(null);
    } catch (err: any) {
      setAlertModal({ isOpen: true, type: 'error', title: "Xatolik", message: err.message || "Xatolik yuz berdi" });
    } finally {
      setIsActionLoading(false);
      setConfirmModal({ ...confirmModal, isOpen: false });
    }
  };

  return (
    <AdminLayout title="Talabalar nazorati">
      
      {/* TALABANI TEKSHIRISH MODALI */}
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

      {/* 🌟 1. TASDIQLASH (CONFIRM) MODALI */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[32px] p-6 md:p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 border-4 shadow-inner ${confirmModal.action === 'delete' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
              <AlertTriangle size={32} strokeWidth={2.5} />
            </div>
            <h3 className="font-display text-xl font-bold text-[hsl(var(--foreground))] mb-2">{confirmModal.title}</h3>
            <p className="text-[14px] font-medium text-[hsl(var(--muted-foreground))] mb-8 leading-relaxed">
              Rostdan ham "{confirmModal.targetName}" {confirmModal.action === 'delete' ? "tizimdan butunlay o'chiriladi va bu Talaba ID si bo'shaydi" : "ni bloklamoqchimisiz"}?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} 
                disabled={isActionLoading}
                className="flex-1 py-3.5 bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] font-bold text-[15px] rounded-[20px] transition-all cursor-pointer"
              >
                Bekor qilish
              </button>
              <button 
                onClick={executeAction} 
                disabled={isActionLoading}
                className={`flex-1 py-3.5 font-bold text-[15px] rounded-[20px] shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer text-white ${confirmModal.action === 'delete' ? 'bg-red-500' : 'bg-orange-500'}`}
              >
                {isActionLoading ? <Loader2 className="animate-spin" size={18} /> : (confirmModal.action === 'delete' ? "O'chirish" : "Bloklash")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 2. MUVAFFAQIYAT / XATOLIK (ALERT) MODALI */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[32px] p-6 md:p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 border-4 shadow-inner ${alertModal.type === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
              {alertModal.type === 'success' ? <CheckCircle2 size={40} strokeWidth={2.5} /> : <XCircle size={40} strokeWidth={2.5} />}
            </div>
            <h3 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] mb-2">{alertModal.title}</h3>
            <p className="text-[14px] font-medium text-[hsl(var(--muted-foreground))] mb-8 leading-relaxed">
              {alertModal.message}
            </p>
            <button 
              onClick={() => setAlertModal({ ...alertModal, isOpen: false })} 
              className="w-full py-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold text-[16px] rounded-[20px] shadow-float active:scale-95 transition-all cursor-pointer"
            >
              Yopish
            </button>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}