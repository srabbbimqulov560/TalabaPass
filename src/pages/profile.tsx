import { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, UserRound, ScanBarcode, Rotate3d, LogOut, Camera, 
  LockKeyhole, ChevronRight, Globe, Moon, Shield, CircleHelp, CheckCircle2, Circle
} from 'lucide-react';
import { useGetProfile } from '@workspace/api-client-react';
import { useLanguage } from '@/lib/i18n';

function initials(name?: string) { 
  return name?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'SP'; 
}

export default function ProfilePage() {
  const { t, lang, setLang } = useLanguage();
  const profile = useGetProfile();
  const user = profile.data;
  
  const [activeTab, setActiveTab] = useState<'id' | 'settings'>('id');
  const [avatar, setAvatar] = useState<string | null>(null);
  
  // Dark mode holatini saqlangan xotiradan olish
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark');
  });
  const [isPrivateAccount, setIsPrivateAccount] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tema o'zgarishini xotiraga saqlash
  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkTheme]);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAvatar(imageUrl);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleLangSelect = (selectedLang: 'uz' | 'en' | 'ru') => {
    setLang(selectedLang);
    setIsLangModalOpen(false);
  };

  return (
    <>
      <div className="page-enter flex flex-col items-center pb-10 min-h-screen">
        
        <div className="relative mt-10 w-full max-w-[380px] rounded-[30px] bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-6 shadow-soft pt-14 flex flex-col items-center">
          
          <div className="absolute -top-14">
            <div className="relative group">
              <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
              <div 
                onClick={() => fileInputRef.current?.click()} 
                className="grid h-28 w-28 cursor-pointer place-items-center overflow-hidden rounded-full bg-[#f1c46b] border-4 border-[hsl(var(--background))] font-display text-4xl font-bold text-[#694718] shadow-md transition-all group-hover:opacity-80"
              >
                {avatar ? <img src={avatar} alt="Profile" className="h-full w-full object-cover" /> : initials(user?.name)}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full border-[3px] border-[hsl(var(--background))] bg-[hsl(var(--accent))] text-white shadow-sm"
              >
                <Camera size={14} />
              </button>
            </div>
          </div>
          
          <div className="flex flex-col items-center mt-2 text-center">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))]">{user?.name || 'Student profile'}</h2>
              {user?.verified !== false && (
                <span className="flex items-center gap-1 rounded-full bg-[hsl(var(--accent)/.15)] px-2 py-1 text-[10px] font-bold text-[hsl(var(--accent))]">
                  <ShieldCheck size={12} /> {t('verified')}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              {user?.university || 'University'} {user?.course ? `· ${user.course}` : ''}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] bg-[hsl(var(--secondary))] px-4 py-2 rounded-full">
              <LockKeyhole size={14} /> {t('student_id')} 
              <span className="font-mono font-bold text-[hsl(var(--foreground))] ml-1">{user?.studentId || '•••• ••••'}</span>
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
          <StudentCard user={user} avatar={avatar} t={t} />
        ) : (
          <div className="w-full max-w-[380px] flex flex-col page-enter pb-10">
            
            <div className="bg-[hsl(var(--card))] rounded-[24px] border border-[hsl(var(--border))] overflow-hidden flex flex-col">
              
              <div 
                onClick={() => setIsLangModalOpen(true)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-[hsl(var(--secondary)/.5)] transition-colors border-b border-[hsl(var(--border))]"
              >
                <div className="flex items-center gap-3">
                  <Globe size={22} className="text-[hsl(var(--foreground))]" />
                  <span className="text-[15px] font-semibold text-[hsl(var(--foreground))]">{t('change_language')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">
                    {lang === 'uz' ? "GB O'zbek" : lang === 'ru' ? "RU Русский" : "GB English"}
                  </span>
                  <ChevronRight size={20} className="text-[hsl(var(--muted-foreground))]" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
                <div className="flex items-center gap-3">
                  <Moon size={22} className="text-[hsl(var(--foreground))]" />
                  <span className="text-[15px] font-semibold text-[hsl(var(--foreground))]">{t('dark_mode')}</span>
                </div>
                <div 
                  onClick={() => setIsDarkTheme(!isDarkTheme)}
                  className={`w-12 h-6.5 rounded-full p-1 cursor-pointer transition-colors ${isDarkTheme ? 'bg-[hsl(var(--accent))]' : 'bg-gray-300'}`}
                >
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
                <div 
                  onClick={() => setIsPrivateAccount(!isPrivateAccount)}
                  className={`w-12 h-6.5 rounded-full p-1 cursor-pointer transition-colors ${isPrivateAccount ? 'bg-[hsl(var(--accent))]' : 'bg-gray-300'}`}
                >
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

              <div 
                onClick={handleLogout}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-red-50 transition-colors"
              >
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
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => setIsLangModalOpen(false)} 
          />
          
          <div className="relative bg-[hsl(var(--card))] rounded-t-[32px] p-6 pb-[100px] animate-in slide-in-from-bottom-full duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
            <div className="w-10 h-1.5 bg-gray-300 rounded-full mx-auto mb-6" />
            
            <h3 className="font-display text-xl font-bold mb-5 px-2">{t('select_language')}</h3>
            
            <div className="flex flex-col gap-3">
              <div 
                onClick={() => handleLangSelect('uz')}
                className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer border transition-colors ${lang === 'uz' ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/.08)]' : 'border-transparent bg-[hsl(var(--secondary)/.6)]'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇺🇿</span>
                  <span className="text-base font-semibold text-[hsl(var(--foreground))]">O'zbek</span>
                </div>
                {lang === 'uz' ? <CheckCircle2 size={24} className="text-[hsl(var(--accent))]" /> : <Circle size={24} className="text-[hsl(var(--muted-foreground))]" />}
              </div>

              <div 
                onClick={() => handleLangSelect('ru')}
                className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer border transition-colors ${lang === 'ru' ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/.08)]' : 'border-transparent bg-[hsl(var(--secondary)/.6)]'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇷🇺</span>
                  <span className="text-base font-semibold text-[hsl(var(--foreground))]">Русский</span>
                </div>
                {lang === 'ru' ? <CheckCircle2 size={24} className="text-[hsl(var(--accent))]" /> : <Circle size={24} className="text-[hsl(var(--muted-foreground))]" />}
              </div>

              <div 
                onClick={() => handleLangSelect('en')}
                className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer border transition-colors ${lang === 'en' ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/.08)]' : 'border-transparent bg-[hsl(var(--secondary)/.6)]'}`}
              >
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

