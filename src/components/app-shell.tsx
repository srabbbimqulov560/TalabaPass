import { Bookmark, Compass, UserRound, Globe, LogIn, LogOut } from 'lucide-react';
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
        { href: '/', label: t('discover'), icon: Compass },
        { href: '/profile', label: t('my_pass'), icon: UserRound },
      ]
    : [
        { href: '/', label: t('discover'), icon: Compass },
      ];

  const mobileNavItems = isLoggedIn
    ? [
        { href: '/', label: t('discover'), icon: Compass },
        { href: '/profile', label: t('my_pass'), icon: UserRound },
      ]
    : [
        { href: '/', label: t('discover'), icon: Compass },
        { href: '/login', label: t('login_btn'), icon: LogIn },
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
                <Link href="/profile" className="flex items-center gap-2.5 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2 py-1.5 shadow-sm transition-transform hover:-translate-y-0.5">
                  <span className="hidden pl-2 text-xs font-semibold text-[hsl(var(--foreground))] sm:block">{t('my_profile')}</span>
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f1c46b] font-display text-xs font-bold text-[#6c4214]">SP</span>
                </Link>
                <button onClick={handleLogout} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Tizimdan chiqish">
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
      
      <main className="mx-auto max-w-7xl px-5 pb-24 pt-7 md:px-8 md:pb-12">{children}</main>
      
      <nav className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-around rounded-[22px] border border-[hsl(var(--border))] bg-[hsl(var(--card)/.94)] p-2 shadow-float backdrop-blur-xl md:hidden">
        {mobileNavItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={`flex min-w-[112px] flex-col items-center gap-1 rounded-2xl px-5 py-2 text-[11px] font-semibold ${location === href ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'text-[hsl(var(--muted-foreground))]'}`}>
            <Icon size={18} />{label}
          </Link>
        ))}
        {/* Mobil menyu uchun chiqish tugmasi */}
        {isLoggedIn && (
          <button onClick={handleLogout} className="flex min-w-[112px] flex-col items-center gap-1 rounded-2xl px-5 py-2 text-[11px] font-semibold text-red-500">
            <LogOut size={18} /> Chiqish
          </button>
        )}
      </nav>
    </div>
  );
}