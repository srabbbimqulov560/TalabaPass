import { useState, useRef } from 'react';
import { PlusCircle, Trash2, Loader2, Camera, Store, Tags, LayoutGrid, Globe, ArrowLeft, CheckCircle2, Edit3 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Cropper from 'react-easy-crop';
import AdminLayout from './AdminLayout';

const compressImage = (file: File, maxWidth = 1200, quality = 0.7): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width; let height = img.height;
        if (width > maxWidth) { height = Math.round((height * maxWidth) / width); width = maxWidth; }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(file); return; }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' }));
          else resolve(file);
        }, 'image/jpeg', quality);
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

export default function AdminCarousel() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 🌟 MODAL VA TAHRIRLASH STATE'LARI
  const [successModal, setSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editBannerId, setEditBannerId] = useState<string | null>(null);

  // Form State
  const [type, setType] = useState<'discount' | 'merchant' | 'external' | 'category'>('discount');
  const [referenceId, setReferenceId] = useState('');
  const [title, setTitle] = useState('');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  // Bazadagi ma'lumotlarni tortish
  const { data: banners, isLoading } = useQuery({
    queryKey: ['adminBanners'],
    queryFn: async () => {
      const { data, error } = await supabase.from('carousel_banners').select('*').order('created_at', { ascending: false });
      if (error) throw error; return data;
    }
  });

  const { data: discounts } = useQuery({
    queryKey: ['allActiveDiscounts'],
    queryFn: async () => {
      const { data } = await supabase.from('discounts').select('id, product_name, short_description, image_url, merchant:merchants(name)').gte('end_date', new Date().toISOString().split('T')[0]);
      return data || [];
    }
  });

  const { data: merchants } = useQuery({
    queryKey: ['allMerchants'],
    queryFn: async () => {
      const { data } = await supabase.from('merchants').select('id, name').eq('is_active', true);
      return data || [];
    }
  });

  const internalLinks = [
    { label: "Bosh sahifa", path: "/" },
    { label: "Xizmatlar (Barcha do'konlar)", path: "/services" },
    { label: "Saqlangan chegirmalar", path: "/saved" },
    { label: "Foydalanuvchi Profili", path: "/profile" },
    { label: "QR Skaner oynasi", path: "/qr" }
  ];

  const handleDiscountSelect = (discountId: string) => {
    setReferenceId(discountId);
    const d = discounts?.find(x => x.id === discountId);
    if (d) {
      setTitle(d.short_description || d.product_name);
      if (!imageFile) setImagePreview(d.image_url);
    }
  };

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
      const currentSelectedImage = selectedImage; setSelectedImage(null); 
      const image = await createImage(currentSelectedImage);
      const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let targetWidth = croppedAreaPixels.width; let targetHeight = croppedAreaPixels.height;
      if (targetWidth > 1200) { targetHeight = Math.round((targetHeight * 1200) / targetWidth); targetWidth = 1200; }
      canvas.width = targetWidth; canvas.height = targetHeight;

      ctx.drawImage(image, croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height, 0, 0, targetWidth, targetHeight);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'banner.jpg', { type: 'image/jpeg' });
          setImageFile(file); setImagePreview(URL.createObjectURL(file));
        }
      }, 'image/jpeg', 0.8);
    } catch (error) { alert("Xatolik"); }
  };

  // 🌟 TAHRIRLASh OYNASINI OCHISH
  const handleEdit = (banner: any) => {
    setIsEditMode(true);
    setEditBannerId(banner.id);
    setType(banner.type as any);
    setReferenceId(banner.reference_id);
    setTitle(banner.title);
    setImagePreview(banner.image_url);
    setImageFile(null); // Yangi fayl tanlanmagan
    setIsModalOpen(true);
  };

  // FORMANI TOZALASH
  const closeAndResetModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditBannerId(null);
    setImageFile(null);
    setImagePreview(null);
    setTitle('');
    setReferenceId('');
    setType('discount');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceId || !title) return alert("Barcha maydonlarni to'ldiring!");
    if (type !== 'discount' && !imageFile && !imagePreview) return alert("Rasm kiritish shart!");

    setIsSubmitting(true);
    try {
      let finalImageUrl = imagePreview;

      // Agar yangi rasm yuklangan bo'lsa
      if (imageFile) {
        const compressed = await compressImage(imageFile);
        const fileName = `banner-${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage.from('discounts').upload(fileName, compressed);
        if (uploadError) throw new Error(uploadError.message);
        const { data: publicUrlData } = supabase.storage.from('discounts').getPublicUrl(fileName);
        finalImageUrl = publicUrlData.publicUrl;
      }

      if (!finalImageUrl) throw new Error("Rasm yo'q!");

      if (isEditMode && editBannerId) {
        // 🌟 TAHRIRLASH (UPDATE) QISMI
        const { error: dbError } = await supabase.from('carousel_banners').update({
          type, reference_id: referenceId, title, image_url: finalImageUrl
        }).eq('id', editBannerId);
        
        if (dbError) throw dbError;
        setSuccessMessage("Banner muvaffaqiyatli tahrirlandi!");

      } else {
        // 🌟 YANGI QO'SHISH VA BILDIRISHNOMA (INSERT)
        const { error: dbError } = await supabase.from('carousel_banners').insert([{
          type, reference_id: referenceId, title, image_url: finalImageUrl
        }]);
        if (dbError) throw dbError;

        // Bildirishnomalarni faqat yangi qo'shilganda yuboramiz (Edit da spamlashni oldini olish uchun)
        const { data: students } = await supabase.from('students').select('id').eq('is_active', true);
        if (students && students.length > 0) {
          let notifMessage = "";
          let notifLink = "/";

          if (type === 'merchant') {
             notifMessage = `Hozirda ushbu do'konda qaynoq chegirmalar va yangiliklar ketmoqda: ${title}. Batafsil ko'rish uchun kiring!`;
             notifLink = `/store/${referenceId}`;
          } else if (type === 'discount') {
             notifMessage = `Yangi chegirma e'lon qilindi: ${title}. Shoshiling, imkoniyatni qo'ldan boy bermang!`;
             notifLink = `/discount/${referenceId}`;
          } else if (type === 'category') {
             notifMessage = `Dasturda yangilanish: ${title}. Hoziroq kirib ko'ring!`;
             notifLink = referenceId; 
          } else {
             notifMessage = `Qiziqarli yangilik: ${title}. Batafsil o'qish uchun kiring!`;
             notifLink = referenceId;
          }

          const notifications = students.map(s => ({
            user_id: s.id, title: "Yangi e'lon! 📣", message: notifMessage, link: notifLink, is_read: false
          }));
          await supabase.from('notifications').insert(notifications);
        }
        setSuccessMessage("Banner joylandi va barchaga bildirishnoma yuborildi!");
      }

      closeAndResetModal();
      queryClient.invalidateQueries({ queryKey: ['adminBanners'] });
      setSuccessModal(true);
      
    } catch (error: any) { alert("XATOLIK:\n" + error.message); } 
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;
    try {
      await supabase.from('carousel_banners').delete().eq('id', id);
      queryClient.invalidateQueries({ queryKey: ['adminBanners'] });
    } catch (error) { console.error(error); }
  };

  return (
    <AdminLayout title="Karusel Bannerlari">
      <div className="flex justify-end items-center mb-6">
        <button onClick={() => { closeAndResetModal(); setIsModalOpen(true); }} className="flex items-center gap-1.5 text-sm font-bold bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-5 py-3 rounded-full shadow-md active:scale-95 transition-all">
          <PlusCircle size={18}/> Yangi qo'shish
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse h-32 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))]"></div>
      ) : banners && banners.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {banners.map((banner: any) => (
            <div key={banner.id} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[20px] overflow-hidden shadow-sm relative group flex flex-col">
              
              <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                {/* 🌟 TAHRIRLASH TUGMASI QO'SHILDI */}
                <button onClick={(e) => { e.stopPropagation(); handleEdit(banner); }} className="bg-blue-500 text-white p-2.5 rounded-full shadow-lg hover:scale-110 active:scale-90 transition-transform cursor-pointer">
                  <Edit3 size={16} />
                </button>
                <button onClick={() => handleDelete(banner.id, banner.image_url)} className="bg-red-500 text-white p-2.5 rounded-full shadow-lg hover:scale-110 active:scale-90 transition-transform cursor-pointer">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1.5 rounded-xl uppercase tracking-wider border border-white/10">{banner.type}</div>
              
              <div className="w-full aspect-[21/9] bg-[hsl(var(--secondary))] overflow-hidden relative">
                <img src={banner.image_url} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 flex-1 flex flex-col bg-[hsl(var(--card))]">
                <h3 className="font-bold text-[15px] text-[hsl(var(--foreground))] leading-tight line-clamp-2">{banner.title}</h3>
                <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mt-1 truncate">ID/Link: {banner.reference_id}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-[hsl(var(--card))] rounded-[24px] border border-dashed border-[hsl(var(--border))]">
          <p className="font-bold text-[hsl(var(--muted-foreground))]">Hozircha bannerlar yo'q. Birinchi bannerni qo'shing!</p>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[99999] flex flex-col bg-[hsl(var(--background))] animate-in slide-in-from-bottom-full duration-300">
          
          <div className="flex-none h-[72px] bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] px-4 flex items-center justify-between shadow-sm z-10">
            <button type="button" onClick={closeAndResetModal} className="p-2 -ml-2 rounded-full hover:bg-[hsl(var(--secondary))] transition-colors text-[hsl(var(--foreground))]">
              <ArrowLeft size={24} />
            </button>
            <h2 className="font-display font-bold text-[18px] tracking-wide text-[hsl(var(--foreground))]">
              {isEditMode ? 'Bannerni Tahrirlash' : 'Yangi Banner'}
            </h2>
            <div className="w-10"></div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 pb-[120px]">
            <div className="max-w-xl mx-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button type="button" onClick={() => {setType('discount'); setReferenceId(''); setTitle(''); setImagePreview(null);}} className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all shadow-sm ${type === 'discount' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))/10] text-[hsl(var(--primary))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))/50]'}`}><Tags size={24} /><span className="text-[11px] font-bold uppercase tracking-wider">Chegirma</span></button>
                  <button type="button" onClick={() => {setType('merchant'); setReferenceId(''); setTitle(''); setImagePreview(null);}} className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all shadow-sm ${type === 'merchant' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))/10] text-[hsl(var(--primary))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))/50]'}`}><Store size={24} /><span className="text-[11px] font-bold uppercase tracking-wider">Do'kon</span></button>
                  <button type="button" onClick={() => {setType('category'); setReferenceId(''); setTitle(''); setImagePreview(null);}} className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all shadow-sm ${type === 'category' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))/10] text-[hsl(var(--primary))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))/50]'}`}><LayoutGrid size={24} /><span className="text-[11px] font-bold uppercase tracking-wider">Bo'lim</span></button>
                  <button type="button" onClick={() => {setType('external'); setReferenceId(''); setTitle(''); setImagePreview(null);}} className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all shadow-sm ${type === 'external' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))/10] text-[hsl(var(--primary))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))/50]'}`}><Globe size={24} /><span className="text-[11px] font-bold uppercase tracking-wider">Link</span></button>
                </div>

                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-5 rounded-[24px] space-y-5 shadow-sm">
                  
                  {type === 'discount' && (
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-1 mb-1.5 block">Chegirmani tanlang</label>
                      <select required value={referenceId} onChange={(e) => handleDiscountSelect(e.target.value)} className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-4 px-4 rounded-2xl text-[14px] font-semibold outline-none focus:border-[hsl(var(--primary))] transition-colors">
                        <option value="">Tanlang...</option>
                        {discounts?.map((d: any) => <option key={d.id} value={d.id}>{d.merchant?.name} - {d.product_name}</option>)}
                      </select>
                    </div>
                  )}

                  {type === 'merchant' && (
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-1 mb-1.5 block">Do'konni tanlang</label>
                      <select required value={referenceId} onChange={(e) => setReferenceId(e.target.value)} className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-4 px-4 rounded-2xl text-[14px] font-semibold outline-none focus:border-[hsl(var(--primary))] transition-colors">
                        <option value="">Tanlang...</option>
                        {merchants?.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </div>
                  )}

                  {type === 'category' && (
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-1 mb-1.5 block">Ichki bo'limni tanlang</label>
                      <select required value={referenceId} onChange={(e) => setReferenceId(e.target.value)} className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-4 px-4 rounded-2xl text-[14px] font-semibold outline-none focus:border-[hsl(var(--primary))] transition-colors">
                        <option value="">Tanlang...</option>
                        {internalLinks.map((link) => <option key={link.path} value={link.path}>{link.label}</option>)}
                      </select>
                    </div>
                  )}

                  {type === 'external' && (
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-1 mb-1.5 block">Link (URL) kiriting</label>
                      <input type="url" required value={referenceId} onChange={(e) => setReferenceId(e.target.value)} placeholder="https://..." className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-4 px-4 rounded-2xl text-[14px] font-semibold outline-none focus:border-[hsl(var(--primary))] transition-colors" />
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-1 mb-1.5 block">Banner matni (Tasnif)</label>
                    <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ekranda chiqib turadigan qisqacha matn" className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-4 px-4 rounded-2xl text-[14px] font-semibold outline-none focus:border-[hsl(var(--primary))] transition-colors" />
                  </div>

                  <div className="flex flex-col mb-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-1 mb-1.5 block">
                      Rasm (Karusel uchun 21:9 razmer) {type === 'discount' && "(Ixtiyoriy)"}
                    </label>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    <div onClick={() => fileInputRef.current?.click()} className={`w-full aspect-[21/9] rounded-[24px] bg-[hsl(var(--background))] overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-colors shadow-sm border-2 ${!imagePreview ? 'border-dashed border-[hsl(var(--border))] hover:border-[hsl(var(--primary))/50]' : 'border-[hsl(var(--border))]'}`}>
                      {imagePreview ? ( <img src={imagePreview} className="w-full h-full object-cover" /> ) : (
                        <> <Camera size={36} className="text-[hsl(var(--muted-foreground))]/50 mb-3" /> <span className="text-[12px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider text-center">Rasm yuklash</span> </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={closeAndResetModal} className="flex-1 py-4.5 bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] font-bold text-[16px] rounded-2xl active:scale-95 transition-all cursor-pointer border border-[hsl(var(--border))]">Bekor qilish</button>
                  <button type="submit" disabled={isSubmitting || (type !== 'discount' && !imagePreview)} className="flex-[1.5] py-4.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold text-[16px] rounded-2xl shadow-float active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer">
                    {isSubmitting ? <Loader2 className="animate-spin" size={22}/> : (isEditMode ? "O'zgarishlarni saqlash" : "Saqlash va E'lon qilish")}
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
            <Cropper image={selectedImage} crop={crop} zoom={zoom} aspect={21/9} showGrid={false} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)} />
          </div>
          <div className="p-6 pb-12 bg-black flex flex-col gap-6 items-center">
            <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="w-full max-w-xs accent-[hsl(var(--primary))]" />
            <div className="flex w-full max-w-xs gap-4">
              <button onClick={() => setSelectedImage(null)} className="flex-1 py-3.5 font-bold rounded-2xl text-white bg-white/20 hover:bg-white/30 transition-colors">Bekor qilish</button>
              <button onClick={handleCropSave} className="flex-1 py-3.5 font-bold rounded-2xl bg-[hsl(var(--primary))] text-white shadow-md active:scale-95 transition-transform">Qirqish</button>
            </div>
          </div>
        </div>
      )}

      {successModal && (
        <div className="fixed inset-0 z-[9999999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[32px] p-6 md:p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-green-500/20 shadow-inner">
              <CheckCircle2 size={40} strokeWidth={2.5} />
            </div>
            <h3 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] mb-2">Muvaffaqiyatli!</h3>
            <p className="text-[14px] font-medium text-[hsl(var(--muted-foreground))] mb-8 leading-relaxed">
              {successMessage}
            </p>
            <button onClick={() => setSuccessModal(false)} className="w-full py-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold text-[16px] rounded-[20px] shadow-float active:scale-95 transition-all">
              Yopish
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}