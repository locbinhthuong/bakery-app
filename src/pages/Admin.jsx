import { useState, useEffect } from 'react';
import { Package, Users, Tag, ShoppingCart, LogOut, Plus, Edit2, Trash2, CheckCircle, CakeSlice, MapPin, Eye } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.DEV ? 'http://localhost:5001/api/shop' : 'https://bakery-backend-six.vercel.app/api/shop';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [promos, setPromos] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fetch data
  const fetchData = async () => {
    try {
      if (activeTab === 'orders') {
        const res = await axios.get(`${BACKEND_URL}/admin/orders`);
        setOrders(res.data.data);
      } else if (activeTab === 'products') {
        const res = await axios.get(`${BACKEND_URL}/admin/products`);
        setProducts(res.data.data);
      } else if (activeTab === 'promos') {
        const res = await axios.get(`${BACKEND_URL}/admin/promos`);
        setPromos(res.data.data);
      } else if (activeTab === 'customers') {
        const res = await axios.get(`${BACKEND_URL}/admin/customers`);
        setCustomers(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Auto refresh
    return () => clearInterval(interval);
  }, [activeTab]);

  // Actions
  const handleConfirmOrder = async (id) => {
    try {
      await axios.put(`${BACKEND_URL}/admin/orders/${id}/confirm`);
      fetchData();
      alert('Đã xác nhận và đẩy đơn sang AloShipp!');
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  // Upload ảnh lên Backend bằng Base64 (Hỗ trợ tốt nhất cho Vercel)
  const uploadImageFile = async (file) => {
    if (!file || file.size === 0) return null;
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64Image = reader.result;
          const res = await axios.post(`${BACKEND_URL}/admin/upload`, { image: base64Image });
          if (res.data.url.startsWith('http')) {
            resolve(res.data.url);
          } else {
            const baseUrl = BACKEND_URL.replace('/api/shop', '');
            resolve(baseUrl + res.data.url);
          }
        } catch (err) {
          console.error('Lỗi upload ảnh:', err);
          resolve(null);
        }
      };
      reader.onerror = () => {
        console.error('Lỗi đọc file ảnh');
        resolve(null);
      };
    });
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Chắc chắn xoá bánh này?')) return;
    try {
      await axios.delete(`${BACKEND_URL}/admin/products/${id}`);
      fetchData();
    } catch (err) {
      alert('Lỗi xoá bánh');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    
    // Upload ảnh trước
    const imageFile = fd.get('imageFile');
    let imageUrl = '';
    if (imageFile && imageFile.name) {
      imageUrl = await uploadImageFile(imageFile);
      if (!imageUrl) return alert('Lỗi tải ảnh lên máy chủ!');
    }

    const product = {
      name: fd.get('name'),
      price: Number(fd.get('price')),
      image: imageUrl,
      description: fd.get('description'),
      isActive: true
    };
    try {
      await axios.post(`${BACKEND_URL}/admin/products`, product);
      e.target.reset();
      fetchData();
    } catch (err) {
      alert('Lỗi thêm sản phẩm');
    }
  };

  const handleAddPromo = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);

    const imageFile = fd.get('imageFile');
    let imageUrl = '';
    if (imageFile && imageFile.name) {
      imageUrl = await uploadImageFile(imageFile);
    }

    const promo = {
      title: fd.get('title'),
      content: fd.get('content'),
      image: imageUrl,
      isActive: true
    };
    try {
      await axios.post(`${BACKEND_URL}/admin/promos`, promo);
      e.target.reset();
      fetchData();
    } catch (err) {
      alert('Lỗi thêm khuyến mãi');
    }
  };

  const handleDeletePromo = async (id) => {
    if (!window.confirm('Chắc chắn xoá bài đăng này?')) return;
    try {
      await axios.delete(`${BACKEND_URL}/admin/promos/${id}`);
      fetchData();
    } catch (err) {
      alert('Lỗi xoá');
    }
  };

  const menuItems = [
    { id: 'orders', icon: ShoppingCart, label: 'Đơn Hàng' },
    { id: 'products', icon: Package, label: 'Sản Phẩm' },
    { id: 'promos', icon: Tag, label: 'Khuyến Mãi' },
    { id: 'customers', icon: Users, label: 'Khách Hàng' },
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex font-sans text-stone-800">
      
      {/* Sidebar */}
      <div className="w-64 bg-[#23140c] text-stone-300 flex flex-col hidden md:flex shrink-0">
        <div className="p-6 mb-4 flex items-center gap-3 text-white">
          <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center">
            <CakeSlice size={20} className="text-white" />
          </div>
          <span className="text-xl font-serif font-bold tracking-wide">Le Petit</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
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
          <button className="w-full flex items-center gap-3 px-4 py-3 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors">
            <LogOut size={20} />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white px-4 md:px-8 py-4 md:py-6 flex justify-between items-center shadow-sm sticky top-0 z-10">
          <h1 className="text-xl md:text-2xl font-serif font-bold text-stone-900">
            {menuItems.find(i => i.id === activeTab)?.label}
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-200 flex items-center justify-center text-brand-900 font-bold">A</div>
            <span className="font-medium hidden md:block">Admin</span>
            <button onClick={() => { localStorage.removeItem('bakery_token'); window.location.href='/'; }} className="md:hidden ml-1 p-2 text-stone-500 hover:text-red-500 transition-colors bg-stone-50 rounded-full" title="Đăng xuất">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 md:p-8 pb-28 md:pb-8 max-w-6xl mx-auto">
          
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 gap-4">
                {orders.map(order => (
                  <div key={order._id} className="bg-white p-6 rounded-xl shadow-sm border border-stone-200/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
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
                      <p className="text-stone-600 mb-2"><MapPin size={16} className="inline mr-1 text-stone-400" /> {order.deliveryAddress}</p>
                      <div className="text-sm font-medium text-stone-500 mb-3 line-clamp-1">
                        {order.items.reduce((sum, i) => sum + i.quantity, 0)} sản phẩm: {order.items.map(i => i.name).join(', ')}
                      </div>
                      <button onClick={() => setSelectedOrder(order)} className="text-brand-600 hover:text-brand-800 text-sm font-bold flex items-center gap-1.5 bg-brand-50 px-3 py-1.5 rounded-lg w-fit transition-colors">
                        <Eye size={16} /> Xem chi tiết
                      </button>
                    </div>
                    <div className="flex flex-col items-end gap-3 w-full md:w-auto h-full justify-between">
                      <div className="text-xl font-bold text-stone-900">{order.totalAmount.toLocaleString('vi-VN')} ₫</div>
                      <div className="text-xs text-stone-400 whitespace-nowrap">{new Date(order.createdAt).toLocaleString('vi-VN')}</div>
                      {order.status === 'PENDING' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleConfirmOrder(order._id); }}
                          className="w-full md:w-auto px-4 py-1.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors shadow-sm text-sm"
                        >
                          Xác nhận & Giao
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {orders.length === 0 && <div className="text-center py-10 text-stone-400">Chưa có đơn hàng nào.</div>}
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200/60">
                <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2"><Plus size={20} className="text-brand-600" /> Thêm bánh mới</h3>
                <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="name" type="text" placeholder="Tên bánh" required className="px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-brand-500" />
                  <input name="price" type="number" placeholder="Giá tiền (VNĐ)" required className="px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-brand-500" />
                  <input name="imageFile" type="file" accept="image/*" required className="px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-brand-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-100 file:text-brand-700 hover:file:bg-brand-200 cursor-pointer" />
                  <input name="description" type="text" placeholder="Mô tả ngắn gọn" className="px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-brand-500" />
                  <button type="submit" className="md:col-span-2 py-3 bg-stone-900 text-white font-medium rounded-lg hover:bg-brand-900 transition-colors">Đăng sản phẩm</button>
                </form>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(p => (
                  <div key={p._id} className="bg-white p-4 rounded-xl shadow-sm border border-stone-200/60 flex flex-col gap-3 group">
                    <div className="w-full h-40 bg-white rounded-lg overflow-hidden relative flex items-center justify-center p-2 border border-stone-100">
                      {p.image ? <img src={p.image} className="w-full h-full object-contain" /> : null}
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-800">{p.name}</h4>
                      <div className="text-brand-600 font-medium">{p.price.toLocaleString('vi-VN')} ₫</div>
                    </div>
                    <div className="mt-auto flex gap-2">
                      <button onClick={() => handleDeleteProduct(p._id)} className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition flex justify-center items-center gap-2 text-sm"><Trash2 size={16}/> Xóa</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROMOS TAB */}
          {activeTab === 'promos' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200/60">
                <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2"><Tag size={20} className="text-brand-600" /> Đăng tin tức / Khuyến mãi</h3>
                <form onSubmit={handleAddPromo} className="space-y-4">
                  <input name="title" type="text" placeholder="Tiêu đề (VD: Tặng trà đào khi mua bánh)" required className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-brand-500" />
                  <textarea name="content" rows="3" placeholder="Nội dung khuyến mãi..." required className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-brand-500 resize-none"></textarea>
                  <input name="imageFile" type="file" accept="image/*" className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-brand-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-100 file:text-brand-700 hover:file:bg-brand-200 cursor-pointer" />
                  <button type="submit" className="w-full py-3 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors">Đăng lên trang chủ</button>
                </form>
              </div>

              <div className="space-y-4">
                {promos.map(promo => (
                  <div key={promo._id} className="bg-white p-6 rounded-xl shadow-sm border border-stone-200/60 flex gap-6 items-start">
                    {promo.image && <img src={promo.image} className="w-32 h-24 object-contain bg-stone-50 rounded-lg shrink-0 border border-stone-100" />}
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-stone-800">{promo.title}</h4>
                      <p className="text-stone-600 text-sm mt-1 mb-2">{promo.content}</p>
                      <span className="text-xs text-stone-400">Đăng lúc: {new Date(promo.createdAt).toLocaleString('vi-VN')}</span>
                    </div>
                    <button onClick={() => handleDeletePromo(promo._id)} className="p-2 text-stone-400 hover:text-red-500 transition-colors bg-stone-100 hover:bg-red-50 rounded-lg"><Trash2 size={20} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CUSTOMERS TAB */}
          {activeTab === 'customers' && (
            <div className="animate-in fade-in duration-500">
              <div className="bg-white rounded-xl shadow-sm border border-stone-200/60 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-stone-50 text-stone-600 font-medium border-b border-stone-200/60">
                    <tr>
                      <th className="px-6 py-4">Tên khách hàng</th>
                      <th className="px-6 py-4">Số điện thoại</th>
                      <th className="px-6 py-4">Tổng số đơn</th>
                      <th className="px-6 py-4 text-right">Tổng chi tiêu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {customers.map(c => (
                      <tr key={c._id} className="hover:bg-stone-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-stone-800">{c.name}</td>
                        <td className="px-6 py-4 text-stone-600">{c.phone}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-3 py-1 bg-brand-100 text-brand-800 rounded-full font-bold text-xs">{c.totalOrders}</span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-brand-700">{c.totalSpent.toLocaleString('vi-VN')} ₫</td>
                      </tr>
                    ))}
                    {customers.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-stone-400">Chưa có dữ liệu khách hàng.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <div>
                <h2 className="text-xl font-serif font-bold text-stone-900">Chi Tiết Đơn Hàng</h2>
                <div className="text-sm text-stone-500 mt-1">Mã đơn: <span className="font-mono">{selectedOrder._id}</span></div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="px-4 py-2 text-sm font-medium text-stone-500 hover:text-stone-900 bg-white hover:bg-stone-100 rounded-lg shadow-sm border border-stone-200 transition-colors">Đóng</button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                  <span className="text-stone-500 block mb-1 font-medium uppercase tracking-wider text-[11px]">Khách hàng</span>
                  <div className="font-bold text-stone-800 text-base">{selectedOrder.customerName}</div>
                  <div className="text-brand-700 font-medium flex items-center gap-1 mt-1">{selectedOrder.customerPhone}</div>
                </div>
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                  <span className="text-stone-500 block mb-1 font-medium uppercase tracking-wider text-[11px]">Trạng thái</span>
                  <div className="mt-1">
                    {selectedOrder.status === 'PENDING' ? (
                      <span className="inline-flex px-3 py-1.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">Chờ Xác Nhận</span>
                    ) : (
                      <span className="inline-flex px-3 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-full items-center gap-1"><CheckCircle size={14}/> Đã đẩy sang AloShipp</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-stone-50 p-4 rounded-xl text-sm border border-stone-100">
                <span className="text-stone-500 block mb-2 font-medium uppercase tracking-wider text-[11px]">Địa chỉ giao hàng</span>
                <div className="font-medium text-stone-800 flex items-start gap-2">
                  <MapPin size={18} className="text-brand-600 mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{selectedOrder.deliveryAddress}</span>
                </div>
                {selectedOrder.note && (
                  <div className="mt-3 text-brand-800 bg-brand-50 p-3 rounded-lg border border-brand-100">
                    <span className="font-bold text-brand-900 uppercase tracking-wide mr-1">Ghi chú:</span> 
                    {selectedOrder.note}
                  </div>
                )}
              </div>

              {/* Items */}
              <div>
                <h3 className="font-bold text-stone-800 mb-3 text-sm uppercase tracking-wider">Chi tiết món</h3>
                <div className="border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-stone-50 text-stone-600 border-b border-stone-200">
                      <tr>
                        <th className="px-4 py-3 font-medium">Tên bánh</th>
                        <th className="px-4 py-3 font-medium text-center">SL</th>
                        <th className="px-4 py-3 font-medium text-right">Đơn giá</th>
                        <th className="px-4 py-3 font-medium text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 bg-white">
                      {selectedOrder.items.map((i, idx) => (
                        <tr key={idx} className="hover:bg-stone-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-stone-800">{i.name}</td>
                          <td className="px-4 py-3 text-center text-stone-600 font-medium">x{i.quantity}</td>
                          <td className="px-4 py-3 text-right text-stone-600">{i.price.toLocaleString('vi-VN')} ₫</td>
                          <td className="px-4 py-3 text-right font-bold text-brand-700">{(i.price * i.quantity).toLocaleString('vi-VN')} ₫</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="bg-stone-50 p-4 flex justify-between items-center border-t border-stone-200">
                    <span className="font-bold text-stone-800 uppercase tracking-wide">Tổng cộng</span>
                    <span className="text-2xl font-bold text-brand-700">{selectedOrder.totalAmount.toLocaleString('vi-VN')} ₫</span>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-xs text-stone-400">
                Đơn hàng được tạo lúc {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-stone-100 bg-stone-50 flex justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setSelectedOrder(null)} className="px-6 py-2.5 bg-white text-stone-700 font-bold rounded-xl hover:bg-stone-100 border border-stone-200 shadow-sm transition-colors">Đóng lại</button>
              {selectedOrder.status === 'PENDING' && (
                <button 
                  onClick={() => {
                    handleConfirmOrder(selectedOrder._id);
                    setSelectedOrder(null);
                  }}
                  className="px-6 py-2.5 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <CheckCircle size={18} />
                  Xác nhận & Giao hàng
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation for Admin */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-stone-200 flex justify-around items-end pb-6 pt-3 px-2 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        {menuItems.map(item => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1.5 w-[20%] transition-colors ${activeTab === item.id ? 'text-brand-900' : 'text-stone-400 hover:text-brand-900'}`}
          >
            <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-wider line-clamp-1">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
