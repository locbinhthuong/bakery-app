import { useState, useEffect } from 'react';
import { ShoppingBag, CakeSlice, MapPin, Phone, ArrowRight, Home as HomeIcon, Menu, Gift, User, LogOut, Trash2, Shield, FileText, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { Outlet, Link, useLocation } from 'react-router-dom';

const BACKEND_URL = import.meta.env.DEV ? 'http://localhost:5001/api/shop' : 'https://bakery-backend-six.vercel.app/api/shop';

export default function CustomerLayout() {
  const [products, setProducts] = useState([]);
  const [promos, setPromos] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCheckout, setIsCheckout] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', note: '' });
  const [scrolled, setScrolled] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);

  const [customer, setCustomer] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authForm, setAuthForm] = useState({ phone: '', password: '', name: '' });
  const [showProfileModal, setShowProfileModal] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    axios.get(`${BACKEND_URL}/products`)
      .then(res => setProducts(res.data.data))
      .catch(err => console.error(err));
      
    axios.get(`${BACKEND_URL}/promos`)
      .then(res => setPromos(res.data.data))
      .catch(err => console.error(err));
      
    const token = localStorage.getItem('bakery_token');
    const savedCustomer = localStorage.getItem('bakery_customer');
    if (token && savedCustomer) {
      const cust = JSON.parse(savedCustomer);
      setCustomer(cust);
      setFormData(prev => ({ ...prev, name: cust.name, phone: cust.phone, address: cust.address || '' }));
    }
  }, []);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        return prev.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const finalAmount = totalAmount - (appliedPromo ? appliedPromo.discountAmount : 0);

  useEffect(() => {
    if (cart.length === 0) setAppliedPromo(null);
  }, [cart]);

  const applyDiscount = async () => {
    if (!discountCode) return alert('Vui lòng nhập mã giảm giá');
    try {
      const res = await axios.post(`${BACKEND_URL}/promos/validate`, { code: discountCode.toUpperCase(), totalAmount });
      setAppliedPromo(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Mã giảm giá không hợp lệ');
      setAppliedPromo(null);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) return alert('Vui lòng điền đủ thông tin');
    
    try {
      await axios.post(`${BACKEND_URL}/orders`, {
        customerName: formData.name,
        customerPhone: formData.phone,
        deliveryAddress: formData.address,
        note: formData.note,
        items: cart.map(i => ({ productId: i._id, name: i.name, price: i.price, quantity: i.quantity })),
        subTotal: totalAmount,
        discountCode: appliedPromo ? appliedPromo.code : '',
        discountAmount: appliedPromo ? appliedPromo.discountAmount : 0,
        totalAmount: finalAmount
      });
      alert('Tuyệt vời! Đơn hàng của bạn đã được ghi nhận.');
      setCart([]);
      setAppliedPromo(null);
      setDiscountCode('');
      setIsCheckout(false);
    } catch (err) {
      alert('Lỗi đặt hàng, vui lòng thử lại.');
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
        setCustomer(res.data.data.customer);
        setFormData(prev => ({ ...prev, name: res.data.data.customer.name, phone: res.data.data.customer.phone, address: res.data.data.customer.address || '' }));
        setShowAuthModal(false);
        setAuthForm({ phone: '', password: '', name: '' });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bakery_token');
    localStorage.removeItem('bakery_customer');
    setCustomer(null);
    setShowProfileModal(false);
    setFormData({ name: '', phone: '', address: '', note: '' });
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản này? Hành động này không thể hoàn tác.')) {
      try {
        const token = localStorage.getItem('bakery_token');
        await axios.delete(`${BACKEND_URL}/customer/profile`, { headers: { Authorization: `Bearer ${token}` } });
        handleLogout();
        alert('Đã xóa tài khoản thành công');
      } catch(err) {
        alert('Không thể xóa tài khoản');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-stone-800 selection:bg-brand-200 selection:text-brand-900">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ease-out-expo ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3 md:py-4' : 'bg-transparent py-4 md:py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex justify-between items-center">
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-brand-900 rounded-full flex items-center justify-center text-[#FDFBF7] transition-transform duration-500 group-hover:rotate-12 shadow-sm">
                <CakeSlice size={20} />
              </div>
              <span className="text-2xl font-serif font-bold text-brand-900 tracking-tight">Le Petit</span>
            </Link>
            <div className="hidden lg:flex items-center gap-8 text-sm font-medium tracking-wide text-stone-600 uppercase">
              <Link to="/" className={`transition-colors ${location.pathname === '/' ? 'text-brand-900 font-bold' : 'hover:text-brand-900'}`}>Trang chủ</Link>
              <Link to="/menu" className={`transition-colors ${location.pathname === '/menu' ? 'text-brand-900 font-bold' : 'hover:text-brand-900'}`}>Tất cả sản phẩm</Link>
              <button onClick={() => { if(location.pathname !== '/') window.location.href = '/#tin-tuc'; else document.getElementById('tin-tuc')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-brand-900 transition-colors">Khuyến mãi</button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { if(customer) setShowProfileModal(true); else setShowAuthModal(true); }}
              className="hidden md:flex items-center gap-2 text-stone-600 hover:text-brand-900 transition-colors"
            >
              <User size={20} strokeWidth={2} />
              <span className="text-sm font-medium tracking-wide uppercase">{customer ? customer.name : 'Đăng nhập'}</span>
            </button>
            <button 
              onClick={() => setIsCheckout(true)}
              className="hidden md:flex relative items-center gap-2 text-stone-800 hover:text-brand-900 transition-colors ml-4 pl-4 border-l border-stone-200"
            >
              <span className="text-sm font-medium tracking-wide uppercase">Giỏ hàng</span>
              <div className="relative">
                <ShoppingBag size={24} strokeWidth={1.5} />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-2 w-5 h-5 bg-brand-700 text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-[#FDFBF7]">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </div>
            </button>
            <button 
              onClick={() => setIsCheckout(true)}
              className="md:hidden relative flex items-center justify-center w-10 h-10 bg-white/80 backdrop-blur rounded-full shadow-sm text-stone-800 border border-stone-200"
            >
              <ShoppingBag size={20} strokeWidth={2} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-brand-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="min-h-[70vh]">
        <Outlet context={{ products, promos, addToCart, customer }} />
      </div>

      {/* Footer / Store info */}
      <footer id="cua-hang" className="bg-brand-900 text-brand-50 pt-16 md:pt-20 pb-28 md:pb-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#FDFBF7] rounded-full flex items-center justify-center text-brand-900">
                  <CakeSlice size={24} />
                </div>
                <span className="text-3xl font-serif font-bold tracking-tight">Le Petit</span>
              </div>
              <p className="text-brand-200/80 leading-relaxed max-w-sm mb-8">
                Đánh thức những nốt hương đặc sản của nông sản Việt Nam qua từng mẻ bánh thủ công.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-brand-800 flex items-center justify-center hover:bg-[#FDFBF7] hover:text-brand-900 transition-colors font-bold text-sm">FB</a>
                <a href="#" className="w-10 h-10 rounded-full bg-brand-800 flex items-center justify-center hover:bg-[#FDFBF7] hover:text-brand-900 transition-colors font-bold text-sm">IG</a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-serif font-medium mb-6">Hệ thống cửa hàng</h4>
              <ul className="space-y-4 text-brand-200/80">
                <li className="flex gap-3">
                  <MapPin size={20} className="shrink-0 text-brand-400" />
                  <span>Trụ sở chính: 289 Đinh Bộ Lĩnh, P. Bình Thạnh, TP. Hồ Chí Minh</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-serif font-medium mb-6">Hỗ trợ khách hàng</h4>
              <ul className="space-y-4 text-brand-200/80">
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-brand-400" />
                  <span className="font-medium text-[#FDFBF7]">1900 3013</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-brand-800 text-center text-sm text-brand-400/60">
            © 2026 Le Petit Bakery. Lấy cảm hứng từ những nốt hương đặc sản. Không dính bản quyền.
          </div>
        </div>
      </footer>

      {/* Cart Drawer Overlay */}
      {isCheckout && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-sm transition-opacity" onClick={() => setIsCheckout(false)}></div>
          <div className="relative w-full max-w-md bg-[#FDFBF7] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out-expo">
            <div className="p-6 border-b border-stone-200/60 flex justify-between items-center bg-white">
              <h2 className="text-2xl font-serif font-medium text-brand-900">Giỏ Hàng</h2>
              <button onClick={() => setIsCheckout(false)} className="text-stone-400 hover:text-stone-900 text-sm font-medium tracking-widest uppercase transition-colors">Đóng</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-stone-400 gap-4">
                  <ShoppingBag size={48} strokeWidth={1} />
                  <p>Giỏ hàng chưa có sản phẩm nào.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-4">
                      <div className="w-16 h-16 bg-white rounded-md overflow-hidden shrink-0 border border-stone-100 p-1">
                        {item.image ? <img src={item.image} className="w-full h-full object-contain" /> : null}
                      </div>
                      <div className="flex-1">
                        <div className="font-serif font-medium text-stone-800 leading-tight">{item.name}</div>
                        <div className="text-sm text-stone-500 mt-1">{item.price.toLocaleString('vi-VN')} ₫ x {item.quantity}</div>
                      </div>
                      <div className="font-medium text-brand-800">
                        {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 space-y-3">
                    <div className="flex justify-between items-center text-stone-600 text-sm">
                      <span>Tạm tính</span>
                      <span>{totalAmount.toLocaleString('vi-VN')} ₫</span>
                    </div>
                    {appliedPromo && (
                      <div className="flex justify-between items-center text-green-600 text-sm font-medium bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                        <span>Đã giảm ({appliedPromo.code})</span>
                        <span>-{appliedPromo.discountAmount.toLocaleString('vi-VN')} ₫</span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-stone-200/60 flex justify-between items-center text-xl font-serif font-medium text-brand-900">
                      <span>Tổng cộng</span>
                      <span>{finalAmount.toLocaleString('vi-VN')} ₫</span>
                    </div>
                  </div>
                </div>
              )}

              {cart.length > 0 && (
                <form onSubmit={handleCheckout} className="space-y-4 pt-4 border-t border-stone-200/60">
                  <h3 className="font-medium text-stone-800 mb-2 tracking-wide uppercase text-sm">Mã giảm giá</h3>
                  <div className="flex gap-2">
                    <input 
                      type="text" placeholder="Nhập mã giảm giá..."
                      className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 focus:bg-white focus:border-brand-500 rounded-xl outline-none transition-colors uppercase"
                      value={discountCode} onChange={e => setDiscountCode(e.target.value)}
                    />
                    <button type="button" onClick={applyDiscount} className="px-6 bg-brand-100 text-brand-800 font-bold rounded-xl hover:bg-brand-200 transition-colors">
                      Áp dụng
                    </button>
                  </div>
                  
                  <h3 className="font-medium text-stone-800 mt-6 mb-4 tracking-wide uppercase text-sm border-t border-stone-200/60 pt-6">Thông tin giao hàng</h3>
                  <input 
                    type="text" placeholder="Tên người nhận" required
                    className="w-full px-4 py-3 bg-white border border-stone-200 focus:border-brand-500 rounded-xl outline-none transition-colors"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                  <input 
                    type="tel" placeholder="Số điện thoại" required
                    className="w-full px-4 py-3 bg-white border border-stone-200 focus:border-brand-500 rounded-xl outline-none transition-colors"
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                  <input 
                    type="text" placeholder="Địa chỉ giao hàng" required
                    className="w-full px-4 py-3 bg-white border border-stone-200 focus:border-brand-500 rounded-xl outline-none transition-colors"
                    value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                  <textarea 
                    placeholder="Ghi chú (tùy chọn)" rows="2"
                    className="w-full px-4 py-3 bg-white border border-stone-200 focus:border-brand-500 rounded-xl outline-none transition-colors resize-none"
                    value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})}
                  ></textarea>
                  <button type="submit" className="w-full py-4 mt-4 bg-brand-900 text-[#FDFBF7] rounded-xl font-medium tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-stone-900 transition-colors shadow-md">
                    Thanh toán ngay <ArrowRight size={18} />
                  </button>
                  {!customer && (
                    <p className="text-center text-sm text-stone-500 mt-4">
                      Bạn chưa đăng nhập? <button type="button" onClick={() => { setIsCheckout(false); setShowAuthModal(true); }} className="text-brand-700 font-medium hover:underline">Đăng nhập ngay</button>
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setShowAuthModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-serif font-bold text-brand-900 mb-2">{isLoginMode ? 'Đăng nhập' : 'Tạo tài khoản'}</h2>
              <p className="text-stone-500 text-sm mb-6">{isLoginMode ? 'Nhập số điện thoại để tiếp tục mua bánh' : 'Đăng ký ngay để lưu địa chỉ và mua hàng nhanh chóng'}</p>
              
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {!isLoginMode && (
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Họ và tên</label>
                    <input 
                      type="text" required
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none transition-all"
                      value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Số điện thoại</label>
                  <input 
                    type="tel" required
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none transition-all"
                    value={authForm.phone} onChange={e => setAuthForm({...authForm, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Mật khẩu</label>
                  <input 
                    type="password" required
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none transition-all"
                    value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})}
                  />
                </div>
                <button type="submit" className="w-full py-3.5 mt-2 bg-brand-900 text-white rounded-xl font-bold uppercase tracking-wider hover:bg-brand-800 transition-colors shadow-md">
                  {isLoginMode ? 'Đăng nhập' : 'Đăng ký'}
                </button>
              </form>
              
              <div className="mt-6 text-center text-sm text-stone-500">
                {isLoginMode ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
                <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-brand-700 font-bold hover:underline">
                  {isLoginMode ? 'Đăng ký ngay' : 'Đăng nhập'}
                </button>
              </div>
            </div>
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200">✕</button>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && customer && (
        <div className="fixed inset-0 z-[110] flex justify-center md:items-center">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setShowProfileModal(false)}></div>
          <div className="relative w-full md:max-w-md h-full md:h-auto bg-[#FDFBF7] md:rounded-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom md:zoom-in-95 duration-300 md:mt-10">
            <div className="p-5 md:p-6 border-b border-stone-200/60 flex justify-between items-center bg-white md:rounded-t-3xl">
              <h2 className="text-xl font-serif font-bold text-brand-900">Thông tin tài khoản</h2>
              <button onClick={() => setShowProfileModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 font-bold">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 md:p-8 pb-32">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center text-brand-900 shadow-inner">
                  <User size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-900">{customer.name}</h3>
                  <p className="text-stone-500 font-medium">{customer.phone}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-stone-200/60 overflow-hidden mb-6 shadow-sm">
                <button className="w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-stone-50 transition-colors border-b border-stone-100">
                  <MapPin size={20} className="text-brand-600" />
                  <span className="flex-1 font-medium text-stone-700">Chỉnh sửa địa chỉ & thông tin</span>
                  <ChevronRight size={18} className="text-stone-300" />
                </button>
                <button className="w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-stone-50 transition-colors border-b border-stone-100">
                  <Shield size={20} className="text-brand-600" />
                  <span className="flex-1 font-medium text-stone-700">Chính sách bảo mật</span>
                  <ChevronRight size={18} className="text-stone-300" />
                </button>
                <button className="w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-stone-50 transition-colors">
                  <FileText size={20} className="text-brand-600" />
                  <span className="flex-1 font-medium text-stone-700">Điều khoản sử dụng</span>
                  <ChevronRight size={18} className="text-stone-300" />
                </button>
              </div>

              <div className="space-y-3">
                <button onClick={handleLogout} className="w-full px-5 py-4 bg-stone-200/50 hover:bg-stone-200 text-stone-700 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors">
                  <LogOut size={18} /> Đăng xuất
                </button>
                <button onClick={handleDeleteAccount} className="w-full px-5 py-4 text-red-500 hover:bg-red-50 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors">
                  <Trash2 size={18} /> Xóa tài khoản vĩnh viễn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-stone-200 flex justify-around items-end pb-6 pt-3 px-2 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <Link to="/" className={`flex flex-col items-center gap-1.5 w-[20%] transition-colors ${location.pathname === '/' ? 'text-brand-900' : 'text-stone-400 hover:text-brand-900'}`}>
          <HomeIcon size={22} strokeWidth={location.pathname === '/' ? 2.5 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Trang chủ</span>
        </Link>
        <Link to="/menu" className={`flex flex-col items-center gap-1.5 w-[20%] transition-colors ${location.pathname === '/menu' ? 'text-brand-900' : 'text-stone-400 hover:text-brand-900'}`}>
          <Menu size={22} strokeWidth={location.pathname === '/menu' ? 2.5 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Menu</span>
        </Link>
        <button onClick={() => { if(location.pathname !== '/') window.location.href = '/#tin-tuc'; else document.getElementById('tin-tuc')?.scrollIntoView({ behavior: 'smooth' }); }} className="flex flex-col items-center gap-1.5 w-[20%] text-stone-400 hover:text-brand-900 transition-colors">
          <Gift size={22} strokeWidth={2} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Khuyến mãi</span>
        </button>
        <button onClick={() => { if(customer) setShowProfileModal(true); else setShowAuthModal(true); }} className="flex flex-col items-center gap-1.5 w-[20%] text-stone-400 hover:text-brand-900 transition-colors">
          <User size={22} strokeWidth={2} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Tài khoản</span>
        </button>
      </div>
    </div>
  );
}
