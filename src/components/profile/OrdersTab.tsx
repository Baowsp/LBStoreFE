import { useState } from 'react';
import { Package, ChevronRight, Clock, Truck, CheckCircle2, XCircle } from 'lucide-react';

interface OrdersTabProps {
  orders: any[];
  loadingOrders: boolean;
  setSelectedOrderForModal: (order: any) => void;
}

export const OrdersTab = ({ orders, loadingOrders, setSelectedOrderForModal }: OrdersTabProps) => {
  const [orderFilter, setOrderFilter] = useState('ALL');

  const ORDER_STATUS_MAP: Record<string, { label: string, color: string, icon: any }> = {
    PENDING: { label: 'Chờ xử lý', color: 'text-yellow-600 bg-yellow-50 border-yellow-100', icon: <Clock size={14} /> },
    PROCESSING: { label: 'Đang xử lý', color: 'text-blue-600 bg-blue-50 border-blue-100', icon: <Package size={14} /> },
    SHIPPING: { label: 'Đang giao hàng', color: 'text-purple-600 bg-purple-50 border-purple-100', icon: <Truck size={14} /> },
    DELIVERED: { label: 'Đã hoàn thành', color: 'text-green-600 bg-green-50 border-green-100', icon: <CheckCircle2 size={14} /> },
    CANCELLED: { label: 'Đã hủy', color: 'text-red-600 bg-red-50 border-red-100', icon: <XCircle size={14} /> },
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 animate-in fade-in slide-in-from-right-4 transition-all overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h2 className="text-xl font-black text-gray-800 uppercase italic">Lịch sử mua hàng</h2>

        {/* Status Filters */}
        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-2xl overflow-x-auto no-scrollbar">
          {['ALL', 'PENDING', 'SHIPPING', 'DELIVERED', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => setOrderFilter(status)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                orderFilter === status
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {status === 'ALL' ? 'Tất cả' : (ORDER_STATUS_MAP[status]?.label || status)}
            </button>
          ))}
        </div>
      </div>

      {loadingOrders ? (
        <div className="flex flex-col items-center justify-center p-20 text-gray-400">
          <div className="w-12 h-12 border-4 border-gray-100 border-t-red-600 rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-bold uppercase tracking-widest">Đang tải lịch sử đơn hàng...</p>
        </div>
      ) : orders.filter(o => orderFilter === 'ALL' || o.status === orderFilter).length > 0 ? (
        <div className="space-y-6">
          {orders
            .filter(o => orderFilter === 'ALL' || o.status === orderFilter)
            .map((order) => {
              const statusInfo = ORDER_STATUS_MAP[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-600', icon: <Package size={14} /> };
              const items = order.onlineOrderDetails || [];

              return (
                <div key={order.id} className="group bg-white rounded-3xl border border-gray-100 hover:border-red-100 transition-all duration-300">
                  {/* Summary View */}
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-black text-gray-900 text-lg">#{order.orderNumber}</span>
                          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${statusInfo.color}`}>
                            {statusInfo.icon}
                            {statusInfo.label}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 font-bold">
                          <span>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span>{items.length} sản phẩm</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                        <div className="text-xl font-black text-red-600">
                          {(order.finalAmount || order.totalAmount).toLocaleString()}đ
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                          <button
                            onClick={() => {
                              console.log("🛒 Order Detail JSON:", order);
                              setSelectedOrderForModal(order);
                            }}
                            className="flex-1 md:flex-none px-8 py-3 bg-gray-900 text-white text-[10px] font-black rounded-xl hover:bg-red-600 transition-all uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                          >
                            Chi tiết đơn hàng
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
            <Package size={40} className="text-gray-200" />
          </div>
          <h3 className="text-lg font-black text-gray-800 uppercase italic">Chưa có đơn hàng</h3>
          <p className="text-gray-400 font-bold text-sm mt-1 max-w-xs mx-auto">Có vẻ như bạn chưa đặt mua sản phẩm nào ở trạng thái này.</p>
          <button className="mt-8 px-8 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-100 transition-all hover:bg-red-700 active:scale-95 group">
            Mua sắm ngay <ChevronRight size={16} className="inline ml-1 group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      )}
    </div>
  );
};