function StudentCard({ user, avatar, t }: any) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="flex flex-col items-center pb-10 page-enter w-full">
      <div 
        className="group h-[220px] w-full max-w-[360px] [perspective:1000px] cursor-pointer"
        onClick={() => setFlipped(!flipped)}
      >
        <div className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}>
          
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#1a2b4c] to-[#121c32] p-5 text-white shadow-float [backface-visibility:hidden]">
             <div className="flex justify-between items-start border-b border-white/10 pb-3">
                <span className="font-display font-bold uppercase tracking-wider text-[hsl(var(--accent))]">Student ID</span>
             </div>
             <div className="mt-4 flex gap-4 items-center">
                <div className="h-20 w-20 rounded-xl overflow-hidden bg-white/20 flex-shrink-0">
                  {avatar ? <img src={avatar} className="h-full w-full object-cover" /> : <UserRound className="m-auto mt-4 h-10 w-10 opacity-50" />}
                </div>
                <div>
                   <h3 className="font-display text-xl font-bold leading-tight">{user?.name || 'Ism Familiya'}</h3>
                   <p className="text-[10px] text-white/60 mt-1 uppercase tracking-wider">{user?.university || 'Universitet'}</p>
                   <p className="text-xs font-semibold text-[hsl(var(--accent))] mt-1">{user?.studentId || '0000 0000'}</p>
                </div>
             </div>
          </div>

          <div className="absolute inset-0 rounded-2xl bg-white p-5 text-black shadow-float [backface-visibility:hidden] [transform:rotateY(180deg)] border border-gray-200">
             <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
               <ShieldCheck className="text-[hsl(var(--accent))]" size={18} />
               <span className="text-xs font-bold uppercase">{t('verified')}</span>
             </div>
             <div className="mt-4 text-center flex flex-col items-center">
                <ScanBarcode size={48} strokeWidth={1} className="text-gray-800" />
                <p className="mt-2 text-[10px] text-gray-500">{t('scan_barcode')}</p>
             </div>
             <div className="absolute bottom-4 left-4 flex gap-6 text-[10px]">
                <div>
                  <span className="text-gray-400 block">{t('issued')}</span>
                  <strong>01/09/2025</strong>
                </div>
                <div>
                  <span className="text-gray-400 block">{t('valid_until')}</span>
                  <strong>30/06/2029</strong>
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
        className="mt-8 flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-2.5 text-sm font-bold shadow-soft transition-transform hover:-translate-y-0.5 active:scale-95"
      >
        <Rotate3d size={18} className="text-[hsl(var(--accent))]" />
        {t('flip_card')}
      </button>
    </div>
  );
}