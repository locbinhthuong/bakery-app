import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';

import CustomerLayout from './layouts/CustomerLayout';
import Menu from './pages/Menu';

function App() {
  const hostname = window.location.hostname;
  // Kiểm tra xem tên miền có chứa chữ "admin" không (ví dụ: admin-banh.aloshipp.com)
  const isAdminDomain = hostname.includes('admin');

  return (
    <Router>
      <div className="min-h-screen bg-[#FDFBF7] font-sans text-stone-900">
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
