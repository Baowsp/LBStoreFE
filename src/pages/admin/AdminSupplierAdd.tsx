import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader, Building2, MapPin, Phone, Mail, FileText } from 'lucide-react';
import { adminCreateSupplier } from '../../services/adminApi';

export const AdminSupplierAdd = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', taxCode: '', email: '', phone: '', address: '', note: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminCreateSupplier({
        name: formData.name,
        taxCode: formData.taxCode,
        email: formData.email,
        phoneNumber: formData.phone,
        address: formData.address,
        note: formData.note,
      });
      navigate('/admin/suppliers');
    } catch (e: any) {
      setError('Thêm thất bại: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, icon: React.ReactNode, key: keyof typeof formData, type = 'text', required = false, placeholder = '') => (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{label}</label>
      <div className="relative">
        <span className="absolute left-4 top-3.5 text-gray-400">{icon}</span>
        <input type={type} required={required} value={formData[key]}
          onChange={e => setFormData({...formData, [key]: e.target.value})}
          className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"
          placeholder={placeholder}
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/suppliers')} className="p-2 hover:bg-white rounded-full transition-colors text-gray-500"><ArrowLeft size={24}/></button>
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase italic">Thêm nhà cung cấp</h1>
          <p className="text-sm text-gray-500 font-medium">Tạo mới thông tin đối tác</p>
        </div>
      </div>

      {error && <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100">⚠ {error}</div>}

      <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="md:col-span-2">
            {field('Tên nhà cung cấp', <Building2 size={18}/>, 'name', 'text', true, 'VD: Công ty TNHH ABC...')}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {field('Mã số thuế', <FileText size={18}/>, 'taxCode', 'text', false, '')}
            {field('Số điện thoại', <Phone size={18}/>, 'phone', 'tel', true, '')}
            {field('Email liên hệ', <Mail size={18}/>, 'email', 'email', false, '')}
            {field('Địa chỉ', <MapPin size={18}/>, 'address', 'text', true, '')}
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ghi chú thêm</label>
            <textarea rows={4} value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})}
              className="w-full p-4 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"
              placeholder="Thông tin thêm về nhà cung cấp..."
            />
          </div>
        </div>
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-4">
          <button type="button" onClick={() => navigate('/admin/suppliers')}
            className="px-6 py-3 rounded-xl font-bold text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all">Hủy bỏ</button>
          <button type="submit" disabled={saving}
            className="px-8 py-3 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-70">
            {saving ? <Loader size={18} className="animate-spin"/> : <Save size={18}/>} Lưu nhà cung cấp
          </button>
        </div>
      </form>
    </div>
  );
};