import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye, Search, RefreshCw, ChevronLeft, ChevronRight,
  CheckSquare, Truck, X
} from 'lucide-react';
import { adminFetchOrders } from '../../services/adminApi';
import { OrderToast } from '../../components/admin/OrderToast';
import { ShipperAssignmentModal } from '../../components/admin/ShipperAssignmentModal';

const STATUS_VI: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang xử lý',
  PACKING: 'Đang đóng gói',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  RETURNED: 'Trả hàng',
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  PACKING: 'bg-orange-100 text-orange-700',
  SHIPPING: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  RETURNED: 'bg-gray-100 text-gray-600',
};

export const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [error, setError] = useState('');

  // Approval mode
  const [approvalMode, setApprovalMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Shipper modal
  const [showShipperModal, setShowShipperModal] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const loadOrders = useCallback((page: number, size: number) => {
    setLoading(true);
    setError('');
    adminFetchOrders(page, size)
      .then(({ content, totalElements, totalPages }) => {
        setOrders(content);
        setTotalElements(totalElements);
        setTotalPages(totalPages);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadOrders(0, pageSize); }, [loadOrders, pageSize]);

  const displayedOrders = orders.filter(o => {
    const matchSearch =
      (o.orderNumber ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.shippingName ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const statusFilter = approvalMode ? ['PENDING', 'CONFIRMED'] : filterStatus ? [filterStatus] : null;
    const matchStatus = statusFilter ? statusFilter.includes(o.status) : true;
    return matchSearch && matchStatus;
  });

  const goToPage = (page: number) => {
    setCurrentPage(page);
    loadOrders(page, pageSize);
  };

  const toggleApprovalMode = () => {
    setApprovalMode(v => !v);
    setSelectedIds(new Set());
    setFilterStatus('');
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const approvable = displayedOrders.filter(o => o.status === 'PENDING' || o.status === 'CONFIRMED');
    if (selectedIds.size === approvable.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(approvable.map((o: any) => o.id)));
    }
  };

  const openShipperModal = () => {
    setShowShipperModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && <OrderToast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase italic">Quản lý đơn hàng</h1>
          <p className="text-sm text-gray-500 font-medium">
            {loading ? 'Đang tải...' : `Tổng ${totalElements} đơn hàng`}
            {approvalMode && (
              <span className="ml-2 text-amber-600 font-bold">
                · Chế độ duyệt đơn – đã chọn {selectedIds.size} đơn
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadOrders(currentPage, pageSize)}
            className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-all"
            title="Làm mới"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>

          {approvalMode ? (
            <>
              {/* Duyệt đơn hàng button */}
              <button
                onClick={openShipperModal}
                disabled={selectedIds.size === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all
                  bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Truck size={18} />
                Duyệt đơn hàng ({selectedIds.size})
              </button>
              {/* Hủy */}
              <button
                onClick={toggleApprovalMode}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-all"
              >
                <X size={16} /> Hủy
              </button>
            </>
          ) : (
            <button
              onClick={toggleApprovalMode}
              className="flex items-center gap-2 bg-amber-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-amber-600 transition-all"
            >
              <CheckSquare size={18} /> Duyệt đơn
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100">⚠ {error}</div>
      )}

      {/* Approval Mode Banner */}
      {approvalMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckSquare size={20} className="text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-amber-800 font-bold text-sm">Chế độ Duyệt Đơn đang bật</p>
            {/* <p className="text-amber-600 text-xs">Chỉ hiển thị đơn PENDING / CONFIRMED. Tích chọn đơn muốn duyệt rồi nhấn "Duyệt đơn hàng".</p> */}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Lọc trong trang hiện tại..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium"
          />
        </div>
        <div className="flex items-center gap-2">
          {!approvalMode && (
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 outline-none focus:border-red-500"
            >
              <option value="">Tất cả trạng thái</option>
              {Object.entries(STATUS_VI).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          )}
          <span className="text-sm font-medium text-gray-500 ml-2">Hiển thị:</span>
          <select
            value={pageSize}
            onChange={e => { setPageSize(parseInt(e.target.value)); setCurrentPage(0); }}
            className="bg-gray-50 border border-gray-100 text-gray-700 text-sm rounded-xl focus:ring-red-500 focus:border-red-500 block p-2 outline-none font-medium"
          >
            <option value="5">5 dòng</option>
            <option value="10">10 dòng</option>
            <option value="20">20 dòng</option>
            <option value="50">50 dòng</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
              <tr>
                {approvalMode && (
                  <th className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={
                        displayedOrders.filter(o => o.status === 'PENDING' || o.status === 'CONFIRMED').length > 0 &&
                        displayedOrders
                          .filter(o => o.status === 'PENDING' || o.status === 'CONFIRMED')
                          .every(o => selectedIds.has(o.id))
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-amber-500 cursor-pointer"
                    />
                  </th>
                )}
                <th className="px-6 py-4">Mã đơn</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Tổng tiền</th>
                <th className="px-6 py-4">Thanh toán</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={approvalMode ? 7 : 6} className="px-6 py-10 text-center text-gray-400 text-sm">Đang tải dữ liệu...</td></tr>
              ) : displayedOrders.length === 0 ? (
                <tr><td colSpan={approvalMode ? 7 : 6} className="px-6 py-10 text-center text-gray-400 text-sm">
                  {approvalMode ? 'Không có đơn hàng đang chờ xử lý.' : 'Không tìm thấy đơn hàng.'}
                </td></tr>
              ) : displayedOrders.map(order => {
                const isApprovable = order.status === 'PENDING' || order.status === 'CONFIRMED';
                const isChecked = selectedIds.has(order.id);
                return (
                  <tr
                    key={order.id}
                    className={`hover:bg-gray-50/50 transition-colors ${approvalMode && isChecked ? 'bg-amber-50/60' : ''}`}
                  >
                    {approvalMode && (
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          disabled={!isApprovable}
                          checked={isChecked}
                          onChange={() => toggleSelect(order.id)}
                          className="w-4 h-4 accent-amber-500 cursor-pointer disabled:opacity-30"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm font-bold text-gray-800">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">
                      {order.shippingName ?? 'N/A'}<br />
                      <span className="text-xs text-gray-400">{order.shippingPhone}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-red-600">
                      {Number(order.finalAmount ?? 0).toLocaleString('vi-VN')}đ
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">{order.paymentMethod}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {STATUS_VI[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-sm text-gray-500 font-medium">
              Trang {currentPage + 1} / {totalPages} &nbsp;·&nbsp; Tổng {totalElements} đơn hàng
            </span>
            <div className="flex items-center gap-2">
              <button disabled={currentPage === 0} onClick={() => goToPage(currentPage - 1)}
                className="p-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-all">
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
                className="p-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-all">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <ShipperAssignmentModal
        isOpen={showShipperModal}
        onClose={() => setShowShipperModal(false)}
        selectedIds={selectedIds}
        onAssignFinished={({ successCount, failCount }) => {
          setApprovalMode(false);
          setSelectedIds(new Set());
          loadOrders(currentPage, pageSize);
          if (failCount === 0) {
            setToast({ msg: `✅ Duyệt và phân công ${successCount} đơn hàng thành công!`, type: 'success' });
          } else {
            setToast({ msg: `Thành công ${successCount}, thất bại ${failCount} đơn.`, type: 'error' });
          }
        }}
      />
    </div>
  );
};