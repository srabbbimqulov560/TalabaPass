import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, CheckCircle2, AlertTriangle, ArrowLeft, ChevronRight, Info, CheckCheck } from 'lucide-react';
import { useLocation } from 'wouter';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    async function fetchNotifications() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setNotifications(data);
      setLoading(false);
    }
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      // 🌟 SIGNAL YUBORISH (Qo'ng'iroqcha o'zini yangilashi uchun)
      window.dispatchEvent(new Event('notifications_updated'));
    }
  };

  const handleNotificationClick = async (note: any) => {
    if (!note.is_read) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', note.id);
      setNotifications(prev => prev.map(n => n.id === note.id ? { ...n, is_read: true } : n));
      // 🌟 SIGNAL YUBORISH (Bittaga kamaytiradi)
      window.dispatchEvent(new Event('notifications_updated'));
    }
    
    if (note.link) {
      setLocation(note.link);
    }
  };

  const hasUnread = notifications.some(n => !n.is_read);

  return (
    <div className="page-enter pb-20 px-4 pt-1 max-w-md mx-auto">
      
      <div className="flex items-center justify-between mb-5 mt-1">
         <div className="flex items-center gap-1.5 -ml-1.5">
           <button onClick={() => window.history.back()} className="p-1.5 rounded-full hover:bg-[hsl(var(--secondary))] transition-colors text-[hsl(var(--foreground))] cursor-pointer">
             <ArrowLeft size={22}/>
           </button>
           <h1 className="font-display text-[21px] font-bold text-[hsl(var(--foreground))] tracking-tight">Bildirishnomalar</h1>
         </div>

         <button 
           onClick={() => hasUnread && markAllAsRead()} 
           disabled={!hasUnread}
           title="Hammasini o'qilgan deb belgilash"
           className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 ${
             hasUnread 
               ? 'bg-[hsl(var(--accent)/.1)] text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/.2)] active:scale-95 cursor-pointer shadow-sm' 
               : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]/40 cursor-not-allowed'
           }`}
         >
           <CheckCheck size={18} />
         </button>
      </div>

      {loading ? (
         <div className="space-y-2.5">
           {[1, 2, 3, 4, 5].map((i) => (
             <div key={i} className="p-3.5 rounded-2xl border bg-[hsl(var(--card))] border-[hsl(var(--border))] animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-[18px] h-[18px] rounded-full bg-[hsl(var(--muted))] shrink-0 mt-0.5"></div>
                  <div className="flex-1">
                    <div className="h-3.5 bg-[hsl(var(--muted))] rounded-md w-2/3 mb-2"></div>
                    <div className="h-2.5 bg-[hsl(var(--muted))] rounded-md w-full mb-1.5"></div>
                    <div className="h-2.5 bg-[hsl(var(--muted))] rounded-md w-5/6"></div>
                    <div className="h-2 bg-[hsl(var(--muted))] rounded-md w-1/4 mt-3"></div>
                  </div>
                </div>
             </div>
           ))}
         </div>
      ) : notifications.length > 0 ? (
         <div className="space-y-2.5">
           {notifications.map(note => (
             <div 
               key={note.id} 
               onClick={() => handleNotificationClick(note)}
               className={`p-3.5 rounded-2xl border transition-all cursor-pointer hover:border-[hsl(var(--accent)/.5)] active:scale-[0.98] relative ${note.is_read ? 'bg-[hsl(var(--card))] border-[hsl(var(--border))] opacity-70 hover:opacity-100' : 'bg-[hsl(var(--card))] border-[hsl(var(--accent)/.3)] shadow-[0_2px_10px_rgba(28,170,136,0.05)]'}`}
             >
                {!note.is_read && (
                  <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]"></div>
                )}
                
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 shrink-0 ${note.title.includes('Diqqat') || note.title.includes('Tugamoqda') ? 'text-orange-500' : note.title.includes('Yangi') || note.title.includes('E\'lon') ? 'text-blue-500' : 'text-green-500'}`}>
                     {note.title.includes('Diqqat') || note.title.includes('Tugamoqda') ? <AlertTriangle size={18}/> : note.title.includes('Yangi') || note.title.includes('E\'lon') ? <Info size={18}/> : <CheckCircle2 size={18}/>}
                  </div>
                  <div className="flex-1 pr-3">
                    <h3 className={`text-[13px] mb-1 leading-tight ${note.is_read ? 'font-semibold text-[hsl(var(--foreground))]' : 'font-bold text-[hsl(var(--foreground))]'}`}>{note.title}</h3>
                    <p className={`text-[12px] leading-relaxed ${note.is_read ? 'font-medium text-[hsl(var(--muted-foreground))]' : 'font-semibold text-[hsl(var(--foreground))]'}`}>{note.message}</p>
                    
                    {note.link && (
                      <div className="mt-2 text-[hsl(var(--accent))] text-[11px] font-bold flex items-center gap-0.5">
                        Batafsil ko'rish <ChevronRight size={12} />
                      </div>
                    )}

                    <p className="text-[9px] font-bold text-[hsl(var(--muted-foreground))] mt-2.5 uppercase tracking-wider">
                      {new Date(note.created_at).toLocaleDateString('uz-UZ')} • {new Date(note.created_at).toLocaleTimeString('uz-UZ', {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
             </div>
           ))}
         </div>
      ) : (
         <div className="text-center py-16 bg-[hsl(var(--card))] border border-dashed border-[hsl(var(--border))] rounded-[24px]">
           <Bell className="mx-auto text-[hsl(var(--muted-foreground))] mb-3 opacity-40" size={36} />
           <h3 className="font-bold text-base text-[hsl(var(--foreground))] mb-1">Xabarlar yo'q</h3>
           <p className="text-[12px] font-medium text-[hsl(var(--muted-foreground))] px-8">Hozircha sizga hech qanday bildirishnoma kelmadi.</p>
         </div>
      )}
    </div>
  );
}