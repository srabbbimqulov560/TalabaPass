import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout
import MainLayout from './components/MainLayout';

// Rasmdagi fayl nomlariga aynan moslab qilingan importlar (Case-sensitive)
import Home from './pages/home';
import Profile from './pages/profile';
import Login from './pages/login';
import Signup from './pages/signup';
import Services from './pages/Services';
import AdminPanel from './pages/AdminPanel';
import Cashier from './pages/cashier';
import DiscountDetail from './pages/discount-detail';
import NotFound from './pages/not-found';

// QR Skaner uchun vaqtincha komponent (chunki pages ichida qr.tsx yo'q ekan)
const QRPlaceholder = () => (
  <div className="p-6 md:p-12 flex flex-col items-center justify-center h-[70vh]">
    <div className="w-64 h-64 border-4 border-dashed border-orange-300 rounded-3xl flex items-center justify-center bg-orange-50">
      <p className="text-orange-500 font-bold text-center">QR Kamera bu yerda ochiladi</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Saytga kirganda avtomatik asosiy sahifaga yo'naltirish */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* ========================================================= */}
        {/* AVTORIZATSIYA (Menyusiz, to'liq ekran chiqadigan sahifalar) */}
        {/* ========================================================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Admin panel o'zining alohida dizaynida ochilishi uchun */}
        <Route path="/admin" element={<AdminPanel />} />


        {/* ========================================================= */}
        {/* ASOSIY ILOVA (Pastki yoki yon menyu - MainLayout bilan)     */}
        {/* ========================================================= */}
        
        {/* Asosiy sahifa (home.tsx ulandi) */}
        <Route path="/dashboard" element={
          <MainLayout>
            <Home />
          </MainLayout>
        } />
        
        {/* Profil sahifasi (profile.tsx ulandi) */}
        <Route path="/profile" element={
          <MainLayout>
            <Profile />
          </MainLayout>
        } />
        
        {/* Xizmatlar/Do'konlar sahifasi (Services.tsx ulandi) */}
        <Route path="/services" element={
          <MainLayout>
            <Services />
          </MainLayout>
        } />

        {/* QR Kod o'quvchi sahifa */}
        <Route path="/qr" element={
          <MainLayout>
            <QRPlaceholder /> {/* Agar tayyor kodingiz bo'lsa <Cashier /> ga almashtirishingiz mumkin */}
          </MainLayout>
        } />

        {/* Chegirma batafsil sahifasi */}
        <Route path="/discount/:id" element={
          <MainLayout>
            <DiscountDetail />
          </MainLayout>
        } />

        {/* ========================================================= */}
        {/* XATOLIK SAHIFASI                                          */}
        {/* ========================================================= */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  );
}

export default App;