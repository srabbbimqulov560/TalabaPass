import { ScanLine } from 'lucide-react';
export default function MerchantScanner() {
  return (
    <div className="page-enter flex flex-col items-center justify-center pt-20">
      <div className="relative">
        <div className="absolute inset-0 bg-[hsl(var(--accent))] blur-3xl opacity-20 rounded-full animate-pulse" />
        <ScanLine size={120} className="text-[hsl(var(--accent))] relative z-10" strokeWidth={1} />
      </div>
      <h2 className="mt-8 font-display text-2xl font-bold text-[hsl(var(--foreground))]">QR Skaner</h2>
      <p className="text-center mt-2 text-sm text-[hsl(var(--muted-foreground))] max-w-[250px]">Mijozning TalabaPass ilovasidagi QR kodini kameraga tuting</p>
    </div>
  );
}