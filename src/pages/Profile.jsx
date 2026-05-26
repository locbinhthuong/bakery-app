import { useOutletContext, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { Clock, CheckCircle2, Store, Star, UserCircle, MapPin, Info, LogOut, ChevronRight, Eye, EyeOff, X, FileText, Shield } from 'lucide-react';

const BACKEND_URL = import.meta.env.DEV ? 'http://localhost:5001/api/shop' : 'https://bakery-backend-six.vercel.app/api/shop';

export default function Profile() {
  const { customer, updateCustomer } = useOutletContext();
  const navigate = useNavigate();
  
  // Auth states (if not logged in)
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authForm, setAuthForm] = useState({ phone: '', password: '', name: '' });
  const [showPassword, setShowPassword] = useState(false);

  // Edit Profile States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', address: '' });

  const handleOpenEdit = () => {
    setEditForm({ name: customer.name || '', phone: customer.phone || '', address: customer.address || '' });
    setShowEditModal(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('bakery_token');
      const res = await axios.put(`${BACKEND_URL}/customer/profile`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        localStorage.setItem('bakery_customer', JSON.stringify(res.data.data.customer));
        updateCustomer(res.data.data.customer);
        setShowEditModal(false);
        alert('Cập nhật thông tin thành công!');
      }
    } catch(err) {
       alert('Lỗi cập nhật thông tin: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLoginMode ? '/auth/login' : '/auth/register';
      const payload = isLoginMode ? { phone: authForm.phone, password: authForm.password } : authForm;
      const res = await axios.post(`${BACKEND_URL}${endpoint}`, payload);
      
      if (res.data.success) {
        localStorage.setItem('bakery_token', res.data.data.token);
        localStorage.setItem('bakery_customer', JSON.stringify(res.data.data.customer));
        updateCustomer(res.data.data.customer);
        
        // Request GPS silently without saving to DB per user request
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => console.log("GPS Location acquired:", pos.coords.latitude, pos.coords.longitude),
            (err) => console.log("GPS Permission denied/failed:", err)
          );
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bakery_token');
    localStorage.removeItem('bakery_customer');
    updateCustomer(null);
  };

  if (!customer) {
    return (
      <div className="pb-24 pt-12 px-4 bg-brand-50 min-h-screen flex flex-col justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-100 max-w-sm w-full mx-auto">
          <div className="flex flex-col items-center mb-6">
            <img src="/logo_donut.jpg" alt="Logo" className="w-24 h-24 object-contain p-1 rounded-full shadow-md border-2 border-brand-100 bg-white mb-4" />
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2 text-center">
              {isLoginMode ? 'Đăng nhập' : 'Tạo tài khoản'}
            </h2>
            <p className="text-stone-600 text-sm text-center">
              {isLoginMode ? 'Tham gia cùng MABAE - Tiệm Bánh Donut' : 'Đăng ký ngay để nhận ưu đãi từ MABAE'}
            </p>
          </div>
          
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {!isLoginMode && (
              <div>
                <input 
                  type="text" required placeholder="Họ và tên"
                  className="w-full px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none transition-all font-medium"
                  value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})}
                />
              </div>
            )}
            <div>
              <input 
                type="tel" required placeholder="Số điện thoại"
                className="w-full px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none transition-all font-medium"
                value={authForm.phone} onChange={e => setAuthForm({...authForm, phone: e.target.value})}
              />
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} required placeholder="Mật khẩu"
                className="w-full px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none transition-all font-medium pr-12"
                value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-500 hover:text-brand-700 p-1"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <button type="submit" className="w-full py-3.5 bg-brand-600 text-white rounded-xl font-bold uppercase tracking-wider hover:bg-brand-700 transition-colors shadow-md mt-2">
              {isLoginMode ? 'Đăng nhập' : 'Đăng ký'}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm font-medium text-brand-800">
            {isLoginMode ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
            <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-brand-600 font-bold hover:underline">
              {isLoginMode ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 bg-brand-50 min-h-screen">
      {/* Background Graphic */}
      <div className="h-40 bg-gradient-to-b from-brand-600/20 to-brand-50 rounded-b-[40px] absolute top-0 w-full z-0"></div>

      <div className="px-4 pt-12 relative z-10">
        {/* Membership Card */}
        <div className="w-full bg-gradient-to-br from-teal-50/90 via-blue-50/80 to-brand-200 rounded-3xl p-6 shadow-sm border border-white/50 backdrop-blur-sm mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-stone-900 mb-2">{customer.name}</h2>
              <div className="inline-flex items-center gap-1.5 bg-brand-500/20 px-3 py-1 rounded-full text-brand-800 font-bold text-sm border border-brand-200">
                <span>⭐</span> 0 điểm
              </div>
            </div>
            <div className="w-10 h-10 bg-white/50 rounded-full flex items-center justify-center">
              <QrCodeIcon />
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-serif text-stone-800 mb-2">Thành Viên Mới</h3>
            <div className="w-full h-1 bg-brand-900/10 rounded-full mb-3">
              <div className="w-[10%] h-full bg-brand-500 rounded-full"></div>
            </div>
            <p className="text-stone-700 text-xs font-medium mb-1">Tích luỹ thêm để thăng hạng thẻ</p>
            <p className="text-brand-700 text-xs font-bold flex items-center">Tìm hiểu về quyền lợi thẻ <Info className="w-3 h-3 ml-1"/></p>
          </div>
        </div>

        {/* Tài khoản */}
        <div className="mb-8 mt-4">
          <h3 className="font-bold text-stone-900 text-lg mb-4 px-1">Tài khoản</h3>
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-brand-100/50">
            <button onClick={handleOpenEdit} className="w-full flex items-center justify-between p-4 bg-white hover:bg-brand-50 border-b border-brand-50 transition-colors">
              <div className="flex items-center gap-3 text-brand-800 font-bold">
                <UserCircle size={22} className="text-brand-600"/>
                Chỉnh sửa thông tin
              </div>
              <ChevronRight size={20} className="text-brand-300"/>
            </button>
            <Link to="/orders" className="w-full flex items-center justify-between p-4 bg-white hover:bg-brand-50 transition-colors">
              <div className="flex items-center gap-3 text-brand-800 font-bold">
                <Clock size={22} className="text-brand-600"/>
                Lịch sử đặt hàng
              </div>
              <ChevronRight size={20} className="text-brand-300"/>
            </Link>
          </div>
        </div>

        {/* Khác */}
        <div className="mb-4">
          <h3 className="font-bold text-brand-900 text-lg mb-4 px-1">Khác</h3>
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-brand-100/50">
            <button onClick={() => alert('Về chúng tôi đang được cập nhật!')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-brand-50 border-b border-brand-50 transition-colors">
              <div className="flex items-center gap-3 text-brand-800 font-bold">
                <Info size={22} className="text-brand-600"/>
                Về chúng tôi
              </div>
              <ChevronRight size={20} className="text-brand-300"/>
            </button>
            <button onClick={() => alert('Điều khoản sử dụng đang được cập nhật!')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-brand-50 border-b border-brand-50 transition-colors">
              <div className="flex items-center gap-3 text-brand-800 font-bold">
                <FileText size={22} className="text-brand-600"/>
                Điều khoản sử dụng
              </div>
              <ChevronRight size={20} className="text-brand-300"/>
            </button>
            <button onClick={() => alert('Chính sách bảo mật đang được cập nhật!')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-brand-50 border-b border-brand-50 transition-colors">
              <div className="flex items-center gap-3 text-brand-800 font-bold">
                <Shield size={22} className="text-brand-600"/>
                Chính sách bảo mật
              </div>
              <ChevronRight size={20} className="text-brand-300"/>
            </button>
            <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 bg-white hover:bg-brand-50 transition-colors">
              <div className="flex items-center gap-3 text-brand-800 font-bold">
                <LogOut size={22} className="text-brand-600"/>
                Đăng xuất
              </div>
              <ChevronRight size={20} className="text-brand-300"/>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setShowEditModal(false)}></div>
          <div className="relative bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-stone-900">Thông tin cá nhân</h3>
              <button onClick={() => setShowEditModal(false)} className="text-stone-400 hover:text-stone-600"><X size={24}/></button>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1 ml-1">Họ và tên</label>
                <input 
                  type="text" required 
                  className="w-full px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl outline-none font-medium focus:bg-white focus:border-brand-500 transition-colors"
                  value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1 ml-1">Số điện thoại</label>
                <input 
                  type="tel" required 
                  className="w-full px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl outline-none font-medium focus:bg-white focus:border-brand-500 transition-colors"
                  value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1 ml-1">Địa chỉ giao hàng mặc định</label>
                <textarea 
                  rows="2"
                  className="w-full px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl outline-none font-medium resize-none focus:bg-white focus:border-brand-500 transition-colors"
                  value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})}
                  placeholder="Nhập địa chỉ của bạn"
                ></textarea>
              </div>
              <button type="submit" className="w-full py-3.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-md mt-4">
                Lưu thay đổi
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Just a simple visual mock for the tiny QR in the corner of the card
function QrCodeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-800">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <path d="M7 7h.01"></path>
      <path d="M17 7h.01"></path>
      <path d="M7 17h.01"></path>
      <path d="M17 17h.01"></path>
    </svg>
  );
}
