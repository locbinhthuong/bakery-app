import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, ChevronLeft, MapPin, Eye, X } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.DEV ? 'http://localhost:5001/api/shop' : import.meta.env.VITE_BACKEND_URL;

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    let socket;
    let currentOrders = [];

    const fetchOrders = async () => {
      try {
        const savedCustomer = localStorage.getItem('bakery_customer');
        if (savedCustomer) {
          const cust = JSON.parse(savedCustomer);
          if (cust.phone) {
            const res = await axios.get(`${BACKEND_URL}/customer/orders/${cust.phone}`);
            currentOrders = res.data.data;
            setOrders(currentOrders);
            
            // Nếu có đơn hàng, kết nối socket
            if (currentOrders.length > 0) {
              const orderIds = currentOrders.map(o => o._id).join(',');
              if (socket) socket.disconnect(); // Đóng kết nối cũ nếu có
              socket = io('https://api.aloshipp.com', {
                auth: { token: 'BAKERY_APP_GUEST' },
                query: { bakeryOrderId: orderIds }
              });

              socket.on('bakery_order_update', (updatedData) => {
                console.log('Socket update from AloShipp:', updatedData);
                fetchOrders();
              });

              // Quan trọng cho Mobile PWA: Khi Safari wake up từ background, socket sẽ reconnect.
              // Lúc này ta cần fetch lại để lấy dữ liệu có thể đã bị lỡ lúc app đang ngủ.
              socket.on('connect', () => {
                console.log('Socket reconnected, fetching latest orders...');
                fetchOrders();
              });
            }
          }
        }
      } catch (err) {
        console.error('Lỗi lấy đơn hàng:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 pb-20 md:pb-0 max-w-7xl mx-auto md:px-12 w-full">
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
                  <div className={`p-2 rounded-full ${order.status === 'PENDING' || order.status === 'CONFIRMED' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                    {order.status === 'PENDING' || order.status === 'CONFIRMED' ? <Clock size={16} /> : <CheckCircle size={16} />}
                  </div>
                  <div>
                    <div className="font-bold text-stone-800 text-sm">
                      {order.status === 'PENDING' && 'Đang chờ xác nhận từ quán'}
                      {order.status === 'CONFIRMED' && (order.deliveryMethod === 'PICKUP' ? 'Quán đã chuẩn bị xong, chờ bạn đến lấy' : 'Đang tìm tài xế...')}
                      {order.status === 'ACCEPTED' && 'Tài xế đang đến lấy'}
                      {order.status === 'PICKED_UP' && 'Tài xế đã lấy hàng'}
                      {order.status === 'DELIVERING' && 'Đang giao hàng'}
                      {order.status === 'COMPLETED' && 'Giao hàng thành công'}
                      {order.status === 'DELIVERED' && 'Giao hàng thành công'}
                      {order.status === 'CANCELLED' && 'Đã hủy'}
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
                
                <div className="bg-stone-50 rounded-xl p-3 flex gap-3 text-sm text-stone-600 mb-3">
                  <MapPin size={18} className="text-stone-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-stone-800 mb-1">{order.customerName} - {order.customerPhone} <span className={`ml-2 px-2 py-0.5 text-[10px] font-bold rounded ${order.deliveryMethod === 'PICKUP' ? 'bg-indigo-100 text-indigo-700' : 'bg-stone-200 text-stone-700'}`}>{order.deliveryMethod === 'PICKUP' ? 'ĐẾN LẤY' : 'GIAO TẬN NƠI'}</span></div>
                    <div className="line-clamp-2">{order.deliveryMethod === 'PICKUP' ? `Hẹn lấy tại quán lúc: ${new Date(order.pickupTime).toLocaleString('vi-VN', {hour:'2-digit', minute:'2-digit', day:'2-digit', month:'2-digit', year:'numeric'})}` : order.deliveryAddress}</div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setSelectedOrder(order)}
                  className="w-full py-2.5 bg-brand-50 text-brand-700 font-bold rounded-xl hover:bg-brand-100 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Eye size={16} /> Xem chi tiết đơn
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col p-6 max-h-[90vh]">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold font-serif">Chi Tiết Đơn Hàng</h2>
               <button onClick={() => setSelectedOrder(null)} className="p-1 text-stone-400 hover:bg-stone-100 rounded-full"><X size={20}/></button>
             </div>
             
             <div className="overflow-y-auto pr-1 space-y-4">
               <div className="bg-stone-50 p-4 rounded-xl text-sm text-stone-700 space-y-2 border border-stone-100">
                 <p><span className="font-bold text-stone-900">Hình thức:</span> {selectedOrder.deliveryMethod === 'PICKUP' ? 'Đến lấy tại quán' : 'Giao hàng tận nơi'}</p>
                 <p><span className="font-bold text-stone-900">Khách hàng:</span> {selectedOrder.customerName} - {selectedOrder.customerPhone}</p>
                 <p><span className="font-bold text-stone-900">{selectedOrder.deliveryMethod === 'PICKUP' ? 'Thời gian hẹn lấy:' : 'Địa chỉ giao:'}</span> {selectedOrder.deliveryMethod === 'PICKUP' ? new Date(selectedOrder.pickupTime).toLocaleString('vi-VN', {hour:'2-digit', minute:'2-digit', day:'2-digit', month:'2-digit', year:'numeric'}) : selectedOrder.deliveryAddress}</p>
                 {selectedOrder.note && <p><span className="font-bold text-stone-900">Ghi chú:</span> {selectedOrder.note}</p>}
               </div>
               
               <div>
                 <h3 className="font-bold text-brand-900 mb-3 border-b border-stone-100 pb-2">Danh sách món ({selectedOrder.items.reduce((acc, i) => acc + i.quantity, 0)})</h3>
                 <div className="space-y-3">
                   {selectedOrder.items.map((i, idx) => (
                     <div key={idx} className="flex justify-between items-center text-sm">
                       <div>
                         <span className="font-bold text-brand-600 mr-2">{i.quantity}x</span>
                         <span className="font-medium text-stone-800">{i.name}</span>
                       </div>
                       <span className="font-bold text-stone-600">{(i.price * i.quantity).toLocaleString('vi-VN')} ₫</span>
                     </div>
                   ))}
                 </div>
               </div>

               <div className="bg-brand-50 p-4 rounded-xl mt-4">
                 <div className="flex justify-between text-sm mb-2 text-stone-600">
                   <span>Tạm tính</span>
                   <span>{selectedOrder.subTotal.toLocaleString('vi-VN')} ₫</span>
                 </div>
                 {selectedOrder.discountAmount > 0 && (
                   <div className="flex justify-between text-sm mb-2 text-green-600">
                     <span>Giảm giá ({selectedOrder.discountCode})</span>
                     <span>-{selectedOrder.discountAmount.toLocaleString('vi-VN')} ₫</span>
                   </div>
                 )}
                 {selectedOrder.shippingFee > 0 && (
                   <div className="flex justify-between text-sm mb-3 text-stone-600">
                     <span>Phí vận chuyển</span>
                     <span>+{selectedOrder.shippingFee.toLocaleString('vi-VN')} ₫</span>
                   </div>
                 )}
                 <div className="flex justify-between pt-3 border-t border-brand-200/50">
                   <span className="font-bold text-brand-900">Tổng cộng</span>
                   <span className="font-bold text-lg text-brand-700">{selectedOrder.totalAmount.toLocaleString('vi-VN')} ₫</span>
                 </div>
               </div>
             </div>
             
             <button onClick={() => setSelectedOrder(null)} className="w-full mt-6 py-3.5 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 shadow-md">Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}
