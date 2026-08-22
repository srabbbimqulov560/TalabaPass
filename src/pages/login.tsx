import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import axios from 'axios';

export default function LoginPage() {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new URLSearchParams();
      formData.append('username', studentId); 
      formData.append('password', password);

      const response = await axios.post('http://localhost:8000/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      localStorage.setItem('token', response.data.access_token);
      setLocation('/profile'); 
      
    } catch (err: any) {
      if (err.message === 'Network Error') {
        setError("Server bilan aloqa yo'q. Backend ishlayotganini tekshiring.");
      } else {
        setError(err.response?.data?.detail || "ID yoki parol xato!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans relative">
      <Link href="/" className="absolute top-6 left-6 text-gray-500 hover:text-gray-900 font-semibold flex items-center gap-2 transition-colors">
        <span>←</span> Bosh sahifa
      </Link>

      <div className="bg-white w-full max-w-sm rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-8 border border-gray-100">
        <div className="text-center mb-6">
          <div className="bg-blue-600 text-white w-16 h-16 rounded-[20px] flex items-center justify-center mx-auto mb-4 text-3xl font-bold shadow-lg shadow-blue-200">🎓</div>
          <h2 className="text-2xl font-black text-gray-800">Tizimga kirish</h2>
          <p className="text-gray-500 text-sm mt-2">Talaba chegirmalariga xush kelibsiz!</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50/80 border border-red-100 text-red-600 rounded-2xl text-sm font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Talaba ID</label>
            <input 
              type="text" required placeholder="Masalan: u25231"
              className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-gray-50/50 text-gray-800 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Parol</label>
            <input 
              type="password" required placeholder="••••••••"
              className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-gray-50/50 text-gray-800 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all duration-300 active:scale-95 disabled:opacity-70 mt-4"
          >
            {isLoading ? "Tekshirilmoqda..." : "Kirish"}
          </button>
        </form>
        <p className="text-center mt-6 text-sm text-gray-500 font-medium">
          Akkauntingiz yo'qmi? <Link href="/signup" className="text-blue-600 font-bold hover:underline">Ro'yxatdan o'tish</Link>
        </p>
      </div>
    </div>
  );
}