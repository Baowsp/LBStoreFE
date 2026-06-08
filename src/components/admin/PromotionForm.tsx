import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ChevronLeft, Save, Percent, Package,
    Search, X, CheckCircle, DollarSign, Clock,
    ChevronLeft as PagePrev, ChevronRight as PageNext,
    Smartphone, Laptop, Headphones, Speaker, Camera, Watch, Tablet, Cpu, Battery, Tag,
    AlertTriangle
} from 'lucide-react';
import { fetchProducts, fetchCategories } from '../../services/api';
import type { Promotion, BackendCategory } from '../../services/api';
import type { Product } from '../../types/product';

// ── helpers ──────────────────────────────────────────────────────────────────

const inputCls = (err?: boolean) =>
    `w-full px-4 py-2.5 border rounded-xl outline-none transition-colors text-sm ${err
        ? 'border-red-400 focus:border-red-500 bg-red-50'
        : 'border-gray-200 focus:border-red-500 bg-white'}`;

/** "2026-05-28T14:30:00" → "2026-05-28T14:30" */
const toDateTimeLocal = (iso?: string) => (iso ? iso.substring(0, 16) : '');

/** "2026-05-28T14:30" → "2026-05-28T14:30:00" */
const toIsoFull = (dt: string, end = false) => {
    if (!dt) return undefined;
    return dt.length === 16 ? dt + (end ? ':59' : ':00') : dt;
};

/** Thời gian hiện tại dạng datetime-local string */
const nowLocal = () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

const CAT_ICONS: Record<string, React.ElementType> = {
    'dien-thoai': Smartphone, 'smartphone': Smartphone,
    'laptop': Laptop, 'may-tinh-xach-tay': Laptop,
    'tai-nghe': Headphones, 'headphone': Headphones,
    'loa': Speaker, 'camera': Camera,
    'dong-ho': Watch, 'smartwatch': Watch,
    'may-tinh-bang': Tablet, 'tablet': Tablet,
    'linh-kien': Cpu, 'phu-kien': Package, 'pin': Battery,
};
const getCatIcon = (slug: string): React.ElementType => {
    const lower = (slug || '').toLowerCase();
    for (const key of Object.keys(CAT_ICONS)) {
        if (lower.includes(key)) return CAT_ICONS[key];
    }
    return Tag;
};

