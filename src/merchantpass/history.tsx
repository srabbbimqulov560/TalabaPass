import { History as HistoryIcon } from 'lucide-react';
export default function MerchantHistory() {
  return (
    <div className="page-enter">
      <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] mb-6">Tarix</h2>
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-8 rounded-[24px] text-center flex flex-col items-center">
        <HistoryIcon size={40} className="text-[hsl(var(--muted-foreground))/50] mb-3" />
        <p className="font-bold">Tarix bo'm-bo'sh</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Sizda muddati o'tgan chegirmalar mavjud emas</p>
      </div>
    </div>
  );
}