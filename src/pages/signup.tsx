import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, ArrowRight, Camera, LockKeyhole, UserRound, IdCard, CheckCircle2, Circle, Loader2, GraduationCap, ChevronDown, Search, Check, Store, Eye, EyeOff, FileImage, Clock, X } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import Cropper from 'react-easy-crop';

const UNIVERSITIES = [ "O'zbekiston milliy universiteti (O'zMU)", "Toshkent davlat texnika universiteti (TDTU)", "Toshkent davlat iqtisodiyot universiteti (TDIU)", "Toshkent moliya instituti (TMI)", "Jahon iqtisodiyoti va diplomatiya universiteti (JIDU)", "O'zbekiston davlat jahon tillari universiteti (O'zDJTU)", "Toshkent pediatriya tibbiyot instituti (ToshPTI)", "Toshkent tibbiyot akademiyasi (TTA)", "Toshkent davlat yuridik universiteti (TDYU)", "Toshkent axborot texnologiyalari universiteti (TATU)", "Toshkent davlat pedagogika universiteti (TDPU)", "Toshkent davlat sharqshunoslik universiteti (TDShU)", "Toshkent arxitektura-qurilish universiteti (TAQU)", "O'zbekiston davlat san'at va madaniyat instituti (O'zDSMI)", "Toshkent davlat agrar universiteti (TDAU)", "Toshkent kimyo-texnologiya instituti (TKTI)", "Toshkent davlat transport universiteti (TDTU)", "Toshkent davlat stomatologiya instituti (TDSI)", "O'zbekiston davlat jismoniy tarbiya va sport universiteti (O'zDJTSU)", "O'zbekiston jurnalistika va ommaviy kommunikatsiyalar universiteti (O'zJOKU)", "Toshkent to'qimachilik va yengil sanoat instituti (TTESI)", "Toshkent farmatsevtika instituti (ToshFarI)", "O'zbekiston xalqaro islom akademiyasi", "Jamoat xavfsizligi universiteti", "Bojxona instituti", "Westminster xalqaro universiteti (WIUT)", "Inha universiteti (IUT)", "Amity universiteti", "Webster universiteti", "Akfa universiteti (AKFA)", "Toshkent shahridagi Turin politexnika universiteti (TTPU)", "Kimyo xalqaro universiteti (KIUT - sobiq Yeoju)", "Singapur menejmentni rivojlantirish instituti (MDIS)", "Puchon universiteti (Bucheon)", "Toshkent shahridagi Yodju texnika instituti", "British Management University (BMU)", "TEAM universiteti", "TMC instituti", "Alfraganus universiteti", "Renessans ta'lim universiteti", "Toshkent xalqaro ta'lim universiteti (TIUE)", "Stars International University", "Jahon tillari va biznes instituti", "Profi universiteti", "Toshkent amaliy fanlar universiteti (UTAS)", "Diplomat universiteti", "Cambridge xalqaro universiteti", "Samarqand davlat universiteti (SamDU)", "Samarqand davlat tibbiyot universiteti (SamDTU)", "Samarqand iqtisodiyot va servis instituti (SamISI)", "Samarqand davlat arxitektura-qurilish universiteti (SamDAQU)", "Samarqand davlat chet tillar instituti (SamDChTI)", "Samarqand davlat veterinariya meditsinasi", "Silk Road xalqaro turizm va madaniy meros universiteti", "Samarqand xalqaro texnologiya universiteti (SIUT)", "Buxoro davlat universiteti (BuxDU)", "Buxoro davlat tibbiyot instituti (BuxDTI)", "Buxoro muhandislik-texnologiya instituti (BuxMTI)", "Buxoro davlat pedagogika instituti", "Navoiy davlat konchilik va texnologiyalar universiteti (NDKTU)", "Navoiy davlat pedagogika instituti (NavDPI)", "Urganch davlat universiteti (UrDU)", "Farg'ona davlat universiteti (FarDU)", "Farg'ona politexnika instituti (FarPI)", "Farg'ona jamoat salomatligi tibbiyot instituti", "Andijon davlat universiteti (ADU)", "Andijon davlat tibbiyot instituti (ADTI)", "Andijon mashinasozlik instituti (AndMI)", "Namangan davlat universiteti (NamDU)", "Namangan muhandislik-qurilish instituti (NamMQI)", "Qarshi davlat universiteti (QarDU)", "Qarshi muhandislik-iqtisodiyot instituti (QarMII)", "Termiz davlat universiteti (TerDU)", "Jizzax davlat pedagogika universiteti (JDPU)", "Jizzax politexnika instituti (JizPI)", "Guliston davlat universiteti (GulDU)", "Qoraqalpoq davlat universiteti (QDU)", "Nukus davlat pedagogika instituti (NDPI)", "Boshqa (O'zim kiritaman)" ];

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

