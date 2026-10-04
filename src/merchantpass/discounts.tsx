import { useState, useRef } from 'react';
import { PlusCircle, Tag as TagIcon, Loader2, Camera, Trash2, Clock, ShieldAlert, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function MerchantDiscounts() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [items, setItems] = useState<{ name: string; quantity: string; isUnlimited?: boolean }[]>([]);
  const [inputValue, setInputValue] = useState('');
  
  const [discountPercent, setDiscountPercent] = useState('');
  const [shortDesc, setShortDesc] = useState(''); 
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
      const { data } = await supabase.from('merchants').select('id, is_active, name').eq('id', user.id).single();
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

  const handleTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.endsWith('  ')) {
      let newTag = val.trim();
      newTag = newTag.split(' ').map(word => word ? word.charAt(0).toUpperCase() + word.slice(1) : '').join(' ');

      if (newTag && !items.find(i => i.name === newTag)) {
        setItems([...items, { name: newTag, quantity: '', isUnlimited: false }]);
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

  const toggleUnlimited = (idx: number, checked: boolean) => {
    const newItems = [...items];
    newItems[idx].isUnlimited = checked;
    if (!checked) newItems[idx].quantity = ''; 
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return alert("Kamida bitta mahsulot kiritishingiz kerak!");
    
    for (const item of items) {
      if (!item.isUnlimited && (!item.quantity || Number(item.quantity) <= 0)) {
        return alert(`Iltimos, "${item.name}" uchun to'g'ri miqdor kiriting (yoki cheksizni belgilang)!`);
      }
    }

    const finalProductName = items.map(i => i.name).join(', ');
    if (!imageFile || !finalProductName || !discountPercent || !startDate || !endDate || !shortDesc) return alert("Barcha maydonlarni to'ldiring!");
    
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessiya topilmadi");

      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('discounts').upload(fileName, imageFile);
      if (uploadError) throw new Error(uploadError.message);
      
      const { data: publicUrlData } = supabase.storage.from('discounts').getPublicUrl(fileName);

      const formattedItems = items.map(i => ({ 
        name: i.name, 
        quantity: i.isUnlimited ? 999999 : Number(i.quantity),
        isUnlimited: !!i.isUnlimited
      }));

      // 🌟 Chegirmani bazaga kiritish (Id ni olib qolamiz .select().single() bilan)
      const { data: newDiscount, error: dbError } = await supabase.from('discounts').insert([{
        merchant_id: user.id, 
        product_name: finalProductName, 
        items: formattedItems, 
        discount_percent: parseInt(discountPercent),
        short_description: shortDesc, 
        start_date: startDate, 
        end_date: endDate, 
        start_time: startTime, 
        end_time: endTime, 
        image_url: publicUrlData.publicUrl
      }]).select('id').single();

      if (dbError) throw new Error(dbError.message);
      
      // 🌟 FOYDALANUVCHILARGA XABARNOMA YUBORISH
      if (newDiscount && merchantStatus) {
        // Shu do'konga tegishli eski chegirmalarni ko'rganlar yoki xarid qilganlarni topamiz
        const { data: views } = await supabase.from('discount_views').select('student_id').eq('merchant_id', user.id);
        const { data: scans } = await supabase.from('scan_history').select('student_id').eq('merchant_id', user.id);

        const studentIds = new Set([
          ...(views?.map(v => v.student_id) || []),
          ...(scans?.map(s => s.student_id) || [])
        ]);

        if (studentIds.size > 0) {
          const notifications = Array.from(studentIds).map(student_id => ({
            user_id: student_id,
            title: "Yangi chegirma! ⚡️",
            message: `Siz qiziqqan "${merchantStatus.name}" do'koni yangi chegirma e'lon qildi: ${shortDesc}`,
            link: `/discount/${newDiscount.id}`
          }));
          // Hammasiga bittada tashlaymiz
          await supabase.from('notifications').insert(notifications);
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
    setDiscountPercent(''); setShortDesc(''); setStartDate(''); setEndDate('');
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
    <>
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
                    {discount.short_description || discount.product_name.replace(/,/g, ' • ')}
                  </h3>
                  
                  {discount.items && discount.items.length > 0 && (
                     <div className="mt-2 flex flex-wrap gap-1.5">
                       {discount.items.map((item: any, i: number) => (
                         <span key={i} className="text-[10px] font-bold bg-[hsl(var(--secondary))] px-2 py-1 rounded-md text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                           {item.name}: 
                           <span className={item.quantity > 0 || item.isUnlimited ? "text-[hsl(var(--primary))]" : "text-red-500"}>
                             {item.isUnlimited ? '∞ (Cheksiz)' : `${item.quantity} ta`}
                           </span>
                         </span>
                       ))}
                     </div>
                  )}
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
      </div>

      {isModalOpen && isActive && (
        <div className="fixed inset-0 z-[999999] bg-[hsl(var(--background))] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex-none bg-[hsl(var(--background))] px-4 py-3 flex items-center justify-between z-10 border-b border-[hsl(var(--border))]">
            <button type="button" onClick={closeModal} className="p-2 -ml-2 rounded-full hover:bg-[hsl(var(--secondary))] transition-colors text-[hsl(var(--foreground))]">
              <ArrowLeft size={22} />
            </button>
            <h3 className="font-display text-[16px] font-bold text-[hsl(var(--foreground))] tracking-wide">Yangi chegirma</h3>
            <div className="w-10"></div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-[80px]">
            <div className="max-w-md mx-auto">
              <form onSubmit={handleSubmit} className="space-y-5">
                
                <div className="flex flex-col mb-1">
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                  <div onClick={() => fileInputRef.current?.click()} className={`w-full aspect-[16/10] rounded-[24px] bg-[hsl(var(--secondary))/30] overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-colors shadow-sm ${!imagePreview ? 'border-2 border-dashed border-[hsl(var(--border))] hover:border-[hsl(var(--primary))/50]' : 'border border-[hsl(var(--border))]'}`}>
                    {imagePreview ? ( <img src={imagePreview} className="w-full h-full object-cover" /> ) : (
                      <> <Camera size={32} className="text-[hsl(var(--muted-foreground))]/50 mb-3" /> <span className="text-[11px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider text-center">Gorizontal rasm yuklang (16:9)</span> </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-1 mb-1.5 block">Qisqacha Tavsif (Bosh sahifa uchun)</label>
                  <input type="text" required value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} placeholder="Masalan: Barcha kiyimlarga 20% chegirma" className="w-full bg-[hsl(var(--secondary))/20] border border-[hsl(var(--border))] py-3.5 px-4 rounded-2xl text-[14px] font-semibold outline-none focus:border-[hsl(var(--primary))] transition-colors" />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-1 mb-1.5 block">Mahsulotlarni kiriting (Nomidan keyin 2 ta probel bosing)</label>
                  <input type="text" value={inputValue} onChange={handleTagInput} placeholder="Masalan: Katta Burger  (2 ta probel)" className="w-full bg-[hsl(var(--secondary))/20] border border-[hsl(var(--border))] py-3.5 px-4 rounded-2xl text-[14px] font-semibold outline-none focus:border-[hsl(var(--primary))] transition-colors" />

                  {items.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {items.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 bg-[hsl(var(--secondary))/10] p-3 pl-4 rounded-2xl border border-[hsl(var(--border))] animate-in fade-in slide-in-from-top-2">
                          <div className="flex-1 font-bold text-[14px] mt-2 truncate text-[hsl(var(--foreground))]">{item.name}</div>
                          
                          <div className="flex flex-col items-center gap-1.5 w-[90px] shrink-0">
                            <input 
                              type={item.isUnlimited ? "text" : "number"} 
                              min="1" required={!item.isUnlimited} placeholder="Soni" 
                              value={item.isUnlimited ? "∞" : item.quantity} 
                              onChange={(e) => updateItemQuantity(idx, e.target.value)} 
                              disabled={item.isUnlimited}
                              className={`w-full min-w-0 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl px-3 py-2 text-sm font-bold text-center outline-none transition-colors shadow-sm ${item.isUnlimited ? 'cursor-not-allowed opacity-60 text-lg font-black' : 'focus:border-[hsl(var(--primary))]'}`} 
                            />
                            <label className="flex items-center gap-1.5 cursor-pointer select-none">
                              <input type="checkbox" checked={!!item.isUnlimited} onChange={(e) => toggleUnlimited(idx, e.target.checked)} className="w-3.5 h-3.5 accent-[hsl(var(--primary))] cursor-pointer rounded-sm" />
                              <span className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Cheksiz</span>
                            </label>
                          </div>

                          <button type="button" onClick={() => removeItem(idx)} className="text-red-500 p-2 mt-0.5 hover:bg-red-500/10 rounded-xl transition-colors shrink-0">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-1 mb-1.5 block">Chegirma Foizi (%)</label>
                  <input type="number" required min="1" max="100" value={discountPercent} onChange={(e)=>setDiscountPercent(e.target.value)} className="w-full bg-[hsl(var(--secondary))/20] border border-[hsl(var(--border))] py-3.5 px-4 rounded-2xl text-[14px] font-semibold outline-none focus:border-[hsl(var(--primary))] transition-colors" />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="min-w-0">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-1 mb-1.5 block truncate">Boshlanish</label>
                    <input type="date" required value={startDate} onChange={(e)=>setStartDate(e.target.value)} className="w-full min-w-0 bg-[hsl(var(--secondary))/20] border border-[hsl(var(--border))] py-3.5 px-3 rounded-2xl text-[13px] sm:text-[14px] font-bold outline-none focus:border-[hsl(var(--primary))] transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-1 mb-1.5 block truncate">Tugash</label>
                    <input type="date" required value={endDate} onChange={(e)=>setEndDate(e.target.value)} className="w-full min-w-0 bg-[hsl(var(--secondary))/20] border border-[hsl(var(--border))] py-3.5 px-3 rounded-2xl text-[13px] sm:text-[14px] font-bold outline-none focus:border-[hsl(var(--primary))] transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="min-w-0">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-1 mb-1.5 block truncate">Vaqt (dan)</label>
                    <input type="time" required value={startTime} onChange={(e)=>setStartTime(e.target.value)} className="w-full min-w-0 bg-[hsl(var(--secondary))/20] border border-[hsl(var(--border))] py-3.5 px-3 rounded-2xl text-[13px] sm:text-[14px] font-bold outline-none focus:border-[hsl(var(--primary))] transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-1 mb-1.5 block truncate">Vaqt (gacha)</label>
                    <input type="time" required value={endTime} onChange={(e)=>setEndTime(e.target.value)} className="w-full min-w-0 bg-[hsl(var(--secondary))/20] border border-[hsl(var(--border))] py-3.5 px-3 rounded-2xl text-[13px] sm:text-[14px] font-bold outline-none focus:border-[hsl(var(--primary))] transition-colors" />
                  </div>
                </div>
                
                <div className="flex gap-4 pt-2 pb-6">
                  <button type="button" onClick={closeModal} className="flex-1 py-4 bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] font-bold text-[15px] rounded-2xl active:scale-95 transition-all cursor-pointer">Bekor qilish</button>
                  <button type="submit" disabled={isSubmitting || !imageFile} className="flex-1 py-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold text-[15px] rounded-2xl shadow-float active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer">
                    {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : "Joylash"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}