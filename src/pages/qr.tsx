import { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import QRCode from 'react-qr-code';

export default function QrPage() {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Xavfsizlik: 30 soniyalik taymer
  const [timeLeft, setTimeLeft] = useState(30);
  const [qrKey, setQrKey] = useState(Date.now()); // QR kodni yangilab turish uchun
  
  const [isFlipped, setIsFlipped] = useState(false);

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

  // Har 1 soniyada taymerni kamaytirish va 30s da QR ni yangilash
  useEffect(() => {
    if (!student) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setQrKey(Date.now()); // Yangi vaqt muhri (Timestamp) olinadi
          return 30; // Taymer yana 30 dan boshlanadi
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [student]);

  if (loading) {
    return <div className="flex justify-center pt-40"><Loader2 className="animate-spin text-[hsl(var(--accent))]" size={40}/></div>;
  }

  if (!student) {
    return (
      <div className="page-enter py-20 text-center">
        <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="font-bold text-xl text-[hsl(var(--foreground))]">Talaba profili topilmadi</h2>
      </div>
    );
  }

  // QR KOD ICHIDAGI SIRLI YONZUV: TalabaID + "|" + Yaratilgan Vaqt
  const qrValue = `${student.id}|${qrKey}`;

  return (
    <div className="page-enter pb-20 flex flex-col items-center">
      
      <div className="text-center mb-8">
        <h1 className="font-display text-2xl font-bold text-[hsl(var(--foreground))]">Talaba ID Karta</h1>
        <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] mt-1">
          Chegirma olish uchun do'konga ko'rsating
        </p>
      </div>

      {/* 3D KARTA KONTEYNERI */}
      <div className="relative w-[300px] h-[460px] perspective-1000 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
        <div 
          className="w-full h-full transition-transform duration-700 ease-out"
          style={{ 
            transformStyle: 'preserve-3d', 
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' 
          }}
        >
          {/* KARTA OLDI TOMONI */}
          <div 
            className="absolute w-full h-full rounded-[32px] overflow-hidden bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] shadow-2xl flex flex-col p-6"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-xl bg-[hsl(var(--accent)/.1)] flex items-center justify-center text-[hsl(var(--accent))]">
                <ShieldCheck size={28} />
              </div>
              <span className="text-[10px] font-bold tracking-widest text-[hsl(var(--accent))] uppercase bg-[hsl(var(--accent)/.1)] px-3 py-1.5 rounded-full">TalabaPass</span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-32 h-32 rounded-full bg-[hsl(var(--secondary))] mb-4 border-4 border-[hsl(var(--background))] shadow-lg overflow-hidden">
                {student.avatar_url ? (
                  <img src={student.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[hsl(var(--muted-foreground))] font-bold text-3xl">
                    {student.first_name[0]}{student.last_name[0]}
                  </div>
                )}
              </div>
              <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] leading-tight mb-1">
                {student.first_name} {student.last_name}
              </h2>
              <p className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">
                ID: {student.student_id}
              </p>
              <p className="text-sm font-semibold text-[hsl(var(--primary))] bg-[hsl(var(--primary)/.1)] px-4 py-1.5 rounded-xl">
                {student.university}
              </p>
            </div>
            
            <div className="text-center mt-4">
              <p className="text-[11px] font-bold text-[hsl(var(--muted-foreground))] animate-pulse">QR kodni ko'rish uchun bosing</p>
            </div>
          </div>

          {/* KARTA ORQA TOMONI (QR KOD) */}
          <div 
            className="absolute w-full h-full rounded-[32px] bg-black border-2 border-[hsl(var(--border))] shadow-2xl flex flex-col items-center justify-center p-8"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="bg-white p-4 rounded-3xl w-full aspect-square mb-6">
              <QRCode 
                value={qrValue} 
                size={256} 
                style={{ height: "auto", maxWidth: "100%", width: "100%" }} 
              />
            </div>
            
            <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
              <RefreshCw size={18} className="animate-spin-slow" /> Dinamik Kod
            </h3>
            
            {/* TAYMER PROGRESS BAR */}
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-[hsl(var(--accent))] transition-all duration-1000 ease-linear"
                style={{ width: `${(timeLeft / 30) * 100}%` }}
              />
            </div>
            <p className="text-[12px] font-medium text-white/60 text-center">
              Xavfsizlik uchun kod <span className="font-bold text-white">{timeLeft} soniyada</span> yangilanadi. Skrinshot o'tmaydi.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}