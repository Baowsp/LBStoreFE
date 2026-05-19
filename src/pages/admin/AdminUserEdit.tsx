import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader, User, Mail, Phone, Shield } from 'lucide-react';
import { adminFetchUser, adminUpdateUser } from '../../services/adminApi';

const ROLE_OPTIONS = [
  { value: 'CUSTOMER', label: 'Khách hàng' },
  { value: 'EMPLOYEE', label: 'Nhân viên' },
  { value: 'ADMIN', label: 'Quản trị viên (Admin)' },
];

export const AdminUserEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({ fullName: '', email: '', phoneNumber: '', role: 'CUSTOMER' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    adminFetchUser(id)
      .then(u => setFormData({
        fullName: u.fullName ?? '',
        email: u.email ?? '',
        phoneNumber: u.phoneNumber ?? '',
        role: u.role ?? 'CUSTOMER',
      }))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminUpdateUser(id!, {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        role: formData.role,
      });
      navigate('/admin/users');
    } catch (e: any) {
      setError('Cập nhật thất bại: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin"/></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/users')} className="p-2 hover:bg-white rounded-full transition-colors text-gray-500"><ArrowLeft size={24}/></button>
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase italic">Chỉnh sửa thành viên</h1>
          <p className="text-sm text-gray-500 font-medium">Cập nhật thông tin – ID: #{id?.substring(0, 8)}...</p>
        </div>
      </div>
      {error && <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100">⚠ {error}</div>}
      <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'Họ và tên', icon: <User size={18}/>, key: 'fullName', type: 'text', req: true },
              { label: 'Số điện thoại', icon: <Phone size={18}/>, key: 'phoneNumber', type: 'tel', req: true },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{f.label}</label>
                <div className="relative"><span className="absolute left-4 top-3.5 text-gray-400">{f.icon}</span>
                  <input type={f.type} required={f.req} value={(formData as any)[f.key]}
                    onChange={e => setFormData({...formData, [f.key]: e.target.value})}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500 bg-gray-50 focus:bg-white transition-all"/>
                </div>
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email</label>
            <div className="relative"><Mail className="absolute left-4 top-3.5 text-gray-400" size={18}/>
              <input type="email" value={formData.email} readOnly
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-100 text-sm font-bold bg-gray-100 text-gray-400 cursor-not-allowed"/>
            </div>
            <p className="text-xs text-gray-400 mt-1 ml-1">Email không thể thay đổi sau khi đăng ký.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Vai trò (Role)</label>
            <div className="relative"><Shield className="absolute left-4 top-3.5 text-gray-400" size={18}/>
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500 bg-gray-50 focus:bg-white transition-all appearance-none">
                {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-4">
          <button type="button" onClick={() => navigate('/admin/users')}
            className="px-6 py-3 rounded-xl font-bold text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all">Hủy bỏ</button>
          <button type="submit" disabled={saving}
            className="px-8 py-3 rounded-xl font-bold text-sm text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 transition-all flex items-center gap-2 disabled:opacity-70">
            {saving ? <Loader size={18} className="animate-spin"/> : <Save size={18}/>} Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
};
