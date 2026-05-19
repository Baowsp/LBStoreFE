import { Phone, Mail, MapPin, Facebook, Youtube, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12 pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Cột 1: Tổng đài hỗ trợ */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4 uppercase">Tổng đài hỗ trợ</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-gray-600">Gọi mua hàng:</span>
                <span className="font-bold text-gray-800">1800.2097</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Khiếu nại, khiếu từ:</span>
                <span className="font-bold text-gray-800">1800.2063</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Bảo hành, sửa chữa:</span>
                <span className="font-bold text-gray-800">1800.2064</span>
              </li>
            </ul>
          </div>

          {/* Cột 2: Chính sách */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4 uppercase">Chính sách</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="hover:text-cps cursor-pointer">Chính sách bảo hành</li>
              <li className="hover:text-cps cursor-pointer">Chính sách đổi trả</li>
              <li className="hover:text-cps cursor-pointer">Giao hàng & Thanh toán</li>
              <li className="hover:text-cps cursor-pointer">Khui hộp & Kích hoạt</li>
            </ul>
          </div>

          {/* Cột 3: Liên kết & Thanh toán */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4 uppercase">Thanh toán</h3>
            <div className="grid grid-cols-4 gap-2">
              {/* Giả lập các logo thanh toán */}
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="border p-2 rounded flex items-center justify-center grayscale hover:grayscale-0 transition-all">
                   <ShieldCheck size={20} className="text-gray-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Cột 4: Kết nối */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4 uppercase">Kết nối với CellphoneS</h3>
            <div className="flex gap-4 mb-6">
              <Facebook className="text-blue-600 cursor-pointer" />
              <Youtube className="text-red-600 cursor-pointer" />
              <Mail className="text-gray-600 cursor-pointer" />
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Công ty TNHH Thương mại và dịch vụ kỹ thuật Diệu Phúc - GPĐKKD: 0311053045 do sở KH & ĐT TP.HCM cấp ngày 16/06/2011.
              </p>
            </div>
          </div>
        </div>

        {/* Bản quyền */}
        <div className="mt-10 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
          <p>© 2026 CellphoneS Project - Clone for Education</p>
        </div>
      </div>
    </footer>
  );
};