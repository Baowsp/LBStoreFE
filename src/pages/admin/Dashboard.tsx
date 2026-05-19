import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Package, ShoppingBag, Users, TrendingUp, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import { adminFetchDashboardStats } from '../../services/adminApi';

const ORDER_STATUS_VI: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  PROCESSING: 'Đang xử lý',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPING: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalOrders: 0, totalUsers: 0, totalProducts: 0, totalRevenue: 0, recentOrders: [] as any[] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetchDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Doanh thu (5 đơn gần nhất)', value: stats.totalRevenue.toLocaleString('vi-VN') + 'đ', icon: <DollarSign size={22}/>, color: 'bg-blue-500', trend: '' },
    { label: 'Tổng đơn hàng', value: stats.totalOrders.toString(), icon: <ShoppingBag size={22}/>, color: 'bg-green-500', trend: '' },
    { label: 'Tổng sản phẩm', value: stats.totalProducts.toString(), icon: <Package size={22}/>, color: 'bg-purple-500', trend: '' },
    { label: 'Tổng người dùng', value: stats.totalUsers.toString(), icon: <Users size={22}/>, color: 'bg-orange-500', trend: '' },
  ];

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.color} p-3 rounded-2xl text-white shadow-lg`}>
                {stat.icon}
              </div>
              {loading && <div className="w-6 h-6 border-2 border-gray-200 border-t-red-500 rounded-full animate-spin" />}
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-2xl font-black text-gray-800 mt-1 truncate">{loading ? '...' : stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Bảng đơn hàng gần đây */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="font-black text-gray-800 uppercase text-sm italic">Đơn hàng gần đây</h3>
          <button onClick={() => navigate('/admin/orders')} className="text-red-600 text-xs font-bold hover:underline">Xem tất cả</button>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
            <tr>
              <th className="px-6 py-4">Mã đơn</th>
              <th className="px-6 py-4">Khách hàng</th>
              <th className="px-6 py-4">Tổng tiền</th>
              <th className="px-6 py-4">Thanh toán</th>
              <th className="px-6 py-4">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-sm">Đang tải dữ liệu...</td></tr>
            ) : stats.recentOrders.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-sm">Chưa có đơn hàng nào.</td></tr>
            ) : stats.recentOrders.map((order: any) => (
              <tr
                key={order.id}
                className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/admin/orders/${order.id}`)}
              >
                <td className="px-6 py-4 text-sm font-bold text-red-600">{order.orderNumber}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-700">{order.shippingName ?? 'N/A'}</td>
                <td className="px-6 py-4 text-sm font-black">{Number(order.finalAmount ?? 0).toLocaleString('vi-VN')}đ</td>
                <td className="px-6 py-4 text-sm text-gray-500">{order.paymentMethod ?? 'COD'}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                    {ORDER_STATUS_VI[order.status] ?? order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};