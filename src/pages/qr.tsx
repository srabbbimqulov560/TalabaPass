import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { QRCode } from 'react-qrcode-logo';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

export default function QrPage() {
  const [, setLocation] = useLocation();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // 🌟 URL PARAMETRLARINI OLISH
  const [queryParams, setQueryParams] = useState({ d: '', i: '' });

  // 30 soniyalik xavfsizlik va QR kod qiymati
  const [qrKey, setQrKey] = useState(Date.now()); 
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    // URL dan d (discount) va i (item) ni o'qib olamiz
    const params = new URLSearchParams(window.location.search);
    setQueryParams({ 
      d: params.get('d') || '', 
      i: params.get('i') || '' 
    });

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
          setQrKey(Date.now()); // Har 30 sekunda yangi kod yaratiladi
          return 30; 
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [student]);

  if (loading) return <div className="page-enter pb-20 flex flex-col items-center justify-center min-h-[70vh]"><div className="animate-pulse h-10 w-48 bg-[hsl(var(--muted))] rounded-md"></div></div>;
  if (!student) return null;

  // 🌟 SIRLI QR KOD QIYMATI (Student ID | Timestamp | Discount ID | Item Name)
  const qrValue = `${student.id}|${qrKey}|${queryParams.d}|${queryParams.i}`;
  const progressPercentage = (timeLeft / 30) * 100;

  return (
    <div className="page-enter pb-20 flex flex-col items-center justify-center min-h-[80vh] px-4 relative">
      
      <button onClick={() => window.history.back()} className="absolute top-6 left-6 p-2 rounded-full hover:bg-[hsl(var(--secondary))] transition-colors text-[hsl(var(--muted-foreground))]">
         <ArrowLeft size={24} />
      </button>

      <div className="text-center mb-10 mt-10">
        <h1 className="font-display text-2xl font-bold text-[hsl(var(--foreground))]">Xarid uchun QR Kod</h1>
        <p className="text-[13px] font-medium text-[hsl(var(--muted-foreground))] mt-2 px-6">
          Buni do'kondagi sotuvchiga ko'rsating. Uskuna o'zi maxsulotingizni aniqlaydi.
        </p>
      </div>

      <div className="relative w-full max-w-[290px] bg-white dark:bg-[#1e293b] rounded-[40px] p-6 shadow-2xl flex flex-col items-center transition-colors duration-300">
        
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" style={{ transform: 'scaleX(-1)' }}>
          <rect
            x="2" y="2" width="calc(100% - 4px)" height="calc(100% - 4px)" rx="38" ry="38"
            fill="none" stroke="#10b981" strokeWidth="4" pathLength="100"
            strokeDasharray={`${progressPercentage} 100`} strokeDashoffset="0"
            className="transition-all duration-1000 ease-linear" strokeLinecap="round"
          />
        </svg>

        <div className="relative w-full aspect-square flex items-center justify-center mb-5 z-10 rounded-2xl">
          <div style={{ filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.45))' }}>
            <QRCode 
              value={qrValue} 
              size={220} 
              ecLevel="H"
              qrStyle="dots" 
              fgColor="#10b981" 
              bgColor="transparent" 
              eyeRadius={12} 
            />
          </div>
          
          <div className="absolute w-14 h-14 bg-white dark:bg-[#1e293b] rounded-[18px] flex items-center justify-center shadow-md border-[4px] border-white dark:border-[#1e293b] z-20 transition-colors duration-300">
            <GraduationCap size={32} className="text-[#10b981]" strokeWidth={2.5} />
          </div>
        </div>
        
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