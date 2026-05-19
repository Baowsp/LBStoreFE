import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Search, RefreshCw, Smartphone, Wrench, CheckSquare, PackageCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminFetchWarranties } from '../../services/adminApi';

const WARRANTY_STATUS_VI: Record<string, string> = {
  RECEIVED: 'Đã tiếp nhận',
  IN_PROGRESS: 'Đang sửa',
  COMPLETED: 'Đã sửa xong',
  RETURNED: 'Đã trả máy',
  CANCELLED: 'Đã hủy',
};

const STAGE_COLOR: Record<string, string> = {
  RECEIVED: 'bg-gray-100 text-gray-600',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  RETURNED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
};

const TABS = ['Tất cả', 'RECEIVED', 'IN_PROGRESS', 'COMPLETED', 'RETURNED'];
const TAB_LABEL: Record<string, string> = {
  'Tất cả': 'Tất cả', RECEIVED: 'Đã tiếp nhận', IN_PROGRESS: 'Đang sửa',
  COMPLETED: 'Đã sửa xong', RETURNED: 'Đã trả máy',
};

export const AdminWarranty = () => {
  const navigate = useNavigate();
  const [warranties, setWarranties] = useState<any[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [error, setError] = useState('');

  const loadWarranties = useCallback((page: number) => {
    setLoading(true);
    setError('');
    adminFetchWarranties(page)
      .then(({ content, totalElements, totalPages }) => {
        setWarranties(content);
        setTotalElements(totalElements);
        setTotalPages(totalPages);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadWarranties(0); }, [loadWarranties]);

  const filtered = warranties.filter(w => {
    const matchSearch =
      (w.productItem?.product?.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.customer?.user?.fullName ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.serialNumber ?? '').includes(searchTerm);
    const matchTab = activeTab === 'Tất cả' ? true : w.status === activeTab;
    return matchSearch && matchTab;
  });

  const goToPage = (page: number) => {
    setCurrentPage(page);
    loadWarranties(page);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase italic">Quản lý bảo hành</h1>
          <p className="text-sm text-gray-500 font-medium">
            {loading ? 'Đang tải...' : `Tổng ${totalElements} phiếu bảo hành`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => loadWarranties(currentPage)} className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-all">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''}/>
          </button>
          <button onClick={() => navigate('/admin/warranties/add')}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2">
            <Plus size={18}/> Đăng ký bảo hành
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100">⚠ {error}</div>}

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-4">
          {TABS.map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); setCurrentPage(0); loadWarranties(0); }}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
              {TAB_LABEL[tab]}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20}/>
          <input type="text" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(0); }}
            placeholder="Lọc trong trang hiện tại..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"/>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Sản phẩm / Serial</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Mô tả lỗi</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">Đang tải...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">Không có phiếu bảo hành.</td></tr>
              ) : filtered.map(w => (
                <tr key={w.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-bold text-gray-500">#{w.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <Smartphone size={20}/>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{w.productItem?.product?.name ?? 'N/A'}</p>
                        <p className="text-xs text-gray-400 font-mono">Serial: {w.serialNumber ?? 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-800">{w.customer?.user?.fullName ?? 'N/A'}</p>
                    <p className="text-xs text-gray-500">{w.customer?.user?.phoneNumber ?? ''}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate">{w.issueDescription ?? 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 w-fit ${STAGE_COLOR[w.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {w.status === 'IN_PROGRESS' && <Wrench size={12}/>}
                      {w.status === 'COMPLETED' && <CheckSquare size={12}/>}
                      {w.status === 'RETURNED' && <PackageCheck size={12}/>}
                      {WARRANTY_STATUS_VI[w.status] ?? w.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => navigate(`/admin/warranties/edit/${w.id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit size={18}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-sm text-gray-500 font-medium">
              Trang {currentPage + 1} / {totalPages} &nbsp;·&nbsp; Tổng {totalElements} phiếu bảo hành
            </span>
            <div className="flex items-center gap-2">
              <button disabled={currentPage === 0} onClick={() => goToPage(currentPage - 1)}
                className="p-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-all transition-all">
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = totalPages <= 7 ? i : currentPage < 4 ? i : currentPage > totalPages - 4 ? totalPages - 7 + i : currentPage - 3 + i;
                return (
                  <button key={p} onClick={() => goToPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${p === currentPage ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {p + 1}
                  </button>
                );
              })}
              <button disabled={currentPage === totalPages - 1} onClick={() => goToPage(currentPage + 1)}
                className="p-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-all transition-all">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};