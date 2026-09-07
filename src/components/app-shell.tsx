import { Bookmark, Home, UserRound, LogIn, LogOut, QrCode } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useState, useEffect, type ReactNode } from 'react';
import { useLanguage } from '@/lib/i18n';

export function AppShell({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { t } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setLocation('/');
  };

  const desktopNavItems = isLoggedIn
    ? [
        { href: '/', label: 'Asosiy', icon: Home },
        { href: '/saved', label: t('saved_offers'), icon: Bookmark },
      ]
    : [
        { href: '/', label: 'Asosiy', icon: Home },
      ];

  return (
    <div className="app-shell min-h-[100dvh]">
      <header className="sticky top-0 z-40 border-b border-[hsl(var(--border)/.8)] bg-[hsl(var(--background)/.88)] backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 md:px-8">
          
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[hsl(var(--primary))] text-[hsl(var(--accent))] shadow-soft">
              <Bookmark size={19} strokeWidth={2.6} />
            </span>
            <span className="font-display text-[19px] font-bold text-[hsl(var(--primary))]">Student<span className="text-[hsl(var(--accent))]">Pass</span></span>
          </Link>
          
          <nav className="hidden items-center gap-2 md:flex">
            {desktopNavItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${location === href ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]'}`}>
                <Icon size={16} />{label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <Link href="/saved" className="flex items-center justify-center h-10 w-10 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm transition-transform hover:-translate-y-0.5 text-[hsl(var(--foreground))] hover:text-[hsl(var(--accent))]">
                  <Bookmark size={20} strokeWidth={2.5} />
                </Link>
                <button onClick={handleLogout} className="hidden md:block p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Tizimdan chiqish">
                  <LogOut size={20} />
                </button>
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
      
      <main className="mx-auto max-w-7xl px-5 pb-28 pt-7 md:px-8 md:pb-12">{children}</main>
      
      {isLoggedIn ? (
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[hsl(var(--card))] rounded-t-[28px] shadow-[0_-10px_40px_rgba(0,0,0,0.06)] border-t border-[hsl(var(--border)/.5)] z-50 h-[76px]">
          <div className="flex justify-between items-center h-full px-8 relative">
            
            {/* 1. Asosiy ikonkasi (Aktiv bo'lganda drop-shadow bilan yonadi) */}
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

            {/* 2. QR Scanner (Doimiy Neon effektga ega) */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-8 w-[88px] h-[88px] bg-[hsl(var(--background))] rounded-full flex items-center justify-center z-10 transition-colors duration-300">
              <Link href="/qr" className="w-[64px] h-[64px] bg-[hsl(var(--card))] rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-transform active:scale-90">
                <QrCode 
                  size={30} 
                  className="text-[hsl(var(--accent))] drop-shadow-[0_0_8px_rgba(28,170,136,0.5)] dark:drop-shadow-[0_0_12px_rgba(28,170,136,0.9)]" 
                  strokeWidth={2.5} 
                />
              </Link>
            </div>

            {/* 3. Profil ikonkasi (Aktiv bo'lganda drop-shadow bilan yonadi) */}
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