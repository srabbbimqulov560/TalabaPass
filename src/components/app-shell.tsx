import { Home, UserRound, QrCode } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useState, useEffect, type ReactNode } from 'react';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { t } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Supabase orqali haqiqiy sessiyani tekshirish
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, [location]);

  return (
    <div className="min-h-[100dvh] w-full bg-[hsl(var(--background))] sm:bg-[#0f0f11] sm:py-8 flex items-center justify-center">
      <div className="w-full h-[100dvh] sm:h-full sm:max-h-[850px] sm:max-w-[420px] bg-[hsl(var(--background))] sm:rounded-[40px] relative overflow-hidden flex flex-col sm:border-[8px] sm:border-[#1e1e24] shadow-2xl">
        
        <header className="shrink-0 z-40 border-b border-[hsl(var(--border)/.8)] bg-[hsl(var(--background)/.88)] backdrop-blur-xl">
          <div className="mx-auto flex h-[72px] items-center justify-between px-5">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[hsl(var(--accent)/.12)] border border-[hsl(var(--accent)/.2)] shadow-soft">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-[hsl(var(--accent))]">
                  <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"></path>
                  <path d="M22 10v6"></path>
                  <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"></path>
                </svg>
              </span>
              <span className="font-display text-[19px] font-bold text-[hsl(var(--primary))]">Talaba<span className="text-[hsl(var(--accent))]">Pass</span></span>
            </Link>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto px-5 pb-28 pt-7 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {children}
        </main>
        
        {isLoggedIn ? (
          <nav className="absolute bottom-0 left-0 w-full bg-[hsl(var(--card))] rounded-t-[28px] sm:rounded-t-none border-t border-[hsl(var(--border)/.5)] z-50 h-[76px]">
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
          <nav className="absolute inset-x-4 bottom-4 z-40 flex items-center justify-center gap-4 rounded-[22px] border border-[hsl(var(--border))] bg-[hsl(var(--card)/.94)] p-3 shadow-float backdrop-blur-xl">
             <Link href="/login" className="flex-1 text-center text-xs font-bold text-[hsl(var(--foreground))] border-2 border-[hsl(var(--border))] py-2.5 rounded-xl">{t('login_btn')}</Link>
             <Link href="/signup" className="flex-1 text-center text-xs font-bold bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] py-3 rounded-xl">{t('register_btn')}</Link>
          </nav>
        )}
      </div>
    </div>
  );
}