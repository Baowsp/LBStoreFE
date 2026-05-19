import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Save, Percent, DollarSign, Infinity, Hash } from 'lucide-react';
import { createVoucher } from '../../services/api';

const nowStr = () => new Date().toISOString().split('T')[0];

const inputCls = (err: boolean) =>
  `w-full px-4 py-2 border rounded-xl outline-none transition-colors text-sm ${err ? 'border-red-500 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:border-red-500 bg-white'}`;

export const AdminVoucherAdd = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [usageLimitMode, setUsageLimitMode] = useState<'unlimited' | 'limited'>('unlimited');

  const [formData, setFormData] = useState({
    code: '',
    discountPercentage: 0,
    fixedDiscountAmount: 0,
    minOrderValue: 0,
    usageLimit: 0,
    isActive: true,
    startDate: '',
    endDate: '',
    description: ''
  });

  // ── Real-time validation ──────────────────────────────────────────────────
  const now = nowStr();

  const errors = {
    code: !formData.code.trim(),
    discountPercentage: discountType === 'percent' && (Number(formData.discountPercentage) <= 0 || Number(formData.discountPercentage) > 100),
    fixedAmount: discountType === 'fixed' && Number(formData.fixedDiscountAmount) <= 0,
    fixedVsMin: discountType === 'fixed' && Number(formData.minOrderValue) > 0 && Number(formData.fixedDiscountAmount) > Number(formData.minOrderValue),
    startDate: formData.startDate ? formData.startDate < now : false,
    endDate: formData.endDate
      ? (formData.endDate < now || (!!formData.startDate && formData.endDate <= formData.startDate))
      : false,
    usageLimit: usageLimitMode === 'limited' && Number(formData.usageLimit) <= 0,
  };

  const hasErrors = Object.values(errors).some(Boolean);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasErrors) return;
    setLoading(true);
    try {
      const payload = {
        ...formData,
        discountPercentage: discountType === 'percent' ? Number(formData.discountPercentage) : 0,
        fixedDiscountAmount: discountType === 'fixed' ? Number(formData.fixedDiscountAmount) : 0,
        maxDiscountAmount: 0,
        usageLimit: usageLimitMode === 'unlimited' ? 0 : Number(formData.usageLimit),
        startDate: formData.startDate ? formData.startDate + 'T00:00:00' : null,
        endDate: formData.endDate ? formData.endDate + 'T23:59:59' : null,
      };
      await createVoucher(payload);
      navigate('/admin/vouchers');
    } catch (error: any) {
      alert(error.message || 'Lỗi thêm voucher');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/vouchers" className="p-2 hover:bg-gray-100 rounded-xl transition">
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Thêm Voucher mới</h1>
          <p className="text-gray-500 mt-1">Tạo mã giảm giá mới cho hệ thống</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mã voucher */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mã Voucher *</label>
            <input type="text" name="code" required className={inputCls(errors.code)}
              value={formData.code} onChange={handleChange} placeholder="VD: WELCOME10"
              style={{ textTransform: 'uppercase' }} />
            {errors.code && <p className="text-xs text-red-500 mt-1 font-medium">Vui lòng nhập mã voucher</p>}
          </div>

          {/* Loại giảm giá */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Loại giảm giá</label>
            <div className="flex rounded-xl border border-gray-200 overflow-hidden">
              <button type="button" onClick={() => setDiscountType('percent')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold transition-colors ${discountType === 'percent' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                <Percent size={16} /> Theo %
              </button>
              <button type="button" onClick={() => setDiscountType('fixed')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold transition-colors ${discountType === 'fixed' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                <DollarSign size={16} /> Giảm cứng
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Giá trị giảm */}
          {discountType === 'percent' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phần trăm giảm (%) *</label>
              <input type="number" name="discountPercentage" min="1" max="100"
                className={inputCls(errors.discountPercentage)}
                value={formData.discountPercentage} onChange={handleChange} />
              {errors.discountPercentage && <p className="text-xs text-red-500 mt-1 font-medium">Phải từ 1% đến 100%</p>}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số tiền giảm cứng (VNĐ) *</label>
              <input type="number" name="fixedDiscountAmount" min="1"
                className={inputCls(errors.fixedAmount || errors.fixedVsMin)}
                value={formData.fixedDiscountAmount} onChange={handleChange} />
              {errors.fixedAmount && <p className="text-xs text-red-500 mt-1 font-medium">Phải lớn hơn 0</p>}
              {!errors.fixedAmount && errors.fixedVsMin && <p className="text-xs text-red-500 mt-1 font-medium">Phải ≤ Đơn tối thiểu</p>}
            </div>
          )}

          {/* Đơn tối thiểu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Đơn tối thiểu (VNĐ)</label>
            <input type="number" name="minOrderValue" min="0"
              className={inputCls(errors.fixedVsMin && discountType === 'fixed')}
              value={formData.minOrderValue} onChange={handleChange} />
            {errors.fixedVsMin && discountType === 'fixed' && (
              <p className="text-xs text-red-500 mt-1 font-medium">Phải ≥ Số tiền giảm cứng</p>
            )}
          </div>

          {/* Giới hạn sử dụng */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giới hạn sử dụng</label>
            <div className="flex rounded-xl border border-gray-200 overflow-hidden mb-2">
              <button type="button" onClick={() => setUsageLimitMode('unlimited')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold transition-colors ${usageLimitMode === 'unlimited' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                <Infinity size={16} /> Không giới hạn
              </button>
              <button type="button" onClick={() => setUsageLimitMode('limited')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold transition-colors ${usageLimitMode === 'limited' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                <Hash size={16} /> Giới hạn
              </button>
            </div>
            {usageLimitMode === 'limited' && (
              <>
                <input type="number" name="usageLimit" min="1"
                  className={inputCls(errors.usageLimit)}
                  value={formData.usageLimit} onChange={handleChange}
                  placeholder="Số lượng voucher" />
                {errors.usageLimit && <p className="text-xs text-red-500 mt-1 font-medium">Phải lớn hơn 0</p>}
              </>
            )}
          </div>

          {/* Kích hoạt */}
          <div className="flex items-center gap-3">
            <input type="checkbox" name="isActive" id="isActiveAdd"
              className="w-5 h-5 accent-red-600 rounded cursor-pointer"
              checked={formData.isActive} onChange={handleChange} />
            <label htmlFor="isActiveAdd" className="text-sm font-medium text-gray-700 cursor-pointer">
              Kích hoạt Voucher
            </label>
          </div>

          {/* Ngày giờ bắt đầu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày giờ bắt đầu</label>
            <input required type="date" name="startDate" min={now}
              className={inputCls(errors.startDate)}
              value={formData.startDate} onChange={handleChange} />
            {errors.startDate && <p className="text-xs text-red-500 mt-1 font-medium">Phải từ thời điểm hiện tại trở đi</p>}
          </div>

          {/* Ngày giờ kết thúc */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày giờ kết thúc</label>
            <input required type="date" name="endDate" min={now}
              className={inputCls(errors.endDate)}
              value={formData.endDate} onChange={handleChange} />
            {errors.endDate && (
              <p className="text-xs text-red-500 mt-1 font-medium">
                {formData.endDate < now ? 'Phải từ thời điểm hiện tại trở đi' : 'Phải sau thời gian bắt đầu'}
              </p>
            )}
          </div>
        </div>

        {/* Mô tả */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả chi tiết</label>
          <textarea name="description" rows={3}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-red-500 outline-none text-sm"
            value={formData.description} onChange={handleChange}
            placeholder="Mô tả về voucher này..." />
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={loading || hasErrors}
            className="flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold">
            <Save size={20} />
            <span>{loading ? 'Đang lưu...' : 'Lưu lại'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
