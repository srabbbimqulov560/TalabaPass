import { supabase } from '@/lib/supabase'; // <--- Yo'l to'g'rilandi

export async function logAdminAction(action_type: string, target_type: string, target_name: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) return;

    await supabase.from('admin_logs').insert([{
      admin_email: user.email,
      action_type,
      target_type,
      target_name
    }]);
  } catch (err) {
    console.error("Log yozishda xatolik:", err);
  }
}