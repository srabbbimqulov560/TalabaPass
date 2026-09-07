import { ReactNode } from 'react';
import { Home, User, ScanLine } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export default function MobileLayout({ children }: LayoutProps) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    // Orqa fon rangi ilova uslubida
    <div className="min-h-screen bg-[#f8f9fc] font-sans">
      
      {/* Asosiy kontent (tepada turadi, menyu tagiga kirib ketmasligi uchun pb-28 berilgan) */}
      <div className="pb-28">
        {children}
      </div>

      {/* Pastki Navigatsiya Menyu */}
      <div className="fixed bottom-0 left-0 w-full bg-white rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.06)] z-50 h-20">
        <div className="flex justify-between items-center px-12 h-full relative">
          
          {/* 1. HOME TUGMASI */}
          <Link to="/dashboard" className="flex flex-col items-center gap-1 z-20">
            <Home 
              size={24} 
              className={isActive('/dashboard') ? "text-orange-500" : "text-gray-400"} 
              fill={isActive('/dashboard') ? "currentColor" : "none"}
            />
            <span className={`text-[11px] font-bold ${isActive('/dashboard') ? "text-orange-500" : "text-gray-400"}`}>
              Asosiy
            </span>
          </Link>

          {/* 2. QR CODE (Markaziy bo'rtib chiqqan tugma) */}
          {/* Bu div orqa fondagi "o'yiq" (cutout) effektini beradi */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-8 w-24 h-24 bg-[#f8f9fc] rounded-full flex items-center justify-center z-10">
            <Link 
              to="/qr" 
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-[0_8px_25px_rgba(249,115,22,0.25)] transition-transform active:scale-90"
            >
              <ScanLine size={32} className="text-orange-500" />
            </Link>
          </div>

          {/* 3. PROFIL TUGMASI */}
          <Link to="/profile" className="flex flex-col items-center gap-1 z-20">
            <User 
              size={24} 
              className={isActive('/profile') ? "text-orange-500" : "text-gray-400"} 
              fill={isActive('/profile') ? "currentColor" : "none"}
            />
            <span className={`text-[11px] font-bold ${isActive('/profile') ? "text-orange-500" : "text-gray-400"}`}>
              Profil
            </span>
          </Link>

        </div>
      </div>
    </div>
  );
}