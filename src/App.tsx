import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Profile from './pages/Profile';

// Diqqat: Bu yerda o'zingizning haqiqiy sahifalaringizni import qiling!
// Masalan: import Dashboard from './pages/Dashboard';
// import QRCodeScanner from './pages/QRCodeScanner';
// import Login from './pages/Login';

// Hozircha bo'sh qolib ketmasligi uchun chiroyli o'rinbosarlar (Placeholders)
const DashboardPlaceholder = () => (
  <div className="p-6 md:p-12">
    <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Asosiy sahifa</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-40">Statistika 1</div>
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-40">Statistika 2</div>
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-40">Statistika 3</div>
    </div>
  </div>
);

const QRPlaceholder = () => (
  <div className="p-6 md:p-12 flex flex-col items-center justify-center h-[70vh]">
    <div className="w-64 h-64 border-4 border-dashed border-orange-300 rounded-3xl flex items-center justify-center bg-orange-50">
      <p className="text-orange-500 font-bold">Kamera bu yerda ochiladi</p>
    </div>
  </div>
);

const Login = () => <div className="p-6 pt-12"><h1 className="text-2xl font-bold">Login Sahifasi</h1></div>;


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Avtorizatsiya sahifalari menyusiz ko'rinadi */}
        <Route path="/login" element={<Login />} />
        
        {/* Asosiy sahifalar MainLayout bilan o'ralgan */}
        <Route path="/dashboard" element={
          <MainLayout>
            <DashboardPlaceholder /> {/* O'rniga haqiqiy <Dashboard /> ni qo'yasiz */}
          </MainLayout>
        } />
        
        <Route path="/qr" element={
          <MainLayout>
            <QRPlaceholder />
          </MainLayout>
        } />
        
        <Route path="/profile" element={
          <MainLayout>
            <Profile />
          </MainLayout>
        } />
      </Routes>
    </Router>
  );
}

export default App;