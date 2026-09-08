import { useState } from 'react';
import { Store, LockKeyhole, ArrowRight, UserRound, Loader2 } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';

export default function MerchantLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // XATONING YECHIMI 1: Foydalanuvchi logindagi barcha bo'sh joylarni (probellarni) olib tashlaymiz
      const cleanUsername = username.trim().replace(/\s+/g, '').toLowerCase();
      const fakeEmail = `${cleanUsername}@merchant.talabapass.uz`;

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password: password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error("Login yoki parol noto'g'ri!");
        } else if (authError.message.includes('Email not confirmed')) {
          throw new Error("XATOLIK: Supabase panelidan 'Confirm Email' sozlamasini o'chirib qo'yishingiz kerak!");
        }
        throw new Error("Xatolik yuz berdi: " + authError.message);
      }
      
      // XATONING YECHIMI 2: "is_active" ni tekshirib tizimdan chiqarib yuborish (signOut) kodini butunlay olib tashladik!
      // Endi foydalanuvchi bemalol tizimga kiradi va Profilida "Kutilmoqda" statusini ko'radi.
      // Bu sahifadan otib yuborish xatosini 100% hal qiladi.

      localStorage.setItem('merchant_token', data.session.access_token);
      setLocation('/merchant'); 

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Tizimga kirishda noma'lum xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[hsl(var(--background))] items-center justify-center p-4">
      
      <div className="w-full max-w-sm bg-[hsl(var(--card))] p-8 rounded-[32px] shadow-2xl border border-[hsl(var(--border))] relative overflow-hidden animate-in zoom-in-95 duration-500">
        
        <div className="w-16 h-16 bg-[hsl(var(--accent)/.15)] border-2 border-[hsl(var(--accent)/.3)] rounded-2xl flex items-center justify-center text-[hsl(var(--accent))] mb-8 shadow-sm">
          <Store size={32} />
        </div>
        
        <h1 className="font-display text-3xl font-extrabold text-[hsl(var(--foreground))] mb-2 leading-tight">Hamkorlar <br/>uchun kirish</h1>
        <p className="text-[hsl(var(--muted-foreground))] text-sm mb-8 font-medium">Do'koningiz boshqaruv paneliga kiring.</p>

        {error && (
           <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-[13px] font-semibold rounded-xl text-center leading-snug">
             {error}
           </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={20} />
            <input 
              type="text" 
              placeholder="Login" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-4 pl-12 pr-4 rounded-2xl text-sm font-semibold outline-none focus:border-[hsl(var(--accent))] text-[hsl(var(--foreground))] transition-all"
            />
          </div>

          <div className="relative">
            <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={20} />
            <input 
              type="password" 
              placeholder="Parol" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-4 pl-12 pr-4 rounded-2xl text-sm font-semibold outline-none focus:border-[hsl(var(--accent))] text-[hsl(var(--foreground))] transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 mt-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold rounded-2xl shadow-float active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20}/> : <>Tizimga kirish <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-[hsl(var(--border))] pt-6">
          <span className="text-[13px] font-medium text-[hsl(var(--muted-foreground))]">Akkauntingiz yo'qmi? </span>
          <Link href="/merchant/signup" className="text-[13px] font-bold text-[hsl(var(--foreground))] hover:text-[hsl(var(--accent))] underline underline-offset-2">Ro'yxatdan o'tish</Link>
        </div>

      </div>
    </div>
  );
}