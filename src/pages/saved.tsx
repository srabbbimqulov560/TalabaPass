import { ArrowLeft, Bookmark } from 'lucide-react';
import { Link } from 'wouter';
import { useListDiscounts } from '@workspace/api-client-react';
import { DiscountCard, OfferCardSkeleton } from '@/components/discount-card';
import { useLanguage } from '@/lib/i18n';
import { useFavorites } from '@/lib/useFavorites';

export default function SavedPage() {
  const { t } = useLanguage();
  const { savedIds, toggleFavorite, isLoading: favLoading } = useFavorites();
  const allOffers = useListDiscounts();

  // Barcha do'konlar orasidan faqat foydalanuvchi saqlaganlarini ajratib olish
  const savedOffers = allOffers.data?.filter(offer => savedIds.includes(String(offer.id))) || [];
  const isLoading = allOffers.isLoading || favLoading;

  return (
    <div className="page-enter pb-10">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-[hsl(var(--secondary))] transition-colors text-[hsl(var(--muted-foreground))]">
          <ArrowLeft size={22} />
        </button>
        <h1 className="font-display text-2xl font-bold text-[hsl(var(--foreground))]">{t('saved_offers')}</h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <OfferCardSkeleton key={i} />)}
        </div>
      ) : savedOffers.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {savedOffers.map((offer) => (
            <DiscountCard 
              key={offer.id} 
              offer={{ ...offer, isFavorite: true }} 
              onFavorite={() => toggleFavorite(String(offer.id))} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 animate-in fade-in zoom-in duration-300">
          <div className="mx-auto w-20 h-20 rounded-full bg-[hsl(var(--secondary))] border-2 border-[hsl(var(--card-border))] flex items-center justify-center text-[hsl(var(--muted-foreground))] mb-5 shadow-sm">
            <Bookmark size={32} />
          </div>
          <h2 className="font-display text-xl font-bold text-[hsl(var(--foreground))] mb-2">Saqlanganlar yo'q</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Siz hali hech qanday chegirmani saqlamadingiz.</p>
          <Link href="/" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-8 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-float active:scale-95 transition-all">
            {t('discover')}
          </Link>
        </div>
      )}
    </div>
  );
}