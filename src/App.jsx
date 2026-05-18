import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';

function App() {
  const hostname = window.location.hostname;
  // Kiểm tra xem tên miền có chứa chữ "admin" không (ví dụ: admin-banh.aloshipp.com)
  const isAdminDomain = hostname.includes('admin');

  return (
    <Router>
      <div className="min-h-screen bg-[#fafaf9] font-sans text-stone-900">
        {isAdminDomain ? (
          <Routes>
            {/* Nếu truy cập bằng tên miền Admin, trang chủ '/' sẽ là Admin luôn */}
            <Route path="*" element={<Admin />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/" element={<Home />} />
            {/* Vẫn giữ hờ /admin cho lúc test localhost */}
            <Route path="/admin" element={<Admin />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
