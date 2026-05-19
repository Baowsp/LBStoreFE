import { ShieldCheck, Truck, Zap } from 'lucide-react';
import type { PaymentMethod } from './PaymentOption';

interface OrderSummarySectionProps {
  selectedItems: any[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  voucherCode: string;
  setVoucherCode: (code: string) => void;
  handleApplyVoucher: () => void;
  total: number;
  paymentMethod: PaymentMethod;
  isSubmitting: boolean;
  selectedAddressId: number | null;
  handleCheckout: () => void;
}

export const OrderSummarySection = ({
  selectedItems, subtotal, shippingFee, discountAmount, voucherCode, setVoucherCode, handleApplyVoucher, total,
  paymentMethod, isSubmitting, selectedAddressId, handleCheckout
}: OrderSummarySectionProps) => {
  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 md:p-8 sticky top-24">
      <h2 className="text-lg font-black text-gray-800 mb-5 uppercase italic">Tóm tắt đơn hàng</h2>
      <div className="divide-y divide-gray-100 mb-4 max-h-60 overflow-y-auto space-y-3 pr-1">
        {selectedItems.map((item: any) => (
          <div key={item.cartItemId} className="pt-3 first:pt-0 flex gap-3">
            <div className="relative w-14 h-14 flex-shrink-0 bg-gray-50 rounded-xl border border-gray-100 p-1">
              <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
              <span className="absolute -top-2 -right-2 bg-gray-800 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{item.quantity}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-800 line-clamp-2">{item.name}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {item.selectedStorage && <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded font-bold text-gray-500">{item.selectedStorage}</span>}
                {item.selectedColor && <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded font-bold text-gray-500">{item.selectedColor}</span>}
              </div>
              <p className="text-sm font-black text-red-600 mt-1">{(item.price * item.quantity).toLocaleString()}đ</p>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-dashed border-gray-200 mb-4">
        <label className="block text-xs font-bold text-gray-800 uppercase mb-2">Mã Khuyến Mãi / Voucher</label>
        <div className="flex gap-2">
            <input 
                type="text" 
                placeholder="Nhập mã voucher..." 
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm uppercase outline-none focus:border-red-500 transition-colors"
                value={voucherCode}
                onChange={e => setVoucherCode(e.target.value.toUpperCase())}
            />
            <button 
                onClick={handleApplyVoucher}
                className="bg-gray-800 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-700 transition"
            >
                Áp dụng
            </button>
        </div>
      </div>

      <div className="pt-4 border-t border-dashed border-gray-200 space-y-2 mb-5">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 font-medium">Tạm tính:</span>
          <span className="font-bold text-gray-800">{subtotal.toLocaleString()}đ</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 font-medium">Phí vận chuyển:</span>
          <span className={`font-bold ${shippingFee === 0 ? 'text-green-600' : 'text-gray-800'}`}>{shippingFee === 0 ? '🎉 Miễn phí' : shippingFee.toLocaleString() + 'đ'}</span>
        </div>
        {discountAmount > 0 && (
            <div className="flex justify-between text-sm">
                <span className="text-red-500 font-medium">Giảm giá voucher:</span>
                <span className="font-bold text-red-600">-{discountAmount.toLocaleString()}đ</span>
            </div>
        )}
        <div className="flex justify-between pt-3 border-t border-gray-200">
          <span className="font-black text-gray-800 uppercase">Tổng cộng</span>
          <span className="text-2xl font-black text-red-600">{total.toLocaleString()}đ</span>
        </div>
      </div>

      <button onClick={handleCheckout} disabled={isSubmitting || !selectedAddressId}
        className={`w-full py-4 rounded-2xl font-black uppercase text-sm tracking-wider transition-all flex items-center justify-center gap-2 ${isSubmitting || !selectedAddressId
          ? 'bg-gray-300 text-gray-400 cursor-not-allowed'
          : paymentMethod === 'vietqr'
            ? 'bg-yellow-500 text-white hover:bg-yellow-600 hover:-translate-y-0.5 shadow-xl shadow-yellow-100'
            : 'bg-red-600 text-white hover:bg-red-700 hover:-translate-y-0.5 shadow-xl shadow-red-100'
          }`}>
        {isSubmitting ? (
          <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Đang xử lý...</>
        ) : paymentMethod === 'vietqr' ? (
          <><Zap size={18} /> Thanh toán qua PayOS</>
        ) : (
          <><Truck size={18} /> Đặt hàng ngay</>
        )}
      </button>

      <p className="text-[11px] text-center text-gray-400 mt-4 flex items-center justify-center gap-1.5">
        <ShieldCheck size={14} className="text-green-500" /> Giao dịch được bảo mật SSL 256-bit
      </p>
    </div>
  );
};
