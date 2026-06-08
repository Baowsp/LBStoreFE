import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertCircle, ChevronLeft } from 'lucide-react';
import { fetchPromotionById, updatePromotion } from '../../services/api';
import type { Promotion } from '../../services/api';
import { PromotionForm } from '../../components/admin/PromotionForm';

const isExpired = (promo: Promotion): boolean =>
    !!(promo.isActive && promo.endDate && new Date(promo.endDate).getTime() < Date.now());

export const AdminPromotionEdit = () => {
    const { id } = useParams<{ id: string }>();
    const [promo, setPromo] = useState<Promotion | null>(null);

    useEffect(() => {
        if (id) fetchPromotionById(Number(id)).then(setPromo);
    }, [id]);

    if (!promo) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-red-600" />
            </div>
        );
    }

    // Khoá trang nếu promotion đã quá hạn
    if (isExpired(promo)) {
        return (
            <div className="max-w-xl mx-auto mt-16 text-center space-y-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle size={32} className="text-orange-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Không thể chỉnh sửa</h2>
                <p className="text-gray-500 text-sm">
                    Khuyến mãi <span className="font-semibold text-gray-700">"{promo.name}"</span> đã quá hạn
                    và không thể chỉnh sửa nữa.
                </p>
                <p className="text-xs text-gray-400">
                    Nếu cần, hãy tạo một chương trình khuyến mãi mới.
                </p>
                <Link to="/admin/promotions"
                    className="inline-flex items-center gap-2 bg-gray-800 text-white px-5 py-2.5 rounded-xl hover:bg-gray-700 transition font-semibold text-sm">
                    <ChevronLeft size={18} /> Quay lại danh sách
                </Link>
            </div>
        );
    }

    return (
        <PromotionForm
            initial={promo}
            title="Chỉnh sửa Khuyến mãi"
            subtitle="Cập nhật thông tin chương trình khuyến mãi"
            submitLabel="Lưu thay đổi"
            onSubmit={data => updatePromotion(Number(id), data as any)}
        />
    );
};
