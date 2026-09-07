import { useState, useEffect } from 'react';
import { Search, MapPin, Star } from 'lucide-react';
import axios from 'axios';

const API_URL = 'https://talabapass.onrender.com';

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/services`)
      .then(res => setServices(res.data))
      .finally(() => setLoading(false));
  }, []);

  // Qidiruv bo'yicha filterlash
  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-4 sm:p-6 pb-24">
      {/* Qidiruv qismi */}
      <div className="sticky top-0 z-10 bg-[#f8f9fc] pt-2 pb-4">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-4">Xizmatlar</h1>
        <div className="relative shadow-sm rounded-2xl overflow-hidden">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Do'kon yoki xizmat qidiring..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 outline-none text-sm font-medium border-2 border-transparent focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400 font-medium">Xizmatlar yuklanmoqda...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredServices.map(service => (
            <div key={service.id} className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{service.category}</span>
                </div>
                {/* Reyting qismi (kelajakda sharhlar uchun) */}
                <div className="flex items-center gap-1 text-yellow-500 bg-yellow-50 px-2 py-1 rounded-lg">
                  <Star size={14} fill="currentColor" />
                  <span className="text-xs font-bold">{service.rating > 0 ? service.rating : 'Yangi'}</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{service.description}</p>
              
              <button className="mt-auto w-full py-3 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-gray-700 font-bold rounded-xl transition-colors text-sm">
                Chegirmalarni ko'rish
              </button>
            </div>
          ))}
          
          {filteredServices.length === 0 && (
            <div className="text-center py-10 text-gray-500">Bunday xizmat topilmadi.</div>
          )}
        </div>
      )}
    </div>
  );
}