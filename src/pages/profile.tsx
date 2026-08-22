import { useMemo, useState, useRef } from 'react';
import { Bookmark, History, LockKeyhole, ShieldCheck, UserRound, Camera, ScanBarcode, Rotate3d } from 'lucide-react';
import { useGetProfile, useListFavorites, useListRedemptions, useToggleFavorite, getListFavoritesQueryKey, getGetProfileQueryKey } from '@workspace/api-client-react';
import { DiscountCard, OfferCardSkeleton } from '@/components/discount-card';
import type { Discount } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/lib/i18n';

function initials(name?: string) { return name?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'SP'; }

export default function ProfilePage() {
  const { t } = useLanguage();
  const profile = useGetProfile();
  const favorites = useListFavorites();
  const redemptions = useListRedemptions();
  const favorite = useToggleFavorite();
  const queryClient = useQueryClient();
  
  const [tab, setTab] = useState<'saved' | 'history' | 'my-id'>('saved');
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAvatar(imageUrl);
    }
  };

  const toggleFavorite = (offer: Discount) => favorite.mutate({ id: offer.id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() }); } });
  
  const loading = profile.isLoading || favorites.isLoading || redemptions.isLoading;
  const user = profile.data;
  const saved = useMemo(() => favorites.data || [], [favorites.data]);

  return <div className="page-enter">
    <div className="mb-8">
      <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--accent))]"><UserRound size={13} /> {t('my_pass')}</div>
      <h1 className="font-display text-[clamp(2.2rem,6vw,3.8rem)] font-bold leading-none tracking-[-.06em]">{t('discover')},<br /><span className="text-[hsl(var(--accent))]">{t('my_profile')}.</span></h1>
    </div>
    
    <section className="relative overflow-hidden rounded-[30px] bg-[hsl(var(--primary))] p-6 text-[hsl(var(--primary-foreground))] shadow-float md:p-8">
      <div className="absolute -right-8 -top-14 h-52 w-52 rounded-full border-[28px] border-[hsl(var(--accent)/.2)]" />
      <div className="relative flex flex-col gap-7 sm:flex-row sm:items-center">
        
        <div className="relative group">
          <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
          <div onClick={() => fileInputRef.current?.click()} className="grid h-20 w-20 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-[24px] bg-[#f1c46b] font-display text-2xl font-bold text-[#694718] transition-all group-hover:opacity-80">
            {avatar ? <img src={avatar} alt="Profile" className="h-full w-full object-cover" /> : initials(user?.name)}
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 grid h-8 w-8 place-items-center rounded-full border-[3px] border-[hsl(var(--primary))] bg-[hsl(var(--accent))] text-white">
            <Camera size={14} />
          </button>
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2"><h2 className="font-display text-2xl font-bold">{user?.name || 'Student profile'}</h2>{user?.verified !== false ? <span className="flex items-center gap-1 rounded-full bg-[hsl(var(--accent)/.17)] px-2.5 py-1 text-[10px] font-bold text-[#9ee4c9]"><ShieldCheck size={12} /> {t('verified')}</span> : null}</div>
          <p className="mt-1 text-sm text-white/65">{user?.university || 'University'} {user?.course ? `· ${user.course}` : ''}</p>
          <div className="mt-4 flex items-center gap-2 text-[11px] text-white/55"><LockKeyhole size={13} /> {t('student_id')} <span className="font-mono text-white/80">{user?.studentId || '•••• ••••'}</span></div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 sm:w-44">
          <div className="rounded-2xl bg-white/10 p-3"><div className="font-display text-2xl font-bold">{user?.savedCount ?? saved.length}</div><div className="mt-1 text-[10px] text-white/60">{t('saved_count')}</div></div>
          <div className="rounded-2xl bg-white/10 p-3"><div className="font-display text-2xl font-bold">{user?.redemptionCount ?? redemptions.data?.length ?? 0}</div><div className="mt-1 text-[10px] text-white/60">{t('redemptions')}</div></div>
        </div>
      </div>
    </section>
    
    <div className="mt-8 flex items-center gap-6 border-b border-[hsl(var(--border))] overflow-x-auto whitespace-nowrap">
      <button onClick={() => setTab('saved')} className={`relative pb-3 text-sm font-bold flex items-center gap-2 ${tab === 'saved' ? 'text-[hsl(var(--foreground))]' : 'text-[hsl(var(--muted-foreground))]'}`}><Bookmark size={15} />{t('saved_offers')}{tab === 'saved' ? <span className="absolute inset-x-0 bottom-[-1px] h-0.5 bg-[hsl(var(--accent))]" /> : null}</button>
      <button onClick={() => setTab('history')} className={`relative pb-3 text-sm font-bold flex items-center gap-2 ${tab === 'history' ? 'text-[hsl(var(--foreground))]' : 'text-[hsl(var(--muted-foreground))]'}`}><History size={15} />{t('history')}{tab === 'history' ? <span className="absolute inset-x-0 bottom-[-1px] h-0.5 bg-[hsl(var(--accent))]" /> : null}</button>
      <button onClick={() => setTab('my-id')} className={`relative pb-3 text-sm font-bold flex items-center gap-2 ${tab === 'my-id' ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--muted-foreground))]'}`}><UserRound size={15} />{t('my_id')}{tab === 'my-id' ? <span className="absolute inset-x-0 bottom-[-1px] h-0.5 bg-[hsl(var(--accent))]" /> : null}</button>
    </div>
    
    <div className="mt-6">
      {tab === 'saved' && (loading ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((item) => <OfferCardSkeleton key={item} />)}</div> : saved.length ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{saved.map((offer) => <DiscountCard key={offer.id} offer={offer} onFavorite={toggleFavorite} />)}</div> : <div>No offers saved</div>)}
      
      {tab === 'history' && <div>Tarix qismi</div>}

      {tab === 'my-id' && <StudentCard user={user} avatar={avatar} t={t} />}
    </div>
  </div>;
}

function StudentCard({ user, avatar, t }: any) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="flex flex-col items-center py-10">
      <div className="group h-[220px] w-full max-w-[360px] [perspective:1000px]">
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