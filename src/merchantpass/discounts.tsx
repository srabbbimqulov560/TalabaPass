import { useState, useRef } from 'react';
import { PlusCircle, Tag as TagIcon, Loader2, Camera, Trash2, Clock, CalendarDays, X, Eye, ShieldAlert, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function MerchantDiscounts() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 🌟 YANGI: Teglar endi obyekt shaklida (nomi va miqdori bilan)
  const [items, setItems] = useState<{ name: string; quantity: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  
  const [discountPercent, setDiscountPercent] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('22:00');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: merchantStatus } = useQuery({
    queryKey: ['merchantStatus'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from('merchants').select('is_active, name').eq('id', user.id).single();
      return data;
    }
  });

  const isActive = merchantStatus?.is_active === true;

  const { data: discounts, isLoading } = useQuery({
    queryKey: ['merchantDiscounts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");
      const { data, error } = await supabase
        .from('discounts')
        .select('*, discount_views(count)')
        .eq('merchant_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file); setImagePreview(URL.createObjectURL(file));
    }
  };

  // 🌟 YANGI: 2 ta probel bosilganda element yaratiladi
  const handleTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.endsWith('  ')) {
      const newTag = val.trim();
      if (newTag && !items.find(i => i.name === newTag)) {
        setItems([...items, { name: newTag, quantity: '' }]);
      }
      setInputValue('');
    } else {
      setInputValue(val);
    }
  };

  const removeItem = (idxToRemove: number) => {
    setItems(items.filter((_, idx) => idx !== idxToRemove));
  };

  const updateItemQuantity = (idx: number, newQty: string) => {
    const newItems = [...items];
    newItems[idx].quantity = newQty;
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return alert("Kamida bitta mahsulot kiritishingiz kerak!");
    
    // Miqdorlarni tekshirish
    for (const item of items) {
      if (!item.quantity || Number(item.quantity) <= 0) {
        return alert(`Iltimos, "${item.name}" uchun to'g'ri miqdor kiriting!`);
      }
    }

    const finalProductName = items.map(i => i.name).join(', ');
    
    if (!imageFile || !finalProductName || !discountPercent || !startDate || !endDate) return alert("Barcha maydonlarni to'ldiring!");
    
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessiya topilmadi");

      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('discounts').upload(fileName, imageFile);
      if (uploadError) throw new Error(uploadError.message);
      
      const { data: publicUrlData } = supabase.storage.from('discounts').getPublicUrl(fileName);

      // JSONB formatida saqlanadigan mahsulotlar ro'yxati
      const formattedItems = items.map(i => ({ name: i.name, quantity: Number(i.quantity) }));

      // BAZAGA YOZISH
      const { error: dbError } = await supabase.from('discounts').insert([{
        merchant_id: user.id, 
        product_name: finalProductName, 
        items: formattedItems, // 🌟 Yangi JSONB ustun
        discount_percent: parseInt(discountPercent),
        start_date: startDate, end_date: endDate, start_time: startTime, end_time: endTime, image_url: publicUrlData.publicUrl
      }]);

      if (dbError) throw new Error(dbError.message);

      // Kuzatuvchilarga xabar yuborish qismi (Avvalgidek qoldi)
      const { data: savedDiscounts } = await supabase.from('discounts').select('id').eq('merchant_id', user.id);
      if (savedDiscounts && savedDiscounts.length > 0) {
        const discountIds = savedDiscounts.map(d => String(d.id));
        const { data: favUsers } = await supabase.from('favorites').select('user_id').in('discount_id', discountIds);
        if (favUsers && favUsers.length > 0) {
           const uniqueUserIds = [...new Set(favUsers.map(u => u.user_id))];
           const notificationsData = uniqueUserIds.map(userId => ({
              user_id: userId, title: `${merchantStatus?.name || "Do'kon"} - yangi chegirma!`,
              message: `Siz kuzatayotgan do'kon: ${finalProductName} (-${discountPercent}%) e'lon qildi! Kirib ko'ring.`, is_read: false
           }));
           await supabase.from('notifications').insert(notificationsData);
        }
      }

      closeModal();
      queryClient.invalidateQueries({ queryKey: ['merchantDiscounts'] });
      queryClient.invalidateQueries({ queryKey: ['allDiscounts'] }); 
      
    } catch (error: any) {
      alert("XATOLIK YUZ BERDI:\n" + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false); setImageFile(null); setImagePreview(null); setItems([]); setInputValue(''); 
    setDiscountPercent(''); setStartDate(''); setEndDate('');
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm("Haqiqatan ham bu chegirmani o'chirmoqchimisiz?")) return;
    try {
      await supabase.from('discounts').delete().eq('id', id);
      queryClient.invalidateQueries({ queryKey: ['merchantDiscounts'] });
      const fileName = imageUrl.split('/').pop();
      if (fileName) await supabase.storage.from('discounts').remove([fileName]);
    } catch (error) { console.error(error); }
  };

  return (
    <div className="page-enter pb-10">
      
      {merchantStatus && !isActive && (
        <div className="mb-6 bg-orange-500/10 border border-orange-500/30 p-4 rounded-2xl flex items-start gap-3">
           <ShieldAlert className="text-orange-500 shrink-0 mt-0.5" size={20} />
           <p className="text-sm font-medium text-orange-500 leading-relaxed">
             Hisobingiz hali tasdiqlanmagan. Administrator tasdiqlamaguncha yangi chegirmalar qo'sha olmaysiz.
           </p>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))]">Chegirmalar</h2>
        
        {isActive ? (
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 text-sm font-bold bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-2.5 rounded-full shadow-float active:scale-95 transition-all">
            <PlusCircle size={18}/> Yangi
          </button>
        ) : (
          <span className="flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1.5 text-[11px] font-bold text-orange-500 uppercase tracking-wider border border-orange-500/20">
            <Clock size={14} /> Kutilmoqda
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[20px] overflow-hidden shadow-sm relative flex flex-col animate-pulse">
              <div className="w-full aspect-video bg-[hsl(var(--muted))]"></div>
              <div className="p-4 h-24"></div>
            </div>
          ))}
        </div>
      ) : discounts && discounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {discounts.map((discount: any) => (
            <div key={discount.id} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[20px] overflow-hidden shadow-sm relative group flex flex-col">
              <button onClick={() => handleDelete(discount.id, discount.image_url)} className="absolute top-2 left-2 z-10 bg-red-500/90 text-white p-2 rounded-full backdrop-blur-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer">
                <Trash2 size={16} />
              </button>
              <div className="absolute top-2 right-2 z-10 bg-red-500 text-white text-[13px] font-extrabold px-3 py-1.5 rounded-xl shadow-md">
                -{discount.discount_percent}%
              </div>
              
              <div className="w-full aspect-video bg-[hsl(var(--secondary))] overflow-hidden">
                <img src={discount.image_url} alt={discount.product_name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-[15px] text-[hsl(var(--foreground))] leading-tight line-clamp-2">
                  {discount.product_name.replace(/,/g, ' • ')}
                </h3>
                
                {/* 🌟 YANGI: Karta ichida nechta mahsulot qolganini ko'rsatish */}
                {discount.items && discount.items.length > 0 && (
                   <div className="mt-2 flex flex-wrap gap-1.5">
                     {discount.items.map((item: any, i: number) => (
                       <span key={i} className="text-[10px] font-bold bg-[hsl(var(--secondary))] px-2 py-1 rounded-md text-[hsl(var(--muted-foreground))]">
                         {item.name}: <span className={item.quantity > 0 ? "text-[hsl(var(--primary))]" : "text-red-500"}>{item.quantity} ta</span>
                       </span>
                     ))}
                   </div>
                )}
                
                <div className="mt-4 flex items-center text-[12px] font-semibold text-[hsl(var(--muted-foreground))]">
                  <div className="flex flex-col gap-1.5">
                    <span className="flex items-center gap-1.5"><CalendarDays size={14} className="text-[hsl(var(--accent))]"/> {discount.start_date.slice(5).replace('-','.')} - {discount.end_date.slice(5).replace('-','.')}</span>
                    <span className="flex items-center gap-1.5"><Clock size={14} className="text-[hsl(var(--accent))]"/> {discount.start_time.slice(0, 5)} - {discount.end_time.slice(0, 5)}</span>
                  </div>
                  
                  <div className="ml-auto flex items-center gap-1.5 bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] px-3 py-1.5 rounded-xl border border-[hsl(var(--border))]">
                    <Eye size={14} className="text-[hsl(var(--muted-foreground))]" />
                    <span className="font-extrabold">{discount.discount_views?.[0]?.count || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-8 rounded-[24px] text-center flex flex-col items-center mt-10">
          <TagIcon size={40} className="text-[hsl(var(--muted-foreground))/50] mb-3" />
          <p className="font-bold text-[hsl(var(--foreground))]">Hozircha chegirmalar yo'q</p>
        </div>
      )}

      {/* 🌟 YANGILANGAN: TO'LIQ EKRANLI YARATISH OYNASI */}
      {isModalOpen && isActive && (
        <div className="fixed inset-0 z-[100] bg-[hsl(var(--background))] overflow-y-auto animate-in slide-in-from-bottom-8 duration-300">
          <div className="sticky top-0 z-10 bg-[hsl(var(--background))/80] backdrop-blur-md border-b border-[hsl(var(--border))] px-4 py-4 flex items-center justify-between">
            <button type="button" onClick={closeModal} className="p-2 -ml-2 rounded-full hover:bg-[hsl(var(--secondary))] transition-colors text-[hsl(var(--foreground))]">
              <ArrowLeft size={24} />
            </button>
            <h3 className="font-display text-lg font-bold text-[hsl(var(--foreground))]">Yangi chegirma</h3>
            <div className="w-10"></div>
          </div>

          <div className="p-4 max-w-md mx-auto pb-32">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col mb-2">
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                <div onClick={() => fileInputRef.current?.click()} className="w-full aspect-video rounded-[24px] bg-[hsl(var(--card))] border-2 border-dashed border-[hsl(var(--border))] overflow-hidden flex flex-col items-center justify-center cursor-pointer hover:border-[hsl(var(--accent))] transition-colors shadow-sm">
                  {imagePreview ? ( <img src={imagePreview} className="w-full h-full object-cover" /> ) : (
                    <> <Camera size={36} className="text-[hsl(var(--muted-foreground))]/50 mb-3" /> <span className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase text-center">Gorizontal rasm yuklang (16:9)</span> </>
                  )}
                </div>
              </div>

              {/* 🌟 YANGI: OBYEKTLI TEG VA MIQDOR KIRITISH */}
              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-4 rounded-[24px] shadow-sm">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-1 mb-2 block">Mahsulotlarni kiriting (Nomidan keyin 2 ta probel bosing)</label>
                
                <input 
                  type="text" 
                  value={inputValue} 
                  onChange={handleTagInput} 
                  placeholder="Masalan: Burger  (2 ta probel)" 
                  className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-3.5 px-4 rounded-xl text-sm font-semibold outline-none focus:border-[hsl(var(--accent))] transition-colors" 
                />

                {items.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-[hsl(var(--background))] p-2 pl-4 rounded-xl border border-[hsl(var(--border))] animate-in fade-in slide-in-from-top-2">
                        <div className="flex-1 font-bold text-[14px] truncate text-[hsl(var(--foreground))]">{item.name}</div>
                        <div className="w-[100px]">
                          <input 
                            type="number" 
                            min="1"
                            required
                            placeholder="Soni" 
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(idx, e.target.value)}
                            className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm font-bold text-center outline-none focus:border-[hsl(var(--primary))] transition-colors"
                          />
                        </div>
                        <button type="button" onClick={() => removeItem(idx)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-2 mb-1.5 block">Chegirma Foizi (%)</label>
                <input type="number" required min="1" max="100" value={discountPercent} onChange={(e)=>setDiscountPercent(e.target.value)} className="w-full bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] py-3.5 px-4 rounded-[16px] text-sm font-semibold outline-none focus:border-[hsl(var(--accent))]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-2 mb-1.5 block">Boshlanish</label><input type="date" required value={startDate} onChange={(e)=>setStartDate(e.target.value)} className="w-full bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] py-3.5 px-4 rounded-[16px] text-sm font-bold outline-none focus:border-[hsl(var(--accent))]" /></div>
                <div><label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-2 mb-1.5 block">Tugash</label><input type="date" required value={endDate} onChange={(e)=>setEndDate(e.target.value)} className="w-full bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] py-3.5 px-4 rounded-[16px] text-sm font-bold outline-none focus:border-[hsl(var(--accent))]" /></div>
                <div><label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-2 mb-1.5 block">Vaqt (dan)</label><input type="time" required value={startTime} onChange={(e)=>setStartTime(e.target.value)} className="w-full bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] py-3.5 px-4 rounded-[16px] text-sm font-bold outline-none focus:border-[hsl(var(--accent))]" /></div>
                <div><label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-2 mb-1.5 block">Vaqt (gacha)</label><input type="time" required value={endTime} onChange={(e)=>setEndTime(e.target.value)} className="w-full bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] py-3.5 px-4 rounded-[16px] text-sm font-bold outline-none focus:border-[hsl(var(--accent))]" /></div>
              </div>
              
              {/* 🌟 YANGI: Ikkita tugma - Joylash va Bekor qilish */}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 py-4 bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] font-bold rounded-2xl active:scale-95 transition-all cursor-pointer">
                  Bekor qilish
                </button>
                <button type="submit" disabled={isSubmitting || !imageFile} className="flex-[2] py-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold rounded-2xl shadow-float active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer">
                  {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : "Joylash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}