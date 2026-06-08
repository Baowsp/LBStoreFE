import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Tag, Search, RotateCcw, SlidersHorizontal,
    Smartphone, Laptop, Headphones, Speaker, Camera, Watch, Package, Battery, Tablet, Cpu
} from 'lucide-react';
import { fetchPromotedProducts } from '../services/api';
import type { PromotedProduct } from '../services/api';

// Map slug → icon
const CAT_ICONS: Record<string, React.ElementType> = {
    'dien-thoai': Smartphone,
    'smartphone': Smartphone,
    'laptop': Laptop,
    'may-tinh-xach-tay': Laptop,
    'tai-nghe': Headphones,
    'headphone': Headphones,
    'loa': Speaker,
    'camera': Camera,
    'dong-ho': Watch,
    'smartwatch': Watch,
    'may-tinh-bang': Tablet,
    'tablet': Tablet,
    'linh-kien': Cpu,
    'phu-kien': Package,
    'pin': Battery,
};

const getCatIcon = (slug: string): React.ElementType => {
    const lower = slug.toLowerCase();
    for (const key of Object.keys(CAT_ICONS)) {
        if (lower.includes(key)) return CAT_ICONS[key];
    }
    return Package;
};

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
                    <aside className="hidden lg:flex flex-col gap-4 w-56 flex-shrink-0">
                        {/* Danh mục */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-gray-700 text-sm">Danh mục</h3>
                                <div className="flex gap-2">
                                    <button onClick={clearCats}
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition ${isAllCats ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                        Tất cả
                                    </button>
                                    {!isAllCats && (
                                        <button onClick={selectAllCats}
                                            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition">
                                            Chọn tất cả
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-1">
                                {availableCategories.map(cat => {
                                    const Icon = getCatIcon(cat.slug);
                                    const active = selectedCats.has(cat.slug);
                                    return (
                                        <button key={cat.slug}
                                            onClick={() => toggleCat(cat.slug)}
                                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-sm transition ${active
                                                ? 'bg-purple-600 text-white font-semibold'
                                                : 'text-gray-600 hover:bg-gray-50 font-medium'}`}>
                                            <Icon size={14} className={active ? 'text-white' : 'text-gray-400'} />
                                            <span className="flex-1 truncate">{cat.name}</span>
                                            <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-black ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                {cat.count}
                                            </span>
                                        </button>
                                    );
                                })}
                                {availableCategories.length === 0 && !loading && (
                                    <p className="text-xs text-gray-400 text-center py-3">Không có danh mục</p>
                                )}
                            </div>
                        </div>

                        {/* Loại giảm */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                            <h3 className="font-bold text-gray-700 text-sm mb-3">Loại giảm giá</h3>
                            <div className="space-y-1">
                                {([
                                    ['all', 'Tất cả'],
                                    ['PERCENT', '📉 Giảm theo %'],
                                    ['FIXED', '💰 Giảm cứng'],
                                ] as const).map(([val, label]) => (
                                    <button key={val}
                                        onClick={() => setTypeFilter(val)}
                                        className={`w-full flex items-center px-3 py-2 rounded-xl text-left text-sm transition ${typeFilter === val
                                            ? 'bg-red-600 text-white font-semibold'
                                            : 'text-gray-600 hover:bg-gray-50 font-medium'}`}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Số cột */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                            <h3 className="font-bold text-gray-700 text-sm mb-3">Hiển thị (cột)</h3>
                            <div className="flex gap-2">
                                {[3, 4, 5, 6].map(n => (
                                    <button key={n} onClick={() => setCols(n)}
                                        className={`flex-1 h-8 rounded-lg text-xs font-black transition ${cols === n ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* ── Nội dung chính ── */}
                    <div className="flex-1 min-w-0">
                        {/* Mobile filter bar */}
                        <div className="lg:hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-3 mb-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <button onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <SlidersHorizontal size={16} /> Bộ lọc
                                </button>
                                {selectedCats.size > 0 && (
                                    <span className="text-xs text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded-full">
                                        {selectedCats.size} danh mục
                                    </span>
                                )}
                            </div>
                            {showFilters && (
                                <>
                                    {/* Danh mục mobile — scroll ngang */}
                                    <div className="overflow-x-auto">
                                        <div className="flex gap-2 pb-1">
                                            <button onClick={clearCats}
                                                className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition ${isAllCats ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                                Tất cả
                                            </button>
                                            {availableCategories.map(cat => {
                                                const Icon = getCatIcon(cat.slug);
                                                const active = selectedCats.has(cat.slug);
                                                return (
                                                    <button key={cat.slug} onClick={() => toggleCat(cat.slug)}
                                                        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition ${active ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                                        <Icon size={12} /> {cat.name}
                                                        <span className={`text-[9px] font-black ${active ? 'text-white/70' : 'text-gray-400'}`}>{cat.count}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    {/* Loại giảm mobile */}
                                    <div className="flex gap-2">
                                        {([['all', 'Tất cả'], ['PERCENT', '📉 Giảm %'], ['FIXED', '💰 Giảm cứng']] as const).map(([val, label]) => (
                                            <button key={val} onClick={() => setTypeFilter(val)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${typeFilter === val ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                                {label}
                                            </button>
                                        ))}
                                        <div className="ml-auto flex items-center gap-1">
                                            <span className="text-xs text-gray-400">Cột:</span>
                                            {[3, 4, 5].map(n => (
                                                <button key={n} onClick={() => setCols(n)}
                                                    className={`w-7 h-7 rounded text-xs font-black ${cols === n ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                    {n}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

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
                                {filtered.map(p => {
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
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
