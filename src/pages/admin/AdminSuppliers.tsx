import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, MapPin, Phone, Mail, Building2, RefreshCw } from 'lucide-react';
import { adminFetchSuppliers, adminDeleteSupplier } from '../../services/adminApi';

export const AdminSuppliers = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [error, setError] = useState('');

  const loadSuppliers = () => {
    setLoading(true);
    setError('');
    adminFetchSuppliers()
      .then(setSuppliers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadSuppliers(); }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Xóa nhà cung cấp "${name}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await adminDeleteSupplier(id);
      setSuppliers(prev => prev.filter(s => s.id !== id));
    } catch (e: any) {
      alert('Xóa thất bại: ' + e.message);
    }
  };

  const filtered = suppliers.filter(s =>
    (s.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.phoneNumber ?? s.phone ?? '').includes(searchTerm) ||
    (s.taxCode ?? '').includes(searchTerm)
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase italic">Nhà cung cấp</h1>
          <p className="text-sm text-gray-500 font-medium">{loading ? 'Đang tải...' : `${suppliers.length} nhà cung cấp`}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadSuppliers} className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-all">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => navigate('/admin/suppliers/add')}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2">
            <Plus size={18} /> Thêm nhà cung cấp
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100">⚠ {error}</div>}

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <input type="text" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="Tìm tên, SĐT, mã số thuế..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Nhà cung cấp</th>
                <th className="px-6 py-4">Liên hệ</th>
                <th className="px-6 py-4">Địa chỉ</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Đang tải...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Không tìm thấy nhà cung cấp.</td></tr>
              ) : paginated.map(s => (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-bold text-gray-500">#{s.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{s.name}</p>
                        <p className="text-xs text-gray-400">MST: {s.taxCode ?? 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                        <Phone size={12}/> {s.phoneNumber ?? s.phone ?? 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                        <Mail size={12}/> {s.email ?? 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2 text-xs text-gray-600 max-w-xs">
                      <MapPin size={14} className="flex-shrink-0 mt-0.5 text-gray-400"/>
                      {s.address ?? 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => navigate(`/admin/suppliers/edit/${s.id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit size={18}/>
                      </button>
                      <button onClick={() => handleDelete(s.id, s.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && filtered.length > 0 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-sm text-gray-500 font-medium">
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} đến {Math.min(currentPage * itemsPerPage, filtered.length)} trên tổng {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all">
                Trước
              </button>
              <span className="text-sm font-bold text-gray-600 px-2">Trang {currentPage} / {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all">
                Tiếp
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};