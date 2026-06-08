import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus, Edit, Trash2, Search, Percent,
    CheckCircle, XCircle, Clock, AlertCircle, Lock
} from 'lucide-react';
import { fetchPromotions, deletePromotion } from '../../services/api';
import type { Promotion } from '../../services/api';

// ── helpers ──────────────────────────────────────────────────────────────────

const formatDateTime = (d?: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};

type PromoStatus = 'active' | 'upcoming' | 'expired' | 'disabled';

const getStatus = (promo: Promotion): PromoStatus => {
    if (!promo.isActive) return 'disabled';
    const now = Date.now();
    if (promo.startDate && new Date(promo.startDate).getTime() > now) return 'upcoming';
    if (promo.endDate && new Date(promo.endDate).getTime() < now) return 'expired';
    return 'active';
};

const STATUS_CONFIG: Record<PromoStatus, { label: string; icon: any; cls: string }> = {
    active:   { label: 'Đang hoạt động', icon: CheckCircle, cls: 'bg-green-100 text-green-700 border-green-200' },
    upcoming: { label: 'Chưa hoạt động', icon: Clock,       cls: 'bg-blue-100 text-blue-600 border-blue-200' },
    expired:  { label: 'Đã quá hạn',     icon: AlertCircle, cls: 'bg-orange-100 text-orange-600 border-orange-200' },
    disabled: { label: 'Đã tắt',         icon: XCircle,     cls: 'bg-gray-100 text-gray-500 border-gray-200' },
};

const StatusBadge = ({ promo }: { promo: Promotion }) => {
    const s = getStatus(promo);
    const { label, icon: Icon, cls } = STATUS_CONFIG[s];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>
            <Icon size={11} />
            {label}
        </span>
    );
};

// ── Component ─────────────────────────────────────────────────────────────────

