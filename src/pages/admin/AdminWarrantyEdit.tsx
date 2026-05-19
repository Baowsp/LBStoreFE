import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader, Smartphone, FileText } from 'lucide-react';
import { adminFetchWarranty, adminUpdateWarrantyStatus } from '../../services/adminApi';

const STATUS_OPTIONS = [
  { value: 'RECEIVED', label: '✅ Đã tiếp nhận' },
  { value: 'IN_PROGRESS', label: '🔧 Đang sửa' },
  { value: 'COMPLETED', label: '☑ Đã sửa xong' },
  { value: 'RETURNED', label: '📦 Đã trả máy' },
  { value: 'CANCELLED', label: '❌ Đã hủy' },
];

export const AdminWarrantyEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    adminFetchWarranty(Number(id))
      .then(t => { setTicket(t); setNewStatus(t.status ?? 'RECEIVED'); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminUpdateWarrantyStatus(Number(id), newStatus, notes);
      navigate('/admin/warranties');
    } catch (e: any) {
      setError('Cập nhật thất bại: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"/></div>;
  if (error && !ticket) return <div className="text-center py-16 text-red-500 font-bold">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/warranties')} className="p-2 hover:bg-white rounded-full transition-colors text-gray-500"><ArrowLeft size={24}/></button>
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase italic">Chỉnh sửa bảo hành</h1>
          <p className="text-sm text-gray-500 font-medium">Cập nhật trạng thái phiếu #{id}</p>
        </div>
      </div>

      {error && <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100">⚠ {error}</div>}

      {/* Thông tin phiếu (readonly) */}
      {ticket && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wide">Thông tin phiếu bảo hành</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">Sản phẩm</p>
              <p className="font-bold flex items-center gap-2"><Smartphone size={16} className="text-blue-600"/> {ticket.productItem?.product?.name ?? 'N/A'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">Serial Number</p>
              <p className="font-mono font-bold">{ticket.serialNumber ?? 'N/A'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">Khách hàng</p>
              <p className="font-bold">{ticket.customer?.user?.fullName ?? 'N/A'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">Mô tả lỗi</p>
              <p className="text-gray-700">{ticket.issueDescription ?? 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form cập nhật trạng thái */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Cập nhật trạng thái</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {STATUS_OPTIONS.map(opt => (
                <button key={opt.value} type="button" onClick={() => setNewStatus(opt.value)}
                  className={`p-4 rounded-xl text-sm font-bold text-left transition-all border-2 ${newStatus === opt.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ghi chú kỹ thuật</label>
            <div className="relative"><FileText className="absolute left-4 top-3.5 text-gray-400" size={18}/>
              <textarea rows={4} value={notes} onChange={e => setNotes(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"
                placeholder="Mô tả công việc đã thực hiện, kết quả kiểm tra..."/>
            </div>
          </div>
        </div>
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-4">
          <button type="button" onClick={() => navigate('/admin/warranties')}
            className="px-6 py-3 rounded-xl font-bold text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all">Hủy bỏ</button>
          <button type="submit" disabled={saving}
            className="px-8 py-3 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-70">
            {saving ? <Loader size={18} className="animate-spin"/> : <Save size={18}/>} Lưu trạng thái
          </button>
        </div>
      </form>
    </div>
  );
};