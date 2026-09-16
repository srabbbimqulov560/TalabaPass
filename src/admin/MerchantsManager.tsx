import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Store, CheckCircle, XCircle, Trash2, Loader2, MapPin } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { logAdminAction } from '@/lib/adminLogger';

export default function MerchantsManager() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending');

  const { data: merchants, isLoading } = useQuery({
    queryKey: ['adminMerchants'],
    queryFn: async () => {
      const { data, error } = await supabase.from('merchants').select('*').order('name', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  const pendingMerchants = merchants?.filter(m => m.is_active === false) || [];
  const activeMerchants = merchants?.filter(m => m.is_active === true) || [];
  const displayList = activeTab === 'pending' ? pendingMerchants : activeMerchants;

  const handleApprove = async (id: string, name: string) => {
    try {
      await supabase.from('merchants').update({ is_active: true }).eq('id', id);
      
      // TIZIM TARIXIGA YOZISH
      await logAdminAction('TASDIQLADI', "DO'KON", name);

      queryClient.invalidateQueries({ queryKey: ['adminMerchants'] });
    } catch (err) {
      alert("Xatolik yuz berdi");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Rostdan ham "${name}" do'konini tizimdan butunlay o'chirmoqchimisiz?`)) return;
    try {
      const { error } = await supabase.rpc('delete_user_by_admin', { target_user_id: id });
      if (error) throw error;

      // TIZIM TARIXIGA YOZISH
      await logAdminAction("O'CHIRDI / RAD ETDI", "DO'KON", name);

      queryClient.invalidateQueries({ queryKey: ['adminMerchants'] });
    } catch (err) {
      alert("O'chirishda xatolik");
    }
  };

  return (
    <AdminLayout title="Do'konlar (Hamkorlar)">
      <div className="flex items-center gap-2 bg-[hsl(var(--card))] p-1.5 rounded-2xl border border-[hsl(var(--border))] w-fit mb-6">
        <button onClick={() => setActiveTab('pending')} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'pending' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}>
          Kutayotganlar {pendingMerchants.length > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingMerchants.length}</span>}
        </button>
        <button onClick={() => setActiveTab('active')} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'active' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}>
          Tasdiqlanganlar
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[hsl(var(--accent))]" size={32} /></div>
      ) : displayList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayList.map(merchant => (
            <div key={merchant.id} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[24px] p-5 flex flex-col shadow-sm">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] flex items-center justify-center overflow-hidden shrink-0">
                  {merchant.logo_url ? <img src={merchant.logo_url} className="w-full h-full object-cover"/> : <Store className="text-[hsl(var(--muted-foreground))]" size={24}/>}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[17px] text-[hsl(var(--foreground))] truncate">{merchant.name}</h3>
                  <p className="text-[12px] font-bold text-[hsl(var(--accent))] uppercase tracking-wider mb-1">{merchant.category}</p>
                  <p className="text-[12px] font-medium text-[hsl(var(--muted-foreground))] flex items-start gap-1">
                    <MapPin size={14} className="shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{merchant.description}</span>
                  </p>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-[hsl(var(--border))] flex items-center justify-end gap-2">
                <button onClick={() => handleDelete(merchant.id, merchant.name)} className="px-4 py-2 rounded-xl text-sm font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors flex items-center gap-1.5">
                  <Trash2 size={16} /> Rad etish
                </button>
                {activeTab === 'pending' && (
                  <button onClick={() => handleApprove(merchant.id, merchant.name)} className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-green-500 hover:bg-green-600 transition-colors flex items-center gap-1.5 shadow-md">
                    <CheckCircle size={16} /> Tasdiqlash
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[24px] p-10 text-center">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
          <h3 className="font-display text-xl font-bold text-[hsl(var(--foreground))] mb-1">{activeTab === 'pending' ? 'Kutayotgan arizalar yo\'q!' : 'Tasdiqlangan do\'konlar yo\'q'}</h3>
        </div>
      )}
    </AdminLayout>
  );
}