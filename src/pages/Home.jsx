import { useOutletContext, Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight, CakeSlice, Bell, Ticket } from 'lucide-react';

export default function Home() {
  const { products, addToCart, customer, promos } = useOutletContext();

  // Get products marked as best sellers
  const bestSellers = products.filter(p => p.isBestSeller);
  
  // Get news and ads
  const newsPromos = (promos || []).filter(p => p.postType !== 'VOUCHER');

  return (
    <div className="pb-20">
      {/* Top Header Section */}
      <div className="pt-10 px-4 pb-4">
        <h1 className="text-2xl font-serif font-bold text-stone-900 text-center tracking-wide">
          Le Petit Bakery
        </h1>
      </div>

      {/* Dynamic News & Ads Slider */}
      <div className="px-4 mb-4">
        {newsPromos.length > 0 ? (
          <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory pb-2" style={{ scrollbarWidth: 'none' }}>
            {newsPromos.map(promo => (
              <div key={promo._id} className="min-w-full w-full aspect-[4/3] rounded-2xl overflow-hidden relative shadow-md snap-center shrink-0">
                {promo.image ? (
                  <img src={promo.image} alt={promo.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-brand-800 flex items-center justify-center">
                    <CakeSlice size={48} className="text-brand-200" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                  {promo.postType === 'ADS' && <span className="text-[10px] font-bold bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full w-max mb-2 uppercase">Quảng Cáo</span>}
                  {promo.postType === 'EVENT' && <span className="text-[10px] font-bold bg-purple-500 text-white px-2 py-0.5 rounded-full w-max mb-2 uppercase">Sự Kiện</span>}
                  {promo.postType === 'NEWS' && <span className="text-[10px] font-bold bg-blue-500 text-white px-2 py-0.5 rounded-full w-max mb-2 uppercase">Tin Tức</span>}
                  <h2 className="text-white font-serif text-2xl font-bold mb-1 leading-tight">{promo.title}</h2>
                  <p className="text-stone-200 text-sm font-medium line-clamp-2">{promo.content}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden relative shadow-md">
            <img src="https://images.unsplash.com/photo-1517433670267-08bbd4be890f?q=80&w=2000&auto=format&fit=crop" alt="Banner" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-900/60 to-transparent flex flex-col justify-end p-6">
              <h2 className="text-white font-serif text-3xl font-bold mb-1">Sweet Bakery</h2>
              <p className="text-brand-50 text-sm font-medium">Bánh tươi mỗi ngày</p>
            </div>
          </div>
        )}
      </div>

      {/* Delivery Info Box */}
      <div className="px-4 mb-8">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-brand-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600 shrink-0">
            <img src="https://cdn-icons-png.flaticon.com/512/3063/3063822.png" alt="Delivery" className="w-8 h-8 opacity-70" style={{filter: 'sepia(1) hue-rotate(330deg) saturate(3)'}} />
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="font-bold text-brand-900 flex items-center gap-1">
              Giao hàng tận nơi <ChevronRight size={14} className="text-brand-400"/>
            </div>
            <div className="text-brand-800/70 text-xs truncate mt-0.5">
              Cửa hàng chính, 289 Đinh Bộ Lĩnh, Bình Thạnh...
            </div>
          </div>
        </div>
      </div>

      {/* Best Sellers Section */}
      <div className="pl-4 mb-8">
        <h3 className="text-xl font-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
          Sản phẩm nổi bật
        </h3>
        
        <div className="flex overflow-x-auto gap-4 pb-4 pr-4 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
          {bestSellers.map(product => (
            <div key={product._id} className="min-w-[160px] max-w-[160px] snap-start">
              <div className="w-full aspect-[4/5] bg-white rounded-2xl mb-3 overflow-hidden relative shadow-sm border border-brand-100/50">
                <div className="absolute top-2 left-0 bg-brand-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-r-md z-10 pointer-events-none">MỚI</div>
                {(product.images && product.images.length > 0) ? (
                  <div className="flex overflow-x-auto snap-x snap-mandatory h-full w-full scroll-smooth" style={{ scrollbarWidth: 'none' }}>
                    {product.images.map((img, i) => (
                      <img key={i} src={img} alt={`${product.name} ${i}`} className="w-full h-full object-cover shrink-0 snap-center" />
                    ))}
                  </div>
                ) : product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-300 bg-brand-50">
                    <CakeSlice size={32} />
                  </div>
                )}
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
                  className="absolute bottom-2 right-2 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-brand-600 shadow-md hover:bg-brand-600 hover:text-white transition-colors"
                >
                  <ShoppingBag size={14} strokeWidth={2.5}/>
                </button>
              </div>
              <h4 className="font-bold text-stone-900 text-sm leading-snug mb-1 line-clamp-2">{product.name}</h4>
              <div className="text-brand-600 font-bold text-sm">{product.price.toLocaleString('vi-VN')} ₫</div>
            </div>
          ))}
          {bestSellers.length === 0 && (
             <div className="text-sm text-brand-800">Chưa có món nào.</div>
          )}
        </div>
      </div>
    </div>
  );
}
