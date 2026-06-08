import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, Tag, PlayCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchVouchers, deleteVoucher } from '../../services/api';

type VoucherStatus = 'active' | 'upcoming' | 'expired' | 'disabled';

const getStatus = (v: any): VoucherStatus => {
    if (!v.isActive) return 'disabled';
    const now = new Date();
    const start = v.startDate ? new Date(v.startDate) : new Date(0);
    const end = v.endDate ? new Date(v.endDate) : new Date(9999, 0, 1);
    if (now < start) return 'upcoming';
    if (now > end) return 'expired';
    return 'active';
};

const STATUS_CONFIG: Record<VoucherStatus, { label: string; icon: any; cls: string }> = {
    active:   { label: 'Đang diễn ra', icon: PlayCircle,   cls: 'bg-green-100 text-green-700 border-green-200' },
    upcoming: { label: 'Sắp tới',      icon: Clock,        cls: 'bg-blue-100 text-blue-700 border-blue-200' },
    expired:  { label: 'Đã kết thúc',  icon: CheckCircle,  cls: 'bg-gray-100 text-gray-500 border-gray-200' },
    disabled: { label: 'Đang tắt',     icon: XCircle,      cls: 'bg-red-100 text-red-600 border-red-200' }
};

const StatusBadge = ({ v }: { v: any }) => {
    const s = getStatus(v);
    const config = STATUS_CONFIG[s];
    const Icon = config.icon;
    return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${config.cls}`}>
            <Icon size={12} />
            {config.label}
        </div>
    );
};

export const AdminVouchers = () => {
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadVouchers();
    }, []);

    const loadVouchers = async () => {
        setLoading(true);
        try {
            const data = await fetchVouchers(0, 100);
            setVouchers(data.content || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, code: string) => {
        if (window.confirm(`Bạn có chắc muốn xóa voucher ${code}?`)) {
            const success = await deleteVoucher(id);
            if (success) {
                alert('Xóa thành công!');
                loadVouchers();
            } else {
                alert('Xóa thất bại!');
            }
        }
    };

    const filteredVouchers = vouchers.filter((v: any) =>
        v.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Tag className="w-6 h-6 text-red-600" />
                        Quản lý Voucher
                    </h1>
                    <p className="text-gray-500 mt-1">Quản lý các mã giảm giá cho hệ thống</p>
                </div>
                <Link
                    to="/admin/vouchers/add"
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition"
                >
                    <Plus size={20} />
                    <span>Thêm Voucher</span>
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 mb-6 max-w-md">
                    <Search size={20} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm mã voucher..."
                        className="bg-transparent border-none outline-none w-full text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 text-sm text-gray-500">
                                <th className="py-4 px-4 font-medium">Mã Voucher</th>
                                <th className="py-4 px-4 font-medium">Giảm giá</th>
                                <th className="py-4 px-4 font-medium">Đơn tối thiểu</th>
                                <th className="py-4 px-4 font-medium">Đã dùng</th>
                                <th className="py-4 px-4 font-medium">Giới hạn</th>
                                <th className="py-4 px-4 font-medium">Trạng thái</th>
                                <th className="py-4 px-4 font-medium text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-gray-500">Đang tải...</td>
                                </tr>
                            ) : filteredVouchers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-gray-500">Không có dữ liệu</td>
                                </tr>
                            ) : (
                                filteredVouchers.map((v) => (
                                    <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                                        <td className="py-4 px-4 font-semibold text-gray-900">{v.code}</td>
                                        <td className="py-4 px-4 text-red-600 font-bold">
                                            {v.discountPercentage > 0
                                                ? <span>{v.discountPercentage}%</span>
                                                : <span>{(v.fixedDiscountAmount ?? 0).toLocaleString()}đ giảm cứng</span>}
                                        </td>
                                        <td className="py-4 px-4">{(v.minOrderValue ?? 0).toLocaleString()}đ</td>
                                        <td className="py-4 px-4 font-bold text-gray-700">
                                            {v.usedCount ?? 0}
                                        </td>
                                        <td className="py-4 px-4">
                                            {v.usageLimit > 0 ? (
                                                <span className={`font-bold ${(v.usedCount ?? 0) >= v.usageLimit ? 'text-red-600' : 'text-gray-700'}`}>
                                                    {v.usageLimit}
                                                    {(v.usedCount ?? 0) >= v.usageLimit && <span className="ml-1 text-xs">(Hết)</span>}
                                                </span>
                                            ) : (
                                                <span className="text-blue-600 font-bold">∞</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4">
                                            <StatusBadge v={v} />
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    to={`/admin/vouchers/edit/${v.id}`}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(v.id, v.code)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
