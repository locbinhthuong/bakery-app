import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Admin from './pages/Admin';

import CustomerLayout from './layouts/CustomerLayout';
import Menu from './pages/Menu';
import Promos from './pages/Promos';
import Profile from './pages/Profile';
import Orders from './pages/Orders';

function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-brand-50 z-[9999] flex flex-col items-center justify-center animate-out fade-out duration-1000 fill-mode-forwards" style={{ animationDelay: '2s' }}>
      <div className="animate-bounce">
        <img src="/logo_donut.jpg" alt="MABAE" className="w-32 h-32 object-contain p-2 rounded-full shadow-2xl border-4 border-white bg-white" />
      </div>
      <h1 className="text-3xl font-serif font-bold text-brand-900 mt-6 tracking-wide opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-forwards" style={{ animationDelay: '0.5s' }}>
        MABAE
      </h1>
      <p className="text-brand-600 font-bold mt-2 opacity-0 animate-in fade-in duration-1000 fill-mode-forwards" style={{ animationDelay: '1s' }}>
        Tiệm Bánh Donut
      </p>
    </div>
  );
}

function App() {
  const hostname = window.location.hostname;
  // Kiểm tra xem tên miền có chứa chữ "admin" không (ví dụ: admin-banh.aloshipp.com)
  const isAdminDomain = hostname.includes('admin');
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <div className="min-h-[100dvh] bg-brand-50 font-sans text-stone-900">
        {showSplash && !isAdminDomain && <SplashScreen />}
        {isAdminDomain ? (
          <Routes>
            {/* Nếu truy cập bằng tên miền Admin, trang chủ '/' sẽ là Admin luôn */}
            <Route path="*" element={<Admin />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/" element={<CustomerLayout />}>
              <Route index element={<Home />} />
              <Route path="menu" element={<Menu />} />
              <Route path="promos" element={<Promos />} />
              <Route path="profile" element={<Profile />} />
              <Route path="orders" element={<Orders />} />
            </Route>
            {/* Vẫn giữ hờ /admin cho lúc test localhost */}
            <Route path="/admin" element={<Admin />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
