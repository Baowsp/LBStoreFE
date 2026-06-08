import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck, Save, AlertCircle, User, Phone, Mail, FileText, Info } from 'lucide-react';
import { adminCreateDeliveryEmployeeWithInfo } from '../../services/adminApi';

export const AdminDeliveryEmployeeAdd = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    vehicleType: 'MOTORBIKE',
    licensePlate: '',
    drivingLicense: '',
    status: 'AVAILABLE',
  });

  const set = (field: string, value: string) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) { setError('Vui lòng nhập họ tên.'); return; }
    if (!form.phoneNumber.trim()) { setError('Vui lòng nhập số điện thoại.'); return; }
    if (!form.licensePlate.trim()) { setError('Vui lòng nhập biển số xe.'); return; }
    if (!form.drivingLicense.trim()) { setError('Vui lòng nhập số bằng lái.'); return; }

    setSaving(true);
    setError('');
    try {
      await adminCreateDeliveryEmployeeWithInfo({
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        email: form.email.trim() || undefined,
        vehicleType: form.vehicleType,
        licensePlate: form.licensePlate.trim(),
        drivingLicense: form.drivingLicense.trim(),
        status: form.status,
      });
      navigate('/admin/delivery-employees');
    } catch (e: any) {
      setError(e.message || 'Tạo nhân viên giao hàng thất bại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/delivery-employees')}
          className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase italic flex items-center gap-2">
            <Truck size={22} className="text-blue-600" /> Thêm nhân viên giao hàng
          </h1>
          <p className="text-sm text-gray-500">Nhập đầy đủ thông tin để tạo hồ sơ shipper mới</p>
        </div>
      </div>

      {/* Info note */}
      {/* <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
      <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-blue-800 font-bold text-sm">Tài khoản tự động</p>
        <p className="text-blue-600 text-xs mt-0.5">
          Hệ thống sẽ tự tạo tài khoản cho nhân viên. Mật khẩu mặc định: <span className="font-mono font-bold">Shipper@123</span>
          {form.email ? '' : <> · Email sẽ được tự sinh nếu để trống.</>}
        </p>
      </div>
    </div> */}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* ── THÔNG TIN CÁ NHÂN ── */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
            <User size={14} /> Thông tin cá nhân
          </h3>
          <div className="space-y-4">
            {/* Họ tên */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-1.5">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="text"
                  value={form.fullName}
                  onChange={e => set('fullName', e.target.value)}
                  placeholder="VD: Nguyễn Văn A"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-1.5">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={e => set('phoneNumber', e.target.value)}
                  placeholder="VD: 0901234567"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Email (tùy chọn) */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-1.5">
                Email <span className="text-gray-400 font-normal normal-case">(tùy chọn)</span>
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="VD: shipper@gmail.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* ── THÔNG TIN PHƯƠNG TIỆN ── */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
            <Truck size={14} /> Thông tin phương tiện
          </h3>
          <div className="space-y-4">
            {/* Loại phương tiện */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                Loại phương tiện <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'MOTORBIKE', icon: '🏍️', label: 'Xe máy', desc: 'Giao hàng nội thành' },
                  { value: 'TRUCK', icon: '🚛', label: 'Xe tải nhỏ', desc: 'Giao hàng cồng kềnh' },
                ].map(v => (
                  <button
                    key={v.value}
                    type="button"
                    onClick={() => set('vehicleType', v.value)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all
                      ${form.vehicleType === v.value
                        ? 'border-blue-500 bg-blue-50 shadow-sm shadow-blue-100'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                  >
                    <span className="text-2xl">{v.icon}</span>
                    <p className="font-bold text-sm text-gray-800 mt-1">{v.label}</p>
                    <p className="text-xs text-gray-400">{v.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Biển số xe */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-1.5">
                Biển số xe <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.licensePlate}
                onChange={e => set('licensePlate', e.target.value.toUpperCase())}
                placeholder="VD: 51G-123.45"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-bold outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 tracking-wider"
                required
              />
            </div>

            {/* Số bằng lái */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-1.5">
                Số bằng lái xe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FileText size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="text"
                  value={form.drivingLicense}
                  onChange={e => set('drivingLicense', e.target.value)}
                  placeholder="Nhập số bằng lái xe"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>
        </div>



        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/admin/delivery-employees')}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          >
            {saving
              ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Đang tạo...</>
              : <><Save size={16} /> Tạo nhân viên</>
            }
          </button>
        </div>
      </form>
    </div>
  );
};
