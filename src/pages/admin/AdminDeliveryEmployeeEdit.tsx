import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Truck, Save, AlertCircle } from 'lucide-react';
import { adminFetchDeliveryEmployee, adminUpdateDeliveryEmployee } from '../../services/adminApi';


export const AdminDeliveryEmployeeEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [empName, setEmpName] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empEmail, setEmpEmail] = useState('');

  const [form, setForm] = useState({
    vehicleType: 'MOTORBIKE',
    licensePlate: '',
    drivingLicense: '',
    status: 'OFFLINE',
  });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    adminFetchDeliveryEmployee(Number(id))
      .then((data: any) => {
        setForm({
          vehicleType: data.vehicleType ?? 'MOTORBIKE',
          licensePlate: data.licensePlate ?? '',
          drivingLicense: data.drivingLicense ?? '',
          status: data.status ?? 'OFFLINE',
        });
        setEmpName(data.employee?.user?.fullName ?? `Nhân viên #${id}`);
        setEmpPhone(data.employee?.user?.phoneNumber ?? '');
        setEmpEmail(data.employee?.user?.email ?? '');
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.licensePlate.trim()) { setError('Vui lòng nhập biển số xe.'); return; }
    if (!form.drivingLicense.trim()) { setError('Vui lòng nhập số bằng lái.'); return; }

    setSaving(true);
    setError('');
    try {
      await adminUpdateDeliveryEmployee(Number(id), {
        vehicleType: form.vehicleType,
        licensePlate: form.licensePlate.trim().toUpperCase(),
        drivingLicense: form.drivingLicense.trim(),
        status: form.status,
      });
      navigate('/admin/delivery-employees');
    } catch (e: any) {
      setError(e.message || 'Cập nhật thất bại.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-4 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

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
            <Truck size={22} className="text-blue-600" /> Chỉnh sửa nhân viên
          </h1>
          <p className="text-sm text-gray-500">{empName}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Thông tin cá nhân (read-only) */}
        <div className="space-y-3 pb-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">Thông tin cá nhân</h3>
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-1.5">Họ tên</label>
            <div className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-700">{empName}</div>
          </div>
          {empPhone && (
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-1.5">Số điện thoại</label>
              <div className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">{empPhone}</div>
            </div>
          )}
          {empEmail && (
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-1.5">Email</label>
              <div className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">{empEmail}</div>
            </div>
          )}
          <p className="text-xs text-gray-400">Thông tin cá nhân không thể chỉnh sửa tại đây</p>
        </div>

        <hr className="border-gray-100" />

        {/* Loại phương tiện */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
            Loại phương tiện <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'MOTORBIKE', label: '🏍️ Xe máy', desc: 'Giao hàng nội thành' },
              { value: 'TRUCK', label: '🚛 Xe tải nhỏ', desc: 'Giao hàng cồng kềnh' },
            ].map(v => (
              <button
                key={v.value}
                type="button"
                onClick={() => handleChange('vehicleType', v.value)}
                className={`p-4 rounded-2xl border-2 text-left transition-all
                  ${form.vehicleType === v.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'}`}
              >
                <p className="font-bold text-sm text-gray-800">{v.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{v.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Biển số xe */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
            Biển số xe <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.licensePlate}
            onChange={e => handleChange('licensePlate', e.target.value)}
            placeholder="VD: 51G-123.45"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-bold outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
            required
          />
        </div>

        {/* Số bằng lái */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
            Số bằng lái xe <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.drivingLicense}
            onChange={e => handleChange('drivingLicense', e.target.value)}
            placeholder="Nhập số bằng lái xe"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
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
            {saving ? 'Đang lưu...' : <><Save size={16} /> Lưu thay đổi</>}
          </button>
        </div>
      </form>
    </div>
  );
};
