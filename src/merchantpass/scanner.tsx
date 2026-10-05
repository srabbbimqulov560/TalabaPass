import { useState } from 'react';
import { QrCode, CheckCircle2, XCircle, Loader2, User, RefreshCcw, ShieldAlert, ArrowRight, Package, ShieldCheck, Ticket } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

export default function MerchantScanner() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  
  // 🌟 YAKUNIY KO'RINISH UCHUN STATE'LAR
  const [scannedStudent, setScannedStudent] = useState<any>(null);
  const [scannedDiscount, setScannedDiscount] = useState<any>(null);
  const [scannedItemName, setScannedItemName] = useState<string | null>(null);
  
  const [isConfirming, setIsConfirming] = useState(false);

  const { data: merchantStatus, isLoading: isProfileLoading } = useQuery({
    queryKey: ['merchantStatusCheck'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from('merchants').select('id, is_active, name').eq('id', user.id).single();
      return data;
    }
  });

  const isActive = merchantStatus?.is_active === true;

  // 🌟 NOHAQIY VA BARCHASINI O'Z ICHIGA OLGAN SKANERLASH MANTIG'I
  const handleScan = async (text: string) => {
    if (loading || result || scannedStudent) return; 
    setLoading(true);

    try {
      const parts = text.split('|');
      
      // Yangi formatda kamida 4 ta qism bo'lishi kerak: ID | Vaqt | Chegirma_ID | Item
      if (parts.length < 4) {
         throw new Error("Iltimos, talabaga o'z ilovasidan aniq maxsulotni tanlab, yangi QR kod ko'rsatishini ayting.");
      }

      const [scannedId, timestampStr, discountId, itemName] = parts;
      const decodedItemName = decodeURIComponent(itemName);
      const timestamp = parseInt(timestampStr, 10);
      const timeDiff = Date.now() - timestamp; 

      if (timeDiff > 30000 || timeDiff < 0) {
        throw new Error("QR kod muddati tugagan! Talabadan dasturga kirib kodni yangilashni so'rang.");
      }

      // 1. TALABANI TEKSHIRISH
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', scannedId)
        .maybeSingle();

      if (studentError || !student) throw new Error("Bunday talaba bazadan topilmadi!");
      if (!student.is_active) throw new Error("Bu talaba akkaunti hali tasdiqlanmagan yoki bloklangan!");

      // 2. CHEGIRMANI TEKSHIRISH
      const { data: discount, error: discountError } = await supabase
        .from('discounts')
        .select('*')
        .eq('id', discountId)
        .maybeSingle();

      if (discountError || !discount) throw new Error("Kechirasiz, bunday chegirma topilmadi yoki o'chirilgan.");
      if (discount.merchant_id !== merchantStatus?.id) throw new Error("Diqqat! Bu chegirma sizning do'koningizga tegishli emas!");

      // Vaqtini tekshirish
      const now = new Date();
      const startDT = new Date(`${discount.start_date}T${discount.start_time || '00:00'}`);
      const endDT = new Date(`${discount.end_date}T${discount.end_time || '23:59'}`);
      if (now < startDT) throw new Error("Bu chegirma hali boshlanmagan.");
      if (now > endDT) throw new Error("Bu chegirmaning amal qilish muddati tugagan.");

      // 3. MAHSULOTNI TEKSHIRISH
      let itemFound = null;
      if (discount.items && discount.items.length > 0) {
        itemFound = discount.items.find((i: any) => i.name === decodedItemName);
        if (!itemFound) throw new Error(`"${decodedItemName}" nomli mahsulot bu chegirmada yo'q!`);
        if (!itemFound.isUnlimited && itemFound.quantity <= 0) throw new Error(`"${decodedItemName}" mahsuloti to'liq sotilib ketgan!`);
      }

      // Hamma narsa joyida bo'lsa ekranga chiqaramiz
      setScannedStudent(student);
      setScannedDiscount(discount);
      setScannedItemName(decodedItemName || "Umumiy Chegirma");

    } catch (error: any) {
      setResult({ success: false, message: error.message || "Noma'lum xatolik" });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!scannedStudent || !scannedDiscount || !merchantStatus) return;
    setIsConfirming(true);

    try {
      // 5 daqiqa ichida oldin olganmi tekshiramiz (Spamdan himoya)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: recentScan } = await supabase
        .from('scan_history')
        .select('id')
        .eq('merchant_id', merchantStatus.id)
        .eq('student_id', scannedStudent.id)
        .gte('created_at', fiveMinutesAgo)
        .maybeSingle();

      if (recentScan) {
        throw new Error("Diqqat! Bu talaba so'nggi 5 daqiqa ichida allaqachon chegirma olib bo'lgan.");
      }

      // Miqdorni kamaytirish
      if (scannedDiscount.items && scannedDiscount.items.length > 0) {
        const updatedItems = scannedDiscount.items.map((item: any) => {
           if (item.name === scannedItemName) {
              return { ...item, quantity: item.isUnlimited ? 999999 : item.quantity - 1 };
           }
           return item;
        });

        const { error: updateError } = await supabase.from('discounts').update({ items: updatedItems }).eq('id', scannedDiscount.id);
        if (updateError) throw updateError;
      }

      // Tarixga yozish
      const { error: histError } = await supabase.from('scan_history').insert({
        merchant_id: merchantStatus.id,
        student_id: scannedStudent.id,
        discount_id: scannedDiscount.id,    
        item_name: scannedItemName  
      });
      if (histError) throw histError;

      // Talabaga bildirishnoma
      await supabase.from('notifications').insert({
        user_id: scannedStudent.id,
        title: "Xaridingiz muvaffaqiyatli! 🎉",
        message: `Siz hozirgina "${merchantStatus.name}" do'konidan "${scannedItemName}" xarid qildingiz. Xaridingiz barakali bo'lsin, yana kutib qolamiz!`,
        link: `/store/${merchantStatus.id}`,
        is_read: false
      });

      setResult({ success: true, message: "Xarid muvaffaqiyatli tasdiqlandi!" });
      setScannedStudent(null);
      setScannedDiscount(null);
      setScannedItemName(null);
      
    } catch (error: any) {
      setResult({ success: false, message: error.message || "Xatolik yuz berdi" });
    } finally {
      setIsConfirming(false);
    }
  };

  const resetScanner = () => {
    setResult(null);
    setScannedStudent(null);
    setScannedDiscount(null);
    setScannedItemName(null);
  };

  if (isProfileLoading) {
    return <div className="page-enter pb-20 flex justify-center mt-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;
  }

  if (!isActive) {
    return (
      <div className="page-enter pb-20 px-4 pt-10">
        <div className="text-center mb-8"><h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))]">Skaner bloklangan</h2></div>
        <div className="w-full max-w-sm mx-auto bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-8 rounded-[40px] text-center shadow-xl">
          <div className="w-24 h-24 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-orange-500/20"><ShieldAlert size={48} /></div>
          <h3 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] mb-3">Tasdiqlanmagan</h3>
          <p className="text-[14px] font-medium text-[hsl(var(--muted-foreground))] leading-relaxed px-2">Do'koningiz hozircha adminlar tomonidan tasdiqlanmadi.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter pb-20">
      <style>{`@keyframes scan-laser { 0%, 100% { transform: translateY(0); opacity: 0; } 10%, 90% { opacity: 1; } 50% { transform: translateY(240px); } } .animate-scan-laser { animation: scan-laser 3s cubic-bezier(0.4, 0, 0.2, 1) infinite; }`}</style>

      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))]">
          {scannedStudent ? 'Xaridni tasdiqlash' : 'QR kodni skanerlang'}
        </h2>
        <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] mt-1">
          {scannedStudent ? 'Ma\'lumotlar to\'g\'riligini tekshiring' : 'Talaba telefonidagi QR kodni kadrga tuting'}
        </p>
      </div>

      {/* SKANER QISMI */}
      {!scannedStudent && !result && (
        <div className="relative w-full aspect-[3/4] max-w-sm mx-auto overflow-hidden rounded-[40px] bg-black shadow-2xl border-4 border-[hsl(var(--border))]">
          <Scanner 
            components={{ finder: false }}
            onScan={(detectedCodes) => { if (detectedCodes && detectedCodes.length > 0) handleScan(detectedCodes[0].rawValue); }} 
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
      )}

      {/* 🌟 YANGI: TASDIQLASH EKRANI (Mahsulot tanlanmaydi, faqat ko'rsatiladi) */}
      {scannedStudent && !result && (
        <div className="w-full max-w-md mx-auto animate-in slide-in-from-bottom-8 duration-300 px-4">
          
          {/* TALABA INFO */}
          <div className="bg-[hsl(var(--card))] border-2 border-green-500/50 p-5 rounded-[24px] mb-4 shadow-md flex items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
               <ShieldCheck size={12}/> Tasdiqlangan
            </div>
            
            {scannedStudent.avatar_url ? (
              <img src={scannedStudent.avatar_url} className="w-16 h-16 rounded-full object-cover shadow-sm border-2 border-[hsl(var(--border))]" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center shadow-sm"><User size={28}/></div>
            )}
            <div className="pt-2">
              <p className="font-bold text-lg text-[hsl(var(--foreground))] leading-tight mb-1">{scannedStudent.first_name} {scannedStudent.last_name}</p>
              <p className="text-xs font-bold text-[hsl(var(--accent))] uppercase tracking-wider">{scannedStudent.university}</p>
            </div>
          </div>

          {/* CHEGIRMA VA MAHSULOT INFO */}
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-5 rounded-[24px] mb-8 shadow-sm">
             <div className="flex items-center justify-between mb-4 pb-4 border-b border-[hsl(var(--border))]">
                <span className="text-[12px] font-bold uppercase text-[hsl(var(--muted-foreground))] flex items-center gap-1.5"><Ticket size={16}/> Chegirma foizi</span>
                <span className="text-xl font-extrabold text-red-500 bg-red-500/10 px-3 py-1 rounded-xl">-{scannedDiscount?.discount_percent}%</span>
             </div>
             
             <div>
               <span className="text-[12px] font-bold uppercase text-[hsl(var(--muted-foreground))] flex items-center gap-1.5 mb-2"><Package size={16}/> Tanlangan mahsulot:</span>
               <div className="bg-[hsl(var(--primary))/10] border border-[hsl(var(--primary))/20] p-4 rounded-xl">
                 <p className="text-lg font-bold text-[hsl(var(--primary))] leading-tight">
                    {scannedItemName}
                 </p>
               </div>
             </div>
          </div>

          <div className="flex gap-3">
            <button onClick={resetScanner} className="flex-1 py-4.5 bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] font-bold rounded-2xl active:scale-95 transition-all text-[15px]">Bekor qilish</button>
            <button 
              disabled={isConfirming} 
              onClick={handleConfirm} 
              className="flex-[2] py-4.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold rounded-2xl shadow-float active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-[15px]"
            >
              {isConfirming ? <Loader2 className="animate-spin" size={20}/> : <>Xaridni tasdiqlash <ArrowRight size={18}/></>}
            </button>
          </div>
        </div>
      )}

      {/* NATIJA EKRANI */}
      {result && (
        <div className="w-full max-w-sm mx-auto bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-8 rounded-[40px] text-center shadow-xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
          {result.success ? (
            <>
              <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-green-500/20"><CheckCircle2 size={48} /></div>
              <h3 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] mb-2">{result.message}</h3>
            </>
          ) : (
            <>
              <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-red-500/20"><XCircle size={48} /></div>
              <h3 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] mb-2">Xatolik</h3>
              <p className="text-[14px] font-medium text-[hsl(var(--muted-foreground))] leading-relaxed px-4 text-red-500">{result.message}</p>
            </>
          )}

          <button onClick={resetScanner} className="w-full py-4 mt-8 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold text-[16px] rounded-[20px] shadow-float active:scale-95 transition-all flex items-center justify-center gap-2">
            <RefreshCcw size={18} /> Yangi skanerlash
          </button>
        </div>
      )}
    </div>
  );
}