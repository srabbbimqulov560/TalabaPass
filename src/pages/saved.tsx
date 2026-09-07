import { useMemo } from 'react';
import { Bookmark } from 'lucide-react';
import { useListFavorites, useToggleFavorite, getListFavoritesQueryKey, getGetProfileQueryKey } from '@workspace/api-client-react';
import { DiscountCard, OfferCardSkeleton } from '@/components/discount-card';
import type { Discount } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/lib/i18n';

export default function SavedPage() {
  const { t } = useLanguage();
  const favorites = useListFavorites();
  const favorite = useToggleFavorite();
  const queryClient = useQueryClient();

  const toggleFavorite = (offer: Discount) => {
    favorite.mutate({ id: offer.id }, { 
      onSuccess: () => { 
        queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() }); 
        queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() }); 
      } 
    });
  };
  
  const loading = favorites.isLoading;
  const saved = useMemo(() => favorites.data || [], [favorites.data]);

  return (
    <div className="page-enter pb-10">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--accent))]">
          <Bookmark size={13} /> Saqlanganlar
        </div>
        <h1 className="font-display text-[clamp(2.2rem,6vw,3.8rem)] font-bold leading-none tracking-[-.06em]">
          {t('saved_offers')}
        </h1>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => <OfferCardSkeleton key={item} />)}
          </div>
        ) : saved.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((offer) => (
              <DiscountCard key={offer.id} offer={offer} onFavorite={toggleFavorite} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--secondary))] mb-4 text-[hsl(var(--muted-foreground))]">
              <Bookmark size={28} />
            </div>
            <h3 className="font-display text-xl font-bold">Hech narsa topilmadi</h3>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Hozircha saqlangan chegirmalar mavjud emas.</p>
          </div>
        )}
      </div>
    </div>
  );
}