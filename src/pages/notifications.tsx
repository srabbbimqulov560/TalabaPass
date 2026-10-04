import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, CheckCircle2, AlertTriangle, ArrowLeft, ChevronRight, Info, CheckCheck } from 'lucide-react';
import { Link, useLocation } from 'wouter';

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
    }
  };

  const handleNotificationClick = async (note: any) => {
    // Agar o'qilmagan bo'lsa, avval o'qilgan deb belgilaymiz
    if (!note.is_read) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', note.id);
      setNotifications(prev => prev.map(n => n.id === note.id ? { ...n, is_read: true } : n));
    }
    
    // Agar link mavjud bo'lsa, shu sahifaga yo'naltiramiz
    if (note.link) {
      setLocation(note.link);
    }
  };

  const hasUnread = notifications.some(n => !n.is_read);

  return (
    <div className="page-enter pb-20 px-4 pt-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-8">
         <div className="flex items-center gap-3">
           <Link href="/">
             <button className="w-10 h-10 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-full flex items-center justify-center text-[hsl(var(--foreground))] shadow-sm active:scale-95 transition-all hover:border-[hsl(var(--accent))]">
               <ArrowLeft size={20}/>
             </button>
           </Link>
           <h1 className="font-display text-2xl font-bold text-[hsl(var(--foreground))]">Bildirishnomalar</h1>
         </div>

         {hasUnread && (
           <button 
             onClick={markAllAsRead} 
             className="flex items-center gap-1.5 text-[11px] font-bold text-[hsl(var(--accent))] bg-[hsl(var(--accent)/.1)] px-3 py-1.5 rounded-full hover:bg-[hsl(var(--accent)/.2)] transition-colors"
           >
             <CheckCheck size={14} /> Hammasini o'qish
           </button>
         )}
      </div>

      {loading ? (
         <div className="space-y-3">
           {[1, 2, 3, 4, 5].map((i) => (
             <div key={i} className="p-4 rounded-[24px] border-2 bg-[hsl(var(--card))] border-[hsl(var(--border))] animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-[22px] h-[22px] rounded-full bg-[hsl(var(--muted))] shrink-0 mt-0.5"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-[hsl(var(--muted))] rounded-md w-2/3 mb-2.5"></div>
                    <div className="h-3 bg-[hsl(var(--muted))] rounded-md w-full mb-1.5"></div>
                    <div className="h-3 bg-[hsl(var(--muted))] rounded-md w-5/6"></div>
                    <div className="h-2.5 bg-[hsl(var(--muted))] rounded-md w-1/3 mt-4"></div>
                  </div>
                </div>
             </div>
           ))}
         </div>
      ) : notifications.length > 0 ? (
         <div className="space-y-3">
           {notifications.map(note => (
             <div 
               key={note.id} 
               onClick={() => handleNotificationClick(note)}
               className={`p-4 rounded-[24px] border-2 transition-all cursor-pointer hover:border-[hsl(var(--accent))] active:scale-[0.98] relative ${note.is_read ? 'bg-[hsl(var(--card))] border-[hsl(var(--border))]' : 'bg-[hsl(var(--accent)/.05)] border-[hsl(var(--accent)/.3)] shadow-sm'}`}
             >
                {/* O'qilmagan bo'lsa miltillovchi qizil nuqta */}
                {!note.is_read && (
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                )}
                
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 shrink-0 ${note.title.includes('Diqqat') || note.title.includes('Tugamoqda') ? 'text-orange-500' : note.title.includes('Yangi') || note.title.includes('E\'lon') ? 'text-blue-500' : 'text-green-500'}`}>
                     {note.title.includes('Diqqat') || note.title.includes('Tugamoqda') ? <AlertTriangle size={22}/> : note.title.includes('Yangi') || note.title.includes('E\'lon') ? <Info size={22}/> : <CheckCircle2 size={22}/>}
                  </div>
                  <div className="flex-1 pr-2">
                    <h3 className={`text-[15px] mb-1.5 leading-tight ${note.is_read ? 'font-semibold text-[hsl(var(--foreground))]' : 'font-extrabold text-[hsl(var(--foreground))]'}`}>{note.title}</h3>
                    <p className={`text-[13px] leading-relaxed ${note.is_read ? 'font-medium text-[hsl(var(--muted-foreground))]' : 'font-semibold text-[hsl(var(--foreground))]'}`}>{note.message}</p>
                    
                    {note.link && (
                      <div className="mt-2 text-[hsl(var(--accent))] text-[12px] font-bold flex items-center gap-1">
                        To'liq ko'rish <ChevronRight size={14} />
                      </div>
                    )}

                    <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] mt-3 uppercase tracking-wider">
                      {new Date(note.created_at).toLocaleDateString('uz-UZ')} • {new Date(note.created_at).toLocaleTimeString('uz-UZ', {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
             </div>
           ))}
         </div>
      ) : (
         <div className="text-center py-20 bg-[hsl(var(--card))] border border-dashed border-[hsl(var(--border))] rounded-[32px]">
           <Bell className="mx-auto text-[hsl(var(--muted-foreground))] mb-4 opacity-50" size={48} />
           <h3 className="font-bold text-lg text-[hsl(var(--foreground))] mb-1">Xabarlar yo'q</h3>
           <p className="text-[13px] font-medium text-[hsl(var(--muted-foreground))] px-8">Hozircha sizga hech qanday bildirishnoma kelmadi.</p>
         </div>
      )}
    </div>
  );
}