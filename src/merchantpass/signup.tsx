import { useState, useRef } from 'react';
import { Store, ArrowRight, ArrowLeft, CheckCircle2, LockKeyhole, UserRound, Loader2, Briefcase, MapPin, Clock, Camera } from 'lucide-react';
import { Link } from 'wouter';
import { supabase } from '@/lib/supabase';

const CATEGORIES = [
  { id: 'education', name: "O'quv markazi", icon: '📚' },
  { id: 'food', name: 'Kafe / Restoran', icon: '🍔' },
  { id: 'clothing', name: 'Kiyim-kechak', icon: '👕' },
  { id: 'services', name: 'Xizmat ko‘rsatish', icon: '✂️' },
  { id: 'tech', name: 'Texnika do‘koni', icon: '💻' },
  { id: 'other', name: 'Boshqa', icon: '🏪' },
];

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

export default function MerchantSignup() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    category: '',
    name: '',
    location: '',
    openTime: '09:00',
    closeTime: '22:00',
    username: '',
    password: '',
    confirmPassword: '',
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
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleMapPick = () => {
    setLoading(true);
    setTimeout(() => {
      setFormData(prev => ({ ...prev, location: "Toshkent sh., Amir Temur ko'chasi 108-uy" }));
      setLoading(false);
    }, 800);
  };

  // 1-O'ZGARISH: Nomni tekshirish logikasi kuchaytirildi
  const checkNameAvailability = async () => {
    // Ortiqcha probellarni olib tashlaymiz: "  Do'kon    Nomi  " => "Do'kon Nomi"
    const cleanName = formData.name.trim().replace(/\s+/g, ' ');
    
    if (cleanName.length < 3) {
      setError("Do'kon nomi kamida 3 ta harfdan iborat bo'lishi kerak.");
      return;
    }
    
    // Tozalangan nomni Inputga qaytarib yozib qo'yamiz (chiroyli ko'rinishi uchun)
    setFormData(prev => ({ ...prev, name: cleanName }));
    setLoading(true);

    try {
      const { data, error: fetchError } = await supabase
        .from('merchants')
        .select('name')
        .ilike('name', cleanName); // Katta-kichik harfni farqlamaydi

      if (fetchError) throw fetchError;

      if (data && data.length > 0) {
        setNameAvailable(false);
        setError("Bu nom band. Boshqa nom tanlang.");
      } else {
        setNameAvailable(true);
        setError('');
        setTimeout(() => setStep(4), 500); 
      }
    } catch (err) {
      setError("Server bilan ulanishda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (strength.score < 5) {
      setError("Parol yetarlicha kuchli emas. Barcha talablarni bajaring!"); 
      return; 
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Parollar bir-biriga mos kelmadi.");
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      const fakeEmail = `${formData.username.toLowerCase()}@merchant.talabapass.uz`;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: fakeEmail,
        password: formData.password,
      });

      if (authError) throw new Error("Bunday login band bo'lishi mumkin yoki xatolik: " + authError.message);
      if (!authData.user) throw new Error("Foydalanuvchini yaratib bo'lmadi.");

      const mergedDescription = `📍 Manzil: ${formData.location}\n⏰ Ish vaqti: ${formData.openTime} - ${formData.closeTime}`;

      const { error: dbError } = await supabase
        .from('merchants')
        .insert([{
          id: authData.user.id,
          category: formData.category,
          name: formData.name, // Tozalangan nom ketadi
          description: mergedDescription,
          logo_url: null,
          discount_percent: 0, 
          is_active: false
        }]);

      if (dbError) throw dbError;
      
      setStep(6); 

    } catch (err: any) {
      setError(err.message || "Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessiya topilmadi, iltimos tizimga kiring.");

      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop() || 'jpg';
        const fileName = `merchant-${user.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, logoFile, { upsert: true });
        if (uploadError) throw new Error("Rasmni saqlashda xatolik yuz berdi.");

        const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
        
        const { error: updateError } = await supabase.from('merchants').update({ logo_url: publicUrlData.publicUrl }).eq('id', user.id);
        if (updateError) throw updateError;
      }

      setStep(7); 
    } catch (err: any) {
      setError(err.message || "Rasm yuklashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[hsl(var(--background))] relative overflow-hidden">
      
      {step > 1 && step < 7 && (
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[hsl(var(--secondary))] z-50">
          <div className="h-full bg-[hsl(var(--accent))] transition-all duration-500 ease-out rounded-r-full" style={{ width: `${((step - 1) / 5) * 100}%` }} />
        </div>
      )}

      {step > 1 && step < 7 && (
        <div className="flex items-center justify-between px-6 pt-8 pb-4 shrink-0 relative z-10 max-w-md mx-auto w-full">
          <button onClick={prevStep} className="p-2 -ml-2 rounded-full hover:bg-[hsl(var(--secondary))] transition-colors text-[hsl(var(--muted-foreground))]">
            <ArrowLeft size={22} />
          </button>
          <div className="text-xs font-bold text-[hsl(var(--muted-foreground))] tracking-widest uppercase">{step - 1} / 5 QADAM</div>
        </div>
      )}

      <div className="flex-1 flex flex-col px-6 max-w-md w-full mx-auto pb-10 relative z-10">
        
        {step === 1 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-300 flex-1 flex flex-col pt-12">
            <div className="w-16 h-16 bg-[hsl(var(--accent)/.15)] border-2 border-[hsl(var(--accent)/.3)] rounded-2xl flex items-center justify-center text-[hsl(var(--accent))] mb-8 shadow-sm">
              <Briefcase size={32} />
            </div>
            
            <div className="mb-8">
              <h1 className="font-display text-4xl font-bold leading-[1.1] text-[hsl(var(--foreground))]">
                Biznesingizni <br/><span className="text-[hsl(var(--accent))]">rivojlantiring</span>
              </h1>
              <p className="mt-4 text-[15px] leading-relaxed text-[hsl(var(--muted-foreground))]">
                TalabaPass tizimiga qo'shiling. O'z xizmat va mahsulotlaringizni minglab talabalarga taklif qilib, yangi mijozlarni jalb qiling.
              </p>
            </div>
            
            <div className="mt-auto flex flex-col gap-6">
              <div className="text-center">
                <span className="text-[13px] font-medium text-[hsl(var(--muted-foreground))]">Allaqachon hisobingiz bormi? </span>
                <Link href="/merchant/login" className="text-[13px] font-bold text-[hsl(var(--foreground))] hover:text-[hsl(var(--accent))] underline underline-offset-2">Kirish</Link>
              </div>
              <button onClick={nextStep} className="flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] py-4 text-base font-bold text-[hsl(var(--primary-foreground))] shadow-float active:scale-95 transition-all">
                Biznes sifatida ro'yxatdan o'tish <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-300 flex-1 flex flex-col">
            <div className="mt-4 mb-8">
              <h2 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">Faoliyat turi</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">Xizmatlaringiz qaysi toifaga kiradi?</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setFormData({ ...formData, category: cat.name }); nextStep(); }}
                  className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all ${
                    formData.category === cat.name 
                      ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/.1)] text-[hsl(var(--foreground))]' 
                      : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--accent)/.5)]'
                  }`}
                >
                  <span className="text-4xl mb-3">{cat.icon}</span>
                  <span className="text-[13px] font-bold text-center text-[hsl(var(--foreground))]">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-300 flex-1 flex flex-col">
            <div className="mt-4 mb-8">
              <h2 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">Do'kon nomi</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">Mijozlar sizni shu nom bilan topishadi.</p>
            </div>
            
            <div className="relative mb-2">
              <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={20} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Masalan: Najot Ta'lim"
                className={`w-full bg-[hsl(var(--card))] border-2 rounded-2xl py-4 pl-12 pr-12 text-sm font-semibold outline-none transition-all text-[hsl(var(--foreground))] ${
                  nameAvailable === true ? 'border-green-500 focus:border-green-500' : 
                  nameAvailable === false ? 'border-red-500 focus:border-red-500' : 
                  'border-[hsl(var(--border))] focus:border-[hsl(var(--accent))]'
                }`}
              />
              {nameAvailable === true && <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" size={20} />}
            </div>
            {error && <p className="text-red-500 text-[13px] font-semibold ml-2">{error}</p>}

            <button 
              onClick={checkNameAvailability} 
              disabled={loading || !formData.name}
              className="mt-auto flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] py-4 text-base font-bold text-[hsl(var(--primary-foreground))] shadow-float active:scale-95 transition-all disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>Davom etish <ArrowRight size={18} /></>}
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-300 flex-1 flex flex-col">
            <div className="mt-4 mb-8">
              <h2 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">Manzil va Vaqt</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">Mijozlar sizni oson topishlari uchun.</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-2 mb-1.5 block">Manzil</label>
                
                <div 
                  onClick={handleMapPick}
                  className="w-full h-[120px] bg-[hsl(var(--secondary)/.5)] rounded-2xl border-2 border-dashed border-[hsl(var(--border))] overflow-hidden relative mb-3 flex items-center justify-center cursor-pointer hover:border-[hsl(var(--accent))] transition-colors group"
                >
                  <div className="z-10 flex flex-col items-center gap-2 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--accent))] transition-colors">
                    {loading ? <Loader2 className="animate-spin" size={28} /> : <MapPin size={28} />}
                    <span className="text-xs font-bold">{loading ? "Manzil qidirilmoqda..." : "Xaritadan belgilash"}</span>
                  </div>
                </div>

                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={20} />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Toshkent sh., Navoiy ko'chasi 1-uy"
                    className="w-full bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--accent))] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-2 mb-1.5 block">Ish vaqti</label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={18} />
                    <input
                      type="time"
                      name="openTime"
                      value={formData.openTime}
                      onClick={(e) => (e.target as any).showPicker && (e.target as any).showPicker()}
                      onChange={handleChange}
                      className="w-full bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] rounded-2xl py-3.5 pl-11 pr-2 text-sm font-bold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--accent))] transition-all cursor-pointer"
                    />
                  </div>
                  <span className="text-[hsl(var(--muted-foreground))] font-bold">-</span>
                  <div className="relative flex-1">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={18} />
                    <input
                      type="time"
                      name="closeTime"
                      value={formData.closeTime}
                      onClick={(e) => (e.target as any).showPicker && (e.target as any).showPicker()}
                      onChange={handleChange}
                      className="w-full bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] rounded-2xl py-3.5 pl-11 pr-2 text-sm font-bold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--accent))] transition-all cursor-pointer"
                    />
                  </div>
                </div>
              </div>

            </div>

            <button 
              onClick={nextStep}
              disabled={!formData.location}
              className="mt-auto flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] py-4 text-base font-bold text-[hsl(var(--primary-foreground))] shadow-float active:scale-95 transition-all disabled:opacity-70"
            >
              Keyingisi <ArrowRight size={18} />
            </button>
          </div>
        )}

        {step === 5 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-300 flex-1 flex flex-col">
            <div className="mt-4 mb-8">
              <h2 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">Xavfsizlik</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">Shaxsiy kabinetingiz uchun login va parol.</p>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={20} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Login o'ylab toping (bo'sh joysiz)"
                  className="w-full bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--accent))] transition-all"
                />
              </div>

              <div>
                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={20} />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Parol kiriting"
                    className="w-full bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--accent))] transition-all"
                  />
                </div>
                
                <div className="mt-2.5 px-2">
                  <div className="flex justify-between items-center mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                    <span>Parol xavfsizligi</span>
                    <span className={strength.text === 'Oson' ? 'text-red-500' : strength.text === "O'rtacha" ? 'text-yellow-500' : strength.text === 'Kuchli' ? 'text-green-500' : ''}>
                      {strength.text}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[hsl(var(--secondary))] rounded-full overflow-hidden flex">
                    <div className={`h-full transition-all duration-300 ease-out ${strength.color}`} style={{ width: strength.width }}></div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={20} />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Parolni takrorlang"
                  className="w-full bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--accent))] transition-all"
                />
              </div>
            </div>
            
            {error && <p className="text-red-500 text-[13px] font-semibold mt-3 ml-2">{error}</p>}

            <button 
              onClick={handleSubmit}
              disabled={loading || !formData.username || !formData.password}
              className="mt-auto flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] py-4 text-base font-bold text-[hsl(var(--primary-foreground))] shadow-float active:scale-95 transition-all disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Ro\'yxatdan o\'tish'}
            </button>
          </div>
        )}

        {step === 6 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-300 flex-1 flex flex-col items-center justify-center">
            <div className="text-center mb-10 mt-auto">
              <h2 className="font-display text-3xl font-bold text-[hsl(var(--foreground))] mb-2">Do'kon Logotipi</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Do'koningiz ilovada chiroyli ko'rinishi uchun <br/> logotip yuklang (ixtiyoriy).</p>
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
                  {loading ? <Loader2 className="animate-spin" /> : 'Rasmni saqlash va Yakunlash'}
                </button>
              ) : (
                <>
                  <button onClick={() => fileInputRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] py-4 text-base font-bold text-[hsl(var(--primary-foreground))] shadow-float active:scale-95 transition-all">
                    <Camera size={20} /> Rasm yuklash
                  </button>
                  <button disabled={loading} onClick={() => setStep(7)} className="py-3 text-sm font-bold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors disabled:opacity-50">
                    {loading ? 'Kuting...' : "Hozircha o'tkazib yuborish"}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="animate-in zoom-in fade-in duration-500 flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="text-green-500" size={48} />
            </div>
            <h2 className="font-display text-3xl font-bold text-[hsl(var(--foreground))] mb-3">Arizangiz qabul qilindi!</h2>
            <p className="text-[15px] text-[hsl(var(--muted-foreground))] mb-8 leading-relaxed max-w-xs mx-auto">
              Do'kon ma'lumotlari yuborildi. Administrator tomonidan tasdiqlanganidan so'ng tizimga kirishingiz mumkin bo'ladi.
            </p>
            <Link 
              href="/merchant/login"
              className="w-full flex items-center justify-center bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] text-[hsl(var(--foreground))] font-bold py-4 rounded-full hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))] transition-all active:scale-95"
            >
              Tizimga kirish sahifasi
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}