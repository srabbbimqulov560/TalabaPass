import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Store, MapPin } from 'lucide-react';
import axios from 'axios';

const API_URL = 'https://talabapass.onrender.com';

export default function AdminPanel() {
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingMerchants = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/pending-merchants`);
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
      if (action === 'approve') {
        await axios.put(`${API_URL}/admin/approve-merchant/${id}`);
      } else {
        await axios.delete(`${API_URL}/admin/reject-merchant/${id}`);
      }
      // Ro'yxatni yangilash
      setMerchants(merchants.filter((m) => m.id !== id));
    } catch (error) {
      alert("Xatolik yuz berdi");
    }
  };

  if (loading) return <div className="p-10 text-center text-xl">Yuklanmoqda...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
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
                  className="flex-1 py-3 text-red-600 bg-red-50 font-bold rounded-xl hover:bg-red-100 transition flex justify-center items-center gap-2"
                >
                  <XCircle size={18}/> Rad etish
                </button>
                <button 
                  onClick={() => handleAction(m.id, 'approve')}
                  className="flex-1 py-3 text-white bg-green-500 font-bold rounded-xl hover:bg-green-600 transition flex justify-center items-center gap-2"
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