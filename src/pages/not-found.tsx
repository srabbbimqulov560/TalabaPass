import { Link, useLocation } from 'wouter';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const [location] = useLocation();

  // 🌟 MANTIQ: Qaysi hududda ekanligimizni URL orqali aniqlaymiz
  const isMerchantZone = location.startsWith('/merchant');
  const isAdminZone = location.startsWith('/admin');

  // Hududga mos ravishda orqaga qaytish manzili va matnini avtomatik tanlaymiz
  const returnUrl = isAdminZone ? '/admin' : isMerchantZone ? '/merchant' : '/';
  const returnText = isAdminZone ? "Admin panelga qaytish" : isMerchantZone ? "Biznes panelga qaytish" : "Asosiy sahifaga qaytish";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-20 text-center page-enter px-4">
      
      {/* 🌟 VIZUAL DIZAYN: Quruq matn emas, professional ko'rinish */}
      <div className="w-24 h-24 bg-[hsl(var(--secondary))] rounded-full flex items-center justify-center text-[hsl(var(--muted-foreground))] mb-6 border-4 border-[hsl(var(--card-border))] shadow-sm">
        <FileQuestion size={48} />
      </div>
      
      <h1 className="font-display text-5xl font-extrabold text-[hsl(var(--foreground))] mb-2">404</h1>
      <p className="text-lg font-medium text-[hsl(var(--muted-foreground))] mb-8 max-w-xs leading-relaxed">
        Kechirasiz, siz qidirayotgan sahifa topilmadi yoki tizimdan o'chirilgan.
      </p>
      
      {/* HUDUDGA MOSLASHTIRILGAN TUGMA */}
      <Link href={returnUrl}>
        <button className="flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-6 py-3.5 text-[15px] font-bold text-[hsl(var(--primary-foreground))] shadow-float active:scale-95 transition-all">
          <ArrowLeft size={18} /> {returnText}
        </button>
      </Link>

    </div>
  );
}