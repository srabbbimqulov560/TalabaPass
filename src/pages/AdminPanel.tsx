import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Store } from 'lucide-react';
import axios from 'axios';
import { supabase } from '@/lib/supabase';
import { useLocation } from 'wouter';

const API_URL = 'https://talabapass.onrender.com';

export default function AdminPanel() {
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  // 1. TOKENNI OLIB KELUVCHI YORDAMCHI FUNKSIYA
  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLocation('/');
      throw new Error("Sessiya topilmadi. Admin sifatida kiring!");
    }
    return { Authorization: `Bearer ${session.access_token}` };
  };

  const fetchPendingMerchants = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await axios.get(`${API_URL}/admin/pending-merchants`, { headers });
      setMerchants(res.data);
    } catch (error) {
      console.error("Xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingMerchants();
  }, []);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    try {
      const headers = await getAuthHeaders();
      
      if (action === 'approve') {
        await axios.put(`${API_URL}/admin/approve-merchant/${id}`, {}, { headers });
      } else {
        await axios.delete(`${API_URL}/admin/reject-merchant/${id}`, { headers });
      }
      
      setMerchants(merchants.filter((m) => m.id !== id));
    } catch (error: any) {
      alert(error.message || "Xatolik yuz berdi");
    }
  };

  // 🌟 YUKLANISH VAQTIDA CHIQADIGAN SKELETON SHABLONLARI
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 page-enter">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Super-Admin Paneli</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div>
                  <div className="h-5 w-32 bg-gray-200 rounded-md mb-2"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded-md"></div>
                </div>
              </div>
              <div className="h-4 w-full bg-gray-200 rounded-md mb-2"></div>
              <div className="h-4 w-4/5 bg-gray-200 rounded-md mb-4 flex-1"></div>
              
              <div className="flex gap-2 mt-auto pt-4 border-t border-gray-50">
                <div className="flex-1 h-12 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 h-12 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 page-enter">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Super-Admin Paneli</h1>
      
      {merchants.length === 0 ? (
        <div className="text-center text-gray-500 py-20 bg-white rounded-2xl shadow-sm border">Yangi arizalar yo'q. Hamma dam olyapti! 🎉</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {merchants.map((m) => (
            <div key={m.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <Store size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{m.name}</h3>
                  <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded-lg text-gray-600">{m.category}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4 flex-1">{m.description}</p>
              
              <div className="flex gap-2 mt-auto pt-4 border-t border-gray-50">
                <button 
                  onClick={() => handleAction(m.id, 'reject')}
                  className="flex-1 py-3 text-red-600 bg-red-50 font-bold rounded-xl hover:bg-red-100 transition flex justify-center items-center gap-2 active:scale-95"
                >
                  <XCircle size={18}/> Rad etish
                </button>
                <button 
                  onClick={() => handleAction(m.id, 'approve')}
                  className="flex-1 py-3 text-white bg-green-500 font-bold rounded-xl hover:bg-green-600 transition flex justify-center items-center gap-2 active:scale-95"
                >
                  <CheckCircle size={18}/> Tasdiqlash
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}