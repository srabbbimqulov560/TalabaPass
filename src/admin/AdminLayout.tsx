import React, { useState, useEffect, ReactNode } from 'react';
import { useLocation, Link } from 'wouter';
import { supabase } from '@/lib/supabase';
import { LayoutDashboard, Users, Store, Ticket, LogOut, Menu, X, Loader2, ShieldCheck, History } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location, setLocation] = useLocation();

  // XAVFSIZLIK QATLAMI: Admin ekanligini tekshirish
  useEffect(() => {
    async function checkAdmin() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Foydalanuvchi yo'q");

        const { data, error } = await supabase.from('admins').select('id').eq('id', user.id).single();
        if (error || !data) throw new Error("Admin emas");

        setIsAdmin(true);
      } catch (err) {
        setIsAdmin(false);
        setLocation('/'); // Admin bo'lmasa, darhol bosh sahifaga otib yuboradi
      }
    }
    checkAdmin();
  }, [location, setLocation]);

  // Tekshirilayotgan paytdagi ekran (Miltillashning oldini oladi)
  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[hsl(var(--background))]">
        <ShieldCheck size={48} className="text-[hsl(var(--accent))] mb-4 animate-pulse" />
        <Loader2 size={32} className="animate-spin text-[hsl(var(--muted-foreground))]" />
        <p className="mt-4 font-bold text-[hsl(var(--foreground))]">Xavfsizlik tekshiruvi...</p>
      </div>
    );
  }

  // Agar admin bo'lmasa, hech narsa ko'rsatmaymiz (zotan u bosh sahifaga otiladi)
  if (isAdmin === false) return null;

  // 🌟 MENYULAR RO'YXATI (TARIX QO'SHILGAN HOLATDA)
  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/merchants', icon: Store, label: "Do'konlar" },
    { path: '/admin/students', icon: Users, label: 'Talabalar' },
    { path: '/admin/discounts', icon: Ticket, label: 'Chegirmalar' },
    { path: '/admin/logs', icon: History, label: 'Tarix (Logs)' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex">
      
      {/* MOBILE UCHUN QORA FON (Overlay) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* YON PANEL (SIDEBAR) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[hsl(var(--card))] border-r border-[hsl(var(--border))] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between border-b border-[hsl(var(--border))]">
            <h1 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] flex items-center gap-2">
              <ShieldCheck className="text-[hsl(var(--accent))]" /> AdminPass
            </h1>
            <button className="lg:hidden text-[hsl(var(--muted-foreground))]" onClick={() => setIsSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <div 
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md' 
                        : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]'
                    }`}
                  >
                    <item.icon size={20} /> {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-[hsl(var(--border))]">
            <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-red-500 hover:bg-red-500/10 transition-colors">
              <LogOut size={20} /> Tizimdan chiqish
            </button>
          </div>
        </div>
      </aside>

      {/* ASOSIY QISM (CONTENT) */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* TOPBAR */}
        <header className="h-20 bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] flex items-center justify-between px-6 shrink-0 shadow-sm z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h2 className="font-display text-xl md:text-2xl font-bold text-[hsl(var(--foreground))]">{title}</h2>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold text-[hsl(var(--foreground))]">Super Admin</p>
              <p className="text-[11px] font-semibold text-[hsl(var(--accent))] uppercase tracking-wider">Tizim egasi</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[hsl(var(--accent)/.2)] border-2 border-[hsl(var(--accent))] flex items-center justify-center text-[hsl(var(--accent))] font-bold shadow-sm">
              AD
            </div>
          </div>
        </header>

        {/* SAHIFA ICHIDAGI KONTENT */}
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-[hsl(var(--background))]">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>

    </div>
  );
}