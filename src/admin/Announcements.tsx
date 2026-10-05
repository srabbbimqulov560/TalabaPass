import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Send, Loader2, Megaphone, Users, Ticket, Link as LinkIcon, Trash2, Clock, AlertCircle, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { logAdminAction } from '@/lib/adminLogger';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function Announcements() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  
  const [linkType, setLinkType] = useState<'none' | 'discount' | 'custom'>('none');
  const [link, setLink] = useState('');
  const [selectedDiscountId, setSelectedDiscountId] = useState<string | null>(null);
  
  const [isSending, setIsSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // 🌟 CHIROYLI MODALLAR UCHUN STATE'LAR
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' }>({ isOpen: false, title: '', message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; targetTitle: string; targetMessage: string }>({ isOpen: false, title: '', targetTitle: '', targetMessage: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: recentDiscounts, isLoading: isDiscountsLoading } = useQuery({
    queryKey: ['adminRecentDiscounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discounts')
        .select(`id, product_name, discount_percent, merchant:merchants(name)`)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: linkType === 'discount'
  });

  const getTwoDaysAgo = () => {
    const d = new Date();
    d.setHours(d.getHours() - 48);
    return d.toISOString();
  };

  const { data: recentAnnouncements, isLoading: isAnnouncementsLoading } = useQuery({
    queryKey: ['adminRecentAnnouncements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('title, message, created_at')
        .gte('created_at', getTwoDaysAgo())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const uniqueMap = new Map();
      data?.forEach(item => {
        const key = `${item.title}|${item.message}`;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, item);
        }
      });

      return Array.from(uniqueMap.values());
    },
    refetchInterval: 10000 
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    
    setIsSending(true);
    setSuccessMsg('');

    try {
      let finalLink = null;
      if (linkType === 'discount' && selectedDiscountId) {
        finalLink = `/discount/${selectedDiscountId}`;
      } else if (linkType === 'custom' && link.trim() !== '') {
        finalLink = link.trim();
      }

      const { data: students, error: fetchError } = await supabase.from('students').select('id').eq('is_active', true);
      if (fetchError) throw fetchError;
      if (!students || students.length === 0) throw new Error("Faol talabalar topilmadi.");

      const notifications = students.map(student => ({
        user_id: student.id,
        title: title,
        message: message,
        link: finalLink,
        is_read: false
      }));

      const { error: insertError } = await supabase.from('notifications').insert(notifications);
      if (insertError) throw insertError;

      await logAdminAction("E'LON JO'NATDI", 'TIZIM', `${students.length} ta talabaga: ${title}`);

      setTitle('');
      setMessage('');
      setLinkType('none');
      setLink('');
      setSelectedDiscountId(null);
      
      queryClient.invalidateQueries({ queryKey: ['adminRecentAnnouncements'] });
      
      // 🌟 Standart alert o'rniga shaxsiy modal chaqiramiz
      setAlertModal({
        isOpen: true,
        type: 'success',
        title: "Muvaffaqiyatli!",
        message: `${students.length} ta talabaga e'lon muvaffaqiyatli jo'natildi!`
      });
      
    } catch (err: any) {
      setAlertModal({
        isOpen: true,
        type: 'error',
        title: "Xatolik yuz berdi",
        message: err.message
      });
    } finally {
      setIsSending(false);
    }
  };

  // 🌟 O'CHIRISH UCHUN TASDIQLASH OYNASINI OCHISH
  const openConfirmDelete = (announcementTitle: string, announcementMessage: string) => {
    setConfirmModal({
      isOpen: true,
      title: announcementTitle,
      targetTitle: announcementTitle,
      targetMessage: announcementMessage
    });
  };

  // 🌟 O'CHIRISHNI IJRO ETISH
  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('title', confirmModal.targetTitle)
        .eq('message', confirmModal.targetMessage)
        .gte('created_at', getTwoDaysAgo());

      if (error) throw error;

      await logAdminAction("E'LONNI O'CHIRDI", 'TIZIM', confirmModal.targetTitle);
      
      setConfirmModal({ ...confirmModal, isOpen: false }); // Yopish
      queryClient.invalidateQueries({ queryKey: ['adminRecentAnnouncements'] });

      // O'chirilgach, muvaffaqiyat oynasini ochish
      setAlertModal({
        isOpen: true,
        type: 'success',
        title: "O'chirildi",
        message: "E'lon barcha talabalar panelidan muvaffaqiyatli o'chirib tashlandi!"
      });

    } catch (err: any) {
      setConfirmModal({ ...confirmModal, isOpen: false });
      setAlertModal({
        isOpen: true,
        type: 'error',
        title: "Xatolik",
        message: err.message
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout title="Global E'lonlar">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* YUBORISH QISMI */}
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[32px] p-8 shadow-sm">
          <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
            <Megaphone size={32} />
          </div>
          
          <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] mb-2">Barchaga E'lon yuborish</h2>
          <p className="text-[14px] text-[hsl(var(--muted-foreground))] mb-8 leading-relaxed">
            Bu yerdan yozilgan xabar tizimdagi barcha <b>tasdiqlangan talabalarning</b> bildirishnomalar oynasiga darhol yetib boradi.
          </p>

          <form onSubmit={handleSend} className="space-y-5">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] block mb-1.5 ml-1">Xabar sarlavhasi</label>
              <input 
                type="text" required value={title} onChange={e => setTitle(e.target.value)} 
                placeholder="Masalan: Tizimda yangilanishlar!" 
                className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-3.5 px-4 rounded-2xl text-[14px] font-semibold outline-none focus:border-[hsl(var(--primary))] transition-colors" 
              />
            </div>
            
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] block mb-1.5 ml-1">Xabar matni</label>
              <textarea 
                required rows={4} value={message} onChange={e => setMessage(e.target.value)} 
                placeholder="Asosiy e'lon matni..." 
                className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-3.5 px-4 rounded-2xl text-[14px] font-medium outline-none focus:border-[hsl(var(--primary))] transition-colors resize-none" 
              />
            </div>

            <div className="pt-2 pb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] block mb-3 ml-1">Qo'shimcha harakat (Ixtiyoriy)</label>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                
                <label className={`flex-1 flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${linkType === 'discount' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.05)]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--secondary)/.5)]'}`}>
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" checked={linkType === 'discount'} onChange={() => { setLinkType(linkType === 'discount' ? 'none' : 'discount'); setLink(''); }} className="w-5 h-5 accent-[hsl(var(--primary))] cursor-pointer rounded-md" />
                  </div>
                  <Ticket size={18} className={linkType === 'discount' ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'} />
                  <span className={`text-[13px] font-bold select-none ${linkType === 'discount' ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--foreground))]'}`}>Mavjud chegirmani ulash</span>
                </label>

                <label className={`flex-1 flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${linkType === 'custom' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.05)]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--secondary)/.5)]'}`}>
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" checked={linkType === 'custom'} onChange={() => { setLinkType(linkType === 'custom' ? 'none' : 'custom'); setSelectedDiscountId(null); }} className="w-5 h-5 accent-[hsl(var(--primary))] cursor-pointer rounded-md" />
                  </div>
                  <LinkIcon size={18} className={linkType === 'custom' ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'} />
                  <span className={`text-[13px] font-bold select-none ${linkType === 'custom' ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--foreground))]'}`}>Boshqa link ulash</span>
                </label>
              </div>

              {linkType === 'discount' && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                  <div className="bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] rounded-2xl max-h-[220px] overflow-y-auto p-2 space-y-1.5 shadow-inner">
                    {isDiscountsLoading ? (
                      <div className="p-6 text-center text-sm font-semibold text-[hsl(var(--muted-foreground))] flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={18}/> Yuklanmoqda...</div>
                    ) : recentDiscounts && recentDiscounts.length > 0 ? (
                      recentDiscounts.map((d: any) => (
                        <div key={d.id} onClick={() => setSelectedDiscountId(d.id)} className={`p-3.5 rounded-[14px] cursor-pointer border-2 transition-all flex items-center justify-between ${selectedDiscountId === d.id ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.1)] shadow-sm' : 'border-transparent hover:bg-[hsl(var(--secondary))]'}`}>
                           <div className="flex-1 pr-4">
                             <p className={`font-bold text-[14px] line-clamp-1 ${selectedDiscountId === d.id ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--foreground))]'}`}>{d.product_name}</p>
                             <p className="text-[12px] text-[hsl(var(--muted-foreground))] font-semibold mt-0.5">Do'kon: {d.merchant?.name}</p>
                           </div>
                           <div className="text-[12px] font-extrabold text-white bg-red-500 px-2.5 py-1 rounded-lg shrink-0 shadow-sm">-{d.discount_percent}%</div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-sm font-semibold text-[hsl(var(--muted-foreground))]">Chegirmalar topilmadi</div>
                    )}
                  </div>
                </div>
              )}

              {linkType === 'custom' && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                  <input type="text" value={link} onChange={e => setLink(e.target.value)} placeholder="Masalan: /services yoki https://youtube.com" className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-3.5 px-4 rounded-2xl text-[14px] font-medium outline-none focus:border-[hsl(var(--primary))] transition-colors" />
                </div>
              )}
            </div>

            <button type="submit" disabled={isSending || (linkType === 'discount' && !selectedDiscountId) || (linkType === 'custom' && !link)} className="w-full py-4 mt-6 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold text-[15px] rounded-2xl shadow-float active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer">
              {isSending ? <Loader2 className="animate-spin" size={20}/> : <>Yuborish <Send size={18} /></>}
            </button>
          </form>
        </div>

        {/* SO'NGGI 48 SOATDAGI E'LONLAR RO'YXATI */}
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[32px] p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="text-orange-500" size={24} />
            <h3 className="font-display text-xl font-bold text-[hsl(var(--foreground))]">So'nggi 48 soatdagi e'lonlar</h3>
          </div>
          <p className="text-[13.5px] text-[hsl(var(--muted-foreground))] mb-6 leading-relaxed">
            Quyida so'nggi ikki kun ichida barchaga yuborilgan e'lonlar ro'yxati keltirilgan. Agar xato yuborib qo'ygan bo'lsangiz, ularni tanlab o'chirishingiz mumkin. Muddatidan o'tgan e'lonlar bu yerda ko'rinmaydi.
          </p>

          {isAnnouncementsLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[hsl(var(--muted-foreground))]" size={24} /></div>
          ) : recentAnnouncements && recentAnnouncements.length > 0 ? (
            <div className="space-y-3">
              {recentAnnouncements.map((ann, idx) => (
                <div key={idx} className="bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-2xl p-4 flex gap-4 items-center justify-between shadow-sm hover:border-[hsl(var(--primary))/30] transition-colors">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[15px] text-[hsl(var(--foreground))] truncate">{ann.title}</h4>
                    <p className="text-[13px] text-[hsl(var(--muted-foreground))] line-clamp-1 mt-1">{ann.message}</p>
                    <p className="text-[11px] font-semibold text-[hsl(var(--accent))] mt-2 flex items-center gap-1.5 bg-[hsl(var(--accent))/10] w-fit px-2 py-0.5 rounded-md">
                      <Clock size={12} /> {new Date(ann.created_at).toLocaleString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button
                    onClick={() => openConfirmDelete(ann.title, ann.message)}
                    className="w-11 h-11 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors shrink-0 shadow-sm active:scale-90"
                    title="E'lonni o'chirish"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[hsl(var(--background))] border border-dashed border-[hsl(var(--border))] rounded-2xl p-8 text-center flex flex-col items-center">
              <Megaphone className="text-[hsl(var(--muted-foreground))] opacity-30 mb-3" size={32} />
              <p className="text-[14px] font-medium text-[hsl(var(--muted-foreground))]">So'nggi 48 soat ichida yuborilgan e'lonlar yo'q.</p>
            </div>
          )}
        </div>

      </div>

      {/* 🌟 1. TASDIQLASH (CONFIRM) MODALI */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[32px] p-6 md:p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-red-500/20 shadow-inner">
              <AlertTriangle size={32} strokeWidth={2.5} />
            </div>
            <h3 className="font-display text-xl font-bold text-[hsl(var(--foreground))] mb-2">Ishonchingiz komilmi?</h3>
            <p className="text-[14px] font-medium text-[hsl(var(--muted-foreground))] mb-8 leading-relaxed">
              Rostdan ham "{confirmModal.title}" e'lonini barcha talabalar panelidan o'chirib tashlamoqchimisiz?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} 
                disabled={isDeleting}
                className="flex-1 py-3.5 bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] font-bold text-[15px] rounded-[20px] transition-all"
              >
                Bekor qilish
              </button>
              <button 
                onClick={executeDelete} 
                disabled={isDeleting}
                className="flex-1 py-3.5 bg-red-500 text-white font-bold text-[15px] rounded-[20px] shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="animate-spin" size={18} /> : "O'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 2. MUVAFFAQIYAT / XATOLIK (ALERT) MODALI */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
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
              className="w-full py-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold text-[16px] rounded-[20px] shadow-float active:scale-95 transition-all"
            >
              Yopish
            </button>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}