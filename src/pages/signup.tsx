import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, ArrowRight, Camera, LockKeyhole, UserRound, IdCard, CheckCircle2, Circle, Loader2, GraduationCap, ChevronDown, Search, Check, Store, Eye, EyeOff, FileImage } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';

const UNIVERSITIES = [
  "O'zbekiston milliy universiteti (O'zMU)", "Toshkent davlat texnika universiteti (TDTU)", 
  "Toshkent davlat iqtisodiyot universiteti (TDIU)", "Toshkent moliya instituti (TMI)", 
  "Jahon iqtisodiyoti va diplomatiya universiteti (JIDU)", "O'zbekiston davlat jahon tillari universiteti (O'zDJTU)", 
  "Toshkent pediatriya tibbiyot instituti (ToshPTI)", "Toshkent tibbiyot akademiyasi (TTA)", 
  "Toshkent davlat yuridik universiteti (TDYU)", "Toshkent axborot texnologiyalari universiteti (TATU)", 
  "Toshkent davlat pedagogika universiteti (TDPU)", "Toshkent davlat sharqshunoslik universiteti (TDShU)",
  "Toshkent arxitektura-qurilish universiteti (TAQU)", "O'zbekiston davlat san'at va madaniyat instituti (O'zDSMI)",
  "Toshkent davlat agrar universiteti (TDAU)", "Toshkent kimyo-texnologiya instituti (TKTI)",
  "Toshkent davlat transport universiteti (TDTU)", "Toshkent davlat stomatologiya instituti (TDSI)",
  "O'zbekiston davlat jismoniy tarbiya va sport universiteti (O'zDJTSU)", 
  "O'zbekiston jurnalistika va ommaviy kommunikatsiyalar universiteti (O'zJOKU)",
  "Toshkent to'qimachilik va yengil sanoat instituti (TTESI)", "Toshkent farmatsevtika instituti (ToshFarI)",
  "O'zbekiston xalqaro islom akademiyasi", "Jamoat xavfsizligi universiteti", "Bojxona instituti",
  
  "Westminster xalqaro universiteti (WIUT)", "Inha universiteti (IUT)", "Amity universiteti", 
  "Webster universiteti", "Akfa universiteti (AKFA)", "Toshkent shahridagi Turin politexnika universiteti (TTPU)", 
  "Kimyo xalqaro universiteti (KIUT - sobiq Yeoju)", "Singapur menejmentni rivojlantirish instituti (MDIS)", 
  "Puchon universiteti (Bucheon)", "Toshkent shahridagi Yodju texnika instituti", 
  "British Management University (BMU)", "TEAM universiteti", "TMC instituti", 
  "Alfraganus universiteti", "Renessans ta'lim universiteti", "Toshkent xalqaro ta'lim universiteti (TIUE)",
  "Stars International University", "Jahon tillari va biznes instituti", "Profi universiteti",
  "Toshkent amaliy fanlar universiteti (UTAS)", "Diplomat universiteti", "Cambridge xalqaro universiteti",
  
  "Samarqand davlat universiteti (SamDU)", "Samarqand davlat tibbiyot universiteti (SamDTU)",
  "Samarqand iqtisodiyot va servis instituti (SamISI)", "Samarqand davlat arxitektura-qurilish universiteti (SamDAQU)",
  "Samarqand davlat chet tillar instituti (SamDChTI)", "Samarqand davlat veterinariya meditsinasi",
  "Silk Road xalqaro turizm va madaniy meros universiteti", "Samarqand xalqaro texnologiya universiteti (SIUT)",
  
  "Buxoro davlat universiteti (BuxDU)", "Buxoro davlat tibbiyot instituti (BuxDTI)", 
  "Buxoro muhandislik-texnologiya instituti (BuxMTI)", "Buxoro davlat pedagogika instituti",
  "Navoiy davlat konchilik va texnologiyalar universiteti (NDKTU)", "Navoiy davlat pedagogika instituti (NavDPI)",
  "Urganch davlat universiteti (UrDU)",
  
  "Farg'ona davlat universiteti (FarDU)", "Farg'ona politexnika instituti (FarPI)", 
  "Farg'ona jamoat salomatligi tibbiyot instituti", "Andijon davlat universiteti (ADU)", 
  "Andijon davlat tibbiyot instituti (ADTI)", "Andijon mashinasozlik instituti (AndMI)", 
  "Namangan davlat universiteti (NamDU)", "Namangan muhandislik-qurilish instituti (NamMQI)",
  
  "Qarshi davlat universiteti (QarDU)", "Qarshi muhandislik-iqtisodiyot instituti (QarMII)", 
  "Termiz davlat universiteti (TerDU)", "Jizzax davlat pedagogika universiteti (JDPU)", 
  "Jizzax politexnika instituti (JizPI)", "Guliston davlat universiteti (GulDU)", 
  
  "Qoraqalpoq davlat universiteti (QDU)", "Nukus davlat pedagogika instituti (NDPI)", 
  "Boshqa (O'zim kiritaman)"
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

export default function SignupPage() {
  const { t, lang, setLang } = useLanguage();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ 
    fullName: '', studentId: '', university: '', password: '', confirmPassword: '' 
  });
  
  // KAMERA STATELARI
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  
  // AVATAR STATELARI
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUniOpen, setIsUniOpen] = useState(false);
  const [uniSearch, setUniSearch] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); 
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const filteredUnis = UNIVERSITIES.filter(u => u.toLowerCase().includes(uniSearch.toLowerCase()));
  const strength = getPasswordStrength(formData.password);

  // ============================================
  // KAMERANI BOSHQARISH VA QORA EKRAN YECHIMI
  // ============================================
  const startCamera = async () => {
    setError('');
    setDocumentFile(null);
    setDocumentPreview(null);
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Qurilmangiz kamerani qabul qilmadi. Xavfsiz ulanish (HTTPS) talab qilinadi.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setCameraStream(stream);
      setIsCameraOpen(true);
      
      // Kichik pauza bilan videoni ishga tushirish (Qora ekranni oldini oladi)
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.log("Video autoplay xatosi", e));
        }
      }, 100);
    } catch (err) {
      try {
        // Agar orqa kamera ishlamasa, oddiy kameraga o'tish (Fallback)
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraStream(stream);
        setIsCameraOpen(true);
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(e => console.log(e));
          }
        }, 100);
      } catch (err2) {
        setError("Kameraga ruxsat berilmadi yoki qurilmada xatolik yuz berdi.");
      }
    }
  };

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      setIsCameraOpen(false);
    }
  }, [cameraStream]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Video to'liq yuklanganiga ishonch hosil qilish
      if (video.videoWidth === 0) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "id_card_photo.jpg", { type: "image/jpeg" });
            setDocumentFile(file);
            setDocumentPreview(URL.createObjectURL(blob));
            stopCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  // ============================================
  // QADAMLARNI BOSHQARISH VA BAZAGA YOZISH
  // ============================================
  const nextStep = async () => {
    if (step === 1) { setStep(2); return; }
    
    if (step === 2) {
      const nameParts = formData.fullName.trim().split(' ');
      if (nameParts.length < 2) {
        setError("Iltimos, ism va familiyangizni to'liq kiriting");
        return;
      }
      setStep(3); return;
    }

    if (step === 3) {
      if (!formData.studentId) { setError("Talaba ID raqamini kiriting"); return; }
      if (!formData.university) { setError("Universitetni tanlang yoki kiriting"); return; }
      if (strength.score < 5) { setError("Parol yetarlicha kuchli emas. Yashil darajaga yetkazing!"); return; }
      if (formData.password !== formData.confirmPassword) { setError("Parollar mos kelmadi!"); return; }

      setIsLoading(true);
      setError('');
      
      try {
        // DIQQAT: BU YERDA BAZAGA HECH NARSA YOZILMAYDI!
        // Faqat ID ni o'zi band emasligini tekshiramiz.
        const { data } = await supabase
          .from('students')
          .select('student_id')
          .eq('student_id', formData.studentId)
          .maybeSingle();
        
        if (data) {
          throw new Error("Bu Talaba ID allaqachon ro'yxatdan o'tgan!");
        }
        
        setStep(4);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    // 🔥 FAQAT RASM YUKLANGACH (4-QADAMDA) BAZAGA SAQLANADI!
    if (step === 4) {
      if (!documentFile) {
        setError("Iltimos, avval talabalik guvohnomangiz yoki ID kartangizni suratga oling!");
        return;
      }
      
      setIsLoading(true);
      setError('');

      try {
        const fakeEmail = `${formData.studentId.toLowerCase()}@talabapass.uz`;
        
        // 1. Yangi foydalanuvchi yaratish (SignUp)
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: fakeEmail,
          password: formData.password,
        });

        if (authError) {
          if (authError.message.includes('already registered')) {
            throw new Error("Siz avval ro'yxatdan o'tishga uringansiz, lekin oxiriga yetkazmagansiz. Admin tozalab yuborishini kuting yoki Login orqali kiring.");
          }
          throw new Error(authError.message);
        }
        
        if (!authData.user) throw new Error("Foydalanuvchini yaratib bo'lmadi.");
        const userId = authData.user.id;

        // 2. Rasmni yuklash
        const fileExt = documentFile.name.split('.').pop() || 'jpg';
        const fileName = `doc-${userId}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, documentFile);
        if (uploadError) throw new Error("Hujjatni yuklashda xatolik yuz berdi");

        const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(fileName);

        // 3. Asosiy bazaga yozish (Admin endi ko'radi)
        const nameParts = formData.fullName.trim().split(' ');
        const { error: dbError } = await supabase
          .from('students')
          .insert([{
            id: userId,
            first_name: nameParts[0],
            last_name: nameParts.slice(1).join(' '),
            student_id: formData.studentId,
            university: formData.university,
            is_active: false,
            avatar_url: null,
            document_url: publicUrlData.publicUrl
          }]);

        if (dbError) throw dbError;
        
        setStep(5);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const prevStep = () => {
    if (step === 4) stopCamera();
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFinish = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessiya topilmadi, iltimos logindan kiring.");

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop() || 'jpg';
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, avatarFile, { upsert: true });
        if (uploadError) throw new Error("Rasmni saqlashda xatolik");

        const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
        await supabase.from('students').update({ avatar_url: publicUrlData.publicUrl }).eq('id', user.id);
      }
      window.location.href = '/'; 
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleSkip = () => window.location.href = '/';

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[hsl(var(--background))] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-[hsl(var(--secondary))] z-50">
        <div className="h-full bg-[hsl(var(--accent))] transition-all duration-500 ease-out rounded-r-full" style={{ width: `${(step / 5) * 100}%` }} />
      </div>

      <div className="flex items-center justify-between px-6 pt-8 pb-4 shrink-0 relative z-10">
        {step > 1 && step < 5 ? (
          <button onClick={prevStep} className="p-2 -ml-2 rounded-full hover:bg-[hsl(var(--secondary))] transition-colors text-[hsl(var(--muted-foreground))]">
            <ArrowLeft size={22} />
          </button>
        ) : <div className="w-10"></div>}
        <div className="text-xs font-bold text-[hsl(var(--muted-foreground))] tracking-widest uppercase">{step} / 5 QADAM</div>
      </div>

      <div className="flex-1 flex flex-col px-6 max-w-md w-full mx-auto pb-10 relative z-10">
        
        {step === 1 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-300 flex-1 flex flex-col">
            <div className="mt-4 mb-8">
              <h1 className="font-display text-4xl font-bold leading-[1.1] text-[hsl(var(--foreground))]">
                {t('hero_title_1')} <br/><span className="text-[hsl(var(--accent))]">{t('hero_title_2')}</span>
              </h1>
            </div>
            <div className="space-y-3 mt-4">
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
            <div className="mt-auto flex flex-col gap-5">
              <button onClick={nextStep} className="flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] py-4 text-base font-bold text-[hsl(var(--primary-foreground))] shadow-float active:scale-95 transition-all">
                Davom etish <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-300 flex-1 flex flex-col">
            <div className="mt-4 mb-6"><h2 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">O'zingizni tanishtiring</h2></div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-2 mb-1.5 block">To'liq ismingiz (Ism va Familiya)</label>
                <div className="relative">
                  <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={20} />
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Masalan: Shoxjaxon Rabimqulov" required className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-4 pl-12 pr-4 rounded-2xl text-sm font-semibold outline-none focus:border-[hsl(var(--accent))] text-[hsl(var(--foreground))] transition-all" />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm font-semibold ml-2">{error}</p>}
            </div>

            <div className="mt-auto flex flex-col gap-3">
              <div className="text-center mb-2">
                <span className="text-[13px] font-medium text-[hsl(var(--muted-foreground))]">Allaqachon hisobingiz bormi? </span>
                <Link href="/login" className="text-[13px] font-bold text-[hsl(var(--foreground))] hover:text-[hsl(var(--accent))] underline underline-offset-2">Kirish</Link>
              </div>
              <Link href="/merchant/signup" className="flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] py-3.5 text-[15px] font-bold text-[hsl(var(--foreground))] hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))] active:scale-95 transition-all shadow-sm">
                <Store size={18} /> Biznes sifatida ro'yxatdan o'tish
              </Link>
              <button onClick={nextStep} className="flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] py-4 text-base font-bold text-[hsl(var(--primary-foreground))] shadow-float active:scale-95 transition-all">
                Keyingisi <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-300 flex-1 flex flex-col">
            <div className="mt-4 mb-6"><h2 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">Talaba ma'lumotlari</h2></div>
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-2 mb-1.5 block">Talaba ID</label>
                <div className="relative">
                  <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={20} />
                  <input type="text" name="studentId" value={formData.studentId} onChange={handleChange} placeholder="ID raqamingizni kiriting" className="w-full rounded-2xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] py-4 pl-12 pr-4 font-mono font-bold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--accent))]" />
                </div>
              </div>

              <div className="relative">
                <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-2 mb-1.5 block">Universitet</label>
                <div className="relative cursor-pointer" onClick={() => setIsUniOpen(!isUniOpen)}>
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={20} />
                  <div className={`w-full rounded-2xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] py-4 pl-12 pr-10 font-semibold text-[hsl(var(--foreground))] outline-none transition-colors ${isUniOpen ? 'border-[hsl(var(--accent))]' : ''} ${!formData.university ? 'text-[hsl(var(--muted-foreground))]' : ''}`}>
                    <span className="block truncate">{formData.university || "Universitetni tanlang..."}</span>
                  </div>
                  <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] transition-transform ${isUniOpen ? 'rotate-180' : ''}`} size={20} />
                </div>
                {isUniOpen && (
                  <div className="absolute top-[100%] left-0 w-full mt-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl shadow-xl z-50 max-h-[250px] flex flex-col overflow-hidden">
                    <div className="p-3 border-b border-[hsl(var(--border))] flex items-center gap-2 bg-[hsl(var(--secondary)/.5)]">
                      <Search size={16} className="text-[hsl(var(--muted-foreground))]" />
                      <input type="text" placeholder="Qidirish..." value={uniSearch} onChange={(e) => setUniSearch(e.target.value)} className="bg-transparent text-sm w-full outline-none text-[hsl(var(--foreground))]" autoFocus />
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-1">
                      {filteredUnis.length > 0 ? (
                        filteredUnis.map((uni, idx) => (
                          <div key={idx} onClick={() => { setFormData({ ...formData, university: uni }); setIsUniOpen(false); setUniSearch(''); }} className={`p-3 text-sm rounded-xl cursor-pointer transition-colors ${formData.university === uni ? 'bg-[hsl(var(--accent)/.1)] text-[hsl(var(--accent))] font-bold' : 'text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]'}`}>{uni}</div>
                        ))
                      ) : (
                        <div className="p-3 text-sm text-[hsl(var(--muted-foreground))] text-center">Topilmadi. O'zingiz kiriting:</div>
                      )}
                      {uniSearch && !filteredUnis.includes(uniSearch) && (
                        <div onClick={() => { setFormData({ ...formData, university: uniSearch }); setIsUniOpen(false); setUniSearch(''); }} className="p-3 text-sm rounded-xl cursor-pointer bg-[hsl(var(--accent)/.1)] text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/.2)] transition-colors font-semibold flex items-center justify-between">
                          <span>"{uniSearch}" deb saqlash</span> <Check size={16} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-2 mb-1.5 block">Murakkab Parol yarating</label>
                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={20} />
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Masalan: Pa$$w0rd!" className="w-full rounded-2xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] py-4 pl-12 pr-12 font-semibold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--accent))]" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors outline-none">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                </div>
                <div className="mt-2.5 px-2">
                  <div className="flex justify-between items-center mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                    <span>Parol xavfsizligi</span>
                    <span className={strength.text === 'Oson' ? 'text-red-500' : strength.text === "O'rtacha" ? 'text-yellow-500' : strength.text === 'Kuchli' ? 'text-green-500' : ''}>{strength.text}</span>
                  </div>
                  <div className="h-1.5 w-full bg-[hsl(var(--secondary))] rounded-full overflow-hidden flex">
                    <div className={`h-full transition-all duration-300 ease-out ${strength.color}`} style={{ width: strength.width }}></div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-2 mb-1.5 block">Parolni tasdiqlang</label>
                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={20} />
                  <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Parolni qayta kiriting" className="w-full rounded-2xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] py-4 pl-12 pr-12 font-semibold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--accent))]" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors outline-none">{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                </div>
              </div>
              
              {error && <p className="text-red-500 text-[13px] font-semibold ml-1 leading-snug">{error}</p>}
            </div>
            
            <button disabled={isLoading} onClick={nextStep} className="mt-auto flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] py-4 text-base font-bold text-[hsl(var(--primary-foreground))] shadow-float active:scale-95 transition-all disabled:opacity-70">
              {isLoading ? <Loader2 className="animate-spin" /> : <>Ro'yxatdan o'tish <ArrowRight size={18} /></>}
            </button>
          </div>
        )}

        {/* 4-QADAM - JONLI KAMERA VA XAVFSIZ SHABLON */}
        {step === 4 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-300 flex-1 flex flex-col items-center justify-center relative">
            <div className="text-center mb-6 mt-4">
              <h2 className="font-display text-3xl font-bold text-[hsl(var(--foreground))] mb-2">Hujjatni tasvirga oling</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] px-4">
                Talabalik guvohnomasi yoki ID kartangizni kadr ichiga to'g'rilab rasmga oling. Galereyadan yuklash man etiladi.
              </p>
            </div>

            <div className="relative w-full max-w-sm aspect-[4/3] bg-black rounded-[32px] overflow-hidden shadow-xl mb-6">
              
              {!documentPreview && !isCameraOpen && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[hsl(var(--secondary))] border-4 border-dashed border-[hsl(var(--border))]">
                  <FileImage size={48} className="opacity-50 mb-4 text-[hsl(var(--muted-foreground))]" />
                  <button onClick={startCamera} className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold py-3 px-6 rounded-full shadow-lg active:scale-95 transition-all">
                    Kamerani yoqish
                  </button>
                </div>
              )}

              {isCameraOpen && (
                <>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover bg-black" />
                  
                  {/* TOZALANGAN, XAVFSIZ SHABLON (Qora ekran bermaydi) */}
                  <div className="absolute inset-0 pointer-events-none z-10 border-[40px] border-black/60 flex items-center justify-center">
                    <div className="w-full h-full border-2 border-dashed border-white/60 rounded-xl relative">
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-white text-[10px] uppercase font-bold tracking-widest shadow-black drop-shadow-md">
                        Hujjatni romga kiriting
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
                    <button onClick={capturePhoto} className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full border-[3px] border-white flex items-center justify-center active:scale-90 transition-all shadow-xl">
                      <div className="w-12 h-12 bg-white rounded-full shadow-sm"></div>
                    </button>
                  </div>
                </>
              )}

              {documentPreview && (
                <>
                  <img src={documentPreview} className="w-full h-full object-cover" alt="Hujjat" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <button onClick={startCamera} className="bg-white text-black font-bold py-2 px-5 rounded-full shadow-lg">
                      Qaytadan olish
                    </button>
                  </div>
                </>
              )}
            </div>
            
            <canvas ref={canvasRef} className="hidden" />

            {error && <p className="text-red-500 text-[13px] font-bold mb-4 text-center px-4">{error}</p>}

            <button 
              disabled={isLoading || !documentFile} 
              onClick={nextStep} 
              className="mt-auto flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] py-4 text-base font-bold text-[hsl(var(--primary-foreground))] shadow-float active:scale-95 transition-all disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <>Saqlash va Davom etish <ArrowRight size={18}/></>}
            </button>
          </div>
        )}

        {/* 5-QADAM - PROFIL RASMI */}
        {step === 5 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-300 flex-1 flex flex-col items-center justify-center">
            <div className="text-center mb-10 mt-auto">
              <h2 className="font-display text-3xl font-bold text-[hsl(var(--foreground))] mb-2">Profil rasmi</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Dasturda chiroyli ko'rinishi uchun <br/> yuzingiz ko'ringan rasm yuklang.</p>
            </div>
            <div className="relative group mb-auto">
              <input type="file" ref={avatarInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
              <div onClick={() => avatarInputRef.current?.click()} className="grid h-40 w-40 cursor-pointer place-items-center overflow-hidden rounded-[40px] bg-[hsl(var(--secondary))] border-4 border-dashed border-[hsl(var(--border))] hover:border-[hsl(var(--accent))] transition-all">
                {avatarPreview ? <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" /> : <Camera size={44} className="opacity-50 text-[hsl(var(--muted-foreground))]" />}
              </div>
            </div>
            {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
            <div className="w-full flex flex-col gap-3 mt-auto">
              {avatarPreview ? (
                <button disabled={isLoading} onClick={handleFinish} className="flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] py-4 text-base font-bold text-[hsl(var(--primary-foreground))] shadow-float active:scale-95 transition-all disabled:opacity-70">
                  {isLoading ? <Loader2 className="animate-spin" /> : 'Rasmni saqlash va Yakunlash'}
                </button>
              ) : (
                <>
                  <button onClick={() => avatarInputRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] py-4 text-base font-bold text-[hsl(var(--primary-foreground))] shadow-float active:scale-95 transition-all">
                    <Camera size={20} /> Rasm yuklash
                  </button>
                  <button disabled={isLoading} onClick={handleSkip} className="py-3 text-sm font-bold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors disabled:opacity-50">
                    {isLoading ? 'Ilovaga kirilmoqda...' : "Hozircha o'tkazib yuborish"}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      
      {isUniOpen && <div className="fixed inset-0 z-0 bg-black/20 backdrop-blur-[2px]" onClick={() => setIsUniOpen(false)} />}
    </div>
  );
}