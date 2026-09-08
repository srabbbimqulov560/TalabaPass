import { Bookmark, Home, UserRound, QrCode } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useState, useEffect, type ReactNode } from 'react';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { t } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, [location]);

  return (
    <div className="app-shell min-h-[100dvh] w-full bg-[hsl(var(--background))]">
      <header className="sticky top-0 z-40 border-b border-[hsl(var(--border)/.8)] bg-[hsl(var(--background)/.88)] backdrop-blur-xl">
        {/* relative klassi qo'shildi - o'rtadagi menyuni qoq markazda ushlab turish uchun */}
        <div className="relative mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5 md:px-[60px]">
          
          <Link href="/" className="flex items-center gap-3 relative z-20">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[hsl(var(--accent)/.12)] border border-[hsl(var(--accent)/.2)] shadow-soft">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-[hsl(var(--accent))]">
                <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"></path>
                <path d="M22 10v6"></path>
                <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"></path>
              </svg>
            </span>
            <span className="font-display text-[19px] font-bold text-[hsl(var(--primary))]">Talaba<span className="text-[hsl(var(--accent))]">Pass</span></span>
          </Link>
          
          {/* KOMPYUTER UCHUN MARKAZIY MENYU (Absolute orqali qoq o'rtada) */}
          <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center z-10">
            {isLoggedIn ? (
              <>
                <Link href="/" className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold transition-all ${location === '/' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]'}`}>
                  <Home size={18} /> Asosiy
                </Link>

                {/* 2-rasmdagidek kattalashtirilgan, yozuvsiz QR ikonka */}
                <div className="flex items-center justify-center w-[64px] h-[64px] bg-[hsl(var(--background))] rounded-full mx-2 relative z-10">
                  <Link href="/qr" className="w-[52px] h-[52px] bg-[hsl(var(--card))] rounded-full flex items-center justify-center shadow-[0_6px_20px_rgba(0,0,0,0.12)] border border-[hsl(var(--border)/.4)] transition-transform hover:scale-105 active:scale-95">
                    <QrCode 
                      size={26} 
                      className="text-[hsl(var(--accent))] drop-shadow-[0_0_8px_rgba(28,170,136,0.5)] dark:drop-shadow-[0_0_12px_rgba(28,170,136,0.9)]" 
                      strokeWidth={2.5} 
                    />
                  </Link>
                </div>

                <Link href="/profile" className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold transition-all ${location === '/profile' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]'}`}>
                  <UserRound size={18} /> Profil
                </Link>
              </>
            ) : (
              <Link href="/" className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold transition-all ${location === '/' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]'}`}>
                <Home size={18} /> Asosiy
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-5 relative z-20">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                {/* O'ng tomonda faqat Saqlanganlar qoldi (yozuvsiz) */}
                <Link href="/saved" className="hidden md:flex items-center justify-center h-10 w-10 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm transition-transform hover:-translate-y-0.5 text-[hsl(var(--foreground))] hover:text-[hsl(var(--accent))]">
                  <Bookmark size={20} strokeWidth={2.5} />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="hidden sm:block text-xs font-bold text-[hsl(var(--foreground))] border-2 border-[hsl(var(--border))] px-4 py-1.5 rounded-full hover:border-[hsl(var(--foreground))] transition-all">
                  {t('login_btn')}
                </Link>
                <Link href="/signup" className="text-xs font-bold bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition-transform hover:-translate-y-0.5 shadow-sm">
                  {t('register_btn')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className="mx-auto max-w-6xl px-5 pb-28 pt-7 md:px-[60px] md:pb-12">
        {children}
      </main>
      
      {/* MOBIL UCHUN PASTKI MENYU */}
      {isLoggedIn ? (
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[hsl(var(--card))] rounded-t-[28px] shadow-[0_-10px_40px_rgba(0,0,0,0.06)] border-t border-[hsl(var(--border)/.5)] z-50 h-[76px]">
          <div className="flex justify-between items-center h-full px-8 relative">
            
            <Link href="/" className="flex flex-col items-center justify-center gap-1 z-20 w-16 h-full mt-1 transition-all">
              <Home 
                size={24} 
                className={`transition-all duration-300 ${location === '/' ? "text-[hsl(var(--accent))] drop-shadow-[0_0_8px_rgba(28,170,136,0.6)] dark:drop-shadow-[0_0_12px_rgba(28,170,136,0.9)]" : "text-[hsl(var(--muted-foreground))]"}`} 
                strokeWidth={location === '/' ? 2.5 : 2} 
              />
              <span className={`text-[10px] font-bold transition-all duration-300 ${location === '/' ? "text-[hsl(var(--accent))] drop-shadow-[0_0_5px_rgba(28,170,136,0.4)] dark:drop-shadow-[0_0_8px_rgba(28,170,136,0.8)]" : "text-[hsl(var(--muted-foreground))]"}`}>
                Asosiy
              </span>
            </Link>

            <div className="absolute left-1/2 -translate-x-1/2 -top-8 w-[88px] h-[88px] bg-[hsl(var(--background))] rounded-full flex items-center justify-center z-10 transition-colors duration-300">
              <Link href="/qr" className="w-[64px] h-[64px] bg-[hsl(var(--card))] rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-transform active:scale-90">
                <QrCode 
                  size={30} 
                  className="text-[hsl(var(--accent))] drop-shadow-[0_0_8px_rgba(28,170,136,0.5)] dark:drop-shadow-[0_0_12px_rgba(28,170,136,0.9)]" 
                  strokeWidth={2.5} 
                />
              </Link>
            </div>

            <Link href="/profile" className="flex flex-col items-center justify-center gap-1 z-20 w-16 h-full mt-1 transition-all">
              <UserRound 
                size={24} 
                className={`transition-all duration-300 ${location === '/profile' ? "text-[hsl(var(--accent))] drop-shadow-[0_0_8px_rgba(28,170,136,0.6)] dark:drop-shadow-[0_0_12px_rgba(28,170,136,0.9)]" : "text-[hsl(var(--muted-foreground))]"}`} 
                strokeWidth={location === '/profile' ? 2.5 : 2} 
              />
              <span className={`text-[10px] font-bold transition-all duration-300 ${location === '/profile' ? "text-[hsl(var(--accent))] drop-shadow-[0_0_5px_rgba(28,170,136,0.4)] dark:drop-shadow-[0_0_8px_rgba(28,170,136,0.8)]" : "text-[hsl(var(--muted-foreground))]"}`}>
                Profil
              </span>
            </Link>

          </div>
        </nav>
      ) : (
        <nav className="md:hidden fixed inset-x-4 bottom-4 z-40 flex items-center justify-center gap-4 rounded-[22px] border border-[hsl(var(--border))] bg-[hsl(var(--card)/.94)] p-3 shadow-float backdrop-blur-xl">
           <Link href="/login" className="flex-1 text-center text-xs font-bold text-[hsl(var(--foreground))] border-2 border-[hsl(var(--border))] py-2.5 rounded-xl">{t('login_btn')}</Link>
           <Link href="/signup" className="flex-1 text-center text-xs font-bold bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] py-3 rounded-xl">{t('register_btn')}</Link>
        </nav>
      )}
    </div>
  );
}