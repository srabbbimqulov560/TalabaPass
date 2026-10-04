import { useState } from 'react';
import { QrCode, CheckCircle2, XCircle, Loader2, User, RefreshCcw, ShieldAlert, ArrowRight, Package } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

export default function MerchantScanner() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; student?: any } | null>(null);
  
  const [scannedStudent, setScannedStudent] = useState<any>(null);
  const [selectedDiscountId, setSelectedDiscountId] = useState<string | null>(null);
  const [selectedItemName, setSelectedItemName] = useState<string | null>(null);
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

  const { data: activeDiscounts } = useQuery({
    queryKey: ['merchantActiveDiscounts', merchantStatus?.id],
    enabled: !!merchantStatus?.id,
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('discounts')
        .select('*')
        .eq('merchant_id', merchantStatus!.id)
        .gte('end_date', today);
      return data || [];
    }
  });

  const isActive = merchantStatus?.is_active === true;

  const handleScan = async (text: string) => {
    if (loading || result || scannedStudent) return; 
    setLoading(true);

    try {
      let searchId = text; 

      if (text.includes('|')) {
        const [scannedId, timestampStr] = text.split('|');
        const timestamp = parseInt(timestampStr, 10);
        const timeDiff = Date.now() - timestamp; 

        if (timeDiff > 30000 || timeDiff < 0) {
          throw new Error("QR kod muddati tugagan! Talabadan dasturga kirib kodni yangilashni so'rang.");
        }
        searchId = scannedId; 
      }

      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(searchId);
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq(isUUID ? 'id' : 'student_id', searchId)
        .maybeSingle();

      if (studentError || !student) {
        throw new Error("Bunday talaba bazadan topilmadi!");
      }

      setScannedStudent(student);

    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || "Noma'lum xatolik"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedDiscountId || !selectedItemName || !scannedStudent || !merchantStatus) return;
    setIsConfirming(true);

    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: recentScan } = await supabase
        .from('scan_history')
        .select('id')
        .eq('merchant_id', merchantStatus.id)
        .eq('student_id', scannedStudent.id)
        .gte('created_at', fiveMinutesAgo)
        .maybeSingle();

      if (recentScan) {
        throw new Error("Qalloblik! Bu talaba so'nggi 5 daqiqa ichida chegirma olib bo'lgan.");
      }

      const discount = activeDiscounts?.find(d => d.id === selectedDiscountId);
      if (!discount || !discount.items) throw new Error("Chegirma yoki mahsulotlar ro'yxati topilmadi.");

      let itemFound = false;
      const updatedItems = discount.items.map((item: any) => {
         if (item.name === selectedItemName) {
            itemFound = true;
            if (item.quantity <= 0 && !item.isUnlimited) throw new Error("Bu mahsulot qolmagan!");
            return { ...item, quantity: item.isUnlimited ? 999999 : item.quantity - 1 };
         }
         return item;
      });

      if (!itemFound) throw new Error("Tanlangan mahsulot tizimdan topilmadi.");

      // 1. Chegirmani yangilash (-1 ni bazaga yozish)
      const { error: updateError } = await supabase.from('discounts').update({ items: updatedItems }).eq('id', discount.id);
      if (updateError) throw updateError;

      // 2. Scan tarixiga yozish
      const { error: histError } = await supabase.from('scan_history').insert({
        merchant_id: merchantStatus.id,
        student_id: scannedStudent.id
      });
      if (histError) throw histError;

      // 🌟 3. TALABAGA XARID UCHUN MINNATDORCHILIK BİLDİRİSHNOMASİ YUBORISH
      await supabase.from('notifications').insert({
        user_id: scannedStudent.id,
        title: "Xaridingiz muvaffaqiyatli! 🎉",
        message: `Siz hozirgina "${merchantStatus.name}" do'konidan "${selectedItemName}" xarid qildingiz. Xaridingiz barakali bo'lsin, yana kutib qolamiz!`,
        link: `/store/${merchantStatus.id}`,
        is_read: false
      });

      setResult({ success: true, message: "Chegirma muvaffaqiyatli qo'llanildi!", student: scannedStudent });
      setScannedStudent(null);
      
    } catch (error: any) {
      setResult({ success: false, message: error.message || "Xatolik yuz berdi" });
    } finally {
      setIsConfirming(false);
    }
  };

  const resetScanner = () => {
    setResult(null);
    setScannedStudent(null);
    setSelectedDiscountId(null);
    setSelectedItemName(null);
  };

  if (isProfileLoading) {
    return (
      <div className="page-enter pb-20">
        <div className="text-center mb-8 flex flex-col items-center animate-pulse"><div className="h-8 bg-[hsl(var(--muted))] rounded-md w-48 mb-3"></div><div className="h-4 bg-[hsl(var(--muted))] rounded-md w-64"></div></div>
        <div className="w-full aspect-[3/4] max-w-sm mx-auto overflow-hidden rounded-[40px] bg-[hsl(var(--muted))] animate-pulse shadow-2xl border-4 border-[hsl(var(--border))] flex items-center justify-center">
           <div className="w-3/4 h-1/2 border-4 border-[hsl(var(--background))/50] rounded-[32px]"></div>
        </div>
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className="page-enter pb-20 px-4 pt-10">
        <div className="text-center mb-8"><h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))]">Skaner bloklangan</h2></div>
        <div className="w-full max-w-sm mx-auto bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-8 rounded-[40px] text-center shadow-xl">
          <div className="w-24 h-24 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-orange-500/20"><ShieldAlert size={48} /></div>
          <h3 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] mb-3">Tasdiqlanmagan</h3>
          <p className="text-[14px] font-medium text-[hsl(var(--muted-foreground))] leading-relaxed px-2">Hisobingiz administrator tomonidan tasdiqlanmaguncha skanerdan foydalana olmaysiz. Iltimos, kuting.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter pb-20">
      <style>{`@keyframes scan-laser { 0%, 100% { transform: translateY(0); opacity: 0; } 10%, 90% { opacity: 1; } 50% { transform: translateY(240px); } } .animate-scan-laser { animation: scan-laser 3s cubic-bezier(0.4, 0, 0.2, 1) infinite; }`}</style>

      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))]">
          {scannedStudent ? "Tasdiqlash" : "Talabani Qidirish"}
        </h2>
        <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] mt-1">
          {scannedStudent ? "Qaysi mahsulot olinayotganini tanlang" : "ID kartadagi QR kodni ekranga tuting"}
        </p>
      </div>

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

      {scannedStudent && !result && (
        <div className="w-full max-w-md mx-auto animate-in slide-in-from-bottom-8 duration-300 px-4">
          
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-5 rounded-[24px] mb-6 shadow-sm flex items-center gap-4">
            {scannedStudent.avatar_url ? (
              <img src={scannedStudent.avatar_url} className="w-16 h-16 rounded-full object-cover shadow-sm border-2 border-[hsl(var(--border))]" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center shadow-sm"><User size={28}/></div>
            )}
            <div>
              <p className="font-bold text-lg text-[hsl(var(--foreground))] leading-tight mb-1">{scannedStudent.first_name} {scannedStudent.last_name}</p>
              <p className="text-xs font-bold text-[hsl(var(--accent))] uppercase tracking-wider">{scannedStudent.university}</p>
            </div>
          </div>

          <h3 className="font-display font-bold text-lg mb-4 text-[hsl(var(--foreground))]">Xarid qilinayotgan chegirma:</h3>
          
          {activeDiscounts && activeDiscounts.length > 0 ? (
            <div className="space-y-4">
              {activeDiscounts.map((discount: any) => (
                <div key={discount.id} className={`bg-[hsl(var(--card))] border-2 rounded-[24px] overflow-hidden transition-all ${selectedDiscountId === discount.id ? 'border-[hsl(var(--primary))] shadow-md' : 'border-[hsl(var(--border))] opacity-70 hover:opacity-100'}`}>
                  
                  <div onClick={() => setSelectedDiscountId(selectedDiscountId === discount.id ? null : discount.id)} className="p-4 flex items-center gap-4 cursor-pointer bg-[hsl(var(--secondary))/30]">
                    <img src={discount.image_url} className="w-16 h-12 rounded-xl object-cover" />
                    <div className="flex-1">
                      <p className="font-bold text-sm leading-tight text-[hsl(var(--foreground))] line-clamp-1">{discount.product_name}</p>
                      <p className="text-xs font-bold text-red-500 mt-1">-{discount.discount_percent}% Chegirma</p>
                    </div>
                  </div>

                  {selectedDiscountId === discount.id && discount.items && discount.items.length > 0 && (
                    <div className="p-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] space-y-2">
                      {discount.items.map((item: any, idx: number) => {
                        const isAvailable = item.quantity > 0 || item.isUnlimited;
                        const isSelected = selectedItemName === item.name;
                        
                        return (
                          <button 
                            key={idx}
                            disabled={!isAvailable}
                            onClick={() => setSelectedItemName(item.name)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border-2 text-left transition-all ${!isAvailable ? 'opacity-40 bg-[hsl(var(--muted))] border-transparent cursor-not-allowed' : isSelected ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))/10]' : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))/50]'}`}
                          >
                            <span className="font-bold text-sm flex items-center gap-2 text-[hsl(var(--foreground))]"><Package size={16}/> {item.name}</span>
                            <span className={`text-[11px] font-bold px-2 py-1 rounded-md ${!isAvailable ? 'bg-red-500/10 text-red-500' : isSelected ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]'}`}>
                              {item.isUnlimited ? 'Cheksiz' : isAvailable ? `${item.quantity} ta qoldi` : 'Tugagan'}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}

                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-[hsl(var(--secondary))] rounded-2xl text-center text-sm font-semibold text-[hsl(var(--muted-foreground))]">
              Sizda faol chegirmalar yo'q
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <button onClick={resetScanner} className="flex-1 py-4 bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] font-bold rounded-2xl active:scale-95 transition-all">Bekor qilish</button>
            <button 
              disabled={isConfirming || !selectedDiscountId || !selectedItemName} 
              onClick={handleConfirm} 
              className="flex-[2] py-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold rounded-2xl shadow-float active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isConfirming ? <Loader2 className="animate-spin" size={20}/> : <>Tasdiqlash <ArrowRight size={18}/></>}
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="w-full max-w-sm mx-auto bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-8 rounded-[40px] text-center shadow-xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
          {result.success ? (
            <>
              <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-green-500/20"><CheckCircle2 size={48} /></div>
              <h3 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] mb-2">{result.message}</h3>
              <p className="text-[13px] font-semibold text-[hsl(var(--muted-foreground))]">Tarixga yozildi va mahsulot soni yangilandi</p>
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