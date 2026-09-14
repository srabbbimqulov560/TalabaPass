import { useState } from 'react';
import { QrCode, CheckCircle2, XCircle, Loader2, User, RefreshCcw } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { supabase } from '@/lib/supabase';

export default function MerchantScanner() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; student?: any } | null>(null);

  const handleScan = async (text: string) => {
    if (loading || result) return; 
    setLoading(true);

    try {
      let searchId = text; // Asl ID ni qidirish uchun

      // 1. XAVFSIZLIK: Dinamik 30 soniyalik QR kod mantig'i
      if (text.includes('|')) {
        const [scannedId, timestampStr] = text.split('|');
        const timestamp = parseInt(timestampStr, 10);
        const timeDiff = Date.now() - timestamp; // Qancha vaqt o'tgani

        // Agar 30 soniyadan (30000 ms) ko'p vaqt o'tgan bo'lsa - BLOKLASH!
        if (timeDiff > 30000 || timeDiff < 0) {
          throw new Error("QR kod muddati tugagan! Talabadan dasturga kirib kodni yangilashni so'rang (Skrinshot o'tmaydi).");
        }
        
        searchId = scannedId; // Agar vaqt to'g'ri bo'lsa, ID ni olamiz
      }

      // 2. Bazadan talabani qidirish
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(searchId);
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq(isUUID ? 'id' : 'student_id', searchId)
        .maybeSingle();

      if (studentError || !student) {
        throw new Error("Bunday talaba bazadan topilmadi!");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Do'kon akkauntiga kirilmagan!");

      // 3. Skanerlash tarixiga yozamiz
      await supabase.from('scan_history').insert({
        merchant_id: user.id,
        student_id: student.id
      });

      // 4. Tasdiqlandi
      setResult({
        success: true,
        message: "Tasdiqlandi!",
        student: student
      });

    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || "Noma'lum xatolik"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter pb-20">
      
      <style>{`
        @keyframes scan-laser {
          0%, 100% { transform: translateY(0); opacity: 0; }
          10%, 90% { opacity: 1; }
          50% { transform: translateY(240px); }
        }
        .animate-scan-laser {
          animation: scan-laser 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>

      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))]">Talabani Tasdiqlash</h2>
        <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] mt-1">ID kartadagi QR kodni ekranga tuting</p>
      </div>

      {!result ? (
        <div className="relative w-full aspect-[3/4] max-w-sm mx-auto overflow-hidden rounded-[40px] bg-black shadow-2xl border-4 border-[hsl(var(--border))]">
          
          <Scanner 
            components={{ finder: false }}
            onScan={(detectedCodes) => {
              if (detectedCodes && detectedCodes.length > 0) handleScan(detectedCodes[0].rawValue);
            }} 
            onError={(err) => console.log(err)}
          />
          
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] rounded-[32px] shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] border-2 border-white/20 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-[hsl(var(--accent))] shadow-[0_0_20px_4px_hsl(var(--accent))] animate-scan-laser" />
              <div className="absolute -top-[2px] -left-[2px] w-10 h-10 border-t-4 border-l-4 border-[hsl(var(--accent))] rounded-tl-[32px]"></div>
              <div className="absolute -top-[2px] -right-[2px] w-10 h-10 border-t-4 border-r-4 border-[hsl(var(--accent))] rounded-tr-[32px]"></div>
              <div className="absolute -bottom-[2px] -left-[2px] w-10 h-10 border-b-4 border-l-4 border-[hsl(var(--accent))] rounded-bl-[32px]"></div>
              <div className="absolute -bottom-[2px] -right-[2px] w-10 h-10 border-b-4 border-r-4 border-[hsl(var(--accent))] rounded-br-[32px]"></div>
            </div>
          </div>
          
          {loading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-md z-50 animate-in fade-in duration-200">
              <Loader2 className="animate-spin text-[hsl(var(--accent))] mb-4" size={48}/>
              <p className="font-bold text-lg tracking-wide">Tekshirilmoqda...</p>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full max-w-sm mx-auto bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-8 rounded-[40px] text-center shadow-xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
          {result.success ? (
            <>
              <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-green-500/20">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] mb-2">{result.message}</h3>
              <p className="text-[13px] font-semibold text-[hsl(var(--muted-foreground))]">Ushbu talabaga chegirma berishingiz mumkin</p>
              
              <div className="bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] p-5 rounded-[24px] mt-6 text-left flex items-center gap-4">
                {result.student?.avatar_url ? (
                  <img src={result.student.avatar_url} className="w-14 h-14 rounded-full object-cover shadow-sm" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center shadow-sm"><User size={24}/></div>
                )}
                <div>
                  <p className="font-bold text-[17px] text-[hsl(var(--foreground))] leading-tight mb-1">{result.student?.first_name} {result.student?.last_name}</p>
                  <p className="text-[12px] font-bold text-[hsl(var(--accent))] uppercase tracking-wider">{result.student?.university}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-red-500/20">
                <XCircle size={48} />
              </div>
              <h3 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] mb-2">Tasdiqlanmadi</h3>
              <p className="text-[14px] font-medium text-[hsl(var(--muted-foreground))] leading-relaxed px-4 text-red-500">{result.message}</p>
            </>
          )}

          <button 
            onClick={() => setResult(null)} 
            className="w-full py-4 mt-8 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold text-[16px] rounded-[20px] shadow-float active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCcw size={18} /> Yangi skanerlash
          </button>
        </div>
      )}
    </div>
  );
}