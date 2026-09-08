import { Store, Tags, ScanLine, History, Settings } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import type { ReactNode } from 'react';

export function MerchantAppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-[100dvh] w-full bg-[hsl(var(--background))]">
      <header className="sticky top-0 z-40 border-b border-[hsl(var(--border)/.8)] bg-[hsl(var(--background)/.88)] backdrop-blur-xl">
        <div className="relative mx-auto flex h-[72px] items-center justify-center px-5">
          <span className="font-display text-[19px] font-bold text-[hsl(var(--primary))]">Biznes<span className="text-[hsl(var(--accent))]">Panel</span></span>
        </div>
      </header>
      
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6">
        {children}
      </main>
      
      {/* BIZNES PASTKI MENYUSI */}
      <nav className="fixed bottom-0 left-0 w-full bg-[hsl(var(--card))] rounded-t-[28px] shadow-[0_-10px_40px_rgba(0,0,0,0.06)] border-t border-[hsl(var(--border)/.5)] z-50 h-[76px]">
        <div className="flex justify-between items-center h-full px-4 relative">
          
          <div className="flex justify-around items-center w-[40%] z-20">
            <Link href="/merchant" className="flex flex-col items-center justify-center gap-1 h-full mt-1">
              <Store size={22} className={location === '/merchant' ? "text-[hsl(var(--accent))] drop-shadow-[0_0_8px_rgba(28,170,136,0.6)]" : "text-[hsl(var(--muted-foreground))]"} strokeWidth={location === '/merchant' ? 2.5 : 2} />
              <span className={`text-[10px] font-bold ${location === '/merchant' ? "text-[hsl(var(--accent))]" : "text-[hsl(var(--muted-foreground))]"}`}>Asosiy</span>
            </Link>
            <Link href="/merchant/discounts" className="flex flex-col items-center justify-center gap-1 h-full mt-1">
              <Tags size={22} className={location === '/merchant/discounts' ? "text-[hsl(var(--accent))] drop-shadow-[0_0_8px_rgba(28,170,136,0.6)]" : "text-[hsl(var(--muted-foreground))]"} strokeWidth={location === '/merchant/discounts' ? 2.5 : 2} />
              <span className={`text-[10px] font-bold ${location === '/merchant/discounts' ? "text-[hsl(var(--accent))]" : "text-[hsl(var(--muted-foreground))]"}`}>Chegirmalar</span>
            </Link>
          </div>

          {/* O'RTADAGI KATTA QR SKANER TUGMASI */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-8 w-[88px] h-[88px] bg-[hsl(var(--background))] rounded-full flex items-center justify-center z-10">
            <Link href="/merchant/scanner" className="w-[64px] h-[64px] bg-[hsl(var(--accent))] rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(28,170,136,0.4)] transition-transform active:scale-90">
              <ScanLine size={32} className="text-white" strokeWidth={2.5} />
            </Link>
          </div>

          <div className="flex justify-around items-center w-[40%] z-20">
            <Link href="/merchant/history" className="flex flex-col items-center justify-center gap-1 h-full mt-1">
              <History size={22} className={location === '/merchant/history' ? "text-[hsl(var(--accent))] drop-shadow-[0_0_8px_rgba(28,170,136,0.6)]" : "text-[hsl(var(--muted-foreground))]"} strokeWidth={location === '/merchant/history' ? 2.5 : 2} />
              <span className={`text-[10px] font-bold ${location === '/merchant/history' ? "text-[hsl(var(--accent))]" : "text-[hsl(var(--muted-foreground))]"}`}>Tarix</span>
            </Link>
            <Link href="/merchant/profile" className="flex flex-col items-center justify-center gap-1 h-full mt-1">
              <Settings size={22} className={location === '/merchant/profile' ? "text-[hsl(var(--accent))] drop-shadow-[0_0_8px_rgba(28,170,136,0.6)]" : "text-[hsl(var(--muted-foreground))]"} strokeWidth={location === '/merchant/profile' ? 2.5 : 2} />
              <span className={`text-[10px] font-bold ${location === '/merchant/profile' ? "text-[hsl(var(--accent))]" : "text-[hsl(var(--muted-foreground))]"}`}>Sozlamalar</span>
            </Link>
          </div>

        </div>
      </nav>
    </div>
  );
}