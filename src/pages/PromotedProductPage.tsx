import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Zap, Tag, Search, SlidersHorizontal } from 'lucide-react';
import { fetchPromotedProducts, fetchPromotions } from '../services/api';
import type { PromotedProduct, Promotion } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { SearchPagination } from '../components/search/SearchPagination';
import { readDisplaySetting } from '../utils/displaySettings';

export const PromotedProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const promotionId = Number(id);

  const [allPromoted, setAllPromoted] = useState<PromotedProduct[]>([]);
  const [allPromotions, setAllPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'discount'>('default');
  
  const [page, setPage] = useState(1);
  const [cols, setCols] = useState(() => readDisplaySetting('promoted_page_cols'));
  const [rows, setRows] = useState(() => readDisplaySetting('promoted_page_rows'));

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [promoted, promotions] = await Promise.all([
          fetchPromotedProducts(),
          fetchPromotions(),
        ]);
        setAllPromoted(promoted);
        setAllPromotions(promotions);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const promotion = useMemo(
    () => allPromotions.find(p => p.id === promotionId),
    [allPromotions, promotionId]
  );

  const products = useMemo(
    () => allPromoted.filter(p => p.promotionId === promotionId),
    [allPromoted, promotionId]
  );

  const finalProducts = useMemo(() => {
    let result = products.filter(p =>
      !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand || '').toLowerCase().includes(search.toLowerCase())
    );
    if (sortBy === 'price-asc') result = [...result].sort((a, b) => a.promotionalPrice - b.promotionalPrice);
    if (sortBy === 'price-desc') result = [...result].sort((a, b) => b.promotionalPrice - a.promotionalPrice);
    if (sortBy === 'discount') {
      result = [...result].sort((a, b) => {
        const da = a.discountPercentage ?? 0;
        const db = b.discountPercentage ?? 0;
        return db - da;
      });
    }
    return result;
  }, [products, search, sortBy]);

  // Pagination client-side
  const pageSize = cols * rows;
  const totalPages = Math.ceil(finalProducts.length / pageSize);
  const paginatedProducts = finalProducts.slice((page - 1) * pageSize, page * pageSize);

  const gridClass = (
    cols === 2 ? 'grid-cols-2' :
    cols === 3 ? 'grid-cols-2 md:grid-cols-3' :
    cols === 4 ? 'grid-cols-2 md:grid-cols-4' :
    cols === 5 ? 'grid-cols-2 md:grid-cols-5' :
                 'grid-cols-2 md:grid-cols-6'
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-red-600" />
      </div>
    );
  }

  if (!promotion) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <Tag size={64} className="text-gray-300" />
        <p className="text-gray-500 font-semibold">Không tìm thấy chương trình khuyến mãi</p>
        <Link to="/" className="text-red-600 font-bold hover:underline">← Về trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4] pb-10">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-red-600 text-sm font-semibold mb-6 transition-colors">
            <ArrowLeft size={16} /> Về trang chủ
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap size={24} className="text-red-500" fill="currentColor" />
                <span className="text-red-500 text-sm font-bold uppercase tracking-wider">Khuyến mãi</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-800 uppercase italic leading-tight">
                {promotion.name}
              </h1>
              {promotion.description && (
                <p className="text-gray-500 mt-2 text-sm max-w-xl">{promotion.description}</p>
              )}
            </div>

            <div className="flex gap-4 flex-shrink-0">
              <div className="bg-gray-50 rounded-2xl px-5 py-3 text-center border border-gray-100">
                <p className="text-gray-500 text-xs font-semibold">Sản phẩm</p>
                <p className="text-gray-800 text-2xl font-black">{products.length}</p>
              </div>
              {promotion.discountPercentage && (
                <div className="bg-red-50 rounded-2xl px-5 py-3 text-center border border-red-100">
                  <p className="text-red-600 text-xs font-semibold">Giảm tới</p>
                  <p className="text-red-600 text-2xl font-black">{promotion.discountPercentage}%</p>
                </div>
              )}
              {promotion.fixedDiscountAmount && (
                <div className="bg-red-50 rounded-2xl px-5 py-3 text-center border border-red-100">
                  <p className="text-red-600 text-xs font-semibold">Giảm</p>
                  <p className="text-red-600 text-2xl font-black">{Number(promotion.fixedDiscountAmount).toLocaleString('vi-VN')}đ</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm sản phẩm trong khuyến mãi..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-gray-400" />
              <select
                value={sortBy}
                onChange={e => { setSortBy(e.target.value as any); setPage(1); }}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-red-500 bg-white font-medium"
              >
                <option value="default">Mặc định</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="discount">% Giảm nhiều nhất</option>
              </select>
            </div>
          </div>
        </div>

        {finalProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-200">
            <Tag size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">Không tìm thấy sản phẩm</p>
          </div>
        ) : (
          <>
            <div className={`grid ${gridClass} gap-5 mb-8`}>
              {paginatedProducts.map(p => {
                const firstVariant = p.variants?.[0];
                const firstColor = firstVariant?.variantColors?.[0];
                const image = firstColor?.imageUrl || firstVariant?.thumbnailUrl || '';
                const discountStr = p.discountType === 'FIXED'
                  ? `-${(p.fixedDiscountAmount ?? 0).toLocaleString('vi-VN')}đ`
                  : `-${p.discountPercentage ?? 0}%`;

                const mappedProduct = {
                  ...p,
                  price: p.promotionalPrice,
                  originalPrice: p.originalPrice,
                  discount: discountStr,
                  image: image,
                };

                return <ProductCard key={p.id} product={mappedProduct as any} />;
              })}
            </div>

            {totalPages > 1 && (
              <SearchPagination
                currentPage={page - 1}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};
