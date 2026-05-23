import { useState, useEffect } from 'react';
import { ShoppingBag, CakeSlice, MapPin, Phone, ArrowRight, Home as HomeIcon, Coffee, Percent, LayoutGrid, QrCode, X, ChevronRight, Ticket, Navigation } from 'lucide-react';
import axios from 'axios';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
    locationfound(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  // Request GPS automatically on load if position is not set
  useEffect(() => {
    if (!position) map.locate();
  }, [map, position]);

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

const BACKEND_URL = import.meta.env.DEV ? 'http://localhost:5001/api/shop' : 'https://bakery-backend-six.vercel.app/api/shop';

export default function CustomerLayout() {
  const [products, setProducts] = useState([]);
  const [promos, setPromos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCheckout, setIsCheckout] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', note: '' });
  const [scrolled, setScrolled] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  
  const [settings, setSettings] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const [customer, setCustomer] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

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

    axios.get(`${BACKEND_URL}/categories`)
      .then(res => setCategories(res.data.data))
      .catch(err => console.error(err));
      
    axios.get(`${BACKEND_URL}/settings`)
      .then(res => setSettings(res.data.data))
      .catch(err => console.error(err));
      
    const token = localStorage.getItem('bakery_token');
    const savedCustomer = localStorage.getItem('bakery_customer');
    if (token && savedCustomer) {
      const cust = JSON.parse(savedCustomer);
      setCustomer(cust);
      setFormData(prev => ({ ...prev, name: cust.name, phone: cust.phone, address: cust.address || '' }));
    }
  }, []);

  // Update customer function passed to Outlet
  const updateCustomer = (newCustomer) => {
    setCustomer(newCustomer);
    if (newCustomer) {
      setFormData(prev => ({ ...prev, name: newCustomer.name, phone: newCustomer.phone, address: newCustomer.address || '' }));
    } else {
      setFormData({ name: '', phone: '', address: '', note: '' });
    }
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        return prev.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item._id !== productId));
  };

  const increaseQuantity = (productId) => {
    setCart(prev => prev.map(item => item._id === productId ? { ...item, quantity: item.quantity + 1 } : item));
  };

  const decreaseQuantity = (productId) => {
    setCart(prev => prev.map(item => item._id === productId ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  let previewShippingFee = 0;
  if (settings && customerLocation && settings.storeLocation) {
    const lat1 = settings.storeLocation.lat;
    const lon1 = settings.storeLocation.lng;
    const lat2 = customerLocation.lat;
    const lon2 = customerLocation.lng;
    
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);  
    const dLon = (lon2 - lon1) * (Math.PI / 180); 
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    const distanceKm = R * c; 

    if (distanceKm <= settings.maxDeliveryKm) {
      if (distanceKm <= settings.shippingBaseKm) {
        previewShippingFee = settings.shippingBaseFee;
      } else {
        const extraKm = distanceKm - settings.shippingBaseKm;
        previewShippingFee = settings.shippingBaseFee + (extraKm * settings.shippingExtraFeePerKm);
      }
    }
  }

  const finalAmount = totalAmount - (appliedPromo ? appliedPromo.discountAmount : 0) + previewShippingFee;

  useEffect(() => {
    if (cart.length === 0) setAppliedPromo(null);
  }, [cart]);

  const applyDiscount = async () => {
    if (!discountCode) return alert('Vui lòng nhập mã ưu đãi');
    try {
      const res = await axios.post(`${BACKEND_URL}/promos/validate`, { code: discountCode.toUpperCase(), totalAmount });
      setAppliedPromo(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Mã ưu đãi không hợp lệ');
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
        customerLocation: customerLocation,
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
      navigate('/orders'); // Navigate to tracking page after successful order
    } catch (err) {
      alert('Lỗi đặt hàng, vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-50 font-sans text-brand-900 selection:bg-brand-200 selection:text-brand-900 pb-24 md:pb-0 relative">
      
      {/* Desktop Navigation (Kept simple, mobile will rely on bottom nav) */}
      <nav className={`hidden md:flex fixed top-0 w-full z-50 transition-all duration-500 ease-out-expo ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-12 flex justify-between items-center w-full">
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-brand-900 rounded-full flex items-center justify-center text-brand-50 transition-transform duration-500 group-hover:rotate-12 shadow-sm">
                <CakeSlice size={20} />
              </div>
              <span className="text-2xl font-serif font-bold tracking-tight">Le Petit</span>
            </Link>
            <div className="flex items-center gap-8 text-sm font-bold tracking-wide uppercase">
              <Link to="/" className={`transition-colors ${location.pathname === '/' ? 'text-brand-600' : 'text-brand-800 hover:text-brand-600'}`}>Trang chủ</Link>
              <Link to="/menu" className={`transition-colors ${location.pathname === '/menu' ? 'text-brand-600' : 'text-brand-800 hover:text-brand-600'}`}>Đặt hàng</Link>
              <Link to="/promos" className={`transition-colors ${location.pathname === '/promos' ? 'text-brand-600' : 'text-brand-800 hover:text-brand-600'}`}>Ưu đãi</Link>
              <Link to="/profile" className={`transition-colors ${location.pathname === '/profile' ? 'text-brand-600' : 'text-brand-800 hover:text-brand-600'}`}>Tài khoản</Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsCheckout(true)}
              className="flex items-center gap-2 text-brand-800 hover:text-brand-600 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-brand-100"
            >
              <span className="text-sm font-bold tracking-wide uppercase">Giỏ hàng</span>
              <div className="relative">
                <ShoppingBag size={20} strokeWidth={2} />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-2 w-5 h-5 bg-brand-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Floating Cart Button for Mobile (when not in checkout) */}
      {!isCheckout && cart.length > 0 && (
        <button 
          onClick={() => setIsCheckout(true)}
          className="md:hidden fixed bottom-28 right-4 w-14 h-14 bg-brand-600 text-white rounded-full shadow-lg flex items-center justify-center z-40 hover:bg-brand-700 transition-colors"
        >
          <div className="relative">
            <ShoppingBag size={24} />
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-brand-600 text-[11px] font-bold rounded-full flex items-center justify-center shadow-sm">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>
        </button>
      )}

      {/* Main Content Area */}
      <div className="min-h-[70vh]">
        <Outlet context={{ products, promos, categories, addToCart, customer, updateCustomer, isCheckout, setIsCheckout }} />
      </div>

      {/* Footer / Store info (Hidden on mobile to match App feel) */}
      <footer id="cua-hang" className="hidden md:block bg-white text-brand-900 pt-16 pb-10 border-t border-brand-100 mt-20">
        <div className="max-w-7xl mx-auto px-12">
          <div className="grid grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-brand-500 rounded-full flex items-center justify-center text-white shadow-md">
                  <CakeSlice size={24} />
                </div>
                <span className="text-3xl font-serif font-bold tracking-tight text-stone-900">Le Petit Bakery</span>
              </div>
              <p className="text-stone-600 leading-relaxed max-w-sm mb-8 mt-6">
                Mang đến hương vị ngọt ngào và lãng mạn từ những mẻ bánh Pháp thủ công, được nướng bằng cả trái tim.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 text-stone-900">Hệ thống cửa hàng</h4>
              <ul className="space-y-4 text-stone-600">
                <li className="flex gap-3">
                  <MapPin size={20} className="shrink-0 text-brand-600" />
                  <span>289 Đinh Bộ Lĩnh, Bình Thạnh, TP. HCM</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 text-stone-900">Hỗ trợ khách hàng</h4>
              <ul className="space-y-4 text-stone-600">
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-brand-500" />
                  <span className="font-bold">1900 3013</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-brand-200 text-center text-sm text-stone-500 font-medium">
            © 2026 Le Petit Bakery. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Cart Drawer Overlay */}
      {isCheckout && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsCheckout(false)}></div>
          <div className="relative w-full max-w-md bg-brand-50 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 md:p-6 border-b border-stone-200 flex justify-between items-center bg-white">
              <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-900">Giỏ Hàng</h2>
              <button onClick={() => setIsCheckout(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-50 text-brand-800 hover:bg-brand-100"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 pb-32">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-brand-800/50 gap-4">
                  <ShoppingBag size={48} strokeWidth={1} />
                  <p className="font-medium">Giỏ hàng trống.</p>
                  <button onClick={() => {setIsCheckout(false); navigate('/menu');}} className="px-6 py-2 bg-brand-100 text-brand-900 font-bold rounded-full mt-4">Đi đặt hàng</button>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-4 bg-white p-3 rounded-2xl shadow-sm border border-brand-100/50 relative">
                      <div className="w-20 h-20 bg-brand-50 rounded-xl overflow-hidden shrink-0">
                        {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-brand-300"><CakeSlice size={24}/></div>}
                      </div>
                      <div className="flex-1 py-1 pr-6">
                        <div className="font-bold text-stone-900 leading-tight mb-2">{item.name}</div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-brand-600 font-bold">{item.price.toLocaleString('vi-VN')} ₫</div>
                          <div className="flex items-center gap-2 bg-stone-100 rounded-lg px-2 py-1">
                            <button onClick={() => decreaseQuantity(item._id)} className="w-6 h-6 flex items-center justify-center font-bold text-stone-600 hover:bg-stone-200 rounded-md">-</button>
                            <span className="w-4 text-center font-bold text-sm text-stone-800">{item.quantity}</span>
                            <button onClick={() => increaseQuantity(item._id)} className="w-6 h-6 flex items-center justify-center font-bold text-stone-600 hover:bg-stone-200 rounded-md">+</button>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item._id)} className="absolute top-2 right-2 p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-brand-100/50 space-y-3">
                    <div className="flex justify-between items-center text-stone-600 text-sm font-medium">
                      <span>Tạm tính</span>
                      <span>{totalAmount.toLocaleString('vi-VN')} ₫</span>
                    </div>
                    {appliedPromo && (
                      <div className="flex justify-between items-center text-brand-600 text-sm font-bold bg-brand-50 px-3 py-2 rounded-xl">
                        <span>Khuyến mãi ({appliedPromo.code})</span>
                        <span>-{appliedPromo.discountAmount.toLocaleString('vi-VN')} ₫</span>
                      </div>
                    )}
                    {previewShippingFee > 0 && (
                      <div className="flex justify-between items-center text-stone-600 text-sm font-medium">
                        <span>Phí giao hàng</span>
                        <span>+{previewShippingFee.toLocaleString('vi-VN')} ₫</span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-brand-100/50 flex justify-between items-center text-lg font-bold text-stone-900">
                      <span>Tổng cộng</span>
                      <span className="text-brand-600 text-xl">{finalAmount.toLocaleString('vi-VN')} ₫</span>
                    </div>
                  </div>
                </div>
              )}

              {cart.length > 0 && (
                <form onSubmit={handleCheckout} className="space-y-4 pt-4">
                  <h3 className="font-bold text-brand-900 mb-2">Ưu đãi</h3>
                  <div className="flex gap-2">
                    <input 
                      type="text" placeholder="Nhập mã..."
                      className="flex-1 px-4 py-3 bg-white border border-brand-200 focus:border-brand-500 rounded-xl outline-none font-medium uppercase placeholder-brand-300"
                      value={discountCode} onChange={e => setDiscountCode(e.target.value)}
                    />
                    <button type="button" onClick={applyDiscount} className="px-6 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-colors">
                      ÁP DỤNG
                    </button>
                  </div>
                  
                  <h3 className="font-bold text-brand-900 mt-6 mb-4">Giao hàng tới</h3>
                  <div className="space-y-3">
                    <input 
                      type="text" placeholder="Tên người nhận" required
                      className="w-full px-4 py-3 bg-white border border-brand-200 focus:border-brand-500 rounded-xl outline-none font-medium"
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                    <input 
                      type="tel" placeholder="Số điện thoại" required
                      className="w-full px-4 py-3 bg-white border border-brand-200 focus:border-brand-500 rounded-xl outline-none font-medium"
                      value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                    <input 
                      type="text" placeholder="Địa chỉ giao hàng" required
                      className="w-full px-4 py-3 bg-white border border-brand-200 focus:border-brand-500 rounded-xl outline-none font-medium"
                      value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                    />
                    
                    <button type="button" onClick={() => {
                      setIsMapOpen(true);
                      if (navigator.geolocation && !customerLocation) {
                        navigator.geolocation.getCurrentPosition((pos) => {
                          setCustomerLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                        });
                      }
                    }} className="w-full flex items-center gap-2 justify-center py-3 bg-stone-100 text-stone-700 font-bold rounded-xl border border-stone-200 hover:bg-stone-200 transition-colors">
                      <Navigation size={18} className="text-brand-600"/> 
                      {customerLocation ? 'Đã ghim vị trí (Sửa)' : 'Ghim vị trí nhận hàng (Tính ship)'}
                    </button>

                    <textarea 
                      placeholder="Ghi chú (tùy chọn)" rows="2"
                      className="w-full px-4 py-3 bg-white border border-brand-200 focus:border-brand-500 rounded-xl outline-none font-medium resize-none"
                      value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})}
                    ></textarea>
                  </div>
                </form>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="absolute bottom-0 left-0 w-full p-4 bg-white border-t border-brand-100 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-10">
                <button onClick={handleCheckout} className="w-full py-4 bg-brand-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-brand-600 shadow-md">
                  Thanh toán - {finalAmount.toLocaleString('vi-VN')} ₫
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map Picker Modal */}
      {isMapOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setIsMapOpen(false)}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
             <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-white">
               <h2 className="text-lg font-bold text-stone-900">Ghim Vị Trí Nhận Hàng</h2>
               <button onClick={() => setIsMapOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-800"><X size={18}/></button>
             </div>
             <div className="p-4 bg-stone-50 text-sm text-stone-600 font-medium">
               Bản đồ sẽ tự định vị bạn (GPS). Bạn có thể chạm để chọn chính xác điểm giao.
             </div>
             <div className="h-[60vh] w-full relative z-0">
                <MapContainer center={customerLocation || (settings?.storeLocation ? [settings.storeLocation.lat, settings.storeLocation.lng] : [21.0285, 105.8542])} zoom={15} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationMarker 
                    position={customerLocation} 
                    setPosition={setCustomerLocation} 
                  />
                </MapContainer>
             </div>
             <div className="p-4 bg-white border-t border-stone-100">
               <button onClick={() => setIsMapOpen(false)} className="w-full py-3.5 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700">Xác nhận vị trí</button>
             </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation - Phê La Style */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-brand-100 flex justify-between items-end pb-5 pt-2 px-2 z-40 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.06)]">
        <Link to="/" className={`flex flex-col items-center gap-1 w-[20%] transition-colors ${location.pathname === '/' ? 'text-brand-900' : 'text-brand-800'}`}>
          <HomeIcon size={24} strokeWidth={location.pathname === '/' ? 2.5 : 2} fill={location.pathname === '/' ? 'currentColor' : 'none'} className={location.pathname === '/' ? 'text-brand-900' : ''}/>
          <span className="text-[10px] font-bold">Trang chủ</span>
        </Link>
        <Link to="/menu" className={`flex flex-col items-center gap-1 w-[20%] transition-colors ${location.pathname === '/menu' ? 'text-brand-900' : 'text-brand-800'}`}>
          <Coffee size={24} strokeWidth={location.pathname === '/menu' ? 2.5 : 2} fill={location.pathname === '/menu' ? 'currentColor' : 'none'} />
          <span className="text-[10px] font-bold">Đặt hàng</span>
        </Link>
        
        {/* Floating Middle Button (QR Code mock) */}
        <div className="relative w-[20%] flex justify-center">
          <button className="absolute bottom-1 w-14 h-14 bg-brand-900 text-brand-100 rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(83,58,41,0.4)] border-4 border-white transform hover:scale-105 transition-transform">
            <QrCode size={26} strokeWidth={2} />
          </button>
        </div>

        <Link to="/promos" className={`flex flex-col items-center gap-1 w-[20%] transition-colors ${location.pathname === '/promos' ? 'text-brand-900' : 'text-brand-800'}`}>
          <Ticket size={24} strokeWidth={location.pathname === '/promos' ? 2.5 : 2} fill={location.pathname === '/promos' ? 'currentColor' : 'none'} />
          <span className="text-[10px] font-bold">Ưu đãi</span>
        </Link>
        <Link to="/orders" className={`flex flex-col items-center gap-1 w-[20%] transition-colors ${location.pathname === '/orders' ? 'text-brand-900' : 'text-brand-800'}`}>
          <LayoutGrid size={24} strokeWidth={location.pathname === '/orders' ? 2.5 : 2} fill={location.pathname === '/orders' ? 'currentColor' : 'none'} />
          <span className="text-[10px] font-bold">Đơn hàng</span>
        </Link>
      </div>
    </div>
  );
}
