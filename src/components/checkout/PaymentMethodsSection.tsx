import { CreditCard, QrCode, Banknote, Wallet, Zap } from 'lucide-react';
import { PaymentOption, type PaymentMethod } from './PaymentOption';

interface PaymentMethodsSectionProps {
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
}

export const PaymentMethodsSection = ({ paymentMethod, setPaymentMethod }: PaymentMethodsSectionProps) => {
  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 md:p-8">
      <h2 className="text-lg font-black text-gray-800 mb-5 flex items-center gap-2">
        <CreditCard className="text-red-600" size={22} /> Phương thức thanh toán
      </h2>
      <div className="space-y-3">
        <PaymentOption value="cod" currentMethod={paymentMethod} onChange={setPaymentMethod} icon={<Banknote size={22} className="text-green-600" />} title="Tiền mặt khi nhận hàng (COD)" subtitle="Thanh toán tiền mặt khi shipper giao hàng tới" badgeText="Phổ biến" />
        <PaymentOption value="vietqr" currentMethod={paymentMethod} onChange={setPaymentMethod} icon={<QrCode size={22} className="text-blue-600" />} title="VietQR — Quét mã thanh toán nhanh" subtitle="Hỗ trợ tất cả ngân hàng nội địa, VNPAY, MoMo..." badgeText="Khuyến nghị" badgeColor="bg-blue-100 text-blue-700" />
        <PaymentOption value="momo" currentMethod={paymentMethod} onChange={setPaymentMethod} icon={<Wallet size={22} className="text-pink-600" />} title="Ví MoMo" subtitle="Chuyển khoản qua ví điện tử MoMo" />
        <PaymentOption value="zalopay" currentMethod={paymentMethod} onChange={setPaymentMethod} icon={<Zap size={22} className="text-blue-500" />} title="ZaloPay" subtitle="Thanh toán nhanh qua ứng dụng ZaloPay" />
      </div>

      {paymentMethod === 'vietqr' && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-2xl animate-in fade-in slide-in-from-top-2">
          <p className="font-black text-blue-900 text-sm mb-1 flex items-center gap-2"><QrCode size={16} className="text-blue-600" /> Thanh toán qua VietQR</p>
          <p className="text-xs text-blue-800 leading-relaxed">Sau khi bấm "Đặt hàng ngay", bạn sẽ được chuyển sang trang thanh toán an toàn. Quét mã QR bằng bất kỳ ứng dụng ngân hàng nào hỗ trợ VietQR.</p>
        </div>
      )}
    </div>
  );
};
