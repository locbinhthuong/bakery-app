import { useOutletContext } from 'react-router-dom';
import { ShoppingBag, CakeSlice, Plus, ChevronRight } from 'lucide-react';

export default function Menu() {
  const { products, addToCart } = useOutletContext();

  return (
    <div className="pt-32 pb-16">
      <section className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="mb-8 md:mb-16">
          <span className="text-brand-600 font-semibold tracking-[0.2em] uppercase text-xs mb-2 block">Thực đơn đầy đủ</span>
          <h1 className="text-3xl md:text-5xl font-serif text-brand-900">Tất cả Sản phẩm</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-16">
          {products.map((product) => (
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
                    onClick={(e) => { e.stopPropagation(); addToCart(product); }}
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
                onClick={(e) => { e.stopPropagation(); addToCart(product); }}
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
    </div>
  );
}
