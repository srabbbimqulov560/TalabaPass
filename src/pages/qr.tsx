import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import QRCode from 'react-qr-code';

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
          setQrKey(Date.now()); // QR kod tarkibini o'zgartiradi
          return 30; // Timerni yana 30 dan boshlaydi
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [student]);

  if (loading) {
    return <div className="flex justify-center pt-40"><Loader2 className="animate-spin text-[hsl(var(--accent))]" size={40}/></div>;
  }

  if (!student) return null;

  // QR KOD QIYMATI: Talaba UUID'si va tasodifiy kalit (Skaner shuni o'qib tekshiradi)
  const qrValue = `${student.id}|${qrKey}`;

  return (
    <div className="page-enter pb-20 flex flex-col items-center justify-center min-h-[70vh]">
      
      <div className="text-center mb-8">
        <h1 className="font-display text-2xl font-bold text-[hsl(var(--foreground))]">Xarid uchun QR Kod</h1>
        <p className="text-[13px] font-medium text-[hsl(var(--muted-foreground))] mt-1">
          Buni do'konda kadrga tuting
        </p>
      </div>

      {/* MUKAMMAL, TOZA VA MINIMALIST QUTI */}
      <div className="w-full max-w-[280px] bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] rounded-[32px] shadow-2xl p-6 flex flex-col items-center">
        
        {/* OQ QR KOD FON */}
        <div className="bg-white p-3 rounded-2xl mb-6 shadow-sm border border-[hsl(var(--border))] w-full aspect-square flex items-center justify-center">
          <QRCode 
            value={qrValue} 
            size={200} 
            style={{ height: "auto", maxWidth: "100%", width: "100%" }} 
          />
        </div>
        
        {/* VIZUAL TIMER PROGRESS BAR */}
        <div className="w-full pb-1">
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
              Yangilanish vaqti
            </span>
            <span className="text-[11px] font-bold text-[hsl(var(--foreground))] font-mono">
              00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </span>
          </div>
          
          <div className="w-full h-1.5 bg-[hsl(var(--secondary))] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[hsl(var(--primary))] transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${(timeLeft / 30) * 100}%` }}
            />
          </div>
        </div>
        
      </div>
    </div>
  );
}