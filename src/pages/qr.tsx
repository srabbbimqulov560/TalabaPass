import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, AlertTriangle, QrCode } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import QRCode from 'react-qr-code';

export default function QrPage() {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // 30 soniyalik xavfsizlik kaliti (QR kod ichida)
  const [qrKey, setQrKey] = useState(Date.now()); 

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

  // Har 30 soniyada QR kod tarkibini sezilarsiz yangilash (Skrinshotka qarshi)
  useEffect(() => {
    if (!student) return;
    const timer = setInterval(() => {
      setQrKey(Date.now()); 
    }, 30000); 

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
  
if (student && !student.is_active) {
    return (
      <div className="page-enter py-20 px-6 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-24 h-24 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center mb-6 border-4 border-orange-500/20">
          <Loader2 className="animate-spin" size={40} />
        </div>
        <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] mb-3">
          Arizangiz ko'rib chiqilmoqda
        </h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed max-w-sm">
          Sizning Talaba ID ma'lumotlaringiz administratorlar tomonidan tekshirilmoqda. Tasdiqlangach, bu yerda chegirma olish uchun QR kodingiz paydo bo'ladi.
        </p>
      </div>
    );
  }
  // QR KOD QIYMATI: Talaba UUID'si va joriy vaqt (Skaner shuni o'qib tekshiradi)
  const qrValue = `${student.id}|${qrKey}`;

  return (
    <div className="page-enter pb-20 flex flex-col items-center">
      
      <div className="text-center mb-8">
        <h1 className="font-display text-2xl font-bold text-[hsl(var(--foreground))]">Sizning QR Kodingiz</h1>
        <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] mt-1">
          Chegirma olish uchun buni do'konga ko'rsating
        </p>
      </div>

      <div className="w-full max-w-sm bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] rounded-[32px] shadow-lg p-8 flex flex-col items-center">
        
        {/* TOZA OQ QR KOD (Skanerga qulay) */}
        <div className="bg-white p-5 rounded-3xl mb-6 shadow-sm border border-[hsl(var(--border))] w-full aspect-square flex items-center justify-center">
          <QRCode 
            value={qrValue} 
            size={220} 
            style={{ height: "auto", maxWidth: "100%", width: "100%" }} 
          />
        </div>
        
        {/* TASDIQLANGAN BADGI */}
        <div className="flex items-center gap-2 bg-green-500/10 text-green-500 px-6 py-3 rounded-full font-bold text-[16px] mb-8 border border-green-500/20">
          <CheckCircle2 size={22} /> Tasdiqlangan Talaba
        </div>

        {/* TALABA MA'LUMOTLARI */}
        <div className="w-full text-center">
          <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] leading-tight mb-1">
            {student.first_name} {student.last_name}
          </h2>
          <p className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-4">
            ID: {student.student_id}
          </p>
          <div className="inline-block bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] px-4 py-2 rounded-xl">
            <p className="text-[13px] font-semibold text-[hsl(var(--foreground))]">
              {student.university}
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}