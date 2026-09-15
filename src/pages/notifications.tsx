import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, Loader2, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

      // O'qilmagan xabarlarni o'qilgan qilib belgilash
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    }
    fetchNotifications();
  }, []);

  return (
    <div className="page-enter pb-20 px-4 pt-6 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-8">
         <Link href="/">
           <button className="w-10 h-10 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-full flex items-center justify-center text-[hsl(var(--foreground))] shadow-sm active:scale-95 transition-all hover:border-[hsl(var(--accent))]">
             <ArrowLeft size={20}/>
           </button>
         </Link>
         <h1 className="font-display text-2xl font-bold text-[hsl(var(--foreground))]">Bildirishnomalar</h1>
      </div>

      {loading ? (
         <div className="flex justify-center pt-20"><Loader2 className="animate-spin text-[hsl(var(--accent))]" size={32}/></div>
      ) : notifications.length > 0 ? (
         <div className="space-y-3">
           {notifications.map(note => (
             <div key={note.id} className={`p-4 rounded-[24px] border-2 transition-all ${note.is_read ? 'bg-[hsl(var(--card))] border-[hsl(var(--border))]' : 'bg-[hsl(var(--accent)/.1)] border-[hsl(var(--accent)/.3)] shadow-sm'}`}>
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 shrink-0 ${note.title.includes('Diqqat') || note.title.includes('Tugamoqda') ? 'text-orange-500' : 'text-green-500'}`}>
                     {note.title.includes('Diqqat') || note.title.includes('Tugamoqda') ? <AlertTriangle size={22}/> : <CheckCircle2 size={22}/>}
                  </div>
                  <div>
                    <h3 className="font-bold text-[15px] text-[hsl(var(--foreground))] mb-1.5 leading-tight">{note.title}</h3>
                    <p className="text-[13px] font-medium text-[hsl(var(--muted-foreground))] leading-relaxed">{note.message}</p>
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