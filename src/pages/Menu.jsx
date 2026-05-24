import { useOutletContext } from 'react-router-dom';
import { Search, Plus, CakeSlice, ShoppingBag, Clock, CheckCircle } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import axios from 'axios';

export default function Menu() {
  const { products, categories: dbCategories, addToCart } = useOutletContext();
  const [activeTab, setActiveTab] = useState('');
  const [myOrders, setMyOrders] = useState([]);

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
      const cat = p.category || 'Khác';
      if (groups[cat]) {
        groups[cat].push(p);
      } else {
        // If product has a category not in DB, put it in 'Khác' or ignore. Let's put in 'Khác'.
        if (!groups['Khác']) {
          groups['Khác'] = [];
          categoryNames.push('Khác');
        }
        groups['Khác'].push(p);
      }
    });
    return groups;
  }, [products, categoryNames]);
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
      <div className="sticky top-0 bg-brand-50 z-30 pt-12 pb-2 px-4 shadow-sm border-b border-brand-100">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-serif font-bold text-stone-900">Thực đơn</h1>
          <button className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-stone-700">
            <Search size={20} />
          </button>
        </div>
        
        {/* Category Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2" style={{ scrollbarWidth: 'none' }}>
          {categoryNames.map(cat => (
            <button 
              key={cat}
              onClick={() => scrollToCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-colors border ${activeTab === cat ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-stone-600 border-stone-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Order Tracking Banner */}
      {myOrders.length > 0 && (
        <div className="px-4 mt-4">
          <div className="bg-brand-600 rounded-2xl p-4 text-white shadow-md mb-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <ShoppingBag size={64} />
            </div>
            <h3 className="font-bold text-lg mb-2 relative z-10">Đơn hàng của bạn</h3>
            <div className="space-y-2 relative z-10">
              {myOrders.slice(0, 2).map(order => (
                <div key={order._id} className="flex justify-between items-center bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    {order.status === 'PENDING' ? <Clock size={16} className="text-brand-100" /> : <CheckCircle size={16} className="text-green-300" />}
                    <span className="text-sm font-medium">
                      {order.status === 'PENDING' ? 'Đang chờ tiệm xác nhận' : 'Đang giao / Hoàn thành'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{order.totalAmount.toLocaleString('vi-VN')} ₫</div>
                    {order.shippingFee > 0 && <div className="text-[10px] text-white/70">Gồm {order.shippingFee.toLocaleString('vi-VN')}₫ ship</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Product List */}
      <div className="px-4 space-y-8 mt-4">
        {categoryNames.map(cat => (
          <div key={cat} id={`cat-${cat}`} className="pt-2">
            <h2 className="text-xl font-serif font-bold text-stone-900 mb-4">{cat}</h2>
            
            <div className="space-y-3">
              {productGroups[cat].map(product => (
                <div key={product._id} className="bg-white p-3 rounded-2xl shadow-sm border border-brand-100/50 flex gap-4 relative overflow-hidden">
                  <div className="absolute top-2 left-0 bg-brand-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-r">MỚI</div>
                  
                  <div className="w-24 h-24 bg-brand-50 rounded-xl overflow-hidden shrink-0">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brand-300">
                        <CakeSlice size={24} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h3 className="font-bold text-stone-900 text-base leading-snug line-clamp-2 mb-1">{product.name}</h3>
                      <p className="text-xs text-stone-500 line-clamp-1">{product.description}</p>
                    </div>
                    <div className="text-brand-600 font-bold text-sm">
                      {product.price.toLocaleString('vi-VN')}
                    </div>
                  </div>

                  <button 
                    onClick={(e) => handleAddToCart(e, product)}
                    className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs shadow-sm hover:bg-brand-500 hover:text-white transition-colors"
                  >
                    <Plus size={14} strokeWidth={3} className="mr-1" /> Thêm
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
    </div>
  );
}
