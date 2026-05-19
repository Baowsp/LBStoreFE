import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader, Smartphone, Hash, FileText, User, Phone } from 'lucide-react';

// Note: AdminWarrantyAdd yêu cầu productItemId và customerId từ backend.
// Hiện tại form cho phép nhập thông số để tạo phiếu tự thủ công.
// Cần tích hợp dropdown nếu muốn chọn từ danh sách.

export const AdminWarrantyAdd = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productItemId: '',
    customerId: '',
    issueDescription: '',
    note: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8080/api/v1/warranty-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productItem: { id: Number(formData.productItemId) },
          customer: { id: Number(formData.customerId) },
          issueDescription: formData.issueDescription,
          notes: formData.note,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      navigate('/admin/warranties');
    } catch (e: any) {
      setError('Tạo phiếu thất bại: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/warranties')} className="p-2 hover:bg-white rounded-full transition-colors text-gray-500"><ArrowLeft size={24}/></button>
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase italic">Đăng ký bảo hành</h1>
          <p className="text-sm text-gray-500 font-medium">Tạo phiếu bảo hành mới</p>
        </div>
      </div>

      {error && <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100">⚠ {error}</div>}

      <div className="mb-4 bg-blue-50 text-blue-700 p-4 rounded-2xl text-sm border border-blue-100">
        <p className="font-bold">📋 Lưu ý:</p>
        <p>Nhập ID sản phẩm (ProductItem ID) và ID khách hàng (Customer ID) từ hệ thống. Bạn có thể tìm các ID này trong trang quản lý sản phẩm và người dùng.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">ID Sản phẩm (ProductItem)</label>
              <div className="relative"><Smartphone className="absolute left-4 top-3.5 text-gray-400" size={18}/>
                <input type="number" required min="1" value={formData.productItemId}
                  onChange={e => setFormData({...formData, productItemId: e.target.value})}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"
                  placeholder="VD: 1, 2, 3..."/>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">ID Khách hàng (Customer)</label>
              <div className="relative"><User className="absolute left-4 top-3.5 text-gray-400" size={18}/>
                <input type="number" required min="1" value={formData.customerId}
                  onChange={e => setFormData({...formData, customerId: e.target.value})}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"
                  placeholder="VD: 1, 2, 3..."/>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mô tả lỗi / Yêu cầu bảo hành</label>
            <div className="relative"><FileText className="absolute left-4 top-3.5 text-gray-400" size={18}/>
              <textarea rows={4} required value={formData.issueDescription}
                onChange={e => setFormData({...formData, issueDescription: e.target.value})}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"
                placeholder="Mô tả chi tiết tình trạng thiết bị..."/>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ghi chú thêm</label>
            <textarea rows={3} value={formData.note}
              onChange={e => setFormData({...formData, note: e.target.value})}
              className="w-full p-4 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"
              placeholder="Thông tin bổ sung..."/>
          </div>
        </div>
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-4">
          <button type="button" onClick={() => navigate('/admin/warranties')}
            className="px-6 py-3 rounded-xl font-bold text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all">Hủy bỏ</button>
          <button type="submit" disabled={saving}
            className="px-8 py-3 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-70">
            {saving ? <Loader size={18} className="animate-spin"/> : <Save size={18}/>} Tạo phiếu bảo hành
          </button>
        </div>
      </form>
    </div>
  );
};