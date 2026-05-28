import { useOutletContext, useNavigate } from 'react-router-dom';
import { Search, Plus, CakeSlice, ShoppingBag, Clock, CheckCircle, Bell } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import ProductImageSlider from '../components/ProductImageSlider';

export default function Menu() {
  const { products, categories: dbCategories, addToCart, customer, cart, setIsCheckout } = useOutletContext();
  const [activeTab, setActiveTab] = useState('');
  const [myOrders, setMyOrders] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch orders if phone exists
    const fetchOrders = async () => {
      try {
        const savedCustomer = localStorage.getItem('bakery_customer');
        if (savedCustomer) {
          const cust = JSON.parse(savedCustomer);
          if (cust.phone) {
            const BACKEND_URL = import.meta.env.DEV ? 'http://localhost:5001/api/shop' : 'https://bakery-backend-six.vercel.app/api/shop';
            const res = await axios.get(`${BACKEND_URL}/customer/orders/${cust.phone}`);
            setMyOrders(res.data.data);
          }
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  // Use categories from DB to ensure Admin controls the order and existence
  const categoryNames = useMemo(() => {
    if (dbCategories && dbCategories.length > 0) {
      return dbCategories.map(c => c.name);
    }
    // Fallback if no categories in DB
    const names = new Set();
    products.forEach(p => names.add(p.category || 'Khác'));
    return Array.from(names);
  }, [dbCategories, products]);

  // Group products by those category names
  const productGroups = useMemo(() => {
    const groups = {};
    categoryNames.forEach(name => groups[name] = []);
    products.forEach(p => {
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return;
      const cat = p.category || 'Khác';
      if (groups[cat]) {
        groups[cat].push(p);
      } else {
        // If product has a category not in DB, put it in 'Khác' or ignore. Let's put in 'Khác'.
        if (!groups['Khác']) {
          groups['Khác'] = [];
          if (!categoryNames.includes('Khác')) categoryNames.push('Khác');
        }
        groups['Khác'].push(p);
      }
    });
    return groups;
  }, [products, categoryNames, searchQuery]);
  if (categoryNames.length > 0 && !activeTab) {
    setActiveTab(categoryNames[0]);
  }

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    const button = e.currentTarget;
    const card = button.closest('.bg-white');
    const imgElement = card ? card.querySelector('img') : null;
    
    const startRect = imgElement ? imgElement.getBoundingClientRect() : button.getBoundingClientRect();
    
    const mobileCart = document.getElementById('mobile-cart-icon');
    const desktopCart = document.getElementById('desktop-cart-icon');
    
    let cartIcon = null;
    if (window.innerWidth < 768 && mobileCart) {
      cartIcon = mobileCart;
    } else if (desktopCart) {
      cartIcon = desktopCart;
    } else {
      cartIcon = mobileCart || desktopCart;
    }
    
    if (cartIcon) {
      const endRect = cartIcon.getBoundingClientRect();
      
      const flyingEl = document.createElement('div');
      flyingEl.style.position = 'fixed';
      flyingEl.style.zIndex = '999999';
      flyingEl.style.width = (imgElement ? startRect.width : 40) + 'px';
      flyingEl.style.height = (imgElement ? startRect.height : 40) + 'px';
      flyingEl.style.borderRadius = '50%';
      flyingEl.style.overflow = 'hidden';
      flyingEl.style.left = startRect.left + 'px';
      flyingEl.style.top = startRect.top + 'px';
      flyingEl.style.transition = 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
      flyingEl.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
      
      if (imgElement) {
        const img = document.createElement('img');
        img.src = imgElement.src;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        flyingEl.appendChild(img);
      } else {
        flyingEl.style.backgroundColor = '#d97706';
      }
      
      document.body.appendChild(flyingEl);
      
      setTimeout(() => {
        flyingEl.style.left = (endRect.left + endRect.width/2 - 10) + 'px';
        flyingEl.style.top = (endRect.top + endRect.height/2 - 10) + 'px';
        flyingEl.style.width = '20px';
        flyingEl.style.height = '20px';
        flyingEl.style.opacity = '0.3';
      }, 10);
      
      setTimeout(() => {
        if (document.body.contains(flyingEl)) {
          document.body.removeChild(flyingEl);
        }
        addToCart(product);
        cartIcon.classList.add('scale-125');
        setTimeout(() => cartIcon.classList.remove('scale-125'), 200);
      }, 600);
    } else {
      addToCart(product);
    }
  };

  const scrollToCategory = (cat) => {
    setActiveTab(cat);
    const el = document.getElementById(`cat-${cat}`);
    if (el) {
      // Offset for sticky header
      const y = el.getBoundingClientRect().top + window.scrollY - 130;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="pb-24 bg-brand-50 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-brand-50 z-30 pt-12 pb-2 px-4 shadow-sm border-b border-brand-100 md:static md:pt-0 md:bg-transparent md:border-none md:shadow-none md:mb-6 md:px-0">
        <div className="flex justify-between items-center mb-4 min-h-[40px]">
          {isSearching ? (
            <div className="flex-1 flex items-center gap-2">
              <input 
                type="text" 
                autoFocus
                placeholder="Tìm kiếm bánh..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 bg-white rounded-full border border-brand-200 outline-none focus:border-brand-500 shadow-inner text-sm md:max-w-md md:ml-auto"
              />
              <button onClick={() => { setIsSearching(false); setSearchQuery(''); }} className="w-10 h-10 flex items-center justify-center text-stone-500 shrink-0">
                Đóng
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-serif font-bold text-stone-900 md:hidden">Thực đơn</h1>
              <div className="flex items-center gap-2 relative md:ml-auto">
                <button 
                  onClick={() => {
                    if (!customer) {
                      alert('Vui lòng đăng nhập để xem thông báo');
                      navigate('/profile');
                      return;
                    }
                    setShowNotifications(!showNotifications);
                  }}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-stone-600 shadow-sm border border-brand-50 relative hover:bg-stone-50 transition-colors"
                >
                  <Bell size={20} />
                  {myOrders.filter(o => o.status !== 'CANCELLED').length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                </button>
                <button onClick={() => setIsSearching(true)} className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-stone-700 hover:bg-brand-200 transition-colors">
                  <Search size={20} />
                </button>
                <button 
                  id="mobile-cart-icon"
                  onClick={() => {
                    if (!customer) {
                      alert('Vui lòng đăng nhập để đặt hàng');
                      navigate('/profile');
                      return;
                    }
                    setIsCheckout(true);
                  }} 
                  className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white relative shadow-sm hover:bg-brand-700 transition-colors md:hidden"
                >
                  <ShoppingBag size={20} />
                  {cart && cart.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-brand-600 font-bold text-[10px] rounded-full flex items-center justify-center border border-brand-600 shadow-sm">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden z-50">
                    <div className="p-3 border-b border-stone-100 bg-brand-50">
                      <h3 className="font-bold text-stone-900 text-sm">Thông báo đơn hàng</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {myOrders.length === 0 ? (
                        <div className="p-6 text-center text-stone-500 text-sm">Chưa có thông báo nào</div>
                      ) : (
                        myOrders.map(order => (
                          <div key={order._id} className="p-4 border-b border-stone-50 hover:bg-stone-50 transition-colors cursor-pointer" onClick={() => navigate('/orders')}>
                            <div className="flex items-start gap-3">
                              {order.status === 'PENDING' ? <Clock size={18} className="text-brand-500 shrink-0 mt-0.5" /> : <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />}
                              <div>
                                <p className="text-sm font-bold text-stone-900 mb-0.5">
                                  Đơn hàng {order.totalAmount.toLocaleString('vi-VN')}₫
                                </p>
                                <p className="text-xs text-stone-500">
                                  {order.status === 'PENDING' ? 'Đang chờ tiệm xác nhận' : 
                                   order.status === 'CONFIRMED' ? 'Tiệm đã xác nhận, đang chuẩn bị' :
                                   order.status === 'DELIVERING' ? 'Đang trên đường giao đến bạn' :
                                   order.status === 'COMPLETED' ? 'Đã giao thành công' : 'Đã hủy'}
                                </p>
                                <p className="text-[10px] text-stone-400 mt-1">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        
        {/* Category Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2 md:gap-3" style={{ scrollbarWidth: 'none' }}>
          {categoryNames.map(cat => (
            <button 
              key={cat}
              onClick={() => scrollToCategory(cat)}
              className={`whitespace-nowrap px-4 md:px-6 py-2 md:py-2.5 rounded-xl md:rounded-full text-sm md:text-base font-bold transition-all border ${activeTab === cat ? 'bg-brand-500 text-white border-brand-500 shadow-md' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>



      {/* Product List */}
      <div className="px-4 md:px-0 space-y-8 mt-4 md:mt-8">
        {categoryNames.map(cat => (
          <div key={cat} id={`cat-${cat}`} className="pt-2 md:pt-4">
            <h2 className="text-xl md:text-3xl font-serif font-bold text-stone-900 mb-4 md:mb-6">{cat}</h2>
            
            <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6">
              {productGroups[cat].map(product => (
                <div 
                  key={product._id} 
                  className="bg-white p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-sm md:shadow-md md:hover:shadow-xl border border-brand-100/50 flex flex-row md:flex-col gap-4 relative overflow-hidden cursor-pointer transition-all duration-300 md:hover:-translate-y-1"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="absolute top-3 left-0 bg-brand-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-r-md z-20 shadow-sm">MỚI</div>
                  
                  <div className="w-24 h-24 md:w-full md:aspect-[4/3] md:h-auto bg-brand-50 rounded-xl md:rounded-2xl overflow-hidden shrink-0 relative group">
                    <ProductImageSlider images={product.images} fallbackImage={product.image} productName={product.name} />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between py-1 md:py-2">
                    <div>
                      <h3 className="font-bold text-stone-900 text-base md:text-lg leading-snug line-clamp-2 md:line-clamp-1 mb-1">{product.name}</h3>
                      <p className="text-xs text-stone-500 line-clamp-1 md:line-clamp-2 md:mb-3">{product.description}</p>
                    </div>
                    <div className="text-brand-600 font-bold text-sm md:text-lg mt-auto">
                      {product.price.toLocaleString('vi-VN')} ₫
                    </div>
                  </div>

                  <button 
                    onClick={(e) => handleAddToCart(e, product)}
                    className="absolute bottom-3 right-3 md:relative md:bottom-auto md:right-auto md:w-full md:mt-2 px-3 md:px-4 py-1.5 md:py-2.5 rounded-full md:rounded-xl bg-brand-50 md:bg-brand-600 text-brand-600 md:text-white flex items-center justify-center font-bold text-xs md:text-sm shadow-sm hover:bg-brand-500 md:hover:bg-brand-700 hover:text-white transition-colors z-20"
                  >
                    <Plus size={14} strokeWidth={3} className="mr-1 md:hidden" />
                    <ShoppingBag size={16} strokeWidth={2.5} className="mr-2 hidden md:block" />
                    Thêm <span className="hidden md:inline ml-1">vào giỏ</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
        {categoryNames.length === 0 && (
          <div className="text-center py-20 text-brand-800">
            Không có sản phẩm nào
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedProduct(null)}></div>
          <div className="relative w-full md:max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom md:zoom-in-95 duration-300">
            
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md z-10 hover:bg-black/60">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            
            <div className="w-full aspect-square bg-stone-100 rounded-t-3xl md:rounded-t-3xl overflow-hidden shrink-0">
              <ProductImageSlider images={selectedProduct.images} fallbackImage={selectedProduct.image} productName={selectedProduct.name} />
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="flex justify-between items-start gap-4 mb-2">
                <h2 className="text-2xl font-serif font-bold text-stone-900 leading-tight">{selectedProduct.name}</h2>
              </div>
              <div className="text-2xl font-bold text-brand-600 mb-4">{selectedProduct.price.toLocaleString('vi-VN')} ₫</div>
              
              <div className="pt-4 border-t border-stone-100">
                <h3 className="font-bold text-stone-800 mb-2">Mô tả sản phẩm</h3>
                <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
                  {selectedProduct.description || 'Chưa có mô tả cho sản phẩm này.'}
                </p>
              </div>
            </div>
            
            <div className="p-4 border-t border-stone-100 bg-white rounded-b-3xl shrink-0">
              <button 
                onClick={(e) => {
                  handleAddToCart(e, selectedProduct);
                  setSelectedProduct(null);
                }}
                className="w-full py-4 bg-brand-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-700 shadow-md transition-colors"
              >
                <ShoppingBag size={20} /> Thêm vào giỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
