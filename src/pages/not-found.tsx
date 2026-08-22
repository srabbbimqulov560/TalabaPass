import { Link } from 'wouter';
export default function NotFound() {
  return (
    <div className="grid place-items-center py-20 text-center page-enter">
      <h1 className="font-display text-4xl font-bold">404</h1>
      <p className="mt-2 text-[hsl(var(--muted-foreground))]">Sahifa topilmadi.</p>
      <Link href="/" className="mt-4 text-[hsl(var(--primary))] font-bold">Asosiy sahifaga qaytish</Link>
    </div>
  );
}