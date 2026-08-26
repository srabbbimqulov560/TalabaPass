import { useState } from 'react';
import { Store, ArrowRight, ArrowLeft, CheckCircle, Upload, Lock, User, Info, MapPin } from 'lucide-react';
import axios from 'axios';

// API manzilingiz (Render'dagi backend)
const API_URL = 'https://talabapass.onrender.com';

const categories = [
  { id: 'education', name: "O'quv markazi", icon: '📚' },
  { id: 'food', name: 'Kafe / Restoran', icon: '🍔' },
  { id: 'clothing', name: 'Kiyim-kechak', icon: '👕' },
  { id: 'services', name: 'Xizmat ko‘rsatish', icon: '✂️' },
  { id: 'tech', name: 'Texnika do‘koni', icon: '💻' },
  { id: 'other', name: 'Boshqa', icon: '🏪' },
];

export default function MerchantSignup() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);

  const [formData, setFormData] = useState({
    category: '',
    name: '',
    description: '',
    logo_url: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    // Agar ism o'zgarsa, tekshiruvni bekor qilamiz
    if (e.target.name === 'name') setNameAvailable(null);
  };

  // 2-bosqichda nomni tekshirish
  const checkNameAvailability = async () => {
    if (formData.name.trim().length < 3) {
      setError("Do'kon nomi kamida 3 ta harfdan iborat bo'lishi kerak.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/check-merchant-name/${formData.name}`);
      if (res.data.is_available) {
        setNameAvailable(true);
        setError('');
        setTimeout(() => setStep(3), 500); // Muvaffaqiyatli bo'lsa avtomat keyingi qadamga
      } else {
        setNameAvailable(false);
        setError(res.data.message || "Bu nom band. Boshqa nom tanlang.");
      }
    } catch (err) {
      setError("Server bilan ulanishda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  // Yakuniy ro'yxatdan o'tish (4-bosqich)
  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Parollar bir-biriga mos kelmadi.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/register-merchant`, {
        category: formData.category,
        name: formData.name,
        description: formData.description,
        username: formData.username,
        password: formData.password,
      });
      setStep(5); // 5-bosqich: Muvaffaqiyatli yakunlash ekrani
    } catch (err: any) {
      setError(err.response?.data?.detail || "Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center p-4">
      {/* Oynasimon orqa fon efekti */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-[32px] p-6 sm:p-8 overflow-hidden transition-all duration-500">
        
        {/* Slayder Progress chizig'i */}
        {step < 5 && (
          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-blue-600' : 'bg-gray-200'}`} />
            ))}
          </div>
        )}

        {/* Xatolik xabari */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-xl text-center animate-pulse">
            {error}
          </div>
        )}

        {/* 1-BOSQICH: Kategoriya tanlash */}
        {step === 1 && (
          <div className="animate-in slide-in-from-right-4 fade-in duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Faoliyat turini tanlang</h2>
            <p className="text-sm text-gray-500 mb-6">Xizmatlaringiz qaysi toifaga kiradi?</p>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setFormData({ ...formData, category: cat.name }); nextStep(); }}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                    formData.category === cat.name 
                      ? 'border-blue-600 bg-blue-50 text-blue-700' 
                      : 'border-gray-100 bg-white hover:border-blue-200 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-3xl mb-2">{cat.icon}</span>
                  <span className="text-xs font-semibold text-center">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 2-BOSQICH: Do'kon nomi */}
        {step === 2 && (
          <div className="animate-in slide-in-from-right-4 fade-in duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Do'koningiz nomi</h2>
            <p className="text-sm text-gray-500 mb-6">Mijozlar sizni shu nom bilan topishadi.</p>
            
            <div className="relative mb-6">
              <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Masalan: Najot Ta'lim"
                className={`w-full bg-white border-2 rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold outline-none transition-all ${
                  nameAvailable === true ? 'border-green-500 focus:border-green-600' : 
                  nameAvailable === false ? 'border-red-500 focus:border-red-600' : 
                  'border-gray-100 focus:border-blue-500'
                }`}
              />
              {nameAvailable && <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" size={20} />}
            </div>

            <div className="flex gap-3">
              <button onClick={prevStep} className="p-4 bg-gray-100 rounded-2xl text-gray-600 hover:bg-gray-200 transition-colors">
                <ArrowLeft size={20} />
              </button>
              <button 
                onClick={checkNameAvailability} 
                disabled={loading || !formData.name}
                className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {loading ? 'Tekshirilmoqda...' : 'Davom etish'} <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* 3-BOSQICH: Rasm va Sharh */}
        {step === 3 && (
          <div className="animate-in slide-in-from-right-4 fade-in duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Qo'shimcha ma'lumotlar</h2>
            <p className="text-sm text-gray-500 mb-6">Profilingiz chiroyli ko'rinishi uchun.</p>
            
            <div className="space-y-4 mb-6">
              <div className="relative">
                <Upload className="absolute left-4 top-4 text-gray-400" size={20} />
                <input
                  type="text"
                  name="logo_url"
                  value={formData.logo_url}
                  onChange={handleChange}
                  placeholder="Logotip URL manzili (ixtiyoriy)"
                  className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="relative">
                <Info className="absolute left-4 top-4 text-gray-400" size={20} />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Do'koningiz haqida qisqacha ma'lumot (xizmatlar, afzalliklar...)"
                  rows={3}
                  className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold focus:border-blue-500 outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={prevStep} className="p-4 bg-gray-100 rounded-2xl text-gray-600 hover:bg-gray-200 transition-colors">
                <ArrowLeft size={20} />
              </button>
              <button 
                onClick={nextStep}
                disabled={!formData.description}
                className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                Keyingisi
              </button>
            </div>
          </div>
        )}

        {/* 4-BOSQICH: Login va Parol */}
        {step === 4 && (
          <div className="animate-in slide-in-from-right-4 fade-in duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tizimga kirish ma'lumotlari</h2>
            <p className="text-sm text-gray-500 mb-6">Shaxsiy kabinetingiz uchun login va parol unutmang.</p>
            
            <div className="space-y-4 mb-6">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Login o'ylab toping"
                  className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Parol yarating"
                  className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="relative">
                <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Parolni takrorlang"
                  className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={prevStep} className="p-4 bg-gray-100 rounded-2xl text-gray-600 hover:bg-gray-200 transition-colors">
                <ArrowLeft size={20} />
              </button>
              <button 
                onClick={handleSubmit}
                disabled={loading || !formData.username || !formData.password}
                className="flex-1 bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-70"
              >
                {loading ? 'Yuborilmoqda...' : 'Ro\'yxatdan o\'tish'}
              </button>
            </div>
          </div>
        )}

        {/* 5-BOSQICH: Muvaffaqiyatli yakun */}
        {step === 5 && (
          <div className="animate-in zoom-in fade-in duration-500 flex flex-col items-center text-center py-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="text-green-500" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Arizangiz qabul qilindi!</h2>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Do'kon ma'lumotlari administratorga yuborildi. Tasdiqlanganidan so'ng tizimga kirishingiz mumkin.
            </p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition-all"
            >
              Tizimga kirish sahifasi
            </button>
          </div>
        )}

      </div>
    </div>
  );
}