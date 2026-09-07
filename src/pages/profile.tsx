import { LogOut, User, Settings, ShieldCheck } from 'lucide-react';

export default function Profile() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-[calc(100vh-112px)] bg-[#f8f9fc] p-6 pt-12 flex flex-col">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-8">Mening Profilim</h1>
      
      {/* Foydalanuvchi ma'lumotlari */}
      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-50 flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
          <User size={32} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Shoxjaxon</h2>
          <p className="text-sm text-gray-500">Talaba / ID: 123456</p>
        </div>
      </div>

      {/* Menyular */}
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-50 overflow-hidden mb-6">
        <button className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors border-b border-gray-50">
          <ShieldCheck className="text-gray-400" size={24} />
          <span className="font-semibold text-gray-700">Xavfsizlik</span>
        </button>
        <button className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors">
          <Settings className="text-gray-400" size={24} />
          <span className="font-semibold text-gray-700">Sozlamalar</span>
        </button>
      </div>

      {/* CHIQISH TUGMASI (Avtomatik pastga tushadi) */}
      <div className="mt-auto">
        <button 
          onClick={handleLogout}
          className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors active:scale-95"
        >
          <LogOut size={20} />
          Tizimdan chiqish
        </button>
      </div>
    </div>
  );
}