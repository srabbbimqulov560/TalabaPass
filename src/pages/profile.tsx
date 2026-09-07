import { useState, useRef } from 'react';
import { ShieldCheck, UserRound, ScanBarcode, Rotate3d, LogOut, Camera, LockKeyhole } from 'lucide-react';
import { useGetProfile } from '@workspace/api-client-react';
import { useLanguage } from '@/lib/i18n';

function initials(name?: string) { 
  return name?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'SP'; 
}

export default function ProfilePage() {
  const { t } = useLanguage();
  const profile = useGetProfile();
  const user = profile.data;
  
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAvatar(imageUrl);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="page-enter flex flex-col items-center pb-10">
      
      {/* Foydalanuvchi ma'lumotlari (Yarmi boxdan chiqib turgan rasm bilan) */}
      <div className="relative mt-16 mb-12 w-full max-w-[380px] rounded-[30px] bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-6 shadow-soft pt-14 flex flex-col items-center">
        
        {/* Rasm qismi (Absolutely positioned qilinib tepadagi chegaradan chiqarildi) */}
        <div className="absolute -top-12">
          <div className="relative group">
            <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
            <div 
              onClick={() => fileInputRef.current?.click()} 
              className="grid h-24 w-24 cursor-pointer place-items-center overflow-hidden rounded-[28px] bg-[#f1c46b] border-4 border-[hsl(var(--background))] font-display text-3xl font-bold text-[#694718] shadow-md transition-all group-hover:opacity-80"
            >
              {avatar ? <img src={avatar} alt="Profile" className="h-full w-full object-cover" /> : initials(user?.name)}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full border-[3px] border-[hsl(var(--background))] bg-[hsl(var(--accent))] text-white shadow-sm"
            >
              <Camera size={14} />
            </button>
          </div>
        </div>
        
        {/* Ism va Universitet ma'lumotlari */}
        <div className="flex flex-col items-center mt-2 text-center">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))]">{user?.name || 'Student profile'}</h2>
            {user?.verified !== false && (
              <span className="flex items-center gap-1 rounded-full bg-[hsl(var(--accent)/.15)] px-2 py-1 text-[10px] font-bold text-[hsl(var(--accent))]">
                <ShieldCheck size={12} /> {t('verified')}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            {user?.university || 'University'} {user?.course ? `· ${user.course}` : ''}
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] bg-[hsl(var(--secondary))] px-4 py-2 rounded-full">
            <LockKeyhole size={14} /> {t('student_id')} 
            <span className="font-mono font-bold text-[hsl(var(--foreground))] ml-1">{user?.studentId || '•••• ••••'}</span>
          </div>
        </div>
      </div>

      <div className="mb-6 text-center">
         <h1 className="font-display text-3xl font-bold tracking-[-.04em]">{t('my_id')}</h1>
         <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Sizning raqamli talaba guvohnomangiz</p>
      </div>

      {/* ID Karta */}
      <StudentCard user={user} avatar={avatar} t={t} />

      {/* Tizimdan chiqish tugmasi */}
      <div className="mt-14 w-full max-w-[360px]">
        <button 
          onClick={handleLogout} 
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 px-5 py-4 font-display text-sm font-bold text-red-600 transition-colors hover:bg-red-100 active:scale-95"
        >
          <LogOut size={18} />
          Tizimdan chiqish
        </button>
      </div>
    </div>
  );
}

function StudentCard({ user, avatar, t }: any) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="flex flex-col items-center">
      <div className="group h-[220px] w-[360px] max-w-full [perspective:1000px]">
        <div className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}>
          
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#1a2b4c] to-[#121c32] p-5 text-white shadow-float [backface-visibility:hidden]">
             <div className="flex justify-between items-start border-b border-white/10 pb-3">
                <span className="font-display font-bold uppercase tracking-wider text-[hsl(var(--accent))]">Student ID</span>
             </div>
             <div className="mt-4 flex gap-4 items-center">
                <div className="h-20 w-20 rounded-xl overflow-hidden bg-white/20 flex-shrink-0">
                  {avatar ? <img src={avatar} className="h-full w-full object-cover" /> : <UserRound className="m-auto mt-4 h-10 w-10 opacity-50" />}
                </div>
                <div>
                   <h3 className="font-display text-xl font-bold leading-tight">{user?.name || 'Ism Familiya'}</h3>
                   <p className="text-[10px] text-white/60 mt-1 uppercase tracking-wider">{user?.university || 'Universitet'}</p>
                   <p className="text-xs font-semibold text-[hsl(var(--accent))] mt-1">{user?.studentId || '0000 0000'}</p>
                </div>
             </div>
          </div>

          <div className="absolute inset-0 rounded-2xl bg-white p-5 text-black shadow-float [backface-visibility:hidden] [transform:rotateY(180deg)] border border-gray-200">
             <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
               <ShieldCheck className="text-[hsl(var(--accent))]" size={18} />
               <span className="text-xs font-bold uppercase">{t('verified')}</span>
             </div>
             <div className="mt-4 text-center flex flex-col items-center">
                <ScanBarcode size={48} strokeWidth={1} className="text-gray-800" />
                <p className="mt-2 text-[10px] text-gray-500">{t('scan_barcode')}</p>
             </div>
             <div className="absolute bottom-4 left-4 flex gap-6 text-[10px]">
                <div>
                  <span className="text-gray-400 block">{t('issued')}</span>
                  <strong>01/09/2025</strong>
                </div>
                <div>
                  <span className="text-gray-400 block">{t('valid_until')}</span>
                  <strong>30/06/2029</strong>
                </div>
             </div>
          </div>
        </div>
      </div>

      <button onClick={() => setFlipped(!flipped)} className="mt-8 flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-2.5 text-sm font-bold shadow-soft transition-transform hover:-translate-y-0.5 active:scale-95">
        <Rotate3d size={18} className="text-[hsl(var(--accent))]" />
        {t('flip_card')}
      </button>
    </div>
  );
}