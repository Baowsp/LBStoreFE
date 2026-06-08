import { createPromotion } from '../../services/api';
import { PromotionForm } from '../../components/admin/PromotionForm';

export const AdminPromotionAdd = () => (
    <PromotionForm
        title="Tạo Khuyến mãi mới"
        subtitle="Thiết lập chương trình giảm giá cho sản phẩm / danh mục"
        submitLabel="Tạo Khuyến mãi"
        onSubmit={data => createPromotion(data as any)}
    />
);
