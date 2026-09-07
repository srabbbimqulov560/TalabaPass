import { Bookmark, Home, UserRound, Globe, LogIn, LogOut, QrCode } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useState, useEffect, type ReactNode } from 'react';
import { useLanguage } from '@/lib/i18n';

export function AppShell({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { t, lang, setLang } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);
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
        { href: '/', label: t('discover'), icon: Home },
        { href: '/saved', label: t('saved_offers'), icon: Bookmark },
      ]
    : [
        { href: '/', label: t('discover'), icon: Home },
      ];

  const handleLangSelect = (selectedLang: 'uz' | 'en' | 'ru') => {
    setLang(selectedLang);
    setLangOpen(false);
  };

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
            <div className="relative mr-2 flex items-center gap-1 text-[hsl(var(--muted-foreground))] cursor-pointer" onClick={() => setLangOpen(!langOpen)}>
              <Globe size={18} className="hover:text-[hsl(var(--foreground))] transition-colors" />
              <span className="text-xs font-bold uppercase hover:text-[hsl(var(--foreground))] transition-colors">{lang}</span>
              
              {langOpen && (
                <div className="absolute right-0 top-8 flex flex-col rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1 shadow-float z-50 min-w-[120px]">
                  <button onClick={(e) => { e.stopPropagation(); handleLangSelect('uz'); }} className="rounded-lg px-4 py-2 text-left text-sm font-semibold hover:bg-[hsl(var(--secondary))]">O'zbek</button>
                  <button onClick={(e) => { e.stopPropagation(); handleLangSelect('en'); }} className="rounded-lg px-4 py-2 text-left text-sm font-semibold hover:bg-[hsl(var(--secondary))]">English</button>
                  <button onClick={(e) => { e.stopPropagation(); handleLangSelect('ru'); }} className="rounded-lg px-4 py-2 text-left text-sm font-semibold hover:bg-[hsl(var(--secondary))]">Русский</button>
                </div>
              )}
            </div>

            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                {/* SP profili olib tashlanib, orniga Saqlanganlar (Bookmark) qo'yildi */}
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
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[hsl(var(--card))] rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.06)] z-50 h-[84px] border-t border-[hsl(var(--border)/.5)]">
          <div className="flex justify-between items-center h-full px-10 relative">
            
            {/* 1. Home ikonkasi (Faqat chiziq rangi o'zgaradi, fill olib tashlandi) */}
            <Link href="/" className="flex flex-col items-center justify-center z-20 w-16 h-full">
              <Home size={28} className={location === '/' ? "text-[hsl(var(--accent))]" : "text-[hsl(var(--muted-foreground))]"} strokeWidth={location === '/' ? 2.5 : 2} />
            </Link>

            {/* 2. O'rtadagi QR Scanner (QrCode ikonkasi qo'yildi va xato "ort" yozuvi o'chirildi) */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-8 w-[92px] h-[92px] bg-[hsl(var(--background))] rounded-full flex items-center justify-center z-10">
              <Link href="/qr" className="w-[68px] h-[68px] bg-[hsl(var(--card))] rounded-full flex items-center justify-center shadow-[0_8px_25px_rgba(28,170,136,0.3)] transition-transform active:scale-90 border-[3px] border-[hsl(var(--accent))]">
                <QrCode size={30} className="text-[hsl(var(--accent))]" strokeWidth={2.5} />
              </Link>
            </div>

            {/* 3. Profil ikonkasi (Faqat chiziq rangi o'zgaradi, fill olib tashlandi) */}
            <Link href="/profile" className="flex flex-col items-center justify-center z-20 w-16 h-full">
              <UserRound size={28} className={location === '/profile' ? "text-[hsl(var(--accent))]" : "text-[hsl(var(--muted-foreground))]"} strokeWidth={location === '/profile' ? 2.5 : 2} />
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