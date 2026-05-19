import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader, User, Mail, Phone, Lock, Shield } from 'lucide-react';
import { adminCreateUser } from '../../services/adminApi';

const ROLE_OPTIONS = [
  { value: 'CUSTOMER', label: 'Khách hàng' },
  { value: 'EMPLOYEE', label: 'Nhân viên' },
  { value: 'ADMIN', label: 'Quản trị viên (Admin)' },
];

export const AdminUserAdd = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: '', email: '', phoneNumber: '', password: '', role: 'CUSTOMER' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminCreateUser(formData);
      navigate('/admin/users');
    } catch (e: any) {
      setError('Thêm thất bại: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/users')} className="p-2 hover:bg-white rounded-full transition-colors text-gray-500"><ArrowLeft size={24}/></button>
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase italic">Thêm thành viên mới</h1>
          <p className="text-sm text-gray-500 font-medium">Tạo tài khoản cho khách hàng hoặc nhân viên</p>
        </div>
      </div>

      {error && <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100">⚠ {error}</div>}

      <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'Họ và tên', icon: <User size={18}/>, key: 'fullName', type: 'text', req: true, placeholder: 'Nguyễn Văn A' },
              { label: 'Số điện thoại', icon: <Phone size={18}/>, key: 'phoneNumber', type: 'tel', req: true, placeholder: '0987xxx' },
              { label: 'Email', icon: <Mail size={18}/>, key: 'email', type: 'email', req: true, placeholder: 'example@gmail.com' },
              { label: 'Mật khẩu', icon: <Lock size={18}/>, key: 'password', type: 'password', req: true, placeholder: '••••••••' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{f.label}</label>
                <div className="relative"><span className="absolute left-4 top-3.5 text-gray-400">{f.icon}</span>
                  <input type={f.type} required={f.req} placeholder={f.placeholder}
                    value={(formData as any)[f.key]}
                    onChange={e => setFormData({...formData, [f.key]: e.target.value})}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500 bg-gray-50 focus:bg-white transition-all"/>
                </div>
              </div>
            ))}
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
            {saving ? <Loader size={18} className="animate-spin"/> : <Save size={18}/>} Lưu thành viên
          </button>
        </div>
      </form>
    </div>
  );
};
