import { useState, useRef } from 'react';
import { PlusCircle, Tag as TagIcon, Loader2, Camera, Trash2, Clock, CalendarDays, X, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function MerchantDiscounts() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  
  const [discountPercent, setDiscountPercent] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('22:00');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // BAZADAN CHEGIRMALAR VA ULARNING KO'RISHLAR SONINI (COUNT) TORTIB OLISH
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
      const newTag = val.trim();
      if (newTag && !tags.includes(newTag)) setTags([...tags, newTag]);
      setInputValue('');
    } else {
      setInputValue(val);
    }
  };

  const removeTag = (tagToRemove: string) => setTags(tags.filter(t => t !== tagToRemove));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalProductName = [...tags, inputValue.trim()].filter(Boolean).join(', ');
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

      const { error: dbError } = await supabase.from('discounts').insert([{
        merchant_id: user.id, product_name: finalProductName, discount_percent: parseInt(discountPercent),
        start_date: startDate, end_date: endDate, start_time: startTime, end_time: endTime, image_url: publicUrlData.publicUrl
      }]);

      if (dbError) throw new Error(dbError.message);

      setIsModalOpen(false); setImageFile(null); setImagePreview(null); setTags([]); setInputValue(''); 
      setDiscountPercent(''); setStartDate(''); setEndDate('');
      queryClient.invalidateQueries({ queryKey: ['merchantDiscounts'] });
    } catch (error: any) {
      alert("XATOLIK YUZ BERDI:\n" + error.message);
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))]">Chegirmalar</h2>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 text-sm font-bold bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-2.5 rounded-full shadow-float active:scale-95 transition-all">
          <PlusCircle size={18}/> Yangi
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center pt-20"><Loader2 className="animate-spin text-[hsl(var(--accent))]" size={32}/></div>
      ) : discounts && discounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {discounts.map((discount: any) => (
            <div key={discount.id} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[20px] overflow-hidden shadow-sm relative group flex flex-col">
              <button onClick={() => handleDelete(discount.id, discount.image_url)} className="absolute top-2 left-2 z-10 bg-red-500/90 text-white p-2 rounded-full backdrop-blur-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
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
                
                <div className="mt-4 flex items-center text-[12px] font-semibold text-[hsl(var(--muted-foreground))]">
                  <div className="flex flex-col gap-1.5">
                    <span className="flex items-center gap-1.5"><CalendarDays size={14} className="text-[hsl(var(--accent))]"/> {discount.start_date.slice(5).replace('-','.')} - {discount.end_date.slice(5).replace('-','.')}</span>
                    <span className="flex items-center gap-1.5"><Clock size={14} className="text-[hsl(var(--accent))]"/> {discount.start_time.slice(0, 5)} - {discount.end_time.slice(0, 5)}</span>
                  </div>
                  
                  {/* KO'RISHLAR SONI - O'NG BURCHAKDA */}
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

      {/* MODAL (ESKI HOLIDA QOLDI) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end" style={{ height: '100dvh' }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          <div className="relative bg-[hsl(var(--card))] rounded-t-[32px] p-6 pb-[100px] animate-in slide-in-from-bottom-full duration-300 shadow-2xl h-[90vh] overflow-y-auto border-t border-[hsl(var(--border))]">
            <div className="w-12 h-1.5 bg-[hsl(var(--muted))] rounded-full mx-auto mb-6" />
            <h3 className="font-display text-xl font-bold mb-6 text-[hsl(var(--foreground))]">Yangi chegirma yaratish</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col mb-2">
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                <div onClick={() => fileInputRef.current?.click()} className="w-full aspect-video rounded-2xl bg-[hsl(var(--secondary))] border-2 border-dashed border-[hsl(var(--border))] overflow-hidden flex flex-col items-center justify-center cursor-pointer hover:border-[hsl(var(--accent))] transition-colors">
                  {imagePreview ? ( <img src={imagePreview} className="w-full h-full object-cover" /> ) : (
                    <> <Camera size={32} className="text-[hsl(var(--muted-foreground))]/50 mb-2" /> <span className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase text-center">Gorizontal rasm yuklang (16:9)</span> </>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-2 mb-1.5 block">Nomi (2 ta probel bosing)</label>
                <div className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-2 px-3 rounded-2xl min-h-[54px] flex flex-wrap items-center gap-2 focus-within:border-[hsl(var(--accent))] transition-all cursor-text" onClick={() => document.getElementById('tag-input')?.focus()}>
                  {tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">
                      {tag} <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-300"><X size={14} /></button>
                    </span>
                  ))}
                  <input id="tag-input" type="text" value={inputValue} onChange={handleTagInput} onKeyDown={(e) => { if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) removeTag(tags[tags.length - 1]); }} placeholder={tags.length === 0 ? "Masalan: Burger (2 ta probel bosing)" : "Yana qo'shish..."} className="flex-1 bg-transparent outline-none text-sm font-semibold min-w-[150px] text-[hsl(var(--foreground))]" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-2 mb-1.5 block">Chegirma Foizi (%)</label>
                <input type="number" required min="1" max="100" value={discountPercent} onChange={(e)=>setDiscountPercent(e.target.value)} className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-3.5 px-4 rounded-2xl text-sm font-semibold outline-none focus:border-[hsl(var(--accent))]" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-2 mb-1.5 block">Boshlanish</label><input type="date" required value={startDate} onChange={(e)=>setStartDate(e.target.value)} className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-3.5 px-4 rounded-2xl text-sm font-bold outline-none focus:border-[hsl(var(--accent))]" /></div>
                <div><label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-2 mb-1.5 block">Tugash</label><input type="date" required value={endDate} onChange={(e)=>setEndDate(e.target.value)} className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-3.5 px-4 rounded-2xl text-sm font-bold outline-none focus:border-[hsl(var(--accent))]" /></div>
                <div><label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-2 mb-1.5 block">Vaqt (dan)</label><input type="time" required value={startTime} onChange={(e)=>setStartTime(e.target.value)} className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-3.5 px-4 rounded-2xl text-sm font-bold outline-none focus:border-[hsl(var(--accent))]" /></div>
                <div><label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-2 mb-1.5 block">Vaqt (gacha)</label><input type="time" required value={endTime} onChange={(e)=>setEndTime(e.target.value)} className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-3.5 px-4 rounded-2xl text-sm font-bold outline-none focus:border-[hsl(var(--accent))]" /></div>
              </div>

              <button type="submit" disabled={isSubmitting || !imageFile} className="w-full py-4 mt-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold rounded-2xl shadow-float active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : "Saqlash"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}