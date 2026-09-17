import { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, UserRound, ScanBarcode, Rotate3d, LogOut, Camera, 
  LockKeyhole, ChevronRight, Globe, Moon, Shield, CircleHelp, CheckCircle2, Circle, Loader2, Edit3, X, Eye, EyeOff, Download
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/lib/useUser'; 
import { useQueryClient } from '@tanstack/react-query';

function initials(firstName?: string, lastName?: string) { 
  if (firstName && lastName) return (firstName[0] + lastName[0]).toUpperCase();
  return 'SP'; 
}

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
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // 🌟 PWA O'RNATISH (INSTALL) STATELARI
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // MAVZUNI O'ZGARTIRISH
  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkTheme]);

  // TAHRIRLASH MODALINI TO'LDIRISH
  useEffect(() => {
    if (user && isEditModalOpen) {
      setEditForm({ 
        firstName: user.first_name || '', 
        lastName: user.last_name || '', 
        oldPassword: '', 
        newPassword: '', 
        confirmPassword: '' 
      });
      setEditError('');
    }
  }, [user, isEditModalOpen]);

  // 🌟 PWA O'RNATISH HODISASINI KUTISH
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault(); // Brauzer avtomatik taklifini to'xtatamiz
      setDeferredPrompt(e); // Hodisani saqlab qolamiz (o'zimizni tugma uchun)
      setIsInstallable(true); // O'rnatish tugmasini ekranda chiqaramiz
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // 🌟 ILOVANI O'RNATISH TUGMASI BOSILGANDA
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
      }
    }
  };

  const strength = getPasswordStrength(editForm.newPassword);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return; 

    try {
      setIsUploading(true);
      const localUrl = URL.createObjectURL(file);
      if (updateAvatar) updateAvatar(localUrl);

      const userId = user.id;
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${userId}-${Date.now()}.${fileExt}`; 

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const newAvatarUrl = publicUrlData.publicUrl;

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

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    setEditError('');

    try {
      if (!editForm.firstName.trim() || !editForm.lastName.trim()) {
        throw new Error("Ism va familiya bo'sh bo'lishi mumkin emas!");
      }

      const { error: dbError } = await supabase
        .from('students')
        .update({ first_name: editForm.firstName.trim(), last_name: editForm.lastName.trim() })
        .eq('id', user.id);

      if (dbError) throw dbError;

      if (editForm.oldPassword || editForm.newPassword || editForm.confirmPassword) {
        if (!editForm.oldPassword) throw new Error("Parolni o'zgartirish uchun eski parolni kiriting!");
        if (!editForm.newPassword) throw new Error("Yangi parolni kiriting!");
        if (editForm.newPassword !== editForm.confirmPassword) throw new Error("Yangi parollar bir xil emas!");
        if (strength.score < 5) throw new Error("Yangi parol yetarlicha kuchli emas (Yashil darajaga yetkazing)!");

        const fakeEmail = `${user.student_id.toLowerCase()}@talabapass.uz`;
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: fakeEmail,
          password: editForm.oldPassword
        });

        if (signInError) throw new Error("Eski parol xato kiritildi!");

        const { error: passwordError } = await supabase.auth.updateUser({ password: editForm.newPassword });
        if (passwordError) throw passwordError;
      }

      queryClient.invalidateQueries({ queryKey: ['user'] });
      setIsEditModalOpen(false);
      alert("Ma'lumotlar muvaffaqiyatli saqlandi!");

    } catch (err: any) {
      setEditError(err.message || "Xatolik yuz berdi");
    } finally {
      setIsSaving(false);
    }
  };

  const avatar = user?.avatar_url;
  const fullName = user ? `${user.first_name} ${user.last_name}` : '';

  return (
    <>
      <div className="page-enter flex flex-col items-center pb-10 min-h-screen">
        
        <div className="relative mt-10 w-full max-w-[380px] rounded-[30px] bg-[hsl(var(--card))] border border-[hsl(var(--card-border))] p-6 shadow-soft pt-14 flex flex-col items-center">
          
          <div className="absolute -top-14">
            <div className="relative group">
              <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" disabled={isUploading || isUserLoading} />
              
              {/* 🌟 RASM SKELETONI */}
              <div 
                onClick={() => !isUploading && !isUserLoading && fileInputRef.current?.click()} 
                className={`grid h-28 w-28 cursor-pointer place-items-center overflow-hidden rounded-full border-4 border-[hsl(var(--background))] shadow-md transition-all ${
                  isUserLoading ? 'bg-[hsl(var(--muted))] animate-pulse cursor-default' : 
                  isUploading ? 'bg-[hsl(var(--primary))] opacity-50' : 
                  'bg-[hsl(var(--primary))] group-hover:opacity-80'
                }`}
              >
                {!isUserLoading && (
                  isUploading ? (
                     <Loader2 className="animate-spin text-white" size={32} />
                  ) : avatar ? (
                    <img src={avatar} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-display text-4xl font-bold text-[hsl(var(--primary-foreground))]">
                      {initials(user?.first_name, user?.last_name)}
                    </span>
                  )
                )}
              </div>

              {!isUserLoading && (
                <button 
                  onClick={() => !isUploading && fileInputRef.current?.click()} 
                  className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full border-[3px] border-[hsl(var(--background))] bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] shadow-sm"
                >
                  <Camera size={14} />
                </button>
              )}
            </div>
          </div>
          
          {/* 🌟 MATNLAR SKELETONI */}
          {isUserLoading ? (
            <div className="flex flex-col items-center mt-2 w-full text-center">
              <div className="h-7 w-48 bg-[hsl(var(--muted))] rounded-lg animate-pulse mb-3"></div>
              <div className="h-4 w-32 bg-[hsl(var(--muted))] rounded-md animate-pulse mb-4"></div>
              <div className="h-8 w-36 bg-[hsl(var(--secondary))] rounded-full animate-pulse"></div>
            </div>
          ) : (
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
          )}
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
          <StudentCard user={user} avatar={avatar} t={t} fullName={fullName} isLoading={isUserLoading} />
        ) : (
          <div className="w-full max-w-[380px] flex flex-col page-enter pb-10">
            
            <div className="bg-[hsl(var(--card))] rounded-[24px] border border-[hsl(var(--card-border))] overflow-hidden flex flex-col shadow-soft">
              
              {/* 🌟 PWA O'RNATISH TUGMASI (Faqat ilova brauzerdan ochilgandagina chiqadi) */}
              {isInstallable && (
                <div onClick={handleInstallClick} className="flex items-center justify-between p-4 cursor-pointer bg-[hsl(var(--primary)/.08)] hover:bg-[hsl(var(--primary)/.15)] transition-colors border-b border-[hsl(var(--primary)/.2)]">
                  <div className="flex items-center gap-3">
                    <div className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] p-2 rounded-full">
                      <Download size={18} />
                    </div>
                    <div>
                      <span className="text-[15px] font-bold text-[hsl(var(--primary))] block">Ilovani o'rnatish</span>
                      <span className="text-[11px] font-semibold text-[hsl(var(--primary))/70] block leading-tight">Tez va qulay ishlash uchun</span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-[hsl(var(--primary))]" />
                </div>
              )}

              <div onClick={() => setIsEditModalOpen(true)} className="flex items-center justify-between p-4 cursor-pointer hover:bg-[hsl(var(--secondary)/.5)] transition-colors border-b border-[hsl(var(--border))]">
                <div className="flex items-center gap-3">
                  <Edit3 size={22} className="text-[hsl(var(--foreground))]" />
                  <span className="text-[15px] font-semibold text-[hsl(var(--foreground))]">Shaxsiy ma'lumotlar</span>
                </div>
                <ChevronRight size={20} className="text-[hsl(var(--muted-foreground))]" />
              </div>

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

      {/* TAHRIRLASH MODALI */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSaving && setIsEditModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-[hsl(var(--card))] rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95 duration-300 border border-[hsl(var(--border))] my-8 max-h-[90vh] overflow-y-auto">
            
            <button onClick={() => !isSaving && setIsEditModalOpen(false)} className="absolute top-4 right-4 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
              <X size={24} />
            </button>
            
            <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] mb-6">Shaxsiy ma'lumotlar</h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-[hsl(var(--muted-foreground))] block mb-1">Ism</label>
                <input 
                  type="text" value={editForm.firstName} onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                  className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-3 px-4 rounded-xl font-semibold outline-none focus:border-[hsl(var(--primary))] text-[hsl(var(--foreground))]" 
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[hsl(var(--muted-foreground))] block mb-1">Familiya</label>
                <input 
                  type="text" value={editForm.lastName} onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                  className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-3 px-4 rounded-xl font-semibold outline-none focus:border-[hsl(var(--primary))] text-[hsl(var(--foreground))]" 
                />
              </div>

              <hr className="border-t border-[hsl(var(--border))] my-4" />
              <p className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">Parolni o'zgartirish (ixtiyoriy)</p>

              <div>
                <label className="text-[11px] font-bold text-[hsl(var(--muted-foreground))] block mb-1">Eski parol</label>
                <div className="relative">
                  <input 
                    type={showOldPass ? "text" : "password"} placeholder="Joriy parol..." value={editForm.oldPassword} onChange={(e) => setEditForm({...editForm, oldPassword: e.target.value})}
                    className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-3 pl-4 pr-12 rounded-xl font-semibold outline-none focus:border-[hsl(var(--primary))] text-[hsl(var(--foreground))]" 
                  />
                  <button type="button" onClick={() => setShowOldPass(!showOldPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]">
                    {showOldPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[hsl(var(--muted-foreground))] block mb-1">Yangi parol</label>
                <div className="relative">
                  <input 
                    type={showNewPass ? "text" : "password"} placeholder="Yangi parol..." value={editForm.newPassword} onChange={(e) => setEditForm({...editForm, newPassword: e.target.value})}
                    className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-3 pl-4 pr-12 rounded-xl font-semibold outline-none focus:border-[hsl(var(--primary))] text-[hsl(var(--foreground))]" 
                  />
                  <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]">
                    {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                
                {editForm.newPassword && (
                  <div className="mt-2 px-1">
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
                <label className="text-[11px] font-bold text-[hsl(var(--muted-foreground))] block mb-1">Yangi parolni tasdiqlang</label>
                <div className="relative">
                  <input 
                    type={showConfirmPass ? "text" : "password"} placeholder="Parolni qayta yozing..." value={editForm.confirmPassword} onChange={(e) => setEditForm({...editForm, confirmPassword: e.target.value})}
                    className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-3 pl-4 pr-12 rounded-xl font-semibold outline-none focus:border-[hsl(var(--primary))] text-[hsl(var(--foreground))]" 
                  />
                  <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]">
                    {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              {editError && <p className="text-red-500 text-xs font-semibold text-center pt-2">{editError}</p>}
            </div>

            <button 
              disabled={isSaving} onClick={handleSaveProfile}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] py-4 text-base font-bold text-[hsl(var(--primary-foreground))] shadow-float active:scale-95 transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" /> : 'Saqlash'}
            </button>
          </div>
        </div>
      )}

      {/* TILLAR MODALI */}
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

// 🌟 SKELETONLI ID KARTA
function StudentCard({ user, avatar, t, fullName, isLoading }: any) {
  const [flipped, setFlipped] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center pb-10 page-enter w-full">
        <div className="h-[220px] w-full max-w-[360px] rounded-2xl bg-[hsl(var(--muted))] animate-pulse border border-[hsl(var(--border))]"></div>
        <div className="mt-8 h-10 w-32 rounded-full bg-[hsl(var(--muted))] animate-pulse"></div>
      </div>
    );
  }

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