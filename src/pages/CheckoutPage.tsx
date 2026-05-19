import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { fetchCustomerByUserId, fetchAddressesByCustomerId, createOnlineOrder, createPayOSLink, applyVoucher } from '../services/api';

import type { PaymentMethod } from '../components/checkout/PaymentOption';
import { ShippingAddressSection } from '../components/checkout/ShippingAddressSection';
import { PaymentMethodsSection } from '../components/checkout/PaymentMethodsSection';
import { OrderSummarySection } from '../components/checkout/OrderSummarySection';
import { CheckoutResultSection } from '../components/checkout/CheckoutResultSection';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { cart, totalPrice, removeFromCart } = useCartStore();
  const selectedItems = cart.filter(item => item.isSelected !== false);

  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [orderFailed, setOrderFailed] = useState<boolean>(false);
  const [searchParams] = useSearchParams();

  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const subtotal = totalPrice();
  const shippingFee = subtotal > 5000000 ? 0 : 30000;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!isAuthenticated) { navigate('/login'); return; }

    const code = searchParams.get('code');
    const orderCode = searchParams.get('orderCode');
    const status = searchParams.get('status');
    const cancel = searchParams.get('cancel');

    if (code === '00' && status === 'PAID') {
      setOrderSuccess(orderCode || 'PAID-SUCCESS');
      return;
    } else if (cancel === 'true' || (code && code !== '00')) {
      setOrderFailed(true);
      return;
    }

    if (selectedItems.length === 0) { navigate('/cart'); return; }
    if (user?.id) {
      fetchCustomerByUserId(user.id).then((customer) => {
        if (customer) {
          setCustomerInfo(customer);
          fetchAddressesByCustomerId(customer.id).then((addrs) => {
            setAddresses(addrs);
            if (addrs.length > 0) {
              const def = addrs.find((a: any) => a.isDefault);
              setSelectedAddressId(def ? def.id : addrs[0].id);
            }
          });
        }
      });
    }
  }, []);

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
        setAppliedVoucher(null);
        setDiscountAmount(0);
        return;
    }
    try {
        const voucher = await applyVoucher(voucherCode, subtotal);
        setAppliedVoucher(voucher);
        
        let calculatedDiscount = 0;
        if (voucher.fixedDiscountAmount && Number(voucher.fixedDiscountAmount) > 0) {
            calculatedDiscount = Number(voucher.fixedDiscountAmount);
        } else {
            calculatedDiscount = (subtotal * (voucher.discountPercentage || 0)) / 100;
            if (voucher.maxDiscountAmount && calculatedDiscount > voucher.maxDiscountAmount) {
                calculatedDiscount = voucher.maxDiscountAmount;
            }
        }
        setDiscountAmount(calculatedDiscount);
        alert(`Áp dụng voucher thành công! Giảm ${calculatedDiscount.toLocaleString()}đ`);
    } catch (error: any) {
        alert(error.message || 'Mã voucher không hợp lệ');
        setAppliedVoucher(null);
        setDiscountAmount(0);
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddressId) return alert('Vui lòng chọn địa chỉ giao hàng!');
    if (!customerInfo?.id) return alert('Chưa tải được thông tin khách hàng.');

    if (paymentMethod === 'vietqr') {
      setIsSubmitting(true);
      try {
        const orderCode = Date.now() % 2147483647;
        const items = selectedItems.map(item => ({
          name: item.name.slice(0, 50),
          quantity: item.quantity,
          price: Math.round(item.price)
        }));

        if (shippingFee > 0) {
          items.push({
            name: "Phí vận chuyển",
            quantity: 1,
            price: shippingFee
          });
        }

        const payosPayload = {
          orderCode,
          amount: Math.round(total),
          description: `LBStore #${orderCode}`.slice(0, 25),
          items
        };
        const linkData = await createPayOSLink(payosPayload);
        if (linkData.checkoutUrl) {
          await createOnlineOrder({
            customer: { id: customerInfo.id },
            shippingAddress: { id: selectedAddressId },
            totalAmount: subtotal, shippingFee,
            notes: `[VIETQR-${orderCode}] ${notes}`.trim(),
            status: 'PENDING',
            paymentMethod: 'vietqr',
            voucherCode: appliedVoucher?.code || null,
            onlineOrderDetails: selectedItems.map(item => ({
              variant: { id: item.variantId || 1 },
              quantity: item.quantity, unitPrice: item.price,
              subTotal: item.price * item.quantity
            }))
          });
          selectedItems.forEach(item => removeFromCart(item.cartItemId));
          window.location.href = linkData.checkoutUrl;
        }
      } catch (e: any) {
        alert('Lỗi tạo link thanh toán VietQR: ' + e.message);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setIsSubmitting(true);
    const paymentLabel: Record<string, string> = { cod: '[COD]', momo: '[MOMO]', zalopay: '[ZALOPAY]' };
    const invalidItem = selectedItems.find(item => !item.variantId);
    if (invalidItem) {
        alert(`Sản phẩm "${invalidItem.name}" thiếu thông tin màu sắc/dung lượng. Vui lòng xóa đi và thêm lại vào giỏ hàng.`);
        setIsSubmitting(false);
        return;
    }

    const detailPayload = selectedItems.map(item => ({
      variant: { id: item.variantId },
      quantity: item.quantity, unitPrice: item.price,
      subTotal: item.price * item.quantity
    }));

    try {
      const created = await createOnlineOrder({
        customer: { id: customerInfo.id },
        shippingAddress: { id: selectedAddressId },
        totalAmount: subtotal, shippingFee,
        notes: `${paymentLabel[paymentMethod]} ${notes}`.trim(),
        status: 'PENDING',
        paymentMethod: paymentMethod,
        voucherCode: appliedVoucher?.code || null,
        onlineOrderDetails: detailPayload
      });
      selectedItems.forEach(item => removeFromCart(item.cartItemId));
      setOrderSuccess(created.orderNumber || 'ORD-SUCCESS');
    } catch (e: any) {
      alert('Lỗi khi tạo đơn hàng: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess || orderFailed) {
    return (
      <CheckoutResultSection 
        orderSuccess={orderSuccess} 
        orderFailed={orderFailed} 
        setOrderFailed={setOrderFailed} 
      />
    );
  }

  return (
    <div className="bg-[#f4f4f4] min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-medium">
          <Link to="/" className="hover:text-red-600 transition-colors">Trang chủ</Link>
          <ChevronRight size={14} />
          <Link to="/cart" className="hover:text-red-600 transition-colors">Giỏ hàng</Link>
          <ChevronRight size={14} />
          <span className="text-gray-800 font-bold">Thanh toán</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <ShippingAddressSection 
              addresses={addresses} 
              selectedAddressId={selectedAddressId} 
              setSelectedAddressId={setSelectedAddressId} 
            />

            <PaymentMethodsSection 
              paymentMethod={paymentMethod} 
              setPaymentMethod={setPaymentMethod} 
            />

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-sm font-black text-gray-800 uppercase mb-4">Ghi chú cho đơn hàng (Tuỳ chọn)</h2>
              <textarea rows={3} className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 focus:border-red-500 outline-none text-sm font-medium transition-all" placeholder="Ví dụ: Giao hàng sau 18:00, gọi trước 15 phút..." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>

          <div className="lg:col-span-4">
            <OrderSummarySection 
              selectedItems={selectedItems} 
              subtotal={subtotal} 
              shippingFee={shippingFee}
              discountAmount={discountAmount}
              voucherCode={voucherCode}
              setVoucherCode={setVoucherCode}
              handleApplyVoucher={handleApplyVoucher}
              total={total} 
              paymentMethod={paymentMethod} 
              isSubmitting={isSubmitting} 
              selectedAddressId={selectedAddressId} 
              handleCheckout={handleCheckout} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};
