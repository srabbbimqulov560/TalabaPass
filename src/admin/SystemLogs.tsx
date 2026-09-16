import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Loader2, ArrowLeft, Search, History, Calendar, Clock, ShieldAlert } from 'lucide-react';
import { Link } from 'wouter';
import AdminLayout from './AdminLayout';

export default function SystemLogs() {
  const [search, setSearch] = useState('');

  const { data: logs, isLoading } = useQuery({
    queryKey: ['adminLogs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('admin_logs').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const filteredLogs = logs?.filter(log => 
    log.admin_email?.toLowerCase().includes(search.toLowerCase()) || 
    log.target_name?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const getActionColor = (action: string) => {
    if (action.includes('TASDIQ')) return 'bg-green-500/10 text-green-500 border-green-500/20';
    if (action.includes('O\'CHIRDI') || action.includes('RAD ETDI')) return 'bg-red-500/10 text-red-500 border-red-500/20';
    if (action.includes('BLOKLADI')) return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  };

  return (
    <AdminLayout title="Tizim Tarixi">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <button className="w-10 h-10 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-full flex items-center justify-center text-[hsl(var(--foreground))] hover:border-blue-500 transition-all">
              <ArrowLeft size={20}/>
            </button>
          </Link>
          <div>
            <h2 className="font-display text-2xl font-bold text-[hsl(var(--foreground))] flex items-center gap-2">
              Boshqaruv Tarixi <ShieldAlert size={20} className="text-red-500" />
            </h2>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[hsl(var(--accent))]" size={40} /></div>
      ) : (
        <>
          <div className="relative flex items-center bg-[hsl(var(--card))] rounded-xl p-1.5 shadow-sm border border-[hsl(var(--border))] mb-6 w-full max-w-md">
            <Search size={20} className="ml-3 shrink-0 text-[hsl(var(--muted-foreground))]" />
            <input 
              value={search} onChange={(e) => setSearch(e.target.value)} 
              type="text" placeholder="Admin emaili yoki obyekt nomi orqali qidirish..." 
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm font-medium text-[hsl(var(--foreground))] outline-none" 
            />
          </div>

          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-[hsl(var(--secondary))] border-b border-[hsl(var(--border))] text-[12px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                    <th className="px-6 py-4 font-bold">Vaqt & Sana</th>
                    <th className="px-6 py-4 font-bold">Qaysi Admin?</th>
                    <th className="px-6 py-4 font-bold">Harakat</th>
                    <th className="px-6 py-4 font-bold">Obyekt Toifasi</th>
                    <th className="px-6 py-4 font-bold">Kimga/Nimaga?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--border))]">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[hsl(var(--secondary)/.5)] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-[13px] font-bold text-[hsl(var(--foreground))]">
                            <Calendar size={14} className="text-[hsl(var(--accent))]" /> {new Date(log.created_at).toLocaleDateString('uz-UZ')}
                          </div>
                          <div className="flex items-center gap-2 text-[12px] font-medium text-[hsl(var(--muted-foreground))] mt-1">
                            <Clock size={13} /> {new Date(log.created_at).toLocaleTimeString('uz-UZ', {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[13px] font-bold text-[hsl(var(--foreground))]">
                          {log.admin_email}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center border px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${getActionColor(log.action_type)}`}>
                            {log.action_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[12px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest">
                          {log.target_type}
                        </td>
                        <td className="px-6 py-4 text-[14px] font-bold text-[hsl(var(--foreground))]">
                          {log.target_name}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-[hsl(var(--muted-foreground))] font-medium"><History className="mx-auto mb-2 opacity-50" size={32}/> Tarix topilmadi...</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}