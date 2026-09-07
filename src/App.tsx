import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MobileLayout from './components/MobileLayout';
import Profile from './pages/profile';

// Vaqtincha komponentlar (O'zingizdagi haqiqiy sahifalarni ulab olasiz)
const Dashboard = () => <div className="p-6 pt-12"><h1 className="text-2xl font-bold">Asosiy sahifa</h1></div>;
const QRCodePage = () => <div className="p-6 pt-12"><h1 className="text-2xl font-bold">QR Kod Skaner</h1></div>;
const Login = () => <div className="p-6 pt-12"><h1 className="text-2xl font-bold">Login Sahifasi</h1></div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Avtorizatsiya sahifalari menyusiz (to'liq ekran) ko'rinadi */}
        <Route path="/login" element={<Login />} />
        
        {/* Asosiy sahifalar MobileLayout (pastki menyu) bilan o'ralgan */}
        <Route path="/dashboard" element={
          <MobileLayout>
            <Dashboard />
          </MobileLayout>
        } />
        
        <Route path="/qr" element={
          <MobileLayout>
            <QRCodePage />
          </MobileLayout>
        } />
        
        <Route path="/profile" element={
          <MobileLayout>
            <Profile />
          </MobileLayout>
        } />
      </Routes>
    </Router>
  );
}

export default App;