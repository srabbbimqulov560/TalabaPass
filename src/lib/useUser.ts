import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useUser() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      // 1. Joriy xavfsiz sessiyani olamiz
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      // 2. O'sha foydalanuvchining ma'lumotlarini bazadan (RLS orqali) o'qiymiz
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) return null;
      return data;
    },
    staleTime: 1000 * 60 * 60, 
  });

  const updateAvatar = (newAvatarUrl: string) => {
    queryClient.setQueryData(['currentUser'], (oldData: any) => {
      if (!oldData) return oldData;
      return { ...oldData, avatar_url: newAvatarUrl };
    });
  };

  return { ...query, updateAvatar };
}