import { useState, useEffect } from 'react';
import { Search, Info, Plus, Home as HomeIcon, Coffee, QrCode, Ticket, Menu, ShoppingBag, X } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.DEV ? 'http://localhost:5001/api/shop' : 'https://api.aloshipp.com/api/shop';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [promos, setPromos] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', note: '' });

  useEffect(() => {
    axios.get(`${BACKEND_URL}/products`)
      .then(res => setProducts(res.data.data))
      .catch(err => console.error(err));
      
    axios.get(`${BACKEND_URL}/promos`)
      .then(res => setPromos(res.data.data))
      .catch(err => console.error(err));
  }, []);

  const categories = ['Tất cả', ...new Set(products.map(p => p.category || 'Khác'))];

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
      setIsCartOpen(false);
    } catch (err) {
      alert('Lỗi đặt hàng, vui lòng thử lại.');
    }
  };

  // Group products for the UI
  const combos = products.filter(p => (p.category || '').toLowerCase().includes('combo')).slice(0, 5);
  const regularProducts = products.filter(p => activeCategory === 'Tất cả' || p.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#fdf9ef] flex justify-center font-sans">
      {/* Mobile App Container */}
      <div className="w-full max-w-[480px] bg-[#fdf9ef] relative shadow-2xl overflow-hidden flex flex-col">
        
        {/* Background Decorative Pattern */}
        <div className="absolute top-40 -right-20 w-64 h-64 bg-yellow-200/40 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-96 -left-20 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Header */}
        <div className="sticky top-0 z-40 bg-[#fdf9ef]/95 backdrop-blur-md pt-6 pb-2 px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#3d2b1f]">Đặt hàng</h1>
          <button className="w-10 h-10 rounded-full bg-stone-200/50 flex items-center justify-center text-[#3d2b1f]">
            <Search size={20} />
          </button>
        </div>

        {/* Categories Tabs */}
        <div className="sticky top-[68px] z-40 bg-[#fdf9ef]/95 backdrop-blur-md py-3 px-4 overflow-x-auto hide-scrollbar flex gap-3 shadow-sm">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                activeCategory === cat 
                ? 'bg-[#c28b5e] text-white shadow-md' 
                : 'bg-white text-[#3d2b1f] border border-stone-200/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-32">
          
          {/* Notification Banner */}
          <div className="mx-4 my-4 bg-[#f4a236] text-white p-3 rounded-xl flex items-start gap-2 shadow-sm">
            <Info size={18} className="shrink-0 mt-0.5" />
            <p className="text-sm font-medium leading-tight">
              Đã hết giờ nhận đơn, tiệm hẹn bạn 07:30 mỗi ngày để chill tiếp!
            </p>
          </div>

          {/* Combos Section (Horizontal Scroll) */}
          {combos.length > 0 && activeCategory === 'Tất cả' && (
            <div className="mb-8">
              <h2 className="px-4 text-xl font-bold text-[#3d2b1f] mb-4">Combo</h2>
              <div className="flex overflow-x-auto hide-scrollbar gap-4 px-4 pb-4">
                {combos.map(combo => (
                  <div key={combo._id} className="min-w-[160px] w-[160px] bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden flex flex-col">
                    <div className="h-40 bg-stone-100 relative">
                      {combo.image ? (
                        <img src={combo.image} className="w-full h-full object-cover" alt={combo.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300 bg-[#fdf9ef]"><Coffee size={32} /></div>
                      )}
                    </div>
                    <div className="p-3 flex-1 flex flex-col">
                      <h3 className="font-bold text-[#3d2b1f] text-sm mb-1 line-clamp-2 leading-tight">{combo.name}</h3>
                      <div className="mt-auto flex justify-between items-center pt-2">
                        <span className="font-bold text-[#c28b5e] text-sm">{combo.price.toLocaleString('vi-VN')}</span>
                        <button 
                          onClick={() => addToCart(combo)}
                          className="w-7 h-7 rounded-full bg-[#fdf9ef] text-[#c28b5e] border border-[#c28b5e]/30 flex items-center justify-center hover:bg-[#c28b5e] hover:text-white transition-colors"
                        >
                          <Plus size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regular Products List (Vertical) */}
          <div className="px-4 space-y-6">
            <h2 className="text-xl font-bold text-[#3d2b1f]">{activeCategory === 'Tất cả' ? 'Thực đơn' : activeCategory}</h2>
            <div className="space-y-4">
              {regularProducts.map(product => (
                <div key={product._id} className="bg-white rounded-2xl p-3 shadow-sm border border-stone-100 flex gap-4 items-center">
                  <div className="w-24 h-24 rounded-xl bg-stone-100 overflow-hidden shrink-0 relative">
                    <div className="absolute top-0 left-0 bg-[#8b6042] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-lg z-10">MỚI</div>
                    {product.image ? (
                      <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300 bg-[#fdf9ef]"><Coffee size={24} /></div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col h-full py-1">
                    <h3 className="font-bold text-[#3d2b1f] text-base leading-tight mb-1">{product.name}</h3>
                    <p className="text-stone-500 text-xs line-clamp-1 mb-2">{product.description}</p>
                    <div className="mt-auto flex justify-between items-center">
                      <span className="font-bold text-[#c28b5e]">{product.price.toLocaleString('vi-VN')}</span>
                      <button 
                        onClick={() => addToCart(product)}
                        className="w-8 h-8 rounded-full bg-[#fdf9ef] text-[#c28b5e] border border-[#c28b5e]/30 flex items-center justify-center hover:bg-[#c28b5e] hover:text-white transition-colors"
                      >
                        <Plus size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {regularProducts.length === 0 && (
                <div className="text-center py-10 text-stone-400">
                  <Coffee size={40} className="mx-auto mb-3 opacity-30" />
                  Không có sản phẩm nào.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Custom Bottom Navigation Bar */}
        <div className="absolute bottom-0 w-full bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] px-6 py-2 pb-6 flex justify-between items-end z-50">
          <button className="flex flex-col items-center gap-1 text-stone-400 hover:text-[#c28b5e]">
            <HomeIcon size={24} />
            <span className="text-[10px] font-semibold">Trang chủ</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-[#c28b5e]">
            <Coffee size={24} />
            <span className="text-[10px] font-semibold">Đặt hàng</span>
          </button>
          
          {/* Floating Action Button (QR Code) */}
          <div className="relative -top-6 flex flex-col items-center">
            <button className="w-16 h-16 bg-[#3d2b1f] rounded-full flex items-center justify-center text-[#c28b5e] shadow-xl border-4 border-[#fdf9ef]">
              <QrCode size={28} />
            </button>
          </div>

          <button className="flex flex-col items-center gap-1 text-stone-400 hover:text-[#c28b5e]">
            <Ticket size={24} />
            <span className="text-[10px] font-semibold">Ưu đãi</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-stone-400 hover:text-[#c28b5e]">
            <Menu size={24} />
            <span className="text-[10px] font-semibold">Khác</span>
          </button>
        </div>

        {/* Floating Cart Button (if items in cart) */}
        {cart.length > 0 && !isCartOpen && (
          <button 
            onClick={() => setIsCartOpen(true)}
            className="absolute bottom-28 right-4 bg-[#c28b5e] text-white p-4 rounded-full shadow-xl flex items-center gap-2 animate-bounce"
          >
            <div className="relative">
              <ShoppingBag size={24} />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold border-2 border-[#c28b5e]">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
          </button>
        )}

        {/* Cart Modal */}
        {isCartOpen && (
          <div className="absolute inset-0 z-[100] flex flex-col justify-end">
            <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
            <div className="relative bg-white rounded-t-3xl w-full h-[85vh] shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300">
              <div className="p-5 border-b border-stone-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-[#3d2b1f] flex items-center gap-2">
                  <ShoppingBag size={24} className="text-[#c28b5e]" /> Giỏ Hàng
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 bg-stone-100 text-stone-500 rounded-full hover:bg-stone-200">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-stone-400 gap-3">
                    <ShoppingBag size={48} className="opacity-30" />
                    <p>Chưa có món nào.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-center bg-stone-50 p-3 rounded-2xl">
                        <div className="w-16 h-16 bg-white rounded-xl overflow-hidden shrink-0">
                          {item.image && <img src={item.image} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-[#3d2b1f] leading-tight mb-1">{item.name}</div>
                          <div className="text-sm text-[#c28b5e] font-medium">{item.price.toLocaleString('vi-VN')} ₫</div>
                        </div>
                        <div className="font-bold text-[#3d2b1f] bg-white px-3 py-1 rounded-lg shadow-sm">
                          x{item.quantity}
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-4 border-t border-stone-200">
                      <div className="flex justify-between items-center text-lg font-bold text-[#3d2b1f]">
                        <span>Tổng cộng:</span>
                        <span className="text-[#c28b5e] text-2xl">{totalAmount.toLocaleString('vi-VN')} ₫</span>
                      </div>
                    </div>

                    <form onSubmit={handleCheckout} className="space-y-4 pt-6">
                      <h3 className="font-bold text-[#3d2b1f] mb-2 uppercase text-sm tracking-wider">Thông tin giao hàng</h3>
                      <input 
                        type="text" placeholder="Tên người nhận" required
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-[#c28b5e] focus:bg-white transition-all font-medium"
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                      <input 
                        type="tel" placeholder="Số điện thoại" required
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-[#c28b5e] focus:bg-white transition-all font-medium"
                        value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                      <input 
                        type="text" placeholder="Địa chỉ giao hàng" required
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-[#c28b5e] focus:bg-white transition-all font-medium"
                        value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                      />
                      <textarea 
                        placeholder="Ghi chú cho tiệm..." rows="2"
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-[#c28b5e] focus:bg-white transition-all font-medium resize-none"
                        value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})}
                      ></textarea>
                      <button type="submit" className="w-full py-4 mt-2 bg-[#c28b5e] text-white font-bold rounded-xl hover:bg-[#a6744a] shadow-lg shadow-[#c28b5e]/30 transition-all flex justify-center items-center gap-2">
                        <ShoppingBag size={20} />
                        ĐẶT HÀNG NGAY
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
