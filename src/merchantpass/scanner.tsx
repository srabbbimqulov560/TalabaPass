import { useState } from 'react';
import { QrCode, CheckCircle2, XCircle, Loader2, User } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { supabase } from '@/lib/supabase';

export default function MerchantScanner() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; student?: any } | null>(null);

  const handleScan = async (text: string) => {
    if (loading || result) return; // Agar tekshirilayotgan bo'lsa yoki natija chiqqan bo'lsa to'xtatish
    setLoading(true);

    try {
      // 1. Bazadan shunday ID ga ega talaba bormi tekshiramiz
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', text)
        .single();

      if (studentError || !student) {
        throw new Error("Bunday talaba topilmadi yoki QR kod yaroqsiz!");
      }

      // 2. Do'kon sessiyasini olamiz
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Do'kon akkauntiga kirilmagan!");

      // 3. Skanerlash tarixiga yozamiz
      await supabase.from('scan_history').insert({
        merchant_id: user.id,
        student_id: student.id
      });

      // 4. Ekranda tasdiqlanganini ko'rsatamiz
      setResult({
        success: true,
        message: "Talaba tasdiqlandi!",
        student: student
      });

    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || "Xatolik yuz berdi"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter pb-20">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))]">Skaner</h2>
        <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] mt-1">Talaba ID kartasini skanerlang</p>
      </div>

      {!result ? (
        <div className="relative w-full max-w-sm mx-auto overflow-hidden rounded-[32px] bg-black shadow-2xl border-4 border-[hsl(var(--border))]">
          {/* @yudiel/react-qr-scanner kutubxonasi kamerani ochadi */}
          <Scanner 
            onScan={(detectedCodes) => {
              // Yangi versiyada massiv qaytadi
              if (detectedCodes && detectedCodes.length > 0) {
                handleScan(detectedCodes[0].rawValue);
              }
            }} 
            onError={(err) => console.log(err)}
          />
          
          <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none"></div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 border-2 border-white/50 rounded-3xl relative">
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[hsl(var(--accent))] rounded-tl-xl"></div>
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[hsl(var(--accent))] rounded-tr-xl"></div>
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[hsl(var(--accent))] rounded-bl-xl"></div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[hsl(var(--accent))] rounded-br-xl"></div>
            </div>
          </div>
          
          {loading && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white backdrop-blur-sm z-50">
              <Loader2 className="animate-spin text-[hsl(var(--accent))] mb-3" size={40}/>
              <p className="font-bold">Tekshirilmoqda...</p>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full max-w-sm mx-auto bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-6 rounded-[32px] text-center shadow-lg animate-in zoom-in-95">
          {result.success ? (
            <>
              <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] mb-1">{result.message}</h3>
              
              <div className="bg-[hsl(var(--secondary))] p-4 rounded-2xl mt-4 text-left flex items-center gap-4">
                {result.student?.avatar_url ? (
                  <img src={result.student.avatar_url} className="w-12 h-12 rounded-full object-cover border border-[hsl(var(--border))]" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center"><User size={20}/></div>
                )}
                <div>
                  <p className="font-bold text-[hsl(var(--foreground))]">{result.student?.first_name} {result.student?.last_name}</p>
                  <p className="text-[12px] font-semibold text-[hsl(var(--muted-foreground))]">{result.student?.university}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle size={40} />
              </div>
              <h3 className="font-display text-xl font-bold text-[hsl(var(--foreground))]">{result.message}</h3>
            </>
          )}

          <button 
            onClick={() => setResult(null)} 
            className="w-full py-4 mt-6 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold rounded-2xl shadow-float active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <QrCode size={18} /> Yangi skanerlash
          </button>
        </div>
      )}
    </div>
  );
}