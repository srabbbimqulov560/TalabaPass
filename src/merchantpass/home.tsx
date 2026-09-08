import { Users, Tag, Eye } from 'lucide-react';
export default function MerchantHome() {
  return (
    <div className="page-enter">
      <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] mb-6">Xush kelibsiz!</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[hsl(var(--card))] p-5 rounded-3xl border border-[hsl(var(--border))] shadow-sm">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-3"><Users size={20}/></div>
          <p className="text-2xl font-bold">1,248</p><p className="text-xs text-[hsl(var(--muted-foreground))]">Jami mijozlar</p>
        </div>
        <div className="bg-[hsl(var(--card))] p-5 rounded-3xl border border-[hsl(var(--border))] shadow-sm">
          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-3"><Tag size={20}/></div>
          <p className="text-2xl font-bold">3</p><p className="text-xs text-[hsl(var(--muted-foreground))]">Faol chegirmalar</p>
        </div>
        <div className="col-span-2 bg-[hsl(var(--card))] p-5 rounded-3xl border border-[hsl(var(--border))] shadow-sm flex items-center justify-between">
          <div><p className="text-2xl font-bold">12,400</p><p className="text-xs text-[hsl(var(--muted-foreground))]">Profil ko'rishlari</p></div>
          <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500"><Eye size={24}/></div>
        </div>
      </div>
    </div>
  );
}