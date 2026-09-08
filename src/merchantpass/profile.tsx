import { useState, useEffect, useRef } from 'react';
import { LogOut, Globe, Moon, CircleHelp, ChevronRight, Store, ShieldCheck, Clock, Camera, Loader2, CheckCircle2, Circle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/i18n';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';

export default function MerchantProfile() {
  const { lang, setLang } = useLanguage();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [isDarkTheme, setIsDarkTheme] = useState(() => localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark'));
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // XATONING YECHIMI: Kesh (Cache) yaratamiz, shu orqali sahifa har safar yuklanmaydi!
  const { data: merchant, isLoading: loading } = useQuery({
    queryKey: ['merchantProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");
      const { data } = await supabase.from('merchants').select('*').eq('id', user.id).single();
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 daqiqa davomida xotirada ushlab turadi
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

  const handleLangSelect = (selectedLang: 'uz' | 'en' | 'ru') => {
    setLang(selectedLang);
    setIsLangModalOpen(false);
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file || !merchant) return;

      setIsUploading(true);
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `merchant-${merchant.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true });
      if (uploadError) throw new Error("Yuklashda xatolik");

      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const avatarUrl = publicUrlData.publicUrl;

      const { error: updateError } = await supabase.from('merchants').update({ logo_url: avatarUrl }).eq('id', merchant.id);
      if (updateError) throw updateError;

      // Xotirani o'sha zahotiyoq yangilaymiz
      queryClient.setQueryData(['merchantProfile'], { ...merchant, logo_url: avatarUrl });
    } catch (error: any) {
      alert("Xatolik yuz berdi");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    queryClient.clear(); // Chiqish paytida kesh xotira tozalanadi
    setLocation('/merchant/login');
  };

  if (loading && !merchant) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-[hsl(var(--accent))]" size={40} /></div>;
  }

  return (
    <>
      <div className="page-enter animate-in fade-in duration-500">
        
        {/* PROFIL RASMI QUTISI */}
        <div className="flex flex-col items-center mt-2 mb-8">
          <div className="relative mb-4 group">
            <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
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
          
          <h2 className="text-2xl font-display font-bold text-[hsl(var(--foreground))] text-center">
            {merchant?.name || "Do'kon nomi"}
          </h2>
          
          {/* STATUS BADGE */}
          <div className="mt-2 flex items-center justify-center">
            {merchant?.is_active ? (
              <span className="flex items-center gap-1.5 rounded-full bg-green-500/15 px-3 py-1.5 text-[11px] font-bold text-green-500 uppercase tracking-wider border border-green-500/20">
                <ShieldCheck size={14} /> Tasdiqlangan
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-yellow-500/15 px-3 py-1.5 text-[11px] font-bold text-yellow-500 uppercase tracking-wider border border-yellow-500/20">
                <Clock size={14} /> Kutilmoqda
              </span>
            )}
          </div>
        </div>

        <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] mb-4">Sozlamalar</h2>
        
        <div className="bg-[hsl(var(--card))] rounded-[24px] border border-[hsl(var(--border))] overflow-hidden flex flex-col shadow-soft">
          
          {/* TIL TANLASH (bosilganda oyna ochiladi) */}
          <div onClick={() => setIsLangModalOpen(true)} className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))] cursor-pointer hover:bg-[hsl(var(--secondary)/.5)] transition-colors">
            <div className="flex items-center gap-3">
              <Globe size={22} className="text-[hsl(var(--foreground))]" />
              <span className="text-[15px] font-semibold text-[hsl(var(--foreground))]">Tilni o'zgartirish</span>
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
              <span className="text-[15px] font-semibold text-[hsl(var(--foreground))]">Tungi rejim</span>
            </div>
            <div onClick={() => setIsDarkTheme(!isDarkTheme)} className={`w-12 h-6.5 rounded-full p-1 cursor-pointer transition-colors ${isDarkTheme ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--muted))]'}`}>
              <div className={`w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform ${isDarkTheme ? 'translate-x-5.5' : 'translate-x-0'}`} />
            </div>
          </div>

          <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-[hsl(var(--secondary)/.5)] transition-colors border-b border-[hsl(var(--border))]">
            <div className="flex items-center gap-3">
              <CircleHelp size={22} className="text-[hsl(var(--foreground))]" />
              <span className="text-[15px] font-semibold text-[hsl(var(--foreground))]">Yordam va qo'llab-quvvatlash</span>
            </div>
            <ChevronRight size={20} className="text-[hsl(var(--muted-foreground))]" />
          </div>

          <div onClick={handleLogout} className="flex items-center justify-between p-5 cursor-pointer hover:bg-red-500/10 transition-colors">
            <div className="flex items-center gap-3">
              <LogOut size={22} className="text-red-500" />
              <span className="text-[15px] font-semibold text-red-500">Hisobdan chiqish</span>
            </div>
          </div>
        </div>
      </div>

      {/* TIL TANLASH OYNASI (MODAL) */}
      {isLangModalOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end" style={{ height: '100dvh' }}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsLangModalOpen(false)} />
          <div className="relative bg-[hsl(var(--card))] rounded-t-[32px] p-6 pb-[100px] animate-in slide-in-from-bottom-full duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] border-t border-[hsl(var(--border))]">
            <div className="w-10 h-1.5 bg-[hsl(var(--muted))] rounded-full mx-auto mb-6" />
            <h3 className="font-display text-xl font-bold mb-5 px-2 text-[hsl(var(--foreground))]">Tilni tanlang</h3>
            
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