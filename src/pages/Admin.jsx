import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, ShoppingBag, Check, Plus } from 'lucide-react';

const BACKEND_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001/api/shop'}/admin`;

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'products'
  const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '', image: '' });

  const fetchData = async () => {
    try {
      const [ordRes, prodRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/orders`),
        axios.get(`${BACKEND_URL}/products`)
      ]);
      setOrders(ordRes.data.data);
      setProducts(prodRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Polling 10s for new orders
    return () => clearInterval(interval);
  }, []);

  const confirmOrder = async (id) => {
    try {
      await axios.post(`${BACKEND_URL}/orders/${id}/confirm`);
      alert('Đã xác nhận và đẩy đơn sang AloShipp!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi xác nhận đơn');
    }
  };

  const addProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BACKEND_URL}/products`, {
        ...newProduct,
        price: Number(newProduct.price)
      });
      setNewProduct({ name: '', price: '', description: '', image: '' });
      fetchData();
      alert('Đã thêm sản phẩm mới!');
    } catch (err) {
      alert('Lỗi thêm sản phẩm');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-stone-900 text-stone-300 flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-serif font-bold text-white tracking-tight">Le Petit Admin</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'orders' ? 'bg-brand-900 text-white' : 'hover:bg-stone-800 hover:text-white'}`}
          >
            <ShoppingBag size={18} /> Đơn đặt hàng
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'products' ? 'bg-brand-900 text-white' : 'hover:bg-stone-800 hover:text-white'}`}
          >
            <Package size={18} /> Menu Sản phẩm
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        {activeTab === 'orders' ? (
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-serif font-medium text-stone-800 mb-8">Quản lý Đơn hàng</h2>
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order._id} className="bg-white border border-stone-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-lg text-stone-900">{order.customerName}</span>
                      <span className="text-stone-500 font-medium">{order.customerPhone}</span>
                      {order.status === 'PENDING' && (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider rounded-md">Chờ xác nhận</span>
                      )}
                      {order.status === 'CONFIRMED' && (
                        <span className="px-2.5 py-1 bg-green-100 text-green-800 text-xs font-bold uppercase tracking-wider rounded-md">Đã chuyển AloShipp</span>
                      )}
                    </div>
                    <p className="text-stone-600">Giao đến: {order.deliveryAddress}</p>
                    <p className="text-sm text-stone-500 italic">{order.note && `Ghi chú: ${order.note}`}</p>
                    <div className="mt-4 pt-4 border-t border-stone-100">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-stone-700 text-sm">
                          {item.quantity}x {item.name}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-4 min-w-[200px]">
                    <div className="text-2xl font-serif font-medium text-brand-900">
                      {order.totalAmount.toLocaleString('vi-VN')} ₫
                    </div>
                    {order.status === 'PENDING' && (
                      <button 
                        onClick={() => confirmOrder(order._id)}
                        className="w-full px-6 py-3 bg-brand-900 hover:bg-stone-900 text-white rounded-xl font-medium tracking-wide transition-colors flex items-center justify-center gap-2"
                      >
                        <Check size={18} /> Xác nhận & Đẩy đơn
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {orders.length === 0 && <p className="text-stone-500">Chưa có đơn hàng nào.</p>}
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto flex gap-10 items-start">
            <div className="flex-1 space-y-4">
              <h2 className="text-3xl font-serif font-medium text-stone-800 mb-8">Menu Cửa hàng</h2>
              {products.map(prod => (
                <div key={prod._id} className="bg-white border border-stone-200 p-4 rounded-xl flex gap-4 items-center shadow-sm">
                  <div className="w-16 h-16 bg-stone-100 rounded-lg overflow-hidden shrink-0">
                    {prod.image ? <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" /> : null}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-stone-800">{prod.name}</h4>
                    <p className="text-sm text-stone-500 truncate">{prod.description}</p>
                  </div>
                  <div className="font-medium text-brand-700">{prod.price.toLocaleString('vi-VN')} ₫</div>
                </div>
              ))}
            </div>

            {/* Add product form */}
            <div className="w-80 bg-white p-6 rounded-2xl shadow-soft border border-stone-100 sticky top-10">
              <h3 className="font-serif font-medium text-xl text-stone-800 mb-6">Thêm Bánh Mới</h3>
              <form onSubmit={addProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Tên bánh</label>
                  <input type="text" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-200 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Giá (VNĐ)</label>
                  <input type="number" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-200 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Link Ảnh</label>
                  <input type="url" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-200 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Mô tả</label>
                  <textarea rows="3" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-200 outline-none resize-none"></textarea>
                </div>
                <button type="submit" className="w-full py-3 bg-stone-900 text-white rounded-lg font-medium tracking-wide flex items-center justify-center gap-2 hover:bg-brand-900 transition-colors">
                  <Plus size={18} /> Thêm vào Menu
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
