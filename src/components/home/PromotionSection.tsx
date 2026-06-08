import { Link } from 'react-router-dom';
import { Zap, Tag } from 'lucide-react';
import type { PromotedProduct } from '../../services/api';
import { readDisplaySetting } from '../../utils/displaySettings';

// Palette màu xoay vòng cho từng promotion
const GRADIENTS = [
  'from-red-600 to-orange-500',
  'from-violet-700 via-purple-600 to-fuchsia-600',
  'from-blue-700 to-cyan-500',
  'from-emerald-600 to-teal-500',
  'from-rose-600 to-pink-500',
  'from-amber-500 to-yellow-400',
];

const SHADOW_COLORS = [
  'shadow-red-200',
  'shadow-purple-200',
  'shadow-blue-200',
  'shadow-emerald-200',
  'shadow-rose-200',
  'shadow-amber-200',
];

const BADGE_COLORS = [
  'text-yellow-900 bg-yellow-400',
  'text-purple-900 bg-yellow-400',
  'text-blue-900 bg-yellow-300',
  'text-emerald-900 bg-lime-300',
  'text-rose-900 bg-pink-200',
  'text-amber-900 bg-white',
];

const PRICE_COLORS = [
  'text-yellow-300',
  'text-yellow-300',
  'text-cyan-200',
  'text-lime-300',
  'text-pink-200',
  'text-amber-900',
];

interface Props {
  promotionId: number;
  promotionName: string;
  products: PromotedProduct[];
  /** Chỉ số thứ tự để chọn màu (0, 1, 2...) */
  index?: number;
}

export const PromotionSection = ({ promotionId, promotionName, products, index = 0 }: Props) => {
  if (products.length === 0) return null;

  const promoCols = readDisplaySetting('promo_cols');
  const promoRows = readDisplaySetting('promo_rows');
  const promoMax  = promoCols * promoRows;

  const colorIdx = index % GRADIENTS.length;
  const gradient = GRADIENTS[colorIdx];
  const shadow   = SHADOW_COLORS[colorIdx];
  const badge    = BADGE_COLORS[colorIdx];
  const priceClr = PRICE_COLORS[colorIdx];

  return (
    <div className={`bg-gradient-to-r ${gradient} rounded-3xl p-6 mb-8 shadow-xl ${shadow} relative overflow-hidden`}>
      {/* Decorative */}
      <Zap size={180} className="absolute -top-10 -right-10 text-white opacity-10 pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-52 h-52 bg-white/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h2 className="text-2xl font-black text-white uppercase italic flex items-center gap-2 drop-shadow">
          <Zap className="animate-pulse text-yellow-300 flex-shrink-0" fill="currentColor" size={22} />
          {promotionName}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-white/70 text-xs font-semibold hidden sm:block">
            {products.length} sản phẩm
          </span>
          <Link
            to={`/promotions/${promotionId}`}
            className="text-white text-xs font-black uppercase bg-white/20 px-5 py-2 rounded-full backdrop-blur-md hover:bg-white/30 transition-all border border-white/20 whitespace-nowrap"
          >
            Xem tất cả
          </Link>
        </div>
      </div>

      {/* Product grid */}
      <div className={`grid grid-cols-2 ${
        promoCols === 3 ? 'md:grid-cols-3' :
        promoCols === 4 ? 'md:grid-cols-4' :
        promoCols === 5 ? 'md:grid-cols-5' :
        promoCols === 6 ? 'md:grid-cols-6' : 'md:grid-cols-5'
      } gap-4 relative z-10`}>
        {products.slice(0, promoMax).map(p => {
          const firstVariant = p.variants?.[0];
          const firstColor   = firstVariant?.variantColors?.[0];
          const image        = firstColor?.imageUrl || firstVariant?.thumbnailUrl || '';

          const discountLabel = p.discountType === 'FIXED'
            ? `-${(p.fixedDiscountAmount ?? 0).toLocaleString('vi-VN')}đ`
            : `-${p.discountPercentage ?? 0}%`;

          return (
            <Link
              key={p.id}
              to={`/product/${p.id}`}
              className="group bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20
                         hover:bg-white/20 hover:border-white/40 hover:shadow-xl hover:-translate-y-1
                         transition-all duration-300 flex flex-col"
            >
              {/* Ảnh + Badge */}
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
                    <div className="w-full h-full flex items-center justify-center text-white/40 text-4xl">
                      <Tag size={32} />
                    </div>
                  )}
                </div>
                <span className={`absolute top-1.5 right-1.5 ${badge} text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm`}>
                  {discountLabel}
                </span>
              </div>

              {/* Tên & Hãng */}
              <div className="flex-1">
                <p className="text-white text-xs font-bold line-clamp-2 leading-snug group-hover:text-yellow-200 transition-colors">
                  {p.name}
                </p>
                <p className="text-white/60 text-[10px] mt-0.5">{p.brand}</p>
              </div>

              {/* Giá */}
              <div className="mt-2">
                <p className={`${priceClr} font-black text-sm`}>
                  {p.promotionalPrice.toLocaleString('vi-VN')}đ
                </p>
                <p className="text-white/50 text-[10px] line-through">
                  {p.originalPrice.toLocaleString('vi-VN')}đ
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
