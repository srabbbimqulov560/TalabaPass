import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { QRCode } from 'react-qrcode-logo';
import { GraduationCap } from 'lucide-react';

export default function QrPage() {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // 30 soniyalik xavfsizlik va QR kod qiymati
  const [qrKey, setQrKey] = useState(Date.now()); 
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    async function fetchStudent() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('students').select('*').eq('id', user.id).single();
        setStudent(data);
      }
      setLoading(false);
    }
    fetchStudent();
  }, []);

  // Timer va avtomatik yangilanish mantiqi
  useEffect(() => {
    if (!student) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setQrKey(Date.now()); 
          return 30; 
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [student]);

  if (loading) {
    return (
      <div className="page-enter pb-20 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="text-center mb-8 flex flex-col items-center animate-pulse">
          <div className="h-7 bg-[hsl(var(--muted))] rounded-md w-48 mb-3"></div>
          <div className="h-4 bg-[hsl(var(--muted))] rounded-md w-36"></div>
        </div>
        <div className="w-full max-w-[280px] bg-white dark:bg-[#1e293b] rounded-[40px] p-6 shadow-xl flex flex-col items-center animate-pulse transition-colors duration-300">
          <div className="bg-[hsl(var(--muted))] rounded-3xl mb-6 w-full aspect-square"></div>
          <div className="w-full h-12 bg-[hsl(var(--muted))] rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!student) return null;

  const qrValue = `${student.id}|${qrKey}`;
  const progressPercentage = (timeLeft / 30) * 100;

  return (
    <div className="page-enter pb-20 flex flex-col items-center justify-center min-h-[70vh] px-4">
      
      <div className="text-center mb-10">
        <h1 className="font-display text-2xl font-bold text-[hsl(var(--foreground))]">Xarid uchun QR Kod</h1>
        <p className="text-[13px] font-medium text-[hsl(var(--muted-foreground))] mt-1">
          Buni do'konda kadrga tuting
        </p>
      </div>

      {/* 🌟 KARTOCHKA FONI (Tungi rejimda to'q-ko'k bo'ladi) */}
      <div className="relative w-full max-w-[290px] bg-white dark:bg-[#1e293b] rounded-[40px] p-6 shadow-2xl flex flex-col items-center transition-colors duration-300">
        
        {/* 🌟 JONLI YASHIL RAMKA */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" style={{ transform: 'scaleX(-1)' }}>
          <rect
            x="2" y="2"
            width="calc(100% - 4px)" height="calc(100% - 4px)"
            rx="38" ry="38" // Qirralar yanada yumshatildi
            fill="none"
            stroke="#10b981"
            strokeWidth="4"
            pathLength="100"
            strokeDasharray={`${progressPercentage} 100`}
            strokeDashoffset="0"
            className="transition-all duration-1000 ease-linear"
            strokeLinecap="round"
          />
        </svg>

        <div className="relative w-full aspect-square flex items-center justify-center mb-5 z-10 rounded-2xl">
          
          {/* 🌟 NUQTALI, SILLIQ VA NEON YORUG'LIKKA EGA YASHIL QR KOD */}
          <div style={{ filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.45))' }}>
            <QRCode 
              value={qrValue} 
              size={220} 
              ecLevel="H"
              qrStyle="dots" 
              fgColor="#10b981" // Yashil neon
              bgColor="transparent" // Orqa fon kartochka rangini (oq yoki to'q ko'k) oladi
              eyeRadius={12} // 🌟 Qirralar maksimal silliq (aylana) shaklga keldi
            />
          </div>
          
          {/* 🌟 O'RTADAGI STATIK LOGO (Tungi rejimga moslashuvchi) */}
          <div className="absolute w-14 h-14 bg-white dark:bg-[#1e293b] rounded-[18px] flex items-center justify-center shadow-md border-[4px] border-white dark:border-[#1e293b] z-20 transition-colors duration-300">
            <GraduationCap size={32} className="text-[#10b981]" strokeWidth={2.5} />
          </div>
          
        </div>
        
        {/* KULRANG VAQT QUTISI (Tungi rejimda to'q kulrang bo'ladi) */}
        <div className="bg-[#f0f2f5] dark:bg-slate-700/50 text-[#6b7280] dark:text-slate-300 font-semibold py-3.5 px-6 rounded-2xl w-full text-center text-[15px] z-10 flex items-center justify-center gap-2 transition-colors duration-300">
          Amal qilish vaqti 
          <span className="font-mono text-[#374151] dark:text-white font-bold">
            00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
          </span>
        </div>
        
      </div>
    </div>
  );
}