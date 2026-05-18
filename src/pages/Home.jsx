import { useState, useEffect } from 'react';
import { ShoppingBag, ChevronRight, CakeSlice, Coffee } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001/api/shop';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCheckout, setIsCheckout] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', note: '' });

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
      alert('Đặt hàng thành công!');
      setCart([]);
      setIsCheckout(false);
    } catch (err) {
      alert('Lỗi đặt hàng');
    }
  };

  return (
    <div className="pb-24">
      {/* Header - Glassmorphism */}
      <header className="sticky top-0 z-50 glass-panel border-b border-stone-200/50 px-6 py-4 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-900 rounded-full flex items-center justify-center text-brand-50 shadow-md">
            <CakeSlice size={20} />
          </div>
          <h1 className="text-xl font-serif font-bold tracking-tight text-brand-900">Le Petit Bakery</h1>
        </div>
        <button 
          onClick={() => setIsCheckout(true)}
          className="relative p-2 text-stone-600 hover:text-brand-900 transition-colors"
        >
          <ShoppingBag size={24} strokeWidth={1.5} />
          {cart.length > 0 && (
            <span className="absolute top-0 right-0 w-5 h-5 bg-brand-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-sm">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </button>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-12 md:py-20 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-brand-900 tracking-tight text-balance leading-tight mb-6">
          Bánh ngọt nướng trong ngày, thơm hương bơ Pháp.
        </h2>
        <p className="text-lg text-stone-500 max-w-2xl mx-auto">
          Mỗi chiếc bánh là một tác phẩm nghệ thuật nhỏ, được làm từ nguyên liệu hảo hạng nhất để mang đến trải nghiệm tinh tế cho bạn.
        </p>
      </section>

      {/* Products Grid */}
      <section className="px-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Coffee size={20} className="text-brand-500" />
          <h3 className="text-sm font-semibold tracking-widest uppercase text-brand-800">Menu Hôm Nay</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map(product => (
            <div key={product._id} className="group relative flex flex-col items-start">
              <div className="w-full aspect-[4/3] bg-stone-100 rounded-2xl mb-4 overflow-hidden relative">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300">
                    <CakeSlice size={48} strokeWidth={1} />
                  </div>
                )}
                <button 
                  onClick={() => addToCart(product)}
                  className="absolute bottom-4 right-4 bg-white/90 backdrop-blur text-brand-900 w-10 h-10 rounded-full flex items-center justify-center shadow-soft opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-brand-900 hover:text-white"
                >
                  <ShoppingBag size={18} />
                </button>
              </div>
              <h4 className="text-lg font-medium text-stone-800">{product.name}</h4>
              <p className="text-sm text-stone-500 line-clamp-2 mt-1 mb-2 leading-relaxed">{product.description}</p>
              <div className="mt-auto font-medium text-brand-700">{product.price.toLocaleString('vi-VN')} ₫</div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="col-span-full py-20 text-center text-stone-400">
              <p>Hiện chưa có bánh nào trên kệ.</p>
            </div>
          )}
        </div>
      </section>

      {/* Checkout Overlay Modal (Full screen for mobile, side drawer for desktop in a real app, but keep simple here) */}
      {isCheckout && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm transition-opacity" onClick={() => setIsCheckout(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-deep flex flex-col animate-in slide-in-from-right duration-300 ease-out-expo">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center">
              <h2 className="text-2xl font-serif font-medium text-stone-800">Giỏ hàng</h2>
              <button onClick={() => setIsCheckout(false)} className="text-stone-400 hover:text-stone-800 text-sm font-medium tracking-wide">ĐÓNG</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <p className="text-stone-500 text-center py-10">Giỏ hàng của bạn đang trống.</p>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-stone-800">{item.name}</div>
                        <div className="text-sm text-stone-500">{item.price.toLocaleString('vi-VN')} ₫ x {item.quantity}</div>
                      </div>
                      <div className="font-medium text-stone-800">
                        {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-stone-100 flex justify-between items-center text-lg font-medium text-brand-900">
                    <span>Tổng cộng</span>
                    <span>{totalAmount.toLocaleString('vi-VN')} ₫</span>
                  </div>
                </div>
              )}

              {cart.length > 0 && (
                <form onSubmit={handleCheckout} className="space-y-4 pt-6 mt-6 border-t border-stone-100">
                  <h3 className="font-medium text-stone-800 mb-4">Thông tin giao hàng</h3>
                  <input 
                    type="text" placeholder="Tên người nhận" required
                    className="w-full px-4 py-3 bg-stone-50 border-none rounded-xl focus:ring-2 focus:ring-brand-200 outline-none transition-shadow"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                  <input 
                    type="tel" placeholder="Số điện thoại" required
                    className="w-full px-4 py-3 bg-stone-50 border-none rounded-xl focus:ring-2 focus:ring-brand-200 outline-none transition-shadow"
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                  <input 
                    type="text" placeholder="Địa chỉ giao hàng" required
                    className="w-full px-4 py-3 bg-stone-50 border-none rounded-xl focus:ring-2 focus:ring-brand-200 outline-none transition-shadow"
                    value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                  <textarea 
                    placeholder="Ghi chú (tùy chọn)" rows="2"
                    className="w-full px-4 py-3 bg-stone-50 border-none rounded-xl focus:ring-2 focus:ring-brand-200 outline-none transition-shadow resize-none"
                    value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})}
                  ></textarea>
                  <button type="submit" className="w-full py-4 bg-brand-900 text-white rounded-xl font-medium tracking-wide flex items-center justify-center gap-2 hover:bg-stone-900 transition-colors">
                    Xác nhận Đặt hàng <ChevronRight size={18} />
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
