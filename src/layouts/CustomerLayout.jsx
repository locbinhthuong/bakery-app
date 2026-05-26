import { useState, useEffect, useRef, useMemo } from 'react';
import { ShoppingBag, CakeSlice, MapPin, Phone, ArrowRight, Home as HomeIcon, Coffee, Percent, LayoutGrid, QrCode, X, ChevronRight, Ticket, Navigation, Search } from 'lucide-react';
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

function LocationMarker({ position, setPosition, setFormData }) {
  const markerRef = useRef(null);

  const updatePosition = async (latlng) => {
    setPosition(latlng);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latlng.lat}&lon=${latlng.lng}`);
      if (res.data && res.data.display_name && setFormData) {
        setFormData(prev => ({...prev, address: res.data.display_name}));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const map = useMapEvents({
    click(e) {
      updatePosition(e.latlng);
    },
    locationfound(e) {
      updatePosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          updatePosition(marker.getLatLng());
        }
      },
    }),
    [setPosition, setFormData],
  );

  useEffect(() => {
    if (!position) map.locate();
  }, [map, position]);

  return position === null ? null : (
    <Marker 
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    ></Marker>
  );
}

function MapUpdater({ center }) {
  const map = useMapEvents({});
  useEffect(() => {
    if (center) map.flyTo(center, 15);
  }, [center, map]);
  return null;
}

const BACKEND_URL = import.meta.env.DEV ? 'http://localhost:5001/api/shop' : 'https://bakery-backend-six.vercel.app/api/shop';

export default function CustomerLayout() {
  const [products, setProducts] = useState([]);
  const [promos, setPromos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCheckout, setIsCheckout] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', note: '' });
  const [deliveryMethod, setDeliveryMethod] = useState('DELIVERY');
  const [pickupTime, setPickupTime] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  
  const [settings, setSettings] = useState(null);
  const [shippingConfig, setShippingConfig] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleMapSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=vn`);
      setSearchResults(res.data);
    } catch(err) {}
  };

  const [customer, setCustomer] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const t = Date.now();
    axios.get(`${BACKEND_URL}/products?t=${t}`)
      .then(res => setProducts(res.data.data))
      .catch(err => console.error(err));
      
    axios.get(`${BACKEND_URL}/promos?t=${t}`)
      .then(res => setPromos(res.data.data))
      .catch(err => console.error(err));

    axios.get(`${BACKEND_URL}/categories?t=${t}`)
      .then(res => setCategories(res.data.data))
      .catch(err => console.error(err));
      
    axios.get(`${BACKEND_URL}/settings?t=${t}`)
      .then(res => setSettings(res.data.data))
      .catch(err => console.error(err));
      
    axios.get(`https://api.aloshipp.com/api/config/PRICING_CONFIG?t=${t}`)
      .then(res => {
        if (res.data && res.data.data && res.data.data.value) {
          setShippingConfig(res.data.data.value);
        }
      })
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
  let distanceKm = 0;
  if (deliveryMethod === 'DELIVERY' && settings && customerLocation && settings.storeLocation && shippingConfig) {
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
    distanceKm = R * c; 

    if (shippingConfig.tiers && Array.isArray(shippingConfig.tiers)) {
      const sortedTiers = [...shippingConfig.tiers].sort((a, b) => a.maxKm - b.maxKm);
      for (const tier of sortedTiers) {
        if (distanceKm <= tier.maxKm) {
          if (tier.type === 'fixed') {
            previewShippingFee = tier.price;
          } else if (tier.type === 'per_km') {
            previewShippingFee = Math.ceil(distanceKm) * tier.price;
          }
          break;
        }
      }
      if (previewShippingFee === 0 && sortedTiers.length > 0) {
        const lastTier = sortedTiers[sortedTiers.length - 1];
        if (lastTier.type === 'fixed') previewShippingFee = lastTier.price;
        else previewShippingFee = Math.ceil(distanceKm) * lastTier.price;
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
      let customerPhone = null;
      const savedCustomer = localStorage.getItem('bakery_customer');
      if (savedCustomer) {
        const cust = JSON.parse(savedCustomer);
        customerPhone = cust.phone;
      }
      
      const res = await axios.post(`${BACKEND_URL}/promos/validate`, { 
        code: discountCode.toUpperCase(), 
        totalAmount,
        customerPhone 
      });
      setAppliedPromo(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Mã ưu đãi không hợp lệ');
      setAppliedPromo(null);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return alert('Vui lòng điền tên và SĐT');
    if (deliveryMethod === 'DELIVERY' && !formData.address) return alert('Vui lòng nhập địa chỉ giao hàng');
    if (deliveryMethod === 'PICKUP' && !pickupTime) return alert('Vui lòng chọn thời gian đến lấy bánh');
    
    try {
      await axios.post(`${BACKEND_URL}/orders`, {
        customerName: formData.name,
        customerPhone: formData.phone,
        deliveryMethod,
        pickupTime: deliveryMethod === 'PICKUP' ? pickupTime : null,
        deliveryAddress: deliveryMethod === 'DELIVERY' ? formData.address : '',
        customerLocation: deliveryMethod === 'DELIVERY' ? customerLocation : null,
        note: formData.note,
        items: cart.map(i => ({ productId: i._id, name: i.name, price: i.price, quantity: i.quantity })),
        subTotal: totalAmount,
        discountCode: appliedPromo ? appliedPromo.code : null,
        discountAmount: appliedPromo ? appliedPromo.discountAmount : 0,
        shippingFee: previewShippingFee,
        distanceKm: distanceKm
      });
      alert('Tuyệt vời! Đơn hàng của bạn đã được ghi nhận.');
      setCart([]);
      setAppliedPromo(null);
      setDiscountCode('');
      setIsCheckout(false);
      navigate('/menu'); 
    } catch (err) {
      alert('Lỗi đặt hàng, vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-[100dvh] bg-brand-50 font-sans text-brand-900 selection:bg-brand-200 selection:text-brand-900 pb-24 md:pb-0 relative">
      
      {/* Desktop Navigation (Kept simple, mobile will rely on bottom nav) */}
      <nav className={`hidden md:flex fixed top-0 w-full z-50 transition-all duration-500 ease-out-expo ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-12 flex justify-between items-center w-full">
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-200 rounded-full blur-sm opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <img src="/logo_donut.jpg" alt="MABAE - Tiệm Bánh Donut" className="relative w-12 h-12 md:w-14 md:h-14 object-contain p-0.5 rounded-full shadow-md transition-transform duration-500 group-hover:rotate-[360deg] bg-white border-2 border-brand-100" />
              </div>
              <span className="text-2xl font-serif font-bold tracking-tight text-brand-800 drop-shadow-sm">MABAE <span className="text-brand-500 text-xl">- Tiệm Bánh Donut</span></span>
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
              onClick={() => {
                if (!customer) {
                  alert('Vui lòng đăng nhập để đặt hàng');
                  navigate('/profile');
                  return;
                }
                setIsCheckout(true);
              }}
              className="flex items-center gap-2 text-brand-800 hover:text-brand-600 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-brand-100"
            >
              <span className="text-sm font-bold tracking-wide uppercase">Giỏ hàng</span>
              <div className="relative transition-transform duration-200" id="desktop-cart-icon">
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
          onClick={() => {
            if (!customer) {
              alert('Vui lòng đăng nhập để đặt hàng');
              navigate('/profile');
              return;
            }
            setIsCheckout(true);
          }}
          className="md:hidden fixed bottom-28 right-4 w-14 h-14 bg-brand-600 text-white rounded-full shadow-lg flex items-center justify-center z-40 hover:bg-brand-700 transition-colors"
        >
          <div className="relative transition-transform duration-200" id="mobile-cart-icon">
            <ShoppingBag size={24} />
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-brand-600 text-[11px] font-bold rounded-full flex items-center justify-center shadow-sm">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>
        </button>
      )}

      {/* Main Content Area */}
      <div className="min-h-[70vh]">
        <Outlet context={{ products, promos, categories, addToCart, customer, updateCustomer, isCheckout, setIsCheckout, cart }} />
      </div>

      {/* Footer / Store info (Hidden on mobile to match App feel) */}
      <footer id="cua-hang" className="hidden md:block bg-white text-brand-900 pt-16 pb-10 border-t border-brand-100 mt-20">
        <div className="max-w-7xl mx-auto px-12">
          <div className="grid grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <img src="/logo_donut.jpg" alt="Logo" className="w-16 h-16 object-contain p-1 rounded-full shadow-md border-2 border-brand-100 bg-white" />
                <span className="text-3xl font-serif font-bold tracking-tight text-stone-900">MABAE <span className="text-brand-600">- Tiệm Bánh Donut</span></span>
              </div>
              <p className="text-stone-600 leading-relaxed max-w-sm mb-8 mt-6 italic">
                "Welcome to Mabae Donut - Where memories come alive with every Donuts! 🍩💝"
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
            © 2026 MABAE - Tiệm Bánh Donut. All rights reserved.
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
                        {(item.images && item.images.length > 0) ? <img src={item.images[0]} className="w-full h-full object-cover" /> : item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-brand-300"><CakeSlice size={24}/></div>}
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
                        <span>Phí giao hàng dự kiến</span>
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
                  
                  <h3 className="font-bold text-brand-900 mt-6 mb-4">Hình thức nhận hàng</h3>
                  <div className="flex gap-2 mb-4 bg-brand-100 p-1.5 rounded-xl">
                    <button type="button" onClick={() => setDeliveryMethod('DELIVERY')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${deliveryMethod === 'DELIVERY' ? 'bg-white shadow-sm text-brand-700' : 'text-brand-800/70 hover:bg-brand-50'}`}>Giao tận nơi</button>
                    <button type="button" onClick={() => setDeliveryMethod('PICKUP')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${deliveryMethod === 'PICKUP' ? 'bg-white shadow-sm text-brand-700' : 'text-brand-800/70 hover:bg-brand-50'}`}>Đến quán lấy</button>
                  </div>

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
                    
                    {deliveryMethod === 'DELIVERY' && (
                      <>
                        <input 
                          type="text" placeholder="Địa chỉ giao hàng" required={deliveryMethod === 'DELIVERY'}
                          className="w-full px-4 py-3 bg-white border border-brand-200 focus:border-brand-500 rounded-xl outline-none font-medium"
                          value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                        />
                        
                        <button type="button" onClick={() => {
                          setIsMapOpen(true);
                          if (navigator.geolocation && !customerLocation) {
                            navigator.geolocation.getCurrentPosition(
                              (pos) => setCustomerLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                              (err) => console.log('Lỗi định vị:', err),
                              { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                            );
                          }
                        }} className="w-full flex items-center gap-2 justify-center py-3 bg-stone-100 text-stone-700 font-bold rounded-xl border border-stone-200 hover:bg-stone-200 transition-colors">
                          <Navigation size={18} className="text-brand-600"/> 
                          {customerLocation ? 'Đã ghim vị trí (Sửa)' : 'Ghim vị trí nhận hàng (Tính ship)'}
                        </button>
                      </>
                    )}

                    {deliveryMethod === 'PICKUP' && (
                      <div className="flex flex-col">
                        <label className="text-xs font-bold text-brand-700 mb-1 ml-1">Hẹn giờ đến lấy</label>
                        <input 
                          type="datetime-local" required={deliveryMethod === 'PICKUP'}
                          className="w-full px-4 py-3 bg-white border border-brand-200 focus:border-brand-500 rounded-xl outline-none font-medium"
                          value={pickupTime} onChange={e => setPickupTime(e.target.value)}
                        />
                      </div>
                    )}

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
                  Đặt đơn - {finalAmount.toLocaleString('vi-VN')} ₫
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
             
             <div className="p-3 bg-stone-50 border-b border-stone-100">
               <form onSubmit={handleMapSearch} className="flex gap-2">
                 <input 
                   type="text" 
                   placeholder="Tìm kiếm địa chỉ..." 
                   className="flex-1 px-3 py-2 text-sm border border-stone-200 rounded-lg outline-none focus:border-brand-500"
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                 />
                 <button type="submit" className="px-3 py-2 bg-brand-500 text-white rounded-lg flex items-center justify-center hover:bg-brand-600">
                   <Search size={16} />
                 </button>
               </form>
               {searchResults.length > 0 && (
                 <div className="absolute z-[1000] left-0 right-0 top-[110px] mx-4 max-h-48 overflow-y-auto bg-white border border-stone-200 shadow-xl rounded-lg">
                   {searchResults.map((res, i) => (
                     <div 
                       key={i} 
                       className="p-3 text-sm border-b border-stone-100 cursor-pointer hover:bg-brand-50"
                       onClick={() => {
                         const latlng = { lat: parseFloat(res.lat), lng: parseFloat(res.lon) };
                         setCustomerLocation(latlng);
                         setFormData(prev => ({...prev, address: res.display_name}));
                         setSearchResults([]);
                         setSearchQuery('');
                       }}
                     >
                       {res.display_name}
                     </div>
                   ))}
                 </div>
               )}
             </div>

             <div className="p-2 bg-stone-50 text-[11px] text-stone-500 font-medium text-center">
               Bạn có thể tìm kiếm, chạm vào bản đồ hoặc kéo thả ghim để chọn chính xác điểm giao.
             </div>
             <div className="h-[50vh] w-full relative z-0">
                <MapContainer center={customerLocation || (settings?.storeLocation ? [settings.storeLocation.lat, settings.storeLocation.lng] : [21.0285, 105.8542])} zoom={15} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" attribution="&copy; Google Maps" />
                  <MapUpdater center={customerLocation} />
                  <LocationMarker 
                    position={customerLocation} 
                    setPosition={setCustomerLocation} 
                    setFormData={setFormData}
                  />
                </MapContainer>
             </div>
             {customerLocation && shippingConfig && distanceKm > 0 && (
               <div className="px-4 pt-4 text-center text-sm font-bold text-brand-700">
                 Khoảng cách: {distanceKm.toFixed(1)} km - Phí ship dự kiến: {previewShippingFee.toLocaleString('vi-VN')} ₫
               </div>
             )}
             <div className="p-4 bg-white border-t border-stone-100">
               <button onClick={() => setIsMapOpen(false)} className="w-full py-3.5 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700">Xác nhận vị trí</button>
             </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation - Phê La Style */}
      <div 
        className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-brand-100 flex justify-between items-end pt-2 px-2 z-40 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.06)]"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
      >
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
        <Link to="/profile" className={`flex flex-col items-center gap-1 w-[20%] transition-colors ${location.pathname === '/profile' ? 'text-brand-900' : 'text-brand-800'}`}>
          <LayoutGrid size={24} strokeWidth={location.pathname === '/profile' ? 2.5 : 2} fill={location.pathname === '/profile' ? 'currentColor' : 'none'} />
          <span className="text-[10px] font-bold">Khác</span>
        </Link>
      </div>
    </div>
  );
}
