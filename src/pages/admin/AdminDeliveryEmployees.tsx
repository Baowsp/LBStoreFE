import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Edit, Trash2, Search, RefreshCw, Truck,
  Star, ChevronLeft, ChevronRight, AlertCircle
} from 'lucide-react';
import {
  adminFetchDeliveryEmployees,
  adminDeleteDeliveryEmployee,
} from '../../services/adminApi';

const VEHICLE_LABEL: Record<string, string> = {
  MOTORBIKE: '🏍️ Xe máy',
  TRUCK: '🚛 Xe tải',
};

export const AdminDeliveryEmployees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    adminFetchDeliveryEmployees()
      .then(data => setEmployees(Array.isArray(data) ? data : []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Xóa nhân viên giao hàng "${name}"?\nThao tác này không thể hoàn tác!`)) return;
    try {
      await adminDeleteDeliveryEmployee(id);
      load();
    } catch (e: any) {
      alert('Xóa thất bại: ' + e.message);
    }
  };

  const filtered = employees.filter(e => {
    const name = (e.employee?.user?.fullName ?? '').toLowerCase();
    const plate = (e.licensePlate ?? '').toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || plate.includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase italic flex items-center gap-3">
            <Truck size={24} className="text-blue-600" /> Nhân viên giao hàng
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            {loading ? 'Đang tải...' : `Tổng ${employees.length} nhân viên`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-all" title="Làm mới">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => navigate('/admin/delivery-employees/add')}
            className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-blue-600 transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Thêm nhân viên
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(0); }}
            placeholder="Tìm theo tên, biển số..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
              <tr>
                <th className="px-6 py-4">Nhân viên</th>
                <th className="px-6 py-4">Phương tiện</th>
                <th className="px-6 py-4">Biển số</th>
                <th className="px-6 py-4">Đánh giá</th>
                <th className="px-6 py-4">Đơn thành công</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400 text-sm">Đang tải...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center">
                   <Truck size={40} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 font-medium text-sm">Không tìm thấy nhân viên giao hàng</p>
                </td></tr>
              ) : paginated.map((emp: any) => (
                <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-base bg-blue-50 text-blue-600">
                        {emp.employee?.user?.fullName?.charAt(0) ?? '?'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          {emp.employee?.user?.fullName ?? 'Không rõ'}
                        </p>
                        <p className="text-xs text-gray-400">{emp.employee?.employeeCode ?? `#${emp.id}`}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-600">
                    {VEHICLE_LABEL[emp.vehicleType] ?? emp.vehicleType}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded-lg">
                      {emp.licensePlate}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-bold text-gray-700">{emp.averageRating?.toFixed(1) ?? '5.0'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-700">
                    {emp.successfulDeliveries ?? 0}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => navigate(`/admin/delivery-employees/edit/${emp.id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id, emp.employee?.user?.fullName ?? `#${emp.id}`)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-sm text-gray-500 font-medium">
              Trang {currentPage + 1} / {totalPages} &nbsp;·&nbsp; {filtered.length} nhân viên
            </span>
            <div className="flex items-center gap-2">
              <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}
                className="p-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40">
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => (
                <button key={i} onClick={() => setCurrentPage(i)}
                  className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${i === currentPage ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  {i + 1}
                </button>
              ))}
              <button disabled={currentPage === totalPages - 1} onClick={() => setCurrentPage(p => p + 1)}
                className="p-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
