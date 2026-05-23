import { useOutletContext } from 'react-router-dom';
import { useState } from 'react';
import { Truck, Percent } from 'lucide-react';

export default function Promos() {
  const { promos } = useOutletContext();
  const [activeTab, setActiveTab] = useState('kha_dung');
  const [activeSubTab, setActiveSubTab] = useState('uu_dai');
  const [code, setCode] = useState('');

  return (
    <div className="pb-24 bg-brand-50 min-h-screen">
      {/* Header */}
      <div className="pt-12 pb-4 px-4 bg-white shadow-sm sticky top-0 z-20">
        <h1 className="text-xl font-serif font-bold text-stone-900 text-center mb-6">Ưu đãi của bạn</h1>
        
        {/* Main Tabs */}
        <div className="flex border-b border-brand-200">
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
        <div className="flex gap-4 mt-4">
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

      <div className="px-4 mt-6">
        {/* Input Code */}
        <div className="flex gap-2 bg-brand-200/50 p-2 rounded-2xl mb-8">
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
        <h2 className="text-lg font-serif font-bold text-stone-900 mb-4">Mã ưu đãi</h2>
        
        <div className="space-y-4">
          {promos.map(promo => (
            <div key={promo._id} className="flex bg-white rounded-2xl shadow-sm border border-brand-100 overflow-hidden">
              <div className="w-28 bg-brand-300 flex flex-col items-center justify-center text-brand-700 shrink-0 border-r-2 border-dashed border-brand-100 relative">
                {/* Half circles for ticket effect */}
                <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-brand-50"></div>
                <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-brand-50"></div>
                
                {promo.discountAmount ? <Percent size={36} strokeWidth={1.5} /> : <Truck size={36} strokeWidth={1.5} />}
                <span className="text-xs font-bold mt-1 uppercase text-center px-1">Giảm Giá</span>
              </div>
              <div className="flex-1 p-4">
                <h3 className="font-bold text-stone-900 text-base mb-1">{promo.title || 'Ưu đãi đặc biệt'}</h3>
                <p className="text-sm text-brand-800/80 leading-snug line-clamp-2 mb-2">
                  + {promo.content || 'Áp dụng cho mọi đơn hàng thỏa điều kiện.'}
                </p>
                {promo.code && (
                  <button 
                    onClick={() => { navigator.clipboard.writeText(promo.code); alert('Đã copy mã!'); }}
                    className="text-xs font-bold text-brand-600 bg-brand-100 px-3 py-1 rounded-md"
                  >
                    MÃ: {promo.code}
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Hardcoded visual mockup for empty/default */}
          {promos.length === 0 && (
            <div className="flex bg-white rounded-2xl shadow-sm border border-brand-100 overflow-hidden">
              <div className="w-28 bg-brand-300 flex flex-col items-center justify-center text-brand-700 shrink-0 border-r-2 border-dashed border-brand-100 relative">
                <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-brand-50"></div>
                <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-brand-50"></div>
                <Truck size={36} strokeWidth={1.5} />
              </div>
              <div className="flex-1 p-4">
                <h3 className="font-bold text-stone-900 text-base mb-1">Ưu đãi giao hàng</h3>
                <p className="text-sm text-brand-800/80 leading-snug line-clamp-2">
                  + Áp dụng cho phương thức Giao Tận Nơi tại toàn bộ cửa hàng Le Petit...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
