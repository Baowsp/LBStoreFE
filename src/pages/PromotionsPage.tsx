import { useState, useEffect, useMemo } from 'react';
import { Tag, Search, RotateCcw } from 'lucide-react';
import { fetchPromotedProducts } from '../services/api';
import type { PromotedProduct } from '../services/api';
import { PromotedProductCard } from '../components/product/PromotedProductCard';
import { PromotionsSidebar } from '../components/promotions/PromotionsSidebar';
import { PromotionsMobileFilter } from '../components/promotions/PromotionsMobileFilter';

const GRID_COLS: Record<number, string> = {
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
};

export const PromotionsPage = () => {
    const [all, setAll] = useState<PromotedProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set());
    const [typeFilter, setTypeFilter] = useState<'all' | 'PERCENT' | 'FIXED'>('all');
    const [cols, setCols] = useState(5);
    const [showFilters, setShowFilters] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetchPromotedProducts().then(data => {
            setAll(data);
            setLoading(false);
        });
    }, []);

    // Danh mục có trong kết quả (theo thứ tự xuất hiện)
    const availableCategories = useMemo(() => {
        const seen = new Set<string>();
        const cats: { slug: string; name: string; count: number }[] = [];
        const countMap: Record<string, number> = {};
        all.forEach(p => {
            if (p.categorySlug) {
                countMap[p.categorySlug] = (countMap[p.categorySlug] || 0) + 1;
                if (!seen.has(p.categorySlug)) {
                    seen.add(p.categorySlug);
                    cats.push({ slug: p.categorySlug, name: p.category || p.categorySlug, count: 0 });
                }
            }
        });
        return cats.map(c => ({ ...c, count: countMap[c.slug] || 0 }));
    }, [all]);

    // Toggle một danh mục
    const toggleCat = (slug: string) => {
        setSelectedCats(prev => {
            const s = new Set(prev);
            s.has(slug) ? s.delete(slug) : s.add(slug);
            return s;
        });
    };

    // Chọn tất cả / bỏ tất cả
    const selectAllCats = () => setSelectedCats(new Set(availableCategories.map(c => c.slug)));
    const clearCats = () => setSelectedCats(new Set());
    const isAllCats = selectedCats.size === 0;

    // Lọc sản phẩm
    const filtered = useMemo(() => {
        let r = all;
        if (selectedCats.size > 0) r = r.filter(p => p.categorySlug && selectedCats.has(p.categorySlug));
        if (typeFilter !== 'all') r = r.filter(p => p.discountType === typeFilter);
        if (search.trim()) {
            const q = search.toLowerCase();
            r = r.filter(p =>
                p.name.toLowerCase().includes(q) ||
                (p.brand || '').toLowerCase().includes(q)
            );
        }
        return r;
    }, [all, selectedCats, typeFilter, search]);

    const hasActiveFilter = selectedCats.size > 0 || typeFilter !== 'all' || search.trim().length > 0;
    const clearAll = () => { setSelectedCats(new Set()); setTypeFilter('all'); setSearch(''); };

    return (
        <div className="bg-[#f4f4f4] min-h-screen">
            {/* Hero */}
            <div className="bg-gradient-to-br from-violet-700 via-purple-600 to-fuchsia-600 py-10 px-4 relative overflow-hidden">
                <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="container mx-auto relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <Tag size={28} className="text-yellow-300" />
                        <h1 className="text-3xl font-black text-white uppercase italic tracking-tight">
                            Sản phẩm Khuyến mãi
                        </h1>
                    </div>
                    <p className="text-purple-200 text-sm">
                        {all.length} sản phẩm đang được giảm giá đặc biệt
                    </p>

                    {/* Search bar nằm trong hero */}
                    <div className="mt-5 max-w-xl flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-white/30">
                        <Search size={18} className="text-white/70 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Tìm sản phẩm, thương hiệu..."
                            className="bg-transparent outline-none text-sm w-full text-white placeholder-white/60 font-medium"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="text-white/60 hover:text-white transition">
                                <RotateCcw size={15} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                <div className="flex gap-6">
                    {/* ── Sidebar lọc danh mục ── */}
                    <PromotionsSidebar
                        availableCategories={availableCategories}
                        selectedCats={selectedCats}
                        toggleCat={toggleCat}
                        clearCats={clearCats}
                        selectAllCats={selectAllCats}
                        isAllCats={isAllCats}
                        typeFilter={typeFilter}
                        setTypeFilter={setTypeFilter}
                        cols={cols}
                        setCols={setCols}
                        loading={loading}
                    />

                    {/* ── Nội dung chính ── */}
                    <div className="flex-1 min-w-0">
                        {/* Mobile filter bar */}
                        <PromotionsMobileFilter
                            showFilters={showFilters}
                            setShowFilters={setShowFilters}
                            selectedCats={selectedCats}
                            availableCategories={availableCategories}
                            isAllCats={isAllCats}
                            clearCats={clearCats}
                            toggleCat={toggleCat}
                            typeFilter={typeFilter}
                            setTypeFilter={setTypeFilter}
                            cols={cols}
                            setCols={setCols}
                        />

                        {/* Thanh trạng thái */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm text-gray-500 font-medium">
                                    Hiển thị <span className="font-bold text-gray-800">{filtered.length}</span>
                                    {all.length !== filtered.length && (
                                        <span className="text-gray-400"> / {all.length}</span>
                                    )} sản phẩm
                                </p>
                                {/* Tags lọc đang active */}
                                {selectedCats.size > 0 && [...selectedCats].map(slug => {
                                    const cat = availableCategories.find(c => c.slug === slug);
                                    return (
                                        <span key={slug}
                                            className="flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                            {cat?.name || slug}
                                            <button onClick={() => toggleCat(slug)} className="hover:text-red-500">×</button>
                                        </span>
                                    );
                                })}
                                {typeFilter !== 'all' && (
                                    <span className="flex items-center gap-1 bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                        {typeFilter === 'FIXED' ? '💰 Giảm cứng' : '📉 Giảm %'}
                                        <button onClick={() => setTypeFilter('all')} className="hover:text-red-900">×</button>
                                    </span>
                                )}
                            </div>
                            {hasActiveFilter && (
                                <button onClick={clearAll}
                                    className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 flex-shrink-0">
                                    <RotateCcw size={12} /> Xóa bộ lọc
                                </button>
                            )}
                        </div>

                        {/* Grid sản phẩm */}
                        {loading ? (
                            <div className="flex items-center justify-center py-32">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-600" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
                                <Tag size={48} className="mx-auto text-gray-200 mb-4" />
                                <p className="text-gray-500 font-medium">Không có sản phẩm khuyến mãi phù hợp</p>
                                <p className="text-xs text-gray-400 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                                {hasActiveFilter && (
                                    <button onClick={clearAll}
                                        className="mt-3 text-xs text-purple-600 font-bold hover:underline">
                                        Xóa tất cả bộ lọc
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className={`grid ${GRID_COLS[cols] || GRID_COLS[5]} gap-4`}>
                                {filtered.map(p => (
                                    <PromotedProductCard key={p.id} p={p} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
