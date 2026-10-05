import { Heart, Home, UserRound, QrCode, Bell, LayoutGrid, Store, Tags, ScanLine, History, Settings } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useState, useEffect, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query'; // 🌟 2-MUAMMO YECHIMI: useQuery chaqirildi
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';

// ----------------------------------------------------------------------
// 1. TALABA UCHUN APP SHELL
// ----------------------------------------------------------------------
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
  }, []);

  // 🌟 2-MUAMMO YECHIMI: Bildirishnomalar sonini eng ishonchli (useQuery + refetchInterval) usulda olish
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadNotifications', isLoggedIn],
    enabled: isLoggedIn,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;
      
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
        
      return count || 0;
    },
    refetchInterval: 5000, // Har 5 soniyada yangilanib turadi, eski profildagi raqamni saqlab qolmaydi!
  });

  return (
    <div className="app-shell min-h-[100dvh] w-full bg-[hsl(var(--background))]">
      <header className="sticky top-0 z-40 border-b border-[hsl(var(--border)/.8)] bg-[hsl(var(--background)/.88)] backdrop-blur-xl">
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
          
          <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center z-10 gap-1">
            {isLoggedIn ? (
              <>
                <Link href="/" className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-bold transition-all ${location === '/' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]'}`}>
                  <Home size={18} /> {t('home_nav')}
                </Link>
                
                <Link href="/services" className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-bold transition-all ${location === '/services' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]'}`}>
                  <LayoutGrid size={18} /> {t('category_services')}
                </Link>

                <div className="flex items-center justify-center w-[64px] h-[64px] bg-[hsl(var(--background))] rounded-full mx-2 relative z-10">
                  <Link href="/qr" className="w-[52px] h-[52px] bg-[hsl(var(--card))] rounded-full flex items-center justify-center shadow-[0_6px_20px_rgba(0,0,0,0.12)] border border-[hsl(var(--border)/.4)] transition-transform hover:scale-105 active:scale-95">
                    <QrCode size={26} className="text-[hsl(var(--accent))] drop-shadow-[0_0_8px_rgba(28,170,136,0.5)] dark:drop-shadow-[0_0_12px_rgba(28,170,136,0.9)]" strokeWidth={2.5} />
                  </Link>
                </div>

                <Link href="/saved" className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-bold transition-all ${location === '/saved' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]'}`}>
                  <Heart size={18} /> {t('saved_offers')}
                </Link>

                <Link href="/profile" className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-bold transition-all ${location === '/profile' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]'}`}>
                  <UserRound size={18} /> {t('profile_nav')}
                </Link>
              </>
            ) : (
              <Link href="/" className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold transition-all ${location === '/' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]'}`}>
                <Home size={18} /> {t('home_nav')}
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-5 relative z-20">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <Link href="/notifications" className="relative flex items-center justify-center h-10 w-10 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm transition-transform hover:-translate-y-0.5 text-[hsl(var(--foreground))] hover:text-[hsl(var(--accent))]">
                  <Bell size={20} strokeWidth={2.5} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-extrabold text-white shadow-sm border-2 border-[hsl(var(--background))] animate-in zoom-in">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
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
      
      {isLoggedIn ? (
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[hsl(var(--card))] rounded-t-[28px] shadow-[0_-10px_40px_rgba(0,0,0,0.06)] border-t border-[hsl(var(--border)/.5)] z-50 h-[76px]">
          <div className="flex justify-between items-center h-full px-4 relative">
            <div className="flex justify-around items-center w-[40%] z-20">
              <Link href="/" className="flex flex-col items-center justify-center gap-1 h-full mt-1 transition-all">
                <Home size={22} className={`transition-all duration-300 ${location === '/' ? "text-[hsl(var(--accent))] drop-shadow-[0_0_8px_rgba(28,170,136,0.6)]" : "text-[hsl(var(--muted-foreground))]"}`} strokeWidth={location === '/' ? 2.5 : 2} />
                <span className={`text-[10px] font-bold transition-all duration-300 ${location === '/' ? "text-[hsl(var(--accent))] drop-shadow-[0_0_5px_rgba(28,170,136,0.4)]" : "text-[hsl(var(--muted-foreground))]"}`}>{t('home_nav')}</span>
              </Link>
              <Link href="/services" className="flex flex-col items-center justify-center gap-1 h-full mt-1 transition-all">
                <LayoutGrid size={22} className={`transition-all duration-300 ${location === '/services' ? "text-[hsl(var(--accent))] drop-shadow-[0_0_8px_rgba(28,170,136,0.6)]" : "text-[hsl(var(--muted-foreground))]"}`} strokeWidth={location === '/services' ? 2.5 : 2} />
                <span className={`text-[10px] font-bold transition-all duration-300 ${location === '/services' ? "text-[hsl(var(--accent))] drop-shadow-[0_0_5px_rgba(28,170,136,0.4)]" : "text-[hsl(var(--muted-foreground))]"}`}>{t('category_services')}</span>
              </Link>
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 -top-8 w-[88px] h-[88px] bg-[hsl(var(--background))] rounded-full flex items-center justify-center z-10 transition-colors duration-300">
              <Link href="/qr" className="w-[64px] h-[64px] bg-[hsl(var(--card))] rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-transform active:scale-90">
                <QrCode size={30} className="text-[hsl(var(--accent))] drop-shadow-[0_0_8px_rgba(28,170,136,0.5)] dark:drop-shadow-[0_0_12px_rgba(28,170,136,0.9)]" strokeWidth={2.5} />
              </Link>
            </div>

            <div className="flex justify-around items-center w-[40%] z-20">
              <Link href="/saved" className="flex flex-col items-center justify-center gap-1 h-full mt-1 transition-all">
                <Heart size={22} className={`transition-all duration-300 ${location === '/saved' ? "text-[hsl(var(--accent))] drop-shadow-[0_0_8px_rgba(28,170,136,0.6)]" : "text-[hsl(var(--muted-foreground))]"}`} strokeWidth={location === '/saved' ? 2.5 : 2} />
                <span className={`text-[10px] font-bold transition-all duration-300 ${location === '/saved' ? "text-[hsl(var(--accent))] drop-shadow-[0_0_5px_rgba(28,170,136,0.4)]" : "text-[hsl(var(--muted-foreground))]"}`}>{t('saved_offers')}</span>
              </Link>
              <Link href="/profile" className="flex flex-col items-center justify-center gap-1 h-full mt-1 transition-all">
                <UserRound size={22} className={`transition-all duration-300 ${location === '/profile' ? "text-[hsl(var(--accent))] drop-shadow-[0_0_8px_rgba(28,170,136,0.6)]" : "text-[hsl(var(--muted-foreground))]"}`} strokeWidth={location === '/profile' ? 2.5 : 2} />
                <span className={`text-[10px] font-bold transition-all duration-300 ${location === '/profile' ? "text-[hsl(var(--accent))] drop-shadow-[0_0_5px_rgba(28,170,136,0.4)]" : "text-[hsl(var(--muted-foreground))]"}`}>{t('profile_nav')}</span>
              </Link>
            </div>
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

// ----------------------------------------------------------------------
// 2. BIZNES (MERCHANT) UCHUN APP SHELL
// ----------------------------------------------------------------------
export function MerchantAppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { t } = useLanguage(); 

  return (
    <div className="min-h-[100dvh] w-full bg-[hsl(var(--background))]">
      <header className="sticky top-0 z-40 border-b border-[hsl(var(--border)/.8)] bg-[hsl(var(--background)/.88)] backdrop-blur-xl">
        <div className="relative mx-auto flex h-[72px] items-center justify-center px-5">
          <span className="font-display text-[19px] font-bold text-[hsl(var(--primary))]">
            {t('business_panel').replace('Panel', '')}<span className="text-[hsl(var(--accent))]">Panel</span>
          </span>
        </div>
      </header>
      
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6">
        {children}
      </main>
      
      <nav className="fixed bottom-0 left-0 w-full bg-[hsl(var(--card))] rounded-t-[28px] shadow-[0_-10px_40px_rgba(0,0,0,0.06)] border-t border-[hsl(var(--border)/.5)] z-50 h-[76px]">
        <div className="flex justify-between items-center h-full px-4 relative">
          
          <div className="flex justify-around items-center w-[40%] z-20">
            <Link href="/merchant" className="flex flex-col items-center justify-center gap-1 h-full mt-1">
              <Store size={22} className={location === '/merchant' ? "text-[hsl(var(--accent))] drop-shadow-[0_0_8px_rgba(28,170,136,0.6)]" : "text-[hsl(var(--muted-foreground))]"} strokeWidth={location === '/merchant' ? 2.5 : 2} />
              <span className={`text-[10px] font-bold ${location === '/merchant' ? "text-[hsl(var(--accent))]" : "text-[hsl(var(--muted-foreground))]"}`}>
                {t('home_nav')}
              </span>
            </Link>
            <Link href="/merchant/discounts" className="flex flex-col items-center justify-center gap-1 h-full mt-1">
              <Tags size={22} className={location === '/merchant/discounts' ? "text-[hsl(var(--accent))] drop-shadow-[0_0_8px_rgba(28,170,136,0.6)]" : "text-[hsl(var(--muted-foreground))]"} strokeWidth={location === '/merchant/discounts' ? 2.5 : 2} />
              <span className={`text-[10px] font-bold ${location === '/merchant/discounts' ? "text-[hsl(var(--accent))]" : "text-[hsl(var(--muted-foreground))]"}`}>
                {t('discounts')}
              </span>
            </Link>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 -top-8 w-[88px] h-[88px] bg-[hsl(var(--background))] rounded-full flex items-center justify-center z-10">
            <Link href="/merchant/scanner" className="w-[64px] h-[64px] bg-[hsl(var(--accent))] rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(28,170,136,0.4)] transition-transform active:scale-90">
              <ScanLine size={32} className="text-white" strokeWidth={2.5} />
            </Link>
          </div>

          <div className="flex justify-around items-center w-[40%] z-20">
            <Link href="/merchant/history" className="flex flex-col items-center justify-center gap-1 h-full mt-1">
              <History size={22} className={location === '/merchant/history' ? "text-[hsl(var(--accent))] drop-shadow-[0_0_8px_rgba(28,170,136,0.6)]" : "text-[hsl(var(--muted-foreground))]"} strokeWidth={location === '/merchant/history' ? 2.5 : 2} />
              <span className={`text-[10px] font-bold ${location === '/merchant/history' ? "text-[hsl(var(--accent))]" : "text-[hsl(var(--muted-foreground))]"}`}>
                {t('history')}
              </span>
            </Link>
            <Link href="/merchant/profile" className="flex flex-col items-center justify-center gap-1 h-full mt-1">
              <Settings size={22} className={location === '/merchant/profile' ? "text-[hsl(var(--accent))] drop-shadow-[0_0_8px_rgba(28,170,136,0.6)]" : "text-[hsl(var(--muted-foreground))]"} strokeWidth={location === '/merchant/profile' ? 2.5 : 2} />
              <span className={`text-[10px] font-bold ${location === '/merchant/profile' ? "text-[hsl(var(--accent))]" : "text-[hsl(var(--muted-foreground))]"}`}>
                {t('settings')}
              </span>
            </Link>
          </div>

        </div>
      </nav>
    </div>
  );
}