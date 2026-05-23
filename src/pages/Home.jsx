import { useOutletContext, Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight, CakeSlice, ArrowRight, Gift, Plus } from 'lucide-react';

export default function Home() {
  const { products, promos, addToCart, customer } = useOutletContext();

  return (
    <>
      {/* Compact App Header / Banner */}
      <header className="relative pt-24 md:pt-32 pb-6 md:pb-12 px-4 md:px-12 max-w-7xl mx-auto">
        <div className="w-full bg-brand-900 rounded-3xl overflow-hidden relative flex items-center justify-between p-6 md:p-16 shadow-lg border border-brand-800">
          <div className="relative z-10 max-w-lg">
            <span className="inline-block px-3 py-1 bg-white/20 text-white rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider mb-3 md:mb-4 backdrop-blur-md">
              {customer ? `Chào ${customer.name},` : 'Chào bạn,'}
            </span>
            <h1 className="text-2xl md:text-5xl font-serif text-white leading-tight mb-2 md:mb-4">
              Bánh mới ra lò,<br />thơm ngon mỗi ngày.
            </h1>
            <p className="text-brand-100 mb-4 md:mb-8 text-xs md:text-base opacity-90 line-clamp-2 md:line-clamp-none">
              Mẻ bánh nóng hổi vừa ra lò đã sẵn sàng. Đặt ngay để thưởng thức hương vị đặc sản tinh hoa.
            </p>
            <Link 
              to="/menu"
              className="inline-block px-5 py-2.5 md:px-8 md:py-4 bg-white text-brand-900 font-bold text-sm md:text-base rounded-xl shadow-[0_4px_14px_0_rgba(255,255,255,0.39)] hover:scale-105 transition-transform"
            >
              Xem thực đơn ngay
            </Link>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-2/3 md:w-1/2 opacity-30 md:opacity-50 bg-[url('https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay [mask-image:linear-gradient(to_right,transparent,black)] md:[mask-image:linear-gradient(to_right,transparent_20%,black)]"></div>
        </div>
      </header>

      {/* Products Section */}
      <section id="san-pham" className="py-6 md:py-16 max-w-7xl mx-auto px-4 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-16 gap-4 md:gap-6">
          <div>
            <span className="text-brand-600 font-semibold tracking-[0.2em] uppercase text-xs mb-2 md:mb-3 block">Thực đơn hôm nay</span>
            <h2 className="text-3xl md:text-5xl font-serif text-brand-900">Các Dòng Bánh Nổi Bật</h2>
          </div>
          <Link to="/menu" className="text-stone-500 hover:text-brand-900 font-medium flex items-center gap-2 transition-colors text-sm md:text-base">
            Xem tất cả <ChevronRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-16">
          {products.slice(0, 4).map((product) => (
            <div key={product._id} className="group flex flex-col items-start cursor-pointer w-full">
              <div className="w-full aspect-square md:aspect-[4/5] bg-stone-100 rounded-2xl mb-4 md:mb-6 overflow-hidden relative shadow-sm">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-contain p-4 transition-transform duration-700 ease-out-expo group-hover:scale-105 bg-white" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300">
                    <CakeSlice size={48} strokeWidth={1} />
                  </div>
                )}
                {/* Desktop hover cart button */}
                <div className="hidden md:flex absolute inset-0 bg-stone-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-end p-4">
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
                    className="w-full bg-white/95 backdrop-blur py-4 text-brand-900 font-medium tracking-wide rounded-xl flex items-center justify-center gap-2 hover:bg-brand-900 hover:text-white transition-colors translate-y-4 group-hover:translate-y-0 duration-500 ease-out-expo shadow-lg"
                  >
                    <ShoppingBag size={18} /> Thêm vào giỏ
                  </button>
                </div>
              </div>
              <h3 className="text-base md:text-xl font-serif font-medium text-stone-900 mb-1 md:mb-2 group-hover:text-brand-700 transition-colors line-clamp-1 md:line-clamp-none">{product.name}</h3>
              <p className="hidden md:block text-stone-500 line-clamp-2 leading-relaxed mb-4">{product.description}</p>
              <div className="text-sm md:text-lg font-medium text-brand-800 mb-3 md:mb-0 md:mt-auto">{product.price.toLocaleString('vi-VN')} ₫</div>
              
              {/* Mobile Add to cart button */}
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
                className="md:hidden mt-auto w-full py-2.5 bg-brand-50 text-brand-800 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 active:bg-brand-100 transition-colors"
              >
                <Plus size={16} /> Thêm
              </button>
            </div>
          ))}
          
          {products.length === 0 && (
            <div className="col-span-full py-20 text-center text-stone-400">
              <CakeSlice size={48} strokeWidth={1} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">Hiện chưa có mẻ bánh nào ra lò.</p>
            </div>
          )}
        </div>
      </section>

      {/* Promos Section */}
      {promos.length > 0 && (
        <section id="tin-tuc" className="py-16 md:py-32 bg-stone-100/50">
          <div className="max-w-7xl mx-auto px-4 md:px-12">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-16 gap-4 md:gap-6">
              <div>
                <span className="text-brand-600 font-semibold tracking-[0.2em] uppercase text-xs mb-2 md:mb-3 block">Tin tức & Sự kiện</span>
                <h2 className="text-3xl md:text-5xl font-serif text-brand-900">Bản Tin Le Petit</h2>
              </div>
            </div>
            
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-10 pb-6 -mx-4 px-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible md:snap-none md:pb-0 md:mx-0 md:px-0" style={{ scrollbarWidth: 'none' }}>
              {promos.map(promo => (
                <div key={promo._id} className="group cursor-pointer min-w-[85vw] sm:min-w-[60vw] md:min-w-0 snap-center">
                  <div className="w-full aspect-[4/3] md:aspect-video bg-stone-200 rounded-2xl overflow-hidden mb-4 md:mb-6 shadow-sm">
                    {promo.image ? (
                      <img src={promo.image} className="w-full h-full object-cover bg-white transition-transform duration-700 ease-out-expo group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-brand-900/5 flex items-center justify-center text-brand-900 font-serif">Le Petit News</div>
                    )}
                  </div>
                  <h3 className="text-xl md:text-2xl font-serif font-medium text-stone-900 mb-2 md:mb-3 group-hover:text-brand-700 transition-colors line-clamp-2">{promo.title}</h3>
                  <p className="text-sm md:text-base text-stone-600 line-clamp-2 md:line-clamp-3 leading-relaxed mb-4">{promo.content}</p>
                  {promo.code ? (
                    <button 
                      onClick={() => { navigator.clipboard.writeText(promo.code); alert('Đã copy mã: ' + promo.code); }}
                      className="mt-2 w-fit bg-brand-100 text-brand-800 border border-brand-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-brand-200 transition-colors"
                    >
                      <Gift size={16} /> Nhận mã: {promo.code}
                    </button>
                  ) : (
                    <span className="text-xs md:text-sm font-bold text-brand-600 uppercase tracking-widest flex items-center gap-2">Đọc tiếp <ArrowRight size={16} /></span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
