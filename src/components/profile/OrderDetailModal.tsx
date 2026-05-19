import { Package, MapPin, CreditCard, X } from 'lucide-react';

interface OrderDetailModalProps {
  order: any;
  onClose: () => void;
}

export const OrderDetailModal = ({ order, onClose }: OrderDetailModalProps) => {
  if (!order) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center">
              <Package size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 uppercase italic">Chi tiết đơn hàng</h3>
              <p className="text-xs text-gray-500 font-bold">Mã số: #{order?.orderNumber || 'N/A'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Package size={12} /> Sản phẩm đã mua
              </h4>
              <div className="space-y-3">
                {(order.onlineOrderDetails || []).map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-red-100 transition-all">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-gray-800 truncate uppercase">
                        {item?.variant?.product?.name || item?.productVariantColor?.productVariant?.product?.name || "Sản phẩm"}
                      </p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">
                        {(item?.variant?.storage || item?.productVariantColor?.productVariant?.storage || '')} -
                        {(item?.variant?.color || item?.productVariantColor?.color || '')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-gray-900">{(item?.unitPrice || item?.price || 0).toLocaleString()}đ</p>
                      <p className="text-[10px] text-gray-400 font-bold mt-0.5">x{item?.quantity || 0}</p>
                    </div>
                  </div>
                ))}
                {(order.onlineOrderDetails || []).length === 0 && (
                  <p className="text-xs text-gray-400 italic">Không tìm thấy thông tin sản phẩm.</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                  <MapPin size={12} /> Địa chỉ nhận hàng
                </h4>
                <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <p className="text-xs font-black text-gray-800 uppercase italic">
                    {order?.receiverName ||
                      order?.shippingAddress?.receiverName ||
                      order?.shipping_address?.receiver_name ||
                      'Người nhận'}
                  </p>
                  <p className="text-xs text-gray-500 font-bold mt-1.5">
                    {order?.phoneNumber ||
                      order?.shippingAddress?.receiverPhone ||
                      order?.shipping_address?.receiver_phone ||
                      'N/A'}
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed mt-1.5 line-clamp-3">
                    {order?.shippingAddressText ||
                      order?.shippingAddress?.streetAddress ||
                      order?.shipping_address?.street_address ||
                      order?.street_address ||
                      (typeof order?.shipping_address === 'string' ? order?.shipping_address : '') ||
                      (typeof order?.shippingAddress === 'string' ? order?.shippingAddress : '') ||
                      'Chưa có thông tin địa chỉ'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                  <CreditCard size={12} /> Tóm tắt thanh toán
                </h4>
                <div className="space-y-3 px-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-gray-400 uppercase italic">Tạm tính</span>
                    <span className="text-gray-800 font-black">{(order?.totalAmount || 0).toLocaleString()}đ</span>
                  </div>
                  {order?.discountAmount > 0 && (
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-400 uppercase italic">Giảm giá</span>
                      <span className="text-red-500 font-black">-{order.discountAmount.toLocaleString()}đ</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-gray-400 uppercase italic">Vận chuyển</span>
                    <span className="text-green-600 font-black uppercase">
                      {order?.shippingFee > 0
                        ? `${order.shippingFee.toLocaleString()}đ`
                        : 'Miễn phí'}
                    </span>
                  </div>
                  <div className="pt-4 mt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-black text-gray-900 uppercase italic tracking-widest">Tổng cộng</span>
                    <span className="text-2xl font-black text-red-600">{(order?.finalAmount || order?.totalAmount || 0).toLocaleString()}đ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400 font-bold italic uppercase tracking-widest">
            Cảm ơn bạn đã tin tưởng chọn mua sản phẩm tại LBStore
          </p>
        </div>
      </div>
    </div>
  );
};
