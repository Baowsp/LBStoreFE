import { Link } from 'react-router-dom';
import type { PromotedProduct } from '../../services/api';

interface Props {
  promotedProducts: PromotedProduct[];
}

export const PromotedProductsSection = ({ promotedProducts }: Props) => {
  if (promotedProducts.length === 0) return null;

  return (
    <div className="mb-12 relative overflow-hidden">
      <div className="bg-gradient-to-br from-violet-700 via-purple-600 to-fuchsia-600 rounded-3xl p-6 shadow-2xl shadow-purple-200 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-4 right-24 w-20 h-20 bg-yellow-400/20 rounded-full blur-xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <span className="text-xl">🎁</span>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">
                Sản phẩm Khuyến mãi
              </h2>
              <p className="text-purple-200 text-xs font-medium mt-0.5">
                {promotedProducts.length} sản phẩm đang được giảm giá đặc biệt
              </p>
            </div>
          </div>
          <Link
            to="/promotions"
            className="text-white text-xs font-black uppercase bg-white/20 px-5 py-2 rounded-full backdrop-blur-md hover:bg-white/30 transition-all border border-white/20"
          >
            Xem tất cả
          </Link>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 relative z-10">
          {promotedProducts.slice(0, 10).map(p => {
            const firstVariant = p.variants?.[0];
            const firstColor = firstVariant?.variantColors?.[0];
            const image = firstColor?.imageUrl || firstVariant?.thumbnailUrl || '';

            return (
              <Link
                key={p.id}
                to={`/product/${p.id}`}
                className="group bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20 hover:bg-white/20 hover:border-white/40 hover:shadow-xl hover:shadow-purple-900/30 hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* Ảnh + Badge giảm giá */}
                <div className="relative mb-3">
                  <div className="aspect-square rounded-xl overflow-hidden bg-white/10">
                    {image ? (
                      <img
                        src={image}
                        alt={p.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 p-1"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/40 text-4xl">📦</div>
                    )}
                  </div>
                  <span className="absolute top-1.5 right-1.5 bg-yellow-400 text-yellow-900 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                    -{p.discountPercentage}%
                  </span>
                </div>

                {/* Tên & Hãng */}
                <div className="flex-1">
                  <p className="text-white text-xs font-bold line-clamp-2 leading-snug group-hover:text-yellow-200 transition-colors">
                    {p.name}
                  </p>
                  <p className="text-purple-300 text-[10px] mt-0.5">{p.brand}</p>
                </div>

                {/* Giá */}
                <div className="mt-2">
                  <p className="text-yellow-300 font-black text-sm">
                    {p.promotionalPrice.toLocaleString('vi-VN')}đ
                  </p>
                  <p className="text-white/50 text-[10px] line-through">
                    {p.originalPrice.toLocaleString('vi-VN')}đ
                  </p>
                </div>

                {/* Tên chương trình */}
                <div className="mt-2 bg-white/10 rounded-lg px-2 py-1">
                  <p className="text-purple-200 text-[9px] font-semibold truncate">🎯 {p.promotionName}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