const PAGE_SIZE = 15;

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
    initial?: Promotion;
    onSubmit: (payload: {
        name: string;
        description?: string;
        discountPercentage?: number;
        fixedDiscountAmount?: number;
        startDate?: string;
        endDate?: string;
        isActive: boolean;
        showOnHomepage: boolean;
        productIds: number[];
        categoryIds: number[];
    }) => Promise<void>;
    submitLabel?: string;
    backTo?: string;
    title?: string;
    subtitle?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const PromotionForm = ({
    initial, onSubmit, submitLabel = 'Lưu',
    backTo = '/admin/promotions', title = 'Khuyến mãi', subtitle = ''
}: Props) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // Parse conflict items từ JSON error của backend
    const conflictItems = useMemo(() => {
        if (!submitError) return [];
        try {
            const parsed = JSON.parse(submitError);
            if (Array.isArray(parsed)) return parsed as { product: string; promotion: string; start: string; end: string }[];
        } catch { /* không phải JSON — lỗi khác */ }
        return [];
    }, [submitError]);

    // Tập hợp tên sản phẩm xung đột để highlight trong danh sách
    const conflictProductNames = useMemo(
        () => new Set(conflictItems.map(c => c.product)),
        [conflictItems]
    );

    // Product data
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set());

    // Category data (for filtering products in the list)
    const [categories, setCategories] = useState<BackendCategory[]>([]);
    const [selectedCatSlug, setSelectedCatSlug] = useState<string>('all');

    // Product list search + pagination
    const [productSearch, setProductSearch] = useState('');
    const [page, setPage] = useState(0);

    const [form, setForm] = useState({
        name: '',
        description: '',
        discountType: 'PERCENT' as 'PERCENT' | 'FIXED',
        discountPercentage: 10,
        fixedDiscountAmount: 0,
        startDate: '',
        endDate: '',
        isActive: true,
        showOnHomepage: true,
    });

    // ── Load data ─────────────────────────────────────────────────────────────

    useEffect(() => {
        fetchProducts(0, 500).then(r => setAllProducts(r.content));
        fetchCategories().then(setCategories);
    }, []);

    // Pre-fill when editing
    useEffect(() => {
        if (!initial) return;
        const isFixed = initial.discountType === 'FIXED';
        setForm({
            name: initial.name,
            description: initial.description || '',
            discountType: isFixed ? 'FIXED' : 'PERCENT',
            discountPercentage: (!isFixed && initial.discountPercentage) ? initial.discountPercentage : 10,
            fixedDiscountAmount: (isFixed && initial.fixedDiscountAmount) ? initial.fixedDiscountAmount : 0,
            startDate: toDateTimeLocal(initial.startDate),
            endDate: toDateTimeLocal(initial.endDate),
            isActive: initial.isActive,
            showOnHomepage: initial.showOnHomepage ?? true,
        });
        setSelectedProductIds(new Set(initial.products.map(p => p.id)));
    }, [initial]);

    // ── Validation ────────────────────────────────────────────────────────────

    const minDateTime = nowLocal();
    const isEditing = !!initial;

    const errors = {
        name: !form.name.trim(),
        percent: form.discountType === 'PERCENT' && (form.discountPercentage <= 0 || form.discountPercentage > 100),
        fixed: form.discountType === 'FIXED' && form.fixedDiscountAmount <= 0,
        // Khi Edit: startDate có thể là quá khứ (promotion đang chạy) → không báo lỗi
        startDate: !isEditing && form.startDate ? form.startDate < minDateTime : false,
        endDate: form.endDate ? form.endDate < minDateTime : false,
        dates: !!(form.startDate && form.endDate && form.endDate <= form.startDate),
    };
    const hasError = errors.name || errors.percent || errors.fixed || errors.startDate || errors.endDate || errors.dates;

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const toggleProduct = (id: number) => {
        setSelectedProductIds(prev => {
            const s = new Set(prev);
            s.has(id) ? s.delete(id) : s.add(id);
            return s;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (hasError) return;
        setLoading(true);
        setSubmitError('');
        try {
            await onSubmit({
                name: form.name,
                description: form.description || undefined,
                discountPercentage: form.discountType === 'PERCENT' ? Number(form.discountPercentage) : undefined,
                fixedDiscountAmount: form.discountType === 'FIXED' ? Number(form.fixedDiscountAmount) : undefined,
                startDate: toIsoFull(form.startDate),
                endDate: toIsoFull(form.endDate, true),
                isActive: form.isActive,
                showOnHomepage: form.showOnHomepage,
                productIds: Array.from(selectedProductIds),
                categoryIds: [],
            });
            navigate(backTo);
        } catch (err: any) {
            setSubmitError(err.message || 'Lỗi khi lưu');
        } finally {
            setLoading(false);
        }
    };

    // ── Product list filtering + pagination ───────────────────────────────────

    const filtered = useMemo(() => {
        let r = allProducts;
        if (selectedCatSlug !== 'all') {
            r = r.filter(p => p.categorySlug === selectedCatSlug);
        }
        if (productSearch.trim()) {
            const q = productSearch.toLowerCase();
            r = r.filter(p =>
                p.name.toLowerCase().includes(q) ||
                (p.brand || '').toLowerCase().includes(q)
            );
        }
        return r;
    }, [allProducts, selectedCatSlug, productSearch]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    // Reset to page 0 when filter changes
    const handleCatChange = (slug: string) => { setSelectedCatSlug(slug); setPage(0); };
    const handleSearch = (v: string) => { setProductSearch(v); setPage(0); };

    const selectAllFiltered = () => {
        setSelectedProductIds(prev => {
            const s = new Set(prev);
            filtered.forEach(p => s.add(p.id));
            return s;
        });
    };
    const deselectFiltered = () => {
        setSelectedProductIds(prev => {
            const s = new Set(prev);
            filtered.forEach(p => s.delete(p.id));
            return s;
        });
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link to={backTo} className="p-2 hover:bg-gray-100 rounded-xl transition">
                    <ChevronLeft size={22} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                    {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
                </div>
            </div>

            {/* Backend error — conflict cards */}
            {submitError && (
                <div className="bg-red-50 border border-red-300 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2">
                        <AlertTriangle size={18} className="text-red-600 flex-shrink-0" />
                        <p className="text-red-700 font-bold text-sm">
                            {conflictItems.length > 0
                                ? `${conflictItems.length} sản phẩm đã có khuyến mãi trùng lịch`
                                : 'Không thể lưu'}
                        </p>
                    </div>

                    {conflictItems.length > 0 ? (
                        <div className="space-y-2">
                            {conflictItems.map((c, i) => (
                                <div key={i} className="bg-white border border-red-200 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2">
                                    {/* Tên sản phẩm */}
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                                        <span className="text-sm font-semibold text-gray-800 truncate">{c.product}</span>
                                    </div>
                                    {/* Promotion trùng */}
                                    <div className="flex items-center gap-2 text-xs text-gray-500 flex-shrink-0">
                                        <span className="bg-orange-100 text-orange-700 font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                                            {c.promotion}
                                        </span>
                                        <span className="text-gray-400">·</span>
                                        <Clock size={11} className="text-gray-400" />
                                        <span className="whitespace-nowrap">{c.start} → {c.end}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-red-600 text-xs font-medium">{submitError}</p>
                    )}

                    <p className="text-xs text-red-500 font-medium">
                        ⚠️ Bỏ chọn các sản phẩm trên hoặc điều chỉnh thời gian để tiếp tục.
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* ── Thông tin chương trình ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
                    <h2 className="font-bold text-gray-700 flex items-center gap-2">
                        <Percent size={18} className="text-red-500" /> Thông tin chương trình
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Tên */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên chương trình *</label>
                            <input type="text" name="name" required className={inputCls(errors.name)}
                                value={form.name} onChange={handleChange}
                                placeholder="VD: Sale Hè 2026, Giảm cứng 500K Laptop..." />
                            {errors.name && <p className="text-xs text-red-500 mt-1">Vui lòng nhập tên</p>}
                        </div>

                        {/* Loại giảm */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Loại giảm giá</label>
                            <div className="flex gap-3">
                                {([['PERCENT', Percent, 'Giảm theo %'], ['FIXED', DollarSign, 'Giảm cứng (VNĐ)']] as const).map(([val, Icon, label]) => (
                                    <label key={val}
                                        className={`flex-1 flex items-center gap-2.5 cursor-pointer px-4 py-3 rounded-xl border-2 transition-all
                                            ${form.discountType === val ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                                        <input type="radio" name="discountType" value={val}
                                            checked={form.discountType === val} onChange={handleChange} className="sr-only" />
                                        <Icon size={18} />
                                        <span className="font-semibold text-sm">{label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Giá trị giảm */}
                        {form.discountType === 'PERCENT' ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phần trăm giảm (%) *</label>
                                <div className="relative">
                                    <input type="number" name="discountPercentage" min="1" max="100"
                                        className={inputCls(errors.percent) + ' pr-10'}
                                        value={form.discountPercentage} onChange={handleChange} />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                                </div>
                                {errors.percent && <p className="text-xs text-red-500 mt-1">Từ 1% đến 100%</p>}
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Số tiền giảm (VNĐ) *</label>
                                <div className="relative">
                                    <input type="number" name="fixedDiscountAmount" min="1"
                                        className={inputCls(errors.fixed) + ' pr-16'}
                                        value={form.fixedDiscountAmount} onChange={handleChange}
                                        placeholder="500000" />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">VNĐ</span>
                                </div>
                                {errors.fixed && <p className="text-xs text-red-500 mt-1">Phải lớn hơn 0</p>}
                                {!errors.fixed && Number(form.fixedDiscountAmount) > 0 && (
                                    <p className="text-xs text-green-600 mt-1 font-medium">
                                        Giảm cứng: -{Number(form.fixedDiscountAmount).toLocaleString('vi-VN')}đ / sản phẩm
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Kích hoạt & Hiện Homepage */}
                        <div className="flex items-center gap-8 pt-5 md:col-span-2">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="isActive" className="sr-only peer"
                                    checked={form.isActive} onChange={handleChange} />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600" />
                                <span className="ms-3 text-sm font-medium text-gray-700">Kích hoạt ngay</span>
                            </label>

                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="showOnHomepage" className="sr-only peer"
                                    checked={form.showOnHomepage} onChange={handleChange} />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600" />
                                <span className="ms-3 text-sm font-medium text-gray-700">Hiện ở Homepage</span>
                            </label>
                        </div>

                        {/* Thời gian bắt đầu — phải > now() */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                                <Clock size={14} className="text-gray-400" /> Thời gian bắt đầu
                            </label>
                            <input type="datetime-local" name="startDate"
                                min={isEditing ? undefined : minDateTime}
                                className={inputCls(errors.startDate)}
                                value={form.startDate} onChange={handleChange} />
                            {errors.startDate && (
                                <p className="text-xs text-red-500 mt-1">Phải lớn hơn thời gian hiện tại</p>
                            )}
                        </div>

                        {/* Thời gian kết thúc — phải > now() và > startDate */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                                <Clock size={14} className="text-gray-400" /> Thời gian kết thúc
                            </label>
                            <input type="datetime-local" name="endDate"
                                min={form.startDate || minDateTime}
                                className={inputCls(errors.endDate || errors.dates)}
                                value={form.endDate} onChange={handleChange} />
                            {errors.endDate && !errors.dates && (
                                <p className="text-xs text-red-500 mt-1">Phải lớn hơn thời gian hiện tại</p>
                            )}
                            {errors.dates && (
                                <p className="text-xs text-red-500 mt-1">Phải sau thời gian bắt đầu</p>
                            )}
                        </div>

                        {/* Mô tả */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả</label>
                            <textarea name="description" rows={2}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-red-500 outline-none text-sm resize-none"
                                value={form.description} onChange={handleChange}
                                placeholder="Mô tả ngắn về chương trình..." />
                        </div>
                    </div>
                </div>

                {/* ── Sản phẩm áp dụng ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <h2 className="font-bold text-gray-700 flex items-center gap-2">
                            <Package size={18} className="text-red-500" /> Sản phẩm áp dụng
                        </h2>
                        {selectedProductIds.size > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="bg-red-50 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                                    ✓ {selectedProductIds.size} đã chọn
                                </span>
                                <button type="button" onClick={() => setSelectedProductIds(new Set())}
                                    className="text-xs text-gray-400 hover:text-red-500 font-medium transition">
                                    Bỏ tất cả
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Danh mục — hiện ra dưới dạng chips */}
                    <div className="space-y-2">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Lọc theo danh mục</p>
                        <div className="flex flex-wrap gap-1.5">
                            <button type="button"
                                onClick={() => handleCatChange('all')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition border
                                    ${selectedCatSlug === 'all'
                                        ? 'bg-red-600 text-white border-red-600'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-600'}`}>
                                <Package size={11} /> Tất cả
                                <span className={`text-[9px] font-black ${selectedCatSlug === 'all' ? 'text-white/70' : 'text-gray-400'}`}>
                                    {allProducts.length}
                                </span>
                            </button>
                            {categories.map(cat => {
                                const Icon = getCatIcon(cat.slug);
                                const count = allProducts.filter(p => p.categorySlug === cat.slug).length;
                                if (count === 0) return null;
                                const active = selectedCatSlug === cat.slug;
                                return (
                                    <button key={cat.id} type="button"
                                        onClick={() => handleCatChange(cat.slug)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition border
                                            ${active
                                                ? 'bg-red-600 text-white border-red-600'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-600'}`}>
                                        <Icon size={11} /> {cat.name}
                                        <span className={`text-[9px] font-black ${active ? 'text-white/70' : 'text-gray-400'}`}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tìm kiếm */}
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                        <Search size={15} className="text-gray-400" />
                        <input type="text" placeholder="Tìm tên hoặc thương hiệu..."
                            className="bg-transparent outline-none text-sm w-full"
                            value={productSearch} onChange={e => handleSearch(e.target.value)} />
                        {productSearch && (
                            <button type="button" onClick={() => handleSearch('')}>
                                <X size={13} className="text-gray-400 hover:text-red-500 transition" />
                            </button>
                        )}
                    </div>

                    {/* Bulk actions */}
                    <div className="flex items-center gap-3 text-xs">
                        <span className="text-gray-400">{filtered.length} sản phẩm phù hợp</span>
                        <span className="text-gray-200">|</span>
                        <button type="button" onClick={selectAllFiltered}
                            className="text-blue-600 hover:text-blue-800 font-semibold transition">
                            + Chọn tất cả ({filtered.length})
                        </button>
                        <span className="text-gray-200">|</span>
                        <button type="button" onClick={deselectFiltered}
                            className="text-gray-400 hover:text-red-500 font-semibold transition">
                            Bỏ chọn kết quả
                        </button>
                    </div>

                    {/* Danh sách sản phẩm */}
                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                        {paginated.length === 0 ? (
                            <div className="py-8 text-center text-gray-400 text-sm">
                                Không có sản phẩm phù hợp
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {paginated.map(p => {
                                    const isConflict = conflictProductNames.has(p.name);
                                    const isSelected = selectedProductIds.has(p.id);
                                    return (
                                        <label key={p.id}
                                            className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition
                                                ${isConflict ? 'bg-red-50 border-l-4 border-red-400' : isSelected ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                                            <input type="checkbox" className="accent-red-600 w-4 h-4 flex-shrink-0"
                                                checked={isSelected}
                                                onChange={() => toggleProduct(p.id)} />
                                            {p.image && (
                                                <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                                                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium truncate ${isConflict ? 'text-red-700' : 'text-gray-800'}`}>
                                                    {p.name}
                                                </p>
                                                <p className="text-xs text-gray-400">{p.brand} · {p.category}</p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className="text-xs text-gray-500 font-medium">
                                                    {p.price.toLocaleString('vi-VN')}đ
                                                </span>
                                                {isConflict && (
                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full">
                                                        <AlertTriangle size={9} /> Trùng lịch
                                                    </span>
                                                )}
                                                {isSelected && !isConflict && (
                                                    <CheckCircle size={15} className="text-red-500" />
                                                )}
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Phân trang */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-1">
                            <p className="text-xs text-gray-400">
                                Trang {page + 1} / {totalPages} &nbsp;·&nbsp;
                                {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} / {filtered.length}
                            </p>
                            <div className="flex items-center gap-1">
                                <button type="button"
                                    disabled={page === 0}
                                    onClick={() => setPage(p => p - 1)}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition">
                                    <PagePrev size={16} />
                                </button>
                                {/* Page numbers */}
                                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                    const pg = totalPages <= 7 ? i
                                        : page < 4 ? i
                                            : page > totalPages - 5 ? totalPages - 7 + i
                                                : page - 3 + i;
                                    return (
                                        <button key={pg} type="button"
                                            onClick={() => setPage(pg)}
                                            className={`w-7 h-7 rounded-lg text-xs font-bold transition
                                                ${pg === page ? 'bg-red-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}>
                                            {pg + 1}
                                        </button>
                                    );
                                })}
                                <button type="button"
                                    disabled={page === totalPages - 1}
                                    onClick={() => setPage(p => p + 1)}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition">
                                    <PageNext size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {selectedProductIds.size === 0 && (
                        <p className="text-xs text-orange-500 font-medium">
                            ⚠️ Chưa chọn sản phẩm — promotion sẽ không có hiệu lực
                        </p>
                    )}


                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3">
                    <Link to={backTo}
                        className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition text-sm">
                        Hủy
                    </Link>
                    <button type="submit" disabled={loading || hasError}
                        className="flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-xl hover:bg-red-700 transition disabled:opacity-50 font-semibold text-sm shadow-sm">
                        <Save size={18} />
                        {loading ? 'Đang lưu...' : submitLabel}
                    </button>
                </div>
            </form>
        </div>
    );
};
