import { useState, useEffect, useRef } from 'react';
import { LogOut, Globe, Moon, CircleHelp, ChevronRight, Store, ShieldCheck, Clock, Camera, Loader2, CheckCircle2, Circle, Edit3, X, MapPin, Eye, EyeOff, Navigation } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/i18n';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import Cropper from 'react-easy-crop';

const getPasswordStrength = (pass: string) => {
  if (!pass) return { score: 0, text: '', color: 'bg-transparent', width: '0%' };
  let score = 0;
  if (pass.length >= 8) score += 1;
  if (/[A-Z]/.test(pass)) score += 1;
  if (/[a-z]/.test(pass)) score += 1;
  if (/\d/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;

  if (score <= 2) return { score, text: 'Oson', color: 'bg-red-500', width: '33.3%' };
  if (score === 3 || score === 4) return { score, text: "O'rtacha", color: 'bg-yellow-500', width: '66.6%' };
  if (score === 5) return { score, text: 'Kuchli', color: 'bg-green-500', width: '100%' };
  return { score: 0, text: '', color: 'bg-transparent', width: '0%' };
};

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

export default function MerchantProfile() {
  const { t, lang, setLang } = useLanguage();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [isDarkTheme, setIsDarkTheme] = useState(() => localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark'));
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const [editForm, setEditForm] = useState({
    name: '', location: '', openTime: '', closeTime: '', lat: '', lon: '', oldPassword: '', newPassword: '', confirmPassword: ''
  });
  
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const { data: merchant, isLoading: loading } = useQuery({
    queryKey: ['merchantProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");
      const { data } = await supabase.from('merchants').select('*').eq('id', user.id).single();
      return data;
    },
    staleTime: 1000 * 60 * 5, 
  });

  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkTheme]);

  useEffect(() => {
    if (merchant && isEditModalOpen) {
      const desc = merchant.description || "";
      const addressMatch = desc.match(/📍 Manzil: (.*?)(?:\n|$)/);
      const timeMatch = desc.match(/⏰ Ish vaqti: (.*?)(?:\n|$)/);
      const cordMatch = desc.match(/Kordinata: ([\d.-]+), ([\d.-]+)/);
      
      let oTime = '09:00';
      let cTime = '22:00';
      if (timeMatch) {
        const times = timeMatch[1].split(' - ');
        if (times.length === 2) { oTime = times[0]; cTime = times[1]; }
      }

      setEditForm({
        name: merchant.name || '',
        location: addressMatch ? addressMatch[1] : '',
        openTime: oTime,
        closeTime: cTime,
        lat: cordMatch ? cordMatch[1] : '',
        lon: cordMatch ? cordMatch[2] : '',
        oldPassword: '', newPassword: '', confirmPassword: ''
      });
      setEditError('');
    }
  }, [merchant, isEditModalOpen]);

  const strength = getPasswordStrength(editForm.newPassword);

  const handleLangSelect = (selectedLang: 'uz' | 'en' | 'ru') => {
    setLang(selectedLang);
    setIsLangModalOpen(false);
  };

  const handleLogoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setSelectedImage(reader.result as string));
      reader.readAsDataURL(file);
      event.target.value = ''; 
    }
  };

  const handleCropSave = async () => {
    if (!selectedImage || !croppedAreaPixels || !merchant) return;
    
    try {
      setIsUploading(true);
      const currentSelectedImage = selectedImage; 
      setSelectedImage(null); 
      
      const image = await createImage(currentSelectedImage);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No 2d context');

      let targetWidth = croppedAreaPixels.width;
      let targetHeight = croppedAreaPixels.height;

      if (targetWidth > 500) {
        targetHeight = Math.round((targetHeight * 500) / targetWidth);
        targetWidth = 500;
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0, 0, targetWidth, targetHeight
      );

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => { if (b) resolve(b); else reject(new Error('Canvas is empty')); }, 'image/jpeg', 0.6); 
      });

      const fileExt = 'jpg';
      const fileName = `merchant-${merchant.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, blob, { upsert: true });
      if (uploadError) throw new Error("Yuklashda xatolik");

      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const avatarUrl = publicUrlData.publicUrl;

      const { error: updateError } = await supabase.from('merchants').update({ logo_url: avatarUrl }).eq('id', merchant.id);
      if (updateError) throw updateError;

      queryClient.setQueryData(['merchantProfile'], { ...merchant, logo_url: avatarUrl });
    } catch (error: any) {
      alert("Xatolik yuz berdi");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    queryClient.clear(); 
    setLocation('/merchant/login');
  };

  const handleMapPick = () => {
    if (!navigator.geolocation) { setEditError("GPS ishlamadi."); return; }
    setIsLocating(true); setEditError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=uz`);
          const data = await response.json();
          
          setEditForm(prev => ({ 
            ...prev, 
            location: data?.display_name || `${latitude}, ${longitude}`,
            lat: latitude.toString(),
            lon: longitude.toString()
          }));
        } catch (err) { setEditError("Xato"); } 
        finally { setIsLocating(false); }
      },
      (err) => { setEditError("Joylashuv aniqlanmadi."); setIsLocating(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSaveProfile = async () => {
    if (!merchant) return;
    setIsSaving(true); setEditError('');

    try {
      const cleanName = editForm.name.trim().replace(/\s+/g, ' ');
      if (cleanName.length < 3) throw new Error("Do'kon nomi kamida 3 ta harfdan iborat bo'lishi kerak.");

      if (cleanName.toLowerCase() !== merchant.name.toLowerCase()) {
        const { data: nameCheckData, error: nameCheckError } = await supabase
          .from('merchants')
          .select('id')
          .ilike('name', cleanName)
          .neq('id', merchant.id); 

        if (nameCheckError) throw new Error("Server xatosi.");
        if (nameCheckData && nameCheckData.length > 0) {
          throw new Error("Bu nom band.");
        }
      }

      let mergedDescription = `📍 Manzil: ${editForm.location}\n⏰ Ish vaqti: ${editForm.openTime} - ${editForm.closeTime}`;
      if (editForm.lat && editForm.lon) {
        mergedDescription += `\nKordinata: ${editForm.lat}, ${editForm.lon}`;
      }

      const { error: dbError } = await supabase.from('merchants').update({ 
        name: cleanName,
        description: mergedDescription 
      }).eq('id', merchant.id);

      if (dbError) throw dbError;

      if (editForm.oldPassword || editForm.newPassword || editForm.confirmPassword) {
        if (!editForm.oldPassword) throw new Error("Eski parolni kiriting");
        if (!editForm.newPassword) throw new Error("Yangi parolni kiriting");
        if (editForm.newPassword !== editForm.confirmPassword) throw new Error("Parollar mos emas");
        if (strength.score < 5) throw new Error("Parol kuchsiz!");

        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !user.email) throw new Error("Sessiya xatosi");

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: editForm.oldPassword
        });

        if (signInError) throw new Error("Eski parol xato!");

        const { error: passwordError } = await supabase.auth.updateUser({ password: editForm.newPassword });
        if (passwordError) throw passwordError;
      }

      queryClient.invalidateQueries({ queryKey: ['merchantProfile'] });
      setIsEditModalOpen(false);
      alert("Saqlandi!");

    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && !merchant) {
    return (
      <div className="page-enter pb-10">
        <div className="flex flex-col items-center mt-2 mb-8 animate-pulse">
          <div className="h-32 w-32 rounded-full bg-[hsl(var(--muted))] shadow-xl mb-4 border-4 border-[hsl(var(--card))]"></div>
          <div className="h-8 w-48 bg-[hsl(var(--muted))] rounded-md mt-2 mb-2"></div>
        </div>
        <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] mb-4">{t('settings')}</h2>
        <div className="bg-[hsl(var(--card))] rounded-[24px] border border-[hsl(var(--border))] overflow-hidden flex flex-col shadow-soft animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-[hsl(var(--muted))]"></div>
                <div className="h-4 w-32 bg-[hsl(var(--muted))] rounded-md"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-enter animate-in fade-in duration-500 pb-10">
        
        <div className="flex flex-col items-center mt-2 mb-8">
          <div className="relative mb-4 group">
            <input type="file" ref={fileInputRef} onChange={handleLogoSelect} accept="image/*" className="hidden" />
            <div onClick={() => !isUploading && fileInputRef.current?.click()} className="grid h-32 w-32 cursor-pointer place-items-center overflow-hidden rounded-full bg-[hsl(var(--secondary))] border-4 border-[hsl(var(--card))] shadow-xl transition-all hover:border-[hsl(var(--accent))]">
              {isUploading ? (
                <Loader2 className="animate-spin text-[hsl(var(--accent))]" size={32} />
              ) : merchant?.logo_url ? (
                <img src={merchant.logo_url} className="h-full w-full object-cover" alt="Merchant Logo" />
              ) : (
                <Store size={36} className="text-[hsl(var(--muted-foreground))]/50" />
              )}
            </div>
            <button onClick={() => !isUploading && fileInputRef.current?.click()} className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] flex items-center justify-center shadow-lg border-2 border-[hsl(var(--background))] hover:scale-105 active:scale-95 transition-all disabled:opacity-50" disabled={isUploading}>
              <Camera size={18} />
            </button>
          </div>
          
          <h2 className="text-2xl font-display font-bold text-[hsl(var(--foreground))] text-center px-4 line-clamp-2">
            {merchant?.name || "Do'kon nomi"}
          </h2>
          
          <div className="mt-2 flex items-center justify-center">
            {merchant?.is_active ? (
              <span className="flex items-center gap-1.5 rounded-full bg-green-500/15 px-3 py-1.5 text-[11px] font-bold text-green-500 uppercase tracking-wider border border-green-500/20">
                <ShieldCheck size={14} /> {t('verified')}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-yellow-500/15 px-3 py-1.5 text-[11px] font-bold text-yellow-500 uppercase tracking-wider border border-yellow-500/20">
                <Clock size={14} /> {t('pending')}
              </span>
            )}
          </div>
        </div>

        <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] mb-4">{t('settings')}</h2>
        
        <div className="bg-[hsl(var(--card))] rounded-[24px] border border-[hsl(var(--border))] overflow-hidden flex flex-col shadow-soft">
          
          <div onClick={() => setIsEditModalOpen(true)} className="flex items-center justify-between p-5 cursor-pointer hover:bg-[hsl(var(--secondary)/.5)] transition-colors border-b border-[hsl(var(--border))]">
            <div className="flex items-center gap-3">
              <Edit3 size={22} className="text-[hsl(var(--foreground))]" />
              <span className="text-[15px] font-semibold text-[hsl(var(--foreground))]">{t('edit_store_info')}</span>
            </div>
            <ChevronRight size={20} className="text-[hsl(var(--muted-foreground))]" />
          </div>

          <div onClick={() => setIsLangModalOpen(true)} className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))] cursor-pointer hover:bg-[hsl(var(--secondary)/.5)] transition-colors">
            <div className="flex items-center gap-3">
              <Globe size={22} className="text-[hsl(var(--foreground))]" />
              <span className="text-[15px] font-semibold text-[hsl(var(--foreground))]">{t('change_language')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">
                {lang === 'uz' ? "O'zbek" : lang === 'ru' ? "Русский" : "English"}
              </span>
              <ChevronRight size={20} className="text-[hsl(var(--muted-foreground))]" />
            </div>
          </div>

          <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
            <div className="flex items-center gap-3">
              <Moon size={22} className="text-[hsl(var(--foreground))]" />
              <span className="text-[15px] font-semibold text-[hsl(var(--foreground))]">{t('dark_mode')}</span>
            </div>
            <div onClick={() => setIsDarkTheme(!isDarkTheme)} className={`w-12 h-6.5 rounded-full p-1 cursor-pointer transition-colors ${isDarkTheme ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--muted))]'}`}>
              <div className={`w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform ${isDarkTheme ? 'translate-x-5.5' : 'translate-x-0'}`} />
            </div>
          </div>

          <a href="https://t.me/AIBOT_USERNAME_SHU_YERGA_YOZILADI" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-5 cursor-pointer hover:bg-[hsl(var(--secondary)/.5)] transition-colors border-b border-[hsl(var(--border))]">
            <div className="flex items-center gap-3">
              <CircleHelp size={22} className="text-[hsl(var(--foreground))]" />
              <span className="text-[15px] font-semibold text-[hsl(var(--foreground))]">{t('help_support')} (AI)</span>
            </div>
            <ChevronRight size={20} className="text-[hsl(var(--muted-foreground))]" />
          </a>

          <div onClick={handleLogout} className="flex items-center justify-between p-5 cursor-pointer hover:bg-red-500/10 transition-colors">
            <div className="flex items-center gap-3">
              <LogOut size={22} className="text-red-500" />
              <span className="text-[15px] font-semibold text-red-500">{t('logout')}</span>
            </div>
          </div>
        </div>
      </div>

      {isLangModalOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end" style={{ height: '100dvh' }}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsLangModalOpen(false)} />
          <div className="relative bg-[hsl(var(--card))] rounded-t-[32px] p-6 pb-[100px] animate-in slide-in-from-bottom-full duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] border-t border-[hsl(var(--border))]">
            <div className="w-10 h-1.5 bg-[hsl(var(--muted))] rounded-full mx-auto mb-6" />
            <h3 className="font-display text-xl font-bold mb-5 px-2 text-[hsl(var(--foreground))]">{t('select_language')}</h3>
            
            <div className="flex flex-col gap-3">
              <div onClick={() => handleLangSelect('uz')} className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer border transition-colors ${lang === 'uz' ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/.1)]' : 'border-transparent bg-[hsl(var(--secondary))]'}`}>
                <div className="flex items-center gap-3"><span className="text-2xl">🇺🇿</span><span className="text-base font-semibold text-[hsl(var(--foreground))]">O'zbek</span></div>
                {lang === 'uz' ? <CheckCircle2 size={24} className="text-[hsl(var(--accent))]" /> : <Circle size={24} className="text-[hsl(var(--muted-foreground))]" />}
              </div>
              <div onClick={() => handleLangSelect('ru')} className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer border transition-colors ${lang === 'ru' ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/.1)]' : 'border-transparent bg-[hsl(var(--secondary))]'}`}>
                <div className="flex items-center gap-3"><span className="text-2xl">🇷🇺</span><span className="text-base font-semibold text-[hsl(var(--foreground))]">Русский</span></div>
                {lang === 'ru' ? <CheckCircle2 size={24} className="text-[hsl(var(--accent))]" /> : <Circle size={24} className="text-[hsl(var(--muted-foreground))]" />}
              </div>
              <div onClick={() => handleLangSelect('en')} className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer border transition-colors ${lang === 'en' ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/.1)]' : 'border-transparent bg-[hsl(var(--secondary))]'}`}>
                <div className="flex items-center gap-3"><span className="text-2xl">🇬🇧</span><span className="text-base font-semibold text-[hsl(var(--foreground))]">English</span></div>
                {lang === 'en' ? <CheckCircle2 size={24} className="text-[hsl(var(--accent))]" /> : <Circle size={24} className="text-[hsl(var(--muted-foreground))]" />}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-black/95 backdrop-blur-md">
          <div className="relative flex-1 w-full mt-10">
            <Cropper image={selectedImage} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)} />
          </div>
          <div className="p-6 pb-12 bg-black flex flex-col gap-6 items-center">
            <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="w-full max-w-xs accent-[hsl(var(--primary))]" />
            <div className="flex w-full max-w-xs gap-4">
              <button onClick={() => setSelectedImage(null)} className="flex-1 py-3.5 font-bold rounded-2xl text-white bg-white/20 hover:bg-white/30 transition-colors">{t('cancel')}</button>
              <button onClick={handleCropSave} className="flex-1 py-3.5 font-bold rounded-2xl text-[hsl(var(--primary-foreground))] bg-[hsl(var(--primary))] hover:brightness-110 transition-all flex justify-center items-center gap-2">{t('save_btn')}</button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSaving && setIsEditModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-[hsl(var(--card))] rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95 duration-300 border border-[hsl(var(--border))] my-8 max-h-[90vh] overflow-y-auto">
            
            <button onClick={() => !isSaving && setIsEditModalOpen(false)} className="absolute top-4 right-4 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
              <X size={24} />
            </button>
            
            <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] mb-6">{t('store_info_title')}</h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-[hsl(var(--muted-foreground))] block mb-1">{t('store_name_title')}</label>
                <div className="relative">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={18} />
                  <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-3 pl-11 pr-4 rounded-xl font-semibold outline-none focus:border-[hsl(var(--primary))] text-[hsl(var(--foreground))]" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] block mb-1">{t('address_label')}</label>
                <button onClick={handleMapPick} disabled={isLocating} className="mb-2 w-full flex items-center justify-center gap-2 bg-[hsl(var(--accent)/.1)] text-[hsl(var(--accent))] text-sm font-bold py-2.5 rounded-xl border border-[hsl(var(--accent)/.3)] active:scale-95 transition-all">
                  {isLocating ? <Loader2 className="animate-spin" size={16}/> : <Navigation size={16}/>}
                  {isLocating ? t('locating') : t('locate_gps')}
                </button>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={18} />
                  <input type="text" value={editForm.location} onChange={(e) => setEditForm({...editForm, location: e.target.value})} className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-3 pl-11 pr-4 rounded-xl font-semibold outline-none focus:border-[hsl(var(--primary))] text-[hsl(var(--foreground))]" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] block mb-1">{t('work_time_label')}</label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={16} />
                    <input type="time" value={editForm.openTime} onChange={(e) => setEditForm({...editForm, openTime: e.target.value})} className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] rounded-xl py-3 pl-9 pr-2 text-sm font-bold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--accent))] transition-all" />
                  </div>
                  <span className="text-[hsl(var(--muted-foreground))] font-bold">-</span>
                  <div className="relative flex-1">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={16} />
                    <input type="time" value={editForm.closeTime} onChange={(e) => setEditForm({...editForm, closeTime: e.target.value})} className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] rounded-xl py-3 pl-9 pr-2 text-sm font-bold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--accent))] transition-all" />
                  </div>
                </div>
              </div>

              <hr className="border-t border-[hsl(var(--border))] my-4" />
              <p className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">{t('change_password_optional')}</p>

              <div>
                <label className="text-[11px] font-bold text-[hsl(var(--muted-foreground))] block mb-1">{t('old_password')}</label>
                <div className="relative">
                  <input type={showOldPass ? "text" : "password"} placeholder={t('current_pass_placeholder')} value={editForm.oldPassword} onChange={(e) => setEditForm({...editForm, oldPassword: e.target.value})} className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-3 pl-4 pr-12 rounded-xl font-semibold outline-none focus:border-[hsl(var(--primary))] text-[hsl(var(--foreground))]" />
                  <button type="button" onClick={() => setShowOldPass(!showOldPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"><Eye size={18} /></button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[hsl(var(--muted-foreground))] block mb-1">{t('new_password')}</label>
                <div className="relative">
                  <input type={showNewPass ? "text" : "password"} placeholder={t('new_pass_placeholder')} value={editForm.newPassword} onChange={(e) => setEditForm({...editForm, newPassword: e.target.value})} className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-3 pl-4 pr-12 rounded-xl font-semibold outline-none focus:border-[hsl(var(--primary))] text-[hsl(var(--foreground))]" />
                  <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"><Eye size={18} /></button>
                </div>
                {editForm.newPassword && (
                  <div className="mt-2 px-1">
                    <div className="flex justify-between items-center mb-1 text-[10px] font-bold uppercase text-[hsl(var(--muted-foreground))]">
                      <span>{t('security_title')}</span><span className={strength.text === 'Oson' ? 'text-red-500' : strength.text === "O'rtacha" ? 'text-yellow-500' : 'text-green-500'}>{strength.text}</span>
                    </div>
                    <div className="h-1.5 w-full bg-[hsl(var(--secondary))] rounded-full overflow-hidden flex"><div className={`h-full transition-all duration-300 ease-out ${strength.color}`} style={{ width: strength.width }}></div></div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-[hsl(var(--muted-foreground))] block mb-1">{t('confirm_pass_label')}</label>
                <div className="relative">
                  <input type={showConfirmPass ? "text" : "password"} placeholder={t('confirm_pass_placeholder')} value={editForm.confirmPassword} onChange={(e) => setEditForm({...editForm, confirmPassword: e.target.value})} className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-3 pl-4 pr-12 rounded-xl font-semibold outline-none focus:border-[hsl(var(--primary))] text-[hsl(var(--foreground))]" />
                  <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"><Eye size={18} /></button>
                </div>
              </div>
              
              {editError && <p className="text-red-500 text-xs font-semibold text-center pt-2">{editError}</p>}
            </div>

            <button disabled={isSaving} onClick={handleSaveProfile} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] py-4 text-base font-bold text-[hsl(var(--primary-foreground))] shadow-float active:scale-95 transition-all disabled:opacity-50">
              {isSaving ? <Loader2 className="animate-spin" /> : t('save_btn')}
            </button>
          </div>
        </div>
      )}

    </>
  );
}