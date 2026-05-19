import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CheckoutResultSectionProps {
  orderSuccess: string | null;
  orderFailed: boolean;
  setOrderFailed: (failed: boolean) => void;
}

export const CheckoutResultSection = ({ orderSuccess, orderFailed, setOrderFailed }: CheckoutResultSectionProps) => {
  const navigate = useNavigate();
  const isSuccess = !!orderSuccess;

  return (
    <div className="bg-[#f4f4f4] min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] shadow-xl p-10 max-w-md w-full text-center border border-gray-100 animate-in fade-in zoom-in duration-300">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${isSuccess ? 'bg-green-100' : 'bg-red-100'}`}>
          {isSuccess ? (
            <CheckCircle2 size={52} className="text-green-600" />
          ) : (
            <XCircle size={52} className="text-red-600" />
          )}
        </div>
        
        <h1 className="text-2xl font-black text-gray-900 mb-2">
          {isSuccess ? 'Đặt hàng thành công!' : 'Thanh toán thất bại'}
        </h1>
        
        <p className="text-gray-500 font-medium mb-4">
          {isSuccess 
            ? 'Cảm ơn bạn đã tin tưởng mua sắm tại LBStore.'
            : 'Đã có lỗi xảy ra hoặc bạn đã huỷ thanh toán.'}
        </p>

        {isSuccess && (
          <div className="bg-gray-50 rounded-2xl p-4 mb-8 border border-dashed border-gray-200">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Mã đơn hàng</p>
            <p className="text-lg font-black text-red-600 tracking-wider">{orderSuccess}</p>
          </div>
        )}

        {!isSuccess && (
          <div className="bg-orange-50 rounded-2xl p-4 mb-8 border border-dashed border-orange-200">
            <p className="text-xs text-orange-600 font-black flex items-center justify-center gap-1.5">
              <AlertCircle size={14} /> Vui lòng thử lại hoặc chọn phương thức khác
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/')} 
            className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Trang chủ
          </button>
          {isSuccess ? (
            <button 
              onClick={() => navigate('/profile')} 
              className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
            >
              Xem đơn hàng
            </button>
          ) : (
            <button 
              onClick={() => {
                setOrderFailed(false);
                navigate('/cart');
              }} 
              className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
            >
              Về giỏ hàng
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
