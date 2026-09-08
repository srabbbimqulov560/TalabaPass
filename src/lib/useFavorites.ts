import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useFavorites() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    
    // Foydalanuvchining saqlagan do'konlarini bazadan o'qib olish
    const fetchSaved = async () => {
      const { data, error } = await supabase
        .from('saved_offers')
        .select('merchant_id')
        .eq('student_id', token);
        
      if (data && !error) {
        setSavedIds(data.map(item => item.merchant_id));
      }
      setIsLoading(false);
    };
    
    fetchSaved();
  }, [token]);

  // Saqlash yoki O'chirish funksiyasi
  const toggleFavorite = async (merchantId: string) => {
    if (!token) return false;
    
    const isSaved = savedIds.includes(merchantId);
    
    if (isSaved) {
      // O'chirish
      setSavedIds(prev => prev.filter(id => id !== merchantId));
      await supabase
        .from('saved_offers')
        .delete()
        .eq('student_id', token)
        .eq('merchant_id', merchantId);
      return false; // O'chirildi degan signal
    } else {
      // Qo'shish
      setSavedIds(prev => [...prev, merchantId]);
      await supabase
        .from('saved_offers')
        .insert([{ student_id: token, merchant_id: merchantId }]);
      return true; // Qo'shildi degan signal
    }
  };

  return { savedIds, toggleFavorite, isLoading };
}