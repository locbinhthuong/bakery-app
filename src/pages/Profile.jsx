import { useOutletContext } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { Clock, CheckCircle2, Store, Star, UserCircle, MapPin, Info, LogOut, ChevronRight } from 'lucide-react';

const BACKEND_URL = import.meta.env.DEV ? 'http://localhost:5001/api/shop' : 'https://bakery-backend-six.vercel.app/api/shop';

export default function Profile() {
  const { customer, updateCustomer } = useOutletContext();
  
  // Auth states (if not logged in)
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authForm, setAuthForm] = useState({ phone: '', password: '', name: '' });

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
          <h2 className="text-2xl font-serif font-bold text-brand-900 mb-2 text-center">
            {isLoginMode ? 'Đăng nhập' : 'Tạo tài khoản'}
          </h2>
          <p className="text-brand-600 text-sm mb-6 text-center">
            {isLoginMode ? 'Tham gia cùng Le Petit ngay hôm nay' : 'Đăng ký ngay để tích điểm và nhận ưu đãi'}
          </p>
          
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
            <div>
              <input 
                type="password" required placeholder="Mật khẩu"
                className="w-full px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none transition-all font-medium"
                value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})}
              />
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
              <h2 className="text-2xl font-bold text-brand-900 mb-2">{customer.name}</h2>
              <div className="inline-flex items-center gap-1.5 bg-brand-500/20 px-3 py-1 rounded-full text-brand-800 font-bold text-sm">
                <span>🎵</span> 0
              </div>
            </div>
            <div className="w-10 h-10 bg-white/50 rounded-full flex items-center justify-center">
              <QrCodeIcon />
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-serif text-brand-800 mb-2">Hạng Đồng Chill</h3>
            <div className="w-full h-1 bg-brand-900/10 rounded-full mb-3">
              <div className="w-[10%] h-full bg-brand-500 rounded-full"></div>
            </div>
            <p className="text-brand-900/70 text-xs font-medium mb-1">10 nốt nhạc nữa bạn sẽ thăng lên Hạng FA</p>
            <p className="text-brand-600 text-xs font-bold">Tìm hiểu về Các hạng thẻ thành viên <Info className="inline w-3 h-3 ml-1"/></p>
          </div>
        </div>

        {/* Tiện ích */}
        <div className="mb-8">
          <h3 className="font-bold text-brand-900 text-lg mb-4 px-1">Tiện ích</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-4 flex flex-col items-start gap-3 shadow-sm border border-brand-100/50">
              <Clock size={28} className="text-brand-600" strokeWidth={1.5}/>
              <span className="font-bold text-brand-900 text-sm leading-tight">Lịch sử đặt<br/>hàng</span>
            </div>
            <div className="bg-white rounded-2xl p-4 flex flex-col items-start gap-3 shadow-sm border border-brand-100/50">
              <CheckCircle2 size={28} className="text-brand-600" strokeWidth={1.5}/>
              <span className="font-bold text-brand-900 text-sm leading-tight">Lịch sử<br/>điểm</span>
            </div>
            <div className="bg-white rounded-2xl p-4 flex flex-col items-start gap-3 shadow-sm border border-brand-100/50">
              <Store size={28} className="text-brand-600" strokeWidth={1.5}/>
              <span className="font-bold text-brand-900 text-sm leading-tight">Cửa hàng<br/>&nbsp;</span>
            </div>
            <div className="bg-white rounded-2xl p-4 flex flex-col items-start gap-3 shadow-sm border border-brand-100/50">
              <Star size={28} className="text-brand-600" strokeWidth={1.5}/>
              <span className="font-bold text-brand-900 text-sm leading-tight">Đánh giá<br/>đơn hàng</span>
            </div>
          </div>
        </div>

        {/* Tài khoản */}
        <div className="mb-8">
          <h3 className="font-bold text-brand-900 text-lg mb-4 px-1">Tài khoản</h3>
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-brand-100/50">
            <button className="w-full flex items-center justify-between p-4 bg-white hover:bg-brand-50 border-b border-brand-50 transition-colors">
              <div className="flex items-center gap-3 text-brand-800 font-bold">
                <UserCircle size={22} className="text-brand-600"/>
                Thông tin cá nhân
              </div>
              <ChevronRight size={20} className="text-brand-300"/>
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-white hover:bg-brand-50 transition-colors">
              <div className="flex items-center gap-3 text-brand-800 font-bold">
                <MapPin size={22} className="text-brand-600"/>
                Địa chỉ đã lưu
              </div>
              <ChevronRight size={20} className="text-brand-300"/>
            </button>
          </div>
        </div>

        {/* Khác */}
        <div className="mb-4">
          <h3 className="font-bold text-brand-900 text-lg mb-4 px-1">Khác</h3>
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-brand-100/50">
            <button className="w-full flex items-center justify-between p-4 bg-white hover:bg-brand-50 border-b border-brand-50 transition-colors">
              <div className="flex items-center gap-3 text-brand-800 font-bold">
                <Info size={22} className="text-brand-600"/>
                Về chúng tôi
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