export const AdminPromotions = () => {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | PromoStatus>('all');

    const load = async () => {
        setLoading(true);
        setPromotions(await fetchPromotions());
        setLoading(false);
    };
    useEffect(() => { load(); }, []);

    const handleDelete = async (id: number, name: string) => {
        if (!window.confirm(`Xóa promotion "${name}"?`)) return;
        const ok = await deletePromotion(id);
        if (ok) { load(); }
        else alert('Xóa thất bại!');
    };

    // Stats
    const stats = useMemo(() => ({
        total:    promotions.length,
        active:   promotions.filter(p => getStatus(p) === 'active').length,
        upcoming: promotions.filter(p => getStatus(p) === 'upcoming').length,
        expired:  promotions.filter(p => getStatus(p) === 'expired').length,
        disabled: promotions.filter(p => getStatus(p) === 'disabled').length,
    }), [promotions]);

    const filtered = useMemo(() => {
        let r = promotions;
        if (statusFilter !== 'all') r = r.filter(p => getStatus(p) === statusFilter);
        if (search.trim()) r = r.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
        return r;
    }, [promotions, statusFilter, search]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Percent className="w-6 h-6 text-red-600" /> Quản lý Khuyến mãi
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">Tạo và quản lý các chương trình khuyến mãi sản phẩm</p>
                </div>
                <Link to="/admin/promotions/add"
                    className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl hover:bg-red-700 transition font-semibold shadow-sm">
                    <Plus size={18} /> Tạo Khuyến mãi
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {([
                    ['all',      'Tổng',            stats.total,    'text-gray-700',   'bg-gray-50',     'border-gray-100'],
                    ['active',   'Đang hoạt động',  stats.active,   'text-green-700',  'bg-green-50',    'border-green-100'],
                    ['upcoming', 'Chưa hoạt động',  stats.upcoming, 'text-blue-600',   'bg-blue-50',     'border-blue-100'],
                    ['expired',  'Đã quá hạn',      stats.expired,  'text-orange-600', 'bg-orange-50',   'border-orange-100'],
                    ['disabled', 'Đã tắt',          stats.disabled, 'text-gray-400',   'bg-gray-100',    'border-gray-200'],
                ] as const).map(([key, label, value, textCls, bgCls, borderCls]) => (
                    <button key={key} type="button"
                        onClick={() => setStatusFilter(key as any)}
                        className={`${bgCls} border ${borderCls} rounded-2xl p-4 text-left transition hover:shadow-sm
                            ${statusFilter === key ? 'ring-2 ring-offset-1 ring-red-400' : ''}`}>
                        <p className="text-xs text-gray-400 font-semibold">{label}</p>
                        <p className={`text-3xl font-black mt-1 ${textCls}`}>{value}</p>
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-3 mb-5">
                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 flex-1 max-w-sm">
                        <Search size={16} className="text-gray-400" />
                        <input type="text" placeholder="Tìm kiếm khuyến mãi..."
                            className="bg-transparent border-none outline-none w-full text-sm"
                            value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    {/* Status filter pills */}
                    <div className="flex gap-2 flex-wrap">
                        {([
                            ['all', 'Tất cả'],
                            ['active', '🟢 Đang hoạt động'],
                            ['upcoming', '🔵 Chưa hoạt động'],
                            ['expired', '🟠 Đã quá hạn'],
                            ['disabled', '⚫ Đã tắt'],
                        ] as const).map(([val, label]) => (
                            <button key={val} type="button"
                                onClick={() => setStatusFilter(val)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition
                                    ${statusFilter === val ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                                <th className="py-3 px-4 font-semibold">Tên chương trình</th>
                                <th className="py-3 px-4 font-semibold">Giảm giá</th>
                                <th className="py-3 px-4 font-semibold">Thời gian</th>
                                <th className="py-3 px-4 font-semibold">Sản phẩm</th>
                                <th className="py-3 px-4 font-semibold text-center">Hiện Homepage</th>
                                <th className="py-3 px-4 font-semibold">Trạng thái</th>
                                <th className="py-3 px-4 font-semibold text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {loading ? (
                                <tr><td colSpan={7} className="text-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-red-600 mx-auto" />
                                </td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-12 text-gray-400">
                                    Không có dữ liệu
                                </td></tr>
                            ) : filtered.map(promo => {
                                const status = getStatus(promo);
                                const isExpired = status === 'expired';

                                return (
                                    <tr key={promo.id}
                                        className={`border-b border-gray-50 transition
                                            ${isExpired ? 'bg-orange-50/30' : 'hover:bg-gray-50/50'}`}>
                                        {/* Tên */}
                                        <td className="py-4 px-4">
                                            <p className={`font-semibold ${isExpired ? 'text-gray-400' : 'text-gray-900'}`}>
                                                {promo.name}
                                            </p>
                                            {promo.description && (
                                                <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{promo.description}</p>
                                            )}
                                        </td>

                                        {/* Giảm giá */}
                                        <td className="py-4 px-4">
                                            {promo.discountType === 'FIXED'
                                                ? <span className={`text-base font-black ${isExpired ? 'text-gray-400' : 'text-red-600'}`}>
                                                    -{(promo.fixedDiscountAmount || 0).toLocaleString('vi-VN')}đ
                                                  </span>
                                                : <span className={`text-base font-black ${isExpired ? 'text-gray-400' : 'text-red-600'}`}>
                                                    -{promo.discountPercentage || 0}%
                                                  </span>
                                            }
                                        </td>

                                        {/* Thời gian — có giờ phút */}
                                        <td className="py-4 px-4 text-gray-500 text-xs space-y-0.5">
                                            <div className="flex items-center gap-1">
                                                <span className="text-green-500 font-bold">▶</span>
                                                {formatDateTime(promo.startDate)}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="text-red-400 font-bold">■</span>
                                                {formatDateTime(promo.endDate)}
                                            </div>
                                        </td>

                                        {/* Sản phẩm */}
                                        <td className="py-4 px-4">
                                            <div className="flex flex-wrap gap-1">
                                                {promo.products.slice(0, 3).map(p => (
                                                    <span key={p.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full truncate max-w-[100px]">
                                                        {p.name}
                                                    </span>
                                                ))}
                                                {promo.products.length > 3 && (
                                                    <span className="text-xs text-gray-400 font-medium">
                                                        +{promo.products.length - 3} khác
                                                    </span>
                                                )}
                                                {promo.products.length === 0 && (
                                                    <span className="text-xs text-gray-400 italic">Chưa chọn</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Hiện Homepage */}
                                        <td className="py-4 px-4 text-center">
                                            {promo.showOnHomepage ? (
                                                <span className="text-green-600 font-bold">✓</span>
                                            ) : (
                                                <span className="text-gray-300 font-bold">✗</span>
                                            )}
                                        </td>

                                        {/* Trạng thái */}
                                        <td className="py-4 px-4">
                                            <StatusBadge promo={promo} />
                                        </td>

                                        {/* Thao tác */}
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {isExpired ? (
                                                    /* Khoá nút sửa khi đã quá hạn */
                                                    <span
                                                        title="Không thể sửa — promotion đã quá hạn"
                                                        className="p-2 text-gray-300 cursor-not-allowed rounded-lg flex items-center gap-1">
                                                        <Lock size={15} />
                                                    </span>
                                                ) : (
                                                    <Link
                                                        to={`/admin/promotions/edit/${promo.id}`}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title="Chỉnh sửa">
                                                        <Edit size={17} />
                                                    </Link>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(promo.id, promo.name)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                    title="Xóa">
                                                    <Trash2 size={17} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
