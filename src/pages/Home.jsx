import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ChevronRight, CakeSlice, Bell, Ticket, UserCircle, Clock, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductImageSlider from '../components/ProductImageSlider';

function PromoSlider({ promo }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = (promo.images && promo.images.length > 0) ? promo.images : (promo.image ? [promo.image] : []);

  useEffect(() => {
    if (images.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 3500);
      return () => clearInterval(timer);
    }
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div className="w-full h-full bg-brand-800 flex items-center justify-center">
        <CakeSlice size={48} className="text-brand-200" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-stone-100 rounded-2xl">
      {images.map((img, i) => (
        <div key={i} className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${i === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          <img src={img} alt={`${promo.title} ${i}`} className="w-full h-full object-cover" />
        </div>
      ))}
      {/* dots indicator */}
      {images.length > 1 && (
        <div className="absolute top-4 right-4 flex gap-1.5 z-10 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
          {images.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-white w-4' : 'bg-white/50'}`} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { products, addToCart, customer, promos, setIsCheckout, cart } = useOutletContext();
  const navigate = useNavigate();
  const [myOrders, setMyOrders] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (customer && customer.phone) {
          const BACKEND_URL = import.meta.env.DEV ? 'http://localhost:5001/api/shop' : 'https://bakery-backend-six.vercel.app/api/shop';
          const res = await axios.get(`${BACKEND_URL}/customer/orders/${customer.phone}`);
          setMyOrders(res.data.data);
        }
      } catch (err) {
        console.log(err);
      }
    };
    if (customer) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 10000);
      return () => clearInterval(interval);
    } else {
      setMyOrders([]);
    }
  }, [customer]);

  const activeOrders = myOrders.filter(o => o.status !== 'CANCELLED');

  // Get products marked as best sellers
  const bestSellers = products.filter(p => p.isBestSeller);
  
  // Get ads and news
  const adsPromos = (promos || []).filter(p => p.postType === 'ADS');
  const eventsPromos = (promos || []).filter(p => p.postType === 'EVENT');
  const newsPromos = (promos || []).filter(p => p.postType === 'NEWS');

  return (
    <div className="pb-20 md:pb-12 md:pt-4">
      {/* Top Header Section (Mobile Only) */}
      <div className="pt-10 px-4 pb-4 md:hidden relative z-50">
        {/* Row 1: Logo & Name */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <img src="/logo_donut.jpg" alt="Logo" className="w-12 h-12 object-contain p-0.5 rounded-full shadow-sm border border-brand-100 bg-white" />
          <h1 className="text-xl font-serif font-bold text-stone-900 tracking-wide">
            MABAE <span className="text-brand-600">- Tiệm Bánh Donut</span>
          </h1>
        </div>

        {/* Row 2: User info & Actions */}
        <div className="flex items-center justify-between">
          <Link to="/profile" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-200 rounded-full flex items-center justify-center text-brand-700 font-bold overflow-hidden shadow-sm border border-brand-100">
              {customer?.name ? customer.name.charAt(0).toUpperCase() : <UserCircle size={24} />}
            </div>
            <div>
              <p className="text-xs text-stone-500 font-medium">Xin chào,</p>
              <p className="text-sm font-bold text-stone-900">{customer?.name || 'Khách hàng'}</p>
            </div>
          </Link>
          
          <div className="flex items-center gap-3 relative">
            <button 
              onClick={() => {
                if (!customer) {
                  alert('Vui lòng đăng nhập để xem thông báo');
                  navigate('/profile');
                  return;
                }
                setShowNotifications(!showNotifications);
              }}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-stone-600 shadow-sm border border-brand-50 relative"
            >
              <Bell size={20} />
              {activeOrders.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
            </button>
            
            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute top-12 right-0 w-72 bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden z-50">
                <div className="p-3 border-b border-stone-100 bg-brand-50">
                  <h3 className="font-bold text-stone-900 text-sm">Thông báo đơn hàng</h3>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {myOrders.length === 0 ? (
                    <div className="p-4 text-center text-stone-500 text-xs">Chưa có thông báo nào</div>
                  ) : (
                    myOrders.map(order => (
                      <div key={order._id} className="p-3 border-b border-stone-50 hover:bg-stone-50 transition-colors">
                        <div className="flex items-start gap-2">
                          {order.status === 'PENDING' ? <Clock size={16} className="text-brand-500 shrink-0 mt-0.5" /> : <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />}
                          <div>
                            <p className="text-xs font-bold text-stone-900 mb-0.5">
                              Đơn hàng {order.totalAmount.toLocaleString('vi-VN')}₫
                            </p>
                            <p className="text-[11px] text-stone-500">
                              {order.status === 'PENDING' ? 'Đang chờ tiệm xác nhận' : 
                               order.status === 'CONFIRMED' ? 'Tiệm đã xác nhận, đang chuẩn bị' :
                               order.status === 'DELIVERING' ? 'Đang trên đường giao đến bạn' :
                               order.status === 'COMPLETED' ? 'Đã giao thành công' : 'Đã hủy'}
                            </p>
                            <p className="text-[9px] text-stone-400 mt-1">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <button 
              onClick={() => {
                if (!customer) {
                  alert('Vui lòng đăng nhập để xem giỏ hàng');
                  navigate('/profile');
                  return;
                }
                setIsCheckout(true);
              }}
              className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white shadow-sm relative"
            >
              <ShoppingBag size={20} />
              {(cart && cart.length > 0) && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Ads Slider */}
      <div className="px-4 mb-6 md:mb-12 mt-4 md:mt-0">
        {adsPromos.length > 0 ? (
          <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 snap-x snap-mandatory pb-2" style={{ scrollbarWidth: 'none' }}>
            {adsPromos.map(promo => (
              <div key={promo._id} className="min-w-full md:min-w-0 w-full aspect-video rounded-2xl overflow-hidden relative shadow-md hover:shadow-lg transition-shadow snap-center shrink-0">
                <PromoSlider promo={promo} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-8">
                  <div className="flex gap-2">
                    <span className="text-[10px] md:text-xs font-bold bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full w-max mb-3 uppercase shadow-sm">Quảng Cáo</span>
                  </div>
                  {promo.title && <h2 className="text-white font-serif text-2xl md:text-3xl lg:text-4xl font-bold mb-2 leading-tight drop-shadow-md">{promo.title}</h2>}
                  {promo.content && <p className="text-stone-100 text-sm md:text-base font-medium line-clamp-2 md:line-clamp-3 drop-shadow-md max-w-3xl">{promo.content}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full aspect-video md:aspect-[21/9] lg:aspect-[21/7] rounded-2xl md:rounded-[40px] overflow-hidden relative shadow-md">
            <img src="https://images.unsplash.com/photo-1517433670267-08bbd4be890f?q=80&w=2000&auto=format&fit=crop" alt="Banner" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-900/80 via-brand-900/40 to-transparent flex flex-col justify-end p-6 md:p-12 lg:p-16">
              <h2 className="text-white font-serif text-3xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-6 drop-shadow-lg">MABAE - Tiệm Bánh Donut</h2>
              <p className="text-brand-50 text-sm md:text-xl lg:text-2xl font-medium drop-shadow-md max-w-2xl">Welcome to Mabae Donut - Where memories come alive with every Donuts! 🍩</p>
            </div>
          </div>
        )}
      </div>

      {/* Delivery Info Box */}
      <div className="px-4 mb-8 md:mb-12">
        <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow border border-brand-100 flex items-center gap-4 cursor-pointer">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-brand-100 rounded-xl md:rounded-2xl flex items-center justify-center text-brand-600 shrink-0">
            <img src="https://cdn-icons-png.flaticon.com/512/3063/3063822.png" alt="Delivery" className="w-8 h-8 md:w-10 md:h-10 opacity-70" style={{filter: 'sepia(1) hue-rotate(330deg) saturate(3)'}} />
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="font-bold text-brand-900 flex items-center gap-1 md:text-xl">
              Giao hàng tận nơi <ChevronRight size={14} className="text-brand-400 md:w-5 md:h-5"/>
            </div>
            <div className="text-brand-800/70 text-xs md:text-sm truncate mt-0.5 md:mt-1">
              Cửa hàng chính, 289 Đinh Bộ Lĩnh, Bình Thạnh...
            </div>
          </div>
        </div>
      </div>

      {/* Best Sellers Section */}
      <div className="pl-4 md:px-4 mb-8 md:mb-16">
        <h3 className="text-xl md:text-3xl font-serif font-bold text-stone-900 mb-4 md:mb-8 flex items-center gap-2">
          Sản phẩm nổi bật
        </h3>
        
        <div className="flex overflow-x-auto md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 pb-4 pr-4 md:pr-0 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
          {bestSellers.map(product => (
            <div key={product._id} className="min-w-[160px] max-w-[160px] md:min-w-0 md:max-w-none snap-start group cursor-pointer" onClick={() => navigate('/menu')}>
              <div className="w-full aspect-[4/5] bg-white rounded-2xl md:rounded-3xl mb-3 overflow-hidden relative shadow-sm hover:shadow-xl transition-shadow border border-brand-100/50">
                <div className="absolute top-2 left-0 bg-brand-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-r-md z-20 pointer-events-none">MỚI</div>
                <div className="w-full h-full group-hover:scale-105 transition-transform duration-500">
                  <ProductImageSlider images={product.images} fallbackImage={product.image} productName={product.name} />
                </div>
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
                  className="absolute bottom-2 md:bottom-4 right-2 md:right-4 w-8 h-8 md:w-10 md:h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-brand-600 shadow-md hover:bg-brand-600 hover:text-white transition-colors"
                >
                  <ShoppingBag size={14} strokeWidth={2.5} className="md:w-5 md:h-5"/>
                </button>
              </div>
              <h4 className="font-bold text-stone-900 text-sm md:text-lg leading-snug mb-1 md:mb-2 line-clamp-2 md:line-clamp-1">{product.name}</h4>
              <div className="text-brand-600 font-bold text-sm md:text-base">{product.price.toLocaleString('vi-VN')} ₫</div>
            </div>
          ))}
          {bestSellers.length === 0 && (
             <div className="text-sm text-brand-800">Chưa có món nào.</div>
          )}
        </div>
      </div>

      {/* Events Section */}
      {eventsPromos.length > 0 && (
        <div className="px-4 mb-8">
          <h3 className="text-xl font-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
            Sự kiện
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eventsPromos.map(promo => (
              <div key={promo._id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-brand-100 flex flex-col h-full hover:shadow-md transition-shadow">
                <div className="w-full aspect-[16/9] relative bg-stone-100 shrink-0">
                  <PromoSlider promo={promo} />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex gap-2 mb-2">
                    <span className="text-[10px] font-bold bg-purple-500 text-white px-2 py-0.5 rounded-full uppercase shadow-sm">Sự Kiện</span>
                  </div>
                  {promo.title && <h4 className="font-bold text-stone-900 text-lg mb-2 leading-tight">{promo.title}</h4>}
                  {promo.content && <p className="text-stone-600 text-sm line-clamp-3">{promo.content}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* News Section */}
      {newsPromos.length > 0 && (
        <div className="px-4 mb-8">
          <h3 className="text-xl font-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
            Tin tức
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {newsPromos.map(promo => (
              <div key={promo._id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-brand-100 flex flex-col h-full hover:shadow-md transition-shadow">
                <div className="w-full aspect-[16/9] relative bg-stone-100 shrink-0">
                  <PromoSlider promo={promo} />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex gap-2 mb-2">
                    <span className="text-[10px] font-bold bg-blue-500 text-white px-2 py-0.5 rounded-full uppercase shadow-sm">Tin Tức</span>
                  </div>
                  {promo.title && <h4 className="font-bold text-stone-900 text-lg mb-2 leading-tight">{promo.title}</h4>}
                  {promo.content && <p className="text-stone-600 text-sm line-clamp-3">{promo.content}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
