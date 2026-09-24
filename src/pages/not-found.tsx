import { Link, useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const [location] = useLocation();

  // 🌟 MANTIQ: Qaysi hududda ekanligimizni URL orqali aniqlaymiz
  const isMerchantZone = location.startsWith('/merchant');
  const isAdminZone = location.startsWith('/admin');

  // Hududga mos ravishda orqaga qaytish manzili va matnini avtomatik tanlaymiz
  const returnUrl = isAdminZone ? '/admin' : isMerchantZone ? '/merchant' : '/';
  const returnText = isAdminZone ? "Admin panelga qaytish" : isMerchantZone ? "Biznes panelga qaytish" : "Asosiy sahifaga qaytish";

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 text-center page-enter px-4 max-w-lg mx-auto">
      
      {/* 🌟 VIZUAL ILLYUSTRATSIYA: Siz yuborgan 404 rasmi */}
      <div className="w-full max-w-[380px] mb-6 overflow-hidden rounded-[28px] shadow-xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <img 
          src="/IMG_3994.jpg" 
          alt="404 Sahifa topilmadi" 
          className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500" 
        />
      </div>
      
      <h1 className="font-display text-4xl font-extrabold text-[hsl(var(--foreground))] mb-2">404: Sahifa topilmadi</h1>
      <p className="text-[14px] font-medium text-[hsl(var(--muted-foreground))] mb-8 max-w-xs leading-relaxed">
        Kechirasiz, siz qidirayotgan sahifa mavjud emas yoki boshqa manzilga ko'chirilgan.
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