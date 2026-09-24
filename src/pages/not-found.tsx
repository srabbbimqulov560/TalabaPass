import { Link, useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const [location] = useLocation();

  const isMerchantZone = location.startsWith('/merchant');
  const isAdminZone = location.startsWith('/admin');

  const returnUrl = isAdminZone ? '/admin' : isMerchantZone ? '/merchant' : '/';
  const returnText = isAdminZone ? "Admin panelga qaytish" : isMerchantZone ? "Biznes panelga qaytish" : "Asosiy sahifaga qaytish";

  return (
    <div className="flex flex-col items-center justify-start pt-4 min-h-[85vh] text-center page-enter w-full">
      
      {/* Rasm */}
      <div className="w-full mb-2 overflow-hidden">
        <img 
          src="/IMG_3994.PNG" 
          alt="404 Sahifa topilmadi" 
          className="w-full h-auto object-cover" 
        />
      </div>
      
      {/* Fon qutisisiz, toza havola ko'rinishidagi tugma */}
      <Link href={returnUrl}>
        <button className="flex items-center gap-2 text-[14px] font-bold text-[hsl(var(--accent))] hover:underline active:scale-95 transition-all py-2 px-4">
          <ArrowLeft size={16} /> {returnText}
        </button>
      </Link>

    </div>
  );
}