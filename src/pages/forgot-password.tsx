import { ArrowLeft, ShieldAlert, MessageCircle } from 'lucide-react';
import { Link } from 'wouter';
import { useState } from 'react';

export default function ForgotPassword() {
  const [userId, setUserId] = useState('');

  // 🌟 ADMIN UCHUN TAYYOR XABAR
  const message = `Salom Admin! Men TalabaPass tizimidan parolimni unutdim. Iltimos yordam bering.\n\nMening ID raqamim yoki Loginim: ${userId || "Kiritilmagan"}`;
  const encodedMessage = encodeURIComponent(message);
  
  // 🌟 O'zingizning botingiz (yoki shaxsiy) username'ni @ belgisiz yozing
  const adminTelegramUsername = "SizningTelegramUsername";

  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--background))] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] rounded-[32px] p-8 text-center shadow-xl animate-in zoom-in-95 duration-500">
        
        <div className="w-20 h-20 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-orange-500/20">
          <ShieldAlert size={40} />
        </div>
        
        <h1 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] mb-3">Parolni unutdingizmi?</h1>
        <p className="text-[13px] font-medium text-[hsl(var(--muted-foreground))] mb-6 leading-relaxed px-2">
          Xavfsizlik maqsadida, yo'qotilgan parollarni faqat administrator tiklab bera oladi.
        </p>

        <div className="mb-6 text-left">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] block mb-1.5 ml-1">Talaba ID yoki Biznes Login</label>
          <input 
            type="text" 
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="ID raqamingizni kiriting" 
            className="w-full bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] py-3.5 px-4 rounded-2xl text-[14px] font-bold outline-none focus:border-[hsl(var(--accent))] transition-colors" 
          />
        </div>

        <a 
          href={`https://t.me/${adminTelegramUsername}?text=${encodedMessage}`}
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0088cc] py-4 text-base font-bold text-white shadow-float active:scale-95 transition-all mb-4 hover:bg-[#0077b3]"
        >
          <MessageCircle size={20} /> Telegram orqali yozish
        </a>

        <Link href="/login" className="flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] py-3.5 text-sm font-bold text-[hsl(var(--foreground))] hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))] transition-all active:scale-95">
          <ArrowLeft size={18} /> Orqaga qaytish
        </Link>

      </div>
    </div>
  );
}