import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/lib/i18n';

export default function QrPage() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  
  // Taymer (30 soniya)
  const [timeLeft, setTimeLeft] = useState(30);
  
  // Tasodifiy yangilanuvchi "Dynamic" kod
  const [qrCode, setQrCode] = useState(generateCode());

  function generateCode() {
    return `SP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Vaqt tugaganda kodni yangilash va taymerni 30 dan boshlash
          setQrCode(generateCode());
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="page-enter flex flex-col items-center justify-center min-h-[calc(100vh-180px)] pb-10">
      
      <div className="w-full max-w-sm mb-auto mt-4">
        <button 
          type="button" 
          onClick={() => window.history.back()} 
          className="mb-8 flex items-center gap-2 text-sm font-bold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        >
          <ArrowLeft size={17} /> Ortga qaytish
        </button>
      </div>

      <div className="w-full max-w-sm rounded-[32px] bg-[hsl(var(--card))] p-8 text-center shadow-float border border-[hsl(var(--card-border))] relative overflow-hidden">
        
        {/* Orqa fondagi yorug'lik effekti */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-[hsl(var(--accent)/.05)] rounded-full blur-3xl -z-10"></div>

        <h2 className="font-display text-xl font-bold text-[hsl(var(--foreground))] mb-6 mt-2">
          {t('qr_title')}
        </h2>

        {/* HAQIQIY QR Kod va Animatsiya qismi */}
        <div className="relative mx-auto w-[220px] h-[220px] bg-white p-3.5 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center mb-8">
          
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrCode}`} 
            alt="Dynamic QR Code" 
            className="w-full h-full object-contain mix-blend-multiply"
          />
          
          {/* Skanerlanish chizig'i (Cyberpunk scanner line animatsiyasi) */}
          <div className="absolute top-0 left-0 w-full h-1 bg-[hsl(var(--accent))] shadow-[0_0_15px_3px_hsl(var(--accent))] animate-[scan_2.5s_ease-in-out_infinite] z-10 rounded-full"></div>
        </div>

        {/* Dinamik Kod Matni */}
        <div className="font-mono text-2xl font-bold tracking-[.18em] text-[hsl(var(--foreground))] mb-2">
          {qrCode}
        </div>
        
        <p className="text-[13px] font-medium text-[hsl(var(--muted-foreground))] px-4 mb-8">
          {t('qr_desc')}
        </p>

        {/* Progress bar (Vaqt o'tish ko'rsatkichi) */}
        <div className="bg-[hsl(var(--secondary))] h-2.5 rounded-full w-full overflow-hidden mb-2">
           <div 
             className="bg-[hsl(var(--accent))] h-full transition-all duration-1000 ease-linear rounded-full" 
             style={{ width: `${(timeLeft / 30) * 100}%` }}
           ></div>
        </div>
        <div className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">
           {t('refreshing_in')} <span className="text-[hsl(var(--foreground))]">{timeLeft} {t('sec')}</span>
        </div>
        
      </div>
    </div>
  );
}