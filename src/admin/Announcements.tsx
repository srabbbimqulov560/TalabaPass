import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Send, Loader2, Megaphone, Users, Ticket, Link as LinkIcon } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { logAdminAction } from '@/lib/adminLogger';
import { useQuery } from '@tanstack/react-query';

export default function Announcements() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  
  // Link turini tanlash: 'none' (hech qaysi), 'discount' (chegirma), 'custom' (qo'lda)
  const [linkType, setLinkType] = useState<'none' | 'discount' | 'custom'>('none');
  
  const [link, setLink] = useState('');
  const [selectedDiscountId, setSelectedDiscountId] = useState<string | null>(null);
  
  const [isSending, setIsSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Eng so'nggi qo'shilgan chegirmalarni tortib olish (Faqat 'discount' tanlanganda ishlaydi)
  const { data: recentDiscounts, isLoading: isDiscountsLoading } = useQuery({
    queryKey: ['adminRecentDiscounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discounts')
        .select(`id, product_name, discount_percent, merchant:merchants(name)`)
        .order('created_at', { ascending: false })
        .limit(20); // So'nggi 20 ta chegirma
      if (error) throw error;
      return data;
    },
    enabled: linkType === 'discount'
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    
    setIsSending(true);
    setSuccessMsg('');

    try {
      // 1. Havolani aniqlaymiz
      let finalLink = null;
      if (linkType === 'discount' && selectedDiscountId) {
        finalLink = `/discount/${selectedDiscountId}`;
      } else if (linkType === 'custom' && link.trim() !== '') {
        finalLink = link.trim();
      }

      // 2. Barcha faol talabalarni olamiz
      const { data: students, error: fetchError } = await supabase
        .from('students')
        .select('id')
        .eq('is_active', true);
        
      if (fetchError) throw fetchError;
      if (!students || students.length === 0) throw new Error("Faol talabalar topilmadi.");

      // 3. Xabarlarni shakllantiramiz
      const notifications = students.map(student => ({
        user_id: student.id,
        title: title,
        message: message,
        link: finalLink,
        is_read: false
      }));

      // 4. Supabase'ga birdaniga (bulk) yuboramiz
      const { error: insertError } = await supabase.from('notifications').insert(notifications);
      if (insertError) throw insertError;

      await logAdminAction("E'LON JO'NATDI", 'TIZIM', `${students.length} ta talabaga`);

      setSuccessMsg(`${students.length} ta talabaga muvaffaqiyatli jo'natildi!`);
      setTitle('');
      setMessage('');
      setLinkType('none');
      setLink('');
      setSelectedDiscountId(null);
      
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
          <p className="text-[14px] text-[hsl(var(--muted-foreground))] mb-8 leading-relaxed">
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

            {/* QO'SHIMCHA SOZLAMALAR: LINK TURI */}
            <div className="pt-2 pb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] block mb-3 ml-1">Qo'shimcha harakat (Ixtiyoriy)</label>
              
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                
                <label className={`flex-1 flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${linkType === 'discount' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.05)]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--secondary)/.5)]'}`}>
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      checked={linkType === 'discount'} 
                      onChange={() => {
                        setLinkType(linkType === 'discount' ? 'none' : 'discount');
                        setLink(''); // Boshqa turni tozalash
                      }} 
                      className="w-5 h-5 accent-[hsl(var(--primary))] cursor-pointer rounded-md" 
                    />
                  </div>
                  <Ticket size={18} className={linkType === 'discount' ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'} />
                  <span className={`text-[13px] font-bold select-none ${linkType === 'discount' ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--foreground))]'}`}>Mavjud chegirmani ulash</span>
                </label>

                <label className={`flex-1 flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${linkType === 'custom' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.05)]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--secondary)/.5)]'}`}>
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      checked={linkType === 'custom'} 
                      onChange={() => {
                        setLinkType(linkType === 'custom' ? 'none' : 'custom');
                        setSelectedDiscountId(null); // Boshqa turni tozalash
                      }} 
                      className="w-5 h-5 accent-[hsl(var(--primary))] cursor-pointer rounded-md" 
                    />
                  </div>
                  <LinkIcon size={18} className={linkType === 'custom' ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'} />
                  <span className={`text-[13px] font-bold select-none ${linkType === 'custom' ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--foreground))]'}`}>Boshqa link ulash</span>
                </label>

              </div>

              {/* 1. CHEGIRMA TANLASH OYNASI */}
              {linkType === 'discount' && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                  <div className="bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] rounded-2xl max-h-[220px] overflow-y-auto p-2 space-y-1.5 shadow-inner">
                    {isDiscountsLoading ? (
                      <div className="p-6 text-center text-sm font-semibold text-[hsl(var(--muted-foreground))] flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={18}/> Yuklanmoqda...
                      </div>
                    ) : recentDiscounts && recentDiscounts.length > 0 ? (
                      recentDiscounts.map((d: any) => (
                        <div
                          key={d.id}
                          onClick={() => setSelectedDiscountId(d.id)}
                          className={`p-3.5 rounded-[14px] cursor-pointer border-2 transition-all flex items-center justify-between ${
                            selectedDiscountId === d.id 
                              ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.1)] shadow-sm' 
                              : 'border-transparent hover:bg-[hsl(var(--secondary))]'
                          }`}
                        >
                           <div className="flex-1 pr-4">
                             <p className={`font-bold text-[14px] line-clamp-1 ${selectedDiscountId === d.id ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--foreground))]'}`}>
                               {d.product_name}
                             </p>
                             <p className="text-[12px] text-[hsl(var(--muted-foreground))] font-semibold mt-0.5">
                               Do'kon: {d.merchant?.name}
                             </p>
                           </div>
                           <div className="text-[12px] font-extrabold text-white bg-red-500 px-2.5 py-1 rounded-lg shrink-0 shadow-sm">
                             -{d.discount_percent}%
                           </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-sm font-semibold text-[hsl(var(--muted-foreground))]">
                        Chegirmalar topilmadi
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. MAXSUS HAVOLA KIRITISH OYNASI */}
              {linkType === 'custom' && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                  <input 
                    type="text" 
                    value={link} 
                    onChange={e => setLink(e.target.value)} 
                    placeholder="Masalan: /services yoki https://youtube.com" 
                    className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-3.5 px-4 rounded-2xl text-[14px] font-medium outline-none focus:border-[hsl(var(--primary))] transition-colors" 
                  />
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isSending || (linkType === 'discount' && !selectedDiscountId) || (linkType === 'custom' && !link)}
              className="w-full py-4 mt-6 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold text-[15px] rounded-2xl shadow-float active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSending ? <Loader2 className="animate-spin" size={20}/> : <>Yuborish <Send size={18} /></>}
            </button>
          </form>
          
        </div>
      </div>
    </AdminLayout>
  );
}