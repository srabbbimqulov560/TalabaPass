import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight, IdCard, LockKeyhole, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
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
      // Haqiqiy va xavfsiz Supabase Auth tizimi orqali kirish
      const fakeEmail = `${formData.studentId}@talabapass.uz`;
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password: formData.password,
      });

      if (authError) {
        throw new Error("ID yoki parol noto'g'ri.");
      }

      // Hammasi to'g'ri bo'lsa App.tsx avtomatik bosh sahifaga yuboradi
      window.location.href = '/'; 

    } catch (err: any) {
      setError(err.message || "Xatolik yuz berdi. Internetni tekshiring.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[hsl(var(--background))] relative overflow-hidden">
      <div className="flex-1 flex flex-col px-6 max-w-md w-full mx-auto pt-24 pb-10">
        <div className="mb-12">
          <h1 className="font-display text-4xl font-bold leading-[1.1] text-[hsl(var(--foreground))]">
            Xush kelibsiz! <br/><span className="text-[hsl(var(--accent))]">Tizimga kiring</span>
          </h1>
        </div>

        <div className="space-y-5 mb-auto">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-2 mb-1.5 block">Talaba ID</label>
            <div className="relative">
              <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={20} />
              <input type="text" name="studentId" value={formData.studentId} onChange={handleChange} placeholder="ID raqamingizni kiriting" className="w-full rounded-2xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] py-4 pl-12 pr-4 font-mono font-bold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--accent))]" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] ml-2 mb-1.5 block">Parol</label>
            <div className="relative">
              <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={20} />
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Parolingizni kiriting" className="w-full rounded-2xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] py-4 pl-12 pr-4 font-semibold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--accent))]" />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm font-semibold ml-2">{error}</p>}
        </div>

        <div className="mt-10 flex flex-col gap-5">
          <div className="text-center">
            <span className="text-[13px] font-medium text-[hsl(var(--muted-foreground))]">Hisobingiz yo'qmi? </span>
            <Link href="/signup" className="text-[13px] font-bold text-[hsl(var(--foreground))] hover:text-[hsl(var(--accent))] underline">Ro'yxatdan o'tish</Link>
          </div>
          <button disabled={isLoading} onClick={handleLogin} className="flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] py-4 text-base font-bold text-[hsl(var(--primary-foreground))] shadow-float active:scale-95 transition-all disabled:opacity-70">
            {isLoading ? <Loader2 className="animate-spin" /> : <>Kirish <ArrowRight size={18} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}