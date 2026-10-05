import { useState, useRef } from 'react';
import { PlusCircle, Tag as TagIcon, Loader2, Camera, Trash2, Clock, ShieldAlert, ArrowLeft, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/lib/i18n';
import Cropper from 'react-easy-crop';

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

export default function MerchantDiscounts() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [items, setItems] = useState<{ name: string; quantity: string; isUnlimited?: boolean }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]); // 🌟 TEG TAKLIFLARI UCHUN
  
  const [discountPercent, setDiscountPercent] = useState('');
  const [shortDesc, setShortDesc] = useState(''); 
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('22:00');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

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
      const { data, error } = await supabase.from('discounts').select('*, discount_views(count)').eq('merchant_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // 🌟 BAZADAN ESKI TEGLARNI TORTIB OLISH
  const { data: previousTags } = useQuery({
    queryKey: ['merchantPreviousTags'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from('discounts').select('items').eq('merchant_id', user.id);
      const tags = new Set<string>();
      data?.forEach(d => {
        if (Array.isArray(d.items)) {
          d.items.forEach((i: any) => tags.add(i.name));
        }
      });
      return Array.from(tags);
    }
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setSelectedImage(reader.result as string));
      reader.readAsDataURL(file);
      e.target.value = ''; 
    }
  };

  const handleCropSave = async () => {
    if (!selectedImage || !croppedAreaPixels) return;
    try {
      setIsSubmitting(true);
      const currentSelectedImage = selectedImage; 
      setSelectedImage(null); 
      
      const image = await createImage(currentSelectedImage);
      const canvas = document.createElement('canvas'); 
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let targetWidth = croppedAreaPixels.width; 
      let targetHeight = croppedAreaPixels.height;
      
      if (targetWidth > 1024) { 
        targetHeight = Math.round((targetHeight * 1024) / targetWidth); 
        targetWidth = 1024; 
      }
      canvas.width = targetWidth; 
      canvas.height = targetHeight;

      ctx.drawImage(
        image, 
        croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height, 
        0, 0, targetWidth, targetHeight
      );

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `discount-${Date.now()}.jpg`, { type: 'image/jpeg' });
          setImageFile(file); 
          setImagePreview(URL.createObjectURL(file));
        }
      }, 'image/jpeg', 0.7); 

    } catch (error) { 
      alert("Xatolik yuz berdi"); 
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🌟 TEG YOZILGANDA TAKLIFLARNI CHIQARISH
  const handleTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (val.trim().length > 0 && previousTags) {
      const matches = previousTags.filter(t => t.toLowerCase().includes(val.toLowerCase()) && !items.find(i => i.name === t));
      setTagSuggestions(matches);
    } else {
      setTagSuggestions([]);
    }

    if (val.endsWith('  ')) {
      let newTag = val.trim();
      newTag = newTag.split(' ').map(word => word ? word.charAt(0).toUpperCase() + word.slice(1) : '').join(' ');
      if (newTag && !items.find(i => i.name === newTag)) {
        setItems([...items, { name: newTag, quantity: '', isUnlimited: false }]);
      }
      setInputValue('');
      setTagSuggestions([]);
    }
  };

  // 🌟 TAKLIF QILINGAN TEGNI BOSGANDA QO'SHISH
  const addTagFromSuggestion = (tag: string) => {
    if (!items.find(i => i.name === tag)) {
      setItems([...items, { name: tag, quantity: '', isUnlimited: false }]);
    }
    setInputValue('');
    setTagSuggestions([]);
  };

  const removeItem = (idxToRemove: number) => setItems(items.filter((_, idx) => idx !== idxToRemove));
  const updateItemQuantity = (idx: number, newQty: string) => {
    const newItems = [...items]; newItems[idx].quantity = newQty; setItems(newItems);
  };
  const toggleUnlimited = (idx: number, checked: boolean) => {
    const newItems = [...items]; newItems[idx].isUnlimited = checked; if (!checked) newItems[idx].quantity = ''; setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return alert("Kamida bitta mahsulot kiritishingiz kerak!");
    for (const item of items) {
      if (!item.isUnlimited && (!item.quantity || Number(item.quantity) <= 0)) return alert(`Iltimos, "${item.name}" uchun to'g'ri miqdor kiriting (yoki cheksizni belgilang)!`);
    }

    const finalProductName = items.map(i => i.name).join(', ');
    if (!imageFile || !finalProductName || !discountPercent || !startDate || !endDate || !shortDesc) return alert("Barcha maydonlarni to'ldiring!");
    
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessiya topilmadi");

      const fileExt = imageFile.name.split('.').pop() || 'jpg';
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('discounts').upload(fileName, imageFile);
      if (uploadError) throw new Error(uploadError.message);
      
      const { data: publicUrlData } = supabase.storage.from('discounts').getPublicUrl(fileName);

      const formattedItems = items.map(i => ({ name: i.name, quantity: i.isUnlimited ? 999999 : Number(i.quantity), isUnlimited: !!i.isUnlimited }));

      const { data: newDiscount, error: dbError } = await supabase.from('discounts').insert([{
        merchant_id: user.id, product_name: finalProductName, items: formattedItems, discount_percent: parseInt(discountPercent),
        short_description: shortDesc, start_date: startDate, end_date: endDate, start_time: startTime, end_time: endTime, image_url: publicUrlData.publicUrl
      }]).select('id').single();

      if (dbError) throw new Error(dbError.message);
      
      if (newDiscount && merchantStatus) {
        const { data: views } = await supabase.from('discount_views').select('student_id').eq('merchant_id', user.id);
        const { data: scans } = await supabase.from('scan_history').select('student_id').eq('merchant_id', user.id);
        const studentIds = new Set([...(views?.map(v => v.student_id) || []), ...(scans?.map(s => s.student_id) || [])]);

        if (studentIds.size > 0) {
          const notifications = Array.from(studentIds).map(student_id => ({
            user_id: student_id, title: "Yangi chegirma! ⚡️", message: `Siz qiziqqan "${merchantStatus.name}" do'koni yangi chegirma e'lon qildi: ${shortDesc}`, link: `/discount/${newDiscount.id}`
          }));
          await supabase.from('notifications').insert(notifications);
        }
      }

      closeModal();
      queryClient.invalidateQueries({ queryKey: ['merchantDiscounts'] });
      queryClient.invalidateQueries({ queryKey: ['allDiscounts'] }); 
      queryClient.invalidateQueries({ queryKey: ['merchantPreviousTags'] }); 
    } catch (error: any) { alert("XATOLIK:\n" + error.message); } 
    finally { setIsSubmitting(false); }
  };

  const closeModal = () => {
    setIsModalOpen(false); setImageFile(null); setImagePreview(null); setItems([]); setInputValue(''); setTagSuggestions([]);
    setDiscountPercent(''); setShortDesc(''); setStartDate(''); setEndDate('');
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;
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
             <p className="text-sm font-medium text-orange-500 leading-relaxed">{t('checking_desc_merchant')}</p>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))]">{t('discounts')}</h2>
          {isActive ? (
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 text-sm font-bold bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-2.5 rounded-full shadow-float active:scale-95 transition-all">
              <PlusCircle size={18}/> {t('new_btn')}
            </button>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1.5 text-[11px] font-bold text-orange-500 uppercase tracking-wider border border-orange-500/20">
              <Clock size={14} /> {t('pending')}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[20px] overflow-hidden shadow-sm relative flex flex-col animate-pulse"><div className="w-full aspect-video bg-[hsl(var(--muted))]"></div><div className="p-4 h-24"></div></div>
            ))}
          </div>
        ) : discounts && discounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {discounts.map((discount: any) => {
              const viewsCount = Array.isArray(discount.discount_views) ? discount.discount_views[0]?.count || 0 : discount.discount_views?.count || 0;
              return (
                <div key={discount.id} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[20px] overflow-hidden shadow-sm relative group flex flex-col">
                  <button onClick={() => handleDelete(discount.id, discount.image_url)} className="absolute top-2 left-2 z-10 bg-red-500/90 text-white p-2 rounded-full backdrop-blur-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer"><Trash2 size={16} /></button>
                  <div className="absolute top-2 right-2 z-10 bg-red-500 text-white text-[13px] font-extrabold px-3 py-1.5 rounded-xl shadow-md">-{discount.discount_percent}%</div>
                  <div className="w-full aspect-video bg-[hsl(var(--secondary))] overflow-hidden"><img src={discount.image_url} alt={discount.product_name} className="w-full h-full object-cover" /></div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-[15px] text-[hsl(var(--foreground))] leading-tight line-clamp-2">{discount.short_description || discount.product_name.replace(/,/g, ' • ')}</h3>
                    <div className="mt-auto pt-3 flex items-end justify-between gap-2">
                      <div className="flex flex-wrap gap-1.5 flex-1">
                        {discount.items && discount.items.length > 0 && discount.items.map((item: any, i: number) => (
                           <span key={i} className="text-[10px] font-bold bg-[hsl(var(--secondary))] px-2 py-1 rounded-md text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                             {item.name}: <span className={item.quantity > 0 || item.isUnlimited ? "text-[hsl(var(--primary))]" : "text-red-500"}>{item.isUnlimited ? `∞ (${t('unlimited')})` : `${item.quantity} ta`}</span>
                           </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[hsl(var(--muted-foreground))] bg-[hsl(var(--secondary))] px-2.5 py-1.5 rounded-lg border border-[hsl(var(--border))] shrink-0" title="Ushbu chegirma ko'rilgan marta">
                        <Eye size={14} /> {viewsCount}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-8 rounded-[24px] text-center flex flex-col items-center mt-10">
            <TagIcon size={40} className="text-[hsl(var(--muted-foreground))/50] mb-3" />
            <p className="font-bold text-[hsl(var(--foreground))]">{t('no_active_discounts')}</p>
          </div>
        )}
      </div>

      {isModalOpen && isActive && (
        <div className="fixed inset-0 z-[99999] bg-[hsl(var(--background))] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex-none bg-[hsl(var(--background))] px-4 py-3 flex items-center justify-between z-10 border-b border-[hsl(var(--border))]">
            <button type="button" onClick={closeModal} className="p-2 -ml-2 rounded-full hover:bg-[hsl(var(--secondary))] transition-colors text-[hsl(var(--foreground))]"><ArrowLeft size={22} /></button>
            <h3 className="font-display text-[16px] font-bold text-[hsl(var(--foreground))] tracking-wide">{t('new_discount_title')}</h3>
            <div className="w-10"></div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-[80px]">
            <div className="max-w-md mx-auto">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex flex-col mb-1">
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                  <div onClick={() => fileInputRef.current?.click()} className={`w-full aspect-[16/10] rounded-[24px] bg-[hsl(var(--secondary))/30] overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-colors shadow-sm ${!imagePreview ? 'border-2 border-dashed border-[hsl(var(--border))] hover:border-[hsl(var(--primary))/50]' : 'border border-[hsl(var(--border))]'}`}>
                    {imagePreview ? ( <img src={imagePreview} className="w-full h-full object-cover" /> ) : (
                      <> 
                        {isSubmitting ? <Loader2 className="animate-spin text-[hsl(var(--accent))]" size={32} /> : (
                           <><Camera size={32} className="text-[hsl(var(--muted-foreground))]/50 mb-3" /> <span className="text-[11px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider text-center">{t('upload_horizontal_img')}</span></>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-1 mb-1.5 block">{t('short_desc_label')}</label>
                  <input type="text" required value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} placeholder={t('short_desc_placeholder')} className="w-full bg-[hsl(var(--secondary))/20] border border-[hsl(var(--border))] py-3.5 px-4 rounded-2xl text-[14px] font-semibold outline-none focus:border-[hsl(var(--primary))] transition-colors" />
                </div>

                <div className="relative">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-1 mb-1.5 block">{t('products_label')}</label>
                  <input type="text" value={inputValue} onChange={handleTagInput} placeholder={t('products_placeholder')} className="w-full bg-[hsl(var(--secondary))/20] border border-[hsl(var(--border))] py-3.5 px-4 rounded-2xl text-[14px] font-semibold outline-none focus:border-[hsl(var(--primary))] transition-colors" />
                  
                  {/* 🌟 TEG TAKLIFLARI DROPDOWN */}
                  {tagSuggestions.length > 0 && (
                    <div className="absolute z-20 w-full bg-[hsl(var(--card))] border border-[hsl(var(--border))] mt-1.5 rounded-2xl shadow-xl max-h-40 overflow-y-auto overflow-hidden animate-in fade-in slide-in-from-top-2">
                      {tagSuggestions.map(tag => (
                        <div key={tag} onClick={() => addTagFromSuggestion(tag)} className="px-4 py-3 hover:bg-[hsl(var(--secondary))] cursor-pointer font-bold text-sm text-[hsl(var(--foreground))] transition-colors border-b border-[hsl(var(--border))] last:border-0">
                          {tag}
                        </div>
                      ))}
                    </div>
                  )}

                  {items.length > 0 && (
                    <div className="mt-3 space-y-2 relative z-10">
                      {items.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 bg-[hsl(var(--secondary))/10] p-3 pl-4 rounded-2xl border border-[hsl(var(--border))] animate-in fade-in slide-in-from-top-2">
                          <div className="flex-1 font-bold text-[14px] mt-2 truncate text-[hsl(var(--foreground))]">{item.name}</div>
                          <div className="flex flex-col items-center gap-1.5 w-[90px] shrink-0">
                            <input 
                              type={item.isUnlimited ? "text" : "number"} min="1" required={!item.isUnlimited} placeholder={t('quantity_placeholder')} 
                              value={item.isUnlimited ? "∞" : item.quantity} onChange={(e) => updateItemQuantity(idx, e.target.value)} disabled={item.isUnlimited}
                              className={`w-full min-w-0 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl px-3 py-2 text-sm font-bold text-center outline-none transition-colors shadow-sm ${item.isUnlimited ? 'cursor-not-allowed opacity-60 text-lg font-black' : 'focus:border-[hsl(var(--primary))]'}`} 
                            />
                            <label className="flex items-center gap-1.5 cursor-pointer select-none">
                              <input type="checkbox" checked={!!item.isUnlimited} onChange={(e) => toggleUnlimited(idx, e.target.checked)} className="w-3.5 h-3.5 accent-[hsl(var(--primary))] cursor-pointer rounded-sm" />
                              <span className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">{t('unlimited')}</span>
                            </label>
                          </div>
                          <button type="button" onClick={() => removeItem(idx)} className="text-red-500 p-2 mt-0.5 hover:bg-red-500/10 rounded-xl transition-colors shrink-0"><Trash2 size={18} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-1 mb-1.5 block">{t('discount_percent_label')}</label>
                  <input type="number" required min="1" max="100" value={discountPercent} onChange={(e)=>setDiscountPercent(e.target.value)} className="w-full bg-[hsl(var(--secondary))/20] border border-[hsl(var(--border))] py-3.5 px-4 rounded-2xl text-[14px] font-semibold outline-none focus:border-[hsl(var(--primary))] transition-colors" />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="min-w-0">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-1 mb-1.5 block truncate">{t('start_date')}</label>
                    <input type="date" required value={startDate} onChange={(e)=>setStartDate(e.target.value)} className="w-full min-w-0 bg-[hsl(var(--secondary))/20] border border-[hsl(var(--border))] py-3.5 px-3 rounded-2xl text-[13px] sm:text-[14px] font-bold outline-none focus:border-[hsl(var(--primary))] transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-1 mb-1.5 block truncate">{t('end_date')}</label>
                    <input type="date" required value={endDate} onChange={(e)=>setEndDate(e.target.value)} className="w-full min-w-0 bg-[hsl(var(--secondary))/20] border border-[hsl(var(--border))] py-3.5 px-3 rounded-2xl text-[13px] sm:text-[14px] font-bold outline-none focus:border-[hsl(var(--primary))] transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="min-w-0">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-1 mb-1.5 block truncate">{t('start_time')}</label>
                    <input type="time" required value={startTime} onChange={(e)=>setStartTime(e.target.value)} className="w-full min-w-0 bg-[hsl(var(--secondary))/20] border border-[hsl(var(--border))] py-3.5 px-3 rounded-2xl text-[13px] sm:text-[14px] font-bold outline-none focus:border-[hsl(var(--primary))] transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-1 mb-1.5 block truncate">{t('end_time')}</label>
                    <input type="time" required value={endTime} onChange={(e)=>setEndTime(e.target.value)} className="w-full min-w-0 bg-[hsl(var(--secondary))/20] border border-[hsl(var(--border))] py-3.5 px-3 rounded-2xl text-[13px] sm:text-[14px] font-bold outline-none focus:border-[hsl(var(--primary))] transition-colors" />
                  </div>
                </div>
                
                <div className="flex gap-4 pt-2 pb-6">
                  <button type="button" onClick={closeModal} className="flex-1 py-4 bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] font-bold text-[15px] rounded-2xl active:scale-95 transition-all cursor-pointer">{t('cancel')}</button>
                  <button type="submit" disabled={isSubmitting || !imageFile} className="flex-1 py-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold text-[15px] rounded-2xl shadow-float active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer">
                    {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : t('post_btn')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 z-[9999999] flex flex-col bg-black/95 backdrop-blur-md">
          <div className="relative flex-1 w-full mt-10">
            <Cropper image={selectedImage} crop={crop} zoom={zoom} aspect={16/9} showGrid={false} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)} />
          </div>
          <div className="p-6 pb-12 bg-black flex flex-col gap-6 items-center">
            <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="w-full max-w-xs accent-[hsl(var(--primary))]" />
            <div className="flex w-full max-w-xs gap-4">
              <button onClick={() => setSelectedImage(null)} className="flex-1 py-3.5 font-bold rounded-2xl text-white bg-white/20 hover:bg-white/30 transition-colors">{t('cancel')}</button>
              <button onClick={handleCropSave} className="flex-1 py-3.5 font-bold rounded-2xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Qirqish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}