import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader, Building2, MapPin, Phone, Mail, FileText } from 'lucide-react';
import { adminFetchSupplier, adminUpdateSupplier } from '../../services/adminApi';

export const AdminSupplierEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({ name: '', taxCode: '', email: '', phone: '', address: '', note: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    adminFetchSupplier(Number(id))
      .then(s => setFormData({
        name: s.name ?? '',
        taxCode: s.taxCode ?? '',
        email: s.email ?? '',
        phone: s.phoneNumber ?? s.phone ?? '',
        address: s.address ?? '',
        note: s.note ?? '',
      }))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminUpdateSupplier(Number(id), {
        name: formData.name, taxCode: formData.taxCode, email: formData.email,
        phoneNumber: formData.phone, address: formData.address, note: formData.note,
      });
      navigate('/admin/suppliers');
    } catch (e: any) {
      setError('Cập nhật thất bại: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"/></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/suppliers')} className="p-2 hover:bg-white rounded-full transition-colors text-gray-500"><ArrowLeft size={24}/></button>
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase italic">Chỉnh sửa nhà cung cấp</h1>
          <p className="text-sm text-gray-500 font-medium">Cập nhật thông tin đối tác #{id}</p>
        </div>
      </div>
      {error && <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100">⚠ {error}</div>}
      <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tên nhà cung cấp</label>
            <div className="relative"><Building2 className="absolute left-4 top-3.5 text-gray-400" size={18}/>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"/>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'Mã số thuế', icon: <FileText size={18}/>, key: 'taxCode', type: 'text', req: false },
              { label: 'Số điện thoại', icon: <Phone size={18}/>, key: 'phone', type: 'tel', req: true },
              { label: 'Email liên hệ', icon: <Mail size={18}/>, key: 'email', type: 'email', req: false },
              { label: 'Địa chỉ', icon: <MapPin size={18}/>, key: 'address', type: 'text', req: true },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{f.label}</label>
                <div className="relative"><span className="absolute left-4 top-3.5 text-gray-400">{f.icon}</span>
                  <input type={f.type} required={f.req} value={(formData as any)[f.key]}
                    onChange={e => setFormData({...formData, [f.key]: e.target.value})}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"/>
                </div>
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ghi chú thêm</label>
            <textarea rows={4} value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})}
              className="w-full p-4 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"/>
          </div>
        </div>
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-4">
          <button type="button" onClick={() => navigate('/admin/suppliers')}
            className="px-6 py-3 rounded-xl font-bold text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all">Hủy bỏ</button>
          <button type="submit" disabled={saving}
            className="px-8 py-3 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-70">
            {saving ? <Loader size={18} className="animate-spin"/> : <Save size={18}/>} Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
};