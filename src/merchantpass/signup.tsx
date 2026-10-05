import { useState, useRef, useEffect } from 'react';
import { Store, ArrowRight, ArrowLeft, CheckCircle2, LockKeyhole, UserRound, Loader2, Briefcase, MapPin, Clock, Camera, Eye, EyeOff, Navigation, GraduationCap, Circle } from 'lucide-react';
import { Link } from 'wouter';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/i18n';
import Cropper from 'react-easy-crop';
import { sendTelegramMessage } from '@/lib/telegram'; // 🌟 TELEGRAM KUTUBXONASI QO'SHILDI

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

export default function MerchantSignup() {
  const { t, lang, setLang } = useLanguage();

  const CATEGORIES = [
    { id: 'education', dbName: "O'quv markazi", transKey: 'category_learning', icon: '📚' },
    { id: 'food', dbName: 'Kafe / Restoran', transKey: 'category_cafes', icon: '🍔' },
    { id: 'clothing', dbName: 'Kiyim-kechak', transKey: 'category_shops', icon: '👕' },
    { id: 'services', dbName: 'Xizmat ko‘rsatish', transKey: 'category_services', icon: '✂️' },
    { id: 'tech', dbName: 'Texnika do‘koni', transKey: 'category_it', icon: '💻' },
    { id: 'other', dbName: 'Boshqa', transKey: 'category_other', icon: '🏪' },
  ];

  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem('merchantSignupStep');
    return saved ? parseInt(saved) : 1;
  });

  useEffect(() => {
    localStorage.setItem('merchantSignupStep', step.toString());
  }, [step]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && step < 6) setStep(6);
    });
  }, []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const [formData, setFormData] = useState({
    category: '', name: '', location: '', openTime: '09:00', closeTime: '22:00', username: '', password: '', confirmPassword: '', lat: '', lon: ''
  });

  const strength = getPasswordStrength(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    if (e.target.name === 'name') setNameAvailable(null);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setSelectedImage(reader.result as string));
      reader.readAsDataURL(file);
      event.target.value = ''; 
    }
  };

  const handleCropSave = async () => {
    if (!selectedImage || !croppedAreaPixels) return;
    try {
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
        croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height,
        0, 0, targetWidth, targetHeight
      );

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => { if (b) resolve(b); else reject(new Error('Canvas is empty')); }, 'image/jpeg', 0.6);
      });

      const file = new File([blob], 'merchant_logo.jpg', { type: 'image/jpeg' });
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(blob));

    } catch (error) {
      setError("Xatolik yuz berdi.");
    }
  };

  const handleMapPick = () => {
    if (!navigator.geolocation) { setError("GPS xatoligi."); return; }
    setIsLocating(true); setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=uz`);
          const data = await response.json();
          
          setFormData(prev => ({ 
            ...prev, 
            location: data?.display_name || `${latitude}, ${longitude}`,
            lat: latitude.toString(),
            lon: longitude.toString()
          }));
        } catch (err) { setError("Xatolik yuz berdi."); } 
        finally { setIsLocating(false); }
      },
      (err) => { setError("Joylashuv aniqlanmadi."); setIsLocating(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const checkNameAvailability = async () => {
    const cleanName = formData.name.trim().replace(/\s+/g, ' ');
    if (cleanName.length < 3) { setError("Kamida 3 ta harf"); return; }
    setFormData(prev => ({ ...prev, name: cleanName }));
    setLoading(true);

    try {
      const { data, error: fetchError } = await supabase.from('merchants').select('name').ilike('name', cleanName); 
      if (fetchError) throw fetchError;

      if (data && data.length > 0) {
        setNameAvailable(false); setError("Bu nom band.");
      } else {
        setNameAvailable(true); setError(''); setTimeout(() => setStep(4), 500); 
      }
    } catch (err) { setError("Server xatoligi."); } 
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (strength.score < 5) { setError("Parol kuchsiz!"); return; }
    if (formData.password !== formData.confirmPassword) { setError("Parollar mos emas."); return; }
    setLoading(true); setError('');
    
    try {
      const fakeEmail = `${formData.username.toLowerCase()}@merchant.talabapass.uz`;
      const { data: authData, error: authError } = await supabase.auth.signUp({ email: fakeEmail, password: formData.password });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error("Xatolik");

      let mergedDescription = `📍 Manzil: ${formData.location}\n⏰ Ish vaqti: ${formData.openTime} - ${formData.closeTime}`;
      if (formData.lat && formData.lon) {
        mergedDescription += `\nKordinata: ${formData.lat}, ${formData.lon}`;
      }

      const { error: dbError } = await supabase.from('merchants').insert([{
          id: authData.user.id, category: formData.category, name: formData.name, description: mergedDescription, logo_url: null, discount_percent: 0, is_active: false
      }]);

      if (dbError) throw dbError;

      // 🌟 YECHIM 1: YANGA DO'KON RO'YXATDAN O'TGANIDA TELEGRAMGA XABAR YUBORISH
      try {
        const msg = `🏪 <b>YANGI DO'KON RO'YXATDAN O'TDI!</b>\n\n<b>Do'kon nomi:</b> ${formData.name}\n<b>Kategoriya:</b> ${formData.category}\n<b>Username:</b> ${formData.username}\n\n<i>Iltimos, tezroq Admin paneldan tasdiqlang!</i>`;
        await sendTelegramMessage(msg);
      } catch (telegramErr) {
        console.error("Telegram xabari yuborilmadi", telegramErr);
      }

      setStep(6); 
    } catch (err: any) { setError(err.message); } 
    finally { setLoading(false); }
  };

  const handleFinish = async () => {
    setLoading(true); setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessiya yo'q.");

      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop() || 'jpg';
        const fileName = `merchant-${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, logoFile, { upsert: true });
        if (uploadError) throw new Error("Yuklashda xato.");

        const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
        const { error: updateError } = await supabase.from('merchants').update({ logo_url: publicUrlData.publicUrl }).eq('id', user.id);
        if (updateError) throw updateError;
      }
      setStep(7); 
    } catch (err: any) { setError(err.message); } 
    finally { setLoading(false); }
  };

  useEffect(() => {
    let interval: any;
    if (step === 7) {
      const checkApprovalStatus = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase.from('merchants').select('is_active').eq('id', user.id).single();
          if (data && data.is_active === true) {
            setIsApproved(true);
            clearInterval(interval);
            localStorage.removeItem('merchantSignupStep');
            setTimeout(() => { window.location.href = '/merchant'; }, 2000);
          }
        }
      };
      interval = setInterval(checkApprovalStatus, 5000);
    }
    return () => clearInterval(interval);
  }, [step]);

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[hsl(var(--background))] relative overflow-hidden">
      {step > 1 && step < 7 && (
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[hsl(var(--secondary))] z-50">
          <div className="h-full bg-[hsl(var(--accent))] transition-all duration-500 ease-out rounded-r-full" style={{ width: `${((step - 1) / 5) * 100}%` }} />
        </div>
      )}

      {step < 7 && (
        <div className="flex items-center justify-between px-6 pt-8 pb-4 shrink-0 relative z-10 max-w-md mx-auto w-full">
          {step === 1 ? (
            <Link href="/signup">
              <button className="p-2 -ml-2 rounded-full hover:bg-[hsl(var(--secondary))] transition-colors text-[hsl(var(--muted-foreground))]">
                <ArrowLeft size={22} />
              </button>
            </Link>
          ) : (
            <button onClick={prevStep} className="p-2 -ml-2 rounded-full hover:bg-[hsl(var(--secondary))] transition-colors text-[hsl(var(--muted-foreground))]">
              <ArrowLeft size={22} />
            </button>
          )}
          {step > 1 && <div className="text-xs font-bold text-[hsl(var(--muted-foreground))] tracking-widest uppercase">{t('step')} {step - 1} / 5</div>}
        </div>
      )}

      <div className="flex-1 flex flex-col px-6 max-w-md w-full mx-auto pb-10 relative z-10">
        
        {step === 1 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-300 flex-1 flex flex-col pt-4">
            <div className="w-16 h-16 bg-[hsl(var(--accent)/.15)] border-2 border-[hsl(var(--accent)/.3)] rounded-2xl flex items-center justify-center text-[hsl(var(--accent))] mb-8 shadow-sm">
              <Briefcase size={32} />
            </div>
            
            <div className="mb-6">
              <h1 className="font-display text-4xl font-bold leading-[1.1] text-[hsl(var(--foreground))]">
                {t('merchant_signup_1')} <br/><span className="text-[hsl(var(--accent))]">{t('merchant_signup_2')}</span>
              </h1>
              <p className="mt-4 text-[15px] leading-relaxed text-[hsl(var(--muted-foreground))]">
                {t('merchant_signup_desc')}
              </p>
            </div>

            <div className="space-y-3 mt-2 mb-8">
               {['uz', 'ru', 'en'].map((l) => (
                 <div key={l} onClick={() => setLang(l as 'uz'|'ru'|'en')} className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer border-2 transition-colors ${lang === l ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/.08)]' : 'border-transparent bg-[hsl(var(--card))] shadow-sm'}`}>
                   <div className="flex items-center gap-3">
                     <span className="text-3xl">{l === 'uz' ? '🇺🇿' : l === 'ru' ? '🇷🇺' : '🇬🇧'}</span>
                     <span className="text-base font-bold text-[hsl(var(--foreground))]">{l === 'uz' ? "O'zbek" : l === 'ru' ? "Русский" : "English"}</span>
                   </div>
                   {lang === l ? <CheckCircle2 size={24} className="text-[hsl(var(--accent))]" /> : <Circle size={24} className="text-[hsl(var(--muted-foreground))]" />}
                 </div>
               ))}
             </div>
            
            <div className="mt-auto flex flex-col gap-3">
              <div className="text-center mb-2">
                <span className="text-[13px] font-medium text-[hsl(var(--muted-foreground))]">{t('already_have_account')} </span>
                <Link href="/merchant/login" className="text-[13px] font-bold text-[hsl(var(--foreground))] hover:text-[hsl(var(--accent))] underline underline-offset-2">{t('login_btn')}</Link>
              </div>
              
              <Link href="/signup">
                <div className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[hsl(var(--secondary))] py-4 text-base font-bold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent)/.1)] hover:text-[hsl(var(--accent))] transition-all shadow-sm">
                  <GraduationCap size={18} /> {t('reg_student')}
                </div>
              </Link>

              <button onClick={nextStep} className="flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] py-4 text-base font-bold text-[hsl(var(--primary-foreground))] shadow-float active:scale-95 transition-all">
                {t('continue_btn')} <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-300 flex-1 flex flex-col">
            <div className="mt-4 mb-8">
              <h2 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">{t('business_type_title')}</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">{t('business_type_desc')}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setFormData({ ...formData, category: cat.dbName }); nextStep(); }}
                  className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all ${
                    formData.category === cat.dbName 
                      ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/.1)] text-[hsl(var(--foreground))]' 
                      : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--accent)/.5)]'
                  }`}
                >
                  <span className="text-4xl mb-3">{cat.icon}</span>
                  <span className="text-[13px] font-bold text-center text-[hsl(var(--foreground))]">{(t as any)(cat.transKey)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-300 flex-1 flex flex-col">
            <div className="mt-4 mb-8">
              <h2 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">{t('store_name_title')}</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">{t('store_name_desc')}</p>
            </div>
            
            <div className="relative mb-2">
              <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={20} />
              <input
                type="text" name="name" value={formData.name} onChange={handleChange} placeholder=""
                className={`w-full bg-[hsl(var(--card))] border-2 rounded-2xl py-4 pl-12 pr-12 text-sm font-semibold outline-none transition-all text-[hsl(var(--foreground))] ${
                  nameAvailable === true ? 'border-green-500 focus:border-green-500' : 
                  nameAvailable === false ? 'border-red-500 focus:border-red-500' : 
                  'border-[hsl(var(--border))] focus:border-[hsl(var(--accent))]'
                }`}
              />
              {nameAvailable === true && <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" size={20} />}
            </div>
            {error && <p className="text-red-500 text-[13px] font-semibold ml-2">{error}</p>}

            <button onClick={checkNameAvailability} disabled={loading || !formData.name} className="mt-auto flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] py-4 text-base font-bold text-[hsl(var(--primary-foreground))] shadow-float active:scale-95 transition-all disabled:opacity-70">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>{t('continue_btn')} <ArrowRight size={18} /></>}
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-300 flex-1 flex flex-col">
            <div className="mt-4 mb-8">
              <h2 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">{t('address_time_title')}</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">{t('address_time_desc')}</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-2 mb-1.5 block">{t('address_label')}</label>
                <button onClick={handleMapPick} disabled={isLocating} className="mb-3 w-full flex items-center justify-center gap-2 bg-[hsl(var(--accent)/.15)] text-[hsl(var(--accent))] font-bold py-3 rounded-2xl border border-[hsl(var(--accent)/.3)] active:scale-95 transition-all">
                  {isLocating ? <Loader2 className="animate-spin" size={18}/> : <Navigation size={18}/>}
                  {isLocating ? t('locating') : t('locate_gps')}
                </button>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={20} />
                  <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="" className="w-full bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--accent))] transition-all" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-2 mb-1.5 block">{t('work_time_label')}</label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={18} />
                    <input type="time" name="openTime" value={formData.openTime} onClick={(e) => (e.target as any).showPicker && (e.target as any).showPicker()} onChange={handleChange} className="w-full bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] rounded-2xl py-3.5 pl-11 pr-2 text-sm font-bold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--accent))] transition-all cursor-pointer" />
                  </div>
                  <span className="text-[hsl(var(--muted-foreground))] font-bold">-</span>
                  <div className="relative flex-1">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={18} />
                    <input type="time" name="closeTime" value={formData.closeTime} onClick={(e) => (e.target as any).showPicker && (e.target as any).showPicker()} onChange={handleChange} className="w-full bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] rounded-2xl py-3.5 pl-11 pr-2 text-sm font-bold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--accent))] transition-all cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 text-[13px] font-bold mt-2">{error}</p>}

            <button onClick={nextStep} disabled={!formData.location} className="mt-auto flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] py-4 text-base font-bold text-[hsl(var(--primary-foreground))] shadow-float active:scale-95 transition-all disabled:opacity-70">
              {t('next_btn')} <ArrowRight size={18} />
            </button>
          </div>
        )}

        {step === 5 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-300 flex-1 flex flex-col">
            <div className="mt-4 mb-8">
              <h2 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">{t('security_title')}</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">{t('security_desc')}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-2 mb-1.5 block">{t('username_label')}</label>
                <div className="relative">
                  <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={20} />
                  <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder={t('username_placeholder')} className="w-full bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:border-[hsl(var(--accent))] text-[hsl(var(--foreground))] transition-all" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-2 mb-1.5 block">{t('password_label')}</label>
                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={20} />
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder={t('password_placeholder')} className="w-full bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] rounded-2xl py-4 pl-12 pr-12 text-sm font-bold outline-none focus:border-[hsl(var(--accent))] text-[hsl(var(--foreground))] transition-all" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                
                <div className="mt-2.5 px-2">
                  <div className="flex justify-between items-center mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                    <span>{t('pass_strength')}</span>
                    <span className={strength.text === 'Oson' ? 'text-red-500' : strength.text === "O'rtacha" ? 'text-yellow-500' : strength.text === 'Kuchli' ? 'text-green-500' : ''}>{strength.text}</span>
                  </div>
                  <div className="h-1.5 w-full bg-[hsl(var(--secondary))] rounded-full overflow-hidden flex">
                    <div className={`h-full transition-all duration-300 ease-out ${strength.color}`} style={{ width: strength.width }}></div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={20} />
                <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder={t('confirm_pass_placeholder')} className="w-full bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] rounded-2xl py-4 pl-12 pr-12 text-sm font-semibold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--accent))] transition-all" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            {error && <p className="text-red-500 text-[13px] font-semibold mt-3 ml-2">{error}</p>}

            <button onClick={handleSubmit} disabled={loading || !formData.username || !formData.password} className="mt-auto flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] py-4 text-base font-bold text-[hsl(var(--primary-foreground))] shadow-float active:scale-95 transition-all disabled:opacity-70">
              {loading ? <Loader2 className="animate-spin" size={20} /> : t('register_btn')}
            </button>
          </div>
        )}

        {step === 6 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-300 flex-1 flex flex-col items-center justify-center">
            <div className="text-center mb-10 mt-auto">
              <h2 className="font-display text-3xl font-bold text-[hsl(var(--foreground))] mb-2">{t('logo_title')}</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('logo_desc')}</p>
            </div>
            
            <div className="relative group mb-auto">
              <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
              <div onClick={() => fileInputRef.current?.click()} className="grid h-40 w-40 cursor-pointer place-items-center overflow-hidden rounded-full bg-[hsl(var(--secondary))] border-4 border-dashed border-[hsl(var(--border))] hover:border-[hsl(var(--accent))] transition-all">
                {logoPreview ? <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" /> : <Camera size={44} className="opacity-50 text-[hsl(var(--muted-foreground))]" />}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
            
            <div className="w-full flex flex-col gap-3 mt-auto">
              {logoPreview ? (
                <button disabled={loading} onClick={handleFinish} className="flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] py-4 text-base font-bold text-[hsl(var(--primary-foreground))] shadow-float active:scale-95 transition-all disabled:opacity-70">
                  {loading ? <Loader2 className="animate-spin" /> : t('save_and_finish')}
                </button>
              ) : (
                <>
                  <button onClick={() => fileInputRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] py-4 text-base font-bold text-[hsl(var(--primary-foreground))] shadow-float active:scale-95 transition-all">
                    <Camera size={20} /> {t('upload_image')}
                  </button>
                  <button disabled={loading} onClick={() => setStep(7)} className="py-3 text-sm font-bold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors disabled:opacity-50">
                    {loading ? '...' : t('skip_for_now')}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="animate-in zoom-in-95 duration-500 flex-1 flex flex-col items-center justify-center text-center">
            {isApproved ? (
              <div className="animate-in fade-in zoom-in duration-300">
                <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-500/20 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                  <CheckCircle2 size={48} strokeWidth={2.5} />
                </div>
                <h2 className="font-display text-3xl font-bold text-[hsl(var(--foreground))] mb-3">{t('approved_title')}</h2>
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{t('approved_desc_merchant')}</p>
              </div>
            ) : (
              <>
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full w-24 h-24 mx-auto animate-pulse"></div>
                  <div className="relative w-24 h-24 bg-[hsl(var(--card))] text-blue-500 rounded-full flex items-center justify-center mx-auto border-[3px] border-blue-500/30 shadow-lg">
                    <Clock size={40} className="animate-pulse" />
                    <div className="absolute top-0 left-0 w-full h-full rounded-full border-t-2 border-blue-500 animate-spin"></div>
                  </div>
                </div>
                <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] mb-3">{t('checking_title')}</h2>
                <p className="text-[13px] text-[hsl(var(--muted-foreground))] leading-relaxed max-w-[280px] mx-auto px-2">
                  {t('checking_desc_merchant')}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {selectedImage && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-black/95 backdrop-blur-md">
          <div className="relative flex-1 w-full mt-10">
            <Cropper image={selectedImage} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)} />
          </div>
          <div className="p-6 pb-12 bg-black flex flex-col gap-6 items-center">
            <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="w-full max-w-xs accent-[hsl(var(--primary))]" />
            <div className="flex w-full max-w-xs gap-4">
              <button onClick={() => setSelectedImage(null)} className="flex-1 py-3.5 font-bold rounded-2xl text-white bg-white/20 hover:bg-white/30 transition-colors">Bekor qilish</button>
              <button onClick={handleCropSave} className="flex-1 py-3.5 font-bold rounded-2xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md active:scale-95 transition-transform">Saqlash</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}