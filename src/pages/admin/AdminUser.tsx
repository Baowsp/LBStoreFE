import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, RefreshCw, Phone, Mail, Shield, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminFetchUsers, adminDeleteUser } from '../../services/adminApi';

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Admin', CUSTOMER: 'Khách hàng', EMPLOYEE: 'Nhân viên',
  MANAGER: 'Quản lý', SALES_EMPLOYEE: 'NV Bán hàng',
  DELIVERY_EMPLOYEE: 'NV Giao hàng', WAREHOUSE_EMPLOYEE: 'NV Kho',
};

export const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const loadUsers = useCallback((page: number, size: number) => {
    setLoading(true);
    setError('');
    adminFetchUsers(page, size)
      .then(({ content, totalElements, totalPages }) => {
        setUsers(content);
        setTotalElements(totalElements);
        setTotalPages(totalPages);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadUsers(0, pageSize); }, [loadUsers, pageSize]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`⚠ CẢNH BÁO: Xóa vĩnh viễn tài khoản "${name}"?\nThao tác này sẽ tự động xóa LUÔN toàn bộ Lịch sử đơn hàng, Địa chỉ và Bình luận của khách hàng này khỏi hệ thống. KHÔNG THỂ KHÔI PHỤC!`)) return;
    try {
      await adminDeleteUser(id);
      loadUsers(currentPage, pageSize);
    } catch (e: any) {
      alert('Xóa thất bại: ' + e.message);
    }
  };

  const displayedUsers = searchTerm
    ? users.filter(u =>
        (u.fullName ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.phoneNumber ?? '').includes(searchTerm)
      )
    : users;

  const goToPage = (page: number) => {
    setCurrentPage(page);
    loadUsers(page, pageSize);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase italic">Quản lý người dùng</h1>
          <p className="text-sm text-gray-500 font-medium">
            {loading ? 'Đang tải...' : `Tổng ${totalElements} người dùng`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => loadUsers(currentPage, pageSize)} className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-all">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''}/>
          </button>
          <button onClick={() => navigate('/admin/users/add')}
            className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-red-600 transition-all flex items-center gap-2">
            <Plus size={18}/> Thêm thành viên
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100">⚠ {error}</div>}

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20}/>
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder="Lọc trong trang hiện tại..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium"/>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500">Hiển thị:</span>
          <select 
            value={pageSize}
            onChange={(e) => {
              const newSize = parseInt(e.target.value);
              setPageSize(newSize);
              setCurrentPage(0);
            }}
            className="bg-gray-50 border border-gray-100 text-gray-700 text-sm rounded-xl focus:ring-red-500 focus:border-red-500 block p-2 outline-none font-medium"
          >
            <option value="5">5 dòng</option>
            <option value="10">10 dòng</option>
            <option value="20">20 dòng</option>
            <option value="50">50 dòng</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
              <tr>
                <th className="px-6 py-4">Thông tin</th>
                <th className="px-6 py-4">Liên hệ</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Đang tải...</td></tr>
              ) : displayedUsers.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Không tìm thấy người dùng.</td></tr>
              ) : displayedUsers.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200">
                        <User size={20}/>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{u.fullName ?? 'N/A'}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-600"><Phone size={12}/> {u.phoneNumber ?? 'N/A'}</div>
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-400"><Mail size={12}/> {u.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Shield size={14} className={u.role === 'ADMIN' ? 'text-red-600' : 'text-gray-400'}/>
                      <span className={`text-sm font-bold ${u.role === 'ADMIN' ? 'text-red-600' : 'text-gray-700'}`}>
                        {ROLE_LABEL[u.role] ?? u.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${u.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {u.isActive ? 'Hoạt động' : 'Đã vô hiệu'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => navigate(`/admin/users/edit/${u.id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit size={18}/>
                      </button>
                      <button onClick={() => handleDelete(u.id, u.fullName)}
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
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-sm text-gray-500 font-medium">
              Trang {currentPage + 1} / {totalPages} &nbsp;·&nbsp; Tổng {totalElements} người dùng
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
