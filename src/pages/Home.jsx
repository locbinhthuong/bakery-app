import { useState, useEffect } from 'react';
import { ShoppingBag, ChevronRight, CakeSlice, MapPin, Phone, Mail, ArrowRight, Instagram, Facebook } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001/api/shop';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCheckout, setIsCheckout] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', note: '' });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    axios.get(`${BACKEND_URL}/products`)
      .then(res => setProducts(res.data.data))
      .catch(err => console.error(err));
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
        totalAmount
      });
      alert('Tuyệt vời! Đơn hàng của bạn đã được ghi nhận.');
      setCart([]);
      setIsCheckout(false);
    } catch (err) {
      alert('Lỗi đặt hàng, vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-stone-800 selection:bg-brand-200 selection:text-brand-900">
      
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ease-out-expo ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <div className="flex items-center gap-12">
            <a href="#" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-brand-900 rounded-full flex items-center justify-center text-[#FDFBF7] transition-transform duration-500 group-hover:rotate-12">
                <CakeSlice size={20} />
              </div>
              <span className="text-2xl font-serif font-bold text-brand-900 tracking-tight">Le Petit</span>
            </a>
            <div className="hidden lg:flex items-center gap-8 text-sm font-medium tracking-wide text-stone-600 uppercase">
              <a href="#san-pham" className="hover:text-brand-900 transition-colors">Sản phẩm</a>
              <a href="#cau-chuyen" className="hover:text-brand-900 transition-colors">Câu chuyện</a>
              <a href="#cua-hang" className="hover:text-brand-900 transition-colors">Cửa hàng</a>
            </div>
          </div>
          
          <button 
            onClick={() => setIsCheckout(true)}
            className="relative flex items-center gap-2 text-stone-800 hover:text-brand-900 transition-colors"
          >
            <span className="hidden md:block text-sm font-medium tracking-wide uppercase">Giỏ hàng</span>
            <div className="relative">
              <ShoppingBag size={24} strokeWidth={1.5} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-2 w-5 h-5 bg-brand-700 text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-[#FDFBF7]">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </div>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
        <span className="text-brand-600 font-semibold tracking-[0.2em] uppercase text-xs md:text-sm mb-6">Chuyện Lò Nướng</span>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-brand-900 tracking-tight leading-[1.1] text-balance mb-8">
          Hương Vị Đặc Sản,<br />Tinh Hoa Nguyên Bản.
        </h1>
        <p className="text-lg md:text-xl text-stone-600 max-w-2xl text-balance leading-relaxed">
          Le Petit luôn trân quý, nâng niu những giá trị mộc mạc nhất. Mỗi mẻ bánh ra lò là sự đồng điệu với thiên nhiên, với nguyên liệu chắt chiu từ những nông trại thuần khiết nhất Việt Nam.
        </p>
      </header>

      {/* Brand Story (Editorial Layout) */}
      <section id="cau-chuyen" className="py-20 md:py-32 bg-stone-100/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="aspect-[4/5] bg-stone-200 rounded-2xl overflow-hidden relative group">
            <img 
              src="https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2072&auto=format&fit=crop" 
              alt="Artisan baking" 
              className="w-full h-full object-cover transition-transform duration-1000 ease-out-expo group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-brand-900/10 group-hover:bg-transparent transition-colors duration-1000"></div>
          </div>
          <div>
            <h2 className="text-3xl md:text-5xl font-serif text-brand-900 mb-8 leading-tight">
              Sứ mệnh đánh thức<br />hương vị thủ công.
            </h2>
            <div className="space-y-6 text-stone-600 text-lg leading-relaxed">
              <p>
                Từ những hạt lúa mì trĩu bông đến những giọt bơ vàng óng, chúng tôi tìm kiếm sự hoàn hảo trong từng nguyên liệu. Không công nghiệp, không hối hả.
              </p>
              <p>
                Một chặng đường dài luôn chờ phía trước, Le Petit sẵn sàng viết tiếp câu chuyện <strong>Hương Vị Đặc Sản - Nguyên Bản - Thủ Công</strong> đầy cảm hứng, để mang tới cho bạn những trải nghiệm ẩm thực chạm đến cảm xúc.
              </p>
            </div>
            <button className="mt-10 flex items-center gap-3 text-brand-800 font-medium tracking-wide uppercase hover:gap-5 transition-all duration-300">
              Khám phá thêm <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="san-pham" className="py-24 md:py-32 max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <span className="text-brand-600 font-semibold tracking-[0.2em] uppercase text-xs mb-3 block">Thực đơn hôm nay</span>
            <h2 className="text-4xl md:text-5xl font-serif text-brand-900">Các Dòng Bánh Nổi Bật</h2>
          </div>
          <button className="text-stone-500 hover:text-brand-900 font-medium flex items-center gap-2 transition-colors">
            Xem tất cả <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {products.map((product) => (
            <div key={product._id} className="group flex flex-col items-start cursor-pointer">
              <div className="w-full aspect-[4/5] bg-stone-100 rounded-xl mb-6 overflow-hidden relative">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300">
                    <CakeSlice size={48} strokeWidth={1} />
                  </div>
                )}
                {/* Hover Add to cart button */}
                <div className="absolute inset-0 bg-stone-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                    className="w-full bg-white/95 backdrop-blur py-4 text-brand-900 font-medium tracking-wide rounded-lg flex items-center justify-center gap-2 hover:bg-brand-900 hover:text-white transition-colors translate-y-4 group-hover:translate-y-0 duration-500 ease-out-expo"
                  >
                    <ShoppingBag size={18} /> Thêm vào giỏ
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-serif font-medium text-stone-900 mb-2 group-hover:text-brand-700 transition-colors">{product.name}</h3>
              <p className="text-stone-500 line-clamp-2 leading-relaxed mb-4">{product.description}</p>
              <div className="mt-auto text-lg font-medium text-brand-800">{product.price.toLocaleString('vi-VN')} ₫</div>
            </div>
          ))}
          
          {products.length === 0 && (
            <div className="col-span-full py-20 text-center text-stone-400">
              <CakeSlice size={48} strokeWidth={1} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">Hiện chưa có mẻ bánh nào ra lò.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer / Store info */}
      <footer id="cua-hang" className="bg-brand-900 text-brand-50 pt-20 pb-10">
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
                <a href="#" className="w-10 h-10 rounded-full bg-brand-800 flex items-center justify-center hover:bg-[#FDFBF7] hover:text-brand-900 transition-colors"><Facebook size={18} /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-brand-800 flex items-center justify-center hover:bg-[#FDFBF7] hover:text-brand-900 transition-colors"><Instagram size={18} /></a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-serif font-medium mb-6">Hệ thống cửa hàng</h4>
              <ul className="space-y-4 text-brand-200/80">
                <li className="flex gap-3">
                  <MapPin size={20} className="shrink-0 text-brand-400" />
                  <span>Trụ sở chính: 289 Đinh Bộ Lĩnh, P. Bình Thạnh, TP. Hồ Chí Minh</span>
                </li>
                <li className="flex gap-3">
                  <MapPin size={20} className="shrink-0 text-brand-400" />
                  <span>Chi nhánh: Lô 04-9A KCN Vĩnh Hoàng, Hoàng Mai, Hà Nội</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-serif font-medium mb-6">Hỗ trợ khách hàng</h4>
              <ul className="space-y-4 text-brand-200/80">
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-brand-400" />
                  <span className="font-medium text-[#FDFBF7]">1900 3013</span> (8h30 - 22h)
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-brand-400" />
                  cskh@lepetit.vn
                </li>
              </ul>
              
              <div className="mt-8">
                <p className="text-sm text-brand-200/80 mb-3">Nhận thông tin mới nhất</p>
                <div className="flex">
                  <input type="email" placeholder="Email của bạn..." className="bg-brand-800 text-white px-4 py-2 w-full outline-none focus:bg-brand-700 transition-colors placeholder:text-brand-400/50" />
                  <button className="bg-[#FDFBF7] text-brand-900 px-4 py-2 font-medium hover:bg-brand-100 transition-colors">Gửi</button>
                </div>
              </div>
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
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-stone-400 gap-4">
                  <ShoppingBag size={48} strokeWidth={1} />
                  <p>Giỏ hàng chưa có sản phẩm nào.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-4">
                      <div className="w-16 h-16 bg-stone-100 rounded-md overflow-hidden shrink-0">
                        {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : null}
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
                  <div className="pt-6 border-t border-stone-200/60 flex justify-between items-center text-xl font-serif font-medium text-brand-900">
                    <span>Tổng cộng</span>
                    <span>{totalAmount.toLocaleString('vi-VN')} ₫</span>
                  </div>
                </div>
              )}

              {cart.length > 0 && (
                <form onSubmit={handleCheckout} className="space-y-4 pt-8">
                  <h3 className="font-medium text-stone-800 mb-4 tracking-wide">THÔNG TIN GIAO HÀNG</h3>
                  <input 
                    type="text" placeholder="Tên người nhận" required
                    className="w-full px-4 py-3 bg-white border border-stone-200 focus:border-brand-500 outline-none transition-colors"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                  <input 
                    type="tel" placeholder="Số điện thoại" required
                    className="w-full px-4 py-3 bg-white border border-stone-200 focus:border-brand-500 outline-none transition-colors"
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                  <input 
                    type="text" placeholder="Địa chỉ giao hàng" required
                    className="w-full px-4 py-3 bg-white border border-stone-200 focus:border-brand-500 outline-none transition-colors"
                    value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                  <textarea 
                    placeholder="Ghi chú (tùy chọn)" rows="2"
                    className="w-full px-4 py-3 bg-white border border-stone-200 focus:border-brand-500 outline-none transition-colors resize-none"
                    value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})}
                  ></textarea>
                  <button type="submit" className="w-full py-4 mt-4 bg-brand-900 text-[#FDFBF7] font-medium tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-stone-900 transition-colors">
                    Thanh toán ngay <ArrowRight size={18} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
