import { useState } from 'react';
import axios from 'axios';

export default function CashierPage() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'success' | 'error' | null>(null); 
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    
    setIsLoading(true);
    setStatus(null);
    
    try {
      const response = await axios.post('http://localhost:8000/verify-qr', { code });
      setStatus('success');
      setMessage(response.data.message);
      setCode(''); 
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.detail || "Tizimda xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-sans text-white">
      <div className="bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl p-8 border border-gray-700">
        
        <div className="text-center mb-8">
          <div className="bg-emerald-500/20 text-emerald-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg">
            🏪
          </div>
          <h2 className="text-2xl font-bold">Kassir Paneli</h2>
          <p className="text-gray-400 text-sm mt-1">Talaba kodini tekshirish</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <input 
              type="text"
              value={code}
              placeholder="6 xonali kod"
              className="w-full px-5 py-5 rounded-2xl border-2 border-gray-700 bg-gray-900 text-white text-center text-3xl font-mono tracking-widest focus:outline-none focus:border-emerald-500 transition-colors uppercase"
              onChange={e => setCode(e.target.value)}
              autoComplete="off"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading || !code}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xl py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? "Tekshirilmoqda..." : "Tasdiqlash"}
          </button>
        </form>

        {status && (
          <div className={`mt-8 p-5 rounded-2xl border ${status === 'success' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-red-500/10 border-red-500/50 text-red-400'} text-center`}>
            <div className="text-4xl mb-2">{status === 'success' ? '✅' : '❌'}</div>
            <p className="font-bold text-lg">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}