import { PlusCircle, Tag } from 'lucide-react';
export default function MerchantDiscounts() {
  return (
    <div className="page-enter">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))]">Chegirmalar</h2>
        <button className="flex items-center gap-1.5 text-sm font-bold bg-[hsl(var(--accent))] text-white px-4 py-2 rounded-full active:scale-95 transition-all"><PlusCircle size={18}/> Yangi</button>
      </div>
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-8 rounded-[24px] text-center flex flex-col items-center">
        <Tag size={40} className="text-[hsl(var(--muted-foreground))/50] mb-3" />
        <p className="font-bold">Hozircha chegirmalar yo'q</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Yangi chegirma qo'shish tugmasini bosing</p>
      </div>
    </div>
  );
}