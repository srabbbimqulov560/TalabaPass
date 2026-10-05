import { useState } from 'react';
import { ArrowLeft, Loader2, Send, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Link } from 'wouter';
import { sendTelegramMessage } from '@/lib/telegram';
import { useLanguage } from '@/lib/i18n';

export default function ForgotPassword() {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;
    setLoading(true);

    try {
      // 🌟 YECHIM 3: PAROLNI TIKLASH SO'ROVINI TELEGRAMGA YUBORISH
      const message = `🆘 <b>PAROLNI TIKLASH SO'ROVI</b>\n\n<b>ID yoki Username:</b> ${username}\n\nUshbu foydalanuvchi parolini unutganini ma'lum qildi. Iltimos, admin paneldan tekshiring yoki ushbu foydalanuvchiga yordam bering.`;
      await sendTelegramMessage(message);
      
      setSuccess(true);
    } catch (error) {
      alert("Xatolik yuz berdi. Iltimos keyinroq urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[hsl(var(--background))] items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[hsl(var(--card))] p-8 rounded-[32px] shadow-2xl border border-[hsl(var(--border))] relative overflow-hidden animate-in zoom-in-95 duration-500">
        
        {success ? (
          <div className="text-center animate-in fade-in duration-300">
            <div className="w-20 h-20 bg-green-500/10 border-4 border-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 size={40} strokeWidth={2.5} />
            </div>
            <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] mb-3">So'rov yuborildi!</h2>
            <p className="text-[14px] font-medium text-[hsl(var(--muted-foreground))] mb-8 leading-relaxed">
              Sizning so'rovingiz administratorlarga yuborildi. Tez orada Telegram orqali siz bilan bog'lanishadi yoki hisobingiz tiklanadi.
            </p>
            <Link href="/">
              <button className="w-full py-4 bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] font-bold rounded-[20px] active:scale-95 transition-all">
                Asosiy sahifaga qaytish
              </button>
            </Link>
          </div>
        ) : (
          <>
            <button onClick={() => window.history.back()} className="absolute top-6 left-6 p-2 -ml-2 rounded-full hover:bg-[hsl(var(--secondary))] transition-colors text-[hsl(var(--muted-foreground))]">
              <ArrowLeft size={22} />
            </button>
            
            <div className="w-16 h-16 bg-orange-500/10 border-2 border-orange-500/30 rounded-2xl flex items-center justify-center text-orange-500 mx-auto mt-6 mb-6 shadow-sm">
              <ShieldAlert size={32} />
            </div>
            
            <h1 className="font-display text-2xl font-extrabold text-[hsl(var(--foreground))] mb-2 text-center leading-tight">Parolni unutdingizmi?</h1>
            <p className="text-[hsl(var(--muted-foreground))] text-[13px] text-center mb-8 font-medium px-2">
              Profilingizning ID raqamini yoki biznes username'ini kiriting. Administratorlar sizga yordam beradi.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input 
                  type="text" 
                  placeholder="ID raqam yoki Username kiriting..."
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-4 px-5 rounded-2xl text-sm font-semibold outline-none focus:border-[hsl(var(--primary))] text-[hsl(var(--foreground))] transition-all text-center"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading || !username}
                className="w-full py-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold rounded-[20px] shadow-float active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" size={20}/> : <>So'rov yuborish <Send size={18} /></>}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}