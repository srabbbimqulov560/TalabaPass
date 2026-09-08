import { useState, useRef } from 'react';
import { Link } from 'wouter';
import { 
  ArrowLeft, ArrowRight, Camera, Check, 
  LockKeyhole, UserRound, IdCard, CheckCircle2, Circle, Loader2 
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase'; // <--- Supabase ulandi

export default function SignupPage() {
  const { t, lang, setLang } = useLanguage();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    studentId: '',
    password: '',
    confirmPassword: ''
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Yuklanish holati
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); 
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file); // Bazaga yuborish uchun asl faylni saqlaymiz
      setAvatarPreview(URL.createObjectURL(file)); // Ekranda ko'rsatish uchun
    }
  };

  const nextStep = async () => {
    if (step === 2 && (!formData.firstName || !formData.lastName)) {
      setError("Iltimos, ism va familiyangizni kiriting");
      return;
    }
    if (step === 3) {
      if (!formData.studentId) {
        setError("Talaba ID raqamini kiriting");
        return;
      }
      if (formData.password.length < 6) {
        setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Parollar mos kelmadi. Qaytadan tekshiring!");
        return;
      }

      // Xavfsizlik: Talaba ID bazada avvaldan bor yo'qligini tekshirish
      setIsLoading(true);
      const { data: existingStudent } = await supabase
        .from('students')
        .select('id')
        .eq('student_id', formData.studentId)
        .single();
        
      setIsLoading(false);

      if (existingStudent) {
        setError("Ushbu Talaba ID allaqachon ro'yxatdan o'tgan!");
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  // ASOSIY QISM: Bazaga saqlash
  const handleFinish = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      let avatarUrl = null;

      // 1. Agar rasm tanlangan bo'lsa, Storage'ga yuklash
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${formData.studentId}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);

        if (uploadError) throw uploadError;

        // Yuklangan rasmni ochiq linkini olish
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
          
        avatarUrl = publicUrlData.publicUrl;
      }

      // 2. Talaba ma'lumotlarini SQL jadvalliga yozish
      const { data: newStudent, error: dbError } = await supabase
        .from('students')
        .insert([
          {
            first_name: formData.firstName,
            last_name: formData.lastName,
            student_id: formData.studentId,
            password_hash: formData.password, // Haqiqiy loyihada bcrypt bilan shifrlanadi
            avatar_url: avatarUrl
          }
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      // 3. Muvaffaqiyatli saqlangach tizimga kiritish
      localStorage.setItem('token', newStudent.id); // ID ni token sifatida saqlaymiz
      window.location.href = '/'; 

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Xatolik yuz berdi. Qaytadan urining.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[hsl(var(--background))] relative overflow-hidden">
      
      <div className="absolute top-0 left-0 w-full h-1.5 bg-[hsl(var(--secondary))] z-50">
        <div 
          className="h-full bg-[hsl(var(--accent))] transition-all duration-500 ease-out rounded-r-full"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      <div className="flex items-center justify-between px-6 pt-8 pb-4 shrink-0">
        {step > 1 ? (
          <button onClick={prevStep} className="p-2 -ml-2 rounded-full hover:bg-[hsl(var(--secondary))] transition-colors text-[hsl(var(--muted-foreground))]">
            <ArrowLeft size={22} />
          </button>
        ) : (
          <div className="w-10"></div> 
        )}
        
        <div className="text-xs font-bold text-[hsl(var(--muted-foreground))] tracking-widest uppercase">
          {step} / 4 QADAM
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 max-w-md w-full mx-auto pb-10">
        
        {step === 1 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-300 flex-1 flex flex-col">
            <div className="mt-4 mb-8">
              <h1 className="font-display text-4xl font-bold leading-[1.1] text-[hsl(var(--foreground))]">
                {t('hero_title_1')} <br/>
                <span className="text-[hsl(var(--accent))]">{t('hero_title_2')}</span>
              </h1>
              <p className="mt-4 text-sm text-[hsl(var(--muted-foreground))]">
                Ilovadan foydalanish uchun o'zingizga qulay tilni tanlang.
              </p>
            </div>

            <div className="space-y-3 mt-4">
              {/* Tillar ro'yxati qisqartirildi (O'zgarishsiz qoladi) */}
              {['uz', 'ru', 'en'].map((l) => (
                <div 
                  key={l}
                  onClick={() => setLang(l as 'uz'|'ru'|'en')}
                  className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer border-2 transition-colors ${lang === l ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/.08)]' : 'border-transparent bg-[hsl(var(--card))] shadow-sm'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{l === 'uz' ? '🇺🇿' : l === 'ru' ? '🇷🇺' : '🇬🇧'}</span>
                    <span className="text-base font-bold text-[hsl(var(--foreground))]">{l === 'uz' ? "O'zbek" : l === 'ru' ? "Русский" : "English"}</span>
                  </div>
                  {lang === l ? <CheckCircle2 size={24} className="text-[hsl(var(--accent))]" /> : <Circle size={24} className="text-[hsl(var(--muted-foreground))]" />}
                </div>
              ))}
            </div>

            <div className="mt-auto flex flex-col gap-5">
              <div className="text-center">
                <span className="text-[13px] font-medium text-[hsl(var(--muted-foreground))]">Allaqachon hisobingiz bormi? </span>
                <Link href="/login" className="text-[13px] font-bold text-[hsl(var(--foreground))] hover:text-[hsl(var(--accent))] transition-colors underline underline-offset-2">
                  Kirish
                </Link>
              </div>
              <button onClick={nextStep} className="flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] py-4 text-base font-bold text-[hsl(var(--primary-foreground))] shadow-float active:scale-95 transition-all">
                Davom etish <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-300 flex-1 flex flex-col">
            <div className="mt-4 mb-8">
              <h2 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">O'zingizni tanishtiring</h2>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Ruxsatnomangizda ismingiz to'g'ri chiqishi uchun haqiqiy ism va familiyangizni kiriting.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-2 mb-1.5 block">Ismingiz</label>
                <div className="relative">
                  <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={20} />
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Masalan: Shoxjaxon" className="w-full rounded-2xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] py-4 pl-12 pr-4 font-semibold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--accent))] transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-2 mb-1.5 block">Familiyangiz</label>
                <div className="relative">
                  <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={20} />
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Masalan: Rabimqulov" className="w-full rounded-2xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] py-4 pl-12 pr-4 font-semibold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--accent))] transition-colors" />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm font-semibold ml-2 animate-in fade-in">{error}</p>}
            </div>

            <button onClick={nextStep} className="mt-auto flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] py-4 text-base font-bold text-[hsl(var(--primary-foreground))] shadow-float active:scale-95 transition-all">
              Keyingisi <ArrowRight size={18} />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-300 flex-1 flex flex-col">
            <div className="mt-4 mb-8">
              <h2 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">Talaba ma'lumotlari</h2>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Xavfsizligingiz uchun kuchli parol o'rnating.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-2 mb-1.5 block">Talaba ID</label>
                <div className="relative">
                  <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={20} />
                  <input type="text" name="studentId" value={formData.studentId} onChange={handleChange} placeholder="ID raqamingizni kiriting" className="w-full rounded-2xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] py-4 pl-12 pr-4 font-mono font-bold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--accent))] transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-2 mb-1.5 block">Parol yarating</label>
                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={20} />
                  <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Kamida 6 ta belgi" className="w-full rounded-2xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] py-4 pl-12 pr-4 font-semibold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--accent))] transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-2 mb-1.5 block">Parolni tasdiqlang</label>
                <div className="relative">
                  <LockKeyhole className={`absolute left-4 top-1/2 -translate-y-1/2 ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'text-red-500' : 'text-[hsl(var(--muted-foreground))]'}`} size={20} />
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Parolni qayta kiriting" className={`w-full rounded-2xl border-2 bg-[hsl(var(--card))] py-4 pl-12 pr-4 font-semibold text-[hsl(var(--foreground))] outline-none transition-colors ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-[hsl(var(--border))] focus:border-[hsl(var(--accent))]'}`} />
                  {formData.confirmPassword && formData.password === formData.confirmPassword && <Check className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />}
                </div>
              </div>
              {error && <p className="text-red-500 text-sm font-semibold ml-2 animate-in fade-in">{error}</p>}
            </div>

            <button disabled={isLoading} onClick={nextStep} className="mt-auto flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] py-4 text-base font-bold text-[hsl(var(--primary-foreground))] shadow-float active:scale-95 transition-all disabled:opacity-70">
              {isLoading ? <Loader2 className="animate-spin" /> : <>Keyingisi <ArrowRight size={18} /></>}
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-300 flex-1 flex flex-col items-center justify-center">
            <div className="text-center mb-10 mt-auto">
              <h2 className="font-display text-3xl font-bold text-[hsl(var(--foreground))] mb-2">Profil rasmi</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Bu sizning do'konlarda oson tanilishingizga yordam beradi.</p>
            </div>

            <div className="relative group mb-auto">
              <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
              <div onClick={() => fileInputRef.current?.click()} className="grid h-36 w-36 cursor-pointer place-items-center overflow-hidden rounded-full bg-[hsl(var(--secondary))] border-4 border-dashed border-[hsl(var(--border))] hover:border-[hsl(var(--accent))] transition-all group-hover:opacity-90">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-[hsl(var(--muted-foreground))]">
                    <Camera size={40} className="mb-2 opacity-50" />
                    <span className="text-xs font-bold uppercase">Rasm</span>
                  </div>
                )}
              </div>
              {avatarPreview && (
                <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-1 right-1 grid h-10 w-10 place-items-center rounded-full border-4 border-[hsl(var(--background))] bg-[hsl(var(--accent))] text-white shadow-sm">
                  <Camera size={16} />
                </button>
              )}
            </div>

            {error && <p className="text-red-500 text-sm font-semibold mb-4 text-center animate-in fade-in">{error}</p>}

            <div className="w-full flex flex-col gap-3 mt-auto">
              {avatarPreview ? (
                <button disabled={isLoading} onClick={handleFinish} className="flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] py-4 text-base font-bold text-[hsl(var(--primary-foreground))] shadow-float active:scale-95 transition-all disabled:opacity-70">
                  {isLoading ? <><Loader2 className="animate-spin" /> Yuklanmoqda...</> : 'Yakunlash'}
                </button>
              ) : (
                <>
                  <button onClick={() => fileInputRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] py-4 text-base font-bold text-[hsl(var(--primary-foreground))] shadow-float active:scale-95 transition-all">
                    <Camera size={20} /> Rasm yuklash
                  </button>
                  <button disabled={isLoading} onClick={handleFinish} className="py-3 text-sm font-bold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors disabled:opacity-50">
                    {isLoading ? 'Saqlanmoqda...' : "Hozircha o'tkazib yuborish"}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}