import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, CreditCard, Package, Calendar, Printer, CheckCircle, XCircle, Truck, Clock, PackageCheck, Loader } from 'lucide-react';
import { adminFetchOrder, adminUpdateOrderStatus } from '../../services/adminApi';

const STATUS_VI: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  PROCESSING: 'Đang xử lý',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

const STATUS_BUTTONS = [
  { key: 'PENDING', label: 'Chờ xử lý', icon: <Clock size={18}/>, cls: 'bg-yellow-100 text-yellow-700 ring-yellow-500' },
  { key: 'SHIPPING', label: 'Đang giao hàng', icon: <Truck size={18}/>, cls: 'bg-blue-100 text-blue-700 ring-blue-500' },
  { key: 'DELIVERED', label: 'Hoàn thành', icon: <CheckCircle size={18}/>, cls: 'bg-green-100 text-green-700 ring-green-500' },
  { key: 'CANCELLED', label: 'Đã hủy', icon: <XCircle size={18}/>, cls: 'bg-red-100 text-red-700 ring-red-500' },
];

export const AdminOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    adminFetchOrder(id)
      .then(data => {
        console.log("📦 Admin Order Detail Data:", data);
        setOrder(data);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    const label = STATUS_VI[newStatus] ?? newStatus;
    if (!window.confirm(`Chuyển trạng thái sang "${label}"?`)) return;
    setUpdating(true);
    try {
      const updated = await adminUpdateOrderStatus(id!, newStatus);
      setOrder((prev: any) => ({...prev, status: updated?.status ?? newStatus}));
    } catch (e: any) {
      alert('Cập nhật thất bại: ' + e.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin" />
    </div>
  );

  if (error || !order) return (
    <div className="text-center py-16">
      <p className="text-red-500 font-bold">{error || 'Không tìm thấy đơn hàng.'}</p>
      <button onClick={() => navigate('/admin/orders')} className="mt-4 text-blue-600 hover:underline text-sm font-bold">← Quay lại</button>
    </div>
  );

  const details: any[] = order.onlineOrderDetails ?? [];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/orders')} className="p-2 hover:bg-white rounded-full transition-colors text-gray-500">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-800 uppercase italic">Chi tiết đơn hàng</h1>
            <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
              <Calendar size={14} /> {order.orderNumber}
              {order.createdAt && (
                <span className="flex items-center gap-2 ml-4 border-l pl-4 border-gray-200">
                  <Clock size={14} /> {new Date(order.createdAt).toLocaleString('vi-VN')}
                </span>
              )}
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50">
          <Printer size={16} /> In hóa đơn
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái: Sản phẩm */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 flex items-center gap-2"><Package size={18}/> Sản phẩm ({details.length})</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {details.length === 0 ? (
                <div className="p-6 text-gray-400 text-sm text-center">Không có sản phẩm</div>
              ) : details.map((item: any, i: number) => (
                <div key={i} className="p-4 flex gap-4 items-center">
                  <div className="w-16 h-16 border rounded-lg p-1 flex-shrink-0 bg-gray-50 flex items-center justify-center">
                    {item.variant?.imageURL ? (
                      <img src={item.variant.imageURL.startsWith('http') ? item.variant.imageURL : `http://localhost:8080${item.variant.imageURL}`} className="w-full h-full object-contain" alt="" />
                    ) : <span className="text-2xl">📦</span>}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-800">{item.variant?.product?.name ?? 'Sản phẩm'}</h4>
                    <p className="text-xs text-gray-500">{item.variant?.color} {item.variant?.storage}</p>
                    <p className="text-xs text-gray-500">Đơn giá: {Number(item.unitPrice ?? 0).toLocaleString('vi-VN')}đ</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">x{item.quantity}</p>
                    <p className="text-sm font-bold text-red-600">{Number(item.subTotal ?? 0).toLocaleString('vi-VN')}đ</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tạm tính:</span>
                <span className="font-bold">{Number(order.totalAmount ?? 0).toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Phí vận chuyển:</span>
                <span className="font-bold">{Number(order.shippingFee ?? 0) === 0 ? 'Miễn phí' : Number(order.shippingFee).toLocaleString('vi-VN') + 'đ'}</span>
              </div>
              <div className="flex justify-between text-lg pt-2 border-t border-gray-200">
                <span className="font-black text-gray-800 uppercase">Tổng cộng:</span>
                <span className="font-black text-red-600">{Number(order.finalAmount ?? 0).toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải */}
        <div className="space-y-6">
          {/* Trạng thái */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center justify-between">
              Trạng thái đơn hàng
              {updating && <Loader size={16} className="animate-spin text-gray-400" />}
            </h3>
            <div className="space-y-2">
              {STATUS_BUTTONS.map(btn => (
                <button key={btn.key}
                  onClick={() => handleStatusChange(btn.key)}
                  disabled={updating}
                  className={`w-full p-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-all ${
                    order.status === btn.key ? `${btn.cls} ring-2` : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  } disabled:opacity-60`}
                >
                  {btn.icon} {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Thông tin khách hàng */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Thông tin giao hàng</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-gray-100 p-2 rounded-full"><MapPin size={16} className="text-gray-600"/></div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Địa chỉ nhận hàng</p>
                  <p className="text-sm font-medium text-gray-800 mt-1">{order.shippingAddressText ?? 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-2 rounded-full"><Phone size={16} className="text-gray-600"/></div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Người nhận</p>
                  <p className="text-sm font-medium text-gray-800 mt-1">{order.shippingName} – {order.shippingPhone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-2 rounded-full"><CreditCard size={16} className="text-gray-600"/></div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Thanh toán</p>
                  <p className="text-sm font-medium text-gray-800 mt-1">{order.paymentMethod}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};