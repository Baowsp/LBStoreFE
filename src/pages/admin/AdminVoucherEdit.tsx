import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeft, Save, Percent, DollarSign, Infinity, Hash } from 'lucide-react';
import { updateVoucher, fetchVoucherById } from '../../services/api';

const nowStr = () => new Date().toISOString().split('T')[0];

const inputCls = (err: boolean) =>
  `w-full px-4 py-2 border rounded-xl outline-none transition-colors text-sm ${err ? 'border-red-500 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:border-red-500 bg-white'}`;

export const AdminVoucherEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [usedCount, setUsedCount] = useState(0);
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

  useEffect(() => {
    if (id) loadVoucher();
  }, [id]);

  const loadVoucher = async () => {
    const data = await fetchVoucherById(id as string);
    if (data) {
      const isFixed = data.fixedDiscountAmount && Number(data.fixedDiscountAmount) > 0;
      setDiscountType(isFixed ? 'fixed' : 'percent');
      setUsageLimitMode(data.usageLimit > 0 ? 'limited' : 'unlimited');
      setUsedCount(data.usedCount || 0);
      setFormData({
        code: data.code,
        discountPercentage: data.discountPercentage || 0,
        fixedDiscountAmount: data.fixedDiscountAmount || 0,
        minOrderValue: data.minOrderValue || 0,
        usageLimit: data.usageLimit || 0,
        isActive: data.isActive,
        startDate: data.startDate ? data.startDate.slice(0, 10) : '',
        endDate: data.endDate ? data.endDate.slice(0, 10) : '',
        description: data.description || ''
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  // ── Real-time validation ──────────────────────────────────────────────────
  const now = nowStr();

  const errors = {
    discountPercentage: discountType === 'percent' && (Number(formData.discountPercentage) <= 0 || Number(formData.discountPercentage) > 100),
    fixedAmount: discountType === 'fixed' && Number(formData.fixedDiscountAmount) <= 0,
    fixedVsMin: discountType === 'fixed' && Number(formData.minOrderValue) > 0 && Number(formData.fixedDiscountAmount) > Number(formData.minOrderValue),
    startDate: formData.startDate ? formData.startDate < now : false,
    endDate: formData.endDate
      ? (formData.endDate < now || (!!formData.startDate && formData.endDate <= formData.startDate))
      : false,
    usageLimit: usageLimitMode === 'limited' && (Number(formData.usageLimit) <= 0 || Number(formData.usageLimit) < usedCount),
  };

  const hasErrors = Object.values(errors).some(Boolean);

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
      await updateVoucher(id as string, payload);
      navigate('/admin/vouchers');
    } catch (error: any) {
      alert(error.message || 'Lỗi cập nhật voucher');
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
          <h1 className="text-2xl font-bold text-gray-800">Cập nhật Voucher</h1>
          <p className="text-gray-500 mt-1">Chỉnh sửa mã giảm giá <span className="font-bold text-gray-700">{formData.code}</span></p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">

        {/* Thông tin cơ bản */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mã (readonly) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mã Voucher</label>
            <input type="text" disabled
              className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-xl outline-none font-bold text-sm"
              value={formData.code} />
          </div>

          {/* Số lần đã dùng - hiển thị nổi bật */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số lần đã sử dụng</label>
            <div className="px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 flex items-center gap-2">
              <span className="text-2xl font-black text-red-600">{usedCount}</span>
              <span className="text-sm text-gray-500">/ {usageLimitMode === 'limited' && Number(formData.usageLimit) > 0 ? formData.usageLimit : '∞'} lần</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <input type="number" name="usageLimit" min={Math.max(1, usedCount)}
                  className={inputCls(errors.usageLimit)}
                  value={formData.usageLimit} onChange={handleChange}
                  placeholder="Tổng số voucher" />
                {errors.usageLimit && (
                  <p className="text-xs text-red-500 mt-1 font-medium">
                    {Number(formData.usageLimit) < usedCount
                      ? `Phải ≥ số lần đã dùng (${usedCount})`
                      : 'Phải lớn hơn 0'}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Kích hoạt */}
          <div className="flex items-center gap-3">
            <input type="checkbox" name="isActive" id="isActiveEdit"
              className="w-5 h-5 accent-red-600 rounded cursor-pointer"
              checked={formData.isActive} onChange={handleChange} />
            <label htmlFor="isActiveEdit" className="text-sm font-medium text-gray-700 cursor-pointer">
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
            <span>{loading ? 'Đang cập nhật...' : 'Cập nhật'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
