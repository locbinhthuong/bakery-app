import { useOutletContext } from 'react-router-dom';
import { Search, Plus, Info } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function Menu() {
  const { products, addToCart } = useOutletContext();
  const [activeTab, setActiveTab] = useState('');

  // Group products by category
  const categories = useMemo(() => {
    const groups = {};
    products.forEach(p => {
      const cat = p.category || 'Khác';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });
    return groups;
  }, [products]);

  const categoryNames = Object.keys(categories);
  if (categoryNames.length > 0 && !activeTab) {
    setActiveTab(categoryNames[0]);
  }

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
          <h1 className="text-2xl font-bold text-brand-900">Đặt hàng</h1>
          <button className="w-10 h-10 rounded-full bg-brand-200/50 flex items-center justify-center text-brand-900">
            <Search size={20} />
          </button>
        </div>
        
        {/* Category Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2" style={{ scrollbarWidth: 'none' }}>
          {categoryNames.map(cat => (
            <button 
              key={cat}
              onClick={() => scrollToCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-colors border ${activeTab === cat ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-brand-800 border-brand-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-orange-300 text-brand-900 px-4 py-3 text-sm font-medium flex items-start gap-2 shadow-sm mb-4 sticky top-[125px] z-20">
        <Info size={18} className="shrink-0 mt-0.5" />
        <span>Đã hết giờ nhận đơn, cửa hàng hẹn bạn 07:30 mỗi ngày để thưởng thức tiếp!</span>
      </div>

      {/* Product List */}
      <div className="px-4 space-y-8 mt-4">
        {categoryNames.map(cat => (
          <div key={cat} id={`cat-${cat}`} className="pt-2">
            <h2 className="text-xl font-bold text-brand-900 mb-4">{cat}</h2>
            
            <div className="space-y-3">
              {categories[cat].map(product => (
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
                      <h3 className="font-bold text-brand-900 text-base leading-snug line-clamp-2 mb-1">{product.name}</h3>
                      <p className="text-xs text-brand-600 line-clamp-1">{product.description}</p>
                    </div>
                    <div className="text-brand-600 font-bold text-sm">
                      {product.price.toLocaleString('vi-VN')}
                    </div>
                  </div>

                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
                    className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center hover:bg-brand-500 hover:text-white transition-colors"
                  >
                    <Plus size={18} strokeWidth={2.5}/>
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
