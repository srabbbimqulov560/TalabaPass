import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Send, Loader2, Megaphone, Users } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { logAdminAction } from '@/lib/adminLogger';

export default function Announcements() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    
    setIsSending(true);
    setSuccessMsg('');

    try {
      // Barcha faol talabalarni olamiz
      const { data: students, error: fetchError } = await supabase
        .from('students')
        .select('id')
        .eq('is_active', true);
        
      if (fetchError) throw fetchError;
      if (!students || students.length === 0) throw new Error("Faol talabalar topilmadi.");

      // Xabarlarni shakllantiramiz
      const notifications = students.map(student => ({
        user_id: student.id,
        title: title,
        message: message,
        link: link || null,
        is_read: false
      }));

      // Supabase'ga birdaniga (bulk) yuboramiz
      const { error: insertError } = await supabase.from('notifications').insert(notifications);
      if (insertError) throw insertError;

      await logAdminAction("E'LON JO'NATDI", 'TIZIM', `${students.length} ta talabaga`);

      setSuccessMsg(`${students.length} ta talabaga muvaffaqiyatli jo'natildi!`);
      setTitle('');
      setMessage('');
      setLink('');
      
    } catch (err: any) {
      alert("Xatolik yuz berdi: " + err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AdminLayout title="Global E'lonlar">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[32px] p-8 shadow-sm">
          
          <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
            <Megaphone size={32} />
          </div>
          
          <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] mb-2">Barchaga E'lon yuborish</h2>
          <p className="text-[14px] text-[hsl(var(--muted-foreground))] mb-8">
            Bu yerdan yozilgan xabar tizimdagi barcha <b>tasdiqlangan talabalarning</b> bildirishnomalar oynasiga darhol yetib boradi.
          </p>

          {successMsg && (
            <div className="mb-6 bg-green-500/10 border border-green-500/30 text-green-500 p-4 rounded-xl font-bold text-sm flex items-center gap-2">
              <Users size={18} /> {successMsg}
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-5">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] block mb-1.5 ml-1">Xabar sarlavhasi</label>
              <input 
                type="text" 
                required 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="Masalan: Tizimda yangilanishlar!" 
                className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-3.5 px-4 rounded-2xl text-[14px] font-semibold outline-none focus:border-[hsl(var(--primary))] transition-colors" 
              />
            </div>
            
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] block mb-1.5 ml-1">Xabar matni</label>
              <textarea 
                required 
                rows={4}
                value={message} 
                onChange={e => setMessage(e.target.value)} 
                placeholder="Asosiy e'lon matni..." 
                className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-3.5 px-4 rounded-2xl text-[14px] font-medium outline-none focus:border-[hsl(var(--primary))] transition-colors resize-none" 
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] block mb-1.5 ml-1">Havola (Ixtiyoriy link)</label>
              <input 
                type="text" 
                value={link} 
                onChange={e => setLink(e.target.value)} 
                placeholder="Masalan: /services (Tugma bosilganda qayerga o'tsin)" 
                className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-3.5 px-4 rounded-2xl text-[14px] font-medium outline-none focus:border-[hsl(var(--primary))] transition-colors" 
              />
            </div>

            <button 
              type="submit" 
              disabled={isSending}
              className="w-full py-4 mt-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold text-[15px] rounded-2xl shadow-float active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
            >
              {isSending ? <Loader2 className="animate-spin" size={20}/> : <>Yuborish <Send size={18} /></>}
            </button>
          </form>
          
        </div>
      </div>
    </AdminLayout>
  );
}