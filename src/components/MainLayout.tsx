import { ReactNode } from 'react';
import { Home, User, ScanLine, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: LayoutProps) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans flex md:flex-row flex-col">
      
      {/* ================= 1. KOMPYUTER UCHUN YON MENYU (SIDEBAR) ================= */}
      {/* md:flex orqali faqat katta ekranlarda ko'rinadi, telefonda yo'qoladi */}
      <div className="hidden md:flex w-72 bg-white border-r border-gray-100 flex-col h-screen sticky top-0 shadow-sm z-50">
        <div className="p-8">
          <h2 className="text-3xl font-extrabold text-orange-500 tracking-tight">TalabaPass</h2>
          <p className="text-gray-400 text-sm font-medium mt-1">Boshqaruv paneli</p>
        </div>
        
        <div className="flex-1 px-6 space-y-3 mt-4">
          <Link to="/dashboard" className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${isActive('/dashboard') ? 'bg-orange-50 text-orange-500 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Home size={22} /> Asosiy
          </Link>
          <Link to="/qr" className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${isActive('/qr') ? 'bg-orange-50 text-orange-500 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
            <ScanLine size={22} /> QR Skaner
          </Link>
          <Link to="/profile" className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${isActive('/profile') ? 'bg-orange-50 text-orange-500 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
            <User size={22} /> Profil
          </Link>
        </div>
        
        <div className="p-6 border-t border-gray-50">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-5 py-4 text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl font-bold transition-all active:scale-95">
            <LogOut size={20}/> Tizimdan chiqish
          </button>
        </div>
      </div>

      {/* ================= 2. ASOSIY KONTENT (O'RTADAGI QISM) ================= */}
      {/* Telefonda pastki menyu tagiga kirib ketmasligi uchun pb-28, kompyuterda pb-0 */}
      <div className="flex-1 pb-28 md:pb-0 w-full max-w-7xl mx-auto overflow-y-auto">
        {children}
      </div>

      {/* ================= 3. MOBIL UCHUN PASTKI MENYU (BOTTOM NAV) ================= */}
      {/* md:hidden orqali faqat telefonda ko'rinadi, kompyuterda yo'qoladi */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.06)] z-50 h-20 border-t border-gray-100">
        <div className="flex justify-between items-center px-10 h-full relative">
          
          <Link to="/dashboard" className="flex flex-col items-center gap-1 z-20 w-16">
            <Home size={24} className={isActive('/dashboard') ? "text-orange-500" : "text-gray-400"} fill={isActive('/dashboard') ? "currentColor" : "none"} />
            <span className={`text-[11px] font-bold ${isActive('/dashboard') ? "text-orange-500" : "text-gray-400"}`}>Asosiy</span>
          </Link>

          {/* Bo'rtib chiqqan QR kod o'yig'i */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-8 w-[88px] h-[88px] bg-[#f8f9fc] rounded-full flex items-center justify-center z-10">
            <Link to="/qr" className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-[0_8px_25px_rgba(249,115,22,0.25)] transition-transform active:scale-90">
              <ScanLine size={32} className="text-orange-500" />
            </Link>
          </div>

          <Link to="/profile" className="flex flex-col items-center gap-1 z-20 w-16">
            <User size={24} className={isActive('/profile') ? "text-orange-500" : "text-gray-400"} fill={isActive('/profile') ? "currentColor" : "none"} />
            <span className={`text-[11px] font-bold ${isActive('/profile') ? "text-orange-500" : "text-gray-400"}`}>Profil</span>
          </Link>

        </div>
      </div>
      
    </div>
  );
}