import { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import QRCode from 'react-qr-code';

export default function QrPage() {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [qrKey, setQrKey] = useState(Date.now()); // Yashirin dinamik kod
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

  // MANTIQ SAQLANIB QOLDI: Har 30 soniyada QR kodni ichki qiymati o'zgaradi (Ekranda sezdirmasdan)
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

  // QR KOD ICHIDAGI YASHIRIN YOZUV (UUID va Vaqt). Tashqarida ko'rinmaydi.
  const qrValue = `${student.id}|${qrKey}`;

  return (
    <div className="page-enter pb-20 flex flex-col items-center">
      
      <div className="text-center mb-8">
        <h1 className="font-display text-2xl font-bold text-[hsl(var(--foreground))]">Talaba ID Karta</h1>
        <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] mt-1">
          Chegirma olish uchun do'konga ko'rsating
        </p>
      </div>

      <div className="relative w-[300px] h-[460px] perspective-1000 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
        <div 
          className="w-full h-full transition-transform duration-700 ease-out"
          style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          {/* KARTA OLDI TOMONI */}
          <div className="absolute w-full h-full rounded-[32px] overflow-hidden bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] shadow-2xl flex flex-col p-6" style={{ backfaceVisibility: 'hidden' }}>
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

          {/* KARTA ORQA TOMONI (OLDINGI TOZA DIZAYN) */}
          <div 
            className="absolute w-full h-full rounded-[32px] bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] shadow-2xl flex flex-col items-center justify-center p-6"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="flex-1 flex flex-col items-center justify-center w-full">
              
              {/* Katta oq QR Kod qutisi */}
              <div className="bg-white p-5 rounded-3xl mb-6 shadow-sm border border-[hsl(var(--border))]">
                <QRCode value={qrValue} size={180} />
              </div>
              
              {/* Tasdiqlangan badgi */}
              <div className="flex items-center gap-1.5 bg-green-500/10 text-green-500 px-5 py-2.5 rounded-full font-bold text-[15px] mb-6 border border-green-500/20">
                <CheckCircle2 size={20} /> Verified Student
              </div>
              
              {/* Amal qilish muddati */}
              <div className="text-center w-full bg-[hsl(var(--secondary))] py-4 rounded-[20px]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-1.5">Amal qilish muddati</p>
                <p className="text-[15px] font-extrabold text-[hsl(var(--foreground))]">2024 - 2028</p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}