import { Link } from 'react-router-dom';
import type { PromotedProduct } from '../../services/api';

// Badge giảm giá
const DiscountBadge = ({ p }: { p: PromotedProduct }) => (
    <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
        {p.discountType === 'FIXED'
            ? `-${(p.fixedDiscountAmount || 0).toLocaleString('vi-VN')}đ`
            : `-${p.discountPercentage || 0}%`}
    </span>
);

// Badge loại giảm
const TypeBadge = ({ p }: { p: PromotedProduct }) => (
    <span className={`inline-flex text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide
        ${p.discountType === 'FIXED' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
        {p.discountType === 'FIXED' ? '💰 Giảm cứng' : '📉 Giảm %'}
    </span>
);

export const PromotedProductCard = ({ p }: { p: PromotedProduct }) => {
    const firstVariant = p.variants?.[0];
    const firstColor = firstVariant?.variantColors?.[0];
    const image = firstColor?.imageUrl || firstVariant?.thumbnailUrl || '';
    const saving = p.originalPrice - p.promotionalPrice;

    return (
        <Link key={p.id} to={`/product/${p.id}`}
            className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
            {/* Ảnh */}
            <div className="relative bg-gray-50 aspect-square overflow-hidden">
                {image ? (
                    <img src={image} alt={p.name}
                        className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                        onError={e => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">📦</div>
                )}
                <DiscountBadge p={p} />
            </div>

            {/* Thông tin */}
            <div className="p-3 flex flex-col flex-1">
                <div className="mb-1.5">
                    <TypeBadge p={p} />
                </div>
                <p className="text-[11px] text-gray-400 font-medium mb-0.5">{p.brand}</p>
                <p className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug flex-1 group-hover:text-purple-700 transition-colors">
                    {p.name}
                </p>
                <div className="mt-2 pt-2 border-t border-gray-50">
                    <p className="text-base font-black text-red-600">
                        {p.promotionalPrice.toLocaleString('vi-VN')}đ
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-400 line-through">
                            {p.originalPrice.toLocaleString('vi-VN')}đ
                        </p>
                        {saving > 0 && (
                            <p className="text-[10px] text-green-600 font-bold">
                                -{saving.toLocaleString('vi-VN')}đ
                            </p>
                        )}
                    </div>
                </div>
                <div className="mt-2 bg-purple-50 rounded-lg px-2 py-1">
                    <p className="text-purple-600 text-[9px] font-semibold truncate">🎯 {p.promotionName}</p>
                </div>
            </div>
        </Link>
    );
};
