import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useUser() {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');

  // Ma'lumotlarni bazadan olib, 1 soat davomida xotirada (keshda) ushlab turadi
  const query = useQuery({
    queryKey: ['currentUser', token],
    queryFn: async () => {
      if (!token) return null;
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', token)
        .single();
      
      if (error) {
         console.error("Ma'lumotni olishda xatolik:", error);
         return null;
      }
      return data;
    },
    staleTime: 1000 * 60 * 60, // 1 soat keshda saqlash
    enabled: !!token, // Faqat token bo'lsagina ishlaydi
  });

  // Rasm yuklanganda xotiradagi (keshdagi) rasmni ham darhol yangilash
  const updateAvatar = (newAvatarUrl: string) => {
    queryClient.setQueryData(['currentUser', token], (oldData: any) => {
      if (!oldData) return oldData;
      return { ...oldData, avatar_url: newAvatarUrl };
    });
  };

  return { ...query, updateAvatar };
}   