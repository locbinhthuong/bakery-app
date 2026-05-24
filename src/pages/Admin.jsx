import { useState, useEffect } from 'react';
import { Package, Users, Tag, ShoppingCart, LogOut, Plus, Edit2, Trash2, CheckCircle, CakeSlice, MapPin, Eye, Menu as MenuIcon, X, ListFilter, Star, Settings } from 'lucide-react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

const BACKEND_URL = import.meta.env.DEV ? 'http://localhost:5001/api/shop' : 'https://bakery-backend-six.vercel.app/api/shop';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [promos, setPromos] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(null);
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // States for Editing Product
  const [editingProduct, setEditingProduct] = useState(null);

  // States for Sub-tabs in Menu
  const [menuSubTab, setMenuSubTab] = useState('products'); // 'products' or 'categories'

  const fetchData = async () => {
    try {
      if (activeTab === 'home') {
        const [resPromos, resProducts] = await Promise.all([
          axios.get(`${BACKEND_URL}/admin/promos`),
          axios.get(`${BACKEND_URL}/admin/products`)
        ]);
        setPromos(resPromos.data.data);
        setProducts(resProducts.data.data);
      } else if (activeTab === 'menu') {
        const [resProducts, resCats] = await Promise.all([
          axios.get(`${BACKEND_URL}/admin/products`),
          axios.get(`${BACKEND_URL}/categories`)
        ]);
        setProducts(resProducts.data.data);
        setCategories(resCats.data.data);
      } else if (activeTab === 'orders') {
        const res = await axios.get(`${BACKEND_URL}/admin/orders`);
        setOrders(res.data.data);
      } else if (activeTab === 'customers') {
        const res = await axios.get(`${BACKEND_URL}/admin/customers`);
        setCustomers(res.data.data);
      } else if (activeTab === 'settings') {
        const res = await axios.get(`${BACKEND_URL}/settings`);
        setSettings(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Upload Logic
  const uploadImageFile = async (file) => {
    if (!file || file.size === 0) return null;
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const res = await axios.post(`${BACKEND_URL}/admin/upload`, { image: reader.result });
          resolve(res.data.url.startsWith('http') ? res.data.url : BACKEND_URL.replace('/api/shop', '') + res.data.url);
        } catch (err) {
          console.error(err);
          resolve(null);
        }
      };
      reader.onerror = () => resolve(null);
    });
  };

  // CATEGORIES Actions
  const handleAddCategory = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    try {
      await axios.post(`${BACKEND_URL}/admin/categories`, { name });
      e.target.reset();
      fetchData();
    } catch (err) { alert('Lỗi thêm bộ lọc'); }
  };
  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Xoá bộ lọc này?')) return;
    try {
      await axios.delete(`${BACKEND_URL}/admin/categories/${id}`);
      fetchData();
    } catch (err) { alert('Lỗi xoá bộ lọc'); }
  };

  // PRODUCTS Actions
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const imageFile = fd.get('imageFile');
    let imageUrl = '';
    if (imageFile && imageFile.name) imageUrl = await uploadImageFile(imageFile);

    try {
      await axios.post(`${BACKEND_URL}/admin/products`, {
        name: fd.get('name'),
        price: Number(fd.get('price')),
        category: fd.get('category'),
        image: imageUrl,
        description: fd.get('description'),
        isActive: true
      });
      e.target.reset();
      fetchData();
    } catch (err) { alert('Lỗi thêm sản phẩm'); }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const imageFile = fd.get('imageFile');
    let imageUrl = editingProduct.image;
    
    if (imageFile && imageFile.name) {
      const newUrl = await uploadImageFile(imageFile);
      if (newUrl) imageUrl = newUrl;
    }

    try {
      await axios.put(`${BACKEND_URL}/admin/products/${editingProduct._id}`, {
        name: fd.get('name'),
        price: Number(fd.get('price')),
        category: fd.get('category'),
        image: imageUrl,
        description: fd.get('description')
      });
      setEditingProduct(null);
      fetchData();
    } catch (err) { alert('Lỗi cập nhật'); }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Chắc chắn xoá bánh này?')) return;
    try {
      await axios.delete(`${BACKEND_URL}/admin/products/${id}`);
      fetchData();
    } catch (err) { alert('Lỗi xoá bánh'); }
  };

  const handleToggleBestSeller = async (id, currentStatus) => {
    try {
      await axios.put(`${BACKEND_URL}/admin/products/${id}/bestseller`, { isBestSeller: !currentStatus });
      fetchData();
    } catch (err) { alert('Lỗi cập nhật món bán chạy'); }
  };

  // PROMOS Actions
  const handleAddPromo = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const imageFile = fd.get('imageFile');
    let imageUrl = '';
    if (imageFile && imageFile.name) imageUrl = await uploadImageFile(imageFile);

    try {
      await axios.post(`${BACKEND_URL}/admin/promos`, {
        title: fd.get('title'),
        content: fd.get('content'),
        image: imageUrl,
        code: (fd.get('code') || '').toUpperCase(),
        discountType: fd.get('discountType') || 'NONE',
        discountValue: Number(fd.get('discountValue')) || 0,
        minOrderValue: Number(fd.get('minOrderValue')) || 0,
        totalUsageLimit: Number(fd.get('totalUsageLimit')) || 0,
        maxUsagePerUser: Number(fd.get('maxUsagePerUser')) || 0,
        startDate: fd.get('startDate') ? new Date(fd.get('startDate')).toISOString() : null,
        endDate: fd.get('endDate') ? new Date(fd.get('endDate')).toISOString() : null,
        isActive: true
      });
      e.target.reset();
      fetchData();
    } catch (err) { alert('Lỗi thêm khuyến mãi'); }
  };
  const handleDeletePromo = async (id) => {
    if (!window.confirm('Chắc chắn xoá bài đăng này?')) return;
    try {
      await axios.delete(`${BACKEND_URL}/admin/promos/${id}`);
      fetchData();
    } catch (err) { alert('Lỗi xoá'); }
  };

  // ORDERS Actions
  const handleConfirmOrder = async (id) => {
    try {
      await axios.put(`${BACKEND_URL}/admin/orders/${id}/confirm`);
      fetchData();
      alert('Đã xác nhận!');
    } catch (err) { alert('Lỗi xác nhận đơn'); }
  };

  // SETTINGS Actions
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await axios.put(`${BACKEND_URL}/admin/settings`, {
        shippingBaseFee: Number(fd.get('shippingBaseFee')),
        shippingBaseKm: Number(fd.get('shippingBaseKm')),
        shippingExtraFeePerKm: Number(fd.get('shippingExtraFeePerKm')),
        maxDeliveryKm: Number(fd.get('maxDeliveryKm')),
        storeLocation: settings.storeLocation // This is updated via the map click
      });
      alert('Đã lưu cài đặt!');
      fetchData();
    } catch (err) { alert('Lỗi lưu cài đặt'); }
  };

  const menuItems = [
    { id: 'home', icon: Tag, label: 'Trang chủ' },
    { id: 'menu', icon: Package, label: 'Đặt hàng' },
    { id: 'orders', icon: ShoppingCart, label: 'Đơn hàng' },
    { id: 'customers', icon: Users, label: 'Khách hàng' },
    { id: 'settings', icon: Settings, label: 'Cài đặt' },
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex font-sans text-stone-800">
      
      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#23140c] text-stone-300 flex flex-col transform transition-transform duration-300 md:relative ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center">
              <CakeSlice size={20} className="text-white" />
            </div>
            <span className="text-xl font-serif font-bold tracking-wide">Admin</span>
          </div>
          <button className="md:hidden p-2" onClick={() => setIsSidebarOpen(false)}><X size={24}/></button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map(item => (
            <button 
              key={item.id}
              onClick={() => { setActiveTab(item.id); if(window.innerWidth < 768) setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === item.id 
                ? 'bg-brand-600 text-white shadow-lg' 
                : 'hover:bg-stone-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>
        
        <div className="p-4 mt-auto">
          <button onClick={() => { localStorage.removeItem('bakery_token'); window.location.href='/'; }} className="w-full flex items-center gap-3 px-4 py-3 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors">
            <LogOut size={20} /> Đăng xuất
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
        {/* Header */}
        <header className="bg-white px-4 md:px-8 py-4 flex items-center gap-4 shadow-sm z-10 shrink-0">
          <button className="p-2 -ml-2 text-stone-600 rounded-lg hover:bg-stone-100" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <MenuIcon size={24} />
          </button>
          <h1 className="text-xl font-serif font-bold text-stone-900">
            {menuItems.find(i => i.id === activeTab)?.label}
          </h1>
        </header>

        {/* Content */}
        <main className="p-4 md:p-8 flex-1 overflow-y-auto bg-stone-50">
          
          {/* ===================== HOME TAB (Promos + Best Sellers) ===================== */}
          {activeTab === 'home' && (
            <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
              {/* Best Sellers Config */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200/60">
                <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2"><Star size={20} className="text-brand-600" /> Quản lý Món Bán Chạy (Hiển thị trang chủ)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {products.map(p => (
                    <div key={p._id} className={`p-3 rounded-xl border flex items-center justify-between ${p.isBestSeller ? 'border-brand-500 bg-brand-50' : 'border-stone-200'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-md flex justify-center items-center overflow-hidden border border-stone-100">
                          {p.image ? <img src={p.image} className="w-full h-full object-cover"/> : <CakeSlice size={16}/>}
                        </div>
                        <div className="font-medium text-sm line-clamp-1">{p.name}</div>
                      </div>
                      <button 
                        onClick={() => handleToggleBestSeller(p._id, p.isBestSeller)}
                        className={`w-10 h-6 rounded-full relative transition-colors ${p.isBestSeller ? 'bg-brand-500' : 'bg-stone-300'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${p.isBestSeller ? 'left-5' : 'left-1'}`}></div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Promos */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200/60">
                <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2"><Tag size={20} className="text-brand-600" /> Đăng quảng cáo / Sự kiện</h3>
                <form onSubmit={handleAddPromo} className="space-y-4 mb-8 border-b border-stone-100 pb-8">
                  <input name="title" type="text" placeholder="Tiêu đề" required className="w-full px-4 py-2 bg-stone-50 border rounded-lg outline-none" />
                  <textarea name="content" rows="2" placeholder="Nội dung" required className="w-full px-4 py-2 bg-stone-50 border rounded-lg outline-none resize-none"></textarea>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input name="code" type="text" placeholder="Mã (tuỳ chọn)" className="px-4 py-2 bg-white border rounded-lg outline-none uppercase" />
                    <select name="discountType" className="px-4 py-2 bg-white border rounded-lg outline-none">
                      <option value="NONE">Không giảm</option>
                      <option value="FIXED">Cố định</option>
                      <option value="PERCENT">Phần trăm</option>
                    </select>
                    <input name="discountValue" type="number" placeholder="Mức giảm" className="px-4 py-2 bg-white border rounded-lg outline-none" />
                  </div>

                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg space-y-4">
                    <h4 className="font-bold text-stone-700 text-sm">Cài đặt nâng cao (Để trống nếu không dùng)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-500 mb-1">Thời gian bắt đầu</label>
                        <input name="startDate" type="datetime-local" className="w-full px-4 py-2 bg-white border rounded-lg outline-none text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-500 mb-1">Thời gian kết thúc</label>
                        <input name="endDate" type="datetime-local" className="w-full px-4 py-2 bg-white border rounded-lg outline-none text-sm" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-500 mb-1">Đơn tối thiểu (VNĐ)</label>
                        <input name="minOrderValue" type="number" placeholder="0" className="w-full px-4 py-2 bg-white border rounded-lg outline-none text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-500 mb-1">Tổng lượt dùng</label>
                        <input name="totalUsageLimit" type="number" placeholder="0 = Vô hạn" className="w-full px-4 py-2 bg-white border rounded-lg outline-none text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-500 mb-1">Lượt dùng/Khách</label>
                        <input name="maxUsagePerUser" type="number" placeholder="0 = Vô hạn" className="w-full px-4 py-2 bg-white border rounded-lg outline-none text-sm" />
                      </div>
                    </div>
                  </div>

                  <input name="imageFile" type="file" accept="image/*" className="w-full text-sm" />
                  <button type="submit" className="py-2.5 px-6 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 w-full md:w-auto">Đăng lên</button>
                </form>

                <div className="space-y-3">
                  {promos.map(promo => (
                    <div key={promo._id} className="p-4 rounded-xl border border-stone-100 flex gap-4 items-center">
                      <div className="flex-1">
                        <div className="font-bold">{promo.title}</div>
                        <div className="text-sm text-stone-500 line-clamp-1">{promo.content}</div>
                      </div>
                      <button onClick={() => handleDeletePromo(promo._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===================== MENU TAB (Products + Categories) ===================== */}
          {activeTab === 'menu' && (
            <div className="animate-in fade-in duration-500 max-w-5xl mx-auto">
              {/* Sub-tabs */}
              <div className="flex gap-4 mb-6 border-b border-stone-200 pb-2">
                <button 
                  onClick={() => setMenuSubTab('products')} 
                  className={`font-bold pb-2 border-b-2 transition-colors ${menuSubTab === 'products' ? 'text-brand-600 border-brand-600' : 'text-stone-500 border-transparent hover:text-stone-800'}`}
                >
                  Sản Phẩm
                </button>
                <button 
                  onClick={() => setMenuSubTab('categories')} 
                  className={`font-bold pb-2 border-b-2 transition-colors ${menuSubTab === 'categories' ? 'text-brand-600 border-brand-600' : 'text-stone-500 border-transparent hover:text-stone-800'}`}
                >
                  Bộ Lọc (Danh mục)
                </button>
              </div>

              {/* PRODUCTS SUB-TAB */}
              {menuSubTab === 'products' && (
                <div className="space-y-6">
                  {/* Add Product Form */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200/60">
                    <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><Plus size={18} className="text-brand-600" /> Thêm bánh mới</h3>
                    <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input name="name" type="text" placeholder="Tên bánh" required className="col-span-1 px-4 py-2 bg-stone-50 border rounded-lg" />
                      <input name="price" type="number" placeholder="Giá (VNĐ)" required className="col-span-1 px-4 py-2 bg-stone-50 border rounded-lg" />
                      <select name="category" required className="col-span-1 px-4 py-2 bg-stone-50 border rounded-lg">
                        <option value="">Chọn Bộ Lọc (Khung kệ)</option>
                        {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                      </select>
                      <input name="description" type="text" placeholder="Mô tả ngắn gọn" className="md:col-span-2 px-4 py-2 bg-stone-50 border rounded-lg" />
                      <input name="imageFile" type="file" accept="image/*" className="col-span-1 text-sm pt-2" />
                      <button type="submit" className="md:col-span-3 py-2.5 bg-stone-900 text-white font-bold rounded-lg hover:bg-brand-900">Thêm Bánh</button>
                    </form>
                  </div>

                  {/* Products List */}
                  <div className="bg-white rounded-xl shadow-sm border border-stone-200/60 overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-stone-50 text-stone-600 font-medium border-b border-stone-200/60">
                        <tr>
                          <th className="px-4 py-3">Bánh</th>
                          <th className="px-4 py-3">Khung Bộ Lọc</th>
                          <th className="px-4 py-3">Giá</th>
                          <th className="px-4 py-3 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {products.map(p => (
                          <tr key={p._id} className="hover:bg-stone-50">
                            <td className="px-4 py-3 flex items-center gap-3">
                              <div className="w-10 h-10 rounded border overflow-hidden shrink-0">
                                {p.image ? <img src={p.image} className="w-full h-full object-cover"/> : <div className="bg-stone-100 w-full h-full flex items-center justify-center text-stone-300"><CakeSlice size={16}/></div>}
                              </div>
                              <div className="font-bold text-stone-800">{p.name}</div>
                            </td>
                            <td className="px-4 py-3 text-stone-600">{p.category || 'Khác'}</td>
                            <td className="px-4 py-3 text-brand-600 font-bold">{p.price.toLocaleString('vi-VN')}</td>
                            <td className="px-4 py-3 text-right space-x-2">
                              <button onClick={() => setEditingProduct(p)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><Edit2 size={16}/></button>
                              <button onClick={() => handleDeleteProduct(p._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* CATEGORIES SUB-TAB */}
              {menuSubTab === 'categories' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200/60">
                    <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><ListFilter size={18} className="text-brand-600" /> Tạo Bộ Lọc Mới</h3>
                    <form onSubmit={handleAddCategory} className="flex gap-3">
                      <input name="name" type="text" placeholder="Tên Bộ Lọc (VD: Cà Phê, Trà...)" required className="flex-1 px-4 py-2 bg-stone-50 border rounded-lg" />
                      <button type="submit" className="px-4 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700">Thêm</button>
                    </form>
                    <p className="text-xs text-stone-400 mt-3">Khi thêm bộ lọc mới, nó sẽ xuất hiện trên thanh tìm kiếm ngang ở app Khách hàng.</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200/60">
                    <h3 className="font-bold text-stone-800 mb-4">Các Bộ Lọc Hiện Có</h3>
                    <div className="space-y-2">
                      {categories.map(cat => (
                        <div key={cat._id} className="flex justify-between items-center p-3 border rounded-lg bg-stone-50">
                          <span className="font-medium text-stone-800">{cat.name}</span>
                          <button onClick={() => handleDeleteCategory(cat._id)} className="text-red-500 p-1 hover:bg-red-100 rounded"><Trash2 size={16}/></button>
                        </div>
                      ))}
                      {categories.length === 0 && <div className="text-sm text-stone-500">Chưa có bộ lọc nào</div>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================== ORDERS TAB ===================== */}
          {activeTab === 'orders' && (
            <div className="space-y-4 animate-in fade-in duration-500 max-w-6xl mx-auto">
              {orders.map(order => (
                <div key={order._id} className="bg-white p-5 rounded-xl shadow-sm border border-stone-200/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-lg text-brand-900">{order.customerName}</span>
                      <span className="px-3 py-1 bg-stone-100 text-stone-600 text-xs font-bold rounded-full">{order.customerPhone}</span>
                      {order.status === 'PENDING' ? (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">Chờ Xác Nhận</span>
                      ) : (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1"><CheckCircle size={12}/> Đã Đẩy AloShipp</span>
                      )}
                    </div>
                    <p className="text-stone-600 text-sm mb-2"><MapPin size={14} className="inline mr-1" /> {order.deliveryAddress}</p>
                    <div className="text-sm font-medium text-stone-500">
                      {order.items.reduce((sum, i) => sum + i.quantity, 0)} sản phẩm
                    </div>
                    <button onClick={() => setSelectedOrder(order)} className="text-brand-600 hover:text-brand-800 text-sm font-bold flex items-center gap-1 mt-2">
                      <Eye size={16} /> Xem chi tiết
                    </button>
                  </div>
                  <div className="flex flex-col items-end gap-2 w-full md:w-auto h-full justify-between border-t md:border-0 md:border-l border-stone-100 pt-3 md:pt-0 md:pl-6">
                    <div className="text-right">
                      <div className="text-xl font-bold text-stone-900">{order.totalAmount.toLocaleString('vi-VN')} ₫</div>
                      {order.shippingFee > 0 && <div className="text-xs font-medium text-stone-500 mt-0.5">Tiền bánh: {order.subTotal.toLocaleString('vi-VN')}₫ | Ship: {order.shippingFee.toLocaleString('vi-VN')}₫</div>}
                    </div>
                    <div className="text-xs text-stone-400">{new Date(order.createdAt).toLocaleString('vi-VN')}</div>
                    {order.status === 'PENDING' && (
                      <button 
                        onClick={() => handleConfirmOrder(order._id)}
                        className="px-4 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors shadow-sm text-sm"
                      >
                        Xác nhận & Giao
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {orders.length === 0 && <div className="text-center py-10 text-stone-400">Chưa có đơn hàng nào.</div>}
            </div>
          )}

          {/* ===================== CUSTOMERS TAB ===================== */}
          {activeTab === 'customers' && (
            <div className="animate-in fade-in duration-500 max-w-5xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-stone-200/60 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-stone-50 text-stone-600 font-medium border-b border-stone-200/60">
                    <tr>
                      <th className="px-6 py-4">Tên khách hàng</th>
                      <th className="px-6 py-4">Số điện thoại</th>
                      <th className="px-6 py-4 text-center">Đơn đã mua</th>
                      <th className="px-6 py-4 text-right">Tổng chi tiêu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {customers.map(c => (
                      <tr key={c._id} className="hover:bg-stone-50">
                        <td className="px-6 py-4 font-bold text-stone-800">{c.name}</td>
                        <td className="px-6 py-4 text-stone-600">{c.phone}</td>
                        <td className="px-6 py-4 text-center"><span className="px-3 py-1 bg-brand-100 text-brand-800 rounded-full font-bold text-xs">{c.totalOrders}</span></td>
                        <td className="px-6 py-4 text-right font-bold text-brand-700">{c.totalSpent.toLocaleString('vi-VN')} ₫</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================== SETTINGS TAB ===================== */}
          {activeTab === 'settings' && settings && (
            <div className="animate-in fade-in duration-500 max-w-4xl mx-auto space-y-6">
              <h2 className="text-2xl font-bold mb-6">Vị trí lấy hàng (Dành cho Shipper)</h2>
              <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                <div className="mb-6">
                  <p className="text-sm text-stone-500 mb-4">Ghim vị trí chính xác của tiệm bánh để hệ thống AloShipp lấy hàng.</p>
                  <div className="h-64 w-full rounded-xl overflow-hidden border border-stone-200 z-0 relative">
                    <MapContainer center={[settings.storeLocation.lat, settings.storeLocation.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <LocationMarker 
                        position={settings.storeLocation} 
                        setPosition={(latlng) => setSettings({...settings, storeLocation: latlng})} 
                      />
                    </MapContainer>
                  </div>
                </div>

                <button type="submit" className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700">Lưu Tọa Độ</button>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* ===================== MODALS ===================== */}
      
      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setEditingProduct(null)}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-stone-900 mb-4">Sửa Sản Phẩm</h2>
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-500 uppercase">Tên bánh</label>
                <input name="name" type="text" defaultValue={editingProduct.name} required className="w-full px-4 py-2 mt-1 bg-stone-50 border rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase">Giá (VNĐ)</label>
                  <input name="price" type="number" defaultValue={editingProduct.price} required className="w-full px-4 py-2 mt-1 bg-stone-50 border rounded-lg" />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase">Bộ Lọc (Danh mục)</label>
                  <select name="category" defaultValue={editingProduct.category} required className="w-full px-4 py-2 mt-1 bg-stone-50 border rounded-lg">
                    {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-stone-500 uppercase">Mô tả</label>
                <input name="description" type="text" defaultValue={editingProduct.description} className="w-full px-4 py-2 mt-1 bg-stone-50 border rounded-lg" />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-500 uppercase">Ảnh mới (bỏ trống nếu giữ cũ)</label>
                <input name="imageFile" type="file" accept="image/*" className="w-full text-sm mt-1" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button type="button" onClick={() => setEditingProduct(null)} className="px-4 py-2 text-stone-600 font-bold bg-stone-100 rounded-lg hover:bg-stone-200">Huỷ</button>
                <button type="submit" className="px-4 py-2 text-white font-bold bg-brand-600 rounded-lg hover:bg-brand-700">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col p-6 max-h-[90vh]">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold">Chi Tiết Đơn Hàng</h2>
               <button onClick={() => setSelectedOrder(null)} className="p-1"><X/></button>
             </div>
             <div className="overflow-y-auto pr-2 space-y-4">
               {/* Same details logic as before */}
               <div className="bg-stone-50 p-4 rounded-xl">
                 <p><strong>Khách hàng:</strong> {selectedOrder.customerName} - {selectedOrder.customerPhone}</p>
                 <p><strong>Địa chỉ:</strong> {selectedOrder.deliveryAddress}</p>
                 <p><strong>Ghi chú:</strong> {selectedOrder.note || 'Không có'}</p>
               </div>
               <div className="border rounded-xl p-4">
                 {selectedOrder.items.map((i, idx) => (
                   <div key={idx} className="flex justify-between py-2 border-b last:border-0">
                     <span>{i.name} x{i.quantity}</span>
                     <span className="font-bold text-brand-600">{(i.price * i.quantity).toLocaleString('vi-VN')} ₫</span>
                   </div>
                 ))}
                 <div className="flex justify-between pt-3 mt-2 border-t font-bold">
                   <span>Tổng đơn</span>
                   <span className="text-brand-700">{selectedOrder.totalAmount.toLocaleString('vi-VN')} ₫</span>
                 </div>
               </div>
             </div>
             {selectedOrder.status === 'PENDING' && (
                <button onClick={() => { handleConfirmOrder(selectedOrder._id); setSelectedOrder(null); }} className="w-full mt-4 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700">Xác nhận & Giao</button>
             )}
          </div>
        </div>
      )}

    </div>
  );
}
