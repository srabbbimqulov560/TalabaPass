import { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, UserRound, ScanBarcode, Rotate3d, LogOut, Camera, 
  LockKeyhole, ChevronRight, Globe, Moon, Shield, CircleHelp, CheckCircle2, Circle, Loader2
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/lib/useUser'; 
import { useQueryClient } from '@tanstack/react-query';

function initials(firstName?: string, lastName?: string) { 
  if (firstName && lastName) return (firstName[0] + lastName[0]).toUpperCase();
  return 'SP'; 
}

export default function ProfilePage() {
  const { t, lang, setLang } = useLanguage();
  const queryClient = useQueryClient();
  
  const { data: user, isLoading: isUserLoading, updateAvatar } = useUser();
  
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'id' | 'settings'>('id');
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark');
  });
  const [isPrivateAccount, setIsPrivateAccount] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkTheme]);

  // YAKKA SHU FUNKSIYA TO'G'RILANDI: Rasm saqlash xatosi
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return; // localStorage o'rniga hook orqali kelgan 'user' ni tekshiramiz

    try {
      setIsUploading(true);
      
      const localUrl = URL.createObjectURL(file);
      if (updateAvatar) updateAvatar(localUrl);

      // XATOLIK SABABI: token o'rniga haqiqiy user.id ishlatamiz
      const userId = user.id;

      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${userId}-${Date.now()}.${fileExt}`; // Math.random() o'rniga Date.now() ishonchliroq

      // upsert: true qo'shildi - eski rasm o'rniga muammosiz yozishi uchun
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const newAvatarUrl = publicUrlData.publicUrl;

      // To'g'ri userId bilan bazani yangilaymiz
      const { error: updateError } = await supabase
        .from('students')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', userId);

      if (updateError) throw updateError;
      
      if (updateAvatar) updateAvatar(newAvatarUrl);

    } catch (error) {
      console.error("Rasm yuklashda xatolik:", error);
      alert("Rasm yuklashda xatolik yuz berdi. Iltimos qaytadan urining.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut(); 
    queryClient.clear(); 
    window.location.href = '/login';
  };

  const handleLangSelect = (selectedLang: 'uz' | 'en' | 'ru') => {
    setLang(selectedLang);
    setIsLangModalOpen(false);
  };

  const avatar = user?.avatar_url;
  const fullName = user ? `${user.first_name} ${user.last_name}` : (isUserLoading ? 'Yuklanmoqda...' : 'Talaba');

  return (
    <>
      <div className="page-enter flex flex-col items-center pb-10 min-h-screen">
        
        <div className="relative mt-10 w-full max-w-[380px] rounded-[30px] bg-[hsl(var(--card))] border border-[hsl(var(--card-border))] p-6 shadow-soft pt-14 flex flex-col items-center">
          
          <div className="absolute -top-14">
            <div className="relative group">
              <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" disabled={isUploading} />
              <div 
                onClick={() => !isUploading && fileInputRef.current?.click()} 
                className={`grid h-28 w-28 cursor-pointer place-items-center overflow-hidden rounded-full bg-[hsl(var(--primary))] border-4 border-[hsl(var(--background))] font-display text-4xl font-bold text-[hsl(var(--primary-foreground))] shadow-md transition-all ${isUploading ? 'opacity-50' : 'group-hover:opacity-80'}`}
              >
                {isUploading ? (
                   <Loader2 className="animate-spin text-white" size={32} />
                ) : avatar ? (
                  <img src={avatar} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  initials(user?.first_name, user?.last_name)
                )}
              </div>
              <button 
                onClick={() => !isUploading && fileInputRef.current?.click()} 
                className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full border-[3px] border-[hsl(var(--background))] bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] shadow-sm"
              >
                <Camera size={14} />
              </button>
            </div>
          </div>
          
          <div className="flex flex-col items-center mt-2 text-center">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))]">{fullName}</h2>
              {user?.is_verified && (
                <span className="flex items-center gap-1 rounded-full bg-[hsl(var(--accent)/.15)] px-2 py-1 text-[10px] font-bold text-[hsl(var(--accent))]">
                  <ShieldCheck size={12} /> {t('verified')}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              {user?.university || 'Talaba'}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] bg-[hsl(var(--secondary))] px-4 py-2 rounded-full">
              <LockKeyhole size={14} /> {t('student_id')} 
              <span className="font-mono font-bold text-[hsl(var(--foreground))] ml-1">{user?.student_id || '•••• ••••'}</span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-[380px]">
          <hr className="border-t border-[hsl(var(--border))] my-6" />
          
          <div className="flex bg-[hsl(var(--secondary))] rounded-full p-1.5 mb-6">
            <button 
              onClick={() => setActiveTab('id')} 
              className={`flex-1 py-3 text-sm font-bold rounded-full transition-all ${activeTab === 'id' ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-md' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}
            >
              Student ID
            </button>
            <button 
              onClick={() => setActiveTab('settings')} 
              className={`flex-1 py-3 text-sm font-bold rounded-full transition-all ${activeTab === 'settings' ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-md' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}
            >
              {t('settings')}
            </button>
          </div>
        </div>

        {activeTab === 'id' ? (
          <StudentCard user={user} avatar={avatar} t={t} fullName={fullName} />
        ) : (
          <div className="w-full max-w-[380px] flex flex-col page-enter pb-10">
            
            <div className="bg-[hsl(var(--card))] rounded-[24px] border border-[hsl(var(--card-border))] overflow-hidden flex flex-col shadow-soft">
              
              <div onClick={() => setIsLangModalOpen(true)} className="flex items-center justify-between p-4 cursor-pointer hover:bg-[hsl(var(--secondary)/.5)] transition-colors border-b border-[hsl(var(--border))]">
                <div className="flex items-center gap-3">
                  <Globe size={22} className="text-[hsl(var(--foreground))]" />
                  <span className="text-[15px] font-semibold text-[hsl(var(--foreground))]">{t('change_language')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">
                    {lang === 'uz' ? "UZ O'zbek" : lang === 'ru' ? "RU Русский" : "GB English"}
                  </span>
                  <ChevronRight size={20} className="text-[hsl(var(--muted-foreground))]" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
                <div className="flex items-center gap-3">
                  <Moon size={22} className="text-[hsl(var(--foreground))]" />
                  <span className="text-[15px] font-semibold text-[hsl(var(--foreground))]">{t('dark_mode')}</span>
                </div>
                <div onClick={() => setIsDarkTheme(!isDarkTheme)} className={`w-12 h-6.5 rounded-full p-1 cursor-pointer transition-colors ${isDarkTheme ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--muted))]'}`}>
                  <div className={`w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform ${isDarkTheme ? 'translate-x-5.5' : 'translate-x-0'}`} />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
                <div className="flex items-center gap-3">
                  <Shield size={22} className="text-[hsl(var(--foreground))]" />
                  <div>
                    <div className="text-[15px] font-semibold text-[hsl(var(--foreground))]">{t('private_account')}</div>
                    <div className="text-[11px] text-[hsl(var(--muted-foreground))] leading-tight mt-0.5">
                      {isPrivateAccount ? t('on') : t('off_status')}
                    </div>
                  </div>
                </div>
                <div onClick={() => setIsPrivateAccount(!isPrivateAccount)} className={`w-12 h-6.5 rounded-full p-1 cursor-pointer transition-colors ${isPrivateAccount ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--muted))]'}`}>
                  <div className={`w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform ${isPrivateAccount ? 'translate-x-5.5' : 'translate-x-0'}`} />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-[hsl(var(--secondary)/.5)] transition-colors border-b border-[hsl(var(--border))]">
                <div className="flex items-center gap-3">
                  <CircleHelp size={22} className="text-[hsl(var(--foreground))]" />
                  <span className="text-[15px] font-semibold text-[hsl(var(--foreground))]">{t('help_support')}</span>
                </div>
                <ChevronRight size={20} className="text-[hsl(var(--muted-foreground))]" />
              </div>

              <div onClick={handleLogout} className="flex items-center justify-between p-4 cursor-pointer hover:bg-red-500/10 transition-colors">
                <div className="flex items-center gap-3">
                  <LogOut size={22} className="text-red-500" />
                  <span className="text-[15px] font-semibold text-red-500">{t('logout')}</span>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {isLangModalOpen && (
        <div className="fixed inset-0 z-[45] flex flex-col justify-end" style={{ height: '100dvh' }}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsLangModalOpen(false)} />
          <div className="relative bg-[hsl(var(--card))] rounded-t-[32px] p-6 pb-[100px] animate-in slide-in-from-bottom-full duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] border-t border-[hsl(var(--border))]">
            <div className="w-10 h-1.5 bg-[hsl(var(--muted))] rounded-full mx-auto mb-6" />
            <h3 className="font-display text-xl font-bold mb-5 px-2 text-[hsl(var(--foreground))]">{t('select_language')}</h3>
            
            <div className="flex flex-col gap-3">
              <div onClick={() => handleLangSelect('uz')} className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer border transition-colors ${lang === 'uz' ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/.1)]' : 'border-transparent bg-[hsl(var(--secondary))]'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇺🇿</span>
                  <span className="text-base font-semibold text-[hsl(var(--foreground))]">O'zbek</span>
                </div>
                {lang === 'uz' ? <CheckCircle2 size={24} className="text-[hsl(var(--accent))]" /> : <Circle size={24} className="text-[hsl(var(--muted-foreground))]" />}
              </div>
              <div onClick={() => handleLangSelect('ru')} className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer border transition-colors ${lang === 'ru' ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/.1)]' : 'border-transparent bg-[hsl(var(--secondary))]'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇷🇺</span>
                  <span className="text-base font-semibold text-[hsl(var(--foreground))]">Русский</span>
                </div>
                {lang === 'ru' ? <CheckCircle2 size={24} className="text-[hsl(var(--accent))]" /> : <Circle size={24} className="text-[hsl(var(--muted-foreground))]" />}
              </div>
              <div onClick={() => handleLangSelect('en')} className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer border transition-colors ${lang === 'en' ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/.1)]' : 'border-transparent bg-[hsl(var(--secondary))]'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇬🇧</span>
                  <span className="text-base font-semibold text-[hsl(var(--foreground))]">English</span>
                </div>
                {lang === 'en' ? <CheckCircle2 size={24} className="text-[hsl(var(--accent))]" /> : <Circle size={24} className="text-[hsl(var(--muted-foreground))]" />}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function StudentCard({ user, avatar, t, fullName }: any) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="flex flex-col items-center pb-10 page-enter w-full">
      <div 
        className="group h-[220px] w-full max-w-[360px] [perspective:1000px] cursor-pointer"
        onClick={() => setFlipped(!flipped)}
      >
        <div className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}>
          
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#1a2b4c] to-[#121c32] p-5 text-white shadow-float [backface-visibility:hidden] border border-[hsl(var(--accent)/.3)]">
             <div className="flex justify-between items-start border-b border-white/10 pb-3">
                <span className="font-display font-bold uppercase tracking-wider text-[hsl(var(--accent))]">Student ID</span>
             </div>
             <div className="mt-4 flex gap-4 items-center">
                <div className="h-20 w-20 rounded-xl overflow-hidden bg-white/20 flex-shrink-0">
                  {avatar ? <img src={avatar} className="h-full w-full object-cover" /> : <UserRound className="m-auto mt-4 h-10 w-10 opacity-50" />}
                </div>
                <div>
                   <h3 className="font-display text-xl font-bold leading-tight">{fullName}</h3>
                   <p className="text-[10px] text-white/60 mt-1 uppercase tracking-wider">{user?.university || 'Universitet'}</p>
                   <p className="text-xs font-semibold text-[hsl(var(--accent))] mt-1">{user?.student_id || '0000 0000'}</p>
                </div>
             </div>
          </div>

          <div className="absolute inset-0 rounded-2xl bg-[hsl(var(--card))] p-5 text-[hsl(var(--foreground))] shadow-float [backface-visibility:hidden] [transform:rotateY(180deg)] border border-[hsl(var(--border))]">
             <div className="flex items-center gap-2 border-b border-[hsl(var(--border))] pb-2">
               <ShieldCheck className="text-[hsl(var(--accent))]" size={18} />
               <span className="text-xs font-bold uppercase">{t('verified')}</span>
             </div>
             <div className="mt-4 text-center flex flex-col items-center">
                <ScanBarcode size={48} strokeWidth={1} className="text-[hsl(var(--foreground))]" />
                <p className="mt-2 text-[10px] text-[hsl(var(--muted-foreground))]">{t('scan_barcode')}</p>
             </div>
             <div className="absolute bottom-4 left-4 flex gap-6 text-[10px] text-[hsl(var(--foreground))]">
                <div>
                  <span className="text-[hsl(var(--muted-foreground))] block">{t('issued')}</span>
                  <strong>01/09/2026</strong>
                </div>
                <div>
                  <span className="text-[hsl(var(--muted-foreground))] block">{t('valid_until')}</span>
                  <strong>30/06/2030</strong>
                </div>
             </div>
          </div>
        </div>
      </div>
      
      <button 
        onClick={(e) => { 
          e.stopPropagation(); 
          setFlipped(!flipped); 
        }} 
        className="mt-8 flex items-center gap-2 rounded-full border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] px-6 py-2.5 text-sm font-bold shadow-soft transition-transform hover:-translate-y-0.5 active:scale-95 text-[hsl(var(--foreground))]"
      >
        <Rotate3d size={18} className="text-[hsl(var(--accent))]" />
        {t('flip_card')}
      </button>
    </div>
  );
}