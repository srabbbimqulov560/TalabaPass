import { Link, useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const [location] = useLocation();

  const isMerchantZone = location.startsWith('/merchant');
  const isAdminZone = location.startsWith('/admin');

  const returnUrl = isAdminZone ? '/admin' : isMerchantZone ? '/merchant' : '/';
  const returnText = isAdminZone ? "Admin panelga qaytish" : isMerchantZone ? "Biznes panelga qaytish" : "Asosiy sahifaga qaytish";

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] py-4 text-center page-enter w-full">
      
      {/* 🌟 TO'LIQ EKRAN KENGLIGI (FULL-WIDTH) */}
      <div className="w-full mb-4 overflow-hidden">
        <img 
          src="/IMG_3994.PNG" 
          alt="404 Sahifa topilmadi" 
          className="w-full h-auto object-cover" 
        />
      </div>
      
      <Link href={returnUrl}>
        <button className="flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-6 py-3 text-[14px] font-bold text-[hsl(var(--primary-foreground))] shadow-float active:scale-95 transition-all">
          <ArrowLeft size={16} /> {returnText}
        </button>
      </Link>

    </div>
  );
}