import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight, IdCard, LockKeyhole, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase'; // Supabase ulandi

export default function LoginPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ studentId: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); 
  };

  const handleLogin = async () => {
    if (!formData.studentId || !formData.password) {
      setError("Iltimos, Talaba ID va parolingizni kiriting.");
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      // 1. Bazadan kiritilgan Talaba ID ni qidiramiz
      const { data: user, error: dbError } = await supabase
        .from('students')
        .select('id, password_hash')
        .eq('student_id', formData.studentId)
        .single();

      if (dbError || !user) {
        setError("Bunday Talaba ID topilmadi.");
        setIsLoading(false);
        return;
      }

      // 2. Parolni tekshiramiz
      if (user.password_hash !== formData.password) {
        setError("Parol noto'g'ri. Iltimos qaytadan urining.");
        setIsLoading(false);
        return;
      }

      // 3. Hamma narsa to'g'ri bo'lsa, haqiqiy ID ni xotiraga saqlab tizimga kiritamiz
      localStorage.setItem('token', user.id);
      window.location.href = '/'; 

    } catch (err) {
      console.error(err);
      setError("Xatolik yuz berdi. Internetni tekshiring.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[hsl(var(--background))] relative overflow-hidden">
      
      {/* Asosiy Form Kontenti */}
      <div className="flex-1 flex flex-col px-6 max-w-md w-full mx-auto pt-24 pb-10">
        
        <div className="mb-12">
          <h1 className="font-display text-4xl font-bold leading-[1.1] text-[hsl(var(--foreground))]">
            Xush kelibsiz! <br/>
            <span className="text-[hsl(var(--accent))]">Tizimga kiring</span>
          </h1>
          <p className="mt-4 text-sm text-[hsl(var(--muted-foreground))]">
            Tasdiqlangan chegirmalardan foydalanish uchun talaba hisobingizga kiring.
          </p>
        </div>

        <div className="space-y-5 mb-auto">
          
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-2 mb-1.5 block">
              Talaba ID
            </label>
            <div className="relative">
              <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={20} />
              <input 
                type="text" 
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="ID raqamingizni kiriting" 
                className="w-full rounded-2xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] py-4 pl-12 pr-4 font-mono font-bold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--accent))] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-2 mb-1.5 block">
              Parol
            </label>
            <div className="relative">
              <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={20} />
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Parolingizni kiriting" 
                className="w-full rounded-2xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] py-4 pl-12 pr-4 font-semibold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--accent))] transition-colors"
              />
            </div>
          </div>

          {/* Xatolik yozuvi */}
          {error && (
            <p className="text-red-500 text-sm font-semibold ml-2 animate-in fade-in">
              {error}
            </p>
          )}

        </div>

        {/* Pastki tugma va Sign up linki */}
        <div className="mt-10 flex flex-col gap-5">
          <div className="text-center">
            <span className="text-[13px] font-medium text-[hsl(var(--muted-foreground))]">Hisobingiz yo'qmi? </span>
            <Link href="/signup" className="text-[13px] font-bold text-[hsl(var(--foreground))] hover:text-[hsl(var(--accent))] transition-colors underline underline-offset-2">
              Ro'yxatdan o'tish
            </Link>
          </div>
          <button 
            disabled={isLoading}
            onClick={handleLogin} 
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] py-4 text-base font-bold text-[hsl(var(--primary-foreground))] shadow-float active:scale-95 transition-all disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <>Kirish <ArrowRight size={18} /></>}
          </button>
        </div>

      </div>
    </div>
  );
}