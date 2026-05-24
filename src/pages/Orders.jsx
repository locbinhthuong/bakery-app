import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, ChevronLeft, MapPin } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const BACKEND_URL = import.meta.env.DEV ? 'http://localhost:5001/api/shop' : 'https://bakery-backend-six.vercel.app/api/shop';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const savedCustomer = localStorage.getItem('bakery_customer');
        if (savedCustomer) {
          const cust = JSON.parse(savedCustomer);
          if (cust.phone) {
            const res = await axios.get(`${BACKEND_URL}/customer/orders/${cust.phone}`);
            setOrders(res.data.data);
          }
        }
      } catch (err) {
        console.error('Lỗi lấy đơn hàng:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    // Poll every 10s to get updates
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-40 border-b border-stone-100 flex items-center shadow-sm">
        <Link to="/" className="p-2 -ml-2 mr-2 text-stone-500 hover:text-stone-800 transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold text-stone-900 font-serif">Đơn hàng của tôi</h1>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center py-10 text-stone-400 font-medium">Đang tải đơn hàng...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-stone-100 shadow-sm">
            <Package size={48} className="mx-auto text-stone-300 mb-4" />
            <h3 className="text-lg font-bold text-stone-800 mb-2">Chưa có đơn hàng nào</h3>
            <p className="text-stone-500 text-sm mb-6">Bạn chưa đặt món nào. Hãy ghé xem Menu nhé!</p>
            <Link to="/" className="px-6 py-3 bg-brand-600 text-white font-bold rounded-xl shadow-md hover:bg-brand-700 transition-colors">
              Khám phá Menu
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
              <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-full ${order.status === 'PENDING' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                    {order.status === 'PENDING' ? <Clock size={16} /> : <CheckCircle size={16} />}
                  </div>
                  <div>
                    <div className="font-bold text-stone-800 text-sm">
                      {order.status === 'PENDING' ? 'Đang chờ xác nhận' : 'Đang giao / Hoàn thành'}
                    </div>
                    <div className="text-xs text-stone-500">{new Date(order.createdAt).toLocaleString('vi-VN')}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-brand-700 text-lg">{order.totalAmount.toLocaleString('vi-VN')} ₫</div>
                  {order.shippingFee > 0 && <div className="text-xs text-stone-500 font-medium">Tiền hàng: {order.subTotal.toLocaleString('vi-VN')}₫ | Phí ship: {order.shippingFee.toLocaleString('vi-VN')}₫</div>}
                </div>
              </div>
              
              <div className="p-4">
                <div className="mb-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-stone-50 last:border-0">
                      <span className="font-medium text-stone-700 text-sm">
                        <span className="text-brand-600 font-bold mr-2">{item.quantity}x</span> {item.name}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="bg-stone-50 rounded-xl p-3 flex gap-3 text-sm text-stone-600">
                  <MapPin size={18} className="text-stone-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-stone-800 mb-1">{order.customerName} - {order.customerPhone}</div>
                    <div className="line-clamp-2">{order.deliveryAddress}</div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
