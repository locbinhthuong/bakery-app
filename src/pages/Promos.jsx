import { useOutletContext } from 'react-router-dom';
import { useState } from 'react';
import { Truck, Percent, Star } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.DEV ? 'http://localhost:5001/api/shop' : import.meta.env.VITE_BACKEND_URL;

export default function Promos() {
  const { promos, customer, updateCustomer } = useOutletContext();
  const [activeTab, setActiveTab] = useState('kha_dung');
  const [activeSubTab, setActiveSubTab] = useState('uu_dai');
  const [code, setCode] = useState('');

  const now = new Date();
  const activePromos = [];
  const inactivePromos = [];
  const pointPromos = [];

  const voucherPromos = promos.filter(p => p.postType === 'VOUCHER' || p.discountType !== 'NONE');

  voucherPromos.forEach(promo => {
    if (promo.pointsCost > 0) {
      pointPromos.push(promo);
      return;
    }

    let isInactive = false;
    if (promo.endDate && new Date(promo.endDate) < now) isInactive = true;
    if (promo.startDate && new Date(promo.startDate) > now) isInactive = true;
    if (promo.totalUsageLimit > 0 && promo.totalUsed >= promo.totalUsageLimit) isInactive = true;
    
    if (isInactive) inactivePromos.push(promo);
    else activePromos.push(promo);
  });

  return (
    <div className="pb-24 md:pb-12 bg-brand-50 md:bg-transparent min-h-screen max-w-7xl mx-auto md:px-12 w-full">
      {/* Header */}
      <div className="pt-12 pb-4 px-4 bg-white shadow-sm sticky top-0 z-20 md:static md:pt-0 md:bg-transparent md:border-none md:shadow-none md:mb-6 md:px-0">
        <h1 className="text-xl font-serif font-bold text-stone-900 text-center mb-6 md:hidden">Ưu đãi của bạn</h1>
        
        {/* Main Tabs */}
        <div className="flex border-b border-brand-200 md:max-w-md md:mx-auto">
          <button 
            onClick={() => setActiveTab('kha_dung')}
            className={`flex-1 pb-3 text-center font-bold text-sm transition-colors ${activeTab === 'kha_dung' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-brand-800'}`}
          >
            Khả dụng
          </button>
          <button 
            onClick={() => setActiveTab('khong_kha_dung')}
            className={`flex-1 pb-3 text-center font-bold text-sm transition-colors ${activeTab === 'khong_kha_dung' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-brand-800'}`}
          >
            Không khả dụng
          </button>
        </div>

        {/* Sub Tabs */}
        <div className="flex gap-4 mt-4 md:max-w-md md:mx-auto">
          <button 
            onClick={() => setActiveSubTab('uu_dai')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors border ${activeSubTab === 'uu_dai' ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-brand-800 border-brand-500'}`}
          >
            Ưu đãi
          </button>
          <button 
            onClick={() => setActiveSubTab('doi_diem')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors border ${activeSubTab === 'doi_diem' ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-stone-600 border-stone-200'}`}
          >
            Đổi điểm
          </button>
        </div>
      </div>

      <div className="px-4 md:px-0 mt-6">
        {/* Input Code */}
        <div className="flex gap-2 bg-brand-200/50 p-2 rounded-2xl mb-8 md:max-w-md md:mx-auto">
          <input 
            type="text" 
            placeholder="Nhập mã ưu đãi..."
            className="flex-1 bg-white px-4 py-3 rounded-xl outline-none text-brand-900 font-medium placeholder-brand-800/50"
            value={code}
            onChange={e => setCode(e.target.value)}
          />
          <button className="bg-brand-400 text-white font-bold px-6 rounded-xl hover:bg-brand-500 transition-colors">
            ĐỔI MÃ
          </button>
        </div>

        {/* Promos List */}
        <h2 className="text-lg font-serif font-bold text-stone-900 mb-4">{activeSubTab === 'doi_diem' ? 'Đổi điểm lấy quà' : 'Mã ưu đãi'}</h2>
        
        {activeSubTab === 'doi_diem' && (
          <div className="mb-4 bg-brand-100/50 p-4 rounded-xl border border-brand-200 flex justify-between items-center md:max-w-md md:mx-auto">
            <span className="font-bold text-stone-700">Điểm của bạn:</span>
            <span className="text-xl font-bold text-brand-600 flex items-center gap-1"><Star size={20}/> {customer?.points || 0}</span>
          </div>
        )}

        <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {(activeSubTab === 'doi_diem' ? pointPromos : (activeTab === 'kha_dung' ? activePromos : inactivePromos)).map(promo => {
            const isInactive = activeSubTab !== 'doi_diem' && activeTab === 'khong_kha_dung';
            let reason = '';
            if (isInactive) {
              const now = new Date();
              if (promo.endDate && new Date(promo.endDate) < now) reason = 'Đã hết hạn';
              else if (promo.startDate && new Date(promo.startDate) > now) reason = 'Chưa tới giờ';
              else if (promo.totalUsageLimit > 0 && promo.totalUsed >= promo.totalUsageLimit) reason = 'Đã hết lượt sử dụng';
            }

            return (
              <div key={promo._id} className={`flex rounded-2xl shadow-sm border overflow-hidden ${isInactive ? 'bg-stone-50 border-stone-200 grayscale-[0.8] opacity-80' : 'bg-white border-brand-100'}`}>
                <div className={`w-28 flex flex-col items-center justify-center shrink-0 border-r-2 border-dashed relative ${isInactive ? 'bg-stone-200 text-stone-500 border-stone-300' : 'bg-brand-300 text-brand-700 border-brand-100'}`}>
                  {/* Half circles for ticket effect */}
                  <div className={`absolute -top-2 -right-2 w-4 h-4 rounded-full ${isInactive ? 'bg-stone-50' : 'bg-brand-50'}`}></div>
                  <div className={`absolute -bottom-2 -right-2 w-4 h-4 rounded-full ${isInactive ? 'bg-stone-50' : 'bg-brand-50'}`}></div>
                  
                  {promo.discountAmount ? <Percent size={36} strokeWidth={1.5} /> : <Truck size={36} strokeWidth={1.5} />}
                  <span className="text-xs font-bold mt-1 uppercase text-center px-1">Giảm Giá</span>
                </div>
                <div className="flex-1 p-4">
                  <h3 className={`font-bold text-base mb-1 ${isInactive ? 'text-stone-600' : 'text-stone-900'}`}>{promo.title || 'Ưu đãi đặc biệt'}</h3>
                  <p className={`text-sm leading-snug line-clamp-2 mb-2 ${isInactive ? 'text-stone-500' : 'text-brand-800/80'}`}>
                    + {promo.content || 'Áp dụng cho mọi đơn hàng thỏa điều kiện.'}
                  </p>
                  
                  {/* Điều kiện bổ sung */}
                  <div className="text-[11px] text-stone-500 font-medium space-y-0.5 mb-3">
                    {promo.minOrderValue > 0 && <div>• Đơn tối thiểu: {promo.minOrderValue.toLocaleString('vi-VN')}đ</div>}
                    {promo.endDate && <div>• HSD: {new Date(promo.endDate).toLocaleString('vi-VN', {hour: '2-digit', minute:'2-digit', day:'2-digit', month:'2-digit'})}</div>}
                    {promo.totalUsageLimit > 0 && <div>• Còn lại: {Math.max(0, promo.totalUsageLimit - (promo.totalUsed || 0))} lượt</div>}
                    {promo.maxUsagePerUser > 0 && <div>• Tối đa {promo.maxUsagePerUser} lần/khách</div>}
                  </div>

                  {activeSubTab === 'doi_diem' ? (
                    <button 
                      onClick={async () => {
                        if (!customer) {
                          alert('Vui lòng đăng nhập để đổi quà!');
                          return;
                        }
                        if (customer.points < promo.pointsCost) {
                          alert('Bạn không đủ điểm!');
                          return;
                        }
                        if (customer.savedVouchers?.includes(promo._id)) {
                          alert('Bạn đã đổi mã này rồi!');
                          return;
                        }
                        if (window.confirm(`Xác nhận dùng ${promo.pointsCost} điểm để đổi mã này?`)) {
                          try {
                            const token = localStorage.getItem('bakery_token');
                            const res = await axios.post(`${BACKEND_URL}/customer/promos/redeem`, { promoId: promo._id }, {
                              headers: { Authorization: `Bearer ${token}` }
                            });
                            if (res.data.success) {
                              alert('Đổi mã thành công!');
                              updateCustomer(res.data.data);
                            }
                          } catch (err) {
                            alert(err.response?.data?.message || 'Lỗi đổi mã');
                          }
                        }
                      }}
                      disabled={customer?.savedVouchers?.includes(promo._id) || customer?.points < promo.pointsCost}
                      className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors mt-2 ${customer?.savedVouchers?.includes(promo._id) ? 'bg-stone-200 text-stone-500' : (customer?.points >= promo.pointsCost ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm' : 'bg-stone-100 text-stone-400')}`}
                    >
                      {customer?.savedVouchers?.includes(promo._id) ? 'ĐÃ ĐỔI' : `ĐỔI (${promo.pointsCost} ĐIỂM)`}
                    </button>
                  ) : (isInactive ? (
                    <span className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-md">
                      {reason}
                    </span>
                  ) : promo.code && (
                    <button 
                      onClick={() => { navigator.clipboard.writeText(promo.code); alert('Đã copy mã!'); }}
                      className="text-xs font-bold text-brand-600 bg-brand-100 px-3 py-1 rounded-md hover:bg-brand-200 transition-colors"
                    >
                      MÃ: {promo.code}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Hardcoded visual mockup for empty/default */}
          {activeSubTab === 'doi_diem' && pointPromos.length === 0 && (
            <div className="text-center py-10 text-stone-500 font-medium">Hiện không có quà nào để đổi bằng điểm.</div>
          )}
          {activeSubTab !== 'doi_diem' && activeTab === 'kha_dung' && activePromos.length === 0 && (
            <div className="text-center py-10 text-stone-500 font-medium">Hiện không có mã ưu đãi nào khả dụng.</div>
          )}
          {activeTab === 'khong_kha_dung' && inactivePromos.length === 0 && (
            <div className="text-center py-10 text-stone-500 font-medium">Bạn chưa bỏ lỡ mã ưu đãi nào.</div>
          )}
        </div>
      </div>
    </div>
  );
}
