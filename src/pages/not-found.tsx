import { Link, useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

export default function NotFound() {
  const [location] = useLocation();

  const isMerchantZone = location.startsWith('/merchant');
  const isAdminZone = location.startsWith('/admin');

  const returnUrl = isAdminZone ? '/admin' : isMerchantZone ? '/merchant' : '/';
  const returnText = isAdminZone ? "Admin panelga qaytish" : isMerchantZone ? "Biznes panelga qaytish" : "Asosiy sahifaga qaytish";

  // Tungi rejimni majburiy o'chiramiz, shunda sistema o'zining tabiiy qaymoq rangli light mode'ida qoladi
  useEffect(() => {
    const root = document.documentElement;
    const wasDark = root.classList.contains('dark');
    root.classList.remove('dark');

    return () => {
      if (wasDark) {
        root.classList.add('dark');
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-6 text-center page-enter w-full">
      
      {/* Rasm (tizim foniga moslashadi, ortiqcha oq fon yo'q) */}
      <div className="w-full mb-3 overflow-hidden">
        <img 
          src="/IMG_3994.PNG" 
          alt="404 Sahifa topilmadi" 
          className="w-full h-auto object-cover" 
        />
      </div>
      
      {/* Orqaga qaytish havolasi */}
      <Link href={returnUrl}>
        <button className="flex items-center gap-2 text-[14px] font-bold text-[hsl(var(--accent))] hover:underline active:scale-95 transition-all py-2 px-4 cursor-pointer">
          <ArrowLeft size={16} /> {returnText}
        </button>
      </Link>

    </div>
  );
}