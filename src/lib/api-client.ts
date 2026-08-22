import { useQuery, useMutation } from '@tanstack/react-query';

export type Discount = { id: number; name: string; description: string; discount: number; category: string; location: string; distance: string; rating: number; reviewCount: number; isFavorite: boolean; logo?: string; image?: string; accent: string; isNew?: boolean; address?: string; hours?: string; gallery?: string[]; reviews?: any[]; terms?: string[]; };

const mockDiscount: Discount = { id: 1, name: "Milliy Kutuqxona Qahvaxonasi", description: "Talabalar uchun maxsus chegirma", discount: 15, category: "Cafes", location: "Tashkent", distance: "1.2 km", rating: 4.8, reviewCount: 120, isFavorite: false, accent: "#1caa88", address: "Navoi ko'chasi 1", hours: "08:00 - 22:00" };

export const getGetDiscountQueryKey = (id: number) => ['discount', id];
export const getListDiscountsQueryKey = (params?: any) => ['discounts', params];
export const getListFavoritesQueryKey = () => ['favorites'];
export const getGetProfileQueryKey = () => ['profile'];

export function useGetDiscount(id: number, options?: any) { return useQuery({ queryKey: getGetDiscountQueryKey(id), queryFn: () => mockDiscount }); }
export function useListDiscounts(params?: any) { return useQuery({ queryKey: getListDiscountsQueryKey(params), queryFn: () => [mockDiscount, { ...mockDiscount, id: 2, name: "IT Center Kurslari" }] }); }
export function useToggleFavorite() { return useMutation({ mutationFn: async ({ id }: { id: number }) => { return true; } }); }
export function useRedeemDiscount() { return useMutation({ mutationFn: async ({ id }: { id: number }) => ({ code: "STUDENT2026", businessName: mockDiscount.name }) }); }
export function useGetDiscountSummary() { return useQuery({ queryKey: ['summary'], queryFn: () => ({ totalDiscounts: 142, popularCount: 12, newCount: 5, nearbyCount: 8 }) }); }
export function useGetProfile() { return useQuery({ queryKey: getGetProfileQueryKey(), queryFn: () => ({ name: "Shohjaxon", university: "TATU", course: "Cybersecurity", studentId: "3482 1192", verified: true, savedCount: 2, redemptionCount: 4 }) }); }
export function useListFavorites() { return useQuery({ queryKey: getListFavoritesQueryKey(), queryFn: () => [mockDiscount] }); }
export function useListRedemptions() { return useQuery({ queryKey: ['redemptions'], queryFn: () => [{ id: 1, businessName: "Coffee Shop", code: "A1B2C3", redeemedAt: new Date().toISOString(), status: "Used", discountId: 1 }] }); }