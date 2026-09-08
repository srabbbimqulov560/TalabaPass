import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useFavorites() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSaved = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoading(false);
        return;
      }
      setUserId(session.user.id);
      
      const { data } = await supabase
        .from('saved_offers')
        .select('merchant_id')
        .eq('student_id', session.user.id); // RLS orqali o'zi cheklangan
        
      if (data) {
        setSavedIds(data.map(item => item.merchant_id));
      }
      setIsLoading(false);
    };
    
    fetchSaved();
  }, []);

  const toggleFavorite = async (merchantId: string) => {
    if (!userId) return false;
    
    const isSaved = savedIds.includes(merchantId);
    if (isSaved) {
      setSavedIds(prev => prev.filter(id => id !== merchantId));
      await supabase.from('saved_offers').delete().eq('student_id', userId).eq('merchant_id', merchantId);
      return false; 
    } else {
      setSavedIds(prev => [...prev, merchantId]);
      await supabase.from('saved_offers').insert([{ student_id: userId, merchant_id: merchantId }]);
      return true; 
    }
  };

  return { savedIds, toggleFavorite, isLoading };
}