// 🌟 QO'SHILDI: Maxfiylik siyosati matni
const PrivacyPolicyText = () => (
  <div className="space-y-4">
    <p className="font-bold">Amal qilish sanasi: [01.10.2026]<br/>Oxirgi yangilanish: [01.10.2026]</p>
    <p>TalabaPass ("TalabaPass", "biz", "bizning") foydalanuvchilarning shaxsiy ma'lumotlarini himoya qilishga jiddiy yondashadi. Ushbu Maxfiylik siyosati TalabaPass mobil ilovasi, veb-sayti va ular bilan bog'liq xizmatlardan foydalanish jarayonida foydalanuvchilarning shaxsga doir ma'lumotlari qanday yig'ilishi, ishlatilishi, saqlanishi va himoya qilinishini tushuntiradi. TalabaPass ushbu siyosatni O'zbekiston Respublikasining amaldagi qonunchiligi, shu jumladan "Shaxsga doir ma'lumotlar to'g'risida"gi Qonun talablarini hisobga olgan holda qo'llaydi.</p>
    
    <h4 className="font-bold text-[hsl(var(--foreground))] text-base">1. Biz haqimizda</h4>
    <p>TalabaPass xizmatining operatori:<br/>Yuridik nomi: [TALABAPASS MCHJning to'liq nomi]<br/>STIR: [STIR]<br/>Yuridik manzil: [yuridik manzil]<br/>Elektron pochta: [email]<br/>Telefon: [telefon raqami]<br/>Ushbu hujjatda ushbu tashkilot "TalabaPass" yoki "Operator" deb yuritiladi.</p>
    
    <h4 className="font-bold text-[hsl(var(--foreground))] text-base">2. Qanday ma'lumotlarni yig'ishimiz mumkin?</h4>
    <p className="font-semibold text-[hsl(var(--foreground))]">2.1. Foydalanuvchi taqdim etadigan ma'lumotlar</p>
    <p>Ro'yxatdan o'tish yoki xizmatlardan foydalanish vaqtida:</p>
    <ul className="list-disc pl-5 space-y-1">
      <li>ism va familiya;</li>
      <li>telefon raqami;</li>
      <li>elektron pochta manzili;</li>
      <li>tug'ilgan sana yoki yosh;</li>
      <li>ta'lim muassasasi;</li>
      <li>talabalik maqomini tasdiqlovchi ma'lumotlar;</li>
      <li>profil rasmi, agar foydalanuvchi uni o'zi yuklasa;</li>
      <li>foydalanuvchi tomonidan ixtiyoriy ravishda kiritilgan boshqa ma'lumotlar.</li>
    </ul>
    
    <p className="font-semibold text-[hsl(var(--foreground))] mt-2">2.2. Avtomatik ravishda olinadigan ma'lumotlar</p>
    <p>Ilova yoki veb-saytdan foydalanilganda texnik ma'lumotlarning ayrimlari avtomatik ravishda qayd etilishi mumkin (qurilma turi, IP manzil, operatsion tizim va h.k.).</p>

    <h4 className="font-bold text-[hsl(var(--foreground))] text-base">3. Ma'lumotlardan foydalanish maqsadlari</h4>
    <ul className="list-disc pl-5 space-y-1">
      <li>foydalanuvchi akkauntini yaratish va boshqarish;</li>
      <li>foydalanuvchini identifikatsiya qilish;</li>
      <li>talabalik maqomini tekshirish va chegirmalar taqdim etish;</li>
      <li>firibgarlik va noqonuniy harakatlarning oldini olish.</li>
    </ul>

    <h4 className="font-bold text-[hsl(var(--foreground))] text-base">4. Shaxsiy ma'lumotlarni uchinchi shaxslarga berish</h4>
    <p>TalabaPass foydalanuvchining shaxsiy ma'lumotlarini uning roziligisiz yoki qonuniy asos bo'lmagan holda uchinchi shaxslarga sotmaydi. Faqatgina chegirma xizmatini ko'rsatuvchi hamkorlarga tegishli chegirma taqdim etish uchungina kerakli ma'lumotlar uzatiladi.</p>

    <h4 className="font-bold text-[hsl(var(--foreground))] text-base">5. Foydalanuvchining huquqlari va akkauntni o'chirish</h4>
    <p>Foydalanuvchi amaldagi qonunchilikka muvofiq o'z ma'lumotlarini o'chirish, aniqlashtirish va yangilash huquqiga ega. Akkaunt o'chirilganda ma'lumotlar tizimdan butunlay olib tashlanadi (qonun talab qiladigan hollar bundan mustasno).</p>
    <br/><br/>
  </div>
);

// 🌟 QO'SHILDI: Foydalanish shartlari matni
const TermsOfUseText = () => (
  <div className="space-y-4">
    <p className="font-bold">Amal qilish sanasi: [01.10.2026]<br/>Oxirgi yangilanish: [01.10.2026]</p>
    <p>TalabaPass mobil ilovasi, veb-sayti va boshqa raqamli xizmatlaridan foydalanishdan oldin ushbu Foydalanish shartlarini diqqat bilan o'qib chiqing. TalabaPass xizmatlaridan foydalanish orqali foydalanuvchi ushbu Shartlarni qabul qilgan hisoblanadi.</p>

    <h4 className="font-bold text-[hsl(var(--foreground))] text-base">1. Umumiy qoidalar</h4>
    <p>TalabaPass — talabalar uchun turli tashkilot va bizneslar tomonidan taqdim etiladigan chegirmalar, maxsus takliflar va boshqa imtiyozlarni bir joyda topish va ulardan foydalanishga yordam beruvchi raqamli platforma.</p>

    <h4 className="font-bold text-[hsl(var(--foreground))] text-base">2. Ro'yxatdan o'tish va Talabalikni tasdiqlash</h4>
    <p>TalabaPass'dan foydalanish uchun foydalanuvchidan akkaunt yaratish va haqiqiy ma'lumotlarni kiritish talab qilinadi. Talabalikni tasdiqlash uchun yolg'on, soxta yoki boshqa shaxsga tegishli hujjat va ma'lumotlardan foydalanish qat'iyan taqiqlanadi.</p>

    <h4 className="font-bold text-[hsl(var(--foreground))] text-base">3. Chegirmalar va hamkorlarning takliflari</h4>
    <p>TalabaPass platformasida ko'rsatilgan chegirmalar va takliflarning asosiy shartlari tegishli Hamkor (biznes) tomonidan belgilanadi. TalabaPass chegirmalar miqdori yoki shartlari to'satdan o'zgartirilishi uchun to'g'ridan-to'g'ri javobgar emas.</p>

    <h4 className="font-bold text-[hsl(var(--foreground))] text-base">4. Taqiqlangan harakatlar</h4>
    <ul className="list-disc pl-5 space-y-1">
      <li>soxta akkaunt yaratish yoki boshqa shaxs nomidan foydalanish;</li>
      <li>chegirmalardan noqonuniy foydalanish;</li>
      <li>platformaning texnik tizimlariga zarar yetkazishga urinish;</li>
      <li>boshqa foydalanuvchilar yoki Hamkorlarga nisbatan tahdid yoki haqorat.</li>
    </ul>

    <h4 className="font-bold text-[hsl(var(--foreground))] text-base">5. Akkauntni cheklash yoki to'xtatish</h4>
    <p>Agar foydalanuvchi ushbu Shartlarni buzsa yoki platformadan noqonuniy foydalanishda gumon qilinsa, TalabaPass akkauntni vaqtincha cheklash yoki butunlay bloklash huquqiga ega.</p>
    <br/><br/>
  </div>
);

export default function SignupPage() {
  const { t, lang, setLang } = useLanguage();
  
  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem('studentSignupStep');
    return saved ? parseInt(saved) : 1;
  });

  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem('studentSignupData');
    return savedData ? JSON.parse(savedData) : { fullName: '', studentId: '', university: '', password: '', confirmPassword: '' };
  });

  useEffect(() => {
    localStorage.setItem('studentSignupStep', step.toString());
  }, [step]);

  useEffect(() => {
    localStorage.setItem('studentSignupData', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && step < 5) {
        setStep(5);
      }
    });
  }, []);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // 🌟 QO'SHILDI: Shartlarga rozilik (Checkbox) va Modal state'lari
  const [isAgreed, setIsAgreed] = useState(false);
  const [openDoc, setOpenDoc] = useState<'privacy' | 'terms' | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  
  const [isApproved, setIsApproved] = useState(false);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

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

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0, 0, croppedAreaPixels.width, croppedAreaPixels.height
      );

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => { if (b) resolve(b); else reject(new Error('Canvas is empty')); }, 'image/jpeg', 0.9);
      });

      const file = new File([blob], 'avatar_photo.jpg', { type: 'image/jpeg' });
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(blob));
    } catch (error) {
      setError("Rasmni qayta ishlashda xatolik yuz berdi.");
    }
  };

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDocumentFile(file);
      setDocumentPreview(URL.createObjectURL(file));
      if (isCameraOpen) stopCamera(); 
    }
  };

  const filteredUnis = UNIVERSITIES.filter(u => u.toLowerCase().includes(uniSearch.toLowerCase()));
  const strength = getPasswordStrength(formData.password);

  const startCamera = async () => {
    setError(''); setDocumentFile(null); setDocumentPreview(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Qurilmangiz kamerani qabul qilmadi. Xavfsiz ulanish (HTTPS) talab qilinadi."); return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCameraStream(stream); setIsCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(e => console.log(e)); }
      }, 100);
    } catch (err) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraStream(stream); setIsCameraOpen(true);
        setTimeout(() => {
          if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(e => console.log(e)); }
        }, 100);
      } catch (err2) { setError("Kameraga ruxsat berilmadi yoki qurilmada xatolik yuz berdi."); }
    }
  };

  const stopCamera = useCallback(() => {
    if (cameraStream) { cameraStream.getTracks().forEach(track => track.stop()); setCameraStream(null); setIsCameraOpen(false); }
  }, [cameraStream]);

  useEffect(() => { return () => stopCamera(); }, [stopCamera]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current; const canvas = canvasRef.current;
      if (video.videoWidth === 0) return;
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "id_card_photo.jpg", { type: "image/jpeg" });
            setDocumentFile(file); setDocumentPreview(URL.createObjectURL(blob)); stopCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  useEffect(() => {
    let interval: any;
    if (step === 5) {
      const checkApprovalStatus = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase.from('students').select('is_active').eq('id', user.id).single();
          if (data && data.is_active === true) {
            setIsApproved(true); clearInterval(interval);
            setTimeout(() => { setStep(6); }, 2000);
          }
        }
      };
      interval = setInterval(checkApprovalStatus, 5000);
    }
    return () => clearInterval(interval);
  }, [step]);

  const nextStep = async () => {
    if (step === 1) { setStep(2); return; }
    
    if (step === 2) {
      const nameParts = formData.fullName.trim().split(' ');
      if (nameParts.length < 2) { setError("Iltimos, ism va familiyangizni to'liq kiriting"); return; }
      setStep(3); return;
    }

    if (step === 3) {
      if (!formData.studentId || !formData.university) { setError("Barcha maydonlarni to'ldiring"); return; }
      if (strength.score < 5) { setError("Parol yetarlicha kuchli emas!"); return; }
      if (formData.password !== formData.confirmPassword) { setError("Parollar mos kelmadi!"); return; }
      
      // 🌟 QO'SHILDI: Rozilik belgisi tekshiruvi
      if (!isAgreed) { setError("Foydalanish shartlari va Maxfiylik siyosatiga rozi bo'lishingiz kerak!"); return; }

      setIsLoading(true); setError('');
      try {
        const { data } = await supabase.from('students').select('student_id').eq('student_id', formData.studentId).maybeSingle();
        if (data) throw new Error("Bu Talaba ID allaqachon ro'yxatdan o'tgan!");
        setStep(4);
      } catch (err: any) { setError(err.message); } 
      finally { setIsLoading(false); }
    }

    if (step === 4) {
      if (!documentFile) { setError("Iltimos, avval talabalik guvohnomangizni yuklang yoki rasmga oling!"); return; }
      if (!formData.password || !formData.studentId) {
        setError("Ma'lumotlar yo'qolgan (Kamera ishga tushganda brauzer sahifani yangilagan). Iltimos oldingi qadamga qaytib parolingizni kiritib o'ting.");
        return;
      }
      setIsLoading(true); setError('');
      try {
        const fakeEmail = `${formData.studentId.toLowerCase()}@talabapass.uz`;
        const { data: authData, error: authError } = await supabase.auth.signUp({ email: fakeEmail, password: formData.password });

        if (authError) {
          if (authError.message.includes('already registered')) throw new Error("Siz avval ro'yxatdan o'tishga uringansiz. Admin tozalashini kuting yoki Login qiling.");
          throw new Error(authError.message);
        }
        if (!authData.user) throw new Error("Foydalanuvchini yaratib bo'lmadi.");
        const userId = authData.user.id;

        const fileExt = documentFile.name.split('.').pop() || 'jpg';
        const fileName = `doc-${userId}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, documentFile);
        if (uploadError) throw new Error("Hujjatni yuklashda xatolik yuz berdi");

        const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(fileName);
        const nameParts = formData.fullName.trim().split(' ');
        
        const { error: dbError } = await supabase.from('students').insert([{
            id: userId, first_name: nameParts[0], last_name: nameParts.slice(1).join(' '),
            student_id: formData.studentId, university: formData.university, is_active: false,
            avatar_url: null, document_url: publicUrlData.publicUrl
        }]);

        if (dbError) throw dbError;
        setStep(5);
      } catch (err: any) { setError(err.message); } 
      finally { setIsLoading(false); }
    }
  };

  const prevStep = () => {
    if (step === 4) stopCamera();
    if (step === 5 || step === 6) return;
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const finishSignup = () => {
    localStorage.removeItem('studentSignupStep');
    localStorage.removeItem('studentSignupData');
    window.location.href = '/'; 
  };

  const handleFinish = async () => {
    setIsLoading(true); setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessiya topilmadi.");

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop() || 'jpg';
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, avatarFile, { upsert: true });
        if (uploadError) throw new Error("Rasmni saqlashda xatolik");

        const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
        await supabase.from('students').update({ avatar_url: publicUrlData.publicUrl }).eq('id', user.id);
      }
      finishSignup();
    } catch (err: any) { setError(err.message); setIsLoading(false); }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[hsl(var(--background))] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-[hsl(var(--secondary))] z-50">
        <div className="h-full bg-[hsl(var(--accent))] transition-all duration-500 ease-out rounded-r-full" style={{ width: `${(step / 6) * 100}%` }} />
      </div>

      <div className="flex items-center justify-between px-6 pt-8 pb-4 shrink-0 relative z-10">
        {step > 1 && step < 5 ? (
          <button onClick={prevStep} className="p-2 -ml-2 rounded-full hover:bg-[hsl(var(--secondary))] transition-colors text-[hsl(var(--muted-foreground))]">
            <ArrowLeft size={22} />
          </button>
        ) : <div className="w-10"></div>}
        <div className="text-xs font-bold text-[hsl(var(--muted-foreground))] tracking-widest uppercase">{step} / 6 QADAM</div>
      </div>

      <div className="flex-1 flex flex-col px-6 max-w-md w-full mx-auto pb-10 relative z-10">
        
        {/* QADAM 1 */}
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
             <button onClick={nextStep} className="mt-auto flex w-full justify-center gap-2 rounded-full bg-[hsl(var(--primary))] py-4 text-base font-bold text-[hsl(var(--primary-foreground))] shadow-float active:scale-95 transition-all">
               Davom etish <ArrowRight size={18} />
             </button>
           </div>
        )}

        {/* QADAM 2 */}
        {step === 2 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-300 flex-1 flex flex-col">
             <div className="mt-4 mb-6"><h2 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">O'zingizni tanishtiring</h2></div>
             <div className="space-y-4">
               <div>
                 <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-2 mb-1.5 block">
                   To'liq ismingiz (Ism va Familiya)
                 </label>
                 <div className="relative">
                   <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={20} />
                   <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="" required className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-4 pl-12 pr-4 rounded-2xl text-sm font-semibold outline-none focus:border-[hsl(var(--accent))] text-[hsl(var(--foreground))] transition-all" />
                 </div>
               </div>
               {error && <p className="text-red-500 text-sm font-semibold ml-2">{error}</p>}
             </div>
             <div className="mt-auto flex flex-col gap-3">
               <div className="text-center mb-2">
                 <p className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">
                   Allaqachon hisobingiz bormi?{' '}
                   <Link href="/login">
                     <span className="text-[hsl(var(--primary))] cursor-pointer hover:underline">Kirish</span>
                   </Link>
                 </p>
               </div>
               <Link href="/merchant/signup">
                 <div className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[hsl(var(--secondary))] py-4 text-base font-bold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent)/.1)] hover:text-[hsl(var(--accent))] transition-all shadow-sm">
                   <Store size={18} /> Biznes sifatida ro'yxatdan o'tish
                 </div>
               </Link>
               <button type="button" onClick={nextStep} className="flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] py-4 text-base font-bold text-[hsl(var(--primary-foreground))] shadow-float active:scale-95 transition-all">
                 Keyingisi <ArrowRight size={18} />
               </button>
             </div>
          </div>
        )}

        {/* 🌟 QADAM 3 - YANGILANGAN: CHECKBOX QO'SHILDI */}
        {step === 3 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-300 flex-1 flex flex-col">
             <div className="mt-4 mb-6"><h2 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">Talaba ma'lumotlari</h2></div>
             <div className="space-y-4 mb-4">
               
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
                     </div>
                   </div>
                 )}
               </div>

               <div>
                 <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-2 mb-1.5 block">Murakkab Parol</label>
                 <div className="relative">
                   <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={20} />
                   <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Pa$$w0rd!" className="w-full rounded-2xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] py-4 pl-12 pr-12 font-semibold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--accent))]" />
                   <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors outline-none">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                 </div>
                 {formData.password && (
                   <div className="mt-2 px-2">
                     <div className="flex justify-between items-center mb-1 text-[10px] font-bold uppercase text-[hsl(var(--muted-foreground))]">
                       <span>Xavfsizlik</span>
                       <span className={strength.text === 'Oson' ? 'text-red-500' : strength.text === "O'rtacha" ? 'text-yellow-500' : strength.text === 'Kuchli' ? 'text-green-500' : ''}>{strength.text}</span>
                     </div>
                     <div className="h-1.5 w-full bg-[hsl(var(--secondary))] rounded-full overflow-hidden flex">
                       <div className={`h-full transition-all duration-300 ease-out ${strength.color}`} style={{ width: strength.width }}></div>
                     </div>
                   </div>
                 )}
               </div>

               <div>
                 <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-2 mb-1.5 block">Parolni tasdiqlang</label>
                 <div className="relative">
                   <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={20} />
                   <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Qayta kiriting" className="w-full rounded-2xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] py-4 pl-12 pr-12 font-semibold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--accent))]" />
                   <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors outline-none">{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                 </div>
               </div>

               {/* 🌟 YANGI: CHECKBOX QISMI */}
               <div className="pt-2">
                 <label className="flex items-start gap-3 cursor-pointer group">
                   <div className="relative flex items-center justify-center mt-0.5">
                     <input 
                       type="checkbox" 
                       checked={isAgreed} 
                       onChange={(e) => { setIsAgreed(e.target.checked); setError(''); }} 
                       className="peer sr-only" 
                     />
                     <div className="w-5 h-5 rounded border-2 border-[hsl(var(--muted-foreground))] bg-transparent peer-checked:bg-[hsl(var(--primary))] peer-checked:border-[hsl(var(--primary))] transition-all flex items-center justify-center">
                       <Check size={14} className="text-[hsl(var(--primary-foreground))] opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3.5} />
                     </div>
                   </div>
                   <p className="text-[13px] text-[hsl(var(--muted-foreground))] leading-tight">
                     Men <span onClick={(e) => { e.preventDefault(); setOpenDoc('terms'); }} className="text-[hsl(var(--primary))] font-bold hover:underline">Foydalanish shartlari</span> va <span onClick={(e) => { e.preventDefault(); setOpenDoc('privacy'); }} className="text-[hsl(var(--primary))] font-bold hover:underline">Maxfiylik siyosati</span> bilan tanishib chiqdim va rozi bo'laman.
                   </p>
                 </label>
               </div>

               {error && <p className="text-red-500 text-[13px] font-semibold ml-1">{error}</p>}
             </div>
             
             {/* Tugma faqat rozi bo'lganda faollashadi */}
             <button disabled={isLoading || !isAgreed} onClick={nextStep} className="mt-auto flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] py-4 text-base font-bold text-[hsl(var(--primary-foreground))] shadow-float active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100">
               {isLoading ? <Loader2 className="animate-spin" /> : <>Davom etish <ArrowRight size={18} /></>}
             </button>
          </div>
        )}

        {/* QADAM 4 */}
        {step === 4 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-300 flex-1 flex flex-col items-center justify-center relative">
             <div className="text-center mb-6 mt-4">
               <h2 className="font-display text-3xl font-bold text-[hsl(var(--foreground))] mb-2">Talaba ID yoki Guvohnoma</h2>
               <p className="text-sm text-[hsl(var(--muted-foreground))] px-4">Talabalik guvohnomangizni rasmga oling yoki elektron versiyasini (screenshot) yuklang.</p>
             </div>

             <input type="file" ref={documentInputRef} onChange={handleDocumentUpload} accept="image/*" className="hidden" />

             <div className="relative w-full max-w-sm aspect-[4/3] bg-black rounded-[32px] overflow-hidden shadow-xl mb-6">
               {!documentPreview && !isCameraOpen && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-[hsl(var(--secondary))] border-4 border-dashed border-[hsl(var(--border))]">
                   <IdCard size={48} className="opacity-50 mb-6 text-[hsl(var(--muted-foreground))]" />
                   <div className="flex flex-col gap-3 w-full px-8">
                     <button onClick={startCamera} className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold py-3 px-6 rounded-full shadow-lg active:scale-95 transition-all w-full flex items-center justify-center gap-2">
                       <Camera size={20} /> Kamerani yoqish
                     </button>
                     <button onClick={() => documentInputRef.current?.click()} className="bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border-2 border-[hsl(var(--border))] font-bold py-3 px-6 rounded-full shadow-sm active:scale-95 transition-all w-full flex items-center justify-center gap-2">
                       <FileImage size={20} /> Galeriyadan yuklash
                     </button>
                   </div>
                 </div>
               )}
               
               {isCameraOpen && (
                 <>
                   <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover bg-black" />
                   <button onClick={stopCamera} className="absolute top-4 right-4 z-30 bg-black/40 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/60 transition-colors">
                     <X size={20} />
                   </button>
                   <div className="absolute inset-0 pointer-events-none z-10 border-[40px] border-black/60 flex items-center justify-center">
                     <div className="w-full h-full border-2 border-dashed border-white/60 rounded-xl relative">
                       <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-white text-[10px] uppercase font-bold tracking-widest shadow-black drop-shadow-md">Hujjatni romga kiriting</div>
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
                   <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 opacity-0 hover:opacity-100 transition-opacity">
                     <button onClick={startCamera} className="bg-white text-black font-bold py-2.5 px-6 rounded-full shadow-lg text-sm flex items-center gap-2">
                       <Camera size={16} /> Kamera orqali
                     </button>
                     <button onClick={() => documentInputRef.current?.click()} className="bg-white/20 text-white border border-white/50 backdrop-blur-sm font-bold py-2.5 px-6 rounded-full shadow-lg text-sm flex items-center gap-2">
                       <FileImage size={16} /> Boshqa rasm yuklash
                     </button>
                   </div>
                 </>
               )}
             </div>
             <canvas ref={canvasRef} className="hidden" />
             {error && <p className="text-red-500 text-[13px] font-bold mb-4 text-center px-4">{error}</p>}
             <button disabled={isLoading || !documentFile} onClick={nextStep} className="mt-auto flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] py-4 text-base font-bold text-[hsl(var(--primary-foreground))] shadow-float active:scale-95 transition-all disabled:opacity-50">
               {isLoading ? <Loader2 className="animate-spin" /> : <>Saqlash va Davom etish <ArrowRight size={18}/></>}
             </button>
          </div>
        )}

        {/* QADAM 5 */}
        {step === 5 && (
          <div className="animate-in zoom-in-95 duration-500 flex-1 flex flex-col items-center justify-center text-center">
            {isApproved ? (
              <div className="animate-in fade-in zoom-in duration-300">
                <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-500/20 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                  <CheckCircle2 size={48} strokeWidth={2.5} />
                </div>
                <h2 className="font-display text-3xl font-bold text-[hsl(var(--foreground))] mb-3">Tasdiqlandi!</h2>
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Ma'lumotlaringiz muvaffaqiyatli qabul qilindi.</p>
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
                <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] mb-3">Tekshirilmoqda</h2>
                <p className="text-[13px] text-[hsl(var(--muted-foreground))] leading-relaxed max-w-[280px] mx-auto px-2">
                  Arizangiz administratorga yuborildi. Odatda tekshiruv jarayoni <b>10-30 daqiqa</b> vaqt oladi.
                  <br/><br/>
                  Iltimos, ushbu oynadan chiqmang. Tasdiqlangach avtomatik keyingi bosqichga o'tkazilasiz.
                </p>
              </>
            )}
          </div>
        )}

        {/* QADAM 6 */}
        {step === 6 && (
          <div className="animate-in slide-in-from-bottom-8 fade-in duration-500 flex-1 flex flex-col items-center justify-center">
            <div className="text-center mb-10 mt-auto">
              <h2 className="font-display text-3xl font-bold text-[hsl(var(--foreground))] mb-2">Profil rasmi</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Dasturda chiroyli ko'rinishi uchun <br/> yuzingiz ko'ringan rasm yuklang.
              </p>
            </div>
            <div className="relative group mb-auto">
              <input type="file" ref={avatarInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
              <div onClick={() => avatarInputRef.current?.click()} className="grid h-40 w-40 cursor-pointer place-items-center overflow-hidden rounded-full bg-[hsl(var(--secondary))] border-4 border-dashed border-[hsl(var(--border))] hover:border-[hsl(var(--accent))] transition-all">
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
                  <button disabled={isLoading} onClick={finishSignup} className="py-3 text-sm font-bold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors disabled:opacity-50">
                    {isLoading ? 'Ilovaga kirilmoqda...' : "Hozircha o'tkazib yuborish"}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

      </div>
      
      {/* RASMNI QIRQISH UCHUN MODAL OYNA */}
      {selectedImage && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-black/95 backdrop-blur-md">
          <div className="relative flex-1 w-full mt-10">
            <Cropper
              image={selectedImage}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(croppedArea, pixels) => setCroppedAreaPixels(pixels)}
            />
          </div>
          <div className="p-6 pb-12 bg-black flex flex-col gap-6 items-center">
            <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="w-full max-w-xs accent-[hsl(var(--primary))]" />
            <div className="flex w-full max-w-xs gap-4">
              <button onClick={() => setSelectedImage(null)} className="flex-1 py-3.5 font-bold rounded-2xl text-white bg-white/20 hover:bg-white/30 transition-colors">Bekor qilish</button>
              <button onClick={handleCropSave} className="flex-1 py-3.5 font-bold rounded-2xl text-[hsl(var(--primary-foreground))] bg-[hsl(var(--primary))] hover:brightness-110 transition-all flex justify-center items-center gap-2">Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 QO'SHILDI: HUJJATLARNI O'QISH UCHUN MODAL OYNA */}
      {openDoc && (
        <div className="fixed inset-0 z-[80] flex flex-col bg-[hsl(var(--background))] animate-in slide-in-from-bottom-8 duration-300">
           <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
             <h3 className="font-display font-bold text-lg text-[hsl(var(--foreground))]">
               {openDoc === 'privacy' ? 'Maxfiylik siyosati' : 'Foydalanish shartlari'}
             </h3>
             <button onClick={() => setOpenDoc(null)} className="p-2 bg-[hsl(var(--secondary))] rounded-full text-[hsl(var(--foreground))] hover:bg-[hsl(var(--border))] transition-colors">
               <X size={20} />
             </button>
           </div>
           <div className="flex-1 overflow-y-auto p-5 text-[14px] text-[hsl(var(--muted-foreground))] leading-relaxed">
              {openDoc === 'privacy' ? <PrivacyPolicyText /> : <TermsOfUseText />}
           </div>
        </div>
      )}

    </div>
  );
